import React, { useState } from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

export default function CheckoutForm({ clientSecret, totalAmount }) {
  const stripe=useStripe();
  const elements=useElements();
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!stripe || !elements) return;
    setLoading(true);

    const result=await stripe.confirmCardPayment(clientSecret, {
      payment_method: { card: elements.getElement(CardElement) }
    });

    if (result.error) {
      setStatus(`Payment failed: ${result.error.message}`);
    } else if (result.paymentIntent.status === 'succeeded') {
      setStatus('Payment successful! Order confirmed.');
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} style={{ padding: '20px', boxShadow: '0 4px 10px rgba(0,0,0,0.1)', borderRadius: '8px', background: 'white' }}>
      <h2 style={{ textAlign: 'center' }}>Secure Checkout</h2>
      <p style={{ textAlign: 'center', marginBottom: '20px' }}>Amount to pay: <strong>${totalAmount}.00</strong></p>
      
      <div style={{ padding: '12px', border: '1px solid #ccc', borderRadius: '4px', marginBottom: '20px' }}>
        <CardElement />
      </div>
      
      <button type="submit" disabled={!stripe || loading} style={{ background: '#6772e5', color: 'white', border: 'none', padding: '15px', width: '100%', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '16px' }}>
        {loading ? 'Processing...' : `Pay $${totalAmount}.00`}
      </button>
      
      <p style={{ textAlign: 'center', marginTop: '15px', fontWeight: 'bold', color: status.includes('failed') ? 'red' : 'green' }}>
        {status}
      </p>
    </form>
  );
}