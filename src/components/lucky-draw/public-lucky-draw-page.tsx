"use client"

import { useEffect, useRef, useState } from "react"
import { useSearchParams } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { toast } from "sonner"
import { luckyDrawService } from "@/services/lucky-draw"
import type { LuckyDraw } from "@/types/lucky-draw"
import { LuckyDrawLobby } from "@/components/lucky-draw/lucky-draw-lobby"
import {
  getGuestId,
  getGuestName,
  setGuestName,
  registerIdentity,
} from "@/lib/lucky-draw-guest"
import {
  Gift,
  Ticket,
  Sparkles,
  PartyPopper,
  ArrowRight,
  Users,
  ExternalLink,
} from "lucide-react"

const AVATAR_COLORS = [
  "bg-pink-500",
  "bg-purple-500",
  "bg-indigo-500",
  "bg-blue-500",
  "bg-cyan-500",
  "bg-emerald-500",
  "bg-amber-500",
  "bg-rose-500",
]

type Stage = "landing" | "enter-name" | "lobby"

export function PublicLuckyDrawPage() {
  const searchParams = useSearchParams()
  const [stage, setStage] = useState<Stage>("landing")
  const [draw, setDraw] = useState<LuckyDraw | null>(null)
  const [inviteCode, setInviteCode] = useState("")
  const [codeInput, setCodeInput] = useState("")
  const [nameInput, setNameInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [joining, setJoining] = useState(false)
  const initialCode = useRef<string | null>(null)

  // Prefill code from ?join=CODE
  useEffect(() => {
    const code = searchParams.get("join")
    if (code) {
      initialCode.current = code
      setInviteCode(code)
      setCodeInput(code)
    }
  }, [searchParams])

  // If a returning guest already has a name, jump straight to enter-name
  useEffect(() => {
    const storedName = getGuestName()
    if (storedName) {
      setNameInput(storedName)
    }
  }, [])

  const lookupDraw = async (code: string) => {
    const c = code.trim().toUpperCase()
    if (!c) {
      toast.error("Enter a room code")
      return null
    }
    setLoading(true)
    try {
      const found = await luckyDrawService.getDrawByCode(c)
      if (!found) {
        toast.error("No draw found with that code")
        return null
      }
      if (found.status === "completed") {
        toast.error("This draw has already finished")
        return null
      }
      setInviteCode(found.code)
      setDraw(found)
      return found
    } catch (error) {
      toast.error("Failed to find draw")
      return null
    } finally {
      setLoading(false)
    }
  }

  const handleFindRoom = async (e?: React.FormEvent) => {
    e?.preventDefault()
    const found = await lookupDraw(codeInput)
    if (found) {
      if (getGuestName()) {
        // Returning guest with saved name - straight to lobby
        await enterLobby(found, getGuestName())
      } else {
        setStage("enter-name")
      }
    }
  }

  const enterLobby = async (d: LuckyDraw, name: string) => {
    if (!name.trim()) {
      toast.error("Enter your name")
      return null
    }
    setJoining(true)
    try {
      setGuestName(name.trim())
      const identity = registerIdentity({ name: name.trim() })
      if (d.status === "waiting" && !d.participants.some((p) => p.userId === identity.userId)) {
        await luckyDrawService.joinDraw(d.id, {
          userId: identity.userId,
          name: identity.name,
          joinedAt: new Date(),
        })
      }
      setStage("lobby")
      setDraw(d)
      return d
    } catch (error) {
      toast.error("Failed to join room")
      return null
    } finally {
      setJoining(false)
    }
  }

  const handleEnter = async (e?: React.FormEvent) => {
    e?.preventDefault()
    if (!nameInput.trim()) {
      toast.error("Enter your name")
      return
    }
    if (!draw) {
      // Fallback: try to find by code again
      const found = await lookupDraw(inviteCode)
      if (found) await enterLobby(found, nameInput)
      return
    }
    await enterLobby(draw, nameInput)
  }

  const handleDirectLink = async () => {
    if (!initialCode.current) return
    const found = await lookupDraw(initialCode.current)
    if (found) {
      if (getGuestName()) {
        await enterLobby(found, getGuestName())
      } else {
        setStage("enter-name")
      }
    }
  }

  // Auto-attempt direct link join once
  useEffect(() => {
    if (initialCode.current) {
      handleDirectLink()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const guestId = getGuestId()
  const isAlreadyIn =
    draw?.participants.some((p) => p.userId === guestId) ?? false

  return (
    <div className="min-h-screen app-backdrop">
      <div className="mx-auto max-w-3xl px-4 py-10 sm:py-16">
        {/* Auto-join: lobby view */}
        {stage === "lobby" && draw ? (
          <LuckyDrawLobby
            draw={draw}
            currentUserId={getGuestId()}
            currentUserName={getGuestName() || "Guest"}
            isHostView={false}
          />
        ) : (
          <>
            {/* Hero */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center space-y-4 mb-10"
            >
              <motion.div
                animate={{ rotate: [0, -8, 8, -8, 0], scale: [1, 1.08, 1] }}
                transition={{ duration: 1.2, repeat: Infinity, repeatDelay: 2 }}
                className="mx-auto w-fit p-4 rounded-3xl bg-gradient-to-br from-primary/20 to-accent/20"
              >
                <Gift className="h-14 w-14 text-primary" />
              </motion.div>
              <h1 className="text-4xl sm:text-5xl font-black tracking-tight bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
                Lucky Draw
              </h1>
              <p className="text-muted-foreground max-w-md mx-auto">
                Enter the room code a friend shared, add your name, and take your
                shot at winning. No account needed!
              </p>

              {/* How it works */}
              <div className="flex items-center justify-center gap-3 flex-wrap pt-2">
                <Card className="bg-muted/50 border-none">
                  <CardContent className="flex items-center gap-2 p-3">
                    <Ticket className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium">1. Get the code</span>
                  </CardContent>
                </Card>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
                <Card className="bg-muted/50 border-none">
                  <CardContent className="flex items-center gap-2 p-3">
                    <Users className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium">2. Join the room</span>
                  </CardContent>
                </Card>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
                <Card className="bg-muted/50 border-none">
                  <CardContent className="flex items-center gap-2 p-3">
                    <PartyPopper className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium">3. Win the draw!</span>
                  </CardContent>
                </Card>
              </div>
            </motion.div>

            <AnimatePresence mode="wait">
              {/* Step 1: Enter code */}
              {stage === "landing" && (
                <motion.div
                  key="code"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <Card className="border-primary/30 shadow-xl">
                    <CardContent className="p-8 text-center space-y-5">
                      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
                        <Sparkles className="h-3.5 w-3.5" />
                        Got a code?
                      </div>
                      <form
                        onSubmit={handleFindRoom}
                        className="flex flex-col sm:flex-row gap-3"
                      >
                        <Input
                          value={codeInput}
                          onChange={(e) => setCodeInput(e.target.value.toUpperCase())}
                          placeholder="Enter code (e.g. 7F3QXK)"
                          className="h-14 text-center uppercase font-mono text-xl tracking-[0.3em]"
                          autoFocus
                        />
                        <Button type="submit" size="lg" className="h-14 px-8 gap-2 gradient-primary">
                          {loading ? "Finding room..." : "Join Room"}
                          {!loading && <ArrowRight className="h-4 w-4" />}
                        </Button>
                      </form>
                      <p className="text-sm text-muted-foreground">
                        Tip: the link a friend sent you has the code built in — you
                        can also just open it on any device.
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {/* Step 2: Enter name */}
              {stage === "enter-name" && (
                <motion.div
                  key="name"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <Card className="border-primary/30 shadow-xl overflow-hidden">
                    <div className="bg-gradient-to-r from-primary/15 via-accent/15 to-primary/15 px-8 py-5 border-b">
                      <div className="flex items-center justify-center gap-3">
                        <div className="p-2 rounded-lg bg-primary/10">
                          <Ticket className="h-5 w-5 text-primary" />
                        </div>
                        <div className="text-center">
                          <div className="text-xs uppercase tracking-widest text-muted-foreground">
                            Joining room
                          </div>
                          <div className="font-mono font-black text-2xl tracking-[0.3em]">
                            {inviteCode}
                          </div>
                        </div>
                      </div>
                    </div>
                    <CardContent className="p-8 space-y-5">
                      <div className="text-center">
                        <h2 className="text-xl font-bold">What&apos;s your name?</h2>
                        <p className="text-sm text-muted-foreground mt-1">
                          This is how everyone in the room will see you.
                        </p>
                      </div>
                      <form onSubmit={handleEnter} className="space-y-4">
                        <Input
                          value={nameInput}
                          onChange={(e) => setNameInput(e.target.value)}
                          placeholder="Your name"
                          className="h-14 text-center text-lg"
                          autoFocus
                        />
                        <Button
                          type="submit"
                          size="lg"
                          className="w-full h-14 gap-2 gradient-primary"
                          disabled={joining}
                        >
                          {joining ? (
                            <>
                              <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-current" />
                              Joining...
                            </>
                          ) : (
                            <>
                              <PartyPopper className="h-5 w-5" />
                              Join & Win!
                            </>
                          )}
                        </Button>
                      </form>
                      {draw && isAlreadyIn && (
                        <p className="text-center text-sm text-muted-foreground">
                          <ExternalLink className="h-3.5 w-3.5 inline mr-1" />
                          You&apos;re already in this room — entering again won&apos;t
                          duplicate you.
                        </p>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>
          </>
        )}
      </div>
    </div>
  )
}