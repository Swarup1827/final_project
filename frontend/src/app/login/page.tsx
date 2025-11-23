'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';

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

    try {
      // Call your actual authentication endpoint
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/v1/auth/login`,
        formData
      );

      // Assuming your backend returns: { token: string, role: 'ADMIN' | 'SHOP' }
      const { token, role } = response.data;
      
      // Store token and role in localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('role', role);

      // Redirect based on role
      if (role === 'ADMIN') {
        router.push('/admin/dashboard');
      } else if (role === 'SHOP') {
        router.push('/dashboard');
      } else {
        setError('Invalid user role');
      }
    } catch (err: any) {
      setError(err.response?.data?.error || err.response?.data?.message || 'Login failed. Please check your credentials.');
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
        
        {error && (
          <div 
            className="error" 
            style={{ 
              marginBottom: '16px',
              padding: '12px',
              backgroundColor: '#f8d7da',
              border: '1px solid #f5c6cb',
              borderRadius: '4px',
              color: '#721c24'
            }}
          >
            {error}
          </div>
        )}
        
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
              autoComplete="username"
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
              autoComplete="current-password"
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

        <div style={{ 
          marginTop: '20px', 
          padding: '12px', 
          backgroundColor: '#e7f3ff',
          borderRadius: '4px',
          fontSize: '13px',
          color: '#004085'
        }}>
          <p style={{ margin: '0 0 8px 0', fontWeight: '600' }}>Test Accounts:</p>
          <p style={{ margin: '0 0 4px 0' }}>• Admin: admin / admin123</p>
          <p style={{ margin: 0 }}>• Shop Owner: shop1 / shop123</p>
        </div>
      </div>
    </div>
  );
}