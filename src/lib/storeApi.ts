/**
 * Storefront API client.
 * Used by the customer-facing store pages (e.g. /store/[slug]/...).
 * Unlike tenantApi.ts (which uses the logged-in vendor's subdomain),
 * this takes an explicit store slug from the URL.
 */
import { getToken } from './auth';

const CENTRAL_API = process.env.NEXT_PUBLIC_API_URL || 'http://api-matgary.test/api';

function buildBase(storeSlug: string): string {
  try {
    const u = new URL(CENTRAL_API);
    u.hostname = `${storeSlug}.${u.hostname}`;
    // Tenant routes are mounted under /api/store/* by the backend
    return u.toString().replace(/\/$/, '') + '/store';
  } catch {
    return CENTRAL_API;
  }
}

export interface StoreApiResponse<T = unknown> {
  status: boolean;
  message: string;
  data: T;
  errors?: Record<string, string[]>;
}

export async function storeFetch<T = unknown>(
  storeSlug: string,
  endpoint: string,
  options: RequestInit = {}
): Promise<StoreApiResponse<T>> {
  const base = buildBase(storeSlug);
  const token = getToken();
  const isFormData = options.body instanceof FormData;

  const headers: Record<string, string> = {
    Accept: 'application/json',
    ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...((options.headers as Record<string, string>) || {}),
  };

  try {
    const res = await fetch(`${base}${endpoint}`, { ...options, headers });
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

// ---------- Store settings ----------
export interface StoreSettings {
  store_name?: string;
  logo?: string;
  favicon?: string;
  store_phone?: string;
  store_email?: string;
  store_address?: string;
  facebook?: string;
  instagram?: string;
  twitter?: string;
  whatsapp?: string;
  currency?: string;
  meta_title?: string;
  meta_description?: string;
}

export async function getStoreSettings(slug: string) {
  return storeFetch<StoreSettings>(slug, '/settings');
}

// ---------- Public catalog ----------
export interface StoreProduct {
  id: number;
  name: string;
  slug: string;
  description?: string;
  price: number;
  compare_price?: number | null;
  stock?: number;
  image?: string | null;
  images?: string[];
  category?: { id: number; name: string; slug: string };
  brand?: { id: number; name: string };
  featured?: boolean;
  status?: boolean;
  rating?: { average: number; count: number };
}

export async function getStoreProducts(
  slug: string,
  params: { search?: string; category?: string; brand?: string; sort?: string; page?: number } = {}
) {
  const query = new URLSearchParams();
  if (params.search) query.set('search', params.search);
  if (params.category) query.set('category', params.category);
  if (params.brand) query.set('brand', params.brand);
  if (params.sort) query.set('sort', params.sort);
  if (params.page) query.set('page', String(params.page));
  const qs = query.toString();
  return storeFetch<{ data: StoreProduct[]; meta?: { total: number; current_page: number; last_page: number } } | StoreProduct[]>(
    slug,
    `/products${qs ? `?${qs}` : ''}`
  );
}

export async function getStoreProduct(slug: string, productSlug: string) {
  return storeFetch<StoreProduct>(slug, `/products/${productSlug}`);
}

// ---------- Categories ----------
export interface StoreCategory {
  id: number;
  name: string;
  slug: string;
  image?: string | null;
}

export async function getStoreCategories(slug: string) {
  return storeFetch<StoreCategory[]>(slug, '/categories');
}

// ---------- Sliders ----------
export interface StoreSlider {
  id: number;
  title?: string;
  description?: string;
  image: string;
  link?: string;
}

export async function getStoreSliders(slug: string) {
  return storeFetch<StoreSlider[]>(slug, '/sliders');
}

// ---------- Cart (auth required) ----------
export interface CartItem {
  id: number;
  product_id: number;
  product_variant_id?: number;
  product_name: string;
  variant_name?: string;
  image?: string;
  price: number;
  quantity: number;
  total: number;
}

export interface Cart {
  items: CartItem[];
  subtotal: number;
  discount: number;
  total: number;
  coupon_code?: string;
}

export async function getCart(slug: string) {
  return storeFetch<Cart>(slug, '/cart');
}

export async function addToCart(slug: string, payload: {
  product_id: number;
  product_variant_id?: number;
  quantity: number;
}) {
  return storeFetch<Cart>(slug, '/cart/items', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function updateCartItem(slug: string, itemId: number, quantity: number) {
  return storeFetch<Cart>(slug, `/cart/items/${itemId}`, {
    method: 'POST',
    body: JSON.stringify({ quantity }),
  });
}

export async function removeCartItem(slug: string, itemId: number) {
  return storeFetch<Cart>(slug, `/cart/items/${itemId}`, { method: 'DELETE' });
}

export async function clearCart(slug: string) {
  return storeFetch(slug, '/cart/clear', { method: 'DELETE' });
}

export async function applyCartCoupon(slug: string, code: string) {
  return storeFetch<Cart>(slug, '/cart/coupon', {
    method: 'POST',
    body: JSON.stringify({ code }),
  });
}

export async function removeCartCoupon(slug: string) {
  return storeFetch<Cart>(slug, '/cart/coupon', { method: 'DELETE' });
}

// ---------- Orders (Customer) ----------
export interface StoreOrder {
  id: number;
  order_number: string;
  status: string;
  payment_status: string;
  payment_method: string;
  subtotal: number;
  discount: number;
  shipping_cost: number;
  total: number;
  name: string;
  phone?: string;
  email?: string;
  address?: string;
  city?: string;
  notes?: string;
  items?: Array<{ id: number; product_name: string; price: number; quantity: number; total: number }>;
  created_at: string;
  invoice?: { download_url: string; preview_url: string; share_link_url: string };
}

export interface CreateOrderPayload {
  name: string;
  phone: string;
  email?: string;
  address: string;
  city: string;
  notes?: string;
  payment_method: 'cash' | 'wallet' | 'instapay' | 'card';
  shipping_cost?: number;
}

export async function createOrder(slug: string, payload: CreateOrderPayload) {
  return storeFetch<StoreOrder>(slug, '/orders', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function getMyOrders(slug: string) {
  return storeFetch<StoreOrder[]>(slug, '/orders');
}

export async function getMyOrder(slug: string, id: number) {
  return storeFetch<StoreOrder>(slug, `/orders/${id}`);
}

export async function cancelMyOrder(slug: string, id: number) {
  return storeFetch<StoreOrder>(slug, `/orders/${id}/cancel`, { method: 'POST' });
}

export async function getInvoiceShareLink(slug: string, id: number, locale: string = 'ar') {
  return storeFetch<{ url: string; expires_in_days: number }>(
    slug,
    `/orders/${id}/invoice/share-link?locale=${locale}`
  );
}

// ---------- Wishlist ----------
export async function getWishlist(slug: string) {
  return storeFetch<StoreProduct[]>(slug, '/wishlist');
}

export async function toggleWishlist(slug: string, productId: number) {
  return storeFetch<{ added: boolean }>(slug, '/wishlist/toggle', {
    method: 'POST',
    body: JSON.stringify({ product_id: productId }),
  });
}

export async function clearWishlist(slug: string) {
  return storeFetch(slug, '/wishlist/clear', { method: 'DELETE' });
}
