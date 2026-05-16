import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import Button from '../../components/common/Button.jsx';
import { useAuth } from '../../hooks/useAuth.js';

const schema = yup.object({
  email: yup.string().email().required(),
  password: yup.string().min(6).required(),
});

export default function Login() {
  const { user, loading, login } = useAuth();
  const navigate = useNavigate();
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
      const data = await login(values);
      if (data.success) {
        toast.success('Welcome back');
        navigate('/dashboard');
      } else toast.error(data.message || 'Login failed');
    } catch (e) {
      toast.error(e.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className="mx-auto max-w-md space-y-6 rounded-3xl border border-ink/5 bg-white p-8 shadow-sm">
      <div>
        <h1 className="font-serif text-3xl text-ink">Welcome back</h1>
        <p className="mt-2 text-sm text-ink/60">Log in to continue borrowing and lending nearby.</p>
      </div>
      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
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
            autoComplete="current-password"
            {...register('password')}
          />
          {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>}
        </div>
        <Button type="submit" className="w-full" disabled={isSubmitting || loading}>
          {isSubmitting ? 'Signing in…' : 'Sign in'}
        </Button>
      </form>
      <p className="text-center text-sm text-ink/60">
        New here?{' '}
        <Link className="font-semibold text-primary" to="/register">
          Create an account
        </Link>
      </p>
    </div>
  );
}
