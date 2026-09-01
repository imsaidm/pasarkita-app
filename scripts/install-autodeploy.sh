#!/usr/bin/env bash
#
# Pasang auto-deploy. Cukup dijalankan SEKALI di server.
#
#   curl -fsSL https://raw.githubusercontent.com/imsaidm/pasarkita-app/main/scripts/install-autodeploy.sh -o /tmp/i.sh && bash /tmp/i.sh
#
# Setelah ini, setiap push ke `main` akan terpasang sendiri dalam 2 menit.
# Tidak perlu SSH, tidak perlu menempel skrip lagi.

set -uo pipefail

RAW_BASE="https://raw.githubusercontent.com/imsaidm/pasarkita-app/main/scripts"
BIN="/home/master123/pasarkita-autodeploy.sh"
LOG="/home/master123/pasarkita-autodeploy.log"

echo "=== PASANG AUTO-DEPLOY ==="

if ! curl -fsSL "$RAW_BASE/autodeploy.sh" -o "$BIN"; then
  echo "  [GAGAL] tidak bisa mengambil autodeploy.sh"
  exit 1
fi
chmod +x "$BIN"
echo "  [ok]   penjaga terpasang di $BIN"

touch "$LOG"

# Baris cron dipasang idempoten: entri lama dibuang dulu supaya menjalankan
# skrip ini dua kali tidak menghasilkan dua jadwal.
CRON_LINE="*/2 * * * * $BIN"
( crontab -l 2>/dev/null | grep -v 'pasarkita-autodeploy.sh' ; echo "$CRON_LINE" ) | crontab -
echo "  [ok]   cron dipasang: tiap 2 menit"

echo ""
echo "=== JADWAL SEKARANG ==="
crontab -l | grep pasarkita

echo ""
echo "=== JALANKAN SEKALI SEKARANG ==="
bash "$BIN"
sleep 2

if [ -s "$LOG" ]; then
  tail -5 "$LOG"
else
  echo "  (belum ada perubahan commit — server sudah pada versi terbaru)"
fi

echo ""
echo "Selesai. Mulai sekarang cukup push ke main; server menjemput sendiri."
echo "Pantau dengan: tail -f $LOG"
