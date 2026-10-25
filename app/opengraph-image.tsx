import { ImageResponse } from "next/og";
import { getKpis, getSeries } from "@/lib/data";
import { formatValue } from "@/lib/format";
import { SITE_NAME, SITE_TAGLINE } from "@/lib/site";

export const alt = `${SITE_NAME} — ${SITE_TAGLINE}: MRR, users, churn and retention dashboard`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
// Same rolling data as the dashboard; refresh hourly like the pages.
export const revalidate = 3600;

const C = {
  bg: "#0a0b0f",
  surface: "#14161f",
  border: "#22252f",
  fg: "#edeef2",
  muted: "#878b97",
  blue: "#5b8def",
  green: "#3fd68c",
  red: "#f2555a",
};

// Short labels keep all four tiles on one line at preview size.
const SHORT_LABEL: Record<string, string> = {
  mrr: "MRR",
  users: "Active users",
  churn: "Churn rate",
  nrr: "Net retention",
};

/** Link-preview card (Upwork, LinkedIn, Slack…) rendered from live KPIs. */
export default async function OpenGraphImage() {
  const [kpis, series] = await Promise.all([getKpis(30), getSeries(30)]);

  // 30-day MRR sparkline as an SVG path.
  const w = 1072;
  const h = 120;
  const values = series.map((d) => d.mrr);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const pts = values.map((v, i) => [
    (i / (values.length - 1)) * w,
    h - ((v - min) / (max - min || 1)) * (h - 12) - 6,
  ]);
  const line = pts.map(([x, y], i) => `${i ? "L" : "M"}${x.toFixed(1)} ${y.toFixed(1)}`).join(" ");
  const area = `${line} L${w} ${h} L0 ${h} Z`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          padding: "56px 64px",
          background: `radial-gradient(900px 480px at 85% -10%, rgba(91,141,239,0.22), transparent 60%), ${C.bg}`,
          color: C.fg,
          fontFamily: "sans-serif",
        }}
      >
        {/* Brand row */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: 12,
                background: "linear-gradient(135deg, #5b8def, #3a6ad0)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <svg width="30" height="30" viewBox="0 0 32 32">
                <path
                  fill="#fff"
                  d="M15.3 6.9a.7.7 0 0 1 1.4 0l1 5.2a2 2 0 0 0 1.6 1.6l5.2 1a.7.7 0 0 1 0 1.4l-5.2 1a2 2 0 0 0-1.6 1.6l-1 5.2a.7.7 0 0 1-1.4 0l-1-5.2a2 2 0 0 0-1.6-1.6l-5.2-1a.7.7 0 0 1 0-1.4l5.2-1a2 2 0 0 0 1.6-1.6z"
                />
              </svg>
            </div>
            <span style={{ fontSize: 34, fontWeight: 700 }}>{SITE_NAME}</span>
          </div>
          <span
            style={{
              fontSize: 22,
              color: C.muted,
              border: `1px solid ${C.border}`,
              borderRadius: 999,
              padding: "8px 18px",
            }}
          >
            Live demo · sample data
          </span>
        </div>

        {/* Headline */}
        <div style={{ display: "flex", flexDirection: "column", marginTop: 40 }}>
          <span style={{ fontSize: 58, fontWeight: 700, letterSpacing: -1.5 }}>{SITE_TAGLINE}</span>
          <span style={{ fontSize: 26, color: C.muted, marginTop: 10 }}>
            MRR, churn and retention at a glance — built with Next.js, TypeScript and Tailwind
          </span>
        </div>

        {/* KPI tiles */}
        <div style={{ display: "flex", gap: 16, marginTop: 36 }}>
          {kpis.map((k) => {
            const good = (k.direction === "up") === k.positiveIsGood;
            return (
              <div
                key={k.key}
                style={{
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  background: C.surface,
                  border: `1px solid ${C.border}`,
                  borderRadius: 16,
                  padding: "18px 20px",
                }}
              >
                <span style={{ fontSize: 18, color: C.muted }}>{SHORT_LABEL[k.key]}</span>
                <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginTop: 8 }}>
                  <span style={{ fontSize: 34, fontWeight: 700 }}>{formatValue(k.value, k.format)}</span>
                  <span style={{ fontSize: 18, fontWeight: 600, color: good ? C.green : C.red }}>
                    {k.direction === "up" ? "▲" : "▼"} {k.delta}
                    {k.deltaUnit === "%" ? "%" : " pts"}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* 30-day MRR trend */}
        <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ marginTop: "auto" }}>
          <defs>
            <linearGradient id="fill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor={C.blue} stopOpacity="0.35" />
              <stop offset="1" stopColor={C.blue} stopOpacity="0" />
            </linearGradient>
          </defs>
          <path d={area} fill="url(#fill)" />
          <path d={line} fill="none" stroke={C.blue} strokeWidth="4" strokeLinejoin="round" />
        </svg>
      </div>
    ),
    size
  );
}
