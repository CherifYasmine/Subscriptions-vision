export type CycleType = "weekly" | "monthly" | "quarterly" | "yearly" | "custom" | "lifetime";


export interface Cycle { type: CycleType; intervalMonths?: number; }


export interface Subscription {
id: string;
name: string;
amount: number;
currency: string;
cycle: Cycle;
nextChargeDate?: string; // ISO YYYY-MM-DD
startDate?: string;
status: "active" | "canceled";
category?: string;
paymentMethod?: string;
seats?: number;
tags?: string[];
notes?: string;
trialIsTrial?: boolean;
trialEndsOn?: string | null;
}