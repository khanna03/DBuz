'use client';
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '../../lib/supabase';
import Link from 'next/link';

export default function Booking() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [buses, setBuses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const from = searchParams.get('from') || 'Colombo';
  const to = searchParams.get('to') || 'Kandy';
  const date = searchParams.get('date') || new Date().toISOString().split('T')[0];

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }

      try {
        const res = await fetch(
          `/api/buses?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}&date=${encodeURIComponent(date)}`
        );
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to fetch buses');
        setBuses(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    checkUser();
  }, [router, from, to, date]);

  const handleBusSelect = (busId, routeId) => {
    router.push(`/seat-selection?busId=${busId}&routeId=${routeId}`);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <div className="bg-red-50 text-red-600 p-6 rounded-xl max-w-md w-full text-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mx-auto mb-3 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="font-medium mb-2">{error}</p>
          <button 
            onClick={() => router.back()} 
            className="mt-2 text-sm bg-red-100 text-red-700 px-4 py-2 rounded-lg"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm px-4 py-3 sticky top-0 z-10">
        <div className="max-w-md mx-auto flex items-center">
          <button
            onClick={() => router.back()}
            className="mr-3 p-2 text-gray-500 hover:text-gray-800"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </button>
          <h1 className="text-lg font-bold text-gray-900">Available Routes</h1>
        </div>
      </header>

      {/* Route Info */}
      <div className="bg-blue-500 text-white px-4 py-4">
        <div className="max-w-md mx-auto">
          <div className="flex items-center justify-between mb-3">
            <div className="flex-1">
              <p className="text-xs text-blue-100">From</p>
              <p className="font-semibold">{from}</p>
            </div>
            <div className="flex-shrink-0 px-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="flex-1 text-right">
              <p className="text-xs text-blue-100">To</p>
              <p className="font-semibold">{to}</p>
            </div>
          </div>
          <div className="flex justify-between items-center">
            <div>
              <p className="text-xs text-blue-100">Travel Date</p>
              <p className="text-sm">{date}</p>
            </div>
            <Link 
              href="/" 
              className="text-xs bg-blue-600 hover:bg-blue-700 px-3 py-2 rounded-lg transition-colors"
            >
              Change
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-grow px-4 py-6 max-w-md mx-auto w-full">
        {buses.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-6 text-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-300 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <h3 className="text-lg font-medium text-gray-800 mb-2">No Buses Available</h3>
            <p className="text-sm text-gray-500 mb-4">Try changing your route or date.</p>
            <Link href="/" className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors">
              Change Route
            </Link>
          </div>
        ) : (
          <>
            <div className="mb-4 flex justify-between items-center">
              <p className="text-sm text-gray-600">
                <span className="font-bold text-blue-500">{buses.length}</span> trips found
              </p>
              <div className="text-xs px-2 py-1 bg-blue-50 text-blue-600 rounded-full">
                {date}
              </div>
            </div>
            
            <div className="space-y-4">
              {buses.map((bus) => (
                <div
                  key={bus.id}
                  className="bg-white rounded-xl shadow-sm p-4 hover:shadow-md transition border border-gray-100"
                >
                  <div className="flex justify-between items-center mb-3">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-blue-50 rounded-full flex items-center justify-center mr-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                          <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1v-1h3.05a2.5 2.5 0 014.9 0H19a1 1 0 001-1v-2a4 4 0 00-4-4h-3V4a1 1 0 00-1-1H3z" />
                        </svg>
                      </div>
                      <h3 className="font-medium text-gray-800">{bus.operator}</h3>
                    </div>
                    <span className="text-xs px-2 py-1 bg-blue-50 text-blue-600 rounded-full">
                      {bus.type}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex-1">
                      <p className="text-lg font-semibold text-gray-900">{bus.departureTime}</p>
                      <p className="text-xs text-gray-500">Departure</p>
                    </div>
                    
                    <div className="flex-shrink-0 px-3 flex flex-col items-center">
                      <p className="text-xs text-gray-500 mb-1">{bus.duration}</p>
                      <div className="w-16 h-px bg-gray-300 relative">
                        <div className="absolute -bottom-1 left-0 w-2 h-2 rounded-full bg-blue-500"></div>
                        <div className="absolute -bottom-1 right-0 w-2 h-2 rounded-full bg-blue-500"></div>
                      </div>
                    </div>
                    
                    <div className="flex-1 text-right">
                      <p className="text-lg font-semibold text-gray-900">{bus.arrivalTime}</p>
                      <p className="text-xs text-gray-500">Arrival</p>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                      <p className="text-sm text-gray-600">{bus.availableSeats} seats available</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-blue-600">LKR {bus.fare}</p>
                      <button
                        onClick={() => handleBusSelect(bus.id, bus.routeId)}
                        className="mt-2 text-sm bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
                      >
                        Select Seats
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 pt-1">
        <nav className="flex max-w-md mx-auto">
          <Link href="/home" className="flex flex-col items-center justify-center flex-1 py-2 text-gray-400">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
            </svg>
            <span className="text-xs mt-1">Home</span>
          </Link>
          <Link href="/booking" className="flex flex-col items-center justify-center flex-1 py-2 text-blue-500">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
              <path d="M2 6a2 2 0 012-2h12a2 2 0 012 2v2a2 2 0 100 4v2a2 2 0 01-2 2H4a2 2 0 01-2-2v-2a2 2 0 100-4V6z" />
            </svg>
            <span className="text-xs mt-1">Tickets</span>
          </Link>
          <Link href="/profile" className="flex flex-col items-center justify-center flex-1 py-2 text-gray-400">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
            </svg>
            <span className="text-xs mt-1">Profile</span>
          </Link>
        </nav>
      </footer>
    </div>
  );
}