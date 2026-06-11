"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { MotionConfig, motion } from "framer-motion";
import {
  Activity,
  ArrowLeftRight,
  ArrowUpRight,
  Clock,
  Crosshair,
  Disc3,
  Droplets,
  Gauge,
  Mail,
  MapPin,
  MessageCircle,
  Navigation,
  Phone,
  RefreshCw,
  SearchCheck,
  Star,
  Thermometer,
  Warehouse,
  Wrench,
  X,
} from "lucide-react";
import { ScrollRevealParagraphs, toWords } from "./_components/scroll-reveal-words";
import { LazyVideo } from "./_components/lazy-video";
import { FloatingContact } from "./_components/floating-contact";
import { NAV_LINKS, SITE } from "./_lib/site";

const HERO_VIDEO = "/videos/hero.mp4";
const HERO_POSTER = "/videos/hero-poster.jpg";

const STATS = [
  { value: "15+", label: "Yıl Tecrübe" },
  { value: "10.000+", label: "Araç Hizmeti" },
  { value: "4 Mevsim", label: "Lastik Oteli" },
];

const SYMPTOMS = [
  {
    icon: Disc3,
    title: "Düzensiz Lastik Aşınması",
    desc: "Lastiğin iç veya dış kenarı diğer taraftan daha hızlı aşınıyorsa rot ayarınız bozulmuş olabilir.",
  },
  {
    icon: Activity,
    title: "Direksiyonda Titreme",
    desc: "Belirli hızlarda direksiyonun titremesi çoğunlukla tekerlek balansının kaçtığını gösterir.",
  },
  {
    icon: ArrowLeftRight,
    title: "Araç Bir Tarafa Çekiyor",
    desc: "Düz yolda direksiyonu bıraktığınızda araç sağa ya da sola kayıyorsa rot ayarı şarttır.",
  },
];

const PROCESS = [
  {
    no: "01",
    title: "Randevu / Plaka",
    desc: "Plakanızı sorgulayın ya da WhatsApp'tan randevu alın.",
  },
  {
    no: "02",
    title: "Cihazla Ölçüm",
    desc: "Rot ve balans değerlerinizi hassas cihazla tek tek ölçeriz.",
  },
  {
    no: "03",
    title: "Hassas Ayar",
    desc: "Değerleri üretici standardına getirir, ardından tekrar ölçeriz.",
  },
  {
    no: "04",
    title: "Dijital Rapor",
    desc: "Öncesi/sonrası rapor plakanıza kaydedilir; istediğiniz an online görürsünüz.",
  },
];

const SERVICES = [
  {
    icon: Crosshair,
    title: "Rot Ayarı",
    desc: "Tekerlek açılarını üretici değerlerine göre hassas cihazlarla ayarlarız.",
  },
  {
    icon: Disc3,
    title: "Balans Ayarı",
    desc: "Jant ve lastik dengesizliğini gidererek titremesiz, konforlu bir sürüş sağlarız.",
  },
  {
    icon: Warehouse,
    title: "Lastik Oteli",
    desc: "Mevsimlik lastiklerinizi nem ve ısı kontrollü depomuzda güvenle saklarız.",
  },
  {
    icon: Wrench,
    title: "Lastik & Jant",
    desc: "Lastik değişimi, tamiri ve jant hizmetleri tek noktada, hızlıca tamamlanır.",
  },
];

const TIRE_HOTEL_FEATURES = [
  {
    icon: Thermometer,
    title: "Nem & Isı Kontrollü Depo",
    desc: "Lastikleriniz güneş, nem ve sıcaktan korunarak ideal koşullarda saklanır; şekil bozulmasına uğramaz.",
  },
  {
    icon: Droplets,
    title: "Yıkama & Kontrol",
    desc: "Depoya alınmadan önce her lastik yıkanır, diş derinliği ölçülür ve hasar kontrolü yapılır.",
  },
  {
    icon: SearchCheck,
    title: "Plakaya Kayıtlı Takip",
    desc: "Hangi lastiğin nerede olduğu plakanıza işlenir; lastiklerinizin durumunu online görüntülersiniz.",
  },
  {
    icon: RefreshCw,
    title: "Mevsimlik Değişim",
    desc: "Sezon geldiğinde tek aramayla lastikleriniz sökülür, takılır ve balans ayarı yapılır.",
  },
];

// PLACEHOLDER — gerçek Google yorumları ile değiştirin (isim, araç, puan).
const TESTIMONIALS = [
  {
    name: "Mehmet A.",
    car: "VW Passat",
    text: "Direksiyon titremesi tamamen geçti. Ölçüm raporunu telefonumdan görebilmek çok güven verdi.",
  },
  {
    name: "Ayşe K.",
    car: "Fiat Egea",
    text: "Lastiklerim bir tarafa yatık aşınıyordu; rot ayarından sonra düzeldi. İlgili ve dürüst bir ekip.",
  },
  {
    name: "Emre T.",
    car: "Ford Focus",
    text: "Kışlık lastiklerimi lastik otelinde sakladılar, sezonunda tek aramayla taktılar. Çok pratik.",
  },
];

