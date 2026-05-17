import { createContext, useContext, useState, useEffect, useCallback } from 'react'

const CartContext = createContext()

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    const saved = localStorage.getItem('cart')
    return saved ? JSON.parse(saved) : []
  })
  const [isOpen, setIsOpen] = useState(false)
  const [bouncing, setBouncing] = useState(false)

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(items))
  }, [items])

  const addItem = useCallback((product, size, quantity = 1) => {
    setItems(prev => {
      const existing = prev.find(i => i.product.id === product.id && i.size === size)
      if (existing) {
        return prev.map(i =>
          i.product.id === product.id && i.size === size
            ? { ...i, quantity: i.quantity + quantity }
            : i
        )
      }
      return [...prev, { product, size, quantity }]
    })
    setBouncing(true)
    setTimeout(() => setBouncing(false), 400)
    setIsOpen(true)
  }, [])

  const removeItem = (productId, size) => {
    setItems(prev => prev.filter(i => !(i.product.id === productId && i.size === size)))
  }

  const updateQuantity = (productId, size, quantity) => {
    if (quantity <= 0) {
      removeItem(productId, size)
      return
    }
    setItems(prev =>
      prev.map(i =>
        i.product.id === productId && i.size === size ? { ...i, quantity } : i
      )
    )
  }

  const clearCart = () => setItems([])

  const total = items.reduce((sum, i) => sum + i.product.price * i.quantity, 0)
  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0)

  return (
    <CartContext.Provider value={{
      items, isOpen, setIsOpen, addItem, removeItem, updateQuantity, clearCart, total, itemCount, bouncing
    }}>
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => useContext(CartContext)
