/**
 * Data pelanggan CONTOH (demo) — Fase 5, PRD §17 Customers/CRM UI. Field
 * PII (email/phone) SUDAH ditulis dalam bentuk masked di data ini sendiri
 * (bukan cuma di UI) — supaya kalau file ini pernah kelihatan di luar
 * konteks (log, screenshot, dsb.) tidak membocorkan data kontak asli
 * sekalipun ini fiktif. `PIIMaskedField` (§39) tetap dipakai di komponen
 * untuk mensimulasikan perilaku toggle-reveal berbasis permission
 * (`customerPii`), bukan untuk menyembunyikan data yang sebenarnya sudah
 * masked dari sononya.
 */

export interface Customer {
  id: string;
  name: string;
  maskedEmail: string;
  maskedPhone: string;
  city: string;
  joinedAtLabel: string;
  totalOrders: number;
  segment: "Baru" | "Reguler" | "Loyal";
}

export const CUSTOMERS: Customer[] = [
  { id: "cust-01", name: "Budi Santoso", maskedEmail: "b***i@example.com", maskedPhone: "0812-xxxx-341", city: "Jakarta Selatan", joinedAtLabel: "Maret 2026", totalOrders: 5, segment: "Loyal" },
  { id: "cust-02", name: "Siti Rahma", maskedEmail: "s***a@example.com", maskedPhone: "0813-xxxx-102", city: "Bandung", joinedAtLabel: "Juli 2026", totalOrders: 1, segment: "Baru" },
  { id: "cust-03", name: "Andi Wijaya", maskedEmail: "a***y@example.com", maskedPhone: "0821-xxxx-778", city: "Surabaya", joinedAtLabel: "Mei 2026", totalOrders: 2, segment: "Reguler" },
  { id: "cust-04", name: "Dewi Lestari", maskedEmail: "d***i@example.com", maskedPhone: "0857-xxxx-220", city: "Yogyakarta", joinedAtLabel: "Januari 2026", totalOrders: 7, segment: "Loyal" },
  { id: "cust-05", name: "Rian Pratama", maskedEmail: "r***a@example.com", maskedPhone: "0895-xxxx-561", city: "Medan", joinedAtLabel: "Agustus 2026", totalOrders: 1, segment: "Baru" },
  { id: "cust-06", name: "Maya Anggraini", maskedEmail: "m***i@example.com", maskedPhone: "0878-xxxx-903", city: "Semarang", joinedAtLabel: "April 2026", totalOrders: 3, segment: "Reguler" },
];

export async function getCustomers(): Promise<Customer[]> {
  return CUSTOMERS;
}

export async function getCustomerById(id: string): Promise<Customer | null> {
  return CUSTOMERS.find((c) => c.id === id) ?? null;
}
