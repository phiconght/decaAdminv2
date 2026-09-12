# Bo file deploy nhanh — DecaMath Phase 1

Chuan bi san de dung ngay khi co VPS/instance chay duoc (Oracle A1.Flex hoac VPS tra phi).

## Danh sach file

- `../../../BE/Dockerfile` — Dockerfile build Backend (da dat san trong repo BE)
- `docker-compose.yml` — Postgres + Backend + Nginx
- `.env.example` — mau bien moi truong, copy thanh `.env` va sua gia tri that
- `nginx.conf` — reverse-proxy 3 subdomain (api/admin/app), can sua domain that
- `scripts/00-setup-server.sh` — chay 1 lan dau tien tren VPS moi (cai Docker, ufw, tao thu muc)
- `scripts/backup.sh` — cron backup DB + storage len Cloudflare R2
- `scripts/gc-storage.sh` — cron don file da soft-delete qua 30 ngay

## Thu tu su dung khi co VPS

1. SSH vao VPS, copy noi dung `scripts/00-setup-server.sh` vao may, chay:
   ```bash
   chmod +x 00-setup-server.sh && ./00-setup-server.sh
   ```
2. Tu may dev, copy code va file cau hinh len VPS:
   ```bash
   scp -r BE ubuntu@<IP>:~/decamath/
   scp docker-compose.yml nginx.conf ubuntu@<IP>:~/decamath/
   scp scripts/backup.sh scripts/gc-storage.sh ubuntu@<IP>:~/decamath/scripts/
   ```
3. Tren VPS: copy `.env.example` thanh `.env`, dien mat khau/domain that:
   ```bash
   cp .env.example .env && nano .env
   ```
4. Sua `nginx.conf`, thay `domain.com` bang domain that cua ban (dung tim-thay-thay trong nano/sed).
5. Phan quyen thu muc storage (UID 1000 khop voi user `spring` trong Dockerfile):
   ```bash
   sudo chown -R 1000:1000 ~/decamath/data/storage
   chmod 750 ~/decamath/data/storage
   ```
6. Lay chung chi SSL truoc khi chay Nginx (port 80 phai dang mo, chua co gi chiem):
   ```bash
   sudo certbot certonly --standalone -d api.domain.com -d admin.domain.com -d app.domain.com
   ```
7. Build va chay:
   ```bash
   cd ~/decamath
   docker compose build backend
   docker compose up -d
   docker compose logs -f backend   # xac nhan Flyway chay du 47 migration, khong loi
   ```
8. Build Admin/Web tu may dev roi copy vao:
   ```bash
   cd ADMIN && npm ci && npm run build && scp -r dist/* ubuntu@<IP>:~/decamath/admin-dist/
   cd ../WEB && npm ci && npm run build && scp -r dist/* ubuntu@<IP>:~/decamath/web-dist/
   # tren VPS
   docker compose restart nginx
   ```
9. Cau hinh cron backup + gc:
   ```bash
   chmod +x scripts/*.sh
   crontab -e
   # them 2 dong:
   # 0 2 * * * /home/ubuntu/decamath/scripts/backup.sh >> /home/ubuntu/decamath/backup.log 2>&1
   # 0 1 1 * * /home/ubuntu/decamath/scripts/gc-storage.sh >> /home/ubuntu/decamath/gc-storage.log 2>&1
   ```

## Luu y quan trong

- **Kiem tra `gc-storage.sh` truoc khi cho vao cron**: script suy ra ten bang `stored_files` va cot `path`/`status`/`updated_at` theo quy uoc — chay thu bo dong `rm -fv` mot lan de doi chieu dung schema that.
- **`rclone config` phai chay truoc** de tao remote `r2` (Cloudflare R2) — neu chua co, `backup.sh` se loi khi goi `rclone sync`/`rclone copy`.
- File `.env` **khong duoc commit vao git** — chi ton tai tren VPS.
