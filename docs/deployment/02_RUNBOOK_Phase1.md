# Runbook chi tiết — Giai đoạn 1 (14 bước)

## Từ tay trắng đến hệ thống chạy thật trên Oracle Cloud Free Tier

> Lưu ý: Các bước dưới đây dựa trên khảo sát trực tiếp code BE (`/src/main/java/com/trungtam/file/`) — không phải giả định. Tên property, đường dẫn, giới hạn dung lượng khớp với `application.yml` hiện tại của dự án.

---

## Bước 1: Khởi tạo máy chủ

Đăng ký Oracle Cloud (yêu cầu thẻ xác thực, không bị trừ tiền ở gói Always Free). Tạo Compute Instance:

- Shape: `VM.Standard.A1.Flex` — chọn 4 OCPU / 24 GB RAM (trong hạn mức free)
- Image: Ubuntu 22.04 (ARM64)
- Boot volume: 100–200 GB (trong hạn mức free 200 GB)
- Networking: mở Security List cho TCP `22` (giới hạn IP quản trị nếu có IP tĩnh), `80`, `443`
- Tạo cặp khoá SSH lúc khởi tạo instance, tải private key về, `chmod 400` trước khi dùng

```bash
chmod 400 ~/Downloads/oracle-key.pem
ssh -i ~/Downloads/oracle-key.pem ubuntu@<IP-VPS>
```

**Nếu không đăng ký được:** Capacity ARM free-tier ở một số khu vực (region) hay hết chỗ — thử region khác, hoặc chuyển ngay sang phương án dự phòng: VPS trả phí 2 vCPU/4GB (Hetzner CX22, Contabo VPS S, hoặc gói khởi điểm nhà cung cấp trong nước), các bước từ đây trở đi giống hệt nhau.

---

## Bước 2: Cập nhật hệ điều hành & cài Docker

SSH vào VPS, chạy lần lượt:

```bash
sudo apt update && sudo apt -y upgrade
sudo apt install -y docker.io docker-compose-plugin git ufw rclone

# tường lửa hệ điều hành (bổ sung cho Security List của Oracle)
sudo ufw allow OpenSSH
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw --force enable

sudo systemctl enable --now docker
sudo usermod -aG docker $USER && newgrp docker
docker --version && docker compose version
```

---

## Bước 3: Tạo cấu trúc thư mục dự án

Tách rõ 3 vùng: mã nguồn build ra (`admin-dist`, `web-dist`), dữ liệu bền vững cần backup (`data/`), và log/backup tạm.

```bash
mkdir -p ~/decamath/{data/postgres,data/storage,backups,admin-dist,web-dist,certs,scripts}
cd ~/decamath
tree -L 2   # kiểm tra lại cấu trúc
```

**Ghi chú:** `data/storage` là thư mục quan trọng nhất — đây là nơi toàn bộ ảnh bài tập, ảnh bìa bài viết được lưu vật lý.

---

## Bước 4: Cấu hình domain qua Cloudflare

