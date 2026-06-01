const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://api-matgary.test/api';

export async function apiFetch<T = unknown>(
  endpoint: string,
  options: RequestInit = {}
): Promise<{ status: boolean; message: string; data: T; errors?: Record<string, string[]> }> {
  const headers: Record<string, string> = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  return res.json();
}

export async function login(email: string, password: string) {
  return apiFetch<{ token: string; user: User }>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export async function register(data: RegisterData) {
  return apiFetch<{ token: string; user: User }>('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ ...data, role: 'vendor' }),
  });
}

export interface StoreInfo {
  status: 'pending_approval' | 'no_subscription' | 'pending_activation' | 'suspended' | 'active';
  message: string;
  domain?: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: string;
  store_name: string;
  status: string;
  store?: StoreInfo;
}

export async function getMe(locale?: string) {
  return apiFetch<User>('/auth/me', {
    headers: locale ? { 'Accept-Language': locale } as Record<string, string> : undefined,
  });
}

export interface RegisterData {
  name: string;
  store_name: string;
  email: string;
  phone: string;
  password: string;
  password_confirmation: string;
}

export interface PlanLimits {
  products: number | null;
  categories: number | null;
  sub_categories: number | null;
  brands: number | null;
  sliders: number | null;
  coupons: number | null;
  pages: number | null;
  orders_per_month: number | null;
}

export interface PlanFeatures {
  product_variants: boolean;
  multi_images: boolean;
  advanced_reports: boolean;
  advanced_seo: boolean;
  custom_domain: boolean;
  api_access: boolean;
  priority_support: boolean;
}

export interface Plan {
  id: number;
  name: string;
  slug: string;
  description: string;
  pricing: {
    monthly_price: string;
    yearly_price: string;
    currency: string;
    yearly_discount: number;
  };
  limits: PlanLimits;
  features: PlanFeatures;
  features_list: string[];
  sort_order: number;
  is_popular: boolean;
  status: boolean;
}

export interface ContactPayload {
  name: string;
  email: string;
  subject?: string;
  message: string;
  locale?: string;
}

export async function sendContactMessage(payload: ContactPayload) {
  return apiFetch<{ id: number }>('/marketing/contact', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function getPlanBySlug(slug: string, locale: string = 'ar'): Promise<Plan | null> {
  const plans = await getPlans(locale);
  return plans.find((p) => p.slug === slug) ?? null;
}

export async function subscribe(formData: FormData) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  const res = await fetch(`${API_BASE}/subscription/subscribe`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: formData,
  });

  return res.json() as Promise<{
    status: boolean;
    message: string;
    data?: unknown;
    errors?: Record<string, string[]>;
  }>;
}

export async function getPlans(locale: string = 'ar'): Promise<Plan[]> {
  const res = await fetch(`${API_BASE}/plans`, {
    headers: {
      Accept: 'application/json',
      'Accept-Language': locale,
    },
    next: { revalidate: 300 }, // ISR: revalidate every 5 mins
  });

  if (!res.ok) return [];

  const json = await res.json();
  return json.data || [];
}
