'use client';
import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';

const PaymentApp = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paymentInitiated, setPaymentInitiated] = useState(false);

  // Default values to avoid SSR crash
  const [fare, setFare] = useState(1500);
  const [busId, setBusId] = useState('1');
  const [seat, setSeat] = useState('A1');
  const [boarding, setBoarding] = useState('Koyambedu');
  const [drop, setDrop] = useState('Gandhipuram');

  // Hydrate URL params safely on client
  useEffect(() => {
    if (searchParams) {
      setFare(parseInt(searchParams.get('fare') || '1500'));
      setBusId(searchParams.get('busId') || '1');
      setSeat(searchParams.get('seat') || 'A1');
      setBoarding(searchParams.get('boarding') || 'Koyambedu');
      setDrop(searchParams.get('drop') || 'Gandhipuram');
    }
  }, [searchParams]);

  // Authenticate user
  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
      } else {
        setUser(user);
        setLoading(false);
      }
    };
    init();
  }, [router]);

  // GPay redirect only runs in browser
  useEffect(() => {
    if (typeof window !== 'undefined' && user && !paymentInitiated) {
      const upiLink = `upi://pay?pa=vedantchandrasingh21-1@oksbi&pn=BusBooking&am=${fare}&cu=INR`;
      window.location.href = upiLink;
      setPaymentInitiated(true);
    }
  }, [user, fare, paymentInitiated]);

  const handleConfirmBooking = async () => {
    try {
      const res = await fetch('/api/confirm-booking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, busId, seat, boarding, drop }),
      });

      const result = await res.json();
      if (result.success) {
        router.push('/payment-success');
      } else {
        alert('Booking failed: ' + result.error);
      }
    } catch (err) {
      alert('Something went wrong.');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen text-gray-600">
        Loading...
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-100 p-4">
      <div className="bg-white rounded-lg shadow-md p-6 mb-4">
        <h1 className="text-xl font-bold mb-2">Confirm Payment</h1>
        <p className="text-sm text-gray-600 mb-4">
          You're paying <strong>₹{fare}</strong> for seat <strong>{seat}</strong> on bus <strong>{busId}</strong>.
        </p>

        <div className="text-sm text-gray-700">
          <p><strong>Boarding:</strong> {boarding}</p>
          <p><strong>Drop:</strong> {drop}</p>
          <p><strong>User:</strong> {user.email}</p>
        </div>

        <div className="mt-6">
          <button
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition"
            onClick={handleConfirmBooking}
          >
            Confirm Booking After Payment
          </button>
        </div>
      </div>

      <p className="text-center text-sm text-gray-500">
        Redirecting to Google Pay...
      </p>
    </div>
  );
};

export default PaymentApp;
