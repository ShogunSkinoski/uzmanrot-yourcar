import React, { useState } from 'react';

const reportData = {
  firma: "UZMAN ROT BALANS",
  adres: "MOTORLU SAN. EMEVİLER SK. NO: 9/11 KONYA",
  telefon: "0332 237 9226 / 05050010816",
  tarih: "02.05.2026 18:57",
  musteri: "",
  firmaAdi: "ATN",
  aracPlaka: "",
  kmSayaci: "",
  teknisyen: "",
  siparisNo: "",
  aracBilgi: "FORD, S-MAX, 2006-2013",
  birincilAcilar: {
    on: {
      kamber: [
        { taraf: "Sol", ilk: "3°56'", min: "2°22'", maks: "4°25'", son: "4°27'" },
        { taraf: "Sağ", ilk: "3°40'", min: "2°22'", maks: "4°25'", son: "4°11'" },
      ],
      rot: [
        { taraf: "Sol", ilk: "-0°45'", min: "-1°57'", maks: "0°35'", son: "-1°06'" },
        { taraf: "Sağ", ilk: "-1°04'", min: "-1°57'", maks: "0°35'", son: "" },
      ],
      rotMm: [
        { taraf: "Sol", ilk: "4.7", min: "0.2mm", maks: "1.0mm", son: "0.5" },
        { taraf: "Sağ", ilk: "-0.7", min: "0.2mm", maks: "1.0mm", son: "0.3" },
        { taraf: "Toplam", ilk: "4.0", min: "0.4", maks: "2.1", son: "0.8" },
      ],
    },
    arka: {
      kamber: [
        { taraf: "Sol", ilk: "-1°33'", min: "-2°53'", maks: "-0°21'", son: "-1°33'" },
        { taraf: "Sağ", ilk: "-1°56'", min: "-2°53'", maks: "-0°21'", son: "-1°56'" },
      ],
      rot: [
        { taraf: "Sol", ilk: "0.1", min: "0.8mm", maks: "1.6mm", son: "0.1" },
        { taraf: "Sağ", ilk: "-0.6", min: "0.8mm", maks: "1.6mm", son: "-0.7" },
        { taraf: "Toplam", ilk: "-0.5", min: "4.6", maks: "3.3", son: "-0.6" },
      ],
      itisAcisi: { ilk: "-0°03'", son: "-0°04'" },
    },
  },
  ikincilAcilar: {
    sal: [
      { taraf: "Sol", ilk: "13°50'", min: "13°37'", maks: "13°37'", son: "13°50'" },
      { taraf: "Sağ", ilk: "13°59'", min: "13°37'", maks: "13°37'", son: "13°59'" },
    ],
    kapsamAcisi: [
      { taraf: "Sol", ilk: "13°05'", min: "—", maks: "—", son: "13°07'" },
      { taraf: "Sağ", ilk: "12°55'", min: "—", maks: "—", son: "12°53'" },
    ],
    fleksenKapiligi: [
      { taraf: "Ön", ilk: "0mm", son: "-2mm" },
      { taraf: "Arka", ilk: "11mm", son: "2mm" },
    ],
    tekerIziGenislikFarki: { ilk: "2mm", son: "-2mm" },
    onArkaAksMerkezFarki: { ilk: "12mm", son: "4mm" },
  },
};

const Section = ({ title, children }) => (
  <div style={{ marginBottom: 16 }}>
    <div style={{
      background: '#1f2937', color: '#fff', fontWeight: 700,
      fontSize: 13, padding: '6px 10px', borderRadius: '6px 6px 0 0'
    }}>{title}</div>
    <div style={{
      border: '1px solid #e5e7eb', borderTop: 'none',
      borderRadius: '0 0 6px 6px', overflow: 'hidden'
    }}>{children}</div>
  </div>
);

