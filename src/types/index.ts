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


export interface LearningItem {
  id: string;
  title: string;
  type: "roadmap" | "topic" | "subtopic" | "note";
  parentId?: string;
  description: string;
  progress: number;
  completed: boolean;
  resources: string[];
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