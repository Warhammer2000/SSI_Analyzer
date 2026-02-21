import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { BarChart3 } from 'lucide-react';

export default function Signup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    signup(email);
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-[#f3f2ef] flex flex-col items-center justify-center p-4">
      <div className="flex items-center gap-2 text-[#0a66c2] mb-8">
        <BarChart3 className="w-8 h-8" />
        <span className="text-2xl font-bold tracking-tight">SSI Analyzer</span>
      </div>

      <div className="bg-white p-8 rounded-lg border border-[#e0e0e0] shadow-sm w-full max-w-md">
        <h1 className="text-2xl font-bold text-[#000000e6] mb-2">Create Account</h1>
        <p className="text-[#00000099] mb-6">Start tracking your LinkedIn growth today</p>

        {error && (
          <div className="bg-[#ffebee] text-[#cc1016] p-3 rounded mb-4 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#000000e6] mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-[#00000099] rounded hover:bg-[#f3f2ef] focus:outline-none focus:ring-1 focus:ring-[#0a66c2]"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#000000e6] mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-[#00000099] rounded hover:bg-[#f3f2ef] focus:outline-none focus:ring-1 focus:ring-[#0a66c2]"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#000000e6] mb-1">Confirm Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-3 py-2 border border-[#00000099] rounded hover:bg-[#f3f2ef] focus:outline-none focus:ring-1 focus:ring-[#0a66c2]"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-[#0a66c2] text-white py-3 rounded-full font-bold hover:bg-[#004182] transition-colors mt-2"
          >
            Create Account
          </button>
        </form>

        <div className="mt-6 text-center text-sm">
          <span className="text-[#00000099]">Already have an account? </span>
          <Link to="/login" className="text-[#0a66c2] font-semibold hover:underline">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
