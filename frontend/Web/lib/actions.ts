"use server";

import { redirect } from "next/navigation";
import {
    apiLogin, apiSignup, apiGetMyGroups, apiCreateGroup, apiJoinGroup, apiGetUserProfile,
    apiGetGroupMembers, apiCreateExpense, apiCreateDirectSplit,
    apiGetGroupTransactions, apiGetUserBalanceInGroup, apiGetGroupBalances,
    apiSendFriendRequest, apiAcceptFriendRequest, apiRejectFriendRequest,
    apiGetPendingFriendRequests, apiGetFriendsList, apiGetMyTransactions, apiAddMemberToGroup,
    EditExpensePayload,apiEditExpense, apiGetGroupExpenses, apiDeleteExpense,
    apiGetMyAnalysis,
    apiGetDashboardChart, apiGetDashboardSummaryDetail,
    apiGetGroupDetail,
    apiGetWhoOwesMe, apiGetWhomIOwe, apiInitiateSettlement, apiConfirmSettlement,
    FORBIDDEN_MESSAGE, apiInitiateTransfer, apiConfirmTransfer, apiClaimTransfer, apiDisputeTransfer, apiGetPendingTransfers, apiGetMyTransfers,
    apiUpdateUpiId,
} from "@/lib/api";
import { setAuthToken, removeAuthToken, getAuthToken } from "@/lib/auth";
import type {
    LoginPayload, SignupPayload, CreateGroupPayload, Group, UserProfile,
    GroupMember, CreateExpensePayload, DirectSplitPayload, Transaction, UserBalance,
    FriendRequest, FriendUser, MyTransaction, AnalysisData,
    DashboardChartData, DashboardSummaryDetail, GroupDetailData,
    WhoOwesMe, WhomIOwe, InitiateSettlementPayload, SettlementInitiation, Transfer
} from "@/lib/api";

/** If any API returns 403 (FORBIDDEN_MESSAGE), wipe the session and redirect to login */
async function guard403<T>(res: { success: boolean; message: string; data: T }): Promise<typeof res> {
    if (res.message === FORBIDDEN_MESSAGE) {
        await removeAuthToken();
        redirect("/login");
    }
    return res;
}

export interface AuthResult {
    success: boolean;
    message: string;
}

export async function loginAction(payload: LoginPayload): Promise<AuthResult> {
    const res = await apiLogin(payload);
    if (res.success && res.data) {
        await setAuthToken(res.data);
    }
    return { success: res.success, message: res.message };
}

export async function signupAction(payload: SignupPayload): Promise<AuthResult> {
    const res = await apiSignup(payload);
    if (res.success && res.data) {
        await setAuthToken(res.data);
    }
    return { success: res.success, message: res.message };
}

export async function logoutAction(): Promise<void> {
    await removeAuthToken();
}



/* ─── Group Actions ─── */
export interface GroupResult {
    success: boolean;
    message: string;
    data: Group[] | Group | null;
}

export async function getMyGroupsAction(): Promise<GroupResult> {
    const token = await getAuthToken();
    if (!token) return { success: false, message: "Not authenticated", data: null };
    const res = await guard403(await apiGetMyGroups(token));
    return { success: res.success, message: res.message, data: res.data };
}

export async function createGroupAction(
    payload: CreateGroupPayload
): Promise<GroupResult> {
    const token = await getAuthToken();
    if (!token) return { success: false, message: "Not authenticated", data: null };
    const res = await guard403(await apiCreateGroup(token, payload));
    return { success: res.success, message: res.message, data: res.data };
}

export async function joinGroupAction(code: string): Promise<GroupResult> {
    const token = await getAuthToken();
    if (!token) return { success: false, message: "Not authenticated", data: null };
    const res = await guard403(await apiJoinGroup(token, code));
    return { success: res.success, message: res.message, data: res.data };
}

/* ─── User Profile Actions ─── */
export interface UserProfileResult {
    success: boolean;
    message: string;
    data: UserProfile | null;
}

export async function getUserProfileAction(): Promise<UserProfileResult> {
    const token = await getAuthToken();
    if (!token) return { success: false, message: "Not authenticated", data: null };
    const res = await guard403(await apiGetUserProfile(token));
    return { success: res.success, message: res.message, data: res.data };
}

