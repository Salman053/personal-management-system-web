"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Doubt } from "@/types";
import { formatDate } from "@/lib/date-utility";

interface DoubtDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onResolve: (doubt: Doubt) => void;
  doubt: Doubt;
}

export function DoubtView({
  open,
  onOpenChange,
  onResolve,
  doubt,
}: DoubtDialogProps) {
  const statusColors: Record<string, string> = {
    open: "bg-red-100 text-red-700",
    "in-review": "bg-yellow-100 text-yellow-700",
    resolved: "bg-green-100 text-green-700",
  };

  const priorityColors: Record<string, string> = {
    low: "bg-gray-100 text-gray-700",
    medium: "bg-blue-100 text-blue-700",
    high: "bg-orange-100 text-orange-700",
    urgent: "bg-red-100 text-red-700",
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        {doubt && (
          <DialogContent className="max-w-2xl rounded-2xl">
            <DialogHeader>
              <DialogTitle className="text-2xl font-semibold">
                {doubt?.title}
              </DialogTitle>
              <DialogDescription>
                View and manage this doubt in detail
              </DialogDescription>
            </DialogHeader>

            {/* Status + Priority */}
            <div className="flex flex-wrap gap-2 mt-2">
              <Badge className={statusColors[doubt?.status]}>
                {doubt?.status.toUpperCase()}
              </Badge>
              <Badge className={priorityColors[doubt?.priority]}>
                Priority: {doubt?.priority}
              </Badge>
              <Badge variant="outline">{doubt?.category}</Badge>
            </div>

            <p className="text-sm text-muted-foreground mt-1">
              Created: {formatDate(doubt?.createdAt)} | Updated:
              {formatDate(doubt?.updatedAt)}
            </p>

            <Separator className="my-4" />

            {/* Details */}
            {doubt?.details && (
              <div>
                <h3 className="font-medium mb-1">Details</h3>
                <p className="text-muted-foreground">{doubt?.details}</p>
              </div>
            )}

            {/* Tags */}
            {doubt?.tags && doubt.tags.length > 0 && (
              <div>
                <h3 className="font-medium mt-4 mb-1">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {doubt.tags.map((tag) => (
                    <Badge key={tag} variant="secondary">
                      #{tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            <Separator className="my-4" />

            {/* Resolution */}
            {doubt?.isResolved ? (
              <div className="bg-green-50 p-4 rounded-xl border border-green-200">
                <h3 className="font-semibold text-green-700">Resolution</h3>
                <p className="text-green-800 mt-2 whitespace-pre-line">
                  {doubt.resolutionExplanation}
                </p>

                {doubt?.sources && doubt.sources.length > 0 && (
                  <div className="mt-3">
                    <h4 className="font-medium text-green-600">Sources</h4>
                    <ul className="list-disc list-inside text-green-700">
                      {doubt.sources.map((src, idx) => (
                        <li key={idx}>
                          <a
                            href={src}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="underline hover:text-green-800"
                          >
                            {src}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {doubt?.resolvedAt && (
                  <p className="text-xs text-green-600 mt-2">
                    Resolved on: {formatDate(doubt.resolvedAt)}
                  </p>
                )}
              </div>
            ) : (
              <div className="flex justify-end">
                <Button onClick={() => onResolve(doubt)}>Resolve Doubt</Button>
              </div>
            )}
          </DialogContent>
        )}
      </Dialog>
    </>
  );
}
