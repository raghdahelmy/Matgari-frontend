'use client';

import { use, useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { getAdminPlan, type AdminPlan } from '@/lib/adminApi';
import PlanForm from '@/components/superadmin/PlanForm';
import PageHeader from '@/components/dashboard/PageHeader';

export default function EditPlanPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const tBase = useTranslations('pages.dashboard');
  const [plan, setPlan] = useState<AdminPlan | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAdminPlan(Number(id)).then((res) => {
      if (res.status) setPlan(res.data);
      setLoading(false);
    });
  }, [id]);

  if (loading) {
    return (
      <>
        <PageHeader title="..." />
        <div className="h-96 bg-[var(--color-bg-warm)] rounded-xl animate-pulse" />
      </>
    );
  }

  if (!plan) {
    return (
      <div className="bg-white rounded-xl p-12 text-center">
        <p className="text-[var(--color-text-muted)]">{tBase('error')}</p>
      </div>
    );
  }

  return <PlanForm mode="edit" plan={plan} />;
}