/* ─── UPI Actions ─── */
export async function updateUpiIdAction(upiId: string): Promise<{ success: boolean; message: string }> {
    const token = await getAuthToken();
    if (!token) return { success: false, message: "Not authenticated" };
    const res = await guard403(await apiUpdateUpiId(token, upiId));
    return { success: res.success, message: res.message };
}

/* ─── Group Detail Actions ─── */
export interface GroupMembersResult {
    success: boolean;
    message: string;
    data: GroupMember[] | null;
}

export async function getGroupMembersAction(groupId: number): Promise<GroupMembersResult> {
    const token = await getAuthToken();
    if (!token) return { success: false, message: "Not authenticated", data: null };
    const res = await guard403(await apiGetGroupMembers(token, groupId));
    return { success: res.success, message: res.message, data: res.data };
}

/* ─── Expense Actions ─── */
export interface ExpenseResult {
    success: boolean;
    message: string;
}

export async function createExpenseAction(payload: CreateExpensePayload): Promise<ExpenseResult> {
    const token = await getAuthToken();
    if (!token) return { success: false, message: "Not authenticated" };
    const res = await guard403(await apiCreateExpense(token, payload));
    return { success: res.success, message: res.message };
}

export interface DirectSplitResult {
    success: boolean;
    message: string;
}

export async function createDirectSplitAction(payload: DirectSplitPayload): Promise<DirectSplitResult> {
    const token = await getAuthToken();
    if (!token) return { success: false, message: "Not authenticated" };
    const res = await guard403(await apiCreateDirectSplit(token, payload));
    return { success: res.success, message: res.message };
}

export async function editExpenseAction(
    expenseId: number,
    payload: EditExpensePayload
): Promise<ExpenseResult> {
    const token = await getAuthToken();
    if (!token) return { success: false, message: "Not authenticated" };

    const res = await guard403(await apiEditExpense(token, expenseId, payload));

    return { success: res.success, message: res.message };
}

export async function getGroupExpensesAction(groupId: number) {
    const token = await getAuthToken();
    if (!token) return { success: false, message: "Not authenticated", data: [] };

    return await guard403(await apiGetGroupExpenses(token, groupId));
}

export async function deleteExpenseAction(
    expenseId: number
): Promise<ExpenseResult> {
    const token = await getAuthToken();
    if (!token) return { success: false, message: "Not authenticated" };

    const res = await guard403(await apiDeleteExpense(token, expenseId));
    return { success: res.success, message: res.message };
}

/* ─── Ledger Actions ─── */
export interface TransactionsResult {
    success: boolean;
    message: string;
    data: Transaction[] | null;
}

export async function getGroupTransactionsAction(groupId: number): Promise<TransactionsResult> {
    const token = await getAuthToken();
    if (!token) return { success: false, message: "Not authenticated", data: null };
    const res = await guard403(await apiGetGroupTransactions(token, groupId));
    return { success: res.success, message: res.message, data: res.data };
}

export interface BalancesResult {
    success: boolean;
    message: string;
    data: UserBalance[] | null;
}

export async function getGroupBalancesAction(groupId: number): Promise<BalancesResult> {
    const token = await getAuthToken();
    if (!token) return { success: false, message: "Not authenticated", data: null };
    const res = await guard403(await apiGetGroupBalances(token, groupId));
    return { success: res.success, message: res.message, data: res.data };
}

export interface UserBalanceResult {
    success: boolean;
    message: string;
    data: number | null;
}

export async function getUserBalanceInGroupAction(groupId: number, userId: number): Promise<UserBalanceResult> {
    const token = await getAuthToken();
    if (!token) return { success: false, message: "Not authenticated", data: null };
    const res = await guard403(await apiGetUserBalanceInGroup(token, groupId, userId));
    return { success: res.success, message: res.message, data: res.data };
}

/* ─── Friend Actions ─── */
export interface FriendActionResult {
    success: boolean;
    message: string;
}

export async function sendFriendRequestAction(identifier: string): Promise<FriendActionResult> {
    const token = await getAuthToken();
    if (!token) return { success: false, message: "Not authenticated" };
    const res = await guard403(await apiSendFriendRequest(token, identifier));
    return { success: res.success, message: res.message };
}

