'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { subscribe, type Plan } from '@/lib/api';
import RevealOnScroll from './RevealOnScroll';
import Toast from './Toast';

interface Labels {
  title: string;
  subtitle: string;
  summary: {
    title: string;
    monthly: string;
    yearly: string;
    total: string;
    currency: string;
  };
  billing: { title: string; monthly: string; yearly: string };
  payment: {
    title: string;
    wallet: string;
    walletDesc: string;
    walletNumber: string;
    walletValue: string;
    instapay: string;
    instapayDesc: string;
    instapayHandle: string;
    instapayValue: string;
    amount: string;
  };
  receipt: {
    title: string;
    desc: string;
    uploadBtn: string;
    selected: string;
    fileTypes: string;
    tooLarge: string;
    invalidType: string;
  };
  submit: string;
  submitting: string;
  success: { title: string; desc: string; btn: string };
  errors: {
    noAuth: string;
    noPlan: string;
    noReceipt: string;
    submitFailed: string;
  };
  loginRequired: {
    title: string;
    desc: string;
    login: string;
    register: string;
  };
}

interface Props {
  plans: Plan[];
  initialPlan: Plan | null;
  locale: string;
  labels: Labels;
}

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB

export default function SubscribeClient({ plans, initialPlan, locale, labels }: Props) {
  const t = useTranslations('pages.subscribe');
  const router = useRouter();
  const [authChecked, setAuthChecked] = useState(false);
  const [isAuthed, setIsAuthed] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(initialPlan);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [paymentMethod, setPaymentMethod] = useState<'wallet' | 'instapay'>('wallet');
  const [receipt, setReceipt] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Check auth on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsAuthed(!!token);
    setAuthChecked(true);

    // Save intended plan for after auth
    if (initialPlan && !token) {
      localStorage.setItem('intended_plan', initialPlan.slug);
    }
  }, [initialPlan]);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const triggerAuth = (form: 'login' | 'register') => {
    const event = new CustomEvent('open-auth', { detail: { form } });
    window.dispatchEvent(event);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast(labels.receipt.invalidType, 'error');
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      showToast(labels.receipt.tooLarge, 'error');
      return;
    }
    setReceipt(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedPlan) {
      showToast(labels.errors.noPlan, 'error');
      return;
    }
    if (!receipt) {
      showToast(labels.errors.noReceipt, 'error');
      return;
    }
    if (!isAuthed) {
      showToast(labels.errors.noAuth, 'error');
      return;
    }

    setLoading(true);

    const formData = new FormData();
    formData.append('plan_id', String(selectedPlan.id));
    formData.append('billing_cycle', billingCycle);
    formData.append('payment_method', paymentMethod);
    formData.append('payment_receipt', receipt);

    try {
      const res = await subscribe(formData);

      if (res.status) {
        // Clear intended plan after success
        localStorage.removeItem('intended_plan');
        setSuccess(true);
        showToast(res.message, 'success');
      } else {
        const firstError = res.errors ? Object.values(res.errors)[0] : null;
        const errorMsg = Array.isArray(firstError) ? firstError[0] : (res.message || labels.errors.submitFailed);
        showToast(errorMsg, 'error');
      }
    } catch {
      showToast(labels.errors.submitFailed, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Loading state while checking auth
  if (!authChecked) {
    return (
      <section className="section-py">
        <div className="max-w-[600px] mx-auto px-6 text-center">
          <p className="text-[var(--color-text-muted)]">...</p>
        </div>
      </section>
    );
  }

  // Success state
  if (success) {
    return (
      <section className="section-py">
        <div className="max-w-[600px] mx-auto px-6 text-center pt-32 pb-20">
          <RevealOnScroll>
            <div className="w-20 h-20 rounded-full bg-[var(--color-bg-accent)] mx-auto mb-6 flex items-center justify-center">
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-[var(--color-success)]">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <h1
              className="text-3xl md:text-4xl font-semibold text-[var(--color-text)] mb-4"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              {labels.success.title}
            </h1>
            <p className="text-[var(--color-text-light)] leading-relaxed mb-8">
              {labels.success.desc}
            </p>
            <a href={`/${locale}`} className="btn btn-primary btn-lg inline-flex">
              {labels.success.btn}
            </a>
          </RevealOnScroll>
        </div>
      </section>
    );
  }

  // Login required state
  if (!isAuthed) {
    return (
      <section className="section-py">
        <div className="max-w-[520px] mx-auto px-6 pt-28 pb-20">
          <RevealOnScroll className="text-center">
            <div className="w-16 h-16 rounded-full bg-[var(--color-bg-accent)] mx-auto mb-5 flex items-center justify-center text-[var(--color-accent-dark)]">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" />
                <path d="M7 11V7a5 5 0 0110 0v4" />
              </svg>
            </div>
            <h1
              className="text-2xl md:text-3xl font-semibold text-[var(--color-text)] mb-3"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              {labels.loginRequired.title}
            </h1>
            <p className="text-[var(--color-text-light)] mb-8">{labels.loginRequired.desc}</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button onClick={() => triggerAuth('register')} className="btn btn-primary btn-lg">
                {labels.loginRequired.register}
              </button>
              <button onClick={() => triggerAuth('login')} className="btn btn-ghost btn-lg">
                {labels.loginRequired.login}
              </button>
            </div>
          </RevealOnScroll>
        </div>
      </section>
    );
  }

  // No plan selected
  if (!selectedPlan) {
    return (
      <section className="section-py">
        <div className="max-w-[520px] mx-auto px-6 pt-28 pb-20 text-center">
          <p className="text-[var(--color-text-light)] mb-6">{labels.errors.noPlan}</p>
          <a href={`/${locale}/pricing`} className="btn btn-primary btn-lg inline-flex">
            {labels.loginRequired.register === 'Create Account' ? 'View Plans' : 'شوف الباقات'}
          </a>
        </div>
      </section>
    );
  }

  const price = billingCycle === 'monthly'
    ? Math.round(parseFloat(selectedPlan.pricing.monthly_price))
    : Math.round(parseFloat(selectedPlan.pricing.yearly_price));

  return (
    <>
      <section className="pt-32 pb-20">
        <div className="max-w-[1100px] mx-auto px-6">
          {/* Header */}
          <RevealOnScroll className="text-center mb-12">
            <h1
              className="text-3xl md:text-4xl font-semibold text-[var(--color-text)] tracking-tight mb-3"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              {labels.title}
            </h1>
            <p className="text-[var(--color-text-light)]">{labels.subtitle}</p>
          </RevealOnScroll>

          {/* Plan Switcher (small) */}
          {plans.length > 1 && (
            <RevealOnScroll className="flex flex-wrap justify-center gap-2 mb-10">
              {plans.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setSelectedPlan(p)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all border ${
                    selectedPlan.id === p.id
                      ? 'bg-[var(--color-bg-dark)] text-white border-[var(--color-bg-dark)]'
                      : 'bg-white text-[var(--color-text-light)] border-[var(--color-border)] hover:border-[var(--color-accent)]'
                  }`}
                >
                  {p.name}
                </button>
              ))}
            </RevealOnScroll>
          )}

          <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8">
            {/* Left: Form sections */}
            <div className="space-y-5 order-2 lg:order-1">
              {/* Billing Cycle */}
              <FormCard title={labels.billing.title}>
                <div className="grid grid-cols-2 gap-3">
                  <RadioOption
                    selected={billingCycle === 'monthly'}
                    onClick={() => setBillingCycle('monthly')}
                    title={labels.billing.monthly}
                    subtitle={`${Math.round(parseFloat(selectedPlan.pricing.monthly_price)).toLocaleString()} ${labels.summary.currency}`}
                  />
                  <RadioOption
                    selected={billingCycle === 'yearly'}
                    onClick={() => setBillingCycle('yearly')}
                    title={labels.billing.yearly}
                    subtitle={`${Math.round(parseFloat(selectedPlan.pricing.yearly_price)).toLocaleString()} ${labels.summary.currency}`}
                    badge={
                      selectedPlan.pricing.yearly_discount > 0
                        ? t('summary.save', { percent: Math.round(selectedPlan.pricing.yearly_discount) })
                        : undefined
                    }
                  />
                </div>
              </FormCard>

              {/* Payment Method */}
              <FormCard title={labels.payment.title}>
                <div className="space-y-3">
                  <PaymentOption
                    selected={paymentMethod === 'wallet'}
                    onClick={() => setPaymentMethod('wallet')}
                    title={labels.payment.wallet}
                    desc={labels.payment.walletDesc}
                    icon={
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M5 11h14a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2z" />
                        <path d="M16 7V5a2 2 0 00-2-2H10a2 2 0 00-2 2v2" />
                      </svg>
                    }
                  />
                  <PaymentOption
                    selected={paymentMethod === 'instapay'}
                    onClick={() => setPaymentMethod('instapay')}
                    title={labels.payment.instapay}
                    desc={labels.payment.instapayDesc}
                    icon={
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <rect x="2" y="6" width="20" height="12" rx="2" />
                        <line x1="2" y1="10" x2="22" y2="10" />
                      </svg>
                    }
                  />
                </div>

                {/* Payment instructions */}
                <div className="mt-5 p-4 bg-[var(--color-bg-warm)] rounded-xl text-sm">
                  <p className="text-[var(--color-text-muted)] mb-1.5">
                    {paymentMethod === 'wallet' ? labels.payment.walletNumber : labels.payment.instapayHandle}
                  </p>
                  <p className="text-[var(--color-text)] font-mono font-medium" dir="ltr">
                    {paymentMethod === 'wallet' ? labels.payment.walletValue : labels.payment.instapayValue}
                  </p>
                  <div className="mt-3 pt-3 border-t border-[var(--color-border-light)]">
                    <p className="text-[var(--color-text-muted)] text-xs mb-1">{labels.payment.amount}</p>
                    <p className="text-[var(--color-accent-dark)] text-lg font-bold" dir="ltr">
                      {price.toLocaleString()} {labels.summary.currency}
                    </p>
                  </div>
                </div>
              </FormCard>

              {/* Receipt Upload */}
              <FormCard title={labels.receipt.title} subtitle={labels.receipt.desc}>
                <label className="block">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  <div className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
                    receipt
                      ? 'border-[var(--color-accent)] bg-[var(--color-bg-accent)]'
                      : 'border-[var(--color-border)] hover:border-[var(--color-accent)] hover:bg-[var(--color-bg-warm)]'
                  }`}>
                    {receipt ? (
                      <div>
                        <div className="w-12 h-12 rounded-full bg-[var(--color-accent)] mx-auto mb-3 flex items-center justify-center text-white">
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        </div>
                        <p className="text-sm font-medium text-[var(--color-text)] mb-1">
                          {labels.receipt.selected}
                        </p>
                        <p className="text-xs text-[var(--color-text-muted)] truncate max-w-[280px] mx-auto" dir="ltr">
                          {receipt.name}
                        </p>
                      </div>
                    ) : (
                      <div>
                        <div className="w-12 h-12 rounded-full bg-[var(--color-bg-accent)] mx-auto mb-3 flex items-center justify-center text-[var(--color-accent-dark)]">
                          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                            <polyline points="17 8 12 3 7 8" />
                            <line x1="12" y1="3" x2="12" y2="15" />
                          </svg>
                        </div>
                        <p className="text-sm font-medium text-[var(--color-text)] mb-1">
                          {labels.receipt.uploadBtn}
                        </p>
                        <p className="text-xs text-[var(--color-text-muted)]">{labels.receipt.fileTypes}</p>
                      </div>
                    )}
                  </div>
                </label>
              </FormCard>

              {/* Submit */}
              <button type="submit" className="btn btn-primary btn-lg w-full" disabled={loading}>
                {loading ? labels.submitting : labels.submit}
              </button>
            </div>

            {/* Right: Plan Summary */}
            <div className="order-1 lg:order-2">
              <div className="lg:sticky lg:top-32">
                <FormCard title={labels.summary.title}>
                  <div className="mb-4 pb-4 border-b border-[var(--color-border-light)]">
                    <h3
                      className="text-2xl font-semibold text-[var(--color-text)] mb-1"
                      style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                    >
                      {selectedPlan.name}
                    </h3>
                    <p className="text-sm text-[var(--color-text-muted)]">{selectedPlan.description}</p>
                  </div>

                  <div className="flex justify-between items-center text-sm mb-2">
                    <span className="text-[var(--color-text-muted)]">
                      {billingCycle === 'monthly' ? labels.summary.monthly : labels.summary.yearly}
                    </span>
                    <span className="font-medium text-[var(--color-text)]">
                      {price.toLocaleString()} {labels.summary.currency}
                    </span>
                  </div>

                  <div className="flex justify-between items-baseline pt-3 mt-3 border-t border-[var(--color-border-light)]">
                    <span className="font-semibold text-[var(--color-text)]">{labels.summary.total}</span>
                    <div className="text-end">
                      <span
                        className="text-3xl font-bold text-[var(--color-accent-dark)]"
                        style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                      >
                        {price.toLocaleString()}
                      </span>
                      <span className="text-sm text-[var(--color-text-muted)] ms-1">
                        {labels.summary.currency}
                      </span>
                    </div>
                  </div>

                  {/* Features */}
                  <ul className="mt-5 pt-5 border-t border-[var(--color-border-light)] space-y-2">
                    {selectedPlan.features_list.slice(0, 6).map((feat, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-xs text-[var(--color-text-light)]">
                        <span className="text-[var(--color-success)] mt-0.5 shrink-0">✓</span>
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </FormCard>
              </div>
            </div>
          </form>
        </div>
      </section>

      {toast && <Toast message={toast.message} type={toast.type} />}
    </>
  );
}

function FormCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-2xl border border-[var(--color-border-light)] p-6">
      <h3 className="text-base font-semibold text-[var(--color-text)] mb-1">{title}</h3>
      {subtitle && <p className="text-xs text-[var(--color-text-muted)] mb-4">{subtitle}</p>}
      <div className={subtitle ? '' : 'mt-4'}>{children}</div>
    </div>
  );
}

function RadioOption({
  selected,
  onClick,
  title,
  subtitle,
  badge,
}: {
  selected: boolean;
  onClick: () => void;
  title: string;
  subtitle: string;
  badge?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative p-4 rounded-xl border-2 text-start transition-all ${
        selected
          ? 'border-[var(--color-accent)] bg-[var(--color-bg-accent)]'
          : 'border-[var(--color-border)] hover:border-[var(--color-accent-light)]'
      }`}
    >
      {badge && (
        <span className="absolute top-2 end-2 bg-[var(--color-accent)] text-white text-[9px] font-semibold px-2 py-0.5 rounded-full">
          {badge}
        </span>
      )}
      <p className="font-medium text-[var(--color-text)] text-sm mb-0.5">{title}</p>
      <p className="text-xs text-[var(--color-text-muted)]" dir="ltr">{subtitle}</p>
    </button>
  );
}

function PaymentOption({
  selected,
  onClick,
  title,
  desc,
  icon,
}: {
  selected: boolean;
  onClick: () => void;
  title: string;
  desc: string;
  icon: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full flex items-center gap-3 p-4 rounded-xl border-2 text-start transition-all ${
        selected
          ? 'border-[var(--color-accent)] bg-[var(--color-bg-accent)]'
          : 'border-[var(--color-border)] hover:border-[var(--color-accent-light)]'
      }`}
    >
      <div
        className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
          selected ? 'bg-[var(--color-accent)] text-white' : 'bg-[var(--color-bg-warm)] text-[var(--color-text-light)]'
        }`}
      >
        {icon}
      </div>
      <div className="flex-1">
        <p className="font-medium text-[var(--color-text)] text-sm">{title}</p>
        <p className="text-xs text-[var(--color-text-muted)]">{desc}</p>
      </div>
      <div
        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
          selected ? 'border-[var(--color-accent)]' : 'border-[var(--color-border)]'
        }`}
      >
        {selected && <span className="w-2.5 h-2.5 rounded-full bg-[var(--color-accent)]" />}
      </div>
    </button>
  );
}
