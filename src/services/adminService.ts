import { getFunctions, httpsCallable } from 'firebase/functions';
import app from './firebase';
import type {
  AdminBroadcastNotificationInput,
  AdminBroadcastNotificationResult,
  AdminDashboardSummary,
  AdminGlobalSettingsPatch,
  AdminSubscriptionPatch,
  AdminUserActionResult,
  AdminUserDetail,
  AdminUserSearchResponse,
} from '../types/admin';

const functions = getFunctions(app, 'us-central1');

export async function searchAdminUsers(query?: string, limit = 20): Promise<AdminUserSearchResponse> {
  const fn = httpsCallable<{ query?: string; limit?: number }, AdminUserSearchResponse>(functions, 'searchAdminUsers');
  const result = await fn({ query, limit });
  return result.data;
}

export async function getAdminDashboardSummary(): Promise<AdminDashboardSummary> {
  const fn = httpsCallable<Record<string, never>, AdminDashboardSummary>(functions, 'getAdminDashboardSummary');
  const result = await fn({});
  return result.data;
}

export async function updateAdminGlobalSettings(settings: AdminGlobalSettingsPatch): Promise<AdminUserActionResult> {
  const fn = httpsCallable<{ settings: AdminGlobalSettingsPatch }, AdminUserActionResult>(functions, 'updateAdminGlobalSettings');
  const result = await fn({ settings });
  return result.data;
}

export async function sendAdminBroadcastNotification(
  input: AdminBroadcastNotificationInput,
): Promise<AdminBroadcastNotificationResult> {
  const fn = httpsCallable<AdminBroadcastNotificationInput, AdminBroadcastNotificationResult>(functions, 'sendAdminBroadcastNotification');
  const result = await fn(input);
  return result.data;
}

export async function getAdminUserDetail(uid: string): Promise<AdminUserDetail> {
  const fn = httpsCallable<{ uid: string }, AdminUserDetail>(functions, 'getAdminUserDetail');
  const result = await fn({ uid });
  return result.data;
}

export async function updateAdminUserSubscription(
  uid: string,
  subscription: AdminSubscriptionPatch,
): Promise<AdminUserActionResult> {
  const fn = httpsCallable<
    { uid: string; subscription: AdminSubscriptionPatch },
    AdminUserActionResult
  >(functions, 'updateAdminUserSubscription');
  const result = await fn({ uid, subscription });
  return result.data;
}

export async function setAdminUserDisabled(
  uid: string,
  disabled: boolean,
): Promise<AdminUserActionResult> {
  const fn = httpsCallable<{ uid: string; disabled: boolean }, AdminUserActionResult>(functions, 'setAdminUserDisabled');
  const result = await fn({ uid, disabled });
  return result.data;
}

export async function clearAdminUserPushToken(uid: string): Promise<AdminUserActionResult> {
  const fn = httpsCallable<{ uid: string }, AdminUserActionResult>(functions, 'clearAdminUserPushToken');
  const result = await fn({ uid });
  return result.data;
}
