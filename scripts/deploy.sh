#!/usr/bin/env bash
#
# Deploy Pasarkita ke VPS produksi.
#
# Dijalankan DI SERVER. Aman diulang berapa kali pun.
#
#   curl -fsSL https://raw.githubusercontent.com/imsaidm/pasarkita-app/main/scripts/deploy.sh -o /tmp/deploy.sh
#   bash /tmp/deploy.sh
#
# Sengaja TIDAK memakai `set -e`. Skrip deploy yang mati diam-diam di tengah
# jauh lebih berbahaya daripada skrip yang jalan terus lalu melapor gagal:
# yang pertama meninggalkan separuh rilis tanpa ada yang tahu.
#
# ATURAN KERAS: VPS ini juga menjalankan ArenaDewata. Tidak ada satu pun
# perintah PM2 global di sini (`pm2 restart all`, `pm2 kill`, `pm2 delete all`).
# Hanya tiga proses pasarkita-{pos,store,dashboard} yang disentuh.

set -uo pipefail

REPO="https://github.com/imsaidm/pasarkita-app.git"
BRANCH="main"
ROOT="/home/master123/pasarkita-app"
SECRETS="/home/master123/.config/pasarkita/secrets.env"
KEEP_RELEASES=3

APPS=("pos:3108" "store:3109" "dashboard:3111")

step()  { printf '\n=== %s ===\n' "$1"; }
ok()    { printf '  [ok]   %s\n' "$1"; }
info()  { printf '         %s\n' "$1"; }
die()   { printf '\n  [GAGAL] %s\n' "$1"; exit 1; }

# ---------------------------------------------------------------- prasyarat

step "PRASYARAT"
[ -f "$SECRETS" ] || die "Berkas secrets tidak ada: $SECRETS"
command -v node >/dev/null || die "node tidak ditemukan"
command -v pm2  >/dev/null || die "pm2 tidak ditemukan"
ok "node $(node -v), pm2 ada, secrets ada"

# PID ArenaDewata dicatat sekarang dan dibandingkan lagi di akhir.
ARENA_BEFORE="$(pm2 pid arenadewata 2>/dev/null | tr -d '[:space:]')"
[ -n "$ARENA_BEFORE" ] && ok "arenadewata PID $ARENA_BEFORE (akan diperiksa lagi di akhir)" \
                       || info "arenadewata tidak terdaftar di pm2 — dilewati"

AVAIL_KB="$(df -Pk / | awk 'NR==2{print $4}')"
[ "${AVAIL_KB:-0}" -gt 3145728 ] || die "Sisa disk kurang dari 3 GB. Bersihkan dulu."
ok "sisa disk $((AVAIL_KB / 1024 / 1024)) GB"

# ---------------------------------------------------------------- ambil kode

step "AMBIL KODE"
mkdir -p "$ROOT/releases" || die "tidak bisa membuat $ROOT/releases"
TMP="$(mktemp -d)" || die "mktemp gagal"
git clone --depth 1 --branch "$BRANCH" "$REPO" "$TMP/src" -q || die "git clone gagal"
SHA="$(git -C "$TMP/src" rev-parse --short HEAD)"
RID="$(date +%Y%m%d-%H%M%S)-$SHA"
RELEASE="$ROOT/releases/$RID"
mv "$TMP/src" "$RELEASE" || die "tidak bisa memindahkan rilis"
rm -rf "$TMP"
ok "rilis $RID"

cd "$RELEASE" || die "tidak bisa masuk $RELEASE"

# ---------------------------------------------------------------- dependensi

step "DEPENDENSI"
npm ci --no-audit --no-fund > /tmp/pk-npm.log 2>&1
[ $? -eq 0 ] || { tail -20 /tmp/pk-npm.log; die "npm ci gagal"; }
ok "$(grep -o 'added [0-9]* packages' /tmp/pk-npm.log | tail -1)"

# Secret dibaca dari server, tidak pernah dari repo atau arsip.
set -a
# shellcheck disable=SC1090
. "$SECRETS"
set +a
[ -n "${PASARKITA_DATABASE_URL:-}" ] || die "PASARKITA_DATABASE_URL kosong di secrets"
[ -n "${SESSION_SECRET:-}" ]        || die "SESSION_SECRET kosong di secrets"
export DATABASE_URL="$PASARKITA_DATABASE_URL"
export NODE_ENV=production
ok "secrets dimuat"

# ---------------------------------------------------------------- migrasi

step "MIGRASI"
node packages/db/src/migrate.mjs || die "migrasi gagal"

# ---------------------------------------------------------------- build

