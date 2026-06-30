'use client';
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function BoardingDropDetails() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [boardingPoints, setBoardingPoints] = useState([]);
  const [dropPoints, setDropPoints] = useState([]);
  const [selectedBoarding, setSelectedBoarding] = useState('');
  const [selectedDrop, setSelectedDrop] = useState('');
  const [error, setError] = useState(null);

  const busId = searchParams.get('busId');
  const seat = searchParams.get('seat');

  useEffect(() => {
    // Simulate mock boarding/drop points
    const mockBoardingPoints = [
      { boarding_point_id: 'b1', name: 'City Center' },
      { boarding_point_id: 'b2', name: 'Main Bus Station' },
      { boarding_point_id: 'b3', name: 'Highway Pickup' },
    ];

    const mockDropPoints = [
      { drop_point_id: 'd1', name: 'Airport' },
      { drop_point_id: 'd2', name: 'Downtown Plaza' },
      { drop_point_id: 'd3', name: 'Final Stop Terminal' },
    ];

    setBoardingPoints(mockBoardingPoints);
    setDropPoints(mockDropPoints);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedBoarding || !selectedDrop) {
      setError('Please select both boarding and drop points');
      return;
    }
    setError(null);
    router.push(`/payment?busId=${busId}&seat=${seat}&boarding=${selectedBoarding}&drop=${selectedDrop}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-6 bg-blue-600 text-white">
          <h1 className="text-2xl font-bold">Select Boarding & Drop Points</h1>
          <p className="mt-2">Bus: {busId} | Seat: {seat}</p>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6">
          <div className="mb-6">
            <label className="block text-gray-700 font-medium mb-2">Boarding Point</label>
            <select
              value={selectedBoarding}
              onChange={(e) => setSelectedBoarding(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Select boarding point</option>
              {boardingPoints.map((point) => (
                <option key={point.boarding_point_id} value={point.boarding_point_id}>
                  {point.name}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-6">
            <label className="block text-gray-700 font-medium mb-2">Drop Point</label>
            <select
              value={selectedDrop}
              onChange={(e) => setSelectedDrop(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Select drop point</option>
              {dropPoints.map((point) => (
                <option key={point.drop_point_id} value={point.drop_point_id}>
                  {point.name}
                </option>
              ))}
            </select>
          </div>

          {error && <p className="text-red-500 mb-4">{error}</p>}

          <div className="flex justify-between">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
            >
              Back
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Continue to Payment
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
