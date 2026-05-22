'use client';

import { use, useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { getProduct, type Product } from '@/lib/tenantApi';
import ProductForm from '@/components/dashboard/ProductForm';
import PageHeader from '@/components/dashboard/PageHeader';

export default function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const tBase = useTranslations('pages.dashboard');
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getProduct(Number(id)).then((res) => {
      if (res.status) setProduct(res.data);
      setLoading(false);
    });
  }, [id]);

  if (loading) {
    return (
      <>
        <PageHeader title="..." />
        <div className="space-y-4">
          <div className="h-32 bg-[var(--color-bg-warm)] rounded-xl animate-pulse" />
          <div className="h-48 bg-[var(--color-bg-warm)] rounded-xl animate-pulse" />
        </div>
      </>
    );
  }

  if (!product) {
    return (
      <div className="bg-white rounded-xl p-12 text-center">
        <p className="text-[var(--color-text-muted)]">{tBase('error')}</p>
      </div>
    );
  }

  return <ProductForm mode="edit" product={product} />;
}
