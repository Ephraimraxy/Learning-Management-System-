// One-time admin setup page
// Access this at /admin-setup to create the default admin account

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { initializeAdmin } from '../utils/initAdmin';
import toast from 'react-hot-toast';
import { Shield, Loader } from 'lucide-react';

const AdminSetup = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const navigate = useNavigate();

  const handleCreateAdmin = async () => {
    setLoading(true);
    setResult(null);

    try {
      const response = await initializeAdmin();
      setResult(response);
      
      if (response.success) {
        toast.success(response.message);
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      toast.error('Failed to create admin account');
      setResult({ success: false, message: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="flex justify-center">
            <Shield className="h-12 w-12 text-primary-600" />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Admin Setup
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Create the default admin account for the LMS
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 space-y-4">
          <div>
            <h3 className="text-lg font-semibold mb-2">Admin Credentials</h3>
            <div className="space-y-2 text-sm">
              <p><strong>Email:</strong> hoseaephraim50@gmail.com</p>
              <p><strong>Password:</strong> 112233</p>
            </div>
          </div>

          {result && (
            <div className={`p-4 rounded-lg ${
              result.success 
                ? 'bg-green-50 text-green-800 border border-green-200' 
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}>
              <p className="text-sm">{result.message}</p>
            </div>
          )}

          <button
            onClick={handleCreateAdmin}
            disabled={loading}
            className="btn btn-primary w-full flex items-center justify-center space-x-2"
          >
            {loading ? (
              <>
                <Loader className="h-4 w-4 animate-spin" />
                <span>Creating Admin Account...</span>
              </>
            ) : (
              <span>Create Admin Account</span>
            )}
          </button>

          <p className="text-xs text-gray-500 text-center">
            This will create the admin account in Firebase. 
            You'll need to verify the email address before logging in.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminSetup;

