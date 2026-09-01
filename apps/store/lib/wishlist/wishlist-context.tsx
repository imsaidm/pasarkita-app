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
 * Wishlist state container — pola sama persis dengan cart-context.tsx
 * (lihat catatan lengkap di sana soal §53 localStorage-untuk-guest-state).
 * PRD §16 Wishlist. `featureFlags.wishlist` di lib/config/tenant.ts saat
 * ini `true`, jadi fitur ini aktif (beda dengan Reviews/Flash Sale yang
 * masih `false`).
 *
 * Hanya menyimpan `productId` (bukan objek produk penuh) — detail produk
 * selalu diambil ulang dari `lib/data/products.ts` saat render, supaya
 * tidak ada data produk basi tersimpan di localStorage.
 */

interface WishlistState {
  productIds: string[];
  hydrated: boolean;
}

type WishlistAction =
  | { type: "HYDRATE"; productIds: string[] }
  | { type: "TOGGLE"; productId: string };

const STORAGE_KEY = "karyalo.wishlist.v1";

function reducer(state: WishlistState, action: WishlistAction): WishlistState {
  switch (action.type) {
    case "HYDRATE":
      return { productIds: action.productIds, hydrated: true };
    case "TOGGLE": {
      const has = state.productIds.includes(action.productId);
      return {
        ...state,
        productIds: has
          ? state.productIds.filter((id) => id !== action.productId)
          : [...state.productIds, action.productId],
      };
    }
    default:
      return state;
  }
}

interface WishlistContextValue {
  productIds: string[];
  hydrated: boolean;
  count: number;
  has: (productId: string) => boolean;
  toggle: (productId: string) => void;
}

const WishlistContext = createContext<WishlistContextValue | null>(null);

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, { productIds: [], hydrated: false });

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      dispatch({ type: "HYDRATE", productIds: raw ? JSON.parse(raw) : [] });
    } catch {
      dispatch({ type: "HYDRATE", productIds: [] });
    }
  }, []);

  useEffect(() => {
    if (!state.hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state.productIds));
    } catch {
      // localStorage tidak tersedia — wishlist tetap jalan untuk sesi berjalan
    }
  }, [state.productIds, state.hydrated]);

  const value = useMemo<WishlistContextValue>(
    () => ({
      productIds: state.productIds,
      hydrated: state.hydrated,
      count: state.productIds.length,
      has: (productId) => state.productIds.includes(productId),
      toggle: (productId) => dispatch({ type: "TOGGLE", productId }),
    }),
    [state]
  );

  return (
    <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>
  );
}

export function useWishlist(): WishlistContextValue {
  const ctx = useContext(WishlistContext);
  if (!ctx) {
    throw new Error("useWishlist() harus dipanggil di dalam <WishlistProvider>");
  }
  return ctx;
}
