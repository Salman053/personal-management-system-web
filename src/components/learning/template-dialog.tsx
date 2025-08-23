"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useAuth } from "@/contexts/auth-context"
import { learningService } from "@/services/learning"
import { BookOpen, Loader2 } from "lucide-react"

interface TemplateDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onTemplateSelected: () => void
}

export function TemplateDialog({ open, onOpenChange, onTemplateSelected }: TemplateDialogProps) {
  const { user } = useAuth()
  const [loading, setLoading] = useState<string | null>(null)

  const templates = learningService.getPredefinedTemplates()

  const handleSelectTemplate = async (template: any) => {
    if (!user) return

    setLoading(template.title)
    try {
      // Create the roadmap
      const roadmapId = await learningService.createLearningItem(user.uid, {
        title: template.title,
        description: template.description,
        type: "roadmap",
        progress: 0,
        completed: false,
        resources: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      } as any)

      // Create topics
      for (const topic of template.topics) {
        const topicId = await learningService.createLearningItem(user.uid, {
          title: topic.title,
          description: "",
          type: "topic",
          parentId: roadmapId,
          progress: 0,
          completed: false,
          resources: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        } as any)

        // Create subtopics
        for (const subtopic of topic.subtopics) {
          await learningService.createLearningItem(user.uid, {
            title: subtopic,
            description: "",
            type: "subtopic",
            parentId: topicId,
            progress: 0,
            completed: false,
            resources: [],
            createdAt: new Date(),
            updatedAt: new Date(),
          } as any)
        }
      }

      onTemplateSelected()
    } catch (error) {
      console.error("Error creating template:", error)
    } finally {
      setLoading(null)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Choose a Learning Template</DialogTitle>
          <DialogDescription>
            Select a predefined learning roadmap to get started quickly. You can customize it after creation.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 md:grid-cols-1">
          {templates.map((template) => (
            <Card key={template.title} className="cursor-pointer hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1 flex-1">
                    <CardTitle className="flex items-center gap-2">
                      <BookOpen className="h-5 w-5" />
                      {template.title}
                    </CardTitle>
                    <CardDescription>{template.description}</CardDescription>
                  </div>
                  <Button
                    onClick={() => handleSelectTemplate(template)}
                    disabled={loading === template.title}
                    size="sm"
                  >
                    {loading === template.title && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Use Template
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Includes:</h4>
                  <div className="grid gap-2">
                    {template.topics.map((topic, index) => (
                      <div key={index} className="text-sm">
                        <div className="font-medium">{topic.title}</div>
                        <div className="text-muted-foreground ml-2">
                          {topic.subtopics.slice(0, 3).join(", ")}
                          {topic.subtopics.length > 3 && ` +${topic.subtopics.length - 3} more`}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}
