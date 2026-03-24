"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ShieldCheck, Clock, CreditCard, Package, MapPin, QrCode, Smartphone, Banknote, X, CheckCircle } from 'lucide-react';

export default function CheckoutPage() {
  const { id } = useParams();
  const router = useRouter();
  
  const [data, setData] = useState<any>(null);
  const [timeLeft, setTimeLeft] = useState("");
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState("");

  const [useNewAddress, setUseNewAddress] = useState(false);
  const [newAddress, setNewAddress] = useState({ address: '', pincode: '' });

  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'qr' | 'upi' | 'cod'>('qr');
  const [upiId, setUpiId] = useState('');
  
  // NEW: UTR/Transaction ID State for real payment verification
  const [utr, setUtr] = useState('');

  const sizes = ["US 7", "US 8", "US 9", "US 10", "US 11", "US 12"];
  const COD_LIMIT = 50000;

  // --- ⚠️ PUT YOUR REAL UPI ID HERE ⚠️ ---
  const MERCHANT_UPI_ID = "darshan742005-1@oksbi"; 
  const MERCHANT_NAME = "Lokus Marketplace";

  useEffect(() => {
    fetch(`http://127.0.0.1:8000/api/v1/reservations/${id}`)
      .then(res => res.json())
      .then(data => {
        if (data.detail) setError(data.detail);
        else setData(data);
      })
      .catch(() => setError("Failed to load secure checkout room."));
  }, [id]);

  useEffect(() => {
    if (!data) return;
    const interval = setInterval(() => {
      let expTimeStr = data.reservation.expires_at;
      if (!expTimeStr.endsWith('Z')) expTimeStr += 'Z'; 

      const distance = new Date(expTimeStr).getTime() - new Date().getTime();
      if (distance <= 0) {
        clearInterval(interval);
        setError("Time Expired. Your pair was released back to the global pool.");
        setShowPaymentModal(false); 
        return;
      }
      const m = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const s = Math.floor((distance % (1000 * 60)) / 1000);
      setTimeLeft(`${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`);
    }, 1000);
    return () => clearInterval(interval);
  }, [data]);

  const initiatePayment = () => setShowPaymentModal(true);

  const executeFinalCheckout = async () => {
    setIsProcessing(true);
    try {
      const finalAddress = useNewAddress ? newAddress.address : data.user?.address;
      const finalPincode = useNewAddress ? newAddress.pincode : data.user?.pincode;

      const res = await fetch(`http://127.0.0.1:8000/api/v1/checkout/${id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          size: selectedSize,
          address: finalAddress,
          pincode: finalPincode,
          payment_method: paymentMethod,
          utr_number: utr // Sending UTR to backend for records
        })
      });
      
      const result = await res.json();
      if (!res.ok) throw new Error(result.detail);
      
      // Atomic Purchase Successful! Send to Success Route
      router.push(`/success/${result.order_id}`);
      
    } catch (err: any) {
      setError(err.message);
      setIsProcessing(false);
      setShowPaymentModal(false);
    }
  };

  if (error) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-8 font-sans">
      <div className="max-w-md w-full bg-white p-8 rounded-3xl shadow-xl text-center border border-red-100">
        <h2 className="text-2xl font-black text-red-600 uppercase tracking-tighter mb-4">Cart Lost</h2>
        <p className="text-gray-500 font-medium mb-8">{error}</p>
        <Link href="/" className="block w-full bg-black text-white font-bold uppercase px-8 py-4 rounded-xl hover:bg-gray-800 transition-all">Back to Drops</Link>
      </div>
    </div>
  );

  if (!data) return <div className="min-h-screen flex justify-center items-center bg-white uppercase font-black tracking-widest text-gray-400">Securing Room...</div>;

  const isFormInvalid = !selectedSize || isProcessing || (useNewAddress && (!newAddress.address.trim() || !newAddress.pincode.trim()));
  const isCodAvailable = data.shoe.price_inr <= COD_LIMIT;

  // Real UPI Intent String Generator
  const upiIntentURI = `upi://pay?pa=${MERCHANT_UPI_ID}&pn=${encodeURIComponent(MERCHANT_NAME)}&am=${data.shoe.price_inr}&cu=INR`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(upiIntentURI)}`;

  // Require UTR if they selected a digital payment method
  const isPaymentValid = paymentMethod === 'cod' || (utr.length >= 8);

  return (
    <main className="min-h-screen bg-gray-50 text-gray-900 p-4 md:p-8 font-sans relative">
      
      {/* REAL PAYMENT MODAL OVERLAY */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden border border-gray-100 animate-in fade-in zoom-in-95 duration-200">
            
            <div className="bg-gray-50 p-6 border-b border-gray-100 flex justify-between items-center">
              <div>
                <h3 className="text-xl font-black tracking-tight text-gray-900">Secure Payment</h3>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mt-1">Total Due: ₹{data.shoe.price_inr.toLocaleString()}</p>
              </div>
              <button onClick={() => setShowPaymentModal(false)} className="p-2 bg-white rounded-full text-gray-400 hover:text-black hover:bg-gray-100 transition-all shadow-sm border border-gray-200"><X className="w-5 h-5" /></button>
            </div>

            <div className="p-6">
              
              <div className="grid grid-cols-3 gap-3 mb-6">
                <button onClick={() => setPaymentMethod('qr')} className={`py-4 rounded-2xl flex flex-col items-center gap-2 border-2 transition-all font-bold text-xs uppercase tracking-widest ${paymentMethod === 'qr' ? 'border-black bg-gray-50 text-black' : 'border-gray-100 text-gray-400 hover:border-gray-200'}`}>
                  <QrCode className={`w-6 h-6 ${paymentMethod === 'qr' ? 'text-black' : 'text-gray-400'}`} /> QR Code
                </button>
                <button onClick={() => setPaymentMethod('upi')} className={`py-4 rounded-2xl flex flex-col items-center gap-2 border-2 transition-all font-bold text-xs uppercase tracking-widest ${paymentMethod === 'upi' ? 'border-black bg-gray-50 text-black' : 'border-gray-100 text-gray-400 hover:border-gray-200'}`}>
                  <Smartphone className={`w-6 h-6 ${paymentMethod === 'upi' ? 'text-black' : 'text-gray-400'}`} /> UPI App
                </button>
                <button onClick={() => isCodAvailable && setPaymentMethod('cod')} disabled={!isCodAvailable} className={`py-4 rounded-2xl flex flex-col items-center gap-2 border-2 transition-all font-bold text-xs uppercase tracking-widest ${!isCodAvailable ? 'opacity-40 cursor-not-allowed border-gray-100 bg-gray-50 text-gray-400' : paymentMethod === 'cod' ? 'border-black bg-gray-50 text-black' : 'border-gray-100 text-gray-400 hover:border-gray-200'}`}>
                  <Banknote className={`w-6 h-6 ${paymentMethod === 'cod' ? 'text-black' : 'text-gray-400'}`} /> Cash
                </button>
              </div>

              <div className="min-h-[220px] flex flex-col items-center justify-center bg-gray-50 rounded-2xl border border-gray-100 p-6 mb-6">
                
                {paymentMethod === 'qr' && (
                  <div className="text-center w-full">
                    <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-200 inline-block mb-3">
                      {/* REAL LIVE QR CODE */}
                      <img src={qrCodeUrl} alt="Real Payment QR" className="w-40 h-40 mix-blend-darken" />
                    </div>
                    <p className="text-sm font-bold text-gray-600 mb-4">Scan & Pay ₹{data.shoe.price_inr.toLocaleString()}</p>
                    <input type="text" placeholder="Enter 12-Digit UTR Number after paying" value={utr} onChange={(e) => setUtr(e.target.value)} className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-black outline-none transition-all font-bold text-gray-900 text-center text-sm" />
                  </div>
                )}

                {paymentMethod === 'upi' && (
                  <div className="w-full text-center">
                    <Smartphone className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-sm font-bold text-gray-600 mb-2">Pay via UPI ID</p>
                    <p className="text-lg font-black text-black mb-6 select-all">{MERCHANT_UPI_ID}</p>
                    <input type="text" placeholder="Enter 12-Digit UTR Number after paying" value={utr} onChange={(e) => setUtr(e.target.value)} className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-black outline-none transition-all font-bold text-gray-900 text-center text-sm" />
                  </div>
                )}

                {paymentMethod === 'cod' && (
                  <div className="text-center">
                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm border border-gray-200 mx-auto mb-4"><Banknote className="w-8 h-8 text-green-600" /></div>
                    <p className="text-sm font-bold text-gray-900">Pay on Delivery</p>
                    <p className="text-xs text-gray-500 mt-2 max-w-[200px] mx-auto leading-relaxed">Have exact cash ready at the time of arrival. Checks are not accepted.</p>
                  </div>
                )}

              </div>

              <button 
                onClick={executeFinalCheckout}
                disabled={isProcessing || !isPaymentValid}
                className="w-full font-black uppercase tracking-widest py-5 rounded-xl transition-all flex justify-center items-center gap-2 bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-900/20 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing ? 'Verifying Payment...' : <><CheckCircle className="w-5 h-5" /> Submit Order</>}
              </button>

            </div>
          </div>
        </div>
      )}

      {/* --- STANDARD CHECKOUT UI (BEHIND MODAL) --- */}
      <div className={`max-w-4xl mx-auto mt-12 transition-all ${showPaymentModal ? 'blur-sm opacity-50 select-none' : ''}`}>
        
        <div className="bg-red-700 text-white p-6 rounded-3xl flex justify-between items-center mb-8 shadow-xl shadow-red-900/10">
          <div>
            <h2 className="text-xs font-bold uppercase tracking-widest text-red-200">Inventory Locked</h2>
            <p className="text-xl md:text-2xl font-black uppercase tracking-tighter">Complete Checkout</p>
          </div>
          <div className="text-right">
            <h2 className="text-xs font-bold uppercase tracking-widest text-red-200 animate-pulse">Releasing In</h2>
            <p className="text-3xl md:text-4xl font-mono font-black">{timeLeft || "00:30"}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-200">
            <div className="bg-gray-50 rounded-2xl h-64 mb-6 flex items-center justify-center p-4">
              <img src={data.shoe.image_url} alt={data.shoe.model_name} className="object-contain h-full mix-blend-darken scale-110" />
            </div>
            <p className="text-gray-500 text-xs font-black uppercase tracking-widest">{data.shoe.brand}</p>
            <h1 className="text-3xl font-black tracking-tighter text-gray-900 mb-2">{data.shoe.model_name}</h1>
            <p className="text-2xl font-black text-gray-900 mb-6">₹{data.shoe.price_inr.toLocaleString('en-IN')}</p>
            <div className="border-t border-gray-100 pt-6">
               <div className="flex justify-between items-center mb-2"><span className="text-gray-500 font-semibold">Subtotal</span><span className="font-bold">₹{data.shoe.price_inr.toLocaleString('en-IN')}</span></div>
               <div className="flex justify-between items-center mb-4"><span className="text-gray-500 font-semibold">Express Shipping</span><span className="font-bold text-green-600">Free</span></div>
               <div className="flex justify-between items-center"><span className="text-gray-900 font-black uppercase tracking-widest text-sm">Total Due</span><span className="font-black text-2xl">₹{data.shoe.price_inr.toLocaleString('en-IN')}</span></div>
            </div>
          </div>

          <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-gray-200 flex flex-col">
            
            <div className="mb-8">
              <h3 className="text-sm font-black uppercase tracking-widest text-gray-400 mb-4 flex items-center gap-2"><Package className="w-4 h-4 text-black" /> Select Size</h3>
              <div className="grid grid-cols-3 gap-3">
                {sizes.map(size => (
                  <button key={size} onClick={() => setSelectedSize(size)} className={`py-4 rounded-xl font-bold uppercase transition-all border-2 ${selectedSize === size ? 'border-black bg-black text-white shadow-md scale-105' : 'border-gray-100 bg-white text-gray-600 hover:border-gray-300'}`}>{size}</button>
                ))}
              </div>
            </div>

            <div className="mt-auto mb-8">
              <h4 className="text-sm font-black uppercase tracking-widest text-gray-400 mb-4 flex items-center gap-2"><MapPin className="w-4 h-4 text-blue-500" /> Shipping Destination</h4>
              <div className="space-y-3">
                <label className={`cursor-pointer block p-5 rounded-2xl border-2 transition-all ${!useNewAddress ? 'border-black bg-gray-50 shadow-sm' : 'border-gray-100 bg-white hover:border-gray-200'}`}>
                  <div className="flex items-center gap-3 mb-2">
                    <input type="radio" checked={!useNewAddress} onChange={() => setUseNewAddress(false)} className="w-4 h-4 text-black focus:ring-black accent-black" />
                    <span className="font-bold text-gray-900 text-sm uppercase tracking-widest">Saved Address</span>
                  </div>
                  {data.user ? (
                    <div className="ml-7"><p className="font-semibold text-gray-800 text-sm mb-1">{data.user.address}</p><p className="font-bold text-gray-500 text-xs uppercase tracking-widest">Pincode: {data.user.pincode}</p></div>
                  ) : (<p className="ml-7 text-gray-400 text-sm font-medium">Loading destination...</p>)}
                </label>
                <label className={`cursor-pointer block p-5 rounded-2xl border-2 transition-all ${useNewAddress ? 'border-black bg-gray-50 shadow-sm' : 'border-gray-100 bg-white hover:border-gray-200'}`}>
                  <div className="flex items-center gap-3 mb-2">
                    <input type="radio" checked={useNewAddress} onChange={() => setUseNewAddress(true)} className="w-4 h-4 text-black focus:ring-black accent-black" />
                    <span className="font-bold text-gray-900 text-sm uppercase tracking-widest">Different Address</span>
                  </div>
                  {useNewAddress && (
                    <div className="ml-7 mt-4 space-y-3">
                      <input type="text" placeholder="Street Address" value={newAddress.address} onChange={e => setNewAddress({...newAddress, address: e.target.value})} className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-black outline-none transition-all font-semibold text-gray-900 text-sm" />
                      <input type="text" placeholder="Pincode" value={newAddress.pincode} onChange={e => setNewAddress({...newAddress, pincode: e.target.value})} className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-black outline-none transition-all font-semibold text-gray-900 text-sm" />
                    </div>
                  )}
                </label>
              </div>
            </div>

            <button onClick={initiatePayment} disabled={isFormInvalid} className={`w-full font-black uppercase tracking-widest py-5 rounded-xl transition-all flex justify-center items-center gap-2 ${isFormInvalid ? 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200' : 'bg-black hover:bg-gray-800 text-white shadow-lg active:scale-95'}`}>
              Proceed to Payment
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}