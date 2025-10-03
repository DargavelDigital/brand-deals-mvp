import React from "react";
import {
  Document, Page, Text, View, StyleSheet, Font, Link, Image
} from "@react-pdf/renderer";
import fontkit from "fontkit";

Font.register({ family: "Inter",
  fonts: [
    { src: "https://rsms.me/inter/font-files/Inter-Regular.woff2", fontWeight: 400 },
    { src: "https://rsms.me/inter/font-files/Inter-SemiBold.woff2", fontWeight: 600 },
    { src: "https://rsms.me/inter/font-files/Inter-Bold.woff2", fontWeight: 700 },
  ]
});

type Theme = {
  brandColor: string;
  dark?: boolean;
};
type Social = { platform: string; url?: string; followers?: number };
type Audience = {
  metrics?: { followers?: number; engagementRate?: number; monthlyReach?: number };
  demographics?: { label: string; value: number }[];
  locations?: { label: string; value: number }[];
};
type CaseStudy = { brand: string; summary: string; result?: string };
type Service = { name: string; price?: string; description?: string };

type Payload = {
  creator?: {
    displayName?: string;
    handle?: string;
    email?: string;
    website?: string;
    avatarUrl?: string;
    bio?: string;
  };
  socials?: Social[];
  audience?: Audience;
  contentPillars?: string[];
  caseStudies?: CaseStudy[];
  services?: Service[];
  rateCardNote?: string;
  contact?: { email?: string; website?: string };
  cta?: { text?: string; url?: string };
};

type Props = {
  payload: Payload;
  theme: Theme;
  variant: "classic" | "bold" | "editorial";
};

const styles = StyleSheet.create({
  page: {
    fontFamily: "Inter",
    fontSize: 11,
    padding: 26,
    color: "#0b0b0c",
  },
  pageDark: {
    backgroundColor: "#0b0c0f",
    color: "#f5f6f7",
  },
  brand: { color: "#3b82f6" },
  h1: { fontSize: 24, fontWeight: 700, marginBottom: 2 },
  h2: { fontSize: 14, fontWeight: 700, marginTop: 16, marginBottom: 8 },
  muted: { opacity: 0.7 },
  row: { flexDirection: "row", gap: 12 },
  col: { flexDirection: "column", gap: 6 },
  card: {
    borderRadius: 8, padding: 12, border: "1px solid #e5e7eb"
  },
  chip: {
    paddingVertical: 4, paddingHorizontal: 8, borderRadius: 999,
    fontSize: 10, fontWeight: 600, marginRight: 6, marginBottom: 6,
  },
  divider: { height: 1, backgroundColor: "#e5e7eb", marginVertical: 12 },
});

function brandColor(brand: string, dark?: boolean) {
  return brand || (dark ? "#60a5fa" : "#3b82f6");
}

function fmtNum(n?: number) {
  if (n == null) return "—";
  if (n >= 1_000_000) return `${(n/1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n/1_000).toFixed(1)}K`;
  return `${n}`;
}

