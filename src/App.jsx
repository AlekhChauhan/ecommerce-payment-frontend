import React, { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import CheckoutForm from './CheckoutForm';
const stripePromise=loadStripe('pk_test_51UadZlRoCrNfEKnktfKFsentUONT84GZeHpIHRswNSmq6UVbBL8hn6Xs04mubrTgh5wCqQFa86k2djVEVgK5vZow0082Zz27cI');

export default function App() {
  const [cart, setCart]=useState([]);
  const [clientSecret,setClientSecret]=useState('');
  const [checkoutMode,setCheckoutMode]=useState(false);

  // Mock product database
  const products =[
    { id: 1, name: "Mechanical Keyboard", price: 120 },
    { id: 2, name: "Developer Coffee Mug", price: 15 },
    { id: 3, name: "Wireless Mouse", price: 50 }
  ];

  const addToCart=(product) => {
    setCart([...cart, product]);
  };

  // Calculate dynamic total in dollars
  const totalAmount=cart.reduce((sum, item) => sum + item.price, 0);

  const handleCheckout=()=>{
    if (totalAmount===0) return;
    setCheckoutMode(true);

    // Stripe requires the amount in cents (e.g., $15.00 = 1500 cents)
    const amountInCents=totalAmount * 100;

    // Send the dynamic cart total to Spring Boot
    fetch("http://localhost:8080/api/payment/create-payment-intent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount: amountInCents, currency: "usd" })
    })
      .then((res) => res.json())
      .then((data) => setClientSecret(data.clientSecret))
      .catch((err) => console.error("Error fetching secret:", err));
  };

  if (checkoutMode) {
    return (
      <div style={{ padding: '40px', maxWidth: '600px', margin: '0 auto', fontFamily: 'sans-serif' }}>
        <button 
          onClick={() => { setCheckoutMode(false); setClientSecret(''); }} 
          style={{ marginBottom: '20px', padding: '8px', cursor: 'pointer' }}
        >
          ← Back to Cart
        </button>
        
        {clientSecret ? (
          <Elements stripe={stripePromise} options={{ clientSecret }}>
            <CheckoutForm clientSecret={clientSecret} totalAmount={totalAmount} />
          </Elements>
        ) : (
          <p>Generating secure payment session...</p>
        )}
      </div>
    );
  }

  return (
    <div style={{ padding: '40px', maxWidth: '800px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      <h1>Tech Store</h1>
      
      <div style={{ display: 'flex', gap: '20px', marginBottom: '40px' }}>
        {products.map(p => (
          <div key={p.id} style={{ border: '1px solid #ccc', padding: '20px', borderRadius: '8px', width: '33%' }}>
            <h3>{p.name}</h3>
            <p style={{ fontSize: '20px', fontWeight: 'bold' }}>${p.price}.00</p>
            <button 
              onClick={() => addToCart(p)}
              style={{ background: '#28a745', color: 'white', border: 'none', padding: '10px', width: '100%', cursor: 'pointer', borderRadius: '4px' }}
            >
              Add to Cart
            </button>
          </div>
        ))}
      </div>

      <div style={{ background: '#f4f4f9', padding: '20px', borderRadius: '8px' }}>
        <h2>Your Cart ({cart.length} items)</h2>
        {cart.map((item, index) => (
          <p key={index}>• {item.name} - ${item.price}.00</p>
        ))}
        <hr style={{ margin: '15px 0' }} />
        <h3>Total: ${totalAmount}.00</h3>
        
        <button 
          onClick={handleCheckout} 
          disabled={cart.length === 0}
          style={{ background: cart.length > 0 ? '#6772e5' : '#ccc', color: 'white', border: 'none', padding: '15px', width: '100%', fontSize: '16px', cursor: cart.length > 0 ? 'pointer' : 'not-allowed', borderRadius: '4px' }}
        >
          Proceed to Checkout
        </button>
      </div>
    </div>
  );
}