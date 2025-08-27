// app/api/send-email/route.ts
import { NextResponse } from "next/server";
import { render } from "@react-email/render";
import { sendEmail } from "@/services/email-service";
import UniversalEmail, {
  UniversalEmailTemplateProps,
} from "@/emails/universal-email";

export async function POST(req: Request) {
  try {
    const data: UniversalEmailTemplateProps = await req.json();

    const html = await render(
      <UniversalEmail
        title={data.title}
        intro={data.intro}
        cta={data.cta}
        greeting={data.greeting}
        list={data.list}
        logo={data.logo}
        sender={data.sender}
        summary={data.summary}
        theme={data.theme}
        footer={data.footer}
        note={data.note}
      />
    );

    if (!data.to || !data.subject) {
      return NextResponse.json(
        { error: "Missing to/subject" },
        { status: 400 }
      );
    }

    await sendEmail(data.to, data.subject, html);

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("API email error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
