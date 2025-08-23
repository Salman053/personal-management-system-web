"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import type { LearningItem } from "@/contexts/app-context"
import { BookOpen, Target, FileText, StickyNote, TrendingUp } from "lucide-react"

interface LearningProgressProps {
  items: LearningItem[]
}

export function LearningProgress({ items }: LearningProgressProps) {
  const roadmaps = items.filter((item) => item.type === "roadmap")

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "roadmap":
        return <BookOpen className="h-4 w-4" />
      case "topic":
        return <Target className="h-4 w-4" />
      case "subtopic":
        return <FileText className="h-4 w-4" />
      case "note":
        return <StickyNote className="h-4 w-4" />
      default:
        return <FileText className="h-4 w-4" />
    }
  }

  const getProgressColor = (progress: number) => {
    if (progress === 100) return "text-green-600"
    if (progress >= 75) return "text-blue-600"
    if (progress >= 50) return "text-yellow-600"
    if (progress >= 25) return "text-orange-600"
    return "text-red-600"
  }

  const getChildItems = (parentId: string) => {
    return items.filter((item) => item.parentId === parentId)
  }

  const calculateOverallProgress = () => {
    if (items.length === 0) return 0
    const totalProgress = items.reduce((sum, item) => sum + item.progress, 0)
    return Math.round(totalProgress / items.length)
  }

  const overallProgress = calculateOverallProgress()

  if (items.length === 0) {
    return (
      <Card>
        <CardContent className="p-12">
          <div className="text-center">
            <h3 className="text-lg font-medium text-muted-foreground">No learning data available</h3>
            <p className="text-sm text-muted-foreground mt-2">Start adding learning items to see progress.</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Overall Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Overall Learning Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Total Progress</span>
              <span className={`font-medium ${getProgressColor(overallProgress)}`}>{overallProgress}%</span>
            </div>
            <Progress value={overallProgress} className="h-3" />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 text-sm">
              <div className="text-center">
                <div className="font-medium">{items.length}</div>
                <div className="text-muted-foreground">Total Items</div>
              </div>
              <div className="text-center">
                <div className="font-medium text-green-600">{items.filter((i) => i.completed).length}</div>
                <div className="text-muted-foreground">Completed</div>
              </div>
              <div className="text-center">
                <div className="font-medium text-blue-600">
                  {items.filter((i) => i.progress > 0 && !i.completed).length}
                </div>
                <div className="text-muted-foreground">In Progress</div>
              </div>
              <div className="text-center">
                <div className="font-medium text-gray-600">{items.filter((i) => i.progress === 0).length}</div>
                <div className="text-muted-foreground">Not Started</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Roadmap Progress */}
      <div className="grid gap-4 md:grid-cols-2">
        {roadmaps.map((roadmap) => {
          const topics = getChildItems(roadmap.id)
          const completedTopics = topics.filter((topic) => topic.completed).length

          return (
            <Card key={roadmap.id}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    {getTypeIcon(roadmap.type)}
                    {roadmap.title}
                  </CardTitle>
                  <Badge variant={roadmap.completed ? "default" : "secondary"}>
                    {roadmap.completed ? "Completed" : "In Progress"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progress</span>
                    <span className={`font-medium ${getProgressColor(roadmap.progress)}`}>{roadmap.progress}%</span>
                  </div>
                  <Progress value={roadmap.progress} className="h-2" />
                </div>

                {topics.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Topics</span>
                      <span>
                        {completedTopics}/{topics.length} completed
                      </span>
                    </div>
                    <div className="space-y-1">
                      {topics.slice(0, 3).map((topic) => (
                        <div key={topic.id} className="flex items-center justify-between text-xs">
                          <span className="truncate flex-1 mr-2">{topic.title}</span>
                          <div className="flex items-center gap-2">
                            <span className={getProgressColor(topic.progress)}>{topic.progress}%</span>
                            <div className="w-16 bg-gray-200 rounded-full h-1">
                              <div
                                className="bg-primary h-1 rounded-full"
                                style={{ width: `${topic.progress}%` }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      ))}
                      {topics.length > 3 && (
                        <div className="text-xs text-muted-foreground">+{topics.length - 3} more topics</div>
                      )}
                    </div>
                  </div>
                )}

                {roadmap.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2">{roadmap.description}</p>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
