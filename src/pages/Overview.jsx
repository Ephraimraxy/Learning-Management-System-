import { LayoutDashboard, TrendingUp, Users, BookOpen, Award } from 'lucide-react';

const Overview = () => {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold text-gray-900">Overview</h1>
            </div>

            {/* Placeholder content - to be implemented */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Total Courses</p>
                            <p className="text-2xl font-bold text-gray-900 mt-2">-</p>
                        </div>
                        <BookOpen className="h-8 w-8 text-primary-600" />
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Active Students</p>
                            <p className="text-2xl font-bold text-gray-900 mt-2">-</p>
                        </div>
                        <Users className="h-8 w-8 text-primary-600" />
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Completed</p>
                            <p className="text-2xl font-bold text-gray-900 mt-2">-</p>
                        </div>
                        <Award className="h-8 w-8 text-primary-600" />
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Progress</p>
                            <p className="text-2xl font-bold text-gray-900 mt-2">-</p>
                        </div>
                        <TrendingUp className="h-8 w-8 text-primary-600" />
                    </div>
                </div>
            </div>

            <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200 text-center">
                <LayoutDashboard className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Overview Page</h2>
                <p className="text-gray-600">
                    This is a placeholder for the Overview page. Content will be implemented as per your requirements.
                </p>
            </div>
        </div>
    );
};

export default Overview;
