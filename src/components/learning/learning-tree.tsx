"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  ChevronDown,
  ChevronRight,
  BookOpen,
  Target,
  FileText,
  StickyNote,
  Check,
  ExternalLink,
  Edit,
  Trash2,
  Plus,
} from "lucide-react";
import { LearningItem } from "@/types";
import { ActionMenu } from "../ui/action-menu";

interface LearningTreeProps {
  items?: LearningItem[];
  roadmaps?: LearningItem[];
  loading: boolean;
  onEdit: (item: LearningItem) => void;
  onDelete: (itemId: string) => void;
  onCreateChild: (
    type: "roadmap" | "topic" | "subtopic" | "note",
    parent?: LearningItem
  ) => void;
  onToggleCompletion: (itemId: string, completed: boolean) => void;
  onUpdateProgress: (itemId: string, progress: number) => void;
}

export function LearningTree({
  items,
  roadmaps,
  loading,
  onEdit,
  onDelete,
  onCreateChild,
  onToggleCompletion,
}: LearningTreeProps) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const toggle = (id: string) => {
    setExpanded((prev) => {
      const copy = new Set(prev);
      copy.has(id) ? copy.delete(id) : copy.add(id);
      return copy;
    });
  };

  const getChildren = (id: string) =>
    items?.filter((item) => item.parentId === id) ?? [];

  const getIcon = (type: string) => {
    switch (type) {
      case "roadmap":
        return <BookOpen className="h-5 w-5 text-blue-500" />;
      case "topic":
        return <Target className="h-5 w-5 text-green-500" />;
      case "subtopic":
        return <FileText className="h-5 w-5 text-purple-500" />;
      case "note":
        return <StickyNote className="h-5 w-5 text-orange-500" />;
      default:
        return <FileText className="h-5 w-5" />;
    }
  };

  const getNextType = (type: string): "topic" | "subtopic" | "note" => {
    if (type === "roadmap") return "topic";
    if (type === "topic") return "subtopic";
    return "note";
  };

  const renderItem = (item: LearningItem, level = 0) => {
    const children = getChildren(item.id);
    const hasChildren = children.length > 0;
    const open = expanded.has(item.id);
    const nextType = getNextType(item.type);

    return (
      <motion.div
        key={item.id}
        layout
        className={`relative mb-6 ${
          level > 0 ? "ml-8 pl-6 border-l border-muted" : ""
        }`}
      >
        <Card className="group shadow-md rounded-2xl border border-muted-foreground/10 hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-white/90 to-gray-50 dark:from-gray-900/80 dark:to-gray-800">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              {/* Left Section */}
              <div className="flex items-start gap-3 flex-1">
                {hasChildren && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => toggle(item.id)}
                    className="h-7 w-7 rounded-full hover:bg-accent"
                  >
                    {open ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </Button>
                )}

                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    {getIcon(item.type)}
                    <CardTitle className="text-lg font-semibold">
                      {item.title}
                    </CardTitle>
                    <Badge variant="secondary" className="text-xs">
                      {item.type}
                    </Badge>
                    {item.completed && (
                      <Check className="h-4 w-4 text-green-600" />
                    )}
                  </div>

                  {item.description && (
                    <p className="text-sm text-muted-foreground">
                      {item.description}
                    </p>
                  )}

                  {item.type !== "note" && (
                    <div className="flex items-center gap-3 mt-2">
                      <Progress
                        value={item.completed ? 100 : item.progress ?? 0}
                        className="h-2 flex-1 rounded-full"
                      />
                      <span className="text-xs font-medium w-12 text-right">
                        {item.completed ? "100%" : `${item.progress ?? 0}%`}
                      </span>
                    </div>
                  )}

                  {/* Resources */}
                  {item.resources?.length ? (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {item.resources.map((r, i) => (
                        <Button
                          key={i}
                          size="sm"
                          variant="outline"
                          className="h-7 text-xs"
                          onClick={() => window.open(r.url, "_blank")}
                        >
                          <ExternalLink className="h-3 w-3 mr-1" />
                          Resource {i + 1}
                        </Button>
                      ))}
                    </div>
                  ) : null}
                </div>
              </div>

              {/* Inline Actions */}
              <div className="opacity-0 group-hover:opacity-100 flex gap-2 transition">
                {item.type !== "note" && (
                  <Button
                    size="sm"
                    variant={item.completed ? "default" : "outline"}
                    onClick={() => onToggleCompletion(item.id, !item.completed)}
                    className="rounded-full"
                  >
                    {item.completed ? "✓ Done" : "Complete"}
                  </Button>
                )}
                {item.type !== "note" && (
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => onCreateChild(nextType, item)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                )}
               

                <ActionMenu item={item} onDelete={onDelete} onEdit={onEdit}  />
              </div>
            </div>
          </CardHeader>

          {/* Animated Children */}
          <AnimatePresence>
            {hasChildren && open && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.25 }}
              >
                <CardContent className="pl-6">
                  {children.map((child) => renderItem(child, level + 1))}
                </CardContent>
              </motion.div>
            )}
          </AnimatePresence>
        </Card>
      </motion.div>
    );
  };

  if (roadmaps?.length) {
    return (
      <div className="space-y-8">{roadmaps.map((r) => renderItem(r))}</div>
    );
  }

  if (items?.length) {
    return <div className="space-y-8">{items.map((r) => renderItem(r))}</div>;
  }

  return null;
}
