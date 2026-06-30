'use client';
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '../../lib/supabase';
import Link from 'next/link';

export default function SeatSelection() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [seats, setSeats] = useState([]);
  const [selectedSeat, setSelectedSeat] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const checkUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          router.push('/login');
        } else {
          // Set 25 mock seats
          setSeats([
            { seatNumber: 'A1', status: 'available' },
            { seatNumber: 'A2', status: 'booked' },
            { seatNumber: 'A3', status: 'available' },
            { seatNumber: 'A4', status: 'available' },
            { seatNumber: 'A5', status: 'booked' },
            { seatNumber: 'B1', status: 'available' },
            { seatNumber: 'B2', status: 'available' },
            { seatNumber: 'B3', status: 'booked' },
            { seatNumber: 'B4', status: 'available' },
            { seatNumber: 'B5', status: 'available' },
            { seatNumber: 'C1', status: 'available' },
            { seatNumber: 'C2', status: 'booked' },
            { seatNumber: 'C3', status: 'available' },
            { seatNumber: 'C4', status: 'available' },
            { seatNumber: 'C5', status: 'available' },
            { seatNumber: 'D1', status: 'available' },
            { seatNumber: 'D2', status: 'booked' },
            { seatNumber: 'D3', status: 'available' },
            { seatNumber: 'D4', status: 'booked' },
            { seatNumber: 'D5', status: 'available' },
            { seatNumber: 'E1', status: 'available' },
            { seatNumber: 'E2', status: 'available' },
            { seatNumber: 'E3', status: 'booked' },
            { seatNumber: 'E4', status: 'available' },
            { seatNumber: 'E5', status: 'available' },
          ]);
          setLoading(false);
        }
      } catch (error) {
        setError('Authentication error. Please try again.');
        console.error('Auth error:', error);
      } finally {
        setLoading(false);
      }
    };
    checkUser();
  }, [router]);

  const handleSeatSelect = (seatId, status) => {
    if (status === 'booked') return;
    setSelectedSeat(seatId);
    router.push(`/boarding-drop-details?busId=${searchParams.get('busId')}&seat=${seatId}`);
  };

  if (loading && seats.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-blue-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-blue-800 font-medium">Loading seats...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-blue-50 px-4">
        <div className="text-center p-8 max-w-xs w-full bg-white rounded-2xl shadow-lg">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-gray-800 mb-3">Error</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link href="/" className="block w-full px-4 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 active:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
            Go Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-blue-50">
      {/* Header */}
      <div className="bg-blue-600 text-white px-4 py-6 shadow-md">
        <h1 className="text-xl font-bold text-center">Select Your Seat</h1>
        <p className="text-center text-blue-100 text-sm mt-1">
          Bus ID: {searchParams.get('busId')}
        </p>
      </div>

      {/* Main Content */}
      <div className="p-4">
        {seats.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-md p-6 text-center">
            <p className="text-gray-600">No seats available for this bus.</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-md overflow-hidden">
            {/* Bus Diagram */}
            <div className="p-4 border-b border-gray-100">
              <div className="bg-gray-100 p-3 rounded-xl mb-4">
                <div className="w-full h-10 bg-gray-300 rounded-lg mb-6 flex items-center justify-center">
                  <span className="text-sm font-medium text-gray-700">DRIVER</span>
                </div>
                
                {/* Seats Legend */}
                <div className="flex justify-center space-x-4 mb-6">
                  <div className="flex items-center">
                    <div className="w-5 h-5 bg-gray-200 rounded-md mr-2"></div>
                    <span className="text-xs">Available</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-5 h-5 bg-red-400 rounded-md mr-2"></div>
                    <span className="text-xs">Booked</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-5 h-5 bg-green-500 rounded-md mr-2"></div>
                    <span className="text-xs">Selected</span>
                  </div>
                </div>

                {/* Seat Grid */}
                <div className="grid grid-cols-5 gap-2 max-w-xs mx-auto">
                  {seats.map((seat) => (
                    <button
                      key={seat.seatNumber}
                      onClick={() => handleSeatSelect(seat.seatNumber, seat.status)}
                      disabled={seat.status === 'booked' || loading}
                      className={`
                        h-12 w-12 rounded-lg flex items-center justify-center text-center text-sm font-medium
                        transition-all duration-200 transform ${selectedSeat === seat.seatNumber ? 'scale-105' : ''}
                        ${seat.status === 'booked' ? 'bg-red-400 opacity-70 cursor-not-allowed text-white' : ''}
                        ${selectedSeat === seat.seatNumber ? 'bg-green-500 text-white shadow-md' : ''}
                        ${seat.status !== 'booked' && selectedSeat !== seat.seatNumber ? 'bg-gray-200 hover:bg-gray-300 active:bg-gray-400' : ''}
                      `}
                    >
                      {seat.seatNumber}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Prompt */}
            {selectedSeat ? (
              <div className="px-4 py-3 bg-green-50 border-t border-green-100">
                <p className="text-center text-sm text-green-800">
                  Seat {selectedSeat} selected! Proceeding to booking details...
                </p>
              </div>
            ) : (
              <div className="px-4 py-3 bg-blue-50 border-t border-blue-100">
                <p className="text-center text-sm text-blue-800">
                  Tap on an available seat to continue
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white px-4 py-3 flex justify-between shadow-lg border-t border-gray-200">
        <Link href="/" className="flex-1 mr-2">
          <button className="w-full py-3 bg-gray-100 text-blue-600 rounded-xl font-medium hover:bg-gray-200 active:bg-gray-300 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
            </svg>
            Home
          </button>
        </Link>
        <Link href="/bookings" className="flex-1 ml-2">
          <button className="w-full py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 active:bg-blue-800 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 2a4 4 0 00-4 4v1H5a1 1 0 00-.994.89l-1 9A1 1 0 004 18h12a1 1 0 00.994-1.11l-1-9A1 1 0 0015 7h-1V6a4 4 0 00-4-4zm2 5V6a2 2 0 10-4 0v1h4zm-6 3a1 1 0 112 0 1 1 0 01-2 0zm7-1a1 1 0 100 2 1 1 0 000-2z" clipRule="evenodd" />
            </svg>
            My Bookings
          </button>
        </Link>
      </div>
      
      {/* Add bottom padding to prevent content from being hidden behind the fixed navigation */}
      <div className="pb-20"></div>
    </div>
  );
}