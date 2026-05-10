# Production Deployment — uzmanrot-yourcar

Bu dokuman uygulamanın **Ubuntu 22.04 / 24.04** sunucuya `178.105.52.161` public IP üzerinden HTTP olarak deploy edilmesi içindir.

> Stack: Next.js 16 (standalone) + SQLite (better-sqlite3) + Drizzle ORM + nginx + PM2

---

## 0. Önkoşullar

- Sunucuya `root` veya `sudo`'lu bir kullanıcı ile SSH erişimi.
- Public IP `178.105.52.161` üzerinde **80** portu açık (firewall / hosting paneli).
- Bu reponun erişilebileceği bir Git remote'u (örn. GitHub).

> **HTTP only**: SSL/HTTPS için bir domain adı gereklidir. Sadece IP ile çalıştığımız sürece bu kurulum HTTP üzerinden yayın yapar. Domain bağlandığında [SSL bölümü](#opsiyonel-ssl-domain-gerektirir) takip edilebilir.

---

## 1. Sunucu hazırlığı (tek seferlik)

SSH ile sunucuya bağlan ve aşağıdakileri çalıştır:

```bash
# Sistem güncelleme
sudo apt update && sudo apt upgrade -y

# Build için gerekli araçlar (better-sqlite3 native build için)
sudo apt install -y build-essential python3 git curl ufw nginx

# Node.js 20 LTS (nodesource)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# PM2 (process manager)
sudo npm install -g pm2

# Firewall
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw --force enable

# Uygulama klasörü ve log klasörü
sudo mkdir -p /var/www/uzmanrot
sudo mkdir -p /var/log/uzmanrot
sudo chown -R "$USER":"$USER" /var/www/uzmanrot /var/log/uzmanrot
```

---

## 2. Kodu çek

```bash
cd /var/www
# HTTPS clone örneği — kendi remote URL'inizi kullanın
git clone <REPO_URL> uzmanrot
cd uzmanrot
```

> Eğer repo özel ise SSH key veya HTTPS token gerekir.

---

## 3. Production env dosyası

```bash
cp .env.production.example .env.production
nano .env.production
```

İçindeki değerleri doldur:

- `JWT_SECRET` → güçlü rastgele bir değer:
  ```bash
  openssl rand -base64 48
  ```
- `NEXT_PUBLIC_APP_URL=http://178.105.52.161`
- `NEXT_PUBLIC_SHOP_NAME` → mağaza ismi
- `PORT=3000` ve `HOSTNAME=127.0.0.1` (nginx 127.0.0.1:3000'e proxy'liyor)

> Not: Next.js `NEXT_PUBLIC_*` değişkenlerini build sırasında bundle'a yazar. **Bu değerler değişirse `npm run build` tekrar çalıştırılmalı.**

---

## 4. Bağımlılıklar, DB ve build

```bash
cd /var/www/uzmanrot

# Bağımlılıklar
npm ci

# SQLite şemasını oluştur
npm run db:push

# (İsteğe bağlı) demo veri
# npm run db:seed

# Production build (output: standalone)
npm run build

# standalone içine static + public kopyala (Next.js'in beklediği yapı)
cp -r .next/static .next/standalone/.next/static
cp -r public .next/standalone/public

# SQLite dosyasını standalone working dir'e link'le
ln -sf /var/www/uzmanrot/uzmanrot.db .next/standalone/uzmanrot.db
ln -sf /var/www/uzmanrot/.env.production .next/standalone/.env.production
ln -sf /var/www/uzmanrot/.env.production .next/standalone/.env.local
```

---

## 5. PM2 ile başlat

```bash
cd /var/www/uzmanrot
pm2 start deploy/ecosystem.config.js
pm2 save
pm2 startup systemd
# Çıktıdaki "sudo env PATH=... pm2 startup ..." komutunu kopyalayıp çalıştır
```

Doğrula:

```bash
pm2 status
pm2 logs uzmanrot --lines 50
curl -I http://127.0.0.1:3000   # 200 OK dönmeli
```

---

## 6. nginx reverse proxy

```bash
sudo cp /var/www/uzmanrot/deploy/nginx.conf /etc/nginx/sites-available/uzmanrot
sudo ln -sf /etc/nginx/sites-available/uzmanrot /etc/nginx/sites-enabled/uzmanrot

# Default'u kaldır (opsiyonel)
sudo rm -f /etc/nginx/sites-enabled/default

# Konfigürasyonu test et ve reload et
sudo nginx -t
sudo systemctl reload nginx
```

Tarayıcıda aç: **http://178.105.52.161**

---

## 7. Güncellemeler (her deploy)

Repo güncellendiğinde sunucuda:

```bash
cd /var/www/uzmanrot
bash deploy/deploy.sh
```

Bu script:
1. `git pull`
2. `npm ci`
3. `db:push`
4. `next build`
5. static/public/db sync
6. `pm2 reload uzmanrot`

---

## 8. SQLite yedekleme

```bash
# Manuel yedek
sqlite3 /var/www/uzmanrot/uzmanrot.db ".backup '/var/backups/uzmanrot-$(date +%F).db'"

# Cron (her gece 03:00)
sudo mkdir -p /var/backups
( crontab -l 2>/dev/null; echo "0 3 * * * sqlite3 /var/www/uzmanrot/uzmanrot.db \".backup '/var/backups/uzmanrot-\$(date +\\%F).db'\"" ) | crontab -
```

---

## 9. Sorun giderme

| Sorun | Kontrol |
|---|---|
| `502 Bad Gateway` | `pm2 status` çalışıyor mu? `pm2 logs uzmanrot` |
| `better-sqlite3` build hatası | `sudo apt install -y build-essential python3`, sonra `npm rebuild better-sqlite3` |
| Login olamıyorsun | `JWT_SECRET` set mi? Cookie HTTPS-only ise HTTP'de gelmez — `src/lib/auth.ts` içindeki cookie ayarına bak |
| 80 portu açık değil | `sudo ufw status`, hosting firewall'u, `sudo ss -tlnp \| grep :80` |
| Statik dosyalar 404 | standalone içine `static` ve `public` kopyalandı mı? `deploy.sh` bunu yapar |
| DB değişikliği görünmüyor | `npm run db:push` çalıştırıldı mı? PM2 reload edildi mi? |

---

## Opsiyonel: SSL (domain gerektirir)

IP yerine bir domain bağlandığında (örn. `app.uzmanrot.com` → `178.105.52.161`):

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d app.uzmanrot.com
```

Sonra `.env.production` içinde `NEXT_PUBLIC_APP_URL=https://app.uzmanrot.com` yapıp tekrar `npm run build` ve `pm2 reload`.

---

## Dosya referansı

- [next.config.ts](next.config.ts) — `output: "standalone"` ve allowedDevOrigins içinde `178.105.52.161`
- [.env.production.example](.env.production.example) — production env şablonu
- [deploy/nginx.conf](deploy/nginx.conf) — reverse proxy
- [deploy/ecosystem.config.js](deploy/ecosystem.config.js) — PM2 process tanımı
- [deploy/deploy.sh](deploy/deploy.sh) — incremental deploy script'i
