#!/usr/bin/env bash
# Instalasi workflow desain untuk Portal Buku Digital di Antigravity.
# Jalankan dari root proyek: bash setup-portal-buku-digital.sh

set -Eeuo pipefail

readonly PROJECT_DIR="$(pwd)"
readonly NPM_FLAGS=(--no-audit --no-fund)

on_error() {
  local exit_code=$?
  printf '\nInstalasi berhenti pada baris %s (kode %s). Periksa pesan error di atas, lalu jalankan ulang skrip ini.\n' \
    "$1" "$exit_code" >&2
  exit "$exit_code"
}
trap 'on_error $LINENO' ERR

require_command() {
  command -v "$1" >/dev/null 2>&1 || {
    printf 'Perintah "%s" tidak ditemukan. Instal Node.js LTS (beserta npm), lalu coba lagi.\n' "$1" >&2
    exit 1
  }
}

run_step() {
  local label="$1"
  shift
  printf '\n==> %s\n' "$label"
  "$@"
}

require_command node
require_command npm
require_command npx

printf 'Menyiapkan workflow desain di: %s\n' "$PROJECT_DIR"
printf 'Node: %s | npm: %s\n' "$(node --version)" "$(npm --version)"

# Beberapa installer menyimpan konfigurasi proyek. Pastikan package.json tersedia.
if [[ ! -f package.json ]]; then
  run_step "Membuat package.json" npm init -y
fi

# Skills inti: dokumentasikan arah desain, tentukan visual, lalu audit UX.
run_step "Memasang create-design-md" \
  npx --yes skills add https://github.com/ibelick/ui-skills --skill create-design-md

run_step "Memasang frontend-design" \
  npx --yes skills add https://github.com/anthropics/claude-code --skill frontend-design

run_step "Menginisialisasi UI/UX Pro Max untuk Codex" \
  npx --yes ui-ux-pro-max-cli@latest init --ai codex

run_step "Memasang web-design-guidelines" \
  npx --yes skills add https://github.com/vercel-labs/agent-skills --skill web-design-guidelines

run_step "Memasang baseline-ui" \
  npx --yes skills add https://github.com/ibelick/ui-skills --skill baseline-ui

run_step "Memasang Impeccable" \
  npx --yes impeccable@latest install --providers=codex --scope=project

# Framer Motion dipakai hanya untuk transisi yang memperjelas state dan hierarchy.
run_step "Memasang Framer Motion" \
  npm install "${NPM_FLAGS[@]}" framer-motion

printf '\nSelesai. Semua tool desain dan Framer Motion telah dipasang untuk proyek ini.\n'
printf 'Berikutnya: buka proyek dengan Antigravity, lalu gunakan prompt Portal Buku Digital yang telah dirapikan.\n'
