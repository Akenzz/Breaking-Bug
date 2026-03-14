import { env } from "@/lib/env";

export const FORBIDDEN_MESSAGE = "ACCESS_FORBIDDEN";

/** Internal helper – handles 403 + network errors uniformly */
async function apiFetch<T>(url: string, init: RequestInit, fallback: T): Promise<ApiResponse<T>> {
    try {
        const res = await fetch(url, init);
        if (res.status === 403) return { success: false, message: FORBIDDEN_MESSAGE, data: fallback };
        if (!res.ok) {
            const text = await res.text();
            console.error(`[apiFetch] ${init.method} ${url} → ${res.status}:`, text.slice(0, 300));
            return { success: false, message: `HTTP ${res.status}`, data: fallback };
        }
        return await res.json();
    } catch (err) {
        console.error(`[apiFetch] ${init.method} ${url} threw:`, err);
        return { success: false, message: "Network error. Please try again.", data: fallback };
    }
}

export interface ApiResponse<T = unknown> {
    success: boolean;
    message: string;
    data: T;
}

export interface SignupPayload {
    email: string;
    phoneNumber: string;
    password: string;
    fullName: string;
}

export interface LoginPayload {
    identifier: string;
    password: string;
}

export async function apiSignup(
    payload: SignupPayload
): Promise<ApiResponse<string>> {
    return apiFetch(`${env.baseUrl}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
    }, "");
}

/* ─── Group Types ─── */
export interface Group {
    id: number;
    name: string;
    description: string;
    groupCode: string;
    createdByName: string;
    createdByIdentifier: string;
}

export interface CreateGroupPayload {
    name: string;
    description: string;
}

/* ─── Group API Functions ─── */
export async function apiGetMyGroups(
    token: string
): Promise<ApiResponse<Group[]>> {
    return apiFetch(`${env.baseUrl}/groups/my`, {
        method: "GET",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    }, []);
}

export async function apiCreateGroup(
    token: string,
    payload: CreateGroupPayload
): Promise<ApiResponse<Group>> {
    return apiFetch(`${env.baseUrl}/groups`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
    }, null as unknown as Group);
}

export async function apiJoinGroup(
    token: string,
    code: string
): Promise<ApiResponse<null>> {
    return apiFetch(`${env.baseUrl}/groups/join?code=${code}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    }, null);
}

