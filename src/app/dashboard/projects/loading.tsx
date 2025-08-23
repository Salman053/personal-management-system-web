import { Loader2 } from "lucide-react";

export default function Loading() {
  return <div className="w-full min-h-[88vh] flex items-center justify-center bg-background text-foreground">
     <Loader2 size={60} className="animate-spin"/>
  </div>
}
