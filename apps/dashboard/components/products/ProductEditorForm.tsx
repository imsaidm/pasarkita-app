"use client";

import { ChangeEvent, FormEvent, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AdminProduct,
  ProductVariantItem,
  ProductVariantOption,
  CATEGORIES,
} from "@/lib/data/catalog-types";
import { formatRupiah } from "@/lib/utils/currency";
import {
  Upload,
  Layers,
  Plus,
  Trash2,
  Check,
  ShoppingBag,
  Globe,
  RefreshCw,
  ArrowLeft,
  CheckCircle2,
  Eye,
  Star,
  Package,
  Truck,
  FileText,
  AlertTriangle,
  Info,
} from "lucide-react";

interface ProductEditorFormProps {
  product?: AdminProduct;
  isNew?: boolean;
}

export function ProductEditorForm({ product, isNew = false }: ProductEditorFormProps) {
  const router = useRouter();

  // 1. Informasi Dasar & Storefront Content
  const [name, setName] = useState(product?.name ?? "");
  const [slug, setSlug] = useState(product?.slug ?? "");
  const [categorySlug, setCategorySlug] = useState(product?.categorySlug ?? "wanita");
  const [shortDescription, setShortDescription] = useState(
    product?.shortDescription ?? "Blouse linen premium yang adem dan nyaman untuk daily wear."
  );
  const [description, setDescription] = useState(
    product?.description ??
      "Blouse berbahan linen premium yang ringan dan adem, cocok untuk aktivitas harian maupun semi-formal.\n\nBahan: 100% Organic Linen Premium\nPetunjuk Perawatan: Cuci dengan air dingin dan hindari pemutih."
  );
  const [status, setStatus] = useState<"published" | "draft" | "archived">(
    product?.status ?? "published"
  );
  const [badge, setBadge] = useState<"Baru" | "Sale" | "Terlaris" | "none">(
    product?.badge ? product.badge : "none"
  );
  const [brand, setBrand] = useState(product?.brand ?? "Karyalo Official");
  const [condition, setCondition] = useState<"BARU" | "BEKAS">(product?.condition ?? "BARU");

  // 2. Galeri Media & Upload Gambar (Multi-image, 1:1 Aspect Ratio)
  const [images, setImages] = useState<string[]>(
    product?.images && product.images.length > 0
      ? product.images
      : [
          "/images/products/product-blouse-linen-wanita-krem.jpg",
          "/images/products/product-blouse-linen-wanita-krem-2.jpg",
        ]
  );
  const [newImageUrl, setNewImageUrl] = useState("");
  const [imageUploadError, setImageUploadError] = useState<string | null>(null);

  // 3. Harga, Stok & Spesifikasi Logistik (Shopee OpenAPI v2 requirement)
  const [basePrice, setBasePrice] = useState<number>(product?.price ?? 189000);
  const [compareAtPrice, setCompareAtPrice] = useState<number | undefined>(product?.compareAtPrice);
  const [baseStock, setBaseStock] = useState<number>(product?.stock ?? 24);
  const [lowStockThreshold, setLowStockThreshold] = useState<number>(
    product?.lowStockThreshold ?? 10
  );
  const [sku, setSku] = useState(product?.sku ?? (isNew ? "KRY-NEW-001" : ""));
  const [weightGram, setWeightGram] = useState<number>(product?.weightGram ?? 250);
  const [dimensionLength, setDimensionLength] = useState<number>(
    product?.dimensions?.lengthCm ?? 25
  );
  const [dimensionWidth, setDimensionWidth] = useState<number>(
    product?.dimensions?.widthCm ?? 20
  );
  const [dimensionHeight, setDimensionHeight] = useState<number>(
    product?.dimensions?.heightCm ?? 3
  );

  // 4. Varian Produk & Matriks Kombinasi
  const [hasVariants, setHasVariants] = useState<boolean>(
    (product?.variants && product.variants.length > 0) || false
  );
  const [variantOptions, setVariantOptions] = useState<ProductVariantOption[]>(
    product?.variants && product.variants.length > 0
      ? product.variants
      : [{ name: "Ukuran", options: ["S", "M", "L"] }]
  );
  const [variantMatrix, setVariantMatrix] = useState<ProductVariantItem[]>(
    product?.variantMatrix && product.variantMatrix.length > 0
      ? product.variantMatrix
      : [
          {
            id: "v1",
            sku: `${sku || "KRY-WN-001"}-S`,
            title: "S",
            price: basePrice,
            stock: 8,
            shopeeSyncStatus: "synced",
          },
          {
            id: "v2",
            sku: `${sku || "KRY-WN-001"}-M`,
            title: "M",
            price: basePrice,
            stock: 10,
            shopeeSyncStatus: "synced",
          },
          {
            id: "v3",
            sku: `${sku || "KRY-WN-001"}-L`,
            title: "L",
            price: basePrice,
            stock: 6,
            shopeeSyncStatus: "synced",
          },
        ]
  );

  // 5. Kanal Penjualan & Shopee OpenAPI v2
  const [channelStorefront, setChannelStorefront] = useState(
    product?.channels ? product.channels.includes("storefront") : true
  );
  const [channelShopee, setChannelShopee] = useState(
    product?.channels ? product.channels.includes("shopee") : true
  );
  const [shopeeCategoryId, setShopeeCategoryId] = useState(
    product?.shopeeCategoryId ?? "100017"
  );
  const [shopeeCategoryName, setShopeeCategoryName] = useState(
    product?.shopeeCategoryName ?? "Pakaian Wanita > Atasan > Blouse & Kemeja"
  );
  const [shopeeItemId, setShopeeItemId] = useState(
    product?.shopeeItemId ?? `sh-item-${Date.now().toString().slice(-8)}`
  );
  const [shopeeSyncStatus, setShopeeSyncStatus] = useState(product?.shopeeSyncStatus ?? "synced");

  // Feedback & Modal State
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [shopeeSyncSuccess, setShopeeSyncSuccess] = useState(false);
  const [showStorefrontPreview, setShowStorefrontPreview] = useState(false);

  // Auto-generate slug
  const handleNameChange = (val: string) => {
    setName(val);
    if (isNew) {
      setSlug(
        val
          .toLowerCase()
          .replace(/[^\w\s-]/g, "")
          .replace(/\s+/g, "-")
      );
    }
  };

  // Upload Gambar File Handler (Harden: validasi < 2 MB, tipe file, & batas 9 foto)
  const MAX_FILE_SIZE_BYTES = 2 * 1024 * 1024; // 2 MB
  const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/jpg"];

  const handleFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
    setImageUploadError(null);
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const fileList = Array.from(files);
    const validFiles: File[] = [];

    for (const file of fileList) {
      if (!ALLOWED_TYPES.includes(file.type.toLowerCase())) {
        setImageUploadError(
          `Format file "${file.name}" tidak didukung. Shopee OpenAPI mewajibkan format JPG, PNG, atau WebP.`
        );
        e.target.value = "";
        return;
      }
      if (file.size > MAX_FILE_SIZE_BYTES) {
        const sizeMb = (file.size / (1024 * 1024)).toFixed(2);
        setImageUploadError(
          `File "${file.name}" melebihi batas ukuran maksimal 2 MB (ukuran file saat ini: ${sizeMb} MB). Mohon kompres foto sebelum diupload sesuai standar Shopee OpenAPI.`
        );
        e.target.value = "";
        return;
      }
      validFiles.push(file);
    }

    if (images.length + validFiles.length > 9) {
      setImageUploadError(
        `Maksimal 9 foto per listing produk. Hanya ${Math.max(0, 9 - images.length)} foto yang dapat ditambahkan.`
      );
    }

    const filesToProcess = validFiles.slice(0, Math.max(0, 9 - images.length));
    filesToProcess.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setImages((prev) => (prev.length < 9 ? [...prev, event.target!.result as string] : prev));
        }
      };
      reader.readAsDataURL(file);
    });

    e.target.value = "";
  };

  const handleAddImageUrl = () => {
    setImageUploadError(null);
    const trimmed = newImageUrl.trim();
    if (!trimmed) return;

    if (!trimmed.startsWith("http://") && !trimmed.startsWith("https://") && !trimmed.startsWith("/")) {
      setImageUploadError("URL foto produk harus diawali dengan http://, https://, atau /images/.");
      return;
    }

    if (images.length >= 9) {
      setImageUploadError("Maksimal 9 foto per listing produk sesuai standar Shopee OpenAPI.");
      return;
    }

    setImages((prev) => [...prev, trimmed]);
    setNewImageUrl("");
  };

  const handleSetPrimaryImage = (index: number) => {
    if (index === 0) return;
    setImages((prev) => {
      const selected = prev[index];
      const remaining = prev.filter((_, i) => i !== index);
      return [selected, ...remaining];
    });
  };

  const handleRemoveImage = (index: number) => {
    setImageUploadError(null);
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  // Helper tambah opsi varian
  const addOptionValue = (optIndex: number, val: string) => {
    if (!val.trim()) return;
    const updated = [...variantOptions];
    if (!updated[optIndex].options.includes(val.trim())) {
      updated[optIndex].options.push(val.trim());
      setVariantOptions(updated);
      regenerateMatrix(updated);
    }
  };

  const removeOptionValue = (optIndex: number, valIndex: number) => {
    const updated = [...variantOptions];
    updated[optIndex].options.splice(valIndex, 1);
    setVariantOptions(updated);
    regenerateMatrix(updated);
  };

  // Re-generate variant matrix rows
  const regenerateMatrix = (opts: ProductVariantOption[]) => {
    if (opts.length === 0 || opts.every((o) => o.options.length === 0)) {
      setVariantMatrix([]);
      return;
    }

    if (opts.length === 1) {
      const rows: ProductVariantItem[] = opts[0].options.map((opt, idx) => ({
        id: `v-${idx + 1}`,
        sku: `${sku || "KRY"}-${opt.toUpperCase()}`,
        title: opt,
        price: basePrice,
        stock: Math.floor(baseStock / Math.max(1, opts[0].options.length)),
        shopeeSyncStatus: "synced",
      }));
      setVariantMatrix(rows);
    } else if (opts.length === 2) {
      const rows: ProductVariantItem[] = [];
      let idx = 1;
      for (const opt1 of opts[0].options) {
        for (const opt2 of opts[1].options) {
          rows.push({
            id: `v-${idx++}`,
            sku: `${sku || "KRY"}-${opt1.slice(0, 3).toUpperCase()}-${opt2.toUpperCase()}`,
            title: `${opt1} / ${opt2}`,
            price: basePrice,
            stock: Math.floor(baseStock / Math.max(1, opts[0].options.length * opts[1].options.length)),
            shopeeSyncStatus: "synced",
          });
        }
      }
      setVariantMatrix(rows);
    }
  };

  const handleMatrixChange = (id: string, field: "price" | "stock" | "sku", val: string | number) => {
    setVariantMatrix((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: val } : item))
    );
  };

  const handleFormSubmit = (e: FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3500);
    }, 600);
  };

  const handlePushToShopee = () => {
    setShopeeSyncSuccess(false);
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setShopeeSyncStatus("synced");
      setShopeeSyncSuccess(true);
      setTimeout(() => setShopeeSyncSuccess(false), 4000);
    }, 1000);
  };

  return (
    <form onSubmit={handleFormSubmit} className="flex flex-col gap-6">
      {saveSuccess && (
        <div className="flex items-center gap-2.5 rounded-2xl bg-soft-sage p-4 text-xs font-semibold text-karyalo-green shadow-xs">
          <CheckCircle2 size={16} aria-hidden="true" />
          <span>Perubahan katalog produk berhasil disimpan & disinkronkan ke Storefront.</span>
        </div>
      )}

      {shopeeSyncSuccess && (
        <div className="flex items-center gap-2.5 rounded-2xl bg-[#ee4d2d]/10 p-4 text-xs font-semibold text-[#ee4d2d] shadow-xs">
          <ShoppingBag size={16} aria-hidden="true" />
          <span>Listing produk, deskripsi, gambar, dan stok varian berhasil dipush ke Shopee OpenAPI v2!</span>
        </div>
      )}

      {/* Action Bar Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-warm-white p-3.5 shadow-xs">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-ink">Status Listing:</span>
          <span
            className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
              status === "published"
                ? "bg-soft-sage text-karyalo-green"
                : status === "draft"
                ? "bg-soft-sand text-muted"
                : "bg-terracotta-soft text-status-critical"
            }`}
          >
            {status.toUpperCase()}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowStorefrontPreview(true)}
            className="tap-target inline-flex items-center gap-1.5 rounded-xl border border-border bg-soft-sand px-3 py-1.5 text-xs font-semibold text-ink hover:border-karyalo-green hover:bg-soft-sage"
          >
            <Eye size={14} aria-hidden="true" />
            <span>Preview di Storefront</span>
          </button>

          <button
            type="submit"
            disabled={isSaving}
            className="tap-target inline-flex items-center gap-1.5 rounded-xl bg-karyalo-green px-4 py-1.5 text-xs font-semibold text-warm-white shadow-xs hover:bg-deep-pine disabled:opacity-50"
          >
            <Check size={14} aria-hidden="true" />
            <span>{isSaving ? "Menyimpan..." : "Simpan Produk"}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Kolom Kiri: Informasi Produk, Media & Variasi (2 Cols) */}
        <div className="flex flex-col gap-6 lg:col-span-2">
          {/* Section 1: Informasi Dasar */}
          <div className="rounded-2xl border border-border bg-warm-white p-4 sm:p-6 shadow-xs">
            <div className="flex items-center gap-2 mb-1">
              <FileText size={16} className="text-karyalo-green" aria-hidden="true" />
              <h2 className="text-sm font-semibold text-ink">Informasi Produk & Konten Storefront</h2>
            </div>
            <p className="text-xs text-muted">
              Data utama yang tampil pada halaman detail produk di Storefront dan Shopee Marketplace.
            </p>

            <div className="mt-4 flex flex-col gap-4">
              <div>
                <label className="mb-1 block text-xs font-medium text-ink">
                  Nama Produk <span className="text-status-critical">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="Contoh: Blouse Linen Wanita — Krem"
                  className="w-full rounded-xl border border-border bg-warm-white px-3.5 py-2.5 text-xs text-ink placeholder:text-muted focus:border-karyalo-green focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div>
                  <label className="mb-1 block text-xs font-medium text-ink">
                    Kategori <span className="text-status-critical">*</span>
                  </label>
                  <select
                    value={categorySlug}
                    onChange={(e) => {
                      setCategorySlug(e.target.value);
                      const cat = CATEGORIES.find((c) => c.slug === e.target.value);
                      if (cat) {
                        setShopeeCategoryId(cat.shopeeCategoryId);
                        setShopeeCategoryName(`${cat.name} > Atasan & Pakaian`);
                      }
                    }}
                    className="w-full rounded-xl border border-border bg-warm-white px-3.5 py-2.5 text-xs font-medium text-ink focus:border-karyalo-green focus:outline-none capitalize"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c.slug} value={c.slug}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-1 block text-xs font-medium text-ink">
                    SKU Induk (Master SKU) <span className="text-status-critical">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={sku}
                    onChange={(e) => setSku(e.target.value)}
                    placeholder="KRY-WN-001"
                    className="w-full rounded-xl border border-border bg-warm-white px-3.5 py-2.5 font-mono text-xs text-ink placeholder:text-muted focus:border-karyalo-green focus:outline-none"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-medium text-ink">Brand / Merek</label>
                  <input
                    type="text"
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    placeholder="Karyalo Official"
                    className="w-full rounded-xl border border-border bg-warm-white px-3.5 py-2.5 text-xs text-ink focus:border-karyalo-green focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-ink">
                  Deskripsi Singkat (Short Highlight)
                </label>
                <input
                  type="text"
                  value={shortDescription}
                  onChange={(e) => setShortDescription(e.target.value)}
                  placeholder="Ringkasan 1 kalimat yang tampil pada kartu produk di Storefront..."
                  className="w-full rounded-xl border border-border bg-warm-white px-3.5 py-2.5 text-xs text-ink placeholder:text-muted focus:border-karyalo-green focus:outline-none"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-medium text-ink">
                    Deskripsi Lengkap & Spesifikasi Bahan <span className="text-status-critical">*</span>
                  </label>
                  <span className="text-xs text-muted">Sinkron 100% dengan PDP Storefront</span>
                </div>
                <textarea
                  rows={5}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Deskripsikan material, instruksi pencucian, detail fitting, dan keunggulan produk..."
                  className="w-full rounded-xl border border-border bg-warm-white px-3.5 py-2.5 text-xs text-ink placeholder:text-muted focus:border-karyalo-green focus:outline-none font-sans leading-relaxed"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Galeri Media & Upload Gambar (Multi-Image 1:1, max 2MB validation) */}
          <div className="rounded-2xl border border-border bg-warm-white p-4 sm:p-6 shadow-xs">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold text-ink">Galeri Foto Produk</h2>
                <p className="mt-0.5 text-xs text-muted">
                  Format 1:1 persegi (min. 800x800 px, maks. 2 MB per file, format JPG/PNG/WebP sesuai standar Shopee OpenAPI).
                </p>
              </div>
              <span className="rounded-full bg-soft-sand px-2.5 py-0.5 text-xs font-semibold text-muted">
                {images.length} / 9 Foto
              </span>
            </div>

            {/* Error / Validation Warning Alert Banner */}
            {imageUploadError && (
              <div className="mt-3 flex items-start justify-between gap-2 rounded-xl border border-status-warning/40 bg-status-warning/10 p-3 text-xs text-status-warning">
                <div className="flex items-start gap-2">
                  <AlertTriangle size={15} className="mt-0.5 shrink-0" aria-hidden="true" />
                  <span className="font-medium leading-relaxed">{imageUploadError}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setImageUploadError(null)}
                  className="shrink-0 font-bold text-status-warning hover:opacity-80 px-1"
                >
                  ✕
                </button>
              </div>
            )}

            {/* Image List */}
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {images.map((img, idx) => (
                <div
                  key={idx}
                  className="group relative aspect-square overflow-hidden rounded-2xl border border-border bg-soft-sand shadow-2xs"
                >
                  <Image
                    src={img}
                    alt={`Foto ${idx + 1}`}
                    fill
                    unoptimized
                    className="object-cover"
                    sizes="(max-width: 768px) 50vw, 25vw"
                  />

                  {/* Primary Badge */}
                  {idx === 0 ? (
                    <span className="absolute left-2 top-2 rounded-md bg-deep-pine/90 px-1.5 py-0.5 text-xs font-bold text-warm-white shadow-xs">
                      Foto Utama
                    </span>
                  ) : (
                    <span className="absolute left-2 top-2 rounded-md bg-ink/60 px-1.5 py-0.5 text-xs font-medium text-warm-white">
                      Foto #{idx + 1}
                    </span>
                  )}

                  {/* Action Overlays */}
                  <div className="absolute inset-0 flex items-center justify-center gap-2 bg-ink/50 opacity-0 transition-opacity group-hover:opacity-100">
                    {idx !== 0 && (
                      <button
                        type="button"
                        onClick={() => handleSetPrimaryImage(idx)}
                        title="Jadikan Foto Utama"
                        className="tap-target flex size-8 items-center justify-center rounded-lg bg-warm-white text-ink shadow-xs hover:bg-soft-sage"
                      >
                        <Star size={14} className="text-status-warning" aria-hidden="true" />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(idx)}
                      title="Hapus Foto"
                      className="tap-target flex size-8 items-center justify-center rounded-lg bg-warm-white text-status-critical shadow-xs hover:bg-terracotta-soft"
                    >
                      <Trash2 size={14} aria-hidden="true" />
                    </button>
                  </div>
                </div>
              ))}

              {/* Upload Drop Zone Card */}
              {images.length < 9 && (
                <label className="tap-target flex aspect-square cursor-pointer flex-col items-center justify-center gap-1.5 rounded-2xl border-2 border-dashed border-border bg-soft-sand/40 text-muted transition-colors hover:border-karyalo-green hover:bg-soft-sage/30 hover:text-karyalo-green p-2 text-center">
                  <Upload size={20} aria-hidden="true" />
                  <span className="text-xs font-semibold">+ Upload Foto</span>
                  <span className="text-xs text-muted/80">Maks. 2 MB (JPG/PNG)</span>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/jpg"
                    multiple
                    onChange={handleFileUpload}
                    className="sr-only"
                  />
                </label>
              )}
            </div>

            {/* Add Image by URL fallback */}
            <div className="mt-3 flex items-center gap-2">
              <input
                type="url"
                value={newImageUrl}
                onChange={(e) => setNewImageUrl(e.target.value)}
                placeholder="Atau tempel URL gambar (/images/products/...)..."
                className="flex-1 rounded-xl border border-border bg-soft-sand/40 px-3 py-1.5 text-xs text-ink placeholder:text-muted focus:border-karyalo-green focus:bg-warm-white focus:outline-none"
              />
              <button
                type="button"
                onClick={handleAddImageUrl}
                className="tap-target shrink-0 rounded-xl border border-border bg-warm-white px-3 py-1.5 text-xs font-semibold text-ink hover:bg-soft-sand"
              >
                Tambah URL
              </button>
            </div>
          </div>

          {/* Section 3: Harga & Matriks Varian */}
          <div className="rounded-2xl border border-border bg-warm-white p-4 sm:p-6 shadow-xs">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold text-ink">Harga & Inventori Stok</h2>
                <p className="mt-0.5 text-xs text-muted">
                  Konfigurasi harga jual dan alokasi stok (mendukung SKU tunggal atau varian).
                </p>
              </div>

              {/* Toggle Varian */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-muted">Produk Bervarian</span>
                <label className="relative inline-flex cursor-pointer items-center">
                  <input
                    type="checkbox"
                    checked={hasVariants}
                    onChange={(e) => {
                      setHasVariants(e.target.checked);
                      if (e.target.checked && variantMatrix.length === 0) {
                        regenerateMatrix(variantOptions);
                      }
                    }}
                    className="peer sr-only"
                  />
                  <div className="peer h-6 w-11 rounded-full bg-border peer-checked:bg-karyalo-green peer-checked:after:translate-x-full peer-checked:after:border-warm-white after:absolute after:top-[2px] after:left-[2px] after:size-5 after:rounded-full after:border after:border-border after:bg-warm-white after:transition-all after:content-['']" />
                </label>
              </div>
            </div>

            {!hasVariants ? (
              /* Single SKU Mode */
              <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div>
                  <label className="mb-1 block text-xs font-medium text-ink">
                    Harga Jual (Rp) <span className="text-status-critical">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={basePrice}
                    onChange={(e) => setBasePrice(Number(e.target.value))}
                    className="w-full rounded-xl border border-border bg-warm-white px-3.5 py-2.5 text-xs font-semibold text-ink focus:border-karyalo-green focus:outline-none"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-medium text-ink">
                    Harga Coret / Asli (Rp)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={compareAtPrice ?? ""}
                    onChange={(e) =>
                      setCompareAtPrice(e.target.value ? Number(e.target.value) : undefined)
                    }
                    placeholder="Opsional (Sale)"
                    className="w-full rounded-xl border border-border bg-warm-white px-3.5 py-2.5 text-xs text-ink placeholder:text-muted focus:border-karyalo-green focus:outline-none"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-medium text-ink">
                    Stok Fisik <span className="text-status-critical">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={baseStock}
                    onChange={(e) => setBaseStock(Number(e.target.value))}
                    className="w-full rounded-xl border border-border bg-warm-white px-3.5 py-2.5 text-xs font-semibold text-ink focus:border-karyalo-green focus:outline-none"
                  />
                </div>
              </div>
            ) : (
              /* Multi-Variant Matrix Mode */
              <div className="mt-5 flex flex-col gap-5">
                {/* Options Generator */}
                <div className="rounded-xl border border-border/80 bg-soft-sand/40 p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-ink">Tipe Opsi Varian (Ukuran / Warna)</span>
                    <button
                      type="button"
                      onClick={() => {
                        if (variantOptions.length < 2) {
                          const updated = [...variantOptions, { name: "Warna", options: ["Krem"] }];
                          setVariantOptions(updated);
                          regenerateMatrix(updated);
                        }
                      }}
                      disabled={variantOptions.length >= 2}
                      className="tap-target inline-flex items-center gap-1 rounded-lg bg-warm-white px-2.5 py-1 text-xs font-semibold text-ink border border-border hover:border-karyalo-green disabled:opacity-50"
                    >
                      <Plus size={12} aria-hidden="true" />
                      <span>Tambah Tipe Opsi</span>
                    </button>
                  </div>

                  <div className="flex flex-col gap-3">
                    {variantOptions.map((opt, optIdx) => (
                      <div key={optIdx} className="flex flex-col gap-2 rounded-xl bg-warm-white p-3 border border-border">
                        <div className="flex items-center justify-between">
                          <input
                            type="text"
                            value={opt.name}
                            onChange={(e) => {
                              const updated = [...variantOptions];
                              updated[optIdx].name = e.target.value;
                              setVariantOptions(updated);
                            }}
                            className="font-semibold text-xs text-ink bg-transparent border-none focus:outline-none"
                          />
                          {variantOptions.length > 1 && (
                            <button
                              type="button"
                              onClick={() => {
                                const updated = variantOptions.filter((_, i) => i !== optIdx);
                                setVariantOptions(updated);
                                regenerateMatrix(updated);
                              }}
                              className="text-muted hover:text-status-critical"
                            >
                              <Trash2 size={13} aria-hidden="true" />
                            </button>
                          )}
                        </div>

                        <div className="flex flex-wrap items-center gap-1.5">
                          {opt.options.map((val, valIdx) => (
                            <span
                              key={valIdx}
                              className="inline-flex items-center gap-1 rounded-md bg-soft-sand px-2 py-0.5 text-xs font-medium text-ink"
                            >
                              <span>{val}</span>
                              <button
                                type="button"
                                onClick={() => removeOptionValue(optIdx, valIdx)}
                                className="text-muted hover:text-status-critical"
                              >
                                ×
                              </button>
                            </span>
                          ))}

                          <input
                            type="text"
                            placeholder="+ Nilai (Enter)"
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                addOptionValue(optIdx, e.currentTarget.value);
                                e.currentTarget.value = "";
                              }
                            }}
                            className="rounded-md border border-border bg-warm-white px-2 py-0.5 text-xs text-ink placeholder:text-muted focus:border-karyalo-green focus:outline-none"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Table Matriks Varian */}
                <div className="overflow-hidden rounded-2xl border border-border bg-warm-white">
                  <div className="border-b border-border bg-soft-sand/60 px-3.5 py-2.5 text-xs font-semibold text-ink flex items-center justify-between">
                    <span>Matriks Sub-SKU ({variantMatrix.length} kombinasi)</span>
                    <span className="text-xs text-muted">Sinkronisasi ke Shopee v2.product</span>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="border-b border-border bg-soft-sand/30 text-muted">
                        <tr>
                          <th className="px-3 py-2.5">Kombinasi Varian</th>
                          <th className="px-3 py-2.5">Sub-SKU</th>
                          <th className="px-3 py-2.5 text-right">Harga Jual (Rp)</th>
                          <th className="px-3 py-2.5 text-right">Stok Fisik</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {variantMatrix.map((item) => (
                          <tr key={item.id} className="hover:bg-soft-sand/40">
                            <td className="px-3 py-2 font-semibold text-ink">{item.title}</td>
                            <td className="px-3 py-2">
                              <input
                                type="text"
                                value={item.sku}
                                onChange={(e) => handleMatrixChange(item.id, "sku", e.target.value)}
                                className="w-full rounded-md border border-border bg-warm-white px-2 py-1 font-mono text-xs text-ink focus:border-karyalo-green focus:outline-none"
                              />
                            </td>
                            <td className="px-3 py-2 text-right">
                              <input
                                type="number"
                                min={0}
                                value={item.price}
                                onChange={(e) =>
                                  handleMatrixChange(item.id, "price", Number(e.target.value))
                                }
                                className="w-24 rounded-md border border-border bg-warm-white px-2 py-1 text-right font-semibold text-ink focus:border-karyalo-green focus:outline-none"
                              />
                            </td>
                            <td className="px-3 py-2 text-right">
                              <input
                                type="number"
                                min={0}
                                value={item.stock}
                                onChange={(e) =>
                                  handleMatrixChange(item.id, "stock", Number(e.target.value))
                                }
                                className="w-16 rounded-md border border-border bg-warm-white px-2 py-1 text-right font-bold text-ink focus:border-karyalo-green focus:outline-none"
                              />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Kolom Kanan: Spesifikasi Logistik, Shopee OpenAPI & Saluran (1 Col) */}
        <div className="flex flex-col gap-6 lg:col-span-1">
          {/* Card Spesifikasi Logistik (Wajib untuk Shopee shipping & kurir) */}
          <div className="rounded-2xl border border-border bg-warm-white p-4 sm:p-5 shadow-xs">
            <div className="flex items-center gap-2 mb-2">
              <Truck size={16} className="text-karyalo-green" aria-hidden="true" />
              <h2 className="text-sm font-semibold text-ink">Spesifikasi Pengiriman & Berat</h2>
            </div>
            <p className="text-xs text-muted mb-4">
              Dibutuhkan untuk perhitungan ongkir otomatis di Storefront dan Shopee OpenAPI v2.
            </p>

            <div className="flex flex-col gap-3 text-xs">
              <div>
                <label className="mb-1 block font-medium text-ink">
                  Berat Paket (Gram) <span className="text-status-critical">*</span>
                </label>
                <input
                  type="number"
                  required
                  min={1}
                  value={weightGram}
                  onChange={(e) => setWeightGram(Number(e.target.value))}
                  className="w-full rounded-xl border border-border bg-warm-white px-3 py-2 text-xs font-semibold text-ink focus:border-karyalo-green focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-1 block font-medium text-ink">
                  Dimensi Paket (P x L x T cm)
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <input
                    type="number"
                    min={1}
                    value={dimensionLength}
                    onChange={(e) => setDimensionLength(Number(e.target.value))}
                    placeholder="P"
                    className="rounded-xl border border-border bg-warm-white px-2 py-2 text-center text-xs text-ink focus:border-karyalo-green focus:outline-none"
                  />
                  <input
                    type="number"
                    min={1}
                    value={dimensionWidth}
                    onChange={(e) => setDimensionWidth(Number(e.target.value))}
                    placeholder="L"
                    className="rounded-xl border border-border bg-warm-white px-2 py-2 text-center text-xs text-ink focus:border-karyalo-green focus:outline-none"
                  />
                  <input
                    type="number"
                    min={1}
                    value={dimensionHeight}
                    onChange={(e) => setDimensionHeight(Number(e.target.value))}
                    placeholder="T"
                    className="rounded-xl border border-border bg-warm-white px-2 py-2 text-center text-xs text-ink focus:border-karyalo-green focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block font-medium text-ink">Kondisi Produk</label>
                <select
                  value={condition}
                  onChange={(e) => setCondition(e.target.value as "BARU" | "BEKAS")}
                  className="w-full rounded-xl border border-border bg-warm-white px-3 py-2 text-xs font-medium text-ink focus:border-karyalo-green focus:outline-none"
                >
                  <option value="BARU">Baru (New with tags)</option>
                  <option value="BEKAS">Bekas / Preloved</option>
                </select>
              </div>
            </div>
          </div>

          {/* Card Integrasi Shopee Open Platform API */}
          <div className="rounded-2xl border border-border bg-warm-white p-4 sm:p-5 shadow-xs">
            <div className="flex items-center gap-2 mb-3">
              <div className="flex size-7 items-center justify-center rounded-lg bg-[#ee4d2d]/10 text-[#ee4d2d]">
                <ShoppingBag size={15} aria-hidden="true" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-ink">Integrasi Shopee OpenAPI</h2>
                <p className="text-xs text-muted">v2.product & update_stock</p>
              </div>
            </div>

            <div className="flex flex-col gap-3.5 text-xs">
              <div className="flex items-center justify-between rounded-xl bg-soft-sand/60 p-3">
                <span className="font-semibold text-ink">Publikasikan ke Shopee</span>
                <label className="relative inline-flex cursor-pointer items-center">
                  <input
                    type="checkbox"
                    checked={channelShopee}
                    onChange={(e) => setChannelShopee(e.target.checked)}
                    className="peer sr-only"
                  />
                  <div className="peer h-5 w-9 rounded-full bg-border peer-checked:bg-[#ee4d2d] peer-checked:after:translate-x-full peer-checked:after:border-warm-white after:absolute after:top-[2px] after:left-[2px] after:size-4 after:rounded-full after:border after:border-border after:bg-warm-white after:transition-all after:content-['']" />
                </label>
              </div>

              {channelShopee && (
                <div className="flex flex-col divide-y divide-border text-xs">
                  <div className="flex justify-between py-2">
                    <span className="text-muted">Shopee Category ID</span>
                    <span className="font-mono font-medium text-ink">{shopeeCategoryId}</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-muted">Kategori Shopee</span>
                    <span className="font-medium text-ink truncate max-w-[150px] text-right">
                      {shopeeCategoryName}
                    </span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-muted">Shopee Item ID</span>
                    <span className="font-mono font-medium text-ink">{shopeeItemId}</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-muted">Status Sync</span>
                    <span className="font-semibold text-status-success">
                      {shopeeSyncStatus === "synced" ? "Tersinkron (200 OK)" : "Pending"}
                    </span>
                  </div>
                </div>
              )}

              {channelShopee && (
                <button
                  type="button"
                  onClick={handlePushToShopee}
                  disabled={isSaving}
                  className="tap-target inline-flex w-full items-center justify-center gap-1.5 rounded-xl border border-[#ee4d2d]/30 bg-[#ee4d2d]/10 px-3 py-2 text-xs font-semibold text-[#ee4d2d] hover:bg-[#ee4d2d]/20 disabled:opacity-50"
                >
                  <RefreshCw size={13} className={isSaving ? "animate-spin" : ""} aria-hidden="true" />
                  <span>Push Perubahan ke Shopee</span>
                </button>
              )}
            </div>
          </div>

          {/* Card Kanal Web Storefront */}
          <div className="rounded-2xl border border-border bg-warm-white p-4 sm:p-5 shadow-xs">
            <div className="flex items-center gap-2 mb-3">
              <div className="flex size-7 items-center justify-center rounded-lg bg-karyalo-green/10 text-karyalo-green">
                <Globe size={15} aria-hidden="true" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-ink">Kanal Web Storefront</h2>
                <p className="text-xs text-muted">Karyalo Storefront PWA</p>
              </div>
            </div>

            <div className="flex items-center justify-between rounded-xl bg-soft-sand/60 p-3 text-xs">
              <span className="font-semibold text-ink">Tampilkan di Toko Web</span>
              <label className="relative inline-flex cursor-pointer items-center">
                <input
                  type="checkbox"
                  checked={channelStorefront}
                  onChange={(e) => setChannelStorefront(e.target.checked)}
                  className="peer sr-only"
                />
                <div className="peer h-5 w-9 rounded-full bg-border peer-checked:bg-karyalo-green peer-checked:after:translate-x-full peer-checked:after:border-warm-white after:absolute after:top-[2px] after:left-[2px] after:size-4 after:rounded-full after:border after:border-border after:bg-warm-white after:transition-all after:content-['']" />
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Storefront PDP Preview Modal */}
      {showStorefrontPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/60 p-4 backdrop-blur-xs">
          <div className="flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-3xl border border-border bg-warm-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-border bg-soft-sand px-5 py-3.5">
              <div className="flex items-center gap-2">
                <Globe size={16} className="text-karyalo-green" aria-hidden="true" />
                <span className="text-xs font-bold text-ink">
                  Preview Halaman Produk di Storefront PWA
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowStorefrontPreview(false)}
                className="tap-target rounded-full p-1 text-muted hover:bg-border hover:text-ink"
              >
                ✕
              </button>
            </div>

            <div className="overflow-y-auto p-5">
              {/* Product Card / PDP Preview */}
              <div className="flex flex-col gap-4">
                <div className="relative aspect-square w-full overflow-hidden rounded-2xl border border-border bg-soft-sand">
                  <Image
                    src={images[0] || "/images/products/product-blouse-linen-wanita-krem.jpg"}
                    alt=""
                    fill
                    unoptimized
                    className="object-cover"
                  />
                  {badge !== "none" && (
                    <span className="absolute left-3 top-3 rounded-lg bg-deep-pine px-2.5 py-1 text-xs font-bold text-warm-white">
                      {badge}
                    </span>
                  )}
                </div>

                {images.length > 1 && (
                  <div className="flex items-center gap-2">
                    {images.map((img, i) => (
                      <div
                        key={i}
                        className="relative size-14 overflow-hidden rounded-xl border border-border bg-soft-sand"
                      >
                        <Image src={img} alt="" fill unoptimized className="object-cover" />
                      </div>
                    ))}
                  </div>
                )}

                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-karyalo-green">
                    {categorySlug}
                  </span>
                  <h3 className="text-lg font-bold text-ink mt-0.5">{name || "Nama Produk"}</h3>
                  <p className="text-xs text-muted mt-1">{shortDescription}</p>

                  <div className="mt-3 flex items-baseline gap-2">
                    <span className="text-xl font-extrabold text-ink">{formatRupiah(basePrice)}</span>
                    {compareAtPrice && (
                      <span className="text-xs text-muted line-through">
                        {formatRupiah(compareAtPrice)}
                      </span>
                    )}
                  </div>
                </div>

                <div className="rounded-xl bg-soft-sand p-3 text-xs leading-relaxed text-ink">
                  <span className="font-bold block mb-1">Deskripsi & Bahan:</span>
                  <p className="whitespace-pre-line text-muted">{description}</p>
                </div>
              </div>
            </div>

            <div className="border-t border-border bg-soft-sand px-5 py-3 text-right">
              <button
                type="button"
                onClick={() => setShowStorefrontPreview(false)}
                className="tap-target rounded-xl bg-deep-pine px-4 py-2 text-xs font-semibold text-warm-white hover:bg-karyalo-green"
              >
                Tutup Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </form>
  );
}
