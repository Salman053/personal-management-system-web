"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  BookOpen,
  Loader2,
  Clock,
  Target,
  AlertCircle,
  CheckCircle2,
  Star,
} from "lucide-react";
import { learningService } from "@/services/learning";
import { useAuth } from "@/contexts/auth-context";
import { getPredefinedTemplates } from "@/constants";
import { toast } from "sonner";



interface TemplateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onTemplateSelected: () => void;
}

interface Template {
  id: string;
  title: string;
  description: string;
  difficulty: string;
  estimatedDuration: string;
  category: string;
  featured: boolean;
  resources:[]
  topics: {
    title: string;
    subtopics: string[];
  }[];
}

export function TemplateDialog({
  open,
  onOpenChange,
  onTemplateSelected,
}: TemplateDialogProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const templates = getPredefinedTemplates();
  const categories = [
    "all",
    ...Array.from(new Set(templates.map((t) => t.category))),
  ];

  const filteredTemplates =
    selectedCategory === "all"
      ? templates
      : templates.filter((t) => t.category === selectedCategory);

  const handleSelectTemplate = async (template: Template) => {
    if (!user) return;

    setLoading(template.id);
    setError(null);
    setSuccess(null);

    try {
      // Create the roadmap
      const roadmapId = await learningService.createLearningItem(user.uid, {
        title: template.title,
        description: template.description,
        type: "roadmap",
        progress: 0,
        completed: false,
        resources: template.resources,
        tags: [
          template.category.toLowerCase(),
          template.difficulty.toLowerCase(),
        ],
        userId: user.uid,
        priority: "high",
      });

      // Create topics with slight delays for better UX
      for (const [topicIndex, topic] of template.topics.entries()) {
        const topicId = await learningService.createLearningItem(user.uid, {
          title: topic.title,
          description: "",
          type: "topic",
          parentId: roadmapId,
          progress: 0,
          completed: false,
          resources: [],
          tags: [],
          priority: "medium",
          userId: user.uid,
        });

        // Create subtopics
        for (const [subtopicIndex, subtopic] of topic.subtopics.entries()) {
          await learningService.createLearningItem(user.uid, {
            title: subtopic,
            description: "",
            type: "subtopic",
            parentId: topicId,
            progress: 0,
            completed: false,
            resources: [],
            tags: [],
            userId: user.uid,

            priority: "medium",
          });
        }
      }

      toast.success(`"${template.title}" roadmap created successfully!`);

      setTimeout(() => {
        onTemplateSelected();
        onOpenChange(false);
      }, 1500);
    } catch (error) {
      console.error("Error creating template:", error);
      toast.error("Failed to create roadmap. Please try again.");
    } finally {
      setLoading(null);
      
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case "beginner":
        return "bg-green-100 text-green-800 border-green-200";
      case "intermediate":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "advanced":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[900px] max-h-[85vh] overflow-y-auto">
        <DialogHeader className="space-y-3">
          <DialogTitle className="text-2xl">
            Choose a Learning Template
          </DialogTitle>
          <DialogDescription className="text-base">
            Select a predefined learning roadmap to get started quickly. Each
            template includes structured topics, subtopics, and recommended
            learning paths.
          </DialogDescription>
        </DialogHeader>

        {/* Success/Error Messages */}
    

        {/* Category Filter */}
        <div className="flex flex-wrap gap-2 p-4 bg-background rounded-lg">
          {categories.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(category)}
              className="capitalize"
            >
              {category === "all" ? "All Categories" : category}
            </Button>
          ))}
        </div>

        {/* Templates Grid */}
        <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
          {filteredTemplates.map((template) => (
            <Card
              key={template.id}
              className="relative hover:shadow-lg transition-shadow duration-200"
            >
              {template.featured && (
                <div className="absolute -top-2 -right-2">
                  <Badge className="bg-yellow-500 text-white">
                    <Star className="h-3 w-3 mr-1" />
                    Featured
                  </Badge>
                </div>
              )}

              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-2 flex-1">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <BookOpen className="h-5 w-5 text-blue-600" />
                      {template.title}
                    </CardTitle>
                    <CardDescription className="text-sm leading-relaxed">
                      {template.description}
                    </CardDescription>
                  </div>
                </div>

                {/* Metadata */}
                <div className="flex flex-wrap gap-2 pt-2">
                  <Badge
                    variant="outline"
                    className={getDifficultyColor(template.difficulty)}
                  >
                    {template.difficulty}
                  </Badge>
                  <Badge
                    variant="outline"
                    className="bg-blue-50 text-blue-700 border-blue-200"
                  >
                    <Clock className="h-3 w-3 mr-1" />
                    {template.estimatedDuration}
                  </Badge>
                  <Badge
                    variant="outline"
                    className="bg-purple-50 text-purple-700 border-purple-200"
                  >
                    {template.category}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Topics Preview */}
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold flex items-center gap-1">
                    <Target className="h-4 w-4" />
                    Learning Path ({template.topics.length} topics)
                  </h4>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {template.topics.map((topic, index) => (
                      <div
                        key={index}
                        className="text-sm border-l-2 border-gray-200 pl-3"
                      >
                        <div className="font-medium text-gray-900">
                          {topic.title}
                        </div>
                        <div className="text-gray-600 text-xs mt-1">
                          {topic.subtopics.slice(0, 2).join(", ")}
                          {topic.subtopics.length > 2 && (
                            <span className="text-gray-500">
                              {" "}
                              +{topic.subtopics.length - 2} more
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action Button */}
                <Button
                  onClick={() => handleSelectTemplate(template as any)}
                  disabled={loading !== null}
                  className="w-full"
                  size="sm"
                >
                  {loading === template.id && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {loading === template.id
                    ? "Creating Roadmap..."
                    : "Use This Template"}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {filteredTemplates.length === 0 && (
          <div className="text-center py-12">
            <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No templates found
            </h3>
            <p className="text-gray-600">
              No templates match the selected category. Try selecting a
              different category.
            </p>
          </div>
        )}

        {/* Footer Info */}
        <div className="bg-background p-4 rounded-lg text-sm text-blue-800">
          <p className="font-medium mb-1">💡 Pro Tip:</p>
          <p>
            After selecting a template, you can customize all topics, add your
            own resources, set due dates, and track your progress. Templates are
            just a starting point!
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
