#!/bin/bash
set -e
TS=$(date +%Y%m%d_%H%M%S)
cd ~/decamath

# 1) Dump database
docker exec -t $(docker compose ps -q postgres) \
  pg_dump -U center center | gzip > backups/db_$TS.sql.gz

# 2) Dong bo toan bo thu muc storage (chi day phan thay doi)
rclone sync data/storage r2:decamath-backup/storage --fast-list

# 3) Day ban dump DB ra ngoai may (Cloudflare R2 - can cau hinh `rclone config` remote "r2" truoc)
rclone copy backups/db_$TS.sql.gz r2:decamath-backup/db/

# 4) Giu 14 ban dump DB gan nhat tai cho
find backups -name "db_*.sql.gz" -mtime +14 -delete
