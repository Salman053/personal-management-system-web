"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon, Filter, X } from 'lucide-react';
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import {  FinanceRecord } from "@/types/index";

interface AdvancedFiltersProps {
  filters: any;
  onFiltersChange: (filters: any) => void;
  transactions: FinanceRecord[];
}

export function AdvancedFilters({
  filters,
  onFiltersChange,
  transactions,
}: AdvancedFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Get unique categories and mediums from transactions
  const categories = Array.from(new Set(transactions.map(t => t.category))).filter(Boolean);
  const mediums = Array.from(new Set(transactions.map(t => t.medium))).filter(Boolean);
  const years = Array.from(new Set(transactions.map(t => new Date(t.date).getFullYear()))).sort((a, b) => b - a);

  const updateFilters = (updates: Partial<any>) => {
    onFiltersChange({ ...filters, ...updates });
  };

  const clearFilters = () => {
    onFiltersChange({
      search: "",
      type: "all",
      category: "all",
      medium: "all",
      dateFilter: { from: null, to: null, year: null },
    });
  };

  const hasActiveFilters = 
    filters.search ||
    filters.type !== "all" ||
    filters.category !== "all" ||
    filters.medium !== "all" ||
    filters.dateFilter.from ||
    filters.dateFilter.to ||
    filters.dateFilter.year;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Advanced Filters
          </CardTitle>
          <div className="flex items-center gap-2">
            {hasActiveFilters && (
              <Button
                variant="outline"
                size="sm"
                onClick={clearFilters}
                className="h-8"
              >
                <X className="h-4 w-4 mr-1" />
                Clear
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="h-8"
            >
              {isExpanded ? "Collapse" : "Expand"}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search - Always visible */}
        <div className="space-y-2">
          <Label htmlFor="search">Search</Label>
          <Input
            id="search"
            placeholder="Search by description, category, or counterparty..."
            value={filters.search}
            onChange={(e) => updateFilters({ search: e.target.value })}
          />
        </div>

        {/* Quick Type Filter - Always visible */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
          {["all", "Income", "Expense", "Borrowed", "Lent"].map((type) => (
            <Button
              key={type}
              variant={filters.type === type ? "default" : "outline"}
              size="sm"
              onClick={() => updateFilters({ type: type as any })}
              className="capitalize"
            >
              {type}
            </Button>
          ))}
        </div>

        {/* Expanded Filters */}
        {isExpanded && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 pt-4 border-t">
            {/* Category Filter */}
            <div className="space-y-2">
              <Label>Category</Label>
              <Select
                value={filters.category}
                onValueChange={(value) => updateFilters({ category: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Medium Filter */}
            <div className="space-y-2">
              <Label>Payment Medium</Label>
              <Select
                value={filters.medium}
                onValueChange={(value) => updateFilters({ medium: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Mediums" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Mediums</SelectItem>
                  {mediums.map((medium) => (
                    <SelectItem key={medium} value={medium}>
                      {medium}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Year Filter */}
            <div className="space-y-2">
              <Label>Year</Label>
              <Select
                value={filters.dateFilter.year?.toString() || "all"}
                onValueChange={(value) =>
                  updateFilters({
                    dateFilter: {
                      ...filters.dateFilter,
                      year: value === "all" ? null : parseInt(value),
                    },
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Years" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Years</SelectItem>
                  {years.map((year) => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Date Range */}
            <div className="space-y-2 md:col-span-2">
              <Label>Date Range</Label>
              <div className="flex gap-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "flex-1 justify-start text-left font-normal",
                        !filters.dateFilter.from && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {filters.dateFilter.from ? (
                        format(filters.dateFilter.from, "PPP")
                      ) : (
                        <span>From date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={filters.dateFilter.from || undefined}
                      onSelect={(date) =>
                        updateFilters({
                          dateFilter: { ...filters.dateFilter, from: date || null },
                        })
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>

                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "flex-1 justify-start text-left font-normal",
                        !filters.dateFilter.to && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {filters.dateFilter.to ? (
                        format(filters.dateFilter.to, "PPP")
                      ) : (
                        <span>To date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={filters.dateFilter.to || undefined}
                      onSelect={(date) =>
                        updateFilters({
                          dateFilter: { ...filters.dateFilter, to: date || null },
                        })
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
