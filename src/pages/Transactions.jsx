import { useEffect, useState } from 'react';
import { getTransactions } from '../services/paymentService';
import { useAuthStore } from '../stores/authStore';
import { CreditCard, CheckCircle, XCircle, Clock } from 'lucide-react';

const Transactions = () => {
  const { user } = useAuthStore();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTransactions = async () => {
      if (!user) return;
      try {
        const data = await getTransactions(user.uid);
        setTransactions(data);
      } catch (error) {
        console.error('Failed to load transactions');
      } finally {
        setLoading(false);
      }
    };
    fetchTransactions();
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'failed':
        return <XCircle className="h-5 w-5 text-red-600" />;
      default:
        return <Clock className="h-5 w-5 text-yellow-600" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold flex items-center space-x-2">
          <CreditCard className="h-8 w-8" />
          <span>Transaction History</span>
        </h1>
      </div>

      {transactions.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-gray-600">No transactions found</p>
        </div>
      ) : (
        <div className="card">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-4">Date</th>
                  <th className="text-left p-4">Description</th>
                  <th className="text-left p-4">Amount</th>
                  <th className="text-left p-4">Discount</th>
                  <th className="text-left p-4">Status</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((transaction) => (
                  <tr key={transaction.id} className="border-b hover:bg-gray-50">
                    <td className="p-4">
                      {new Date(transaction.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-4">
                      {transaction.type === 'course_purchase' ? 'Course Purchase' : transaction.type}
                    </td>
                    <td className="p-4 font-semibold">
                      ${transaction.amount?.toFixed(2) || '0.00'}
                    </td>
                    <td className="p-4">
                      {transaction.discount > 0 ? (
                        <span className="text-green-600">-${transaction.discount.toFixed(2)}</span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(transaction.status)}
                        <span className={`px-2 py-1 rounded text-sm ${getStatusColor(transaction.status)}`}>
                          {transaction.status}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Transactions;







