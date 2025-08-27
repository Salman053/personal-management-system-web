"use client"

import { motion } from "framer-motion"
import { Loader2, ShieldCheck } from "lucide-react"

export default function AuthLoadingScreen() {
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-background z-[9999]">
      {/* Animated Loader */}
      <motion.div
        className="flex items-center justify-center relative"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        <motion.div
          className="absolute w-20 h-20 rounded-full border-4 border-primary/40 border-t-primary animate-spin"
        />
        <ShieldCheck className="h-10 w-10 text-primary z-10" />
      </motion.div>

      {/* Status text */}
      <motion.p
        className="mt-6 text-lg font-medium text-muted-foreground"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        Checking your session...
      </motion.p>

      {/* Extra pulsing hint */}
      <motion.span
        className="mt-2 text-sm text-muted-foreground"
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 1, 0] }}
        transition={{ duration: 1.5, repeat: Infinity }}
      >
        Please hold on a moment ✨
      </motion.span>
    </div>
  )
}
