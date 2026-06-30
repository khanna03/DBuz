'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabase';
import Link from 'next/link';

export default function Home() {
  const router = useRouter();
  const [searchParams, setSearchParams] = useState({
    from: '',
    to: '',
    date: new Date().toISOString().split('T')[0],
  });
  const [journeys, setJourneys] = useState([]);
  const [userName, setUserName] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [popularRoutes] = useState([
    { from: 'Chennai', to: 'Coimbatore', distance: '500 km', travelTime: '8-9h' },
    { from: 'Chennai', to: 'Madurai', distance: '450 km', travelTime: '7-8h' },
    { from: 'Chennai', to: 'Pondicherry', distance: '170 km', travelTime: '3-4h' },
    { from: 'Coimbatore', to: 'Chennai', distance: '500 km', travelTime: '8-9h' },
    { from: 'Madurai', to: 'Chennai', distance: '450 km', travelTime: '7-8h' },
    { from: 'Chennai', to: 'Bangalore', distance: '350 km', travelTime: '6-7h' },
  ]);

  useEffect(() => {
    const checkUser = async () => {
      try {
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError) throw authError;
        if (!user) {
          router.push('/login');
          return;
        }
        setUserName(user.user_metadata?.name || 'User');

        // Fetch journeys from API route
        try {
          const res = await fetch('/api/journeys');
          if (!res.ok) throw new Error('Server responded with an error');
          const data = await res.json();
          setJourneys(data.map(row => ({
            id: row.route_id,
            from_location: row.from_location,
            to_location: row.to_location,
            departure_date: row.date,
            departure_time: row.departure_time,
          })));
          setError('');
        } catch (fetchError) {
          console.error('Fetch error:', fetchError);
          setError('Failed to load journeys');
        }
      } catch (err) {
        console.error('Auth error:', err);
        router.push('/login');
      } finally {
        setIsLoading(false);
      }
    };
    checkUser();
  }, [router]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchParams.from || !searchParams.to) {
      setError('Please enter both origin and destination');
      return;
    }
    router.push(`/booking?from=${encodeURIComponent(searchParams.from)}&to=${encodeURIComponent(searchParams.to)}&date=${encodeURIComponent(searchParams.date)}`);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  const selectRoute = (from, to) => {
    setSearchParams({ ...searchParams, from, to });
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <header className="bg-white shadow-sm px-4 py-3 sticky top-0 z-10">
        <div className="max-w-md mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
            <h1 className="text-lg font-bold text-gray-900">TravelEase</h1>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-600">Hi, {userName}</span>
            <button
              onClick={handleLogout}
              className="text-xs text-gray-600 hover:text-gray-900"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 001 1h12a1 1 0 001-1V4a1 1 0 00-1-1H3zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      </header>
      
      <main className="flex-grow px-4 py-6 max-w-md mx-auto w-full">
        {/* Search Form */}
        <div className="bg-white rounded-2xl shadow-sm p-5 mb-5">
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="flex items-center gap-2 border-b border-gray-200 pb-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
              </svg>
              <input
                type="text"
                name="from"
                value={searchParams.from}
                onChange={(e) => setSearchParams({ ...searchParams, from: e.target.value })}
                placeholder="From where?"
                className="w-full p-2 outline-none text-gray-800"
                required
              />
            </div>
            
            <div className="flex items-center gap-2 border-b border-gray-200 pb-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
              </svg>
              <input
                type="text"
                name="to"
                value={searchParams.to}
                onChange={(e) => setSearchParams({ ...searchParams, to: e.target.value })}
                placeholder="To where?"
                className="w-full p-2 outline-none text-gray-800"
                required
              />
            </div>
            
            <div className="flex items-center gap-2 pb-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
              </svg>
              <input
                type="date"
                name="date"
                value={searchParams.date}
                onChange={(e) => setSearchParams({ ...searchParams, date: e.target.value })}
                className="w-full p-2 outline-none text-gray-800"
              />
            </div>
            
            <button
              type="submit"
              className="w-full bg-blue-500 text-white py-3 rounded-xl font-medium hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
              </svg>
              Find Routes
            </button>
          </form>
        </div>
        
        {/* Popular Routes */}
        <h2 className="text-lg font-semibold text-gray-800 mb-2 px-1">Popular Routes</h2>
        <div className="overflow-x-auto -mx-4 px-4 pb-2 mb-5">
          <div className="flex gap-3 snap-x snap-mandatory">
            {popularRoutes.map((route, index) => (
              <div
                key={index}
                className="snap-start min-w-[80%] bg-white rounded-xl shadow-sm p-4 flex flex-col border border-gray-100"
                onClick={() => selectRoute(route.from, route.to)}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M12 1.586l-4 4v12.828l4-4V1.586zM3.707 3.293A1 1 0 002 4v10a1 1 0 00.293.707L6 18.414V5.586L3.707 3.293zM17.707 5.293L14 1.586v12.828l2.293 2.293A1 1 0 0018 16V6a1 1 0 00-.293-.707z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">{route.from} → {route.to}</h3>
                    <div className="flex gap-2 text-xs text-gray-500 mt-1">
                      <span>{route.distance}</span>
                      <span>•</span>
                      <span>{route.travelTime}</span>
                    </div>
                  </div>
                </div>
                <button
                  className="mt-auto text-sm bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-2 rounded-lg transition-colors self-start"
                  onClick={(e) => {
                    e.stopPropagation();
                    selectRoute(route.from, route.to);
                    document.forms[0].dispatchEvent(new Event('submit', { cancelable: true }));
                  }}
                >
                  Select
                </button>
              </div>
            ))}
          </div>
        </div>
        
        {/* Upcoming Journeys */}
        <div className="flex justify-between items-center mb-2 px-1">
          <h2 className="text-lg font-semibold text-gray-800">My Journeys</h2>
          {journeys.length > 0 && (
            <button
              onClick={() => setJourneys([...journeys])}
              className="text-sm text-blue-500 hover:text-blue-600"
            >
              Refresh
            </button>
          )}
        </div>
        
        {isLoading ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-2 border-blue-500 border-t-transparent"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl text-center">
            {error}
            <button 
              onClick={() => window.location.reload()} 
              className="block mx-auto mt-2 text-xs bg-red-100 text-red-700 px-4 py-2 rounded-lg"
            >
              Retry
            </button>
          </div>
        ) : journeys.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-6 text-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-300 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
            <p className="text-gray-600">No upcoming journeys</p>
            <p className="text-sm text-gray-400 mt-1">Book a journey to get started</p>
          </div>
        ) : (
          <div className="space-y-3">
            {journeys.map((journey) => (
              <Link
                key={journey.id}
                href={`/journey/${journey.id}`}
                className="bg-white rounded-xl shadow-sm p-4 flex items-center gap-4 hover:shadow-md transition-shadow border border-gray-100"
              >
                <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </div>
                <div className="flex-grow">
                  <p className="font-medium text-gray-900">{journey.from_location} → {journey.to_location}</p>
                  <p className="text-sm text-gray-500 mt-1">{journey.departure_date} • {journey.departure_time}</p>
                </div>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              </Link>
            ))}
          </div>
        )}
      </main>
      
      <footer className="bg-white border-t border-gray-200 pt-1">
        <nav className="flex max-w-md mx-auto">
          <Link href="/home" className="flex flex-col items-center justify-center flex-1 py-2 text-blue-500">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
            </svg>
            <span className="text-xs mt-1">Home</span>
          </Link>
          <Link href="/booking" className="flex flex-col items-center justify-center flex-1 py-2 text-gray-400">
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