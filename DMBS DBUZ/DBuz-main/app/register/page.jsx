'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabase';

export default function Register() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!agreeToTerms) {
      setError('You must agree to the terms.');
      setLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { name } },
      });
      if (error) throw error;
      router.push('/signup-success');
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen px-4 py-8">
      <h1 className="text-2xl font-bold text-center text-gray-800 mb-6">Create an Account</h1>
      {error && <p className="text-red-600 text-center mb-4">{error}</p>}
      <form onSubmit={handleSubmit} className="w-full max-w-md mx-auto flex flex-col gap-4">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Full Name"
          className="p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-600"
          required
          disabled={loading}
        />
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email Address"
          className="p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-600"
          required
          disabled={loading}
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          className="p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-600"
          required
          disabled={loading}
        />
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={agreeToTerms}
            onChange={() => setAgreeToTerms(!agreeToTerms)}
            className="accent-red-600"
            required
            disabled={loading}
          />
          <span className="text-sm text-gray-600">I agree to the terms and conditions</span>
        </label>
        <button
          type="submit"
          className={`bg-red-600 text-white py-3 rounded-md ${
            loading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-red-700'
          }`}
          disabled={loading}
        >
          {loading ? 'Signing Up...' : 'Sign Up'}
        </button>
      </form>
      <p className="text-center mt-4 text-sm">
        Already have an account?{' '}
        <Link href="/login" className="text-red-600 hover:underline">
          Login
        </Link>
      </p>
    </div>
  );
}