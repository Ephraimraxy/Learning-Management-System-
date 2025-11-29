import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { verifyOTP, sendOTPEmail, generateOTP } from '../services/emailService';
import { useLoadingStore } from '../stores/loadingStore';
import toast from 'react-hot-toast';
import { ShieldCheck, ArrowLeft } from 'lucide-react';

const VerifyResetCode = () => {
    const { showLoading, hideLoading } = useLoadingStore();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const email = searchParams.get('email');

    const [otpCode, setOtpCode] = useState('');

    useEffect(() => {
        if (!email) {
            toast.error('Invalid request. Please start over.');
            navigate('/forgot-password');
        }
    }, [email, navigate]);

    const handleVerify = async (e) => {
        e.preventDefault();
        if (!otpCode || otpCode.length !== 6) return;

        showLoading('Verifying code...');
        try {
            const result = await verifyOTP(email, otpCode);

            if (result.success) {
                toast.success('Code verified successfully!');
                hideLoading();
                navigate('/reset-password', { state: { email, verified: true } });
            } else {
                toast.error(result.message || 'Invalid code.');
                hideLoading();
            }
        } catch (error) {
            console.error('Verification error:', error);
            toast.error('Failed to verify code.');
            hideLoading();
        }
    };

    const handleResend = async () => {
        showLoading('Resending code...');
        try {
            const otp = generateOTP();
            const result = await sendOTPEmail(email, otp);
            if (result.success) {
                toast.success('New code sent!');
                hideLoading();
            } else {
                toast.error(result.message || 'Failed to resend code.');
                hideLoading();
            }
        } catch (error) {
            toast.error('Error resending code.');
            hideLoading();
        }
    };

    if (!email) return null;

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                <div className="text-center">
                    <div className="flex justify-center mb-4">
                        <div className="p-4 bg-primary-100 rounded-full">
                            <ShieldCheck className="h-12 w-12 text-primary-600" />
                        </div>
                    </div>
                    <h2 className="text-3xl font-extrabold text-gray-900 mb-2">
                        Verify Code
                    </h2>
                    <p className="text-gray-600 mb-6">
                        Enter the 6-digit code sent to <strong>{email}</strong>
                    </p>
                </div>

                <form onSubmit={handleVerify} className="mt-8 space-y-6">
                    <div>
                        <label htmlFor="otp" className="sr-only">
                            Verification Code
                        </label>
                        <input
                            id="otp"
                            name="otp"
                            type="text"
                            required
                            maxLength={6}
                            className="input text-center text-2xl tracking-widest font-mono rounded-md"
                            placeholder="000000"
                            value={otpCode}
                            onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={otpCode.length !== 6}
                        className="btn btn-primary w-full flex justify-center"
                    >
                        Verify Code
                    </button>

                    <div className="text-center">
                        <button
                            type="button"
                            onClick={handleResend}
                            className="text-sm text-primary-600 hover:text-primary-500 font-medium"
                        >
                            Didn't receive code? Resend
                        </button>
                    </div>
                </form>

                <div className="text-center mt-4">
                    <Link
                        to="/forgot-password"
                        className="text-sm text-gray-600 hover:text-gray-900 flex items-center justify-center space-x-1"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        <span>Back</span>
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default VerifyResetCode;
