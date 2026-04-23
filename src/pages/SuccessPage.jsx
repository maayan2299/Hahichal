import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useCart } from '../context/CartContext';

export default function SuccessPage() {
  const { clearCart } = useCart();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const orderNumber = searchParams.get('order');

  useEffect(() => {
    // ברגע שהדף נטען - מנקים את העגלה כי התשלום הצליח
    clearCart();
  }, [clearCart]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-white text-center px-4" dir="rtl">
      <div className="max-w-md w-full border-2 border-black p-12">
        <div className="text-6xl mb-6">🎉</div>
        <h1 className="text-3xl font-bold mb-4">התשלום בוצע בהצלחה!</h1>
        <p className="text-gray-600 mb-8">
          תודה שקנית בהיכל. הזמנה מספר <span className="font-bold text-black">{orderNumber || 'חדשה'}</span> בדרך אלייך.
          אישור נשלח למייל שלך.
        </p>
        <button 
          onClick={() => navigate('/')}
          className="w-full bg-black text-white py-4 font-bold hover:bg-gray-800 transition-colors"
        >
          חזרה לחנות
        </button>
      </div>
    </div>
  );
}