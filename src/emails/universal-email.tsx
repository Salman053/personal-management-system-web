// emails/UniversalEmail.tsx
import {
  Html,
  Body,
  Container,
  Text,
  Heading,
  Section,
  Hr,
  Img,
  Button as EmailButton,
} from "@react-email/components";

export interface UniversalEmailTemplateProps {
  sender?: string;
  logo?: string;
  greeting?: string;
  title: string;
  intro?: string;
  list?: string[];
  summary?: { [key: string]: string | number };
  cta?: { label: string; url: string };
  footer?: string;
  theme?: "light" | "dark";
  to?: string;
  subject?: string;
  note?: string; // ✅ NEW
}

export default function UniversalEmail({
  sender = "Muhammad Salman Khan",
  logo,
  title,
  intro,
  list,
  summary,
  cta,
  footer,
  theme = "light",
  greeting = `Greetings from ${sender}!`,
  note, // ✅ include note
}: UniversalEmailTemplateProps) {
  const colors =
    theme === "dark"
      ? {
          background: "#1a1a1a",
          card: "#2a2a2a",
          text: "#eee",
          secondary: "#bbb",
          border: "#444",
          accent: "#4f46e5",
          noteBg: "#333",
        }
      : {
          background: "#f4f6f9",
          card: "#ffffff",
          text: "#111",
          secondary: "#555",
          border: "#eee",
          accent: "#2563eb",
          noteBg: "#fef9c3", // soft yellow
        };

  return (
    <Html>
      <Body
        style={{
          fontFamily: "Arial, sans-serif",
          background: colors.background,
          padding: "20px",
          lineHeight: "1.6",
          color: colors.text,
        }}
      >
        <Container
          style={{
            background: colors.card,
            padding: "24px",
            borderRadius: "12px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
            maxWidth: "600px",
            margin: "0 auto",
          }}
        >
          {logo && (
            <Img
              src={logo}
              alt={sender}
              width="120"
              style={{ marginBottom: "16px" }}
            />
          )}

          <Text style={{ fontSize: "14px", color: colors.secondary, marginBottom: "8px" }}>
            {greeting}
          </Text>

          <Heading style={{ fontSize: "22px", marginBottom: "16px", color: colors.text }}>
            📌 {title}
          </Heading>

          {intro && (
            <Text style={{ fontSize: "15px", marginBottom: "20px", color: colors.text }}>
              {intro}
            </Text>
          )}

          {list && list.length > 0 && (
            <Section style={{ marginBottom: "20px" }}>
              <ul style={{ paddingLeft: "20px", margin: 0, color: colors.secondary }}>
                {list.map((item, idx) => (
                  <li key={idx} style={{ marginBottom: "6px" }}>
                    {item}
                  </li>
                ))}
              </ul>
            </Section>
          )}

          {summary && (
            <>
              <Hr style={{ borderColor: colors.border, margin: "20px 0" }} />
              <Text
                style={{
                  fontWeight: "bold",
                  marginBottom: "8px",
                  color: colors.text,
                }}
              >
                📊 Summary
              </Text>
              <ul style={{ paddingLeft: "20px", margin: 0, color: colors.secondary }}>
                {Object.entries(summary).map(([key, value]) => (
                  <li key={key}>
                    {key}: <strong>{value}</strong>
                  </li>
                ))}
              </ul>
            </>
          )}

          {/* ✅ Note Section */}
          {note && (
            <Text
              style={{
                marginTop: "20px",
                padding: "12px 16px",
                borderLeft: `4px solid ${colors.accent}`,
                background: colors.noteBg,
                borderRadius: "6px",
              }}
            >
              <Text style={{ margin: 0, fontSize: "14px", color: colors.text }}>
                <strong>Note:</strong> {note}
              </Text>
            </Text>
          )}

          {cta && (
            <Section style={{ textAlign: "center", margin: "24px 0" }}>
              <EmailButton
                href={cta.url}
                style={{
                  backgroundColor: colors.accent,
                  color: "#fff",
                  padding: "12px 24px",
                  borderRadius: "8px",
                  textDecoration: "none",
                  fontSize: "15px",
                  fontWeight: "bold",
                  display: "inline-block",
                }}
              >
                {cta.label}
              </EmailButton>
            </Section>
          )}

          <Hr style={{ borderColor: colors.border, margin: "20px 0" }} />
          <Text
            style={{
              fontSize: "12px",
              color: colors.secondary,
              textAlign: "center",
              lineHeight: "1.4",
            }}
          >
            {footer || `— Sent via personal management system`}
          </Text>
        </Container>
      </Body>
    </Html>
  );
}
