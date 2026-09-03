/**
 * Data promosi/kampanye CONTOH (demo) — Fase 3, PRD §13 Marketing/
 * Promotion UI. Catatan sama seperti `catalog.ts`/`orders.ts`.
 */

export type PromotionType = "discount" | "voucher" | "flash_sale" | "bundle" | "free_shipping";
export type PromotionStatus = "active" | "scheduled" | "ended" | "draft";

export interface Promotion {
  id: string;
  name: string;
  type: PromotionType;
  status: PromotionStatus;
  value: string;
  periodLabel: string;
}

export const PROMOTION_TYPE_LABEL: Record<PromotionType, string> = {
  discount: "Diskon",
  voucher: "Voucher",
  flash_sale: "Flash Sale",
  bundle: "Bundle",
  free_shipping: "Gratis Ongkir",
};

export const PROMOTIONS: Promotion[] = [
  { id: "promo-01", name: "Diskon Koleksi Pilihan", type: "discount", status: "active", value: "Hingga 30%", periodLabel: "1 – 31 Agustus 2026" },
  { id: "promo-02", name: "Voucher Pelanggan Baru", type: "voucher", status: "active", value: "Rp 25.000", periodLabel: "Berlaku terus" },
  { id: "promo-03", name: "Flash Sale Payday", type: "flash_sale", status: "scheduled", value: "Hingga 50%", periodLabel: "25 Agustus 2026, 20:00" },
  { id: "promo-04", name: "Gratis Ongkir Min. Rp150rb", type: "free_shipping", status: "active", value: "Gratis ongkir", periodLabel: "Berlaku terus" },
  { id: "promo-05", name: "Bundle Kemeja + Chino", type: "bundle", status: "draft", value: "Hemat Rp 50.000", periodLabel: "Belum dijadwalkan" },
  { id: "promo-06", name: "Diskon Kemerdekaan", type: "discount", status: "ended", value: "17%", periodLabel: "10 – 17 Agustus 2026" },
];

export interface Campaign {
  id: string;
  name: string;
  placement: string;
  status: PromotionStatus;
  periodLabel: string;
}

export const CAMPAIGNS: Campaign[] = [
  { id: "camp-01", name: "Banner Hero — Koleksi Baru", placement: "Homepage hero", status: "active", periodLabel: "1 – 31 Agustus 2026" },
  { id: "camp-02", name: "Promo Strip — Flash Sale Payday", placement: "Homepage promo banner", status: "scheduled", periodLabel: "25 Agustus 2026" },
];

export async function getPromotions(): Promise<Promotion[]> {
  return PROMOTIONS;
}

export async function getPromotionById(id: string): Promise<Promotion | null> {
  return PROMOTIONS.find((p) => p.id === id) ?? null;
}

export async function getCampaigns(): Promise<Campaign[]> {
  return CAMPAIGNS;
}
