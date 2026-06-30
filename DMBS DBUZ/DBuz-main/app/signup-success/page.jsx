import Link from 'next/link';

export default function SignupSuccess() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-2xl font-bold text-gray-800 mb-4">Sign Up Successful!</h1>
      <p className="text-gray-600 mb-6">Your account has been created. Please log in to continue.</p>
      <Link href="/login">
        <button className="bg-red-600 text-white py-3 px-6 rounded-md hover:bg-red-700">
          Go to Login
        </button>
      </Link>
    </div>
  );
}