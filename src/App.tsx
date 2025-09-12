import { useState } from 'react'
import './App.css'
import axios from 'axios'

function App() {
  const [quantity, setQuantity] = useState(1)
  const [isAdded, setIsAdded] = useState(false)

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
      
   
      
      const response = await axios.post('http://localhost:3000/create-order')
      
      const orderData = response.data
      
      const options = {
        "key": "rzp_test_RGGVGUEjDKnagF", // Your Razorpay key
        "amount": orderData.amount,
        "currency": orderData.currency,
        "name": "Acme Corp",
        "description": product.name,
        "image": product.image,
        "order_id": orderData.id,
        "prefill": {
          "name": "Customer Name",
          "email": "customer@example.com",
          "contact": "+919876543210"
        },
        "notes": {
          "product_name": product.name,
          "quantity": quantity.toString()
        },
        "theme": {
          "color": "#3399cc"
        },
        "handler": function (response: any) {
          alert(`Payment successful! Payment ID: ${response.razorpay_payment_id}`)
          console.log('Payment Response:', response)
          setIsAdded(false)
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

  return (
    <div style={cardStyle}>
      <img src={product.image} alt={product.name} style={imageStyle} />
      
      <div style={contentStyle}>
        <h3 style={titleStyle}>{product.name}</h3>
        
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
        >
          {isAdded ? 'Processing...' : 'Buy Now'}
        </button>
      </div>
    </div>
  )
}

export default App
