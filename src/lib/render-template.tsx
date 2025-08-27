import { render } from "@react-email/render";
import TaskEmail from "@/emails/task-email";
import UniversalEmail from "@/emails/universal-email";

export async function buildEmailTemplate(
  type: string,
  payload: any
): Promise<string> {
  switch (type) {
    case "task":
      return await render(<TaskEmail {...payload} />);
    case "universal":
      return await render(<UniversalEmail {...payload} />);
    default:
      return `<div><p>${payload.message || "Hello 👋"}</p></div>`;
  }
}
