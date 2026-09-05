import { Eye, EyeOff, LockKeyhole, LogIn } from 'lucide-react';
import { useRef, useState } from 'react';
import type { FormEvent } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import Button from '../components/Button';
import { useAdminAuth } from '../features/admin/auth/AdminAuthContext';

interface LoginValues {
  email: string;
  password: string;
}

type LoginErrors = Partial<Record<keyof LoginValues, string>>;

const initialLoginValues: LoginValues = {
  email: '',
  password: '',
};

function validateLogin(values: LoginValues) {
  const errors: LoginErrors = {};
  const email = values.email.trim();

  if (!email) {
    errors.email = 'يرجى إدخال البريد الإلكتروني';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.email = 'البريد الإلكتروني غير صالح';
  }

  if (!values.password) {
    errors.password = 'يرجى إدخال كلمة المرور';
  }

  return errors;
}

export default function AdminLoginPage() {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading, login } = useAdminAuth();
  const [values, setValues] = useState<LoginValues>(initialLoginValues);
  const [errors, setErrors] = useState<LoginErrors>({});
  const [formError, setFormError] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isSubmittingRef = useRef(false);

  if (!isLoading && isAuthenticated) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  function updateField(field: keyof LoginValues, value: string) {
    setValues((current) => ({ ...current, [field]: value }));
    setFormError('');

    if (errors[field]) {
      setErrors((current) => {
        const next = { ...current };
        delete next[field];
        return next;
      });
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isSubmittingRef.current) {
      return;
    }

    const nextErrors = validateLogin(values);

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setIsSubmitting(true);
    isSubmittingRef.current = true;

    const result = await login(values.email, values.password);

    if (result.success) {
      navigate('/admin/dashboard', { replace: true });
      return;
    }

    isSubmittingRef.current = false;
    setIsSubmitting(false);
    setFormError(result.message ?? 'بيانات تسجيل الدخول غير صحيحة');
  }

  return (
    <main
      className="min-h-screen bg-noviq-black px-4 py-10 text-noviq-text"
      dir="rtl"
      data-admin-login-page
    >
      <div className="mx-auto flex min-h-[calc(100vh-80px)] w-full max-w-md items-center justify-center">
        <div className="w-full rounded-md border border-noviq-border bg-noviq-card p-5 sm:p-6">
          <div className="mb-8 text-center">
            <p className="font-brand text-[32px] font-medium tracking-[0.08em] text-noviq-gold">
              NOVIQ
            </p>
            <p className="mt-2 text-xs font-semibold text-noviq-secondaryText">
              تسجيل الدخول إلى لوحة إدارة NOVIQ
            </p>
          </div>

          <div className="mb-6 text-center">
            <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-md border border-noviq-gold text-noviq-gold">
              <LockKeyhole size={21} strokeWidth={1.8} />
            </div>
            <p className="text-xs font-semibold text-noviq-gold">لوحة الإدارة</p>
            <h1 className="mt-3 font-heading text-2xl font-bold text-noviq-text">
              لوحة الإدارة
            </h1>
          </div>

          <form className="grid gap-4" onSubmit={handleSubmit} noValidate data-admin-login-form>
            <label className="grid gap-2 text-sm font-semibold text-noviq-secondaryText">
              <span>البريد الإلكتروني</span>
              <input
                aria-describedby={errors.email ? 'admin-email-error' : undefined}
                aria-invalid={Boolean(errors.email)}
                autoComplete="username"
                className="field"
                inputMode="email"
                onChange={(event) => updateField('email', event.target.value)}
                type="email"
                value={values.email}
                data-admin-email-input
              />
              {errors.email ? (
                <span id="admin-email-error" className="text-xs font-medium text-noviq-gold">
                  {errors.email}
                </span>
              ) : null}
            </label>

            <label className="grid gap-2 text-sm font-semibold text-noviq-secondaryText">
              <span>كلمة المرور</span>
              <span className="relative">
                <input
                  aria-describedby={errors.password ? 'admin-password-error' : undefined}
                  aria-invalid={Boolean(errors.password)}
                  autoComplete="current-password"
                  className="field pl-12"
                  onChange={(event) => updateField('password', event.target.value)}
                  type={isPasswordVisible ? 'text' : 'password'}
                  value={values.password}
                  data-admin-password-input
                />
                <button
                  className="absolute left-2 top-1/2 inline-flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-md text-noviq-muted transition hover:text-noviq-gold"
                  onClick={() => setIsPasswordVisible((current) => !current)}
                  type="button"
                  aria-label={isPasswordVisible ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}
                  data-admin-password-toggle
                >
                  {isPasswordVisible ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </span>
              {errors.password ? (
                <span id="admin-password-error" className="text-xs font-medium text-noviq-gold">
                  {errors.password}
                </span>
              ) : null}
            </label>

            {formError ? (
              <p
                className="rounded-md border border-noviq-gold/50 bg-noviq-secondary px-4 py-3 text-sm font-semibold leading-7 text-noviq-gold"
                role="alert"
                data-admin-login-error
              >
                {formError}
              </p>
            ) : null}

            <Button
              type="submit"
              icon={<LogIn size={18} />}
              className="mt-1 w-full"
              disabled={isSubmitting}
              data-admin-login-submit
            >
              {isSubmitting ? 'جاري تسجيل الدخول...' : 'تسجيل الدخول'}
            </Button>
          </form>
        </div>
      </div>
    </main>
  );
}
