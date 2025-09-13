import { useState } from 'react'
import './App.css'
import axios from 'axios'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import UserProfile from './components/UserProfile'
import { completePaymentFlow } from './services/paymentService'

function ProductCard() {
  const [quantity, setQuantity] = useState(1)
  const [isAdded, setIsAdded] = useState(false)
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle')
  const [statusMessage, setStatusMessage] = useState('')
  const { currentUser, isPaidUser, refreshPaymentStatus } = useAuth()

  const product = {
    id: 1,
    name: "Wireless Bluetooth Headphones",
    price: 2999,
    originalPrice: 3999,
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&h=300&fit=crop&crop=center",
    rating: 4.5,
    reviews: 128,
    description: "Premium quality wireless headphones with noise cancellation"
  }

  const cardStyle = {
    maxWidth: '400px',
    margin: '50px auto',
    border: '1px solid #e0e0e0',
    borderRadius: '12px',
    overflow: 'hidden',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    fontFamily: 'Arial, sans-serif'
  }

  const imageStyle = {
    width: '100%',
    height: '250px',
    objectFit: 'cover' as const
  }

  const contentStyle = {
    padding: '20px'
  }

  const titleStyle = {
    fontSize: '18px',
    fontWeight: 'bold',
    margin: '0 0 8px 0',
    color: '#333'
  }

  const priceStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    margin: '8px 0'
  }

  const currentPriceStyle = {
    fontSize: '20px',
    fontWeight: 'bold',
    color: '#e74c3c'
  }

  const originalPriceStyle = {
    fontSize: '16px',
    textDecoration: 'line-through',
    color: '#999'
  }

  const ratingStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
    margin: '8px 0',
    fontSize: '14px',
    color: '#666'
  }

  const quantityStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    margin: '15px 0'
  }

  const buttonStyle = {
    padding: '8px 12px',
    border: '1px solid #ddd',
    background: '#f8f9fa',
    cursor: 'pointer',
    borderRadius: '4px'
  }

  const addToCartStyle = {
    width: '100%',
    padding: '12px',
    backgroundColor: isAdded ? '#27ae60' : '#3498db',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'background-color 0.3s'
  }

  const handleBuyNow = async () => {
    try {
      setIsAdded(true)
      
   
      
      // const response = await axios.post('http://localhost:3000/create-order')
      const response = await axios.post('https://payment-backend-cms0.onrender.com/create-order')
      
      const orderData = response.data
      
      const options = {
        "key": "rzp_live_gS9mlkp62gLGIU", // Your Razorpay LIVE key
        "amount": orderData.amount,
        "currency": orderData.currency,
        "name": "Acme Corp",
        "description": product.name,
        "image": product.image,
        "order_id": orderData.id,
        "prefill": {
          "name": currentUser?.displayName || "Customer Name",
          "email": currentUser?.email || "customer@example.com",
          "contact": "+919876543210"
        },
        "notes": {
          "product_name": product.name,
          "quantity": quantity.toString()
        },
        "theme": {
          "color": "#3399cc"
        },
        "handler": async function (response: any) {
          console.log('Payment Response:', response)
          setPaymentStatus('processing')
          setStatusMessage('Verifying payment...')
          
          try {
            if (!currentUser) {
              throw new Error('User not authenticated')
            }

            // Verify payment and add to Firestore
            const result = await completePaymentFlow(currentUser, {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature
            }, orderData.amount)

            if (result.success) {
              setPaymentStatus('success')
              setStatusMessage(result.message)
              // Refresh payment status in auth context
              await refreshPaymentStatus()
            } else {
              setPaymentStatus('error')
              setStatusMessage(result.message)
            }
          } catch (error: any) {
            console.error('Payment verification error:', error)
            setPaymentStatus('error')
            setStatusMessage(error.message || 'Payment verification failed')
          } finally {
            setIsAdded(false)
          }
        },
        "modal": {
          "ondismiss": function() {
            setIsAdded(false)
            console.log('Payment cancelled')
          }
        }
      }
      
      const rzp = new (window as any).Razorpay(options)
      rzp.open()
      
    } catch (error) {
      console.error('Error creating order:', error)
      setIsAdded(false)
      alert('Failed to create order. Please try again.')
    }
  }

  // Payment status styles
  const statusContainerStyle: React.CSSProperties = {
    padding: '15px',
    marginBottom: '15px',
    borderRadius: '8px',
    textAlign: 'center',
    fontSize: '14px',
    fontWeight: '500'
  }

  const successStatusStyle: React.CSSProperties = {
    ...statusContainerStyle,
    backgroundColor: '#d4edda',
    color: '#155724',
    border: '1px solid #c3e6cb'
  }

  const errorStatusStyle: React.CSSProperties = {
    ...statusContainerStyle,
    backgroundColor: '#f8d7da',
    color: '#721c24',
    border: '1px solid #f5c6cb'
  }

  const processingStatusStyle: React.CSSProperties = {
    ...statusContainerStyle,
    backgroundColor: '#d1ecf1',
    color: '#0c5460',
    border: '1px solid #bee5eb'
  }

  const paidUserBadgeStyle: React.CSSProperties = {
    display: 'inline-block',
    backgroundColor: '#28a745',
    color: 'white',
    padding: '4px 8px',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: 'bold',
    marginLeft: '8px'
  }

  return (
    <div style={cardStyle}>
      <img src={product.image} alt={product.name} style={imageStyle} />
      
      <div style={contentStyle}>
        <h3 style={titleStyle}>
          {product.name}
          {isPaidUser && <span style={paidUserBadgeStyle}>✓ PAID</span>}
        </h3>

        {/* Payment Status Messages */}
        {paymentStatus === 'processing' && (
          <div style={processingStatusStyle}>
            🔄 {statusMessage}
          </div>
        )}
        
        {paymentStatus === 'success' && (
          <div style={successStatusStyle}>
            ✅ {statusMessage}
          </div>
        )}
        
        {paymentStatus === 'error' && (
          <div style={errorStatusStyle}>
            ❌ {statusMessage}
          </div>
        )}

        {isPaidUser && (
          <div style={successStatusStyle}>
            🎉 You have premium access! Enjoy exclusive features.
          </div>
        )}
        
        <div style={ratingStyle}>
          <span>⭐ {product.rating}</span>
          <span>({product.reviews} reviews)</span>
        </div>
        
        <div style={priceStyle}>
          <span style={currentPriceStyle}>₹{product.price}</span>
          <span style={originalPriceStyle}>₹{product.originalPrice}</span>
          <span style={{color: '#27ae60', fontSize: '12px'}}>
            {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF
          </span>
        </div>
        
        <p style={{color: '#666', fontSize: '14px', margin: '10px 0'}}>
          {product.description}
        </p>
        
        <div style={quantityStyle}>
          <span>Quantity:</span>
          <button 
            style={buttonStyle}
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
          >
            -
          </button>
          <span style={{minWidth: '20px', textAlign: 'center'}}>{quantity}</span>
          <button 
            style={buttonStyle}
            onClick={() => setQuantity(quantity + 1)}
          >
            +
          </button>
        </div>
        
        <button 
          style={addToCartStyle}
          onClick={handleBuyNow}
          disabled={isAdded || isPaidUser}
        >
          {isPaidUser ? 'Already Purchased ✓' : isAdded ? 'Processing...' : 'Buy Now'}
        </button>
      </div>
    </div>
  )
}

function App() {
  return (
    <AuthProvider>
      <ProtectedRoute>
        <div style={{ position: 'relative', minHeight: '100vh' }}>
          <UserProfile />
          <ProductCard />
        </div>
      </ProtectedRoute>
    </AuthProvider>
  )
}

export default App
