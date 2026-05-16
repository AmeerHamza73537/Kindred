import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import Button from '../../components/common/Button.jsx';
import { useAuth } from '../../hooks/useAuth.js';
import { useGeoLocation } from '../../hooks/useLocation.js';

const schema = yup.object({
  name: yup.string().min(2).required(),
  email: yup.string().email().required(),
  password: yup.string().min(6).required(),
});

export default function Register() {
  const { user, loading, register: regUser } = useAuth();
  const navigate = useNavigate();
  const { coords, detect } = useGeoLocation();

  useEffect(() => {
    detect();
  }, [detect]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: yupResolver(schema) });

  if (!loading && user) {
    return <Navigate to="/dashboard" replace />;
  }

  const onSubmit = async (values) => {
    try {
      const payload = { ...values };
      if (coords) {
        payload.lat = coords.lat;
        payload.lng = coords.lng;
      }
      const data = await regUser(payload);
      if (data.success) {
        toast.success('Account created');
        navigate('/dashboard');
      } else toast.error(data.message || 'Could not register');
    } catch (e) {
      toast.error(e.response?.data?.message || 'Could not register');
    }
  };

  return (
    <div className="mx-auto max-w-md space-y-6 rounded-3xl border border-ink/5 bg-white p-8 shadow-sm">
      <div>
        <h1 className="font-serif text-3xl text-ink">Join Kindred</h1>
        <p className="mt-2 text-sm text-ink/60">
          Create a profile to start sharing within five miles. We use your browser location once to place you on the
          map (optional).
        </p>
      </div>
      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
        <div>
          <label className="text-xs font-semibold uppercase tracking-wide text-ink/50">Name</label>
          <input
            className="mt-1 w-full rounded-xl border border-ink/10 px-3 py-2 text-sm outline-none ring-primary/30 focus:ring-2"
            autoComplete="name"
            {...register('name')}
          />
          {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name.message}</p>}
        </div>
        <div>
          <label className="text-xs font-semibold uppercase tracking-wide text-ink/50">Email</label>
          <input
            className="mt-1 w-full rounded-xl border border-ink/10 px-3 py-2 text-sm outline-none ring-primary/30 focus:ring-2"
            type="email"
            autoComplete="email"
            {...register('email')}
          />
          {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>}
        </div>
        <div>
          <label className="text-xs font-semibold uppercase tracking-wide text-ink/50">Password</label>
          <input
            className="mt-1 w-full rounded-xl border border-ink/10 px-3 py-2 text-sm outline-none ring-primary/30 focus:ring-2"
            type="password"
            autoComplete="new-password"
            {...register('password')}
          />
          {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>}
        </div>
        <Button type="submit" className="w-full" disabled={isSubmitting || loading}>
          {isSubmitting ? 'Creating…' : 'Create account'}
        </Button>
      </form>
      <p className="text-center text-sm text-ink/60">
        Already have an account?{' '}
        <Link className="font-semibold text-primary" to="/login">
          Log in
        </Link>
      </p>
    </div>
  );
}
