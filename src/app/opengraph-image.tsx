import { ImageResponse } from "next/og";

// Branded social-share image generated at build time (replaces the previous
// random placeholder photo). Text is kept ASCII so it renders with the default
// font without needing to bundle a custom typeface.
export const alt = "Uzman Rot Balans — Konya Rot Balans ve Lastik Oteli";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "center",
          backgroundColor: "#000000",
          padding: "90px",
        }}
      >
        <div
          style={{
            fontSize: 40,
            letterSpacing: 8,
            color: "#a3a3a3",
            textTransform: "uppercase",
            marginBottom: 24,
          }}
        >
          Konya · Rot Balans Merkezi
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 120,
            fontWeight: 800,
            lineHeight: 1,
            letterSpacing: -2,
          }}
        >
          <span style={{ color: "#ffffff" }}>UZMAN ROT </span>
          <span style={{ color: "#f97316" }}>BALANS</span>
        </div>
        <div
          style={{
            marginTop: 40,
            fontSize: 40,
            color: "#e5e5e5",
          }}
        >
          Rot Ayari · Balans · Lastik Oteli
        </div>
        <div
          style={{
            marginTop: 16,
            fontSize: 30,
            color: "#737373",
          }}
        >
          Plakanizla olcum raporunuzu online gorun
        </div>
      </div>
    ),
    { ...size },
  );
}
