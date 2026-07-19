
import React, { useState } from 'react';
import type { SubscriptionTier } from '../types';

interface CheckoutScreenProps {
  planId: SubscriptionTier;
  planName: string;
  price: string;
  userId: string;
  onBack: () => void;
}

const CheckoutScreen: React.FC<CheckoutScreenProps> = ({ planId, planName, price, userId, onBack }) => {
  const [loading, setLoading] = useState(false);

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
        const response = await fetch('/api/create-checkout-session', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                planId,
                price,
                name: planName,
                userId,
            }),
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Failed to create checkout session');
        }

        if (data.url) {
            window.location.href = data.url;
        } else {
            throw new Error('No checkout URL returned');
        }
    } catch (error: any) {
        console.error("Checkout error:", error);
        alert("Payment failed: " + error.message);
        setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto animate-fade-in py-8">
        <button onClick={onBack} className="mb-8 flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" /></svg>
            Cancel and Back
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Order Summary */}
            <div className="glass-panel p-8 rounded-2xl h-fit border border-white/5 bg-gradient-to-br from-white/5 to-transparent">
                <h3 className="text-xl font-bold text-white mb-6">Order Summary</h3>
                <div className="flex justify-between items-center mb-4 pb-4 border-b border-white/10">
                    <div>
                        <div className="text-lg font-bold text-white">{planName}</div>
                        <div className="text-sm text-gray-400">Monthly Subscription</div>
                    </div>
                    <div className="text-xl font-bold text-white">{price}</div>
                </div>
                <div className="flex justify-between items-center text-gray-300 text-sm mb-8">
                    <span>Tax</span>
                    <span>$0.00</span>
                </div>
                <div className="flex justify-between items-center text-xl font-bold text-white pt-4 border-t border-white/10">
                    <span>Total due</span>
                    <span className="text-brand-green">{price}</span>
                </div>
                
                <div className="mt-8 bg-black/20 p-4 rounded-lg border border-white/5">
                    <h4 className="text-sm font-semibold text-gray-300 mb-2">What's included:</h4>
                    <ul className="text-sm text-gray-400 space-y-2">
                        {planId === 'pro' && (
                            <>
                                <li>• Unlimited AI Interview Sessions</li>
                                <li>• Advanced Performance Reports</li>
                                <li>• Priority Support</li>
                            </>
                        )}
                        {planId === 'recruiter' && (
                            <>
                                <li>• Everything in Pro</li>
                                <li>• Invite Candidates</li>
                                <li>• Team Dashboard</li>
                            </>
                        )}
                    </ul>
                </div>
            </div>

            {/* Payment Form */}
            <div className="glass-panel p-8 rounded-2xl border border-white/5">
                <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-brand-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
                    Checkout with Stripe
                </h3>
                
                <form onSubmit={handlePayment} className="space-y-5">
                    <p className="text-gray-300 mb-6">
                        You will be redirected to Stripe's secure checkout page to complete your payment.
                    </p>

                    <div className="pt-4">
                        <button 
                            type="submit" 
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-brand-blue to-blue-600 hover:from-blue-500 hover:to-blue-700 text-white font-bold py-4 rounded-xl shadow-lg transition-all transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    Redirecting...
                                </>
                            ) : (
                                `Pay ${price}`
                            )}
                        </button>
                        <p className="text-center text-xs text-gray-500 mt-4 flex items-center justify-center gap-1">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                            Secure 256-bit SSL Encrypted Payment
                        </p>
                    </div>
                </form>
            </div>
        </div>
    </div>
  );
};

export default CheckoutScreen;
