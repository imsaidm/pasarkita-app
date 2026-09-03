/**
 * Data order CONTOH (demo) — Fase 4 preview, PRD §14 Orders/OMS UI, §15
 * Order Lifecycle. Lihat catatan penting di `lib/data/catalog.ts` —
 * berlaku sama di sini: WAJIB `SampleDataBanner` di setiap halaman
 * pemakainya, dan Dashboard TIDAK memakai file ini (§37 Coding Rule 21).
 *
 * Mendukung Channel Tagging (Multi-channel: Shopee Open Platform, Storefront PWA, Walk-in)
 * untuk pengajuan integrasi Shopee API.
 */

export type OrderStatus =
  | "new"
  | "payment_issue"
  | "processing"
  | "fulfillment"
  | "shipped"
  | "completed"
  | "cancelled"
  | "return_refund";

export type OrderChannel = "shopee" | "storefront" | "manual";

export const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  new: "Baru",
  payment_issue: "Masalah Pembayaran",
  processing: "Diproses",
  fulfillment: "Fulfillment",
  shipped: "Dikirim",
  completed: "Selesai",
  cancelled: "Dibatalkan",
  return_refund: "Retur / Refund",
};

export const ORDER_CHANNEL_LABEL: Record<OrderChannel, string> = {
  shopee: "Shopee",
  storefront: "Storefront Web",
  manual: "Manual / POS",
};

export interface OrderItem {
  productName: string;
  sku: string;
  variantLabel?: string;
  quantity: number;
  unitPrice: number;
}

export interface AdminOrder {
  id: string;
  orderNumber: string;
  channel: OrderChannel;
  channelOrderNumber?: string;
  customerName: string;
  city: string;
  status: OrderStatus;
  paymentLabel: string;
  shippingLabel: string;
  courierName?: string;
  trackingNumber?: string;
  createdAtLabel: string;
  items: OrderItem[];
  subtotal: number;
  shippingCost: number;
  total: number;
  /** true jika order ini termasuk "perlu tindakan" (§10.2 Action Required semantik). */
  actionRequired: boolean;
}

