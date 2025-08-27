import { Task } from "@/types";

export const formatCurrency = (amount: number, currency = "PKR") => {
    try {
        return new Intl.NumberFormat("en-PK", { style: "currency", currency }).format(amount)
    } catch {
        return `${currency} ${amount.toFixed(0)}`
    }
}

export const shortDate = (d: Date | string | number) => new Date(d).toLocaleDateString()




export const encode = (s: string) => encodeURIComponent(s);




