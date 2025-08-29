"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AchievementBadge } from "./achievement-badge"
import { Gift } from "lucide-react"
import { motion } from "framer-motion"
import type { Badge as BadgeType, Achievement } from "@/types"

interface RewardsPanelProps {
  badges: BadgeType[]
  achievements: Achievement[]
  availableRewards: string[]
  onClaimReward: (rewardId: string) => void
}

export function RewardsPanel({ badges, achievements, availableRewards, onClaimReward }: RewardsPanelProps) {
  const [claimedRewards, setClaimedRewards] = useState<string[]>([])

  const completedAchievements = achievements.filter((a) => a.completed)
  const inProgressAchievements = achievements.filter((a) => !a.completed)

  const handleClaimReward = (rewardId: string) => {
    setClaimedRewards((prev) => [...prev, rewardId])
    onClaimReward(rewardId)
  }

  const rewardsList = [
    { id: "theme-unlock", name: "Dark Ocean Theme", description: "Unlock a beautiful dark ocean theme", cost: 500 },
    { id: "custom-colors", name: "Custom Colors", description: "Customize your habit colors", cost: 200 },
    { id: "advanced-stats", name: "Advanced Analytics", description: "Unlock detailed habit analytics", cost: 1000 },
    { id: "habit-templates", name: "Habit Templates", description: "Access pre-made habit templates", cost: 300 },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Gift className="h-5 w-5 text-purple-600" />
          Rewards & Achievements
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="achievements" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="achievements">Achievements</TabsTrigger>
            <TabsTrigger value="badges">Badges</TabsTrigger>
            <TabsTrigger value="rewards">Rewards</TabsTrigger>
          </TabsList>

          <TabsContent value="achievements" className="space-y-4">
            <div className="space-y-3">
              <h4 className="font-medium text-green-600">Completed ({completedAchievements.length})</h4>
              <div className="grid grid-cols-4 gap-3">
                {completedAchievements.map((achievement) => (
                  <div key={achievement.id} className="text-center space-y-1">
                    <AchievementBadge achievement={achievement} size="md" />
                    <p className="text-xs font-medium">{achievement.name}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-medium text-blue-600">In Progress ({inProgressAchievements.length})</h4>
              <div className="space-y-2">
                {inProgressAchievements.map((achievement) => (
                  <div key={achievement.id} className="flex items-center gap-3 p-2 rounded-lg bg-muted/50">
                    <AchievementBadge achievement={achievement} size="sm" showProgress />
                    <div className="flex-1">
                      <p className="font-medium text-sm">{achievement.name}</p>
                      <p className="text-xs text-muted-foreground">{achievement.description}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="text-xs text-blue-600">
                          {achievement.progress}/{achievement.target}
                        </div>
                        <Badge variant="secondary" className="text-xs">
                          +{achievement.xpReward} XP
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="badges" className="space-y-4">
            <div className="grid grid-cols-5 gap-3">
              {badges.map((badge) => (
                <div key={badge.id} className="text-center space-y-1">
                  <AchievementBadge badge={badge} size="md" />
                  <p className="text-xs font-medium">{badge.name}</p>
                  <p className="text-xs text-muted-foreground">{badge.category}</p>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="rewards" className="space-y-4">
            <div className="space-y-3">
              {rewardsList.map((reward) => {
                const isClaimed = claimedRewards.includes(reward.id)
                const isAvailable = availableRewards.includes(reward.id)

                return (
                  <motion.div
                    key={reward.id}
                    className={`p-3 rounded-lg border ${
                      isClaimed
                        ? "bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-700"
                        : isAvailable
                          ? "bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-700"
                          : "bg-gray-50 border-gray-200 dark:bg-gray-800 dark:border-gray-600"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium">{reward.name}</h4>
                        <p className="text-sm text-muted-foreground">{reward.description}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline">{reward.cost} XP</Badge>
                          {isClaimed && <Badge className="bg-green-500 text-white">Claimed</Badge>}
                        </div>
                      </div>
                      <div>
                        {isClaimed ? (
                          <Button disabled size="sm">
                            ✓ Claimed
                          </Button>
                        ) : isAvailable ? (
                          <Button
                            size="sm"
                            onClick={() => handleClaimReward(reward.id)}
                            className="bg-blue-600 hover:bg-blue-700"
                          >
                            Claim
                          </Button>
                        ) : (
                          <Button disabled size="sm" variant="outline">
                            Locked
                          </Button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