const Row = ({ label, sub, ilk, min, maks, son, highlight }) => (
  <div style={{
    display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr 1fr',
    fontSize: 12, borderBottom: '1px solid #f3f4f6',
    background: highlight ? '#fff7ed' : 'transparent'
  }}>
    <div style={{ padding: '5px 8px', color: '#374151', fontWeight: sub ? 400 : 600 }}>
      {label}{sub && <span style={{ color: '#9ca3af', marginLeft: 4, fontWeight: 400 }}>{sub}</span>}
    </div>
    <div style={{ padding: '5px 4px', textAlign: 'center', color: '#6b7280' }}>{ilk || '—'}</div>
    <div style={{ padding: '5px 4px', textAlign: 'center', color: '#6b7280', fontSize: 11 }}>{min || '—'}</div>
    <div style={{ padding: '5px 4px', textAlign: 'center', color: '#6b7280', fontSize: 11 }}>{maks || '—'}</div>
    <div style={{
      padding: '5px 4px', textAlign: 'center', fontWeight: 700,
      color: son && son !== '—' ? '#f97316' : '#9ca3af'
    }}>{son || '—'}</div>
  </div>
);

const TableHeader = () => (
  <div style={{
    display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr 1fr',
    fontSize: 11, background: '#f9fafb', borderBottom: '1px solid #e5e7eb'
  }}>
    {['', 'İlk', 'Min', 'Maks', 'Son'].map((h, i) => (
      <div key={i} style={{ padding: '4px 4px', textAlign: i > 0 ? 'center' : 'left', color: '#6b7280', fontWeight: 600 }}>{h}</div>
    ))}
  </div>
);