export async function apiLogin(
    payload: LoginPayload
): Promise<ApiResponse<string>> {
    return apiFetch(`${env.baseUrl}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
    }, "");
}

/* ─── User ─── */
export interface UserProfile {
    id: number;
    email: string;
    fullName: string;
    phoneNumber: string;
    role: string;
    upiId: string | null;
}

export async function apiUpdateUpiId(
    token: string,
    upiId: string
): Promise<ApiResponse<null>> {
    return apiFetch(`${env.baseUrl}/users/upi`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ upiId }),
    }, null);
}

export async function apiGetUserProfile(
    token: string
): Promise<ApiResponse<UserProfile>> {
    return apiFetch(`${env.baseUrl}/users/me`, {
        method: "GET",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    }, null as unknown as UserProfile);
}

/* ─── Group Members ─── */
export interface GroupMember {
    userId: number;
    fullName: string;
    identifier: string;
    role: "ADMIN" | "MEMBER";
    friend: boolean;
}

export async function apiGetGroupMembers(
    token: string,
    groupId: number
): Promise<ApiResponse<GroupMember[]>> {
    return apiFetch(`${env.baseUrl}/groups/${groupId}/members`, {
        method: "GET",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    }, []);
}

export async function apiAddMemberToGroup(
    token: string,
    groupId: number,
    identifier: string
): Promise<ApiResponse<null>> {
    return apiFetch(
        `${env.baseUrl}/groups/${groupId}/members?identifier=${identifier}`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
        },
        null
    );
}

/* ─── Expenses ─── */

export interface GroupExpense {
    id: number;
    description: string;
    totalAmount: number;
    groupName: string;
    paidByName: string;
    paidByUserId: number;
    createdAt: string;
    cancelled: boolean;
}

/* ===== Create Expense ===== */

export interface CreateExpenseEqualPayload {
    groupId: number;
    description: string;
    amount: number;
    splitType: "EQUAL";
    userIds: number[];
}

export interface CreateExpenseExactPayload {
    groupId: number;
    description: string;
    amount: number;
    splitType: "EXACT";
    exactSplits: { userId: number; amount: number }[];
}

export type CreateExpensePayload =
    | CreateExpenseEqualPayload
    | CreateExpenseExactPayload;

export async function apiCreateExpense(
    token: string,
    payload: CreateExpensePayload
): Promise<ApiResponse<null>> {
    return apiFetch(
        `${env.baseUrl}/expenses`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(payload),
        },
        null
    );
}

/* ===== Edit Expense ===== */

export interface EditExpenseEqualPayload {
    description: string;
    amount: number;
    payerId: number;
    splitType: "EQUAL";
    userIds: number[];
}

export interface EditExpenseExactPayload {
    description: string;
    amount: number;
    payerId: number;
    splitType: "EXACT";
    exactSplits: { userId: number; amount: number }[];
}

export type EditExpensePayload =
    | EditExpenseEqualPayload
    | EditExpenseExactPayload;

export async function apiEditExpense(
    token: string,
    expenseId: number,
    payload: EditExpensePayload
): Promise<ApiResponse<null>> {
    return apiFetch(
        `${env.baseUrl}/expenses/${expenseId}`,
        {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(payload),
        },
        null
    );
}

/* ===== Delete (Cancel) Expense ===== */

export async function apiDeleteExpense(
    token: string,
    expenseId: number
): Promise<ApiResponse<null>> {
    return apiFetch(
        `${env.baseUrl}/expenses/${expenseId}`,
        {
            method: "DELETE",
            headers: {
                Authorization: `Bearer ${token}`,
            },
        },
        null
    );
}

/* ===== Get Group Expenses ===== */

export async function apiGetGroupExpenses(
    token: string,
    groupId: number
): Promise<ApiResponse<GroupExpense[]>> {
    return apiFetch(
        `${env.baseUrl}/expenses/group/${groupId}`,
        {
            method: "GET",
            headers: {
                Authorization: `Bearer ${token}`,
            },
        },
        []
    );
}

/* ─── Direct Split ─── */
export interface DirectSplitEqualPayload {
    description: string;
    amount: number;
    payerId: number;
    splitType: "EQUAL";
    userIds: number[];
}

export interface DirectSplitExactPayload {
    description: string;
    amount: number;
    payerId: number;
    splitType: "EXACT";
    exactSplits: { userId: number; amount: number }[];
}

export type DirectSplitPayload = DirectSplitEqualPayload | DirectSplitExactPayload;

export async function apiCreateDirectSplit(
    token: string,
    payload: DirectSplitPayload
): Promise<ApiResponse<unknown>> {
    return apiFetch(`${env.baseUrl}/expenses/direct-split`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
    }, null);
}

/* ─── Ledger / Transactions ─── */
export interface Transaction {
    description: string;
    amount: number;
    fromUserId: number;
    fromUserName: string;
    toUserId: number | null;
    toUserName: string | null;
    type: "EXPENSE" | "SETTLEMENT";
    perspective?: string;
    createdAt: string;
}

export async function apiGetGroupTransactions(
    token: string,
    groupId: number
): Promise<ApiResponse<Transaction[]>> {
    return apiFetch(`${env.baseUrl}/ledger/group/${groupId}/transactions`, {
        method: "GET",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    }, []);
}

/* ─── Balances ─── */
export interface UserBalance {
    userId: number;
    fullName: string;
    netBalance: number;
}

export async function apiGetUserBalanceInGroup(
    token: string,
    groupId: number,
    userId: number
): Promise<ApiResponse<number>> {
    return apiFetch(`${env.baseUrl}/ledger/group/${groupId}/user/${userId}`, {
        method: "GET",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    }, 0);
}

export async function apiGetGroupBalances(
    token: string,
    groupId: number
): Promise<ApiResponse<UserBalance[]>> {
    return apiFetch(`${env.baseUrl}/ledger/group/${groupId}/balances`, {
        method: "GET",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    }, []);
}

/* ─── Group Detail (merged endpoint) ─── */
export interface GroupDetailData {
    balances: UserBalance[];
    currentUser: UserProfile;
    expenses: GroupExpense[];
    group: Group;
    members: GroupMember[];
    myBalance: number;
    transactions: Transaction[];
}

export async function apiGetGroupDetail(
    token: string,
    groupId: number
): Promise<ApiResponse<GroupDetailData>> {
    return apiFetch(`${env.baseUrl}/groups/${groupId}/detail`, {
        method: "GET",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    }, null as unknown as GroupDetailData);
}

/* ─── Friends ─── */
export interface FriendUser {
    id: number;
    email: string;
    fullName: string;
    role: string;
    phoneNumber: string;
    createdAt: string;
}

export interface FriendRequest {
    requestId: number;
    requesterId: number;
    requesterName: string;
    requesterPhone: string;
    createdAt: string;
}

export async function apiSendFriendRequest(
    token: string,
    identifier: string
): Promise<ApiResponse<unknown>> {
    return apiFetch(`${env.baseUrl}/friends/request`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ identifier }),
    }, null);
}

export async function apiAcceptFriendRequest(
    token: string,
    requestId: number
): Promise<ApiResponse<unknown>> {
    return apiFetch(`${env.baseUrl}/friends/${requestId}/accept`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    }, null);
}

export async function apiRejectFriendRequest(
    token: string,
    requestId: number
): Promise<ApiResponse<unknown>> {
    return apiFetch(`${env.baseUrl}/friends/${requestId}/reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    }, null);
}

