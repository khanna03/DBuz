"use client";
import { useRouter } from 'next/router';
import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
// import styles from './page.module.css';

export default function WelcomeScreen() {
  const [currentSlide, setCurrentSlide] = useState(0);
  
  // In a real application, you would replace these with your actual slide content
  const slides = [
    {
      id: 1,
      title: "Welcome to the app",
      description: "An app for convenient bus seat booking, schedules, payments, and travel updates in Sri Lanka."
    },
    {
      id: 2,
      title: "Book your journey",
      description: "Search for buses, select seats, and secure your tickets with ease."
    },
    {
      id: 3,
      title: "Travel with comfort",
      description: "Get real-time updates and manage your bookings on the go."
    }
  ];

  return (
    <div className="flex flex-col items-center justify-between min-h-screen bg-pink-50 px-4 py-8">
      <div className="w-full max-w-md flex flex-col items-center justify-center flex-grow">
        {/* Bus Logo */}
        <div className="relative w-32 h-32 mb-8">
          <div className="absolute w-32 h-32 bg-red-600 rounded-full opacity-80"></div>
          <div className="absolute inset-4 flex items-center justify-center">
            <svg viewBox="0 0 100 60" className="w-full h-full">
              <path d="M10,40 Q10,10 50,10 Q90,10 90,40 L90,50 Q88,55 85,55 L80,55 L80,45 L20,45 L20,55 L15,55 Q12,55 10,50 Z" fill="black" />
              <rect x="20" y="25" width="20" height="10" fill="white" opacity="0.7" />
              <rect x="50" y="25" width="20" height="10" fill="white" opacity="0.7" />
            </svg>
          </div>
        </div>

        {/* Slides */}
        <div className="w-full text-center mb-12">
          <h2 className="text-navy-700 text-xl font-bold mb-3">{slides[currentSlide].title}</h2>
          <p className="text-gray-500 text-sm">{slides[currentSlide].description}</p>
        </div>

        {/* Slide indicators */}
        <div className="flex justify-center space-x-2 mb-12">
          {slides.map((slide, index) => (
            <div 
              key={slide.id} 
              className={`w-2 h-2 rounded-full ${currentSlide === index ? 'bg-red-600' : 'bg-gray-300'}`}
              onClick={() => setCurrentSlide(index)}
            ></div>
          ))}
        </div>

        {/* Action buttons */}
        <div className="w-full flex flex-col items-center">
          <Link href="/register" className="w-full">
            <button className="w-full bg-red-600 text-white py-3 px-6 rounded-md font-medium mb-4">
              Get Started
            </button>
          </Link>
          <Link href="/login" className="text-red-600 text-sm font-medium">
            Create an account
          </Link>
        </div>
      </div>
    </div>
  );
}