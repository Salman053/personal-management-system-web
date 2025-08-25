import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { FinanceRecord, Project, Habit, LearningItem, ProjectPayment } from "@/types";

export function useDashboardData(userId: string, finances:FinanceRecord[], projects:Project[], projectPayments:ProjectPayment[], habits:Habit[], learning:LearningItem[]) {
    const [data, setData] = useState<any>(null);

    useEffect(() => {


            // ---- Calculations ----
            const income = finances.filter(r => r.type === "Income").reduce((s, r) => s + r.amount, 0);
            const expense = finances.filter(r => r.type === "Expense").reduce((s, r) => s + r.amount, 0);
            const borrowed = finances.filter(r => r.type === "Borrowed").reduce((s, r) => s + r.amount, 0);
            const lent = finances.filter(r => r.type === "Lent").reduce((s, r) => s + r.amount, 0);

            const projStats = {
                active: projects.filter(p => p.status === "active").length,
                completed: projects.filter(p => p.status === "completed").length,
                paused: projects.filter(p => p.status === "paused").length,
            };

            const habitStats = {
                maintained: habits.filter(h => h.type === "Maintain").length,
                quit: habits.filter(h => h.type === "Quit").length,
                avgCompletion: Math.round(
                    habits.reduce((s, h) => s + (h.stats.completionRate || 0), 0) / habits.length || 0
                ),
            };

            const learningStats = {
                avgProgress: Math.round(learning.reduce((s, l) => s + (l.progress || 0), 0) / learning.length || 0),
                completed: learning.filter(l => l.completed).length,
                inProgress: learning.filter(l => !l.completed && Number(l.progress) > 0).length,
                pending: learning.filter(l => !l.completed && !l.progress).length,
            };

            setData({ finance: { income, expense, borrowed, lent }, projStats, habitStats, learningStats });

    }, [userId]);

    return data;
}