export async function acceptFriendRequestAction(requestId: number): Promise<FriendActionResult> {
    const token = await getAuthToken();
    if (!token) return { success: false, message: "Not authenticated" };
    const res = await guard403(await apiAcceptFriendRequest(token, requestId));
    return { success: res.success, message: res.message };
}

export async function rejectFriendRequestAction(requestId: number): Promise<FriendActionResult> {
    const token = await getAuthToken();
    if (!token) return { success: false, message: "Not authenticated" };
    const res = await guard403(await apiRejectFriendRequest(token, requestId));
    return { success: res.success, message: res.message };
}

export interface PendingRequestsResult {
    success: boolean;
    message: string;
    data: FriendRequest[] | null;
}

export async function getPendingFriendRequestsAction(): Promise<PendingRequestsResult> {
    const token = await getAuthToken();
    if (!token) return { success: false, message: "Not authenticated", data: null };
    const res = await guard403(await apiGetPendingFriendRequests(token));
    return { success: res.success, message: res.message, data: res.data };
}

export interface FriendsListResult {
    success: boolean;
    message: string;
    data: FriendUser[] | null;
}

export async function getFriendsListAction(): Promise<FriendsListResult> {
    const token = await getAuthToken();
    if (!token) return { success: false, message: "Not authenticated", data: null };
    const res = await guard403(await apiGetFriendsList(token));
    return { success: res.success, message: res.message, data: res.data };
}

/* ─── My Transactions Action ─── */
export interface MyTransactionsResult {
    success: boolean;
    message: string;
    data: MyTransaction[] | null;
}

export async function getMyTransactionsAction(): Promise<MyTransactionsResult> {
    const token = await getAuthToken();
    if (!token) return { success: false, message: "Not authenticated", data: null };
    const res = await guard403(await apiGetMyTransactions(token));
    return { success: res.success, message: res.message, data: res.data };
}

export interface AddMemberResult {
    success: boolean;
    message: string;
}

export async function addMemberToGroupAction(
    groupId: number,
    identifier: string
): Promise<AddMemberResult> {
    const token = await getAuthToken();
    if (!token) return { success: false, message: "Not authenticated" };

    const res = await guard403(
        await apiAddMemberToGroup(token, groupId, identifier)
    );

    return { success: res.success, message: res.message };
}

/* ─── Group Detail (merged) Action ─── */
export interface GroupDetailResult {
    success: boolean;
    message: string;
    data: GroupDetailData | null;
}

export async function getGroupDetailAction(groupId: number): Promise<GroupDetailResult> {
    const token = await getAuthToken();
    if (!token) return { success: false, message: "Not authenticated", data: null };
    const res = await guard403(await apiGetGroupDetail(token, groupId));
    return { success: res.success, message: res.message, data: res.data };
}

/* ─── Analysis Actions ─── */
export interface MyAnalysisResult {
    success: boolean;
    message: string;
    data: AnalysisData | null;
}

export async function getMyAnalysisAction(): Promise<MyAnalysisResult> {
    const token = await getAuthToken();

    if (!token) {
        return {
            success: false,
            message: "Not authenticated",
            data: null
        };
    }

    const res = await guard403(await apiGetMyAnalysis(token));

    return {
        success: res.success,
        message: res.message,
        data: res.data
    };
}

/* ─── Dashboard Actions ─── */
export interface DashboardChartResult {
    success: boolean;
    message: string;
    data: DashboardChartData | null;
}

export async function getDashboardChartAction(): Promise<DashboardChartResult> {
    const token = await getAuthToken();
    if (!token) return { success: false, message: "Not authenticated", data: null };
    const res = await apiGetDashboardChart(token);
    const guarded = await guard403(res);
    return { success: guarded.success, message: guarded.message, data: guarded.data };
}

export interface DashboardSummaryDetailResult {
    success: boolean;
    message: string;
    data: DashboardSummaryDetail | null;
}

