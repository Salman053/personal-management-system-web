// emails/TaskEmail.tsx
import {
  Html,
  Body,
  Container,
  Text,
  Heading,
  Section,
} from "@react-email/components";

interface Subtask {
  title: string;
  description?: string;
  isCompleted: boolean;
  for?: string;
}

export default function TaskEmail({
  taskTitle,
  taskDescription,
  subtasks,
  summary,
  footer,
}: {
  taskTitle: string;
  taskDescription?: string;
  subtasks?: Subtask[];
  summary?: { total: number; completed: number; pending: number; progress: number };
  footer?: string;
}) {
  return (
    <Html>
      <Body
        style={{
          fontFamily: "Arial, sans-serif",
          background: "#f4f5f7",
          padding: "20px",
        }}
      >
        <Container
          style={{
            background: "#ffffff",
            padding: "24px",
            borderRadius: "10px",
            maxWidth: "600px",
            margin: "0 auto",
          }}
        >
          {/* Title */}
          <Heading
            style={{
              fontSize: "20px",
              marginBottom: "16px",
              color: "#222",
            }}
          >
            📌 Task Update: {taskTitle}
          </Heading>

          {/* Description */}
          {taskDescription && (
            <Text style={{ marginBottom: "20px", color: "#555" }}>
              {taskDescription}
            </Text>
          )}

          {/* Subtasks */}
          {subtasks && subtasks.length > 0 && (
            <Section style={{ marginBottom: "20px" }}>
              <Text
                style={{
                  fontWeight: "bold",
                  marginBottom: "8px",
                  color: "#333",
                }}
              >
                Subtasks:
              </Text>
              <ul style={{ paddingLeft: "20px", color: "#444" }}>
                {subtasks.map((s, i) => (
                  <li key={i} style={{ marginBottom: "6px" }}>
                    {s.isCompleted ? "✅" : "❌"} {s.title}
                    {s.description && ` - ${s.description}`}
                    {s.for && ` (for: ${s.for})`}
                  </li>
                ))}
              </ul>
            </Section>
          )}

          {/* Summary */}
          {summary && (
            <Section style={{ marginBottom: "20px" }}>
              <Text
                style={{
                  fontWeight: "bold",
                  marginBottom: "8px",
                  color: "#333",
                }}
              >
                📊 Progress Summary:
              </Text>
              <ul style={{ paddingLeft: "20px", color: "#444" }}>
                <li>Total: {summary.total}</li>
                <li>Completed: {summary.completed}</li>
                <li>Pending: {summary.pending}</li>
                <li>Progress: {summary.progress}%</li>
              </ul>
            </Section>
          )}

          {/* Footer */}
          <Text
            style={{
              marginTop: "20px",
              fontSize: "12px",
              color: "#888",
              borderTop: "1px solid #eee",
              paddingTop: "10px",
            }}
          >
            {footer || "— Sent from Task Manager"}
          </Text>
        </Container>
      </Body>
    </Html>
  );
}
