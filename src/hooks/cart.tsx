import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
} from 'react';

import AsyncStorage from '@react-native-community/async-storage';

interface Product {
  id: string;
  title: string;
  image_url: string;
  price: number;
  quantity: number;
}

interface CartContext {
  products: Product[];
  addToCart(item: Product): void;
  increment(id: string): void;
  decrement(id: string): void;
}

const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      const storagedProducts = await AsyncStorage.getItem(
        '@GoMarketplace:products',
      );

      if (storagedProducts) setProducts(JSON.parse(storagedProducts));
    }

    loadProducts();
  }, []);

  useEffect(() => {
    async function saveProducts(): Promise<void> {
      await AsyncStorage.setItem(
        '@GoMarketplace:products',
        JSON.stringify(products),
      );
    }
    saveProducts();
  }, [products]);

  const increment = useCallback(
    async id => {
      const product = products.find(item => item.id === id);
      if (product) {
        product.quantity += 1;
      }

      const updatedProducts = products.map(item => {
        if (item.id === id) {
          return product;
        }
        return item;
      });

      setProducts(updatedProducts as Product[]);

      // await AsyncStorage.setItem(
      //   'GoMarketplace:cart',
      //   JSON.stringify(products),
      // );
    },
    [products],
  );

  const decrement = useCallback(
    async id => {
      const product = products.find(item => item.id === id);
      if (product) {
        product.quantity = product.quantity === 0 ? 0 : product?.quantity - 1;
      }

      const updatedProducts = products.map(item => {
        if (item.id === id) {
          return product;
        }
        return item;
      });

      setProducts(updatedProducts as Product[]);

      // await AsyncStorage.setItem(
      //   'GoMarketplace:cart',
      //   JSON.stringify(products),
      // );
    },
    [products],
  );

  const addToCart = useCallback(
    async (product: Omit<Product, 'quantity'>) => {
      const foundProduct = products.find(res => res.id === product.id);

      if (foundProduct) {
        increment(foundProduct.id);
        return;
      }
      setProducts(oldProducts => [...oldProducts, { ...product, quantity: 1 }]);
    },
    [products, increment],
  );

  const value = React.useMemo(
    () => ({ addToCart, increment, decrement, products }),
    [products, addToCart, increment, decrement],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

function useCart(): CartContext {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(`useCart must be used within a CartProvider`);
  }

  return context;
}

export { CartProvider, useCart };