export async function getDashboardSummaryDetailAction(): Promise<DashboardSummaryDetailResult> {
    const token = await getAuthToken();
    if (!token) return { success: false, message: "Not authenticated", data: null };
    const res = await guard403(await apiGetDashboardSummaryDetail(token));
    return { success: res.success, message: res.message, data: res.data };
}

/* ─── Settle Up Actions ─── */
export interface WhoOwesMeResult {
    success: boolean;
    message: string;
    data: WhoOwesMe[] | null;
}

export async function getWhoOwesMeAction(): Promise<WhoOwesMeResult> {
    const token = await getAuthToken();
    if (!token) return { success: false, message: "Not authenticated", data: null };
    const res = await guard403(await apiGetWhoOwesMe(token));
    return { success: res.success, message: res.message, data: res.data };
}

export interface WhomIOweResult {
    success: boolean;
    message: string;
    data: WhomIOwe[] | null;
}

export async function getWhomIOweAction(): Promise<WhomIOweResult> {
    const token = await getAuthToken();
    if (!token) return { success: false, message: "Not authenticated", data: null };
    const res = await guard403(await apiGetWhomIOwe(token));
    return { success: res.success, message: res.message, data: res.data };
}

export interface InitiateSettlementResult {
    success: boolean;
    message: string;
    data: SettlementInitiation | null;
}

export async function initiateSettlementAction(payload: InitiateSettlementPayload): Promise<InitiateSettlementResult> {
    const token = await getAuthToken();
    if (!token) return { success: false, message: "Not authenticated", data: null };
    const res = await guard403(await apiInitiateSettlement(token, payload));
    return { success: res.success, message: res.message, data: res.data };
}

export interface ConfirmSettlementResult {
    success: boolean;
    message: string;
}

export async function confirmSettlementAction(paymentReference: string): Promise<ConfirmSettlementResult> {
    const token = await getAuthToken();
    if (!token) return { success: false, message: "Not authenticated" };
    const res = await guard403(await apiConfirmSettlement(token, paymentReference));
    return { success: res.success, message: res.message };
}

//transfers

export interface InitiateTransferResult {
    success: boolean;
    message: string;
    data: any | null;
}

export async function initiateTransferAction(
    payload: {
        toUserId: number;
        amount: number;
        note?: string;
    }
): Promise<InitiateTransferResult> {

    const token = await getAuthToken();

    if (!token)
        return { success: false, message: "Not authenticated", data: null };

    const res = await guard403(await apiInitiateTransfer(token, payload));

    return { success: res.success, message: res.message, data: res.data };
}

export interface TransferResult {
    success: boolean;
    message: string;
}

export async function claimTransferAction(
    transferId: number
): Promise<TransferResult> {

    const token = await getAuthToken();

    if (!token)
        return { success: false, message: "Not authenticated" };

    const res = await guard403(await apiClaimTransfer(token, transferId));

    return { success: res.success, message: res.message };
}

export async function disputeTransferAction(
    transferId: number
): Promise<TransferResult> {

    const token = await getAuthToken();

    if (!token)
        return { success: false, message: "Not authenticated" };

    const res = await guard403(await apiDisputeTransfer(token, transferId));

    return { success: res.success, message: res.message };
}

export async function confirmTransferAction(
    transferId: number
): Promise<TransferResult> {

    const token = await getAuthToken();

    if (!token)
        return { success: false, message: "Not authenticated" };

    const res = await guard403(await apiConfirmTransfer(token, transferId));

    return { success: res.success, message: res.message };
}

export interface PendingTransfersResult {
    success: boolean;
    message: string;
    data: Transfer[] | null;
}

export async function getPendingTransfersAction(): Promise<PendingTransfersResult> {

    const token = await getAuthToken();

    if (!token)
        return { success: false, message: "Not authenticated", data: null };

    const res = await guard403(await apiGetPendingTransfers(token));

    return { success: res.success, message: res.message, data: res.data };
}

export interface MyTransfersResult {
    success: boolean;
    message: string;
    data: Transfer[] | null;
}

export async function getMyTransfersAction(): Promise<MyTransfersResult> {

    const token = await getAuthToken();

    if (!token)
        return { success: false, message: "Not authenticated", data: null };

    const res = await guard403(await apiGetMyTransfers(token));

    return { success: res.success, message: res.message, data: res.data };
}