"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { TrendingUp, FileText, Plus, Tag, Users } from "lucide-react";
import type { EmailTemplate, TemplateStats } from "@/types";
import { TemplateService } from "@/services/templates";
import { TemplateUtils } from "@/lib/template-utils";
import { CATEGORY_METADATA } from "@/constants/email-const";
import { TemplateQuickPreview } from "./template-quick-preview";
import { useAuth } from "@/contexts/auth-context";

interface TemplateDashboardProps {
  onCreateNew?: () => void;
  onEditTemplate?: (template: EmailTemplate) => void;
  onPreviewTemplate?: (template: EmailTemplate) => void;
  className?: string;
}

export function TemplateDashboard({
  onCreateNew,
  onEditTemplate,
  onPreviewTemplate,
  className = "",
}: TemplateDashboardProps) {
  const { user } = useAuth();
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<TemplateStats | null>(null);

  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [user]);

  const loadDashboardData = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const userTemplates = await TemplateService.getUserTemplates(user.uid);
      setTemplates(userTemplates);
      setStats(TemplateUtils.calculateStats(userTemplates));
    } catch (error) {
      console.error("Error loading dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!stats) return null;

  const recentTemplates = templates
    .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
    .slice(0, 6);

  const categoryData = Object.entries(stats.templatesByCategory).map(
    ([category, count]) => ({
      name: category,
      value: count,
      color:
        CATEGORY_METADATA[
          category as keyof typeof CATEGORY_METADATA
        ]?.color.split(" ")[0] || "bg-gray-500",
    })
  );

  const chartData = Object.entries(stats.templatesByCategory).map(
    ([category, count]) => ({
      category:
        category.length > 10 ? category.substring(0, 10) + "..." : category,
      count,
    })
  );

  const COLORS = ["#0891b2", "#8b5cf6", "#10b981", "#f59e0b", "#6b7280"];

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">
            Overview of your email templates and activity
          </p>
        </div>

        {/* <Button onClick={onCreateNew} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          New Template
        </Button> */}
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total Templates
                </p>
                <p className="text-3xl font-bold text-foreground">
                  {stats.totalTemplates}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {stats.totalTemplates > 0 ? "Ready to use" : "Get started"}
                </p>
              </div>
              <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <FileText className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Categories
                </p>
                <p className="text-3xl font-bold text-foreground">
                  {Object.keys(stats.templatesByCategory).length}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Different types
                </p>
              </div>
              <div className="h-12 w-12 bg-secondary/10 rounded-lg flex items-center justify-center">
                <Tag className="h-6 w-6 text-secondary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Placeholders
                </p>
                <p className="text-3xl font-bold text-foreground">
                  {stats.mostUsedPlaceholders.length}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Unique variables
                </p>
              </div>
              <div className="h-12 w-12 bg-accent/10 rounded-lg flex items-center justify-center">
                <Users className="h-6 w-6 text-accent" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Recent Activity
                </p>
                <p className="text-3xl font-bold text-foreground">
                  {stats.recentlyUsed.length}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Recently updated
                </p>
              </div>
              <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Distribution Bar Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Templates by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="category" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#0891b2" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Category Distribution Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Category Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) =>
                    `${name} ${(percent || 0 * 100).toFixed(0)}%`
                  }
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Most Used Placeholders */}
      {stats.mostUsedPlaceholders.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Most Used Placeholders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {stats.mostUsedPlaceholders
                .slice(0, 10)
                .map((placeholder, index) => (
                  <div key={placeholder} className="text-center">
                    <div className="h-12 w-12 bg-muted rounded-lg flex items-center justify-center mx-auto mb-2">
                      <span className="text-lg font-bold text-muted-foreground">
                        #{index + 1}
                      </span>
                    </div>
                    <p className="text-sm font-medium text-foreground">
                      {placeholder}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {
                        templates.filter((t) =>
                          t.placeholders.includes(placeholder)
                        ).length
                      }{" "}
                      templates
                    </p>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Templates */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Recent Templates</CardTitle>
            <Button variant="outline" size="sm">
              View All
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {recentTemplates.length === 0 ? (
            <div className="text-center py-8">
              <div className="h-12 w-12 bg-muted rounded-lg flex items-center justify-center mx-auto mb-4">
                <FileText className="h-6 w-6 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                No templates yet
              </h3>
              <p className="text-muted-foreground mb-4">
                Create your first email template to get started
              </p>
              <Button onClick={onCreateNew}>
                <Plus className="h-4 w-4 mr-2" />
                Create Template
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {recentTemplates.map((template) => (
                <TemplateQuickPreview
                  key={template.id}
                  template={template}
                  onPreview={onPreviewTemplate}
                  onEdit={onEditTemplate}
                  className="h-full"
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
