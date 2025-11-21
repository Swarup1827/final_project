'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    // Note: This is a placeholder. You'll need to integrate with your actual auth endpoint
    // For now, this simulates a login and sets a mock token
    try {
      // TODO: Replace with actual API call to your authentication endpoint
      // const response = await authApi.login(formData);
      // localStorage.setItem('token', response.data.token);
      // localStorage.setItem('role', response.data.role);
      
      // Mock login for testing (remove in production)
      if (formData.username && formData.password) {
        // This is a temporary mock - replace with real auth
        const mockToken = 'mock-jwt-token';
        const mockRole = 'SHOP';
        localStorage.setItem('token', mockToken);
        localStorage.setItem('role', mockRole);
        router.push('/dashboard');
      } else {
        setError('Please enter username and password');
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="container">
      <div className="card" style={{ maxWidth: '400px', margin: '100px auto' }}>
        <h1 style={{ marginBottom: '24px', textAlign: 'center' }}>Login</h1>
        
        {error && <div className="error" style={{ marginBottom: '16px' }}>{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
            style={{ width: '100%' }}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <p style={{ marginTop: '16px', textAlign: 'center', fontSize: '14px', color: '#666' }}>
          Note: This is a mock login. Integrate with your actual authentication API.
        </p>
      </div>
    </div>
  );
}