step "BUILD (2-3 menit)"
npm run build > /tmp/pk-build.log 2>&1
BUILD_EXIT=$?
if [ $BUILD_EXIT -ne 0 ]; then
  printf '\n--- 30 baris terakhir build ---\n'
  tail -30 /tmp/pk-build.log
  die "build gagal (exit $BUILD_EXIT). Log lengkap: /tmp/pk-build.log"
fi
ok "build selesai"

# Bukti nyata bahwa build menghasilkan sesuatu, bukan sekadar exit 0.
step "SIAPKAN ASET"
for entry in "${APPS[@]}"; do
  app="${entry%%:*}"
  stand="$RELEASE/apps/$app/.next/standalone/apps/$app"
  [ -f "$stand/server.js" ] || die "$app tidak menghasilkan server.js"
  mkdir -p "$stand/.next/static"
  cp -a "$RELEASE/apps/$app/.next/static/." "$stand/.next/static/" || die "salin static $app gagal"
  [ -d "$RELEASE/apps/$app/public" ] && cp -a "$RELEASE/apps/$app/public" "$stand/public"
  ok "$app siap"
done

# ---------------------------------------------------------------- nyalakan

step "NYALAKAN ULANG (hanya 3 proses pasarkita)"
for entry in "${APPS[@]}"; do
  app="${entry%%:*}"
  port="${entry##*:}"
  stand="$RELEASE/apps/$app/.next/standalone/apps/$app"
  cd "$stand" || die "tidak bisa masuk $stand"
  pm2 delete "pasarkita-$app" >/dev/null 2>&1
  PORT="$port" HOSTNAME=127.0.0.1 \
    DATABASE_URL="$DATABASE_URL" SESSION_SECRET="$SESSION_SECRET" \
    NODE_ENV=production DEMO_ENABLED=true \
    pm2 start server.js --name "pasarkita-$app" --update-env >/dev/null \
    || die "pm2 start pasarkita-$app gagal"
  ok "pasarkita-$app -> $port"
done

ln -sfn "$RELEASE" "$ROOT/current"
pm2 save >/dev/null 2>&1
ok "symlink current -> $RID"

# ---------------------------------------------------------------- pangkas

step "PANGKAS RILIS LAMA"
cd "$ROOT/releases" || die "tidak bisa masuk direktori rilis"
OLD="$(ls -t | tail -n +$((KEEP_RELEASES + 1)))"
if [ -n "$OLD" ]; then
  echo "$OLD" | while read -r d; do [ -n "$d" ] && rm -rf "$ROOT/releases/$d"; done
  ok "dihapus: $(echo "$OLD" | wc -l) rilis lama"
else
  ok "tidak ada yang perlu dihapus"
fi
info "tersisa $(ls -1 "$ROOT/releases" | wc -l) rilis, disk $(df -Ph / | awk 'NR==2{print $4}') kosong"

# ---------------------------------------------------------------- verifikasi

step "VERIFIKASI"
sleep 6
FAIL=0
for entry in "${APPS[@]}"; do
  app="${entry%%:*}"; port="${entry##*:}"
  code="$(curl -sS -o /dev/null -w '%{http_code}' --max-time 10 "http://127.0.0.1:$port/" 2>/dev/null)"
  if [ "$code" = "200" ]; then ok "$app ($port) -> 200"; else printf '  [GAGAL] %s (%s) -> %s\n' "$app" "$port" "${code:-mati}"; FAIL=1; fi
done

# Penanda khas rilis ini: kotak pencarian kasir hanya ada di versi baru.
if curl -sS --max-time 10 http://127.0.0.1:3108/ 2>/dev/null | grep -q 'Coba demo kasir'; then
  ok "halaman kasir termuat"
else
  printf '  [GAGAL] halaman kasir tidak termuat\n'; FAIL=1
fi

step "ARENADEWATA (harus tidak berubah)"
ARENA_AFTER="$(pm2 pid arenadewata 2>/dev/null | tr -d '[:space:]')"
ARENA_CODE="$(curl -sS -o /dev/null -w '%{http_code}' --max-time 10 http://127.0.0.1:3000/ 2>/dev/null)"
if [ -n "$ARENA_BEFORE" ] && [ "$ARENA_BEFORE" != "$ARENA_AFTER" ]; then
  printf '  [PERINGATAN] PID berubah: %s -> %s\n' "$ARENA_BEFORE" "$ARENA_AFTER"; FAIL=1
else
  ok "PID tetap $ARENA_AFTER, HTTP $ARENA_CODE"
fi

printf '\n'
if [ $FAIL -eq 0 ]; then
  printf 'SELESAI. Rilis %s aktif.\n' "$RID"
else
  printf 'ADA YANG GAGAL di atas. Rilis %s. Log build: /tmp/pk-build.log\n' "$RID"
  exit 1
fi
