export interface ProjectPayment extends TransactionBase {
  projectId: string
  clientId?: string
  clientName?: string
  medium: "Cash" | "Easypaisa" | "Bank" | "Cheque" | "Other"
  type: "Income" | "Expense" | "Borrowed" | "Lent"
  receipt?: string
  //   status: "pending" | "paid" | "overdue"
  description: string
  createdAt?: Date
}




// Payment Medium
export enum PaymentMedium {
  Cash = "Cash",
  Bank = "Bank",
  Easypaisa = "Easypaisa",
  Card = "Card",
  Cheque = "Cheque",
  Other = "Other",
}

// Loan/Expense Status
export enum TransactionStatus {
  Pending = "Pending",
  Paid = "Paid",
  Overdue = "Overdue",
}
// types/index.ts

export enum TransactionType {
  Income = "Income",
  Expense = "Expense",
  Borrowed = "Borrowed",
  Lent = "Lent",
}

export enum IncomeCategory {
  Salary = "Salary",
  Business = "Business",
  Investments = "Investments",
  OtherIncome = "Other Income",
}

export enum ExpenseCategory {
  Food = "Food",
  Rent = "Rent",
  Utilities = "Utilities",
  Transport = "Transport",
  Healthcare = "Healthcare",
  Education = "Education",
  Entertainment = "Entertainment",
  OtherExpense = "Other Expense",
}

export enum BorrowedCategory {
  FromFriend = "From Friend",
  FromFamily = "From Family",
  FromBank = "From Bank",
  OtherBorrowed = "Other Borrowed",
}

export enum LentCategory {
  ToFriend = "To Friend",
  ToFamily = "To Family",
  ToBusiness = "To Business",
  OtherLent = "Other Lent",
}

export type TransactionCategory =
  | IncomeCategory
  | ExpenseCategory
  | BorrowedCategory
  | LentCategory;


export const categoryOptions: Record<TransactionType, string[]> = {
  [TransactionType.Income]: Object.values(IncomeCategory),
  [TransactionType.Expense]: Object.values(ExpenseCategory),
  [TransactionType.Borrowed]: Object.values(BorrowedCategory),
  [TransactionType.Lent]: Object.values(LentCategory),
};
export interface FinanceRecord {
  id?: string
  userId: string

  type: TransactionType
  amount: number
  currency?: string // default "PKR"

  category: TransactionCategory
  medium: PaymentMedium

  counterparty?: string // for borrowed/lent
  counterpartyDetails?: {
    email: string,
    phone: string,
    address?: string,
  }
  dueDate?: Date // only for borrowed/lent
  status?: TransactionStatus // only for borrowed/lent or pending payments

  description?: string
  receiptUrl?: string

  date: any // actual date of transaction
  createdAt?: Date
  updatedAt?: Date
}

export interface TransactionBase {
  id?: string
  docId?: string
  amount: number
  date?: any
  userId: string
  category?: string
  medium: "Cash" | "Easypaisa" | "Bank" | "Cheque" | "Other"
  type: "Income" | "Expense" | "Borrowed" | "Lent"
  receipt?: string
  //   status: "pending" | "paid" | "overdue"
  description: string
  createdAt?: Date
}

export interface Project {
  id?: string;
  docId?: string;
  userId?: string;
  clientName?: string;
  clientAddress?: string;
  clientPhone?: string;
  clientEmail?: string;
  title: string;
  type: "client" | "personal";
  description: string;
  status: "active" | "completed" | "paused";
  startDate: Date | any;
  endDate?: Date | any;
  totalAmount?: number;
  advanceAmount?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Habit {
  id: string
  userId: string

  // Core info
  title: string
  description?: string
  type: "Maintain" | "Quit"
  priority: "High" | "Medium" | "Relax"
  color: string
  motivationQuote: string
  // Tracking & frequency
  frequency: {
    type: "Daily" | "Weekly" | "Monthly" | "Custom"
    timesPerPeriod: number
    daysOfWeek?: number[]
  }

  // Streaks
  streak: {
    current: number
    longest: number
    lastCompleted: Date | null
  }

  // Engagement stats
  stats: {
    totalCompletions: number
    missedDays: number
    completionRate: number
  }

  // Completion data
  completedDates: string[] // ISO strings for easy DB storage

  // Reminders
  reminder?: {
    enabled: boolean
    timeOfDay: string
    days?: number[]
  }

  // Optional notes / reflections
  logs?: {
    date: string
    note?: string
  }[]

  // Lifecycle
  createdAt: string
  updatedAt: string
  archived?: boolean
}

// Complete LearningItem interface
export interface LearningItem {
  id: string;
  title: string;
  type: "roadmap" | "topic" | "subtopic" | "note";
  parentId?: string;

  // Core content
  description: string;
  resources: { label: string; url: string }[];
  tags: string[];

  // Progress & tracking
  progress?: number; // 0-100
  completed?: boolean;
  estimatedTime?: number; // in week
  actualTime?: number; // tracked weeks spent in minutes
  priority: "low" | "medium" | "high";
  dueDate?: any;

  // Assessment (optional, for quizzes/tasks)
  hasAssessment?: boolean;
  score?: number; // 0-100

  // System fields
  userId: string; // Firebase user ID
  createdAt: Date;
  updatedAt: Date;
}

// interface AppState {
//   projects: Project[];
//   transactions: Transaction[];
//   habits: Habit[];
//   learning: LearningItem[];
//   loading: boolean;
// }



export interface Reminder {
  id?: string;
  userId: string;
  documentId?: string; // link to F
  // inanceRecord / Habit / Project / LearningItem
  type: "Finance" | "Habit" | "Learning" | "Project";

  title: string;
  description?: string;

  priority: "High" | "Medium" | "Low";
  channel: ("push" | "email")[]; // multi-channel

  schedule: {
    dateTime: Date;          // when to notify
    repeat?: "none" | "daily" | "weekly" | "monthly";
  };

  status: "scheduled" | "sent" | "cancelled";

  createdAt: Date;
  updatedAt: Date;
}



export type taskType = "Personal" | "Work" | "Grocery"

export interface Task {
  id: string
  title: string
  description?: string
  type: taskType
  dueDate?: any
  userId: string
  for: string
  status: "pending" | "in-progress" | "completed"
  createdAt: Date
  updatedAt: Date
  completedAt?: any
}

export interface SubTask {
  id: string
  title: string
  description: string
  userId: string
  for: string
  isCompleted: boolean // Fixed type from string to boolean
  taskId: string
  completedAt: any
  updatedAt?:any
}

export interface NotificationContact {
  id: string
  name: string
  email?: string
  phone?: string // WhatsApp number
  relationship: string
}


export const predefinedContacts: NotificationContact[] = [
  {
    id: "contact1",
    name: "Muhammad Salman Khan",
    email: "salmankhanm859@gmail.com",
    phone: "+92 335 2313245",
    relationship: "Self"
  }
]