const BRANDS = [
  "Continental",
  "Michelin",
  "Bridgestone",
  "Goodyear",
  "Pirelli",
  "Hankook",
  "Matador",
  "Dunlop",
  "Lassa",
  "Petlas",
];

const MISSION_P1 = toWords(
  "Biz tahmin etmeyiz, ölçeriz. Her aracın rot ve balans değerleri cihazla ölçülür; ayar öncesi ve sonrası tek tek kayda geçer.",
  ["ölçeriz.", "ölçülür;", "kayda", "geçer."],
);

const MISSION_P2 = toWords(
  "Şeffaf ölçüm, kayıtlı işlem, takip edilebilir sonuç. Aracınız bize geldiğinden daha güvende ayrılır.",
  ["güvende"],
);

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-100px" },
  transition: { duration: 0.6, delay, ease: "easeOut" as const },
});

function Brand({ className }: { className?: string }) {
  return (
    <span className={className}>
      <span className="text-white">UZMAN ROT </span>
      <span className="text-orange-500">BALANS</span>
    </span>
  );
}

function NavLinks() {
  return (
    <nav className="hidden items-center gap-8 md:flex">
      {NAV_LINKS.map((link) => (
        <a
          key={link.label}
          href={link.href}
          className="font-inter text-sm uppercase tracking-widest text-white/80 transition-colors hover:text-white"
        >
          {link.label}
        </a>
      ))}
    </nav>
  );
}

function Hamburger({
  onClick,
  expanded,
}: {
  onClick: (e: React.MouseEvent<HTMLButtonElement>) => void;
  expanded: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Menüyü aç"
      aria-expanded={expanded}
      aria-controls="mobile-menu"
      className="liquid-glass flex h-10 w-10 flex-col items-center justify-center gap-1.5 rounded-full md:hidden"
    >
      <span className="h-0.5 w-5 bg-white" />
      <span className="h-0.5 w-5 bg-white" />
      <span className="h-0.5 w-3 bg-white" />
    </button>
  );
}

