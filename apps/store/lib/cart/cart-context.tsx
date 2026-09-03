"use client";

import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useReducer,
} from "react";

/**
 * Cart state container (PRD §52 Phase 1 — "State handling"; P-09 Resilient
 * — "Cart, session, dan state penting tidak boleh hilang hanya karena
 * refresh"; PWA-04 — cart state retained locally saat offline).
 *
 * INI FONDASI STATE-NYA SAJA. UI Cart (halaman /cart, CartItem, promo,
 * dsb — §17) adalah pekerjaan Fase 4, belum dibangun di sini.
 *
 * §53 Codex Coding Rules: "Do not use localStorage as authoritative
 * order/payment storage. Persist only safe guest/session data." — cart
 * items (productId/variantId/qty) TERMASUK "safe guest/session data" yang
 * boleh persist lokal; ini BUKAN penyimpanan order/payment. Saat checkout
 * sungguhan dibangun (Fase 5), cart ini akan disinkronkan ke Convex
 * sebagai source of truth, bukan digantikan localStorage.
 *
 * Harga/stok di sini TIDAK otoritatif (§40 API Design Expectations) —
 * field `unitPrice` di sini murni untuk tampilan sementara di Fase 1;
 * validasi ulang harga/stok wajib terjadi di backend saat checkout nanti.
 */

export interface CartItem {
  productId: string;
  skuId: string;
  variantId: string;
  name: string;
  variantLabel: string;
  unitPrice: number; // display-only, lihat catatan di atas — bukan authoritative
  quantity: number;
  imageUrl: string | null;
}

interface CartState {
  items: CartItem[];
  hydrated: boolean; // true setelah localStorage selesai dibaca di client
}

type CartAction =
  | { type: "HYDRATE"; items: CartItem[] }
  | { type: "ADD_ITEM"; item: CartItem }
  | { type: "REMOVE_ITEM"; productId: string; variantId: string }
  | {
      type: "UPDATE_QUANTITY";
      productId: string;
      variantId: string;
      quantity: number;
    }
  | { type: "CLEAR" };

const STORAGE_KEY = "pk.cart.v1";

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case "HYDRATE":
      return { items: action.items, hydrated: true };
    case "ADD_ITEM": {
      const existingIndex = state.items.findIndex(
        (i) =>
          i.productId === action.item.productId &&
          i.variantId === action.item.variantId
      );
      if (existingIndex >= 0) {
        const items = [...state.items];
        items[existingIndex] = {
          ...items[existingIndex],
          quantity: items[existingIndex].quantity + action.item.quantity,
        };
        return { ...state, items };
      }
      return { ...state, items: [...state.items, action.item] };
    }
    case "REMOVE_ITEM":
      return {
        ...state,
        items: state.items.filter(
          (i) =>
            !(
              i.productId === action.productId &&
              i.variantId === action.variantId
            )
        ),
      };
    case "UPDATE_QUANTITY":
      return {
        ...state,
        items: state.items.map((i) =>
          i.productId === action.productId && i.variantId === action.variantId
            ? { ...i, quantity: Math.max(1, action.quantity) }
            : i
        ),
      };
    case "CLEAR":
      return { ...state, items: [] };
    default:
      return state;
  }
}

interface CartContextValue {
  items: CartItem[];
  itemCount: number;
  hydrated: boolean;
  addItem: (item: CartItem) => void;
  removeItem: (productId: string, variantId: string) => void;
  updateQuantity: (
    productId: string,
    variantId: string,
    quantity: number
  ) => void;
  clear: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, {
    items: [],
    hydrated: false,
  });

  // Baca localStorage HANYA di client, setelah mount — menghindari
  // hydration mismatch antara render server (selalu kosong) dan render
  // client (bisa terisi dari kunjungan sebelumnya).
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      const items: CartItem[] = raw ? JSON.parse(raw) : [];
      dispatch({ type: "HYDRATE", items });
    } catch {
      dispatch({ type: "HYDRATE", items: [] });
    }
  }, []);

  useEffect(() => {
    if (!state.hydrated) return; // jangan timpa storage sebelum hydrate selesai
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state.items));
    } catch {
      // localStorage tidak tersedia (mis. private mode penuh) — cart tetap
      // berfungsi untuk sesi berjalan, hanya tidak persist antar-reload.
    }
  }, [state.items, state.hydrated]);

  const value = useMemo<CartContextValue>(
    () => ({
      items: state.items,
      itemCount: state.items.reduce((sum, i) => sum + i.quantity, 0),
      hydrated: state.hydrated,
      addItem: (item) => dispatch({ type: "ADD_ITEM", item }),
      removeItem: (productId, variantId) =>
        dispatch({ type: "REMOVE_ITEM", productId, variantId }),
      updateQuantity: (productId, variantId, quantity) =>
        dispatch({ type: "UPDATE_QUANTITY", productId, variantId, quantity }),
      clear: () => dispatch({ type: "CLEAR" }),
    }),
    [state]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error("useCart() harus dipanggil di dalam <CartProvider>");
  }
  return ctx;
}