export async function apiGetPendingFriendRequests(
    token: string
): Promise<ApiResponse<FriendRequest[]>> {
    return apiFetch(`${env.baseUrl}/friends/pending`, {
        method: "GET",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    }, []);
}

export async function apiGetFriendsList(
    token: string
): Promise<ApiResponse<FriendUser[]>> {
    return apiFetch(`${env.baseUrl}/friends`, {
        method: "GET",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    }, []);
}

/* ─── My Transactions ─── */
export interface MyTransaction {
    amount: number;
    createdAt: string;
    description: string;
    fromUserId: number;
    fromUserName: string;
    toUserId: number;
    toUserName: string;
    type: "EXPENSE" | "SETTLEMENT";
}

export async function apiGetMyTransactions(
    token: string
): Promise<ApiResponse<MyTransaction[]>> {
    return apiFetch(`${env.baseUrl}/ledger/my-transactions`, {
        method: "GET",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    }, []);
}

/* ─── Analysis ─── */
export interface AnalysisData {
    health_score: number;
    health_grade: string;

    health_breakdown: {
        consistency: { score: number; max: number };
        spike_control: { score: number; max: number };
        category_diversity: { score: number; max: number };
        anomaly_penalty: { score: number; max: number };
    };

    health_stats: {
        total_spending: number;
        total_income: number;
        net_cash_flow: number;
        average_transaction: number;
        std_deviation: number;
        transaction_count: number;
        outgoing_count: number;
        incoming_count: number;
    };

    prediction: {
        predicted_next_amount: number;
        method: string;
        trend: string;
        data_points_used: number;
        model_confidence_r2: number;
        recent_average: number;
    };

    anomalies: any[];
    anomaly_skipped: boolean;
    anomaly_skip_reason?: string;

    categories: Record<string, string>;
    category_totals: Record<string, number>;

    top_recipients: {
        recipient: string;
        total_amount: number;
        transaction_count: number;
        primary_category: string;
        category_breakdown: Record<string, number>;
        descriptions: string[];
        reason: string;
    }[];

    insights: string[];
}

export async function apiGetMyAnalysis(
    token: string
): Promise<ApiResponse<AnalysisData>> {
    return apiFetch(
        `${env.baseUrl}/analysis/me`,
        {
            method: "GET",
            headers: {
                Authorization: `Bearer ${token}`,
            },
        },
        null as unknown as AnalysisData
    );
}

/* ─── Dashboard ─── */

export interface DashboardChartData {
    labels: string[];
    income: number[];
    expense: number[];
}

export interface DashboardBalance {
    total: number;
    changePercent: number | null;
    monthlySpent: number;
    monthlyLimit: number | null;
}

export interface DashboardPendingRequest {
    id: number;
    name: string;
    description: string;
    amount: number;
    type: string; // "OWES_YOU" | "YOU_OWE"
    dueDate: string | null;
}

export interface DashboardRecentActivity {
    id: number;
    description: string;
    amount: number;
    type: string;
    createdAt: string;
    fromUserName: string;
    toUserName: string;
}

export interface DashboardExpenseBreakdown {
    lastMonth: number;
    percentageChange: number;
    thisMonth: number;
    trend: string; // "UP" | "DOWN" | "FLAT"
}

