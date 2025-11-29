import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { useLoadingStore } from '../stores/loadingStore';
import toast from 'react-hot-toast';
import { Lock, CheckCircle } from 'lucide-react';

const ResetPassword = () => {
    const { showLoading, hideLoading } = useLoadingStore();
    const navigate = useNavigate();
    const location = useLocation();
    const { email, verified } = location.state || {};

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        if (!email || !verified) {
            toast.error('Unauthorized access. Please verify your email first.');
            navigate('/forgot-password');
        }
    }, [email, verified, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            toast.error('Passwords do not match.');
            return;
        }

        if (password.length < 6) {
            toast.error('Password must be at least 6 characters long.');
            return;
        }

        showLoading('Resetting your password...');
        try {
            const functions = getFunctions();
            const adminResetPassword = httpsCallable(functions, 'adminResetPassword');

            const result = await adminResetPassword({ email, newPassword: password });

            if (result.data.success) {
                setSuccess(true);
                toast.success('Password reset successfully!');
                hideLoading();
                setTimeout(() => {
                    navigate('/login');
                }, 3000);
            } else {
                toast.error(result.data.message || 'Failed to reset password.');
                hideLoading();
            }
        } catch (error) {
            console.error('Reset password error:', error);
            toast.error('Failed to reset password. Please try again.');
            hideLoading();
        }
    };

    if (!email) return null;

    if (success) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-md w-full text-center space-y-6">
                    <div className="flex justify-center">
                        <div className="p-4 bg-green-100 rounded-full">
                            <CheckCircle className="h-16 w-16 text-green-600" />
                        </div>
                    </div>
                    <h2 className="text-3xl font-extrabold text-gray-900">
                        Password Reset!
                    </h2>
                    <p className="text-gray-600">
                        Your password has been successfully updated. Redirecting to login...
                    </p>
                    <Link to="/login" className="btn btn-primary w-full block">
                        Go to Login
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                <div className="text-center">
                    <div className="flex justify-center mb-4">
                        <div className="p-4 bg-primary-100 rounded-full">
                            <Lock className="h-12 w-12 text-primary-600" />
                        </div>
                    </div>
                    <h2 className="text-3xl font-extrabold text-gray-900 mb-2">
                        Set New Password
                    </h2>
                    <p className="text-gray-600 mb-6">
                        Create a new password for <strong>{email}</strong>
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="mt-8 space-y-6">
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                                New Password
                            </label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                required
                                className="input mt-1 block w-full rounded-md"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                        <div>
                            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                                Confirm Password
                            </label>
                            <input
                                id="confirmPassword"
                                name="confirmPassword"
                                type="password"
                                required
                                className="input mt-1 block w-full rounded-md"
                                placeholder="••••••••"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary w-full flex justify-center"
                    >
                        Reset Password
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ResetPassword;
