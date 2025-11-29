import { Link } from 'react-router-dom';
import { BookOpen } from 'lucide-react';

const GetStarted = () => {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4 sm:px-6 lg:px-8 font-sans">
            <div className="max-w-md w-full space-y-8 text-center">

                {/* Icon */}
                <div className="flex justify-center">
                    <BookOpen className="h-16 w-16 text-green-600" strokeWidth={1.5} />
                </div>

                {/* Title & Subtitle */}
                <div className="space-y-2">
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
                        Let's get you moving 😂
                    </h1>
                    <p className="text-green-600 font-medium">
                        Your journey to knowledge starts here.
                    </p>
                </div>

                {/* Buttons */}
                <div className="space-y-4 pt-8">
                    <Link
                        to="/login"
                        className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-bold text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
                    >
                        Sign in
                    </Link>

                    <Link
                        to="/signup"
                        className="w-full flex justify-center py-3 px-4 border-2 border-green-600 rounded-lg shadow-sm text-sm font-bold text-green-700 bg-white hover:bg-green-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
                    >
                        Sign Up
                    </Link>
                </div>

                {/* Footer */}
                <div className="pt-12">
                    <p className="text-xs text-gray-400">
                        Powered by Burst-Brain concept
                    </p>
                </div>

            </div>
        </div>
    );
};

export default GetStarted;
