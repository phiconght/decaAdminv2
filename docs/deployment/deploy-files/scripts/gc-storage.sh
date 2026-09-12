#!/bin/bash
set -e
cd ~/decamath
# Liet ke duong dan file da xoa mem qua 30 ngay
docker exec -i $(docker compose ps -q postgres) \
  psql -U center -d center -t -A -c \
  "SELECT path FROM stored_files WHERE status='DELETED' AND updated_at < now() - interval '30 days';" \
  | while read -r relpath; do
      [ -n "$relpath" ] && rm -fv "$HOME/decamath/data/storage/$relpath"
    done
