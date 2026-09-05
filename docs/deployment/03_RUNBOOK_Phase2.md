# Runbook chi tiết — Giai đoạn 2 (9 bước)

## Chuyển sang hạ tầng trả phí, độ tin cậy cao hơn — không đổi code

> Giai đoạn này không đổi kiến trúc ứng dụng — chỉ trả tiền để mua độ tin cậy: máy khỏe hơn, có SLA, sao lưu quản lý, và tách rời các thành phần dễ va chạm tải.

---

## Bước 1: Thuê VPS mới & dựng song song

Thuê VPS 4 vCPU/8 GB/160 GB (nhà cung cấp trong nước hoặc quốc tế). Lặp lại bước 2–9 của Giai đoạn 1 (cài Docker, tạo thư mục, Nginx, chứng chỉ, Dockerfile, docker-compose) trên máy mới — **chưa đổi DNS**, dùng subdomain tạm `staging.domain.com` để kiểm thử song song.

---

## Bước 2: Khôi phục dữ liệu từ bản sao lưu

```bash
gunzip -c db_latest.sql.gz | docker exec -i $(docker compose ps -q postgres) \
  psql -U center -d center
```

Kiểm thử toàn bộ luồng nghiệp vụ trên máy mới qua `staging.domain.com`, đối chiếu số liệu (số học viên, số lớp, số bản ghi điểm danh) khớp với máy Giai đoạn 1.

---

## Bước 3: Cắt chuyển (cutover) — giảm downtime tối đa

1. Hạ TTL của các A record trên Cloudflare xuống 60s, chờ trước 24h
2. Chọn khung giờ ít người dùng (ví dụ 23h–24h), bật trang bảo trì tạm trên máy cũ
3. Chạy lại `backup.sh` lần cuối trên máy cũ để lấy dữ liệu mới nhất, khôi phục chênh lệch vào máy mới
4. Đổi A record `api./admin./app.` sang IP máy mới
5. Theo dõi log Nginx + UptimeRobot xác nhận traffic đã chuyển hoàn toàn
6. Giữ máy Giai đoạn 1 chạy song song 24–48h để rollback nhanh nếu phát sinh sự cố

**Cửa sổ downtime thực tế:** Với quy trình trên, downtime chỉ xảy ra trong lúc bảo trì để đồng bộ dữ liệu chênh lệch cuối — thường dưới 15–30 phút nếu chuẩn bị kỹ ở bước 1–2.

---

## Bước 4: Chuyển file tĩnh sang Object Storage

```bash
# Ví dụ dùng rclone đồng bộ toàn bộ file hiện có sang R2 trả phí
rclone sync ~/decamath/data/storage r2:decamath-files/storage --progress
```

Cập nhật biến môi trường Backend trỏ endpoint S3-compatible mới (access key, bucket, region), redeploy container `backend`.

---

## Bước 5: Bật sao lưu quản lý của nhà cung cấp VPS

- Bật tính năng Snapshot/Backup tự động trong dashboard VPS (thường có sẵn, chọn lịch hằng ngày, giữ 7 bản)
- Giữ song song cron `backup.sh` (mục GĐ1 bước 11) như lớp sao lưu thứ hai độc lập với nhà cung cấp

---

## Bước 6: Phát hành iOS

- Đăng ký Apple Developer Program ($99/năm)
- Cấu hình Certificate, Identifier, Provisioning Profile trong Xcode/App Store Connect

```bash
cd MOBILE
flutter build ipa --release
```

Upload qua Transporter hoặc Xcode, tạo bản ghi app trên App Store Connect, gửi review.

---

## Bước 7: Nâng giám sát

- Cài `node_exporter` (VPS) + `postgres_exporter` (DB), kết nối Grafana Cloud gói miễn phí
- Dashboard: CPU/RAM/disk, số kết nối DB, thời gian phản hồi API
- Cảnh báo ngưỡng: CPU >80% trong 10 phút, disk >85%, DB connection pool cạn

---

## Bước 8: (Điều kiện) Tách managed PostgreSQL — khi >1.200–1.500 học viên

1. Tạo instance managed PostgreSQL 16 (2 vCPU/4GB trở lên) ở cùng khu vực với VPS Backend
2. Dump từ Postgres container hiện tại, restore vào managed DB
3. Đổi `SPRING_DATASOURCE_URL` trỏ sang managed DB, redeploy Backend, kiểm thử kỹ
4. Sau khi ổn định 1–2 tuần, tắt hẳn container `postgres` cục bộ, gỡ khỏi `docker-compose.yml`

---

## Bước 9: Dọn dẹp Giai đoạn 1

Sau khi Giai đoạn 2 chạy ổn định (khuyến nghị theo dõi tối thiểu 1 tuần không sự cố), huỷ VPS Giai đoạn 1 để tránh trả phí song song hai nơi — hoặc giữ lại làm môi trường staging/dự phòng nếu chi phí free-tier vẫn bằng 0.

---

## Checklist go-live Giai đoạn 2

- [ ] Toàn bộ 3 subdomain trỏ đúng IP máy mới, HTTPS hợp lệ
- [ ] Đối chiếu dữ liệu máy mới = máy cũ tại thời điểm cutover (số bản ghi khớp)
- [ ] File tĩnh (ảnh, PDF) truy cập được từ Object Storage mới
- [ ] Snapshot tự động của nhà cung cấp đã bật, kiểm thử khôi phục thử 1 lần
- [ ] App iOS ở trạng thái "Đang chờ duyệt" hoặc đã lên App Store
- [ ] Dashboard Grafana hiển thị số liệu thời gian thực
- [ ] VPS Giai đoạn 1 đã huỷ hoặc chuyển vai trò rõ ràng (staging)

---

**Kết thúc:** Hệ thống DecaMath đã chuyển sang hạ tầng trả phí, độ tin cậy cao, sẵn sàng mở rộng quy mô khi số học viên vượt 1.000 hoặc khi có nhu cầu mở thêm cơ sở.
