"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import {
  MoreHorizontal,
  Edit,
  Trash2,
  Plus,
  ChevronDown,
  ChevronRight,
  BookOpen,
  FileText,
  Target,
  StickyNote,
  Check,
  ExternalLink,
} from "lucide-react"
import type { LearningItem } from "@/contexts/app-context"

interface LearningTreeProps {
  items: LearningItem[]
  roadmaps: LearningItem[]
  loading: boolean
  onEdit: (item: LearningItem) => void
  onDelete: (itemId: string) => void
  onCreateChild: (type: "roadmap" | "topic" | "subtopic" | "note", parent?: LearningItem) => void
  onToggleCompletion: (itemId: string, completed: boolean) => void
  onUpdateProgress: (itemId: string, progress: number) => void
}

export function LearningTree({
  items,
  roadmaps,
  loading,
  onEdit,
  onDelete,
  onCreateChild,
  onToggleCompletion,
  onUpdateProgress,
}: LearningTreeProps) {
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set())

  const toggleExpanded = (itemId: string) => {
    setExpandedItems((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(itemId)) {
        newSet.delete(itemId)
      } else {
        newSet.add(itemId)
      }
      return newSet
    })
  }

  const getChildItems = (parentId: string) => {
    return items.filter((item) => item.parentId === parentId)
  }

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

  const getTypeColor = (type: string) => {
    switch (type) {
      case "roadmap":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
      case "topic":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
      case "subtopic":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300"
      case "note":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
    }
  }

  const getChildType = (parentType: string): "topic" | "subtopic" | "note" => {
    switch (parentType) {
      case "roadmap":
        return "topic"
      case "topic":
        return "subtopic"
      case "subtopic":
        return "note"
      default:
        return "note"
    }
  }

  const renderLearningItem = (item: LearningItem, level = 0) => {
    const children = getChildItems(item.id)
    const hasChildren = children.length > 0
    const isExpanded = expandedItems.has(item.id)
    const childType = getChildType(item.type)

    return (
      <div key={item.id} className={`${level > 0 ? "ml-6 border-l-2 border-muted pl-4" : ""}`}>
        <Card className="mb-4">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3 flex-1">
                {hasChildren && (
                  <Collapsible open={isExpanded} onOpenChange={() => toggleExpanded(item.id)}>
                    <CollapsibleTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-6 w-6 p-0">
                        {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                      </Button>
                    </CollapsibleTrigger>
                  </Collapsible>
                )}

                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    {getTypeIcon(item.type)}
                    <CardTitle className="text-lg">{item.title}</CardTitle>
                    <Badge className={getTypeColor(item.type)}>{item.type}</Badge>
                    {item.completed && <Check className="h-4 w-4 text-green-600" />}
                  </div>

                  {item.description && <p className="text-sm text-muted-foreground">{item.description}</p>}

                  {/* Progress */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>Progress</span>
                      <span>{item.progress}%</span>
                    </div>
                    <Progress value={item.progress} className="h-2" />
                  </div>

                  {/* Resources */}
                  {item.resources && item.resources.length > 0 && (
                    <div className="space-y-1">
                      <span className="text-sm font-medium">Resources:</span>
                      <div className="flex flex-wrap gap-2">
                        {item.resources.map((resource, index) => (
                          <Button
                            key={index}
                            variant="outline"
                            size="sm"
                            className="h-6 text-xs bg-transparent"
                            onClick={() => {
                              if (resource.startsWith("http")) {
                                window.open(resource, "_blank")
                              }
                            }}
                          >
                            <ExternalLink className="h-3 w-3 mr-1" />
                            Resource {index + 1}
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onToggleCompletion(item.id, !item.completed)}
                  className={item.completed ? "bg-green-100 text-green-800" : ""}
                >
                  {item.completed ? "Completed" : "Mark Complete"}
                </Button>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onEdit(item)}>
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </DropdownMenuItem>
                    {item.type !== "note" && (
                      <DropdownMenuItem onClick={() => onCreateChild(childType, item)}>
                        <Plus className="mr-2 h-4 w-4" />
                        Add {childType}
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem onClick={() => onDelete(item.id)} className="text-red-600">
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </CardHeader>

          {hasChildren && (
            <Collapsible open={isExpanded}>
              <CollapsibleContent>
                <CardContent className="pt-0">
                  {children.map((child) => renderLearningItem(child, level + 1))}
                </CardContent>
              </CollapsibleContent>
            </Collapsible>
          )}
        </Card>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="animate-pulse space-y-3">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                <div className="h-2 bg-gray-200 rounded"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (roadmaps.length === 0) {
    return (
      <Card>
        <CardContent className="p-12">
          <div className="text-center space-y-4">
            <BookOpen className="h-12 w-12 text-muted-foreground mx-auto" />
            <div>
              <h3 className="text-lg font-medium text-muted-foreground">No learning roadmaps found</h3>
              <p className="text-sm text-muted-foreground mt-2">
                Create your first roadmap to start organizing your learning journey.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return <div className="space-y-4">{roadmaps.map((roadmap) => renderLearningItem(roadmap))}</div>
}
