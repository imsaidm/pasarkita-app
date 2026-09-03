import { redirect } from "next/navigation";

// Seluruh panel kelola berada di balik login dan menampilkan data milik satu
// toko. Tidak ada yang boleh di-prerender saat build.
export const dynamic = "force-dynamic";

export default function ProfileRedirectPage() {
  redirect("/settings/profile");
}
