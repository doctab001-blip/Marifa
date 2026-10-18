#!/usr/bin/env bash
# Push the medicine-pathway branch. (Publishing of the 104 non-critical topics was already done.)
set -euo pipefail
cd "$(dirname "$0")/.."
git push -u origin feat/medicine-pathways
echo "Pushed. Open a pull request: https://github.com/doctab001-blip/Marifa/pull/new/feat/medicine-pathways"
