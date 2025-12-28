import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await login(formData.email, formData.password);
      toast.success('Welcome back!');
      navigate('/');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4" data-testid="login-page">
      <div className="w-full max-w-md">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-2" data-testid="login-title">Welcome Back</h1>
        <p className="text-muted-foreground mb-8" data-testid="login-subtitle">Login to your account</p>

        <form onSubmit={handleSubmit} className="space-y-6" data-testid="login-form">
          <div>
            <label className="block text-sm font-medium mb-2" data-testid="email-label">Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full input-underline"
              required
              data-testid="email-input"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" data-testid="password-label">Password</label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full input-underline"
              required
              data-testid="password-input"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary"
            data-testid="login-submit-button"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div className="mt-8 text-center" data-testid="register-link-section">
          <p className="text-sm text-muted-foreground">
            Don't have an account?{' '}
            <Link to="/register" className="text-primary hover:underline" data-testid="register-link">
              Register
            </Link>
          </p>
        </div>

        <div className="mt-8 p-6 bg-secondary" data-testid="demo-credentials">
          <p className="text-sm font-semibold mb-2">Demo Credentials:</p>
          <p className="text-sm text-muted-foreground">Email: user@test.com</p>
          <p className="text-sm text-muted-foreground">Password: user123</p>
          <p className="text-sm text-muted-foreground mt-2">Admin: admin@lumina.com / admin123</p>
        </div>
      </div>
    </div>
  );
}