export default function HomePage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const heroNavRef = useRef<HTMLElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const lastTriggerRef = useRef<HTMLElement | null>(null);

  // Show the condensed sticky navbar once the hero's own navbar scrolls away.
  useEffect(() => {
    const el = heroNavRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => setScrolled(!entry.isIntersecting),
      { threshold: 0 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Accessible mobile menu: scroll-lock, Escape to close, focus management.
  useEffect(() => {
    if (menuOpen) {
      closeBtnRef.current?.focus();
      document.body.style.overflow = "hidden";
      const onKey = (e: KeyboardEvent) => {
        if (e.key === "Escape") setMenuOpen(false);
      };
      document.addEventListener("keydown", onKey);
      return () => {
        document.removeEventListener("keydown", onKey);
        document.body.style.overflow = "";
      };
    }
    // Return focus to the trigger that opened the menu — but skip it if that
    // trigger is now hidden (e.g. the sticky hamburger after scrolling to top).
    const trigger = lastTriggerRef.current;
    if (trigger && getComputedStyle(trigger).visibility !== "hidden") {
      trigger.focus();
    }
  }, [menuOpen]);

  function openMenu(e: React.MouseEvent<HTMLButtonElement>) {
    lastTriggerRef.current = e.currentTarget;
    setMenuOpen(true);
  }

  return (
    <MotionConfig reducedMotion="user">
      <div className="landing-root">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[60] focus:rounded-lg focus:bg-orange-500 focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-white"
        >
          İçeriğe geç
        </a>

        {/* Condensed sticky navbar (appears after scrolling past the hero) */}
        <header
          className={`fixed inset-x-0 top-0 z-30 border-b border-white/10 bg-black/80 backdrop-blur-md transition-all duration-300 ${
            scrolled
              ? "visible translate-y-0 opacity-100"
              : "invisible pointer-events-none -translate-y-full opacity-0"
          }`}
        >
          <div className="flex items-center justify-between px-6 py-4 sm:px-10 lg:px-16">
            <Link href="/">
              <Brand className="font-display text-lg uppercase tracking-wider sm:text-xl" />
            </Link>
            <NavLinks />
            <div className="flex items-center gap-3">
              <Link
                href="/customer"
                className="group liquid-glass hidden items-center gap-2 rounded-lg px-5 py-2.5 text-xs uppercase tracking-widest text-white transition-colors hover:text-orange-300 md:flex"
              >
                PLAKA SORGULA
                <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </Link>
              <Hamburger onClick={openMenu} expanded={menuOpen} />
            </div>
          </div>
        </header>

        <FloatingContact />

        {/* Mobile menu overlay */}
        <div
          id="mobile-menu"
          role="dialog"
          aria-modal="true"
          aria-label="Menü"
          aria-hidden={!menuOpen}
          className={`fixed inset-0 z-50 flex flex-col bg-black/95 backdrop-blur-sm transition-all duration-500 md:hidden ${
            menuOpen ? "visible opacity-100" : "invisible opacity-0"
          }`}
        >
          <div className="flex items-center justify-between px-6 py-5 sm:px-10">
            <Brand className="font-display text-xl uppercase tracking-wider sm:text-2xl" />
            <button
              ref={closeBtnRef}
              type="button"
              onClick={() => setMenuOpen(false)}
              aria-label="Menüyü kapat"
              className="text-white transition-colors hover:text-orange-500"
            >
              <X className="h-7 w-7" />
            </button>
          </div>

          <nav className="flex flex-1 flex-col items-center justify-center gap-6">
            {NAV_LINKS.map((link, i) => (
              <a
                key={link.label}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="font-display text-3xl uppercase text-white sm:text-5xl"
                style={{
                  transition: "opacity 0.5s ease, transform 0.5s ease",
                  transitionDelay: `${i * 80 + 100}ms`,
                  opacity: menuOpen ? 1 : 0,
                  transform: menuOpen ? "translateY(0)" : "translateY(20px)",
                }}
              >
                {link.label}
              </a>
            ))}
            <Link
              href="/customer"
              onClick={() => setMenuOpen(false)}
              className="mt-4 flex items-center gap-2 rounded-lg bg-orange-500 px-7 py-4 text-xs uppercase tracking-widest text-white transition-colors hover:bg-orange-600"
              style={{
                transition: "opacity 0.5s ease, transform 0.5s ease",
                transitionDelay: `${NAV_LINKS.length * 80 + 100}ms`,
                opacity: menuOpen ? 1 : 0,
                transform: menuOpen ? "translateY(0)" : "translateY(20px)",
              }}
            >
              PLAKA SORGULA
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </nav>
        </div>

        <main
          id="main-content"
          className="w-full overflow-x-hidden bg-background font-inter text-foreground"
        >
          {/* ===================== HERO ===================== */}
          <section className="relative flex min-h-dvh w-full flex-col">
            <LazyVideo
              src={HERO_VIDEO}
              poster={HERO_POSTER}
              eager
              className="absolute inset-0"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-black/30" />
            <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-background to-transparent" />

            {/* Navbar (inside hero) */}
            <header
              ref={heroNavRef}
              className="relative z-30 flex items-center justify-between px-6 py-5 sm:px-10 lg:px-16 lg:py-7"
            >
              <Link href="/">
                <Brand className="font-display text-xl uppercase tracking-wider sm:text-2xl" />
              </Link>
              <NavLinks />
              <Link
                href="/customer"
                className="group liquid-glass hidden items-center gap-2 rounded-lg px-6 py-3 text-xs uppercase tracking-widest text-white transition-colors hover:text-orange-300 md:flex"
              >
                PLAKA SORGULA
                <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </Link>
              <Hamburger onClick={openMenu} expanded={menuOpen} />
            </header>

            {/* Hero content */}
            <div className="relative z-20 flex flex-1 flex-col justify-center px-6 pb-16 sm:px-10 lg:px-16">
              <div className="animate-fade-up mb-6 flex items-center gap-2 lg:mb-8">
                <Gauge className="h-4 w-4 text-orange-500" />
                <span className="font-inter text-xs uppercase tracking-[0.3em] text-white/70 sm:text-sm">
                  Konya&apos;nın Rot Balans Merkezi
                </span>
              </div>

              <h1 className="animate-fade-up-delay-1 font-display uppercase leading-[0.92] tracking-tight text-[clamp(2.8rem,8vw,7rem)]">
                <span className="block text-white">ROT.</span>
                <span className="block text-orange-500">BALANS.</span>
                <span className="block text-white">GÜVEN.</span>
              </h1>

              <p className="animate-fade-up-delay-2 mt-6 max-w-md font-inter text-sm leading-relaxed text-white/70 sm:text-base lg:mt-8">
                Aracınızın ölçüm değerleri ve lastik oteli kaydı,
                <br />
                plakanızla bir tık uzağınızda —{" "}
                <span className="font-bold text-white">
                  şeffaf, kayıtlı, takip edilebilir.
                </span>
              </p>

              <div className="animate-fade-up-delay-3 mt-8 flex flex-wrap items-center gap-4 sm:gap-6 lg:mt-10">
                <Link
                  href="/customer"
                  className="group flex items-center gap-2 rounded-lg bg-orange-500 px-5 py-3 text-[11px] uppercase tracking-widest text-white transition-colors hover:bg-orange-600 sm:px-7 sm:py-4 sm:text-xs"
                >
                  PLAKA SORGULA
                  <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </Link>
                <a
                  href={SITE.whatsapp}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="liquid-glass flex items-center gap-2 rounded-lg px-5 py-3 text-[11px] uppercase tracking-widest text-white transition-colors hover:text-[#25d366] sm:px-7 sm:py-4 sm:text-xs"
                >
                  <MessageCircle className="h-4 w-4" />
                  RANDEVU AL
                </a>
              </div>

              <div className="animate-fade-up-delay-4 mt-8 flex flex-wrap gap-6 sm:mt-10 sm:gap-12 lg:mt-14 lg:gap-16">
                {STATS.map((stat) => (
                  <div key={stat.label}>
                    <div className="font-inter text-2xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
                      {stat.value}
                    </div>
                    <div className="mt-1 text-[9px] uppercase tracking-widest text-white/60 sm:text-xs">
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="animate-fade-in-delay absolute bottom-5 left-0 right-0 z-20 flex flex-wrap items-center gap-x-4 gap-y-1 px-6 text-[10px] uppercase tracking-wider text-white/60 sm:px-10 sm:text-xs lg:px-16">
              <span className="flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 shrink-0" />
                {SITE.address.full}
              </span>
              <a
                href={`tel:${SITE.phoneE164}`}
                className="transition-colors hover:text-white"
              >
                {SITE.phoneDisplay}
              </a>
            </div>
          </section>

          {/* ===================== MARKA ŞERİDİ (marquee) ===================== */}
          <section className="border-t border-border/30 py-16">
            <div className="mx-auto max-w-6xl px-6 sm:px-10 lg:px-16">
              <motion.p
                {...fadeUp(0)}
                className="text-center font-inter text-xs uppercase tracking-[0.3em] text-muted-foreground"
              >
                Çalıştığımız markalar
              </motion.p>
            </div>

            {/* Screen-reader list (the visual marquee is decorative + duplicated) */}
            <ul className="sr-only">
              {BRANDS.map((brand) => (
                <li key={brand}>{brand}</li>
              ))}
            </ul>

            <div className="mt-10 overflow-hidden" aria-hidden="true">
              <div className="flex w-max animate-marquee items-center">
                {[...BRANDS, ...BRANDS].map((brand, i) => (
                  <span
                    key={i}
                    className="shrink-0 whitespace-nowrap px-6 font-inter text-3xl font-semibold tracking-tight text-white/45 sm:px-10 sm:text-5xl"
                  >
                    {brand}
                  </span>
                ))}
              </div>
            </div>
          </section>

          {/* ===================== BELİRTİLER ===================== */}
          <section className="px-6 py-24 sm:px-10 md:py-32 lg:px-16">
            <div className="mx-auto max-w-6xl">
              <motion.h2
                {...fadeUp(0)}
                className="mx-auto max-w-4xl text-center font-inter font-medium leading-[1.05] tracking-tight text-[clamp(2rem,6vw,5rem)]"
              >
                <span className="text-white">Aracınız uyarıyor, </span>
                <span className="font-serif text-[1.1em] font-normal italic text-orange-500">
                  dinliyor
                </span>
                <span className="text-white"> musunuz?</span>
              </motion.h2>

              <motion.p
                {...fadeUp(0.1)}
                className="mx-auto mt-6 max-w-2xl text-center font-inter text-base leading-relaxed text-muted-foreground sm:text-lg"
              >
                Düzensiz aşınma, titreme ve yana çekme — hepsi rot veya balans
                ayarının zamanı geldiğinin işaretidir.
              </motion.p>

              <div className="mt-16 grid gap-10 md:grid-cols-3 md:gap-8">
                {SYMPTOMS.map((symptom, i) => (
                  <motion.div
                    key={symptom.title}
                    {...fadeUp(0.1 + i * 0.1)}
                    className="text-center md:text-left"
                  >
                    <div className="mb-5 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-500/10 text-orange-500 ring-1 ring-orange-500/20">
                      <symptom.icon className="h-7 w-7" />
                    </div>
                    <h3 className="font-inter text-base font-semibold text-white">
                      {symptom.title}
                    </h3>
                    <p className="mt-2 font-inter text-sm leading-relaxed text-muted-foreground">
                      {symptom.desc}
                    </p>
                  </motion.div>
                ))}
              </div>

              <motion.div
                {...fadeUp(0.2)}
                className="mt-14 flex flex-col items-center gap-4 text-center"
              >
                <p className="font-inter text-sm text-muted-foreground">
                  Belirtileri ertelemek, lastik ve yakıt masrafı olarak geri döner.
                </p>
                <a
                  href={SITE.whatsapp}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center gap-2 rounded-lg bg-orange-500 px-6 py-3.5 text-[11px] uppercase tracking-widest text-white transition-colors hover:bg-orange-600 sm:text-xs"
                >
                  <MessageCircle className="h-4 w-4" />
                  Hemen Randevu Alın
                </a>
              </motion.div>
            </div>
          </section>

          {/* ===================== MİSYON (scroll reveal) ===================== */}
          <section
            id="misyon"
            className="border-t border-border/30 px-6 py-24 sm:px-10 md:py-36 lg:px-16"
          >
            <div className="mx-auto max-w-4xl">
              <motion.div
                {...fadeUp(0)}
                className="mx-auto mb-16 w-full max-w-[560px] overflow-hidden rounded-3xl border border-border/60"
              >
                <LazyVideo
                  src={HERO_VIDEO}
                  poster={HERO_POSTER}
                  className="aspect-square w-full"
                />
              </motion.div>

              <p className="mb-4 text-center font-inter text-xs uppercase tracking-[0.3em] text-muted-foreground">
                Yaklaşımımız
              </p>

              <ScrollRevealParagraphs
                paragraphs={[
                  {
                    words: MISSION_P1,
                    className:
                      "text-center font-inter text-2xl font-medium leading-snug tracking-[-1px] md:text-4xl lg:text-5xl",
                  },
                  {
                    words: MISSION_P2,
                    className:
                      "mt-10 text-center font-inter text-xl font-medium leading-snug md:text-2xl lg:text-3xl",
                  },
                ]}
              />
            </div>
          </section>

          {/* ===================== NASIL ÇALIŞIR ===================== */}
          <section className="border-t border-border/30 px-6 py-24 sm:px-10 md:py-36 lg:px-16">
            <div className="mx-auto max-w-6xl">
              <motion.p
                {...fadeUp(0)}
                className="text-xs uppercase tracking-[3px] text-muted-foreground"
              >
                Süreç
              </motion.p>
              <motion.h2
                {...fadeUp(0.1)}
                className="mt-4 max-w-3xl font-inter font-medium leading-[1.05] tracking-tight text-[clamp(1.8rem,5vw,4rem)]"
              >
                <span className="text-white">Nasıl </span>
                <span className="font-serif text-[1.1em] font-normal italic text-orange-500">
                  çalışır
                </span>
                <span className="text-white">?</span>
              </motion.h2>

              <div className="mt-16 grid gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
                {PROCESS.map((step, i) => (
                  <motion.div key={step.no} {...fadeUp(0.1 + i * 0.08)}>
                    <div className="font-display text-4xl text-orange-500/90">
                      {step.no}
                    </div>
                    <h3 className="mt-4 font-inter text-base font-semibold text-white">
                      {step.title}
                    </h3>
                    <p className="mt-2 font-inter text-sm leading-relaxed text-muted-foreground">
                      {step.desc}
                    </p>
                  </motion.div>
                ))}
              </div>

              <motion.div {...fadeUp(0.2)} className="mt-12">
                <Link
                  href="/customer"
                  className="group inline-flex items-center gap-2 font-inter text-sm font-medium text-orange-400 transition-colors hover:text-orange-300"
                >
                  Raporunuzu plakanızla görüntüleyin
                  <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </Link>
              </motion.div>
            </div>
          </section>

          {/* ===================== HİZMETLER ===================== */}
          <section
            id="hizmetler"
            className="border-t border-border/30 px-6 py-24 sm:px-10 md:py-36 lg:px-16"
          >
            <div className="mx-auto max-w-6xl">
              <motion.p
                {...fadeUp(0)}
                className="text-xs uppercase tracking-[3px] text-muted-foreground"
              >
                Hizmetlerimiz
              </motion.p>
              <motion.h2
                {...fadeUp(0.1)}
                className="mt-4 max-w-3xl font-inter font-medium leading-[1.05] tracking-tight text-[clamp(1.8rem,5vw,4rem)]"
              >
                <span className="text-white">Aracınız için </span>
                <span className="font-serif text-[1.1em] font-normal italic text-orange-500">
                  eksiksiz
                </span>
                <span className="text-white"> rot balans.</span>
              </motion.h2>

              <motion.div
                {...fadeUp(0.15)}
                className="mt-12 overflow-hidden rounded-2xl border border-border/60"
              >
                <LazyVideo
                  src={HERO_VIDEO}
                  poster={HERO_POSTER}
                  className="aspect-[3/1] w-full"
                />
              </motion.div>

              <div className="mt-16 grid gap-8 md:grid-cols-4">
                {SERVICES.map((service, i) => (
                  <motion.div key={service.title} {...fadeUp(0.1 + i * 0.08)}>
                    <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-white/5 text-orange-500 ring-1 ring-white/10">
                      <service.icon className="h-5 w-5" />
                    </div>
                    <h3 className="font-inter text-base font-semibold text-white">
                      {service.title}
                    </h3>
                    <p className="mt-2 font-inter text-sm leading-relaxed text-muted-foreground">
                      {service.desc}
                    </p>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>

          {/* ===================== YORUMLAR ===================== */}
          <section className="border-t border-border/30 px-6 py-24 sm:px-10 md:py-36 lg:px-16">
            <div className="mx-auto max-w-6xl">
              <motion.p
                {...fadeUp(0)}
                className="text-xs uppercase tracking-[3px] text-muted-foreground"
              >
                Müşteri Yorumları
              </motion.p>
              <div className="mt-4 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
                <motion.h2
                  {...fadeUp(0.1)}
                  className="max-w-2xl font-inter font-medium leading-[1.05] tracking-tight text-[clamp(1.8rem,5vw,4rem)]"
                >
                  <span className="text-white">Müşterilerimiz ne </span>
                  <span className="font-serif text-[1.1em] font-normal italic text-orange-500">
                    diyor
                  </span>
                  <span className="text-white">?</span>
                </motion.h2>
                <motion.div
                  {...fadeUp(0.15)}
                  className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-5 py-3"
                >
                  <div className="flex gap-0.5 text-orange-500">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-current" />
                    ))}
                  </div>
                  <span className="font-inter text-sm text-muted-foreground">
                    <span className="font-semibold text-white">4,9</span> · Google
                    değerlendirmeleri
                  </span>
                </motion.div>
              </div>

              <div className="mt-12 grid gap-5 md:grid-cols-3">
                {TESTIMONIALS.map((review, i) => (
                  <motion.figure
                    key={review.name}
                    {...fadeUp(0.1 + i * 0.08)}
                    className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 sm:p-7"
                  >
                    <div className="flex gap-0.5 text-orange-500">
                      {Array.from({ length: 5 }).map((_, s) => (
                        <Star key={s} className="h-4 w-4 fill-current" />
                      ))}
                    </div>
                    <blockquote className="mt-4 font-inter text-sm leading-relaxed text-white/85">
                      “{review.text}”
                    </blockquote>
                    <figcaption className="mt-5 font-inter text-sm">
                      <span className="font-semibold text-white">{review.name}</span>
                      <span className="text-muted-foreground"> · {review.car}</span>
                    </figcaption>
                  </motion.figure>
                ))}
              </div>
            </div>
          </section>

          {/* ===================== LASTİK OTELİ ===================== */}
          <section
            id="lastik-oteli"
            className="border-t border-border/30 bg-gradient-to-b from-black via-zinc-950 to-black px-6 py-24 sm:px-10 md:py-36 lg:px-16"
          >
            <div className="mx-auto max-w-6xl">
              <motion.div {...fadeUp(0)} className="max-w-2xl">
                <div className="mb-5 flex items-center gap-2">
                  <Warehouse className="h-4 w-4 text-orange-500" />
                  <span className="font-inter text-xs uppercase tracking-[0.3em] text-muted-foreground sm:text-sm">
                    Dört Mevsim Lastik Oteli
                  </span>
                </div>
                <h2 className="font-inter font-medium leading-[1.05] tracking-tight text-[clamp(2rem,5vw,4rem)]">
                  <span className="text-white">Lastiklerinizi </span>
                  <span className="font-serif text-[1.1em] font-normal italic text-orange-500">
                    bize emanet
                  </span>
                  <span className="text-white"> edin.</span>
                </h2>
                <p className="mt-6 font-inter text-sm leading-relaxed text-muted-foreground sm:text-base">
                  Yazlık ve kışlık lastiklerinizi sezon boyunca profesyonel
                  koşullarda saklıyoruz. Her takım yıkanır, etiketlenir ve
                  plakanıza kayıt edilir; mevsim geldiğinde tek aramayla değişime
                  hazır olur.
                </p>
              </motion.div>

              <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:mt-16 lg:grid-cols-4">
                {TIRE_HOTEL_FEATURES.map((feature, i) => (
                  <motion.div
                    key={feature.title}
                    {...fadeUp(0.08 * i)}
                    className="group rounded-2xl border border-white/10 bg-white/[0.03] p-6 transition-colors hover:border-orange-500/50 hover:bg-white/[0.06] sm:p-7"
                  >
                    <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-orange-500/10 text-orange-500 ring-1 ring-orange-500/20 transition-colors group-hover:bg-orange-500/20">
                      <feature.icon className="h-6 w-6" />
                    </div>
                    <h3 className="font-inter text-base font-semibold tracking-tight text-white sm:text-lg">
                      {feature.title}
                    </h3>
                    <p className="mt-2 font-inter text-sm leading-relaxed text-muted-foreground">
                      {feature.desc}
                    </p>
                  </motion.div>
                ))}
              </div>

              {/* Fiyat / yer ayırtma teaser */}
              <motion.div
                {...fadeUp(0.15)}
                className="mt-10 flex flex-col gap-5 rounded-2xl border border-orange-500/20 bg-orange-500/[0.06] p-7 sm:flex-row sm:items-center sm:justify-between sm:p-8"
              >
                <div>
                  <h3 className="font-inter text-lg font-semibold text-white">
                    Sezonluk saklama için yer ayırtın
                  </h3>
                  <p className="mt-1.5 font-inter text-sm text-muted-foreground">
                    Uygunluk ve güncel fiyat için WhatsApp&apos;tan ulaşın; sezon
                    yoğunluğu başlamadan yerinizi alın.
                  </p>
                </div>
                <a
                  href={SITE.whatsapp}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex shrink-0 items-center gap-2 rounded-lg bg-orange-500 px-6 py-3.5 text-xs uppercase tracking-widest text-white transition-colors hover:bg-orange-600"
                >
                  <MessageCircle className="h-4 w-4" />
                  Fiyat / Yer Ayırt
                </a>
              </motion.div>
            </div>
          </section>

          {/* ===================== CTA / RANDEVU ===================== */}
          <section className="relative overflow-hidden border-t border-border/30 px-6 py-24 sm:px-10 md:py-36 lg:px-16">
            <LazyVideo
              src={HERO_VIDEO}
              poster={HERO_POSTER}
              className="absolute inset-0 z-0"
            />
            <div className="absolute inset-0 z-[1] bg-black/70" />

            <div className="relative z-10 mx-auto flex max-w-2xl flex-col items-center text-center">
              <span className="mb-8 flex h-12 w-12 items-center justify-center rounded-full border-2 border-orange-500/70">
                <span className="h-5 w-5 rounded-full border border-orange-500/70" />
              </span>

              <h2 className="font-inter font-medium leading-[1.05] tracking-tight text-[clamp(2rem,5vw,4rem)]">
                <span className="text-white">Randevunuzu </span>
                <span className="font-serif text-[1.1em] font-normal italic text-orange-500">
                  alın.
                </span>
              </h2>
              <p className="mt-5 max-w-md font-inter text-sm leading-relaxed text-white/70 sm:text-base">
                Plakanızı sorgulayın ya da WhatsApp&apos;tan yazın; ölçümden ayara
                kadar gerisini biz hallederiz.
              </p>

              <div className="mt-9 flex flex-wrap items-center justify-center gap-4">
                <Link
                  href="/customer"
                  className="group flex items-center gap-2 rounded-lg bg-orange-500 px-8 py-3.5 text-xs uppercase tracking-widest text-white transition-colors hover:bg-orange-600"
                >
                  Plaka Sorgula
                  <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </Link>
                <a
                  href={SITE.whatsapp}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="liquid-glass flex items-center gap-2 rounded-lg px-8 py-3.5 text-xs uppercase tracking-widest text-white transition-colors hover:text-[#25d366]"
                >
                  <MessageCircle className="h-4 w-4" />
                  WhatsApp Randevu
                </a>
              </div>
            </div>
          </section>

          {/* ===================== İLETİŞİM / HARİTA ===================== */}
          <section
            id="iletisim"
            className="border-t border-border/30 px-6 py-24 sm:px-10 md:py-36 lg:px-16"
          >
            <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-2 lg:items-center">
              <motion.div {...fadeUp(0)}>
                <p className="text-xs uppercase tracking-[3px] text-muted-foreground">
                  İletişim
                </p>
                <h2 className="mt-4 font-inter font-medium leading-[1.05] tracking-tight text-[clamp(1.8rem,5vw,4rem)]">
                  <span className="text-white">Bizi </span>
                  <span className="font-serif text-[1.1em] font-normal italic text-orange-500">
                    ziyaret
                  </span>
                  <span className="text-white"> edin.</span>
                </h2>

                <div className="mt-8 space-y-4 font-inter text-sm text-muted-foreground">
                  <span className="flex items-start gap-3">
                    <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-orange-500" />
                    {SITE.address.full}
                  </span>
                  <a
                    href={`tel:${SITE.phoneE164}`}
                    className="flex items-center gap-3 transition-colors hover:text-white"
                  >
                    <Phone className="h-5 w-5 shrink-0 text-orange-500" />
                    {SITE.phoneDisplay}
                  </a>
                  <span className="flex items-center gap-3">
                    <Clock className="h-5 w-5 shrink-0 text-orange-500" />
                    {SITE.hours}
                  </span>
                </div>

                <div className="mt-8 flex flex-wrap gap-4">
                  <a
                    href={SITE.maps.directions}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center gap-2 rounded-lg bg-orange-500 px-6 py-3.5 text-xs uppercase tracking-widest text-white transition-colors hover:bg-orange-600"
                  >
                    <Navigation className="h-4 w-4" />
                    Yol Tarifi Al
                  </a>
                  <a
                    href={SITE.whatsapp}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="liquid-glass flex items-center gap-2 rounded-lg px-6 py-3.5 text-xs uppercase tracking-widest text-white transition-colors hover:text-[#25d366]"
                  >
                    <MessageCircle className="h-4 w-4" />
                    WhatsApp
                  </a>
                </div>
              </motion.div>

              <motion.div
                {...fadeUp(0.15)}
                className="overflow-hidden rounded-2xl border border-border/60"
              >
                <iframe
                  src={SITE.maps.embed}
                  title="Uzman Rot Balans konum haritası"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="aspect-[4/3] w-full grayscale"
                />
              </motion.div>
            </div>
          </section>

          {/* ===================== FOOTER ===================== */}
          <footer className="border-t border-border/40 bg-black px-6 py-14 sm:px-10 lg:px-16">
            <div className="mx-auto max-w-6xl">
              <div className="grid gap-10 md:grid-cols-3">
                <div className="max-w-xs">
                  <Brand className="font-display text-lg uppercase tracking-wider" />
                  <p className="mt-3 font-inter text-sm leading-relaxed text-muted-foreground">
                    Konya Motorlu Sanayi&apos;de rot ayarı, balans ve lastik
                    oteli. Şeffaf ölçüm, kayıtlı işlem, takip edilebilir sonuç.
                  </p>
                </div>

                <div className="space-y-3 font-inter text-sm text-muted-foreground">
                  <a
                    href={`tel:${SITE.phoneE164}`}
                    className="flex items-center gap-2.5 transition-colors hover:text-white"
                  >
                    <Phone className="h-4 w-4 shrink-0 text-orange-500" />
                    {SITE.phoneDisplay}
                  </a>
                  <a
                    href={SITE.whatsapp}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2.5 transition-colors hover:text-white"
                  >
                    <MessageCircle className="h-4 w-4 shrink-0 text-orange-500" />
                    WhatsApp&apos;tan yazın
                  </a>
                  <span className="flex items-start gap-2.5">
                    <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-orange-500" />
                    {SITE.address.full}
                  </span>
                  <span className="flex items-center gap-2.5">
                    <Clock className="h-4 w-4 shrink-0 text-orange-500" />
                    {SITE.hours}
                  </span>
                </div>

                <nav className="flex flex-col gap-3 font-inter text-sm text-muted-foreground md:items-end">
                  {NAV_LINKS.map((link) => (
                    <a
                      key={link.label}
                      href={link.href}
                      className="transition-colors hover:text-white"
                    >
                      {link.label}
                    </a>
                  ))}
                  <Link
                    href="/customer"
                    className="transition-colors hover:text-white"
                  >
                    Plaka Sorgula
                  </Link>
                </nav>
              </div>

              <div className="mt-12 flex flex-col gap-4 border-t border-border/40 pt-6 sm:flex-row sm:items-center sm:justify-between">
                <p className="font-inter text-xs text-muted-foreground">
                  © 2026 Uzman Rot Balans. Tüm hakları saklıdır.
                </p>
                <div className="flex items-center gap-3">
                  <a
                    href={`tel:${SITE.phoneE164}`}
                    aria-label="Telefon"
                    className="liquid-glass flex h-10 w-10 items-center justify-center rounded-full text-white transition-colors hover:text-orange-300"
                  >
                    <Phone className="h-4 w-4" />
                  </a>
                  <a
                    href={SITE.whatsapp}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="WhatsApp"
                    className="liquid-glass flex h-10 w-10 items-center justify-center rounded-full text-white transition-colors hover:text-[#25d366]"
                  >
                    <MessageCircle className="h-4 w-4" />
                  </a>
                  <a
                    href={`mailto:${SITE.email}`}
                    aria-label="E-posta"
                    className="liquid-glass flex h-10 w-10 items-center justify-center rounded-full text-white transition-colors hover:text-orange-300"
                  >
                    <Mail className="h-4 w-4" />
                  </a>
                </div>
              </div>
            </div>
          </footer>
        </main>
      </div>
    </MotionConfig>
  );
}
