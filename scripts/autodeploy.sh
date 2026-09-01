#!/usr/bin/env bash
#
# Penjaga rilis: dijalankan cron tiap 2 menit.
#
# Membandingkan commit `main` di GitHub dengan commit yang sedang aktif di
# server. Kalau beda, ambil deploy.sh terbaru dan jalankan. Kalau sama,
# keluar diam-diam tanpa menyentuh apa pun.
#
# Ini yang membuat deploy tidak lagi memerlukan SSH: cukup push ke GitHub,
# server menjemput sendiri.

set -uo pipefail

REPO="https://github.com/imsaidm/pasarkita-app.git"
RAW="https://raw.githubusercontent.com/imsaidm/pasarkita-app/main/scripts/deploy.sh"
ROOT="/home/master123/pasarkita-app"
LOG="/home/master123/pasarkita-autodeploy.log"
LOCK="/tmp/pk-autodeploy.lock"

log() { printf '[%s] %s\n' "$(date -Is)" "$1" >> "$LOG"; }

# Satu deploy pada satu waktu. Cron dua menit sekali sementara build makan
# tiga menit akan menumpuk kalau tidak dikunci.
exec 9>"$LOCK" || exit 0
flock -n 9 || exit 0

REMOTE="$(git ls-remote "$REPO" refs/heads/main 2>/dev/null | cut -c1-7)"
if [ -z "$REMOTE" ]; then
  log "tidak bisa menghubungi GitHub, dilewati"
  exit 0
fi

# Nama direktori rilis berakhiran commit pendek: 20260901-093000-80b8280
CURRENT="$(readlink -f "$ROOT/current" 2>/dev/null | sed 's/.*-//')"

if [ "$REMOTE" = "$CURRENT" ]; then
  exit 0
fi

log "commit berubah: ${CURRENT:-belum ada} -> $REMOTE"

if ! curl -fsSL "$RAW" -o /tmp/pk-deploy.sh 2>>"$LOG"; then
  log "gagal mengambil deploy.sh"
  exit 0
fi

bash /tmp/pk-deploy.sh >> "$LOG" 2>&1
STATUS=$?
if [ $STATUS -eq 0 ]; then
  log "deploy $REMOTE BERHASIL"
else
  log "deploy $REMOTE GAGAL (exit $STATUS)"
fi

# Log tidak dibiarkan tumbuh tanpa batas.
tail -n 2000 "$LOG" > "$LOG.tmp" 2>/dev/null && mv "$LOG.tmp" "$LOG"
