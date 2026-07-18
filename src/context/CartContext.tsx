"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

interface CartItem {
  id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  variantId?: string;
  variantName?: string;
  stock: number;
  isPreOrder?: boolean;
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (id: string, variantId?: string) => void;
  updateQuantity: (id: string, quantity: number, variantId?: string) => void;
  clearCart: () => void;
  cartTotal: number;
  cartCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

// Helper to generate a unique key for a cart item (product + variant combo)
function cartItemKey(id: string, variantId?: string) {
  return variantId ? `${id}__${variantId}` : id;
}

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [cart, setCart] = useState<CartItem[]>([]);

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem("cofferstore_cart");
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch (e) {
        console.error("Failed to parse cart", e);
      }
    }
  }, []);

  // Save cart to localStorage on change
  useEffect(() => {
    localStorage.setItem("cofferstore_cart", JSON.stringify(cart));
  }, [cart]);

  const addToCart = (item: CartItem) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find(
        (i) => cartItemKey(i.id, i.variantId) === cartItemKey(item.id, item.variantId)
      );
      if (existingItem) {
        return prevCart.map((i) =>
          cartItemKey(i.id, i.variantId) === cartItemKey(item.id, item.variantId)
            ? { ...i, quantity: Math.min(i.quantity + item.quantity, item.stock) }
            : i
        );
      }
      return [...prevCart, { ...item, quantity: Math.min(item.quantity, item.stock) }];
    });
  };

  const removeFromCart = (id: string, variantId?: string) => {
    setCart((prevCart) =>
      prevCart.filter(
        (item) => cartItemKey(item.id, item.variantId) !== cartItemKey(id, variantId)
      )
    );
  };

  const updateQuantity = (id: string, quantity: number, variantId?: string) => {
    if (quantity <= 0) {
      removeFromCart(id, variantId);
      return;
    }
    setCart((prevCart) =>
      prevCart.map((item) =>
        cartItemKey(item.id, item.variantId) === cartItemKey(id, variantId)
          ? { ...item, quantity: Math.min(quantity, item.stock) }
          : item
      )
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  const cartTotal = cart.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  const cartCount = cart.reduce((count, item) => count + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartTotal,
        cartCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
