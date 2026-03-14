/* ─── Bill Parsing Types ─── */

export interface BillItem {
    name: string;
    price: number;
}

export interface BillData {
    merchant: string;
    date: string;
    total: number;
    currency: string;
    category: string;
    items: BillItem[];
}

export interface BillResult {
    success: boolean;
    filename: string;
    data: BillData;
    confidence: number;
    file_hash: string;
    is_duplicate: boolean;
}

export interface ParseBillsResponse {
    success: boolean;
    total: number;
    parsed: number;
    failed: number;
    results: BillResult[];
}

/* ─── Grouped Data Types ─── */
export interface CategoryGroup {
    category: string;
    bills: BillResult[];
    total: number;
}

export interface CategoryTotals {
    [category: string]: number;
}

/* ─── Helper Functions ─── */

/** Group successful bills by category */
export function groupByCategory(results: BillResult[]): CategoryGroup[] {
    const successfulBills = results.filter((r) => r.success);
    const grouped: Record<string, BillResult[]> = {};

    for (const bill of successfulBills) {
        const category = bill.data.category?.trim() || "Others";
        if (!grouped[category]) grouped[category] = [];
        grouped[category].push(bill);
    }

    return Object.entries(grouped)
        .map(([category, bills]) => ({
            category,
            bills,
            total: bills.reduce((sum, b) => sum + (b.data.total || 0), 0),
        }))
        .sort((a, b) => b.total - a.total);
}

/** Calculate totals per category */
export function calculateCategoryTotals(groups: CategoryGroup[]): CategoryTotals {
    const totals: CategoryTotals = {};
    for (const group of groups) {
        totals[group.category] = group.total;
    }
    return totals;
}

/** Calculate overall total */
export function calculateOverallTotal(groups: CategoryGroup[]): number {
    return groups.reduce((sum, group) => sum + group.total, 0);
}

/** Format currency */
export function formatCurrency(amount: number, currency = "INR"): string {
    return `${currency === "INR" ? "₹" : "$"}${amount.toLocaleString("en-IN", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    })}`;
}

/** Category style mapping */
export interface CategoryStyle {
    bg: string;
    text: string;
    iconBg: string;
    bar: string;
    iconName: string;
}

const CATEGORY_COLORS: Record<string, CategoryStyle> = {
    Food: {
        bg: "bg-orange-100 dark:bg-orange-900/30",
        text: "text-orange-800 dark:text-orange-300",
        iconBg: "bg-orange-500 text-white shadow-sm",
        bar: "bg-orange-500",
        iconName: "UtensilsCrossed",
    },

    Travel: {
        bg: "bg-blue-100 dark:bg-blue-900/30",
        text: "text-blue-800 dark:text-blue-300",
        iconBg: "bg-blue-500 text-white shadow-sm",
        bar: "bg-blue-500",
        iconName: "Plane",
    },

    Shopping: {
        bg: "bg-pink-100 dark:bg-pink-900/30",
        text: "text-pink-800 dark:text-pink-300",
        iconBg: "bg-pink-500 text-white shadow-sm",
        bar: "bg-pink-500",
        iconName: "ShoppingBag",
    },

    Entertainment: {
        bg: "bg-purple-100 dark:bg-purple-900/30",
        text: "text-purple-800 dark:text-purple-300",
        iconBg: "bg-purple-500 text-white shadow-sm",
        bar: "bg-purple-500",
        iconName: "Clapperboard",
    },

    Healthcare: {
        bg: "bg-red-100 dark:bg-red-900/30",
        text: "text-red-800 dark:text-red-300",
        iconBg: "bg-red-500 text-white shadow-sm",
        bar: "bg-red-500",
        iconName: "HeartPulse",
    },

    Education: {
        bg: "bg-indigo-100 dark:bg-indigo-900/30",
        text: "text-indigo-800 dark:text-indigo-300",
        iconBg: "bg-indigo-500 text-white shadow-sm",
        bar: "bg-indigo-500",
        iconName: "GraduationCap",
    },

    Utilities: {
        bg: "bg-yellow-100 dark:bg-yellow-900/30",
        text: "text-yellow-800 dark:text-yellow-300",
        iconBg: "bg-yellow-500 text-white shadow-sm",
        bar: "bg-yellow-500",
        iconName: "Lightbulb",
    },

    Others: {
        bg: "bg-gray-100 dark:bg-gray-800/40",
        text: "text-gray-800 dark:text-gray-300",
        iconBg: "bg-gray-500 text-white shadow-sm",
        bar: "bg-gray-500",
        iconName: "Package",
    },
};


export function getCategoryStyle(category: string): CategoryStyle {
    return CATEGORY_COLORS[category] || CATEGORY_COLORS.Others;
}

/** Format currency for PDF (ASCII-safe, no special chars) */
export function formatCurrencyPdf(amount: number): string {
    const formatted = amount.toLocaleString("en-IN", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });
    return `Rs. ${formatted}`;
}

/* ─── API Call ─── */
const PARSE_BILLS_URL = "https://Akenzz-SmartPay.hf.space/parse-bills";

export async function apiParseBills(files: File[]): Promise<ParseBillsResponse> {
    try {
        const formData = new FormData();
        for (const file of files) {
            formData.append("files", file);
        }

        const res = await fetch(PARSE_BILLS_URL, {
            method: "POST",
            body: formData,
        });

        return await res.json();
    } catch {
        return {
            success: false,
            total: files.length,
            parsed: 0,
            failed: files.length,
            results: [],
        };
    }
}
