import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getCourse } from '../services/courseService';
import { applyCoupon, createTransaction } from '../services/paymentService';
import { useAuthStore } from '../stores/authStore';
import toast from 'react-hot-toast';
import { CreditCard, Tag, Check } from 'lucide-react';

const PaymentCheckout = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [course, setCourse] = useState(null);
  const [couponCode, setCouponCode] = useState('');
  const [coupon, setCoupon] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const courseData = await getCourse(courseId);
        setCourse(courseData);
      } catch (error) {
        toast.error('Failed to load course');
      } finally {
        setLoading(false);
      }
    };
    fetchCourse();
  }, [courseId]);

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;

    try {
      const result = await applyCoupon(couponCode, course?.price || 0);
      if (result.valid) {
        setCoupon(result.coupon);
        toast.success('Coupon applied successfully');
      } else {
        toast.error(result.error || 'Invalid coupon');
        setCoupon(null);
      }
    } catch (error) {
      toast.error('Failed to validate coupon');
    }
  };

  const calculateTotal = () => {
    const basePrice = course?.price || 0;
    if (coupon) {
      const discount = coupon.type === 'percentage'
        ? (basePrice * coupon.value) / 100
        : coupon.value;
      return Math.max(0, basePrice - discount);
    }
    return basePrice;
  };

  const handlePayment = async () => {
    if (!user) {
      toast.error('Please login to purchase');
      navigate('/login');
      return;
    }

    setProcessing(true);
    try {
      const transactionId = await createTransaction({
        userId: user.uid,
        courseId,
        amount: calculateTotal(),
        originalAmount: course?.price || 0,
        discount: coupon ? (course?.price || 0) - calculateTotal() : 0,
        couponCode: coupon?.code || null,
        status: 'pending',
        type: 'course_purchase',
      });

      // In a real implementation, this would redirect to payment gateway
      // For now, we'll simulate payment success
      toast.success('Payment processed successfully!');
      navigate(`/courses/${courseId}`);
    } catch (error) {
      toast.error('Payment failed');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!course) {
    return <div className="text-center py-12">Course not found</div>;
  }

  const discount = coupon ? (course.price || 0) - calculateTotal() : 0;
  const total = calculateTotal();

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold">Checkout</h1>

      <div className="card">
        <h2 className="text-xl font-semibold mb-4">{course.title}</h2>
        <p className="text-gray-600 mb-4">{course.description}</p>

        <div className="border-t pt-4 space-y-3">
          <div className="flex justify-between">
            <span>Course Price</span>
            <span className="font-semibold">${course.price || 0}</span>
          </div>

          {coupon && (
            <div className="flex justify-between text-green-600">
              <span>Discount ({coupon.code})</span>
              <span className="font-semibold">-${discount.toFixed(2)}</span>
            </div>
          )}

          <div className="flex justify-between text-lg font-bold border-t pt-3">
            <span>Total</span>
            <span>${total.toFixed(2)}</span>
          </div>
        </div>
      </div>

      <div className="card">
        <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2">
          <Tag className="h-5 w-5" />
          <span>Coupon Code</span>
        </h3>
        <div className="flex space-x-2">
          <input
            type="text"
            value={couponCode}
            onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
            placeholder="Enter coupon code"
            className="flex-1 px-3 py-2 border rounded-lg"
            disabled={!!coupon}
          />
          {!coupon ? (
            <button onClick={handleApplyCoupon} className="btn btn-secondary">
              Apply
            </button>
          ) : (
            <button
              onClick={() => {
                setCoupon(null);
                setCouponCode('');
              }}
              className="btn btn-secondary"
            >
              Remove
            </button>
          )}
        </div>
        {coupon && (
          <div className="mt-2 flex items-center space-x-2 text-green-600">
            <Check className="h-4 w-4" />
            <span className="text-sm">Coupon applied: {coupon.code}</span>
          </div>
        )}
      </div>

      <div className="card">
        <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2">
          <CreditCard className="h-5 w-5" />
          <span>Payment Method</span>
        </h3>
        <div className="space-y-3">
          <label className="flex items-center space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
            <input type="radio" name="payment" defaultChecked className="w-4 h-4" />
            <span>Credit/Debit Card</span>
          </label>
          <label className="flex items-center space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
            <input type="radio" name="payment" className="w-4 h-4" />
            <span>PayPal</span>
          </label>
          <label className="flex items-center space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
            <input type="radio" name="payment" className="w-4 h-4" />
            <span>Bank Transfer</span>
          </label>
        </div>
      </div>

      <button
        onClick={handlePayment}
        disabled={processing || total === 0}
        className="w-full btn btn-primary text-lg py-4"
      >
        {processing ? 'Processing...' : `Pay $${total.toFixed(2)}`}
      </button>
    </div>
  );
};

export default PaymentCheckout;