export default function RaporEkrani() {
  const [activeTab, setActiveTab] = useState('birincil');
  const d = reportData;

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', maxWidth: 480, margin: '0 auto', padding: 12, background: '#f8fafc', minHeight: '100vh' }}>

      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: 16, padding: '14px 10px', background: '#fff', borderRadius: 10, border: '1px solid #e5e7eb' }}>
        <div style={{ fontWeight: 800, fontSize: 18, color: '#1f2937', letterSpacing: 1 }}>{d.firma}</div>
        <div style={{ fontSize: 11, color: '#6b7280', marginTop: 2 }}>{d.adres}</div>
        <div style={{ fontSize: 11, color: '#f97316', marginTop: 1 }}>{d.telefon}</div>
      </div>

      {/* Müşteri Bilgileri */}
      <div style={{ background: '#fff', borderRadius: 10, border: '1px solid #e5e7eb', padding: 12, marginBottom: 16 }}>
        <div style={{ fontWeight: 700, fontSize: 13, color: '#1f2937', marginBottom: 8, borderBottom: '1px solid #f3f4f6', paddingBottom: 6 }}>
          ARAÇ AYAR RAPORU
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, fontSize: 12 }}>
          {[
            ['Firma', d.firmaAdi], ['Tarih', d.tarih],
            ['Araç', d.aracBilgi], ['Teknisyen', d.teknisyen || '—'],
            ['Plaka', d.aracPlaka || '—'], ['Sipariş No', d.siparisNo || '—'],
          ].map(([k, v], i) => (
            <div key={i}>
              <span style={{ color: '#9ca3af', fontSize: 11 }}>{k}: </span>
              <span style={{ fontWeight: 600, color: '#1f2937' }}>{v}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
        {[['birincil', 'Birincil Açılar'], ['ikincil', 'İkincil Açılar']].map(([key, label]) => (
          <button key={key} onClick={() => setActiveTab(key)} style={{
            flex: 1, padding: '8px 4px', borderRadius: 8, border: 'none', cursor: 'pointer',
            fontWeight: 700, fontSize: 12,
            background: activeTab === key ? '#f97316' : '#fff',
            color: activeTab === key ? '#fff' : '#6b7280',
            boxShadow: activeTab === key ? '0 2px 8px #f9731640' : '0 1px 3px #0001',
            transition: 'all 0.2s'
          }}>{label}</button>
        ))}
      </div>

      {activeTab === 'birincil' && (
        <>
          <Section title="ÖN — KAMBER">
            <TableHeader />
            {d.birincilAcilar.on.kamber.map((r, i) => <Row key={i} label={r.taraf} ilk={r.ilk} min={r.min} maks={r.maks} son={r.son} />)}
          </Section>
          <Section title="ÖN — ROT (derece)">
            <TableHeader />
            {d.birincilAcilar.on.rot.map((r, i) => <Row key={i} label={r.taraf} ilk={r.ilk} min={r.min} maks={r.maks} son={r.son} />)}
          </Section>
          <Section title="ÖN — ROT (mm)">
            <TableHeader />
            {d.birincilAcilar.on.rotMm.map((r, i) => <Row key={i} label={r.taraf} ilk={r.ilk} min={r.min} maks={r.maks} son={r.son} highlight={r.taraf === 'Toplam'} />)}
          </Section>
          <Section title="ARKA — KAMBER">
            <TableHeader />
            {d.birincilAcilar.arka.kamber.map((r, i) => <Row key={i} label={r.taraf} ilk={r.ilk} min={r.min} maks={r.maks} son={r.son} />)}
          </Section>
          <Section title="ARKA — ROT">
            <TableHeader />
            {d.birincilAcilar.arka.rot.map((r, i) => <Row key={i} label={r.taraf} ilk={r.ilk} min={r.min} maks={r.maks} son={r.son} highlight={r.taraf === 'Toplam'} />)}
          </Section>
          <Section title="ARKA — İTİŞ AÇISI">
            <TableHeader />
            <Row label="İtiş Açısı" ilk={d.birincilAcilar.arka.itisAcisi.ilk} son={d.birincilAcilar.arka.itisAcisi.son} />
          </Section>
        </>
      )}

      {activeTab === 'ikincil' && (
        <>
          <Section title="S.A.İ. (Scrub Radius)">
            <TableHeader />
            {d.ikincilAcilar.sal.map((r, i) => <Row key={i} label={r.taraf} ilk={r.ilk} min={r.min} maks={r.maks} son={r.son} />)}
          </Section>
          <Section title="KAPSAM AÇISI">
            <TableHeader />
            {d.ikincilAcilar.kapsamAcisi.map((r, i) => <Row key={i} label={r.taraf} ilk={r.ilk} min={r.min} maks={r.maks} son={r.son} />)}
          </Section>
          <Section title="FLEKSEN KAPILIGI">
            <TableHeader />
            {d.ikincilAcilar.fleksenKapiligi.map((r, i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', fontSize: 12, borderBottom: '1px solid #f3f4f6' }}>
                <div style={{ padding: '5px 8px', fontWeight: 600, color: '#374151' }}>{r.taraf}</div>
                <div style={{ padding: '5px 4px', textAlign: 'center', color: '#6b7280' }}>{r.ilk}</div>
                <div style={{ padding: '5px 4px', textAlign: 'center', fontWeight: 700, color: '#f97316' }}>{r.son}</div>
              </div>
            ))}
          </Section>
          <Section title="DİĞER ÖLÇÜMLER">
            <div style={{ fontSize: 12 }}>
              {[
                ['Tekerlek İzi Genişlik Farkı', d.ikincilAcilar.tekerIziGenislikFarki.ilk, d.ikincilAcilar.tekerIziGenislikFarki.son],
                ['Ön-Arka Aks Merkez Farkı', d.ikincilAcilar.onArkaAksMerkezFarki.ilk, d.ikincilAcilar.onArkaAksMerkezFarki.son],
              ].map(([label, ilk, son], i) => (
                <div key={i} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', borderBottom: '1px solid #f3f4f6' }}>
                  <div style={{ padding: '5px 8px', color: '#374151', fontWeight: 600 }}>{label}</div>
                  <div style={{ padding: '5px 4px', textAlign: 'center', color: '#6b7280' }}>{ilk}</div>
                  <div style={{ padding: '5px 4px', textAlign: 'center', fontWeight: 700, color: '#f97316' }}>{son}</div>
                </div>
              ))}
            </div>
          </Section>
        </>
      )}

      <div style={{ textAlign: 'center', fontSize: 11, color: '#9ca3af', marginTop: 16, paddingBottom: 20 }}>
        BİZİ TERCİH ETTİĞİNİZ İÇİN TEŞEKKÜR EDERİZ
      </div>
    </div>
  );
}