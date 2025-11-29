import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';
import { sendOTPEmail, generateOTP } from '../services/emailService';
import { useLoadingStore } from '../stores/loadingStore';
import toast from 'react-hot-toast';
import { KeyRound, ArrowLeft, Mail } from 'lucide-react';

const ForgotPassword = () => {
    const { showLoading, hideLoading } = useLoadingStore();
    const [email, setEmail] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        showLoading('Checking your email...');

        try {
            // 1. Check if user exists in Firestore
            const usersRef = collection(db, 'users');
            const q = query(usersRef, where('email', '==', email));
            const querySnapshot = await getDocs(q);

            if (querySnapshot.empty) {
                toast.error('No account found with this email address.');
                hideLoading();
                return;
            }

            // 2. Send OTP
            showLoading('Sending verification code...');
            const otp = generateOTP();
            const result = await sendOTPEmail(email, otp);

            if (result.success) {
                toast.success('Verification code sent to your email!');
                hideLoading();
                // Navigate to verification page with email in state/query
                navigate(`/verify-reset-code?email=${encodeURIComponent(email)}`);
            } else {
                toast.error(result.message || 'Failed to send verification code.');
                hideLoading();
            }

        } catch (error) {
            console.error('Error in forgot password flow:', error);
            toast.error('An error occurred. Please try again.');
            hideLoading();
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                <div className="text-center">
                    <div className="flex justify-center mb-4">
                        <div className="p-4 bg-primary-100 rounded-full">
                            <KeyRound className="h-12 w-12 text-primary-600" />
                        </div>
                    </div>
                    <h2 className="text-3xl font-extrabold text-gray-900 mb-2">
                        Forgot Password?
                    </h2>
                    <p className="text-gray-600 mb-6">
                        Enter your email address and we'll send you a code to reset your password.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="mt-8 space-y-6">
                    <div>
                        <label htmlFor="email" className="sr-only">
                            Email address
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Mail className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                required
                                className="input pl-10 rounded-md"
                                placeholder="Enter your email address"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary w-full flex justify-center"
                    >
                        Send Verification Code
                    </button>
                </form>

                <div className="text-center mt-4">
                    <Link
                        to="/login"
                        className="text-sm text-gray-600 hover:text-gray-900 flex items-center justify-center space-x-1"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        <span>Back to Login</span>
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;
