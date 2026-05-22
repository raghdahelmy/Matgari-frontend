'use client';

import { useState } from 'react';
import { useLocale } from 'next-intl';
import { sendContactMessage } from '@/lib/api';
import Toast from './Toast';

interface Labels {
  name: string;
  email: string;
  subject: string;
  message: string;
  submit: string;
  submitting: string;
  success: string;
  error: string;
}

export default function ContactForm({ labels }: { labels: Labels }) {
  const locale = useLocale();
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await sendContactMessage({ ...formData, locale });

      if (res.status) {
        setToast({ message: res.message || labels.success, type: 'success' });
        setFormData({ name: '', email: '', subject: '', message: '' });
      } else {
        const firstError = res.errors ? Object.values(res.errors)[0] : null;
        setToast({
          message: Array.isArray(firstError) ? firstError[0] : (res.message || labels.error),
          type: 'error',
        });
      }
    } catch {
      setToast({ message: labels.error, type: 'error' });
    } finally {
      setLoading(false);
      setTimeout(() => setToast(null), 4000);
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-5">
          <div>
            <label className="block text-sm font-medium mb-2 text-[var(--color-text)]">
              {labels.name}
            </label>
            <input
              type="text"
              name="name"
              required
              value={formData.name}
              onChange={handleChange}
              className="form-input"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2 text-[var(--color-text)]">
              {labels.email}
            </label>
            <input
              type="email"
              name="email"
              required
              value={formData.email}
              onChange={handleChange}
              className="form-input"
              dir="ltr"
            />
          </div>
        </div>

        <div className="mb-5">
          <label className="block text-sm font-medium mb-2 text-[var(--color-text)]">
            {labels.subject}
          </label>
          <input
            type="text"
            name="subject"
            required
            value={formData.subject}
            onChange={handleChange}
            className="form-input"
          />
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium mb-2 text-[var(--color-text)]">
            {labels.message}
          </label>
          <textarea
            name="message"
            required
            rows={6}
            value={formData.message}
            onChange={handleChange}
            className="form-input resize-none"
          />
        </div>

        <button type="submit" className="btn btn-primary btn-lg w-full" disabled={loading}>
          {loading ? labels.submitting : labels.submit}
        </button>
      </form>

      {toast && <Toast message={toast.message} type={toast.type} />}
    </>
  );
}
