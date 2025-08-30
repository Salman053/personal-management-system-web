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
  updatedAt?: any
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

export interface Habit {
  id: string
  name: string
  description?: string
  category: HabitCategory
  type: HabitType
  frequency: HabitFrequency
  priority: HabitPriority
  targetValue?: number
  unit?: string
  color: string
  icon: string
  createdAt: Date
  updatedAt: Date
  isActive: boolean
  tags: string[]
  reminders: HabitReminder[]
  streakTarget?: number
  difficulty: HabitDifficulty
  archived?: boolean
}

export interface HabitEntry {
  id: string
  habitId: string
  date: string // YYYY-MM-DD format
  completed: boolean
  value?: number
  notes?: string
  mood?: number // 1-5 scale
  createdAt: Date
  updatedAt: Date
}

export interface HabitStreak {
  habitId: string
  currentStreak: number
  longestStreak: number
  lastCompletedDate?: string
  streakStartDate?: string
}

export interface HabitStats {
  habitId: string
  totalCompletions: number
  completionRate: number
  averageValue?: number
  weeklyCompletions: number
  monthlyCompletions: number
  streakData: HabitStreak
  trendDirection: "up" | "down" | "stable"
  lastSevenDays: boolean[]
}

export interface UserProfile {
  id: string
  name: string
  email: string
  level: number
  badges: Badge[]
  achievements: Achievement[]
  preferences: UserPreferences
  joinedAt: Date
  streakCount: number
  totalHabitsCompleted: number
}

export interface UserXP {
  id: string
  userId: string
  habitId?: string
  amount: number
  reason: string
  type: "habit_completion" | "streak_bonus" | "level_up" | "achievement" | "milestone" | "daily_bonus"
  createdAt: Date
}

export interface XPSummary {
  totalXP: number
  currentXP: number
  level: number
  xpToNextLevel: number
  habitXP: { [habitId: string]: number }
}

export interface Badge {
  id: string
  name: string
  description: string
  icon: string
  color: string
  unlockedAt: Date
  rarity: "common" | "rare" | "epic" | "legendary"
}

export interface Achievement {
  id: string
  name: string
  description: string
  icon: string
  progress: number
  target: number
  xpReward: number
  completed: boolean
  completedAt?: Date
  category: AchievementCategory
}

export interface UserPreferences {
  theme: "light" | "dark" | "system"
  notifications: boolean
  reminderTime: string
  weekStartsOn: 0 | 1 // 0 = Sunday, 1 = Monday
  timezone: string
  language: string
  motivationalQuotes: boolean
  soundEffects: boolean
}

export interface HabitReminder {
  id: string
  time: string // HH:MM format
  days: number[] // 0-6, Sunday = 0
  enabled: boolean
  message?: string
}

export interface Goal {
  id: string
  title: string
  description: string
  targetDate: Date
  habitIds: string[]
  milestones: Milestone[]
  progress: number
  status: "active" | "completed" | "paused" | "cancelled"
  createdAt: Date
  updatedAt: Date
}

export interface Milestone {
  id: string
  title: string
  description: string
  targetDate: Date
  completed: boolean
  completedAt?: Date
  xpReward: number
}

export type HabitCategory =
  | "health"
  | "fitness"
  | "productivity"
  | "learning"
  | "social"
  | "mindfulness"
  | "creativity"
  | "finance"
  | "environment"
  | "other"

export type HabitType = "build" | "quit" | "maintain"

export type HabitFrequency = "daily" | "weekly" | "custom"

export type HabitPriority = "low" | "medium" | "high" | "critical"

export type HabitDifficulty = "easy" | "medium" | "hard" | "expert"

export type AchievementCategory = "streak" | "completion" | "consistency" | "milestone" | "social" | "special"

export interface HabitAnalytics {
  totalHabits: number
  activeHabits: number
  completedToday: number
  weeklyProgress: number
  monthlyProgress: number
  averageCompletionRate: number
  topPerformingHabits: Habit[]
  strugglingHabits: Habit[]
  streakLeaderboard: Array<{
    habit: Habit
    streak: number
  }>
  categoryBreakdown: Array<{
    category: HabitCategory
    count: number
    completionRate: number
  }>
  timeAnalysis: Array<{
    hour: number
    completions: number
  }>
  moodCorrelation: Array<{
    mood: number
    completionRate: number
  }>
}




export type DoubtPriority = "Low" | "Medium" | "High" | "Critical";

export type DoubtStatus = "open" | "in_review" | "resolved";

export interface DoubtBase {
  userId: string;
  title: string;                 // Short question title
  details?: string;              // Longer explanation / context
  category: string;              // e.g. "React", "Math", "DSA"
  tags?: string[];               // Free-form labels
  priority: DoubtPriority;
  status: DoubtStatus;           // Open -> In Review -> Resolved
  reviewBy?: string | null;      // ISO date string (yyyy-mm-dd) or null
  // Resolution block
  isResolved: boolean;           // quick flag (mirrors status === 'resolved')
  resolutionExplanation?: string;
  sources?: string[];            // URLs or refs
  resolvedBy?: string | null;    // userId if team

  // Audit
  createdAt: Date;               // client Date for UI
  updatedAt: Date;
  resolvedAt?: Date | null;
}

export interface Doubt extends DoubtBase {
  id: string;
}

export type DoubtCreate = Omit<
  DoubtBase,
  "createdAt" | "updatedAt" | "resolvedAt" | "isResolved"
> & { isResolved?: boolean };

export type DoubtUpdate = Partial<Omit<DoubtBase, "userId" | "createdAt">>;
export type TemplateCategory = "Job Application" | "Academic" | "Professional" | "Friendly" | "Custom"

export type TemplateType = "standard" | "formal" | "casual"

export interface EmailTemplate {
  id: string
  title: string
  category: TemplateCategory
  subject: string
  body: string
  placeholders: string[]
  createdAt: Date
  updatedAt: Date
  type: TemplateType
  userId: string
  tags?: string[]
  isShared?: boolean
  shareId?: string
}

export interface TemplatePlaceholder {
  key: string
  label: string
  defaultValue?: string
  required?: boolean
}

export interface TemplateFormData {
  title: string
  category: TemplateCategory
  subject: string
  body: string
  type: TemplateType
  tags?: string[]
}

export interface PlaceholderValues {
  [key: string]: string
}

export interface TemplateValidationError {
  field: string
  message: string
}

export interface TemplateStats {
  totalTemplates: number
  templatesByCategory: Record<TemplateCategory, number>
  recentlyUsed: string[]
  mostUsedPlaceholders: string[]
}

export interface TemplateExportData {
  template: EmailTemplate
  exportedAt: Date
  format: "json" | "txt" | "html"
}

export interface TemplateShareData {
  shareId: string
  templateId: string
  sharedBy: string
  sharedAt: Date
  expiresAt?: Date
  accessCount: number
}

export interface CategoryMetadata {
  category: TemplateCategory
  icon: string
  description: string
  color: string
  defaultPlaceholders: string[]
}

export interface UserTemplatePreferences {
  userId: string
  defaultCategory: TemplateCategory
  defaultType: TemplateType
  autoSave: boolean
  defaultPlaceholders: Record<string, string>
  recentCategories: TemplateCategory[]
  favoriteTemplates: string[]
}

export interface TemplateUsage {
  templateId: string
  userId: string
  usedAt: Date
  placeholderValues: PlaceholderValues
  generatedSubject: string
  generatedBody: string
}
