import { useLoadingStore } from '../stores/loadingStore';
import { Loader2 } from 'lucide-react';

const LoadingOverlay = () => {
    const { isLoading, message } = useLoadingStore();

    if (!isLoading) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm transition-opacity">
            <div className="bg-white rounded-2xl shadow-2xl p-8 flex flex-col items-center max-w-sm w-full mx-4 animate-in fade-in zoom-in duration-200">
                <div className="relative">
                    <div className="absolute inset-0 bg-primary-100 rounded-full blur-lg opacity-50 animate-pulse"></div>
                    <Loader2 className="h-12 w-12 text-primary-600 animate-spin relative z-10" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-gray-900 text-center">
                    {message}
                </h3>
                <p className="mt-2 text-sm text-gray-500 text-center">
                    Please wait while we process your request.
                </p>
            </div>
        </div>
    );
};

export default LoadingOverlay;
