"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Search,
  Grid3X3,
  List,
  Plus,
  Trash2,
  Copy,
  Share,
  MoreHorizontal,
  Eye,
  Edit,
  ExternalLink,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { TemplateQuickPreview } from "./template-quick-preview";
import { EmailTemplate, TemplateCategory } from "@/types";
import { useAuth } from "@/contexts/auth-context";
import { toast } from "sonner";
import { TemplateService } from "@/services/templates";
import { TemplateUtils } from "@/lib/template-utils";
import { CATEGORY_METADATA } from "@/constants/email-const";

type ViewMode = "grid" | "list";
type SortField = "title" | "category" | "updatedAt" | "createdAt";
type SortOrder = "asc" | "desc";

interface TemplateListProps {
  onCreateNew?: () => void;
  onEditTemplate?: (template: EmailTemplate) => void;
  onPreviewTemplate?: (template: EmailTemplate) => void;
  onShareTemplate?: (template: EmailTemplate) => void;
  className?: string;
}

export function TemplateList({
  onCreateNew,
  onEditTemplate,
  onPreviewTemplate,
  onShareTemplate,
  className = "",
}: TemplateListProps) {
  const { user } = useAuth();
  const router = useRouter();

  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<
    TemplateCategory | "all"
  >("all");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [sortField, setSortField] = useState<SortField>("updatedAt");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [selectedTemplates, setSelectedTemplates] = useState<Set<string>>(
    new Set()
  );
  const [showFilters, setShowFilters] = useState(false);

  // Load templates
  useEffect(() => {
    if (user) {
      loadTemplates();
    }
  }, [user]);

  const loadTemplates = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const userTemplates = await TemplateService.getUserTemplates(user.uid);
      setTemplates(userTemplates);
    } catch (error) {
      console.error("Error loading templates:", error);
      toast.error("Failed to load templates. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Filter and sort templates
  const filteredAndSortedTemplates = useMemo(() => {
    let filtered = templates;

    // Apply search filter
    if (searchQuery.trim()) {
      filtered = TemplateUtils.searchTemplates(templates, searchQuery);
    }

    // Apply category filter
    if (selectedCategory !== "all") {
      filtered = filtered.filter(
        (template) => template.category === selectedCategory
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue: any = a[sortField];
      let bValue: any = b[sortField];

      if (sortField === "updatedAt" || sortField === "createdAt") {
        aValue = aValue.getTime();
        bValue = bValue.getTime();
      } else {
        aValue = aValue.toString().toLowerCase();
        bValue = bValue.toString().toLowerCase();
      }

      if (sortOrder === "asc") {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

    return filtered;
  }, [templates, searchQuery, selectedCategory, sortField, sortOrder]);

  // Template statistics
  const stats = useMemo(() => {
    return TemplateUtils.calculateStats(templates);
  }, [templates]);

  const handleSelectTemplate = (templateId: string, selected: boolean) => {
    const newSelected = new Set(selectedTemplates);
    if (selected) {
      newSelected.add(templateId);
    } else {
      newSelected.delete(templateId);
    }
    setSelectedTemplates(newSelected);
  };

  const handleSelectAll = (selected: boolean) => {
    if (selected) {
      setSelectedTemplates(
        new Set(filteredAndSortedTemplates.map((t) => t.id))
      );
    } else {
      setSelectedTemplates(new Set());
    }
  };

  const handleDeleteTemplate = async (template: EmailTemplate) => {
    if (!user) return;

    if (
      !confirm(
        `Are you sure you want to delete "${template.title}"? This action cannot be undone.`
      )
    ) {
      return;
    }

    try {
      await TemplateService.deleteTemplate(user.uid, template.id);
      setTemplates((prev) => prev.filter((t) => t.id !== template.id));
      setSelectedTemplates((prev) => {
        const newSelected = new Set(prev);
        newSelected.delete(template.id);
        return newSelected;
      });
      toast(`"${template.title}" has been deleted successfully.`);
    } catch (error) {
      console.error("Error deleting template:", error);
      toast.error("Failed to delete template. Please try again.");
    }
  };

  const handleDuplicateTemplate = async (template: EmailTemplate) => {
    if (!user) return;

    try {
      const duplicatedId = await TemplateService.duplicateTemplate(
        user.uid,
        template.id
      );
      const duplicatedTemplate = await TemplateService.getTemplate(
        user.uid,
        duplicatedId
      );
      if (duplicatedTemplate) {
        setTemplates((prev) => [duplicatedTemplate, ...prev]);
        toast(`"${template.title}" has been duplicated successfully.`);
      }
    } catch (error) {
      console.error("Error duplicating template:", error);
      toast.error("Failed to duplicate template. Please try again.");
    }
  };

  const handleBulkDelete = async () => {
    if (!user || selectedTemplates.size === 0) return;

    if (
      !confirm(
        `Are you sure you want to delete ${selectedTemplates.size} templates? This action cannot be undone.`
      )
    ) {
      return;
    }

    try {
      await Promise.all(
        Array.from(selectedTemplates).map((templateId) =>
          TemplateService.deleteTemplate(user.uid, templateId)
        )
      );

      setTemplates((prev) => prev.filter((t) => !selectedTemplates.has(t.id)));
      setSelectedTemplates(new Set());

      toast(
        `${selectedTemplates.size} templates have been deleted successfully.`
      );
    } catch (error) {
      console.error("Error deleting templates:", error);
      toast.error("Failed to delete some templates. Please try again.");
    }
  };

  const handleViewTemplate = (template: EmailTemplate) => {
    router.push(`/template/${template.id}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading templates...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Email Templates
          </h1>
          <p className="text-muted-foreground">
            {stats.totalTemplates} templates • {selectedTemplates.size} selected
          </p>
        </div>

        <Button onClick={onCreateNew} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          New Template
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total Templates
                </p>
                <p className="text-2xl font-bold text-foreground">
                  {stats.totalTemplates}
                </p>
              </div>
              <div className="h-8 w-8 bg-primary/10 rounded-lg flex items-center justify-center">
                <List className="h-4 w-4 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        {Object.entries(stats.templatesByCategory).map(([category, count]) => {
          const metadata = CATEGORY_METADATA[category as TemplateCategory];
          return (
            <Card key={category}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      {category}
                    </p>
                    <p className="text-2xl font-bold text-foreground">
                      {count}
                    </p>
                  </div>
                  <div
                    className={`h-8 w-8 rounded-lg flex items-center justify-center ${metadata.color}`}
                  >
                    <span className="text-sm">{metadata.icon}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search templates by title, content, or tags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Category Filter */}
            <Select
              value={selectedCategory}
              onValueChange={(value: TemplateCategory | "all") =>
                setSelectedCategory(value)
              }
            >
              <SelectTrigger className="w-full lg:w-48">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {Object.entries(CATEGORY_METADATA).map(([key, metadata]) => (
                  <SelectItem key={key} value={key}>
                    <div className="flex items-center gap-2">
                      <span>{metadata.icon}</span>
                      <span>{metadata.category}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Sort */}
            <Select
              value={`${sortField}-${sortOrder}`}
              onValueChange={(value) => {
                const [field, order] = value.split("-");
                setSortField(field as SortField);
                setSortOrder(order as SortOrder);
              }}
            >
              <SelectTrigger className="w-full lg:w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="updatedAt-desc">Recently Updated</SelectItem>
                <SelectItem value="updatedAt-asc">Oldest Updated</SelectItem>
                <SelectItem value="createdAt-desc">Recently Created</SelectItem>
                <SelectItem value="createdAt-asc">Oldest Created</SelectItem>
                <SelectItem value="title-asc">Title A-Z</SelectItem>
                <SelectItem value="title-desc">Title Z-A</SelectItem>
                <SelectItem value="category-asc">Category A-Z</SelectItem>
              </SelectContent>
            </Select>

            {/* View Mode */}
            <div className="flex items-center gap-1 border rounded-lg p-1">
              <Button
                variant={viewMode === "grid" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("grid")}
                className="h-8 w-8 p-0"
              >
                <Grid3X3 className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("list")}
                className="h-8 w-8 p-0"
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Bulk Actions */}
          {selectedTemplates.size > 0 && (
            <>
              <Separator className="my-4" />
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Checkbox
                    checked={
                      selectedTemplates.size ===
                      filteredAndSortedTemplates.length
                    }
                    onCheckedChange={handleSelectAll}
                  />
                  <span className="text-sm text-muted-foreground">
                    {selectedTemplates.size} of{" "}
                    {filteredAndSortedTemplates.length} selected
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleBulkDelete}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Selected
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Templates Grid/List */}
      {filteredAndSortedTemplates.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <div className="max-w-md mx-auto">
              <div className="h-12 w-12 bg-muted rounded-lg flex items-center justify-center mx-auto mb-4">
                <Search className="h-6 w-6 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                No templates found
              </h3>
              <p className="text-muted-foreground mb-4">
                {searchQuery || selectedCategory !== "all"
                  ? "Try adjusting your search or filters"
                  : "Create your first email template to get started"}
              </p>
              {!searchQuery && selectedCategory === "all" && (
                <Button onClick={onCreateNew}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Template
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div
          className={
            viewMode === "grid"
              ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              : "space-y-4"
          }
        >
          {filteredAndSortedTemplates.map((template) => (
            <div key={template.id} className="relative">
              {/* Selection Checkbox */}
              <div className="absolute top-3 left-3 z-10">
                <Checkbox
                  checked={selectedTemplates.has(template.id)}
                  onCheckedChange={(checked) =>
                    handleSelectTemplate(template.id, checked as boolean)
                  }
                  className="bg-background border-2"
                />
              </div>

              {viewMode === "grid" ? (
                <TemplateQuickPreview
                  template={template}
                  onPreview={onPreviewTemplate}
                  onEdit={onEditTemplate}
                  onDuplicate={() => handleDuplicateTemplate(template)}
                  onDelete={() => handleDeleteTemplate(template)}
                  className="ml-8"
                />
              ) : (
                <Card
                  className="ml-8 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => handleViewTemplate(template)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 min-w-0 flex-1">
                        <div
                          className={`w-3 h-3 rounded-full flex-shrink-0 ${CATEGORY_METADATA[template.category].color.split(" ")[0]}`}
                        />
                        <div className="min-w-0 flex-1">
                          <h3 className="font-semibold text-foreground truncate">
                            {template.title}
                          </h3>
                          <p className="text-sm text-muted-foreground truncate">
                            {template.subject}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            {template.category}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {template.type}
                          </Badge>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 ml-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewTemplate(template);
                          }}
                          title="View template details"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            onPreviewTemplate?.(template);
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            onEditTemplate?.(template);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => handleDuplicateTemplate(template)}
                            >
                              <Copy className="h-4 w-4 mr-2" />
                              Duplicate
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => onShareTemplate?.(template)}
                            >
                              <Share className="h-4 w-4 mr-2" />
                              Share
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDeleteTemplate(template)}
                              className="text-destructive"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
