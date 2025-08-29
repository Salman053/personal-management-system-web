"use client";

import React, { useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { renderTemplate } from "@/lib/email-helpers";
import { EmailTemplate } from "@/types";

/**
 * UseTemplateModal:
 * - auto-generates inputs for each placeholder in template.placeholders
 * - shows live preview (subject & body)
 * - allows copy to clipboard and 'open email client' using mailto (uses subject & body)
 */
type Props = {
  template: EmailTemplate;
  onClose: () => void;
};

export default function UseTemplateModal({ template, onClose }: Props) {
  const initialValues = useMemo(() => {
    const v: Record<string, string> = {};
    template.placeholders.forEach((p) => (v[p] = ""));
    return v;
  }, [template.placeholders]);

  const [values, setValues] = useState<Record<string, string>>(initialValues);
  const rendered = renderTemplate(template as any, values);

  const handleChange = (k: string, v: string) =>
    setValues((s) => ({ ...s, [k]: v }));

  const handleCopy = async () => {
    await navigator.clipboard.writeText(rendered.body);
    // optional toast
    alert("Email body copied to clipboard");
  };

  const handleCopyHTML = async () => {
    // If body is HTML you might want to copy html; here we just copy body.
    await navigator.clipboard.writeText(rendered.body);
    alert("HTML copied to clipboard");
  };

  const handleMailTo = () => {
    const mailto = `mailto:?subject=${encodeURIComponent(rendered.subject)}&body=${encodeURIComponent(rendered.body)}`;
    window.open(mailto);
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Use Template — {template.title}</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-sm mb-2 font-medium">
              Fill placeholder values
            </div>

            <div className="space-y-2">
              {template.placeholders.length === 0 && (
                <div className="text-sm text-gray-500">
                  No placeholders — you can copy the template directly.
                </div>
              )}
              {template.placeholders.map((p) => (
                <div key={p}>
                  <label className="text-xs text-gray-600">{p}</label>
                  <Input
                    value={values[p] ?? ""}
                    onChange={(e) => handleChange(p, e.target.value)}
                    placeholder={`Enter ${p}`}
                  />
                </div>
              ))}
            </div>

            <div className="mt-4 flex gap-2">
              <Button onClick={handleCopy}>Copy Body</Button>
              <Button variant="outline" onClick={handleCopyHTML}>
                Copy HTML
              </Button>
              <Button variant="secondary" onClick={handleMailTo}>
                Open Email Client
              </Button>
            </div>
          </div>

          <div>
            <div className="text-sm mb-2 font-medium">Live Preview</div>
            <div className="border rounded p-3 bg-white h-[360px] overflow-auto">
              <div className="text-sm text-gray-600 mb-2">
                <strong>Subject:</strong> {rendered.subject}
              </div>
              <div className="whitespace-pre-wrap">{rendered.body}</div>
            </div>
          </div>
        </div>

        <div className="mt-4 flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