export const MediaPackPDF: React.FC<Props> = ({ payload, theme, variant }) => {
  const brand = brandColor(theme.brandColor, theme.dark);
  const creator = payload.creator ?? {};
  const socials = payload.socials ?? [];
  const aud = payload.audience ?? {};
  const metrics = aud.metrics ?? {};
  const pillars = payload.contentPillars ?? [];
  const cases = payload.caseStudies ?? [];
  const services = payload.services ?? [];
  const contact = payload.contact ?? payload.creator ?? {};

  return (
    <Document title={`${creator.displayName || "Creator"} • Media Pack`}>
      <Page size="A4" style={[styles.page, theme.dark && styles.pageDark]}>
        {/* Header */}
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
          <View>
            <Text style={[styles.h1, { color: brand }]}>{creator.displayName || "Creator"}</Text>
            <Text style={styles.muted}>Media Pack</Text>
          </View>
          {creator.avatarUrl && (
            <Image src={creator.avatarUrl} style={{ width: 56, height: 56, borderRadius: 8 }} />
          )}
        </View>

        {/* Metrics */}
        <Text style={styles.h2}>Key Metrics</Text>
        <View style={[styles.row]}>
          <View style={{ flex: 1, alignItems: "center" }}>
            <Text style={{ fontSize: 20, fontWeight: 700, color: brand }}>{fmtNum(metrics.followers)}</Text>
            <Text style={styles.muted}>Followers</Text>
          </View>
          <View style={{ flex: 1, alignItems: "center" }}>
            <Text style={{ fontSize: 20, fontWeight: 700, color: brand }}>
              {metrics.engagementRate != null ? `${metrics.engagementRate}%` : "—"}
            </Text>
            <Text style={styles.muted}>Engagement</Text>
          </View>
          <View style={{ flex: 1, alignItems: "center" }}>
            <Text style={{ fontSize: 20, fontWeight: 700, color: brand }}>{fmtNum(metrics.monthlyReach)}</Text>
            <Text style={styles.muted}>Monthly Reach</Text>
          </View>
        </View>

        {/* Platforms */}
        <Text style={styles.h2}>Platforms</Text>
        <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
          {socials.map((s, i) => (
            <View key={i} style={[styles.chip, { backgroundColor: `${brand}22`, color: brand }]}>
              <Text>{s.platform}</Text>
            </View>
          ))}
        </View>

        {/* About */}
        {(creator.bio) && (
          <>
            <Text style={styles.h2}>About</Text>
            <Text>{creator.bio}</Text>
          </>
        )}

        {/* Audience (optional) */}
        {Array.isArray(aud.demographics) && aud.demographics.length > 0 && (
          <>
            <Text style={styles.h2}>Audience</Text>
            {aud.demographics.map((d, i) => (
              <View key={i} style={{ marginBottom: 4, flexDirection: "row", alignItems: "center" }}>
                <Text style={{ width: 120 }}>{d.label}</Text>
                <View style={{ height: 6, backgroundColor: `${brand}33`, borderRadius: 999, flex: 1 }}>
                  <View style={{
                    width: `${Math.max(0, Math.min(100, d.value))}%`,
                    height: 6, backgroundColor: brand, borderRadius: 999
                  }}/>
                </View>
              </View>
            ))}
          </>
        )}

        {/* Pillars */}
        {pillars.length > 0 && (
          <>
            <Text style={styles.h2}>Content Pillars</Text>
            <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
              {pillars.map((p, i) => (
                <View key={i} style={[styles.chip, { backgroundColor: `${brand}22`, color: brand }]}>
                  <Text>{p}</Text>
                </View>
              ))}
            </View>
          </>
        )}

        {/* Case Studies */}
        {cases.length > 0 && (
          <>
            <Text style={styles.h2}>Case Studies</Text>
            {cases.slice(0, 2).map((c, i) => (
              <View key={i} style={styles.card}>
                <Text style={{ fontWeight: 700, marginBottom: 4 }}>{c.brand}</Text>
                <Text>{c.summary}</Text>
                {c.result && <Text style={{ marginTop: 4, color: brand }}>{c.result}</Text>}
              </View>
            ))}
          </>
        )}

        {/* Services / Packages */}
        {services.length > 0 && (
          <>
            <Text style={styles.h2}>Packages</Text>
            <View style={{ gap: 8 }}>
              {services.slice(0, 3).map((svc, i) => (
                <View key={i} style={[styles.card, { borderColor: `${brand}55` }]}>
                  <Text style={{ fontWeight: 700 }}>{svc.name} {svc.price ? `• ${svc.price}` : ""}</Text>
                  {svc.description && <Text style={styles.muted}>{svc.description}</Text>}
                </View>
              ))}
            </View>
          </>
        )}

        <View style={styles.divider} />

        {/* CTA / Contact */}
        <View style={[styles.row, { alignItems: "center", justifyContent: "space-between" }]}>
          <View style={styles.col}>
            {contact.email && <Text>Email: {contact.email}</Text>}
            {contact.website && <Text>Site: {contact.website}</Text>}
          </View>
          {payload.cta?.url && (
            <Link src={payload.cta.url}>
              <Text style={{ backgroundColor: brand, color: theme.dark ? "#0b0c0f" : "#fff", padding: 8, borderRadius: 6, fontWeight: 700 }}>
                {payload.cta.text || "Start a Conversation"}
              </Text>
            </Link>
          )}
        </View>
      </Page>
    </Document>
  );
};
