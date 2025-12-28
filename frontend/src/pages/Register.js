import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';

export default function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    first_name: '',
    last_name: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await register(formData);
      toast.success('Account created successfully!');
      navigate('/');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4" data-testid="register-page">
      <div className="w-full max-w-md">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-2" data-testid="register-title">Create Account</h1>
        <p className="text-muted-foreground mb-8" data-testid="register-subtitle">Join Lumina today</p>

        <form onSubmit={handleSubmit} className="space-y-6" data-testid="register-form">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2" data-testid="first-name-label">First Name</label>
              <input
                type="text"
                value={formData.first_name}
                onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                className="w-full input-underline"
                required
                data-testid="first-name-input"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2" data-testid="last-name-label">Last Name</label>
              <input
                type="text"
                value={formData.last_name}
                onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                className="w-full input-underline"
                required
                data-testid="last-name-input"
              />
            </div>
          </div>

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
              minLength={6}
              data-testid="password-input"
            />
            <p className="text-xs text-muted-foreground mt-1" data-testid="password-hint">Minimum 6 characters</p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary"
            data-testid="register-submit-button"
          >
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <div className="mt-8 text-center" data-testid="login-link-section">
          <p className="text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link to="/login" className="text-primary hover:underline" data-testid="login-link">
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