export interface DashboardSummary {
    friendCount: number;
    groupCount: number;
    totalBalance: number;
    totalIsOwed: number;
    totalOwes: number;
}

export interface DashboardSummaryDetail {
    balance: DashboardBalance;
    expenseBreakdown: DashboardExpenseBreakdown;
    pendingRequests: DashboardPendingRequest[];
    recentActivity: DashboardRecentActivity[];
    summary: DashboardSummary;
}

/* ─── Settle Up / Ledger ─── */
export interface WhoOwesMe {
    userId: number;
    userName?: string;
    amount: number;
}

export interface WhomIOwe {
    userId: number;
    userName?: string;
    amount: number;
}

export interface SettlementInitiation {
    paymentReference: string;
    amount: number;
}

export interface InitiateSettlementPayload {
    groupId: number;
    fromUserId: number;
    toUserId: number;
    amount: number;
}

export async function apiGetWhoOwesMe(
    token: string
): Promise<ApiResponse<WhoOwesMe[]>> {
    return apiFetch(`${env.baseUrl}/ledger/who-owes-me`, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
    }, []);
}

export async function apiGetWhomIOwe(
    token: string
): Promise<ApiResponse<WhomIOwe[]>> {
    return apiFetch(`${env.baseUrl}/ledger/whom-i-owe`, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
    }, []);
}

export async function apiInitiateSettlement(
    token: string,
    payload: InitiateSettlementPayload
): Promise<ApiResponse<SettlementInitiation>> {
    return apiFetch(`${env.baseUrl}/settlements/initiate`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
    }, null as unknown as SettlementInitiation);
}

export async function apiConfirmSettlement(
    token: string,
    paymentReference: string
): Promise<ApiResponse<null>> {
    return apiFetch(`${env.baseUrl}/settlements/confirm?paymentReference=${encodeURIComponent(paymentReference)}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
    }, null);
}

export async function apiGetDashboardChart(
    token: string
): Promise<ApiResponse<DashboardChartData>> {
    return apiFetch(
        `${env.baseUrl}/dashboard/chart`,
        {
            method: "GET",
            headers: { Authorization: `Bearer ${token}` },
        },
        null as unknown as DashboardChartData
    );
}

export async function apiGetDashboardSummaryDetail(
    token: string
): Promise<ApiResponse<DashboardSummaryDetail>> {
    return apiFetch(
        `${env.baseUrl}/dashboard/summary-detail`,
        {
            method: "GET",
            headers: { Authorization: `Bearer ${token}` },
        },
        null as unknown as DashboardSummaryDetail
    );
}

//transfers

export interface Transfer {
    transferId: number;
    amount: number;
    note?: string;
    status: string;
    fromUserName?: string;
    toUserName?: string;
}

export async function apiInitiateTransfer(
    token: string,
    payload: {
        toUserId: number;
        amount: number;
        note?: string;
    }
): Promise<ApiResponse<any>> {

    return apiFetch(
        `${env.baseUrl}/transfers/initiate`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(payload),
        },
        null
    );
}

export async function apiClaimTransfer(
    token: string,
    transferId: number
): Promise<ApiResponse<null>> {

    return apiFetch(
        `${env.baseUrl}/transfers/${transferId}/claim`,
        {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`,
            },
        },
        null
    );
}

export async function apiConfirmTransfer(
    token: string,
    transferId: number
): Promise<ApiResponse<null>> {

    return apiFetch(
        `${env.baseUrl}/transfers/${transferId}/confirm`,
        {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`,
            },
        },
        null
    );
}

export async function apiDisputeTransfer(
    token: string,
    transferId: number
): Promise<ApiResponse<null>> {

    return apiFetch(
        `${env.baseUrl}/transfers/${transferId}/dispute`,
        {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`,
            },
        },
        null
    );
}

export async function apiGetPendingTransfers(
    token: string
): Promise<ApiResponse<Transfer[]>> {

    return apiFetch(
        `${env.baseUrl}/transfers/pending-confirmations`,
        {
            method: "GET",
            headers: {
                Authorization: `Bearer ${token}`,
            },
        },
        []
    );
}

export async function apiGetMyTransfers(
    token: string
): Promise<ApiResponse<Transfer[]>> {

    return apiFetch(
        `${env.baseUrl}/transfers/my`,
        {
            method: "GET",
            headers: {
                Authorization: `Bearer ${token}`,
            },
        },
        []
    );
}
