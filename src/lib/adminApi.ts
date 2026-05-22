/**
 * Super Admin API client.
 * All endpoints hit the central API (not tenant subdomain).
 */
import { getToken } from './auth';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://api-matgary.test/api';

export interface AdminResponse<T = unknown> {
  status: boolean;
  message: string;
  data: T;
  errors?: Record<string, string[]>;
}

async function adminFetch<T = unknown>(
  endpoint: string,
  options: RequestInit = {}
): Promise<AdminResponse<T>> {
  const token = getToken();
  const isFormData = options.body instanceof FormData;

  const headers: Record<string, string> = {
    Accept: 'application/json',
    ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...((options.headers as Record<string, string>) || {}),
  };

  try {
    const res = await fetch(`${API_BASE}${endpoint}`, { ...options, headers });
    if (res.status === 204) return { status: true, message: '', data: null as T };
    return await res.json();
  } catch (err) {
    return {
      status: false,
      message: err instanceof Error ? err.message : 'Network error',
      data: null as T,
    };
  }
}

// ---------- Tenants (vendors) ----------
export type VendorStatus = 'pending' | 'approved' | 'rejected' | 'cancelled';

export interface Vendor {
  id: number;
  name: string;
  email: string;
  phone?: string;
  store_name?: string;
  status: VendorStatus;
  created_at?: string;
  tenant_active?: boolean;
}

export interface TenantStats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  cancelled: number;
  total_stores: number;
  active_stores: number;
  awaiting_payment: number;
  suspended_stores: number;
}

export async function getTenants(status?: VendorStatus | 'all') {
  const qs = status && status !== 'all' ? `?status=${status}` : '';
  return adminFetch<Vendor[]>(`/tenants${qs}`);
}

export async function getTenantSubscriptions(userId: number) {
  return adminFetch<AdminSubscription[]>(`/admin/subscriptions?user_id=${userId}`);
}

export async function getTenantStats() {
  return adminFetch<TenantStats>('/tenants/stats');
}

export async function approveTenant(id: number) {
  return adminFetch<Vendor>(`/tenants/${id}/approve`, { method: 'PATCH' });
}

export async function rejectTenant(id: number) {
  return adminFetch<Vendor>(`/tenants/${id}/reject`, { method: 'PATCH' });
}

export async function cancelTenant(id: number) {
  return adminFetch<Vendor>(`/tenants/${id}/cancel`, { method: 'PATCH' });
}

export async function suspendTenant(id: number, reason?: string) {
  return adminFetch<Vendor>(`/tenants/${id}/suspend`, {
    method: 'PATCH',
    body: JSON.stringify({ reason: reason ?? '' }),
  });
}

export async function activateTenant(id: number) {
  return adminFetch<Vendor>(`/tenants/${id}/activate`, { method: 'PATCH' });
}

// ---------- Plans ----------
export interface AdminPlan {
  id: number;
  name: string;
  slug: string;
  description?: string;
  pricing: {
    monthly_price: string;
    yearly_price: string;
    currency: string;
    yearly_discount: number;
  };
  limits: Record<string, number | null>;
  features: Record<string, boolean>;
  features_list?: string[];
  sort_order?: number;
  is_popular?: boolean;
  status: boolean;
}

export async function getAdminPlans() {
  return adminFetch<AdminPlan[]>('/admin/plans');
}

export async function getAdminPlan(id: number) {
  return adminFetch<AdminPlan>(`/admin/plans/${id}`);
}

export async function createPlan(payload: Record<string, unknown>) {
  return adminFetch<AdminPlan>('/admin/plans', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function updatePlan(id: number, payload: Record<string, unknown>) {
  return adminFetch<AdminPlan>(`/admin/plans/${id}`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function deletePlan(id: number) {
  return adminFetch(`/admin/plans/${id}`, { method: 'DELETE' });
}

// ---------- Subscriptions ----------
export type SubStatus = 'active' | 'pending' | 'expired' | 'cancelled' | 'grace_period';

export interface AdminSubscription {
  id: number;
  user_id: number;
  plan_id: number;
  billing_cycle: 'monthly' | 'yearly';
  amount: number;
  currency: string;
  payment_method?: string;
  payment_receipt?: string;
  status: SubStatus;
  starts_at?: string;
  ends_at?: string;
  notes?: string;
  created_at: string;
  user?: { id: number; name: string; email: string; phone?: string; store_name?: string };
  plan?: { id: number; name: string; slug: string };
}

export async function getAdminSubscriptions(params: { status?: string; search?: string } = {}) {
  const query = new URLSearchParams();
  if (params.status && params.status !== 'all') query.set('status', params.status);
  if (params.search) query.set('search', params.search);
  const qs = query.toString();
  return adminFetch<AdminSubscription[]>(`/admin/subscriptions${qs ? `?${qs}` : ''}`);
}

export interface SubscriptionStats {
  total: number;
  active: number;
  pending: number;
  expired: number;
  cancelled: number;
  total_revenue: number;
  monthly_revenue?: number;
}

export async function getSubscriptionsStats() {
  return adminFetch<SubscriptionStats>('/admin/subscriptions/stats');
}

export async function getAdminSubscription(id: number) {
  return adminFetch<AdminSubscription>(`/admin/subscriptions/${id}`);
}

export async function confirmSubscription(id: number) {
  return adminFetch<AdminSubscription>(`/admin/subscriptions/${id}/confirm`, { method: 'POST' });
}

export async function rejectSubscription(id: number, notes?: string) {
  return adminFetch<AdminSubscription>(`/admin/subscriptions/${id}/reject`, {
    method: 'POST',
    body: JSON.stringify({ notes: notes ?? '' }),
  });
}

export async function cancelSubscription(id: number) {
  return adminFetch<AdminSubscription>(`/admin/subscriptions/${id}/cancel`, { method: 'POST' });
}

export async function assignSubscription(formData: FormData) {
  return adminFetch<AdminSubscription>('/admin/subscriptions/assign', {
    method: 'POST',
    body: formData,
  });
}

// ---------- Marketing Contact Messages ----------
export interface MarketingMessage {
  id: number;
  name: string;
  email: string;
  subject?: string;
  message: string;
  locale: string;
  is_read: boolean;
  is_replied: boolean;
  ip?: string;
  created_at: string;
}

export async function getMarketingMessages(params: { is_read?: boolean; search?: string } = {}) {
  const query = new URLSearchParams();
  if (params.is_read !== undefined) query.set('is_read', params.is_read ? '1' : '0');
  if (params.search) query.set('search', params.search);
  const qs = query.toString();
  return adminFetch<MarketingMessage[]>(`/admin/marketing/contact${qs ? `?${qs}` : ''}`);
}

export async function getMarketingUnreadCount() {
  return adminFetch<{ count: number }>('/admin/marketing/contact/unread-count');
}

export async function getMarketingMessage(id: number) {
  return adminFetch<MarketingMessage>(`/admin/marketing/contact/${id}`);
}

export async function markMarketingReplied(id: number) {
  return adminFetch<MarketingMessage>(`/admin/marketing/contact/${id}/replied`, { method: 'POST' });
}

export async function deleteMarketingMessage(id: number) {
  return adminFetch(`/admin/marketing/contact/${id}`, { method: 'DELETE' });
}