- Thêm domain vào Cloudflare, đổi nameserver theo hướng dẫn
- Tạo A record: `api.domain.com`, `admin.domain.com`, `app.domain.com` → IP public của VPS, bật Proxy (☁ cam)
- SSL/TLS mode: **Full** (Cloudflare ↔ VPS mã hoá bằng cert tự ký hoặc Let's Encrypt qua certbot)

Lấy chứng chỉ Let's Encrypt (chạy trên VPS, cần port 80 tạm mở cho challenge):

```bash
sudo apt install -y certbot
sudo certbot certonly --standalone \
  -d api.domain.com -d admin.domain.com -d app.domain.com
# certbot tự thêm cron renew — kiểm tra:
sudo systemctl list-timers | grep certbot
```

---

## Bước 5: Module Storage — cấu hình lưu file

Backend dùng một service duy nhất `LocalStorageService` (implement interface `StorageService`), đọc cấu hình qua `StorageProperties` (prefix `app.storage`). **Chưa có tích hợp S3/object storage nào trong code** — ở Giai đoạn 1, storage là ổ đĩa VPS, đúng với thiết kế hiện tại, không cần sửa code.

### 5.1 — Cách file được lưu (nguyên trạng code)

- Ảnh câu hỏi bài tập, ảnh đáp án tự luận, ảnh bìa bài viết (`Post.coverImageUrl`) — tất cả đi qua chung một endpoint upload, chỉ nhận `image/png|jpeg|gif|webp`
- Tên file lưu = `UUID` ngẫu nhiên, đường dẫn tương đối dạng `yyyy/MM/<uuid>.<ext>` (tự động phân theo năm/tháng)
- Dedup theo checksum SHA-256 — upload trùng nội dung không ghi file mới
- PDF đề thi: sinh **hoàn toàn trong RAM** mỗi lần export, không ghi ra đĩa — không cần dọn dẹp
- File Word/Excel nhập lô: hệ thống chỉ nhận **file JSON đã qua AI xử lý**, parse trực tiếp trong RAM, không lưu file gốc
- Giới hạn: **10 MB/file**, tối đa **12 MB/request** (khớp `spring.servlet.multipart` và `app.storage.max-file-size-bytes`)

**⚠️ Phải sửa trước khi deploy:** Giá trị mặc định trong `application.yml` hiện là đường dẫn Windows tuyệt đối trên máy dev (`D:/duantrungtam/...`) — **sẽ lỗi trên Linux container** nếu không override bằng biến môi trường `STORAGE_LOCAL_ROOT`. Đây là bước bắt buộc, không phải tuỳ chọn.

### 5.2 — Biến môi trường cần set cho production

Thêm vào `~/decamath/.env`:

```
STORAGE_LOCAL_ROOT=/data/storage
STORAGE_PUBLIC_BASE_URL=https://api.domain.com
```

`STORAGE_LOCAL_ROOT` là đường dẫn **bên trong container** Backend (sẽ mount volume ở bước 7) — không phải đường dẫn trên VPS host. `STORAGE_PUBLIC_BASE_URL` phải khớp domain thật để URL ảnh trả về cho Admin/Mobile đúng, không bị `localhost`.

### 5.3 — Phân quyền & sở hữu thư mục trên VPS

```bash
sudo chown -R 1000:1000 ~/decamath/data/storage
chmod 750 ~/decamath/data/storage
```

`1000:1000` khớp UID/GID user `spring` tạo trong Dockerfile ở bước 6 — tránh lỗi permission denied khi container ghi file.

### 5.4 — Dọn rác: file đã soft-delete nhưng chưa xoá vật lý

Endpoint `DELETE /api/v1/files/{id}` chỉ đổi trạng thái trong bảng lưu metadata, **không xoá file vật lý** — theo thời gian ổ đĩa sẽ phình dần. Ở quy mô <1.000 học viên tốc độ phình rất chậm (vài trăm MB/năm), nhưng vẫn nên có cron dọn định kỳ:

`~/decamath/scripts/gc-storage.sh` — chạy hằng tháng:

```bash
#!/bin/bash
set -e
cd ~/decamath
# Liệt kê đường dẫn file đã xoá mềm quá 30 ngày
docker exec -i $(docker compose ps -q postgres) \
  psql -U center -d center -t -A -c \
  "SELECT path FROM stored_files WHERE status='DELETED' AND updated_at < now() - interval '30 days';" \
  | while read -r relpath; do
      [ -n "$relpath" ] && rm -fv "$HOME/decamath/data/storage/$relpath"
    done
```

**Kiểm tra trước khi tự động hoá:** Script trên suy ra tên bảng/cột theo quy ước — chạy thử ở chế độ chỉ liệt kê (bỏ đoạn `rm -fv`) một lần để đối chiếu đúng schema thật trước khi cho vào cron.

```bash
chmod +x ~/decamath/scripts/gc-storage.sh
crontab -e
# thêm dòng — chạy 1h sáng ngày 1 mỗi tháng
0 1 1 * * /home/ubuntu/decamath/scripts/gc-storage.sh >> /home/ubuntu/decamath/gc-storage.log 2>&1
```

---

## Bước 6: Viết Dockerfile cho Backend

Project hiện **chưa có Dockerfile** — cần tạo mới. Multi-stage build: giai đoạn 1 build bằng Maven, giai đoạn 2 chỉ chạy JRE để image nhẹ.

`BE/Dockerfile`:

```dockerfile
# Điều chỉnh version Java theo pom.xml thật (17 hoặc 21)
FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /app
COPY pom.xml .
RUN mvn dependency:go-offline -B
COPY src ./src
RUN mvn clean package -DskipTests -B

FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
RUN addgroup -g 1000 spring && adduser -u 1000 -G spring -S spring
COPY --from=build /app/target/*.jar app.jar
RUN mkdir -p /data/storage && chown -R spring:spring /data/storage
USER spring
EXPOSE 9090
ENTRYPOINT ["java", "-XX:MaxRAMPercentage=70", "-jar", "app.jar"]
```

UID `1000` khớp với lệnh `chown` ở bước 5.3 — đây là lý do phải làm 2 bước theo đúng thứ tự.

---

## Bước 7: docker-compose.yml đầy đủ

`~/decamath/docker-compose.yml`:

```yaml
services:
  postgres:
    image: postgres:16
    restart: unless-stopped
    environment:
      POSTGRES_DB: center
      POSTGRES_USER: center
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - ./data/postgres:/var/lib/postgresql/data
    ports:
      - "127.0.0.1:5432:5432"

  backend:
    build: ./BE
    restart: unless-stopped
    env_file: .env
    environment:
      SPRING_DATASOURCE_URL: jdbc:postgresql://postgres:5432/center
      SPRING_DATASOURCE_USERNAME: center
      SPRING_DATASOURCE_PASSWORD: ${DB_PASSWORD}
    volumes:
      - ./data/storage:/data/storage      # Module Storage — bước 5
    depends_on: [postgres]
    ports:
      - "127.0.0.1:9090:9090"

  nginx:
    image: nginx:alpine
    restart: unless-stopped
    volumes:
      - ./nginx.conf:/etc/nginx/conf.d/default.conf:ro
      - ./admin-dist:/usr/share/nginx/html/admin:ro
      - ./web-dist:/usr/share/nginx/html/app:ro
      - /etc/letsencrypt:/etc/nginx/certs:ro
    ports: ["80:80", "443:443"]
    depends_on: [backend]
```

`~/decamath/.env`:

```
DB_PASSWORD=doi-mat-khau-manh-o-day
JWT_SECRET=chuoi-bi-mat-du-dai-random
STORAGE_LOCAL_ROOT=/data/storage
STORAGE_PUBLIC_BASE_URL=https://api.domain.com
```

---

## Bước 8: Nginx reverse-proxy — 3 subdomain

`~/decamath/nginx.conf` (rút gọn, lặp lại cho mỗi subdomain):

```nginx
server {
  listen 443 ssl; server_name api.domain.com;
  ssl_certificate     /etc/nginx/certs/live/api.domain.com/fullchain.pem;
  ssl_certificate_key /etc/nginx/certs/live/api.domain.com/privkey.pem;
  client_max_body_size 12M;   # khớp app.storage.max-file-size-bytes + multipart
  location /api/ { proxy_pass http://backend:9090; proxy_set_header Host $host; }
}
server {
  listen 443 ssl; server_name admin.domain.com;
  ssl_certificate     /etc/nginx/certs/live/admin.domain.com/fullchain.pem;
  ssl_certificate_key /etc/nginx/certs/live/admin.domain.com/privkey.pem;
  root /usr/share/nginx/html/admin;
  client_max_body_size 12M;
  location /api/ { proxy_pass http://backend:9090; }
  location / { try_files $uri /index.html; }
}
# server { server_name app.domain.com; ... root .../web; } tương tự
```

**⚠️ Dễ quên:** Nếu bỏ qua `client_max_body_size`, Nginx mặc định chỉ cho 1MB/request — upload ảnh bài tập >1MB sẽ bị Nginx chặn trước khi tới được Backend, dù Backend đã cấu hình 10MB.

---

## Bước 9: Build & chạy Backend

```bash
cd ~/decamath
docker compose build backend
docker compose up -d
docker compose logs -f backend
```

Xác nhận trong log: Flyway chạy đủ 47 migration (V1→V48) không lỗi, ứng dụng khởi động thành công trên port 9090, và thư mục `/data/storage` ghi được.

Kiểm tra nhanh không cần Admin UI:

```bash
curl -s https://api.domain.com/api/v1/currentUser -o /dev/null -w "%{http_code}\n"
# kỳ vọng 401 (chưa đăng nhập) — nghĩa là API đã sống, không phải 502/timeout
```

---

## Bước 10: Build & deploy Admin, Web

```bash
# Trên máy dev
cd ADMIN && npm ci && npm run build
scp -r dist/* user@vps:~/decamath/admin-dist/

cd ../WEB && npm ci && npm run build
scp -r dist/* user@vps:~/decamath/web-dist/

# Trên VPS
docker compose restart nginx
```

---

## Bước 11: Sao lưu tự động — Database *và* Storage

Hai lớp dữ liệu phải sao lưu riêng: bảng dữ liệu (Postgres dump) và file vật lý (thư mục `data/storage`) — thiếu 1 trong 2 là phục hồi không đầy đủ, vì URL ảnh lưu trong DB trỏ tới file nằm ngoài DB.

`~/decamath/scripts/backup.sh`:

```bash
#!/bin/bash
set -e
TS=$(date +%Y%m%d_%H%M%S)
cd ~/decamath

# 1) Dump database
docker exec -t $(docker compose ps -q postgres) \
  pg_dump -U center center | gzip > backups/db_$TS.sql.gz

# 2) Đồng bộ toàn bộ thư mục storage (chỉ đẩy phần thay đổi, không nén lại từ đầu)
rclone sync data/storage r2:decamath-backup/storage --fast-list

# 3) Đẩy bản dump DB ra ngoài máy (Cloudflare R2 free 10GB — cấu hình `rclone config` remote "r2" trước)
rclone copy backups/db_$TS.sql.gz r2:decamath-backup/db/

# 4) Giữ 14 bản dump DB gần nhất tại chỗ
find backups -name "db_*.sql.gz" -mtime +14 -delete
```

```bash
chmod +x ~/decamath/scripts/backup.sh
crontab -e
# thêm dòng — chạy 2h sáng mỗi ngày
0 2 * * * /home/ubuntu/decamath/scripts/backup.sh >> /home/ubuntu/decamath/backup.log 2>&1
```

**Vì sao rclone sync thay vì nén cả thư mục:** Storage tăng dần theo thời gian (ảnh mới mỗi ngày) — `rclone sync` chỉ truyền phần chênh lệch, nhanh và tiết kiệm băng thông hơn nhiều so với nén lại toàn bộ mỗi đêm.

---

## Bước 12: Giám sát & cảnh báo

- UptimeRobot (miễn phí) → thêm 3 HTTPS monitor: `api.`, `admin.`, `app.`, chu kỳ 5 phút
- Thêm 1 monitor Keyword kiểm tra `GET /api/v1/files/{id}/content` của một ảnh đã biết → phát hiện sớm nếu storage bị lỗi quyền ghi/đọc
- Cảnh báo qua email hoặc kênh Telegram bot (miễn phí)

---

## Bước 13: Phát hành Android

```bash
cd MOBILE
flutter build appbundle --release
```

- Tạo tài khoản Google Play Console ($25, một lần)
- Tạo app mới, điền mô tả/ảnh chụp màn hình/chính sách quyền riêng tư
- Upload file `.aab`, gửi review (thường 1–3 ngày)

---

## Bước 14: Nhập dữ liệu vận hành thật

1. Đăng nhập Admin bằng tài khoản seed đầu tiên, đổi mật khẩu ngay
2. Nhập danh mục môn học, chuyên đề
3. Nhập/nhập lô học viên, giáo viên, phụ huynh, liên kết HV–PH
4. Cấu hình bảng giá học phí, tài khoản ngân hàng nhận VietQR
5. Upload thử 1 ảnh bài tập — xác nhận file xuất hiện thật trong `~/decamath/data/storage/<yyyy>/<MM>/` trên VPS
6. Tạo lớp học đầu tiên, gán lịch, kiểm thử luồng điểm danh + thông báo đầu-cuối

---

## Checklist go-live Giai đoạn 1

- [ ] 3 subdomain truy cập được qua HTTPS, chứng chỉ hợp lệ
- [ ] Đăng nhập Admin/Web thành công bằng tài khoản thật (không phải mock)
- [ ] Flyway chạy đủ 47 migration, không lỗi trong log Backend
- [ ] `STORAGE_LOCAL_ROOT`/`STORAGE_PUBLIC_BASE_URL` đã set đúng — upload ảnh trả về URL domain thật, không phải đường dẫn Windows hay `localhost`
- [ ] Upload thử 1 ảnh thành công, file tồn tại vật lý trong volume `data/storage`, tải lại được qua URL trả về
- [ ] `client_max_body_size` ở Nginx đã khớp giới hạn 12MB của Backend
- [ ] Cron backup chạy thử thành công — cả bản dump DB lẫn thư mục storage đều thấy trên R2
- [ ] 3 monitor UptimeRobot màu xanh
- [ ] App Android cài được từ Google Play (hoặc bản test nội bộ)
- [ ] Luồng nghiệp vụ lõi test tay: tạo lớp → điểm danh → xem báo cáo → thu học phí

---

**Vận hành thật cho tới khi chạm mốc chuyển giai đoạn.**
