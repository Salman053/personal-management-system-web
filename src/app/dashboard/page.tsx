"use client";

import CashflowAreaChart from "@/components/dashboard/cash-flow-area-chart";
import CategoryBarChart from "@/components/dashboard/category-bar-chart";
import DonutChart from "@/components/dashboard/donut-chart";
import ProjectList from "@/components/dashboard/project-list";
import { TransactionsTable } from "@/components/finances/transactions-table";
import { BentoGrid, BentoItem } from "@/components/shared/bento-grid";
import HabitsWidget from "@/components/shared/habits-widget";
import { KpiCard } from "@/components/shared/kpi-card";
import LearningWidget from "@/components/shared/learning-widget";
import RemindersWidget from "@/components/shared/reminder-widget";
import { useMainContext } from "@/contexts/app-context";
import {
  DashboardInput,
  useDashboard,
} from "@/hooks/use-dashborad-calculations";
import { PaymentMedium, TransactionStatus, TransactionType } from "@/types";

export default function Page() {
  const {
    projects,
    loading,
    projectPayments,
    finances,
    learning,
    habits,
    reminders,
  } = useMainContext();

  const data = {
    projects: projects,
    projectPayments: projectPayments,
    finance: finances,
    learning: learning,
    habits: habits,
    reminders: reminders,
  };
  const d = useDashboard(data);

  console.log(d);

  return (
    <div aria-live="polite" aria-label="Dashboard" className="space-y-4">
      {/* Top KPIs */}
      <BentoGrid>
        <BentoItem
          className="lg:col-span-2"
          title="Income"
          description="Total recognized income"
        >
          <KpiCard
            label="This Period"
            value={d.sums.income}
            hint={d.ariaSummary.finance}
          />
        </BentoItem>
        <BentoItem
          className="lg:col-span-2"
          title="Expense"
          description="Total operating expense"
        >
          <KpiCard label="This Period" value={d.sums.expense} />
        </BentoItem>
        <BentoItem
          className="lg:col-span-2"
          title="Net"
          description="Income − Expense"
        >
          <KpiCard
            label="Net Profit"
            value={d.netProfit}
            hint={`Runway ~ ${d.runwayMonths} months`}
          />
        </BentoItem>

        {/* Cashflow area */}
        <BentoItem
          className="lg:col-span-4"
          title="Cashflow"
          description="Monthly income vs expense vs net"
        >
          <CashflowAreaChart data={d.cashflowSeries} />
        </BentoItem>

        {/* Category expense bar */}
        <BentoItem
          className="lg:col-span-2"
          title="Top Expense Categories"
          description="Where your money goes"
        >
          <CategoryBarChart data={d.expenseByCategory} />
        </BentoItem>

        {/* Projects */}
        <BentoItem
          children
          className="lg:col-span-3"
          title="Projects"
          description={`Active ${d.projectStats.active} • Completed ${d.projectStats.completed}`}
        >
          {/* <ProjectList projects={d.projects} /> */}
        </BentoItem>

        {/* Loans status donut */}
        <BentoItem
          className="lg:col-span-3"
          title="Loans & Dues"
          description="Receivables vs Payables vs Overdue"
        >
          <DonutChart
            data={[
              { name: "Receivable", value: d.outstandingLoans.receivable },
              { name: "Payable", value: d.outstandingLoans.payable },
              { name: "Overdue", value: d.outstandingLoans.overdue },
            ]}
          />
        </BentoItem>

        {/* Habits */}
        <BentoItem
          children
          className="lg:col-span-2"
          title="Habits"
          description={`Avg completion ${d.habitStats.avgCompletionRate}%`}
        >
          {/* <HabitsWidget habits={d.habitStats} /> */}
        </BentoItem>

        {/* Learning */}
        <BentoItem
          children
          className="lg:col-span-2"
          title="Learning"
          description={`Avg progress ${d.learningStats.avgProgress}%`}
        >
          {/* <LearningWidget items={d.learning} /> */}
        </BentoItem>

        {/* Reminders */}
        <BentoItem
          className="lg:col-span-2"
          title="Upcoming"
          description="Your next reminders"
        >
          <RemindersWidget reminders={d.upcomingReminders} />
        </BentoItem>

        {/* Recent Transactions */}
        <BentoItem
          className="lg:col-span-6"
          title="Recent Transactions"
          description="Latest 8 records"
        >
          <TransactionsTable
            loading={loading}
            onDelete={() => null}
            onEdit={() => null}
            transactions={finances}
          />
        </BentoItem>
      </BentoGrid>
    </div>
  );
}
