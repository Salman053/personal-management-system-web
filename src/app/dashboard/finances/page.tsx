"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Plus,
  TrendingUp,
  TrendingDown,
  DollarSign,
  CreditCard,
} from "lucide-react";
import { IncomeManager } from "@/components/finances/income-manager";
import { ExpenseManager } from "@/components/finances/expense-manager";
import LendingManager from "@/components/finances/lending-manager";
import { TransactionsTable } from "@/components/finances/transactions-table";
import { FinancialCharts } from "@/components/finances/financial-charts";
import { FinanceRecord } from "@/types";
import { useMainContext } from "@/contexts/app-context";
import { AdvancedFilters } from "@/components/finances/advance-filter";
import { useAuth } from "@/contexts/auth-context";
import { financeServices } from "@/services/transactions";
import { toast } from "sonner";
import { useModalState } from "@/hooks/use-modal-state";
import ConfirmDialog from "@/components/system/confirm-dialog";
import FinanceRecordDialog from "@/components/finances/finance-dialog";

interface DateFilter {
  from: Date | null;
  to: Date | null;
  year: number | null;
}

interface Filters {
  search: string;
  type: string;
  category: string;
  medium: string;
  dateFilter: DateFilter;
}

export default function FinancesPage() {
  const { finances, loading } = useMainContext();
  const [recordType, setRecordType] = useState("");
  const [activeTab, setActiveTab] = useState("overview");
  const [deletingRecord, setDeletingRecord] = useState("");
  const [editingRecord, setEditingRecord] = useState<FinanceRecord | null>(
    null
  );
  const { modalState, toggleModal, closeModal, openModal } = useModalState({
    isDeletingRecordModalOpen: false,
    isFinanceDialogOpen: false,
  });
  const [filters, setFilters] = useState<Filters>({
    search: "",
    type: "all",
    category: "all",
    medium: "all",
    dateFilter: { from: null, to: null, year: null },
  });

  // Parse filter dates once when filters change
  const parsedFilterDates = useMemo(() => {
    return {
      from: filters.dateFilter.from ? new Date(filters.dateFilter.from) : null,
      to: filters.dateFilter.to ? new Date(filters.dateFilter.to) : null,
      year: filters.dateFilter.year,
    };
  }, [filters.dateFilter]);

  // Filter transactions based on current filters
  const filteredTransactions = useMemo(() => {
    return finances.filter((transaction: FinanceRecord) => {
      const matchesSearch =
        !filters.search ||
        transaction.description
          ?.toLowerCase()
          .includes(filters.search.toLowerCase()) ||
        transaction.category
          .toLowerCase()
          .includes(filters.search.toLowerCase()) ||
        (transaction.counterparty &&
          transaction.counterparty
            .toLowerCase()
            .includes(filters.search.toLowerCase()));

      const matchesType =
        filters.type === "all" || transaction.type === filters.type;
      const matchesCategory =
        filters.category === "all" || transaction.category === filters.category;
      const matchesMedium =
        filters.medium === "all" || transaction.medium === filters.medium;

      const transactionDate = new Date(transaction.date);
      const matchesDateRange =
        (!parsedFilterDates.from ||
          transactionDate >= parsedFilterDates.from) &&
        (!parsedFilterDates.to || transactionDate <= parsedFilterDates.to);

      const matchesYear =
        !parsedFilterDates.year ||
        transactionDate.getFullYear() === parsedFilterDates.year;

      return (
        matchesSearch &&
        matchesType &&
        matchesCategory &&
        matchesMedium &&
        matchesDateRange &&
        matchesYear
      );
    });
  }, [finances, filters, parsedFilterDates]);

  // Calculate totals
  const totals = useMemo(() => {
    const incomeTransactions = filteredTransactions.filter(
      (t: FinanceRecord) => t.type === "Income"
    );
    const expenseTransactions = filteredTransactions.filter(
      (t: FinanceRecord) => t.type === "Expense"
    );
    const borrowedTransactions = filteredTransactions.filter(
      (t: FinanceRecord) => t.type === "Borrowed"
    );
    const lentTransactions = filteredTransactions.filter(
      (t: FinanceRecord) => t.type === "Lent"
    );

    return {
      income: incomeTransactions.reduce(
        (sum: number, t: FinanceRecord) => sum + Number(t.amount),
        0
      ),
      expenses: expenseTransactions.reduce(
        (sum: number, t: FinanceRecord) => sum + Number(t.amount),
        0
      ),
      borrowed: borrowedTransactions.reduce(
        (sum: number, t: FinanceRecord) => sum + Number(t.amount),
        0
      ),
      lent: lentTransactions.reduce(
        (sum: number, t: FinanceRecord) => sum + Number(t.amount),
        0
      ),
      incomeCount: incomeTransactions.length,
      expenseCount: expenseTransactions.length,
    };
  }, [filteredTransactions]);

  const netWorth =
    totals.income - totals.expenses + totals.lent - totals.borrowed;

  const handleAddTransaction = (
    type: "Income" | "Lent" | "Borrowed" | "Expense"
  ) => {
    setEditingRecord(null);
    setRecordType(type);
    openModal("isFinanceDialogOpen");
  };

  const handleEditTransaction = async (transaction: FinanceRecord) => {
    setEditingRecord(transaction);
    
    openModal("isFinanceDialogOpen");
  };

  const handleDeleteTransaction = async () => {
    
    try {
      await financeServices.deleteRecord(deletingRecord).then(() => {
        closeModal("isDeletingRecordModalOpen");
        setDeletingRecord("");
      });
      toast.success("Transaction deleted successfully");
    } catch (error) {
      console.error("Error deleting transaction:", error);
      toast.error("Failed to delete transaction");
    }
  };

  const handleSaveRecord = () => {
    // This will be called when a record is saved/updated
    // For now, we'll just close the dialog
    toggleModal("isFinanceDialogOpen");
  };

  return (
    <>
      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                Financial Manager
              </h1>
              <p className="text-muted-foreground text-lg">
                Professional financial tracking and management system
              </p>
            </div>
            <Button onClick={() => handleAddTransaction("Income")}>
              <Plus className="mr-2 h-5 w-5" />
              Add Transaction
            </Button>
          </div>

          {/* Financial Overview Cards */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card className="border-l-4 border-l-green-500">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Income
                </CardTitle>
                <TrendingUp className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  Rs. {totals.income.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">
                  {totals.incomeCount} transactions
                </p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-red-500">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Expenses
                </CardTitle>
                <TrendingDown className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  Rs. {totals.expenses.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">
                  {totals.expenseCount} transactions
                </p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-blue-500">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Net Worth</CardTitle>
                <DollarSign
                  className={`h-4 w-4 ${
                    netWorth >= 0 ? "text-green-600" : "text-red-600"
                  }`}
                />
              </CardHeader>
              <CardContent>
                <div
                  className={`text-2xl font-bold ${
                    netWorth >= 0 ? "text-green-600" : "text-red-600"
                  }`}
                >
                  Rs. {netWorth.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">
                  Current financial position
                </p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-orange-500">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Lending Balance
                </CardTitle>
                <CreditCard className="h-4 w-4 text-orange-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">
                  Rs. {Math.abs(totals.lent - totals.borrowed).toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">
                  {totals.lent >= totals.borrowed ? "You are owed" : "You owe"}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Advanced Filters */}
          <AdvancedFilters
            filters={filters}
            onFiltersChange={setFilters}
            transactions={finances}
          />

          {/* Main Content Tabs */}
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="space-y-6"
          >
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="income">Income</TabsTrigger>
              <TabsTrigger value="expenses">Expenses</TabsTrigger>
              <TabsTrigger value="lending">Lending</TabsTrigger>
              <TabsTrigger value="transactions">All Transactions</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <FinancialCharts detailed transactions={filteredTransactions} />
            </TabsContent>

            <TabsContent value="income" className="space-y-6">
              <IncomeManager
                transactions={filteredTransactions}
                onEdit={handleEditTransaction}
                onDelete={(recordId) => {
                  toggleModal("isDeletingRecordModalOpen");
                  setDeletingRecord(recordId);
                }}
                onAdd={() => handleAddTransaction("Income")}
              />
            </TabsContent>

            <TabsContent value="expenses" className="space-y-6">
              <ExpenseManager
                transactions={filteredTransactions}
                onEdit={handleEditTransaction}
                onDelete={(recordId) => {
                  toggleModal("isDeletingRecordModalOpen");
                  setDeletingRecord(recordId);
                }}
                onAdd={() => handleAddTransaction("Expense")}
              />
            </TabsContent>

            <TabsContent value="lending" className="space-y-6">
              <LendingManager
                transactions={filteredTransactions}
                onEdit={handleEditTransaction}
                onDelete={(recordId) => {
                  toggleModal("isDeletingRecordModalOpen");
                  setDeletingRecord(recordId);
                }}
                onAdd={handleAddTransaction}
              />
            </TabsContent>

            <TabsContent value="transactions" className="space-y-6">
              <TransactionsTable
                transactions={filteredTransactions}
                loading={loading}
                onEdit={handleEditTransaction}
                onDelete={(recordId) => {
                  toggleModal("isDeletingRecordModalOpen");
                  setDeletingRecord(recordId);
                }}
              />
            </TabsContent>

            <TabsContent value="analytics" className="space-y-6">
              <FinancialCharts transactions={filteredTransactions} detailed />
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <ConfirmDialog
        requireText="Delete"
        open={modalState.isDeletingRecordModalOpen}
        lockWhilePending
        destructive
        onCancel={() => toggleModal("isDeletingRecordModalOpen")}
        onConfirm={handleDeleteTransaction}
      />

      <FinanceRecordDialog
        recordType={recordType as any}
        open={modalState.isFinanceDialogOpen}
        onOpenChange={() => toggleModal("isFinanceDialogOpen")}
        record={editingRecord}
        onSave={handleSaveRecord}
      />
    </>
  );
}