export const ORDERS: AdminOrder[] = [
  {
    id: "ord-2101",
    orderNumber: "KRY-20260816-01",
    channel: "shopee",
    channelOrderNumber: "260831SHP9182A",
    customerName: "Budi Santoso",
    city: "Jakarta Selatan",
    status: "new",
    paymentLabel: "ShopeePay / SPayLater — lunas",
    shippingLabel: "Shopee Xpress Standard",
    courierName: "SPX Standard",
    trackingNumber: "SPXID0489123891",
    createdAtLabel: "16 Agustus 2026, 09:12",
    items: [{ productName: "Sneakers Canvas — Putih", sku: "KRY-SP-001", variantLabel: "40", quantity: 1, unitPrice: 249000 }],
    subtotal: 249000,
    shippingCost: 15000,
    total: 264000,
    actionRequired: true,
  },
  {
    id: "ord-2102",
    orderNumber: "KRY-20260816-02",
    channel: "storefront",
    customerName: "Siti Rahma",
    city: "Bandung",
    status: "new",
    paymentLabel: "DOKU VA BCA — lunas",
    shippingLabel: "J&T Express (1-2 hari)",
    courierName: "J&T Express",
    trackingNumber: "JT9281726152",
    createdAtLabel: "16 Agustus 2026, 08:47",
    items: [
      { productName: "Dress Midi Rayon — Navy", sku: "KRY-WN-002", variantLabel: "M", quantity: 1, unitPrice: 259000 },
      { productName: "Sling Bag Mini — Terracotta", sku: "KRY-TS-002", quantity: 1, unitPrice: 165000 },
    ],
    subtotal: 424000,
    shippingCost: 35000,
    total: 459000,
    actionRequired: true,
  },
  {
    id: "ord-2103",
    orderNumber: "KRY-20260815-11",
    channel: "shopee",
    channelOrderNumber: "260830SHP4421X",
    customerName: "Andi Wijaya",
    city: "Surabaya",
    status: "payment_issue",
    paymentLabel: "Shopee COD — konfirmasi tertunda",
    shippingLabel: "J&T Cargo",
    courierName: "J&T Cargo",
    createdAtLabel: "15 Agustus 2026, 20:30",
    items: [{ productName: "Jaket Denim Pria — Biru", sku: "KRY-PR-004", variantLabel: "L", quantity: 1, unitPrice: 329000 }],
    subtotal: 329000,
    shippingCost: 15000,
    total: 344000,
    actionRequired: true,
  },
  {
    id: "ord-2104",
    orderNumber: "KRY-20260815-09",
    channel: "storefront",
    customerName: "Dewi Lestari",
    city: "Yogyakarta",
    status: "processing",
    paymentLabel: "DOKU VA Mandiri — lunas",
    shippingLabel: "SiCepat REG",
    courierName: "SiCepat",
    trackingNumber: "002918237162",
    createdAtLabel: "15 Agustus 2026, 14:02",
    items: [{ productName: "Blouse Linen Wanita — Krem", sku: "KRY-WN-001", variantLabel: "S / Krem", quantity: 2, unitPrice: 189000 }],
    subtotal: 378000,
    shippingCost: 15000,
    total: 393000,
    actionRequired: false,
  },
  {
    id: "ord-2105",
    orderNumber: "KRY-20260814-22",
    channel: "shopee",
    channelOrderNumber: "260829SHP7110B",
    customerName: "Rian Pratama",
    city: "Medan",
    status: "fulfillment",
    paymentLabel: "ShopeePay — lunas",
    shippingLabel: "Shopee Xpress Hemat",
    courierName: "SPX Hemat",
    trackingNumber: "SPXID092817221",
    createdAtLabel: "14 Agustus 2026, 11:20",
    items: [{ productName: "Boots Chelsea — Cokelat", sku: "KRY-SP-004", variantLabel: "41", quantity: 1, unitPrice: 389000 }],
    subtotal: 389000,
    shippingCost: 15000,
    total: 404000,
    actionRequired: false,
  },
  {
    id: "ord-2106",
    orderNumber: "KRY-20260814-03",
    channel: "storefront",
    customerName: "Maya Putri",
    city: "Semarang",
    status: "shipped",
    paymentLabel: "Transfer Bank — lunas",
    shippingLabel: "JNE Regular",
    courierName: "JNE",
    trackingNumber: "JNE019283711",
    createdAtLabel: "14 Agustus 2026, 09:05",
    items: [
      { productName: "Kemeja Oxford Pria — Navy", sku: "KRY-PR-001", variantLabel: "M", quantity: 1, unitPrice: 229000 },
      { productName: "Celana Chino Slim — Khaki", sku: "KRY-PR-002", variantLabel: "32", quantity: 1, unitPrice: 249000 },
    ],
    subtotal: 478000,
    shippingCost: 15000,
    total: 493000,
    actionRequired: false,
  },
  {
    id: "ord-2107",
    orderNumber: "KRY-20260812-14",
    channel: "shopee",
    channelOrderNumber: "260827SHP3301Z",
    customerName: "Ahmad Fauzi",
    city: "Tangerang",
    status: "completed",
    paymentLabel: "ShopeePay — lunas",
    shippingLabel: "Shopee Xpress Instant",
    courierName: "SPX Instant",
    trackingNumber: "SPXID99182371",
    createdAtLabel: "12 Agustus 2026, 16:40",
    items: [{ productName: "Dompet Kulit Bifold — Hitam", sku: "KRY-TS-004", quantity: 1, unitPrice: 149000 }],
    subtotal: 149000,
    shippingCost: 20000,
    total: 169000,
    actionRequired: false,
  },
  {
    id: "ord-2108",
    orderNumber: "KRY-20260810-08",
    channel: "manual",
    customerName: "Indah Permata",
    city: "Bekasi",
    status: "cancelled",
    paymentLabel: "Tunai / POS — dibatalkan",
    shippingLabel: "Ambil di Toko",
    createdAtLabel: "10 Agustus 2026, 10:11",
    items: [{ productName: "Totebag Kanvas — Natural", sku: "KRY-TS-001", quantity: 1, unitPrice: 129000 }],
    subtotal: 129000,
    shippingCost: 0,
    total: 129000,
    actionRequired: false,
  },
  {
    id: "ord-2109",
    orderNumber: "KRY-20260809-17",
    channel: "shopee",
    channelOrderNumber: "260824SHP8129M",
    customerName: "Hendra Kurniawan",
    city: "Surabaya",
    status: "completed",
    paymentLabel: "Shopee COD — lunas",
    shippingLabel: "J&T Express",
    courierName: "J&T Express",
    trackingNumber: "JT8827162512",
    createdAtLabel: "9 Agustus 2026, 13:15",
    items: [{ productName: "Ransel Harian — Navy", sku: "KRY-TS-003", quantity: 1, unitPrice: 279000 }],
    subtotal: 279000,
    shippingCost: 15000,
    total: 294000,
    actionRequired: false,
  },
  {
    id: "ord-2110",
    orderNumber: "KRY-20260805-19",
    channel: "shopee",
    channelOrderNumber: "260820SHP5541K",
    customerName: "Lina Marlina",
    city: "Palembang",
    status: "return_refund",
    paymentLabel: "Shopee Garansi — retur disetujui",
    shippingLabel: "Shopee Xpress Return",
    courierName: "SPX Return",
    trackingNumber: "SPXRET9928172",
    createdAtLabel: "5 Agustus 2026, 17:50",
    items: [{ productName: "Sandal Slide — Krem", sku: "KRY-SP-002", variantLabel: "39", quantity: 1, unitPrice: 129000 }],
    subtotal: 129000,
    shippingCost: 15000,
    total: 144000,
    actionRequired: true,
  },
  {
    id: "ord-2111",
    orderNumber: "KRY-20260801-02",
    channel: "storefront",
    customerName: "Rudi Hartono",
    city: "Malang",
    status: "completed",
    paymentLabel: "E-Wallet — lunas",
    shippingLabel: "Express (1-2 hari)",
    courierName: "SiCepat Best",
    trackingNumber: "001928374829",
    createdAtLabel: "1 Agustus 2026, 08:00",
    items: [{ productName: "Jam Tangan Minimalis — Navy", sku: "KRY-AK-002", variantLabel: "Tali Navy", quantity: 1, unitPrice: 259000 }],
    subtotal: 259000,
    shippingCost: 35000,
    total: 294000,
    actionRequired: false,
  },
];

export async function getAllOrders(): Promise<AdminOrder[]> {
  return ORDERS;
}

export async function getOrderById(id: string): Promise<AdminOrder | null> {
  return ORDERS.find((o) => o.id === id) ?? null;
}

export type OrderFilterKey = "action-required" | "payment-issues" | "fulfillment" | "returns" | "shopee" | "storefront";

export async function getOrdersByFilter(filter: OrderFilterKey): Promise<AdminOrder[]> {
  switch (filter) {
    case "action-required":
      return ORDERS.filter((o) => o.actionRequired);
    case "payment-issues":
      return ORDERS.filter((o) => o.status === "payment_issue");
    case "fulfillment":
      return ORDERS.filter((o) => o.status === "fulfillment" || o.status === "processing");
    case "returns":
      return ORDERS.filter((o) => o.status === "return_refund");
    case "shopee":
      return ORDERS.filter((o) => o.channel === "shopee");
    case "storefront":
      return ORDERS.filter((o) => o.channel === "storefront");
  }
}
