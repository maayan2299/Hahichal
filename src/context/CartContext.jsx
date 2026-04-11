import { createContext, useContext, useState, useEffect } from 'react'

const CartContext = createContext()

export function useCart() {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used within CartProvider')
  }
  return context
}

export function CartProvider({ children }) {
  const [cart, setCart] = useState([])
  const [isCartOpen, setIsCartOpen] = useState(false)

  // טען עגלה מ-localStorage בטעינה ראשונה
  useEffect(() => {
    const savedCart = localStorage.getItem('ההיכל-cart')
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart))
      } catch (error) {
        console.error('Error loading cart:', error)
      }
    }
  }, [])

  // שמור עגלה ל-localStorage כשהיא משתנה
  useEffect(() => {
    localStorage.setItem('ההיכל-cart', JSON.stringify(cart))
  }, [cart])

  // הוסף מוצר לעגלה
  // customizations = אובייקט { [type]: { text, color, checked } }
  // extraPrice = מחיר התאמה אישית כבר מחושב
  const addToCart = (product, quantity = 1, customizations = null, extraPrice = 0) => {
    setCart(prevCart => {
      // בדוק אם יש התאמות אמיתיות
      const hasCustomizations = customizations && Object.keys(customizations).length > 0

      // מזהה ייחודי - כולל התאמות אם יש
      const uniqueId = hasCustomizations
        ? `${product.id}-${JSON.stringify(customizations)}`
        : String(product.id)

      // בדוק אם כבר קיים בעגלה
      const existingItem = prevCart.find(item => (item.uniqueId || String(item.id)) === uniqueId)

      if (existingItem) {
        return prevCart.map(item =>
          (item.uniqueId || String(item.id)) === uniqueId
            ? { ...item, quantity: item.quantity + quantity }
            : item
        )
      } else {
        const displayPrice = product.on_sale && product.sale_price
          ? parseFloat(product.sale_price)
          : parseFloat(product.price)

        return [...prevCart, {
          ...product,
          quantity,
          uniqueId,
          customizations: hasCustomizations ? customizations : null,
          extraPrice: parseFloat(extraPrice) || 0,
          displayPrice
        }]
      }
    })

    setIsCartOpen(true)
  }

  // הסר מוצר מהעגלה
  const removeFromCart = (uniqueId) => {
    setCart(prevCart => prevCart.filter(item => (item.uniqueId || String(item.id)) !== String(uniqueId)))
  }

  // עדכן כמות מוצר
  const updateQuantity = (uniqueId, quantity) => {
    if (quantity < 1) {
      removeFromCart(uniqueId)
      return
    }
    setCart(prevCart =>
      prevCart.map(item =>
        (item.uniqueId || String(item.id)) === String(uniqueId)
          ? { ...item, quantity }
          : item
      )
    )
  }

  // רוקן עגלה
  const clearCart = () => {
    setCart([])
  }

  // חשב סכום ביניים
  const getSubtotal = () => {
    return cart.reduce((total, item) => {
      const basePrice = parseFloat(item.displayPrice || item.sale_price || item.price) || 0
      const extra = parseFloat(item.extraPrice) || 0
      return total + (basePrice + extra) * item.quantity
    }, 0)
  }

  // חשב משלוח (ניתן לעקוף מ-localStorage)
  const getShipping = () => {
    const subtotal = getSubtotal()
    try {
      const saved = localStorage.getItem('heichal_shipping_settings')
      if (saved) {
        const settings = JSON.parse(saved)
        const freeAbove = parseFloat(settings.standard?.free_above) || 400
        const price = parseFloat(settings.standard?.price) || 35
        return subtotal >= freeAbove ? 0 : price
      }
    } catch {}
    return subtotal >= 400 ? 0 : 35
  }

  // חשב סה"כ
  const getTotal = () => {
    return getSubtotal() + getShipping()
  }

  // כמות פריטים בעגלה
  const getItemCount = () => {
    return cart.reduce((total, item) => total + item.quantity, 0)
  }

  const value = {
    cart,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getSubtotal,
    getShipping,
    getTotal,
    getItemCount,
    isCartOpen,
    setIsCartOpen,
  }

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}
