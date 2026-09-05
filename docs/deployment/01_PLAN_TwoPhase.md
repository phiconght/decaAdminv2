# Bản đồ triển khai DecaMath — Hai giai đoạn, quy mô dưới 1.000 học viên

> Phương án hạ tầng, dự toán chi phí, và lộ trình triển khai cho 4 codebase (Backend Spring Boot, Admin, Web, Mobile) — bắt đầu với chi phí gần bằng 0, sau đó nâng cấp lên độ tin cậy cao khi vận hành ổn định.

## 1. Ước tính tải hệ thống

Trước khi chọn cấu hình máy chủ, cần biết thực sự hệ thống phải gánh bao nhiêu.

- **Người dùng đồng thời (peak):** với <1.000 học viên + phụ huynh + giáo viên + nhân viên, số kết nối đồng thời thực tế hiếm khi vượt **100–150** (giờ vào lớp buổi tối, giờ điểm danh).
- **Dữ liệu quan hệ (Postgres):** học viên, lớp, buổi học, điểm danh, bài tập, đề thi, hóa đơn — sau 2–3 năm vận hành ước tính **2–8 GB**, rất nhỏ so với năng lực một máy chủ tầm trung.
- **File tĩnh:** ảnh câu hỏi, PDF đề thi xuất ra, file Word nhập lô — video bài giảng trỏ qua YouTube (không lưu trên server) nên không phát sinh chi phí băng thông video lớn.
- **Job nền:** sinh lịch học, quét điểm danh thiếu, nhắc buổi học — chạy theo chu kỳ phút, tải CPU thấp.

**Kết luận tải:** Đây là tải của một ứng dụng doanh nghiệp nhỏ điển hình — không cần microservice hay cụm database ở bất kỳ giai đoạn nào trong phạm vi <1.000 học viên. Sự khác biệt giữa hai giai đoạn nằm ở **độ tin cậy và biên độ dự phòng**, không phải ở việc "đủ chạy hay không".

## 2. Kiến trúc dùng chung cho cả hai giai đoạn

Bốn codebase đóng ba vai trò hạ tầng:
- **Backend** là API động cần chạy liên tục
- **Admin** và **Web** build ra file tĩnh, chỉ cần trình phục vụ web
- **Mobile** không cần server riêng — chỉ gọi API Backend

Kiến trúc này giữ nguyên ở cả hai giai đoạn, **chỉ đổi cấu hình máy và nơi đặt database**.

```
Mobile (Flutter) & Trình duyệt
           ↓
      Cloudflare (DNS, SSL, chống DDoS)
           ↓
      1 VPS (Nginx reverse-proxy)
           ├─→ Spring Boot API (:9090)
           └─→ File Admin/Web tĩnh (React build)
           ↓
      PostgreSQL 16 (GĐ1: cùng máy; GĐ2: có thể tách)
      Object Storage (GĐ1: ổ đĩa VPS; GĐ2: R2 trả phí)
```

## 3. Giai đoạn 1 — Tiết kiệm tối đa

**Mục tiêu:** Đưa hệ thống chạy thật với chi phí gần bằng 0, chấp nhận đánh đổi một phần độ dự phòng.

### Cấu hình máy chủ

| Phương án | Compute | Chi phí |
|---|---|---|
| **Free-tier tối đa** | Oracle Cloud Always Free: 4 OCPU ARM Ampere / 24 GB RAM / 200 GB SSD | 0 VNĐ/tháng |
| **VPS dự phòng** | 2 vCPU / 4 GB RAM / 80 GB NVMe (Hetzner CX22, Contabo, hoặc nhà cung cấp VN) | 140.000–280.000 VNĐ/tháng |

### Dịch vụ đi kèm — chỉ giữ những gì thật sự cần

- **Tên miền** — 1 domain gốc, subdomain `admin.` / `app.` / `api.`
- **SSL/TLS** — miễn phí qua Cloudflare / Let's Encrypt
- **CDN & chống DDoS cơ bản** — Cloudflare gói miễn phí
- **Lưu file** — trực tiếp trên ổ đĩa VPS (dư dả với <20 GB file/năm), chưa cần object storage riêng
- **Sao lưu** — cron dump PostgreSQL hằng ngày + thư mục storage, đẩy sang Cloudflare R2 gói miễn phí (10 GB)
- **Giám sát** — UptimeRobot gói miễn phí, cảnh báo qua email/Telegram
- **Email giao dịch** — Brevo/Resend gói miễn phí (dưới 300 email/ngày, đủ cho <1.000 học viên)
- **Phát hành Mobile** — Chỉ Android trước (Google Play, phí một lần $25 ≈ 625.000 VNĐ). Hoãn Apple Developer Program ($99/năm) sang Giai đoạn 2.

### Dự toán chi phí Giai đoạn 1

| Khoản mục | VNĐ/tháng | VNĐ/năm |
|---|---|---|
| VPS (Oracle Free Tier) | 0 | 0 |
| Tên miền | 25.000 | 300.000 |
| SSL, CDN, sao lưu, giám sát, email — gói miễn phí | 0 | 0 |
| **Tổng vận hành** | **≈ 25.000** | **≈ 300.000** |
| Phát hành Android (một lần) | — | ≈ 625.000 |

**Nếu dùng VPS trả phí thay Oracle Free Tier:** cộng thêm ~140.000–280.000 VNĐ/tháng → tổng ≈ 165.000–305.000 VNĐ/tháng.

### Lưu ý Giai đoạn 1

- ⚠️ **Gói free-tier không có cam kết SLA**, đôi khi hết dung lượng cấp phát khi đăng ký mới, và dùng kiến trúc ARM (Docker image hỗ trợ tốt).
- ⚠️ **Chấp nhận downtime không báo trước** (bảo trì backend, tập sao lưu có thể mất 1-2 giờ).
- ✓ **Đủ dùng để kiểm chứng vận hành thật** và xây dựng lượng học viên ban đầu.

## 4. Giai đoạn 2 — Nâng cấp độ tin cậy & quy mô

**Giai đoạn này không đổi kiến trúc** — chỉ trả tiền để mua độ tin cậy: máy khỏe hơn, có SLA, sao lưu quản lý, và tách rời các thành phần dễ va chạm tải.

### Cấu hình máy chủ

| Mức | Quy mô phù hợp | vCPU | RAM | SSD |
|---|---|---|---|---|
| **Khuyến nghị** | 300–1.000 học viên | 4 | 8 GB | 160 GB NVMe |
| **Tách CSDL riêng** | Backend riêng + PostgreSQL managed (tự sao lưu, failover) | 4+2 | 8+4 GB | 160+100 GB |

### Dịch vụ nâng cấp ở Giai đoạn 2

- **Object storage riêng** — Cloudflare R2 hoặc Wasabi trả phí, tách file khỏi ổ đĩa VPS
- **Sao lưu quản lý** — snapshot VPS tự động hằng ngày từ nhà cung cấp (giữ 7 bản)
- **Managed PostgreSQL** (nếu tách DB) — tự vá lỗi, tự sao lưu, có failover, SLA cam kết
- **Apple Developer Program** — phát hành app iOS chính thức ($99/năm)
- **Giám sát nâng cao** — dashboard hiệu năng (Grafana Cloud free/trả phí)

### Dự toán chi phí Giai đoạn 2

| Khoản mục | VN (VNĐ/tháng) | Quốc tế (VNĐ/tháng) |
|---|---|---|
| VPS 4 vCPU / 8 GB / 160 GB | 750.000–900.000 | 1.100.000–1.250.000 |
| Tên miền | 25.000 | 25.000 |
| Object storage trả phí (~10–20 GB) | 30.000–60.000 | 15.000–40.000 |
| Sao lưu snapshot quản lý | 80.000–120.000 | 100.000–150.000 |
| CDN / chống DDoS (gói Free) | 0 | 0 |
| **Tổng / tháng** | **≈ 900.000–1.100.000** | **≈ 1.250.000–1.450.000** |
| **Tổng / năm** | **≈ 11–13,5 triệu** | **≈ 15–17,5 triệu** |
| Apple Developer (thêm, hằng năm) | ≈ 2.500.000 | ≈ 2.500.000 |

**Gợi ý nhà cung cấp:**
- **Trong nước:** Vietnix, TinoHost, iWay — thanh toán VNĐ, hỗ trợ tiếng Việt, hạ tầng VN (độ trễ thấp)
- **Quốc tế:** DigitalOcean, Hetzner, Vultr (Singapore region) — rẻ hơn theo USD nhưng thanh toán thẻ quốc tế

## 5. Mốc chuyển từ Giai đoạn 1 sang Giai đoạn 2

Chuyển giai đoạn khi:

→ Số học viên hoạt động vượt **~300–500**, hoặc trung tâm đã có doanh thu ổn định đủ để downtime bất ngờ gây thiệt hại thực sự.

→ Giám sát (UptimeRobot) ghi nhận CPU/RAM VPS free-tier thường xuyên >70% ở giờ cao điểm.

→ Cần cam kết chất lượng dịch vụ với phụ huynh/đối tác — không chấp nhận rủi ro "free-tier không SLA" nữa.

→ Muốn phát hành chính thức trên App Store (iOS) — đến lúc trả phí Apple Developer Program.

**Chuyển giai đoạn chỉ là di chuyển dữ liệu & đổi DNS trỏ sang VPS mới** — không đụng vào code ứng dụng, vì kiến trúc (mục 2) giữ nguyên cho cả hai giai đoạn.

## 6. Bảo mật & vận hành — áp dụng cả hai giai đoạn

- Tường lửa chỉ mở cổng 80/443 và SSH qua key, không mật khẩu
- PostgreSQL không public ra ngoài — chỉ nghe trên localhost/mạng nội bộ Docker
- Biến môi trường (secret, JWT key, mật khẩu DB) không commit vào git
- Cập nhật bản vá hệ điều hành & Docker image định kỳ hằng tháng
- Kiểm thử khôi phục từ bản sao lưu ít nhất mỗi quý
- Nhật ký (log) Backend lưu tối thiểu 30 ngày

---

**Kết luận:** Phương án khuyến nghị là **Giai đoạn 1 trên Oracle Cloud Free Tier (0 VNĐ/tháng vận hành)**, nâng lên Giai đoạn 2 (900k–1,1tr VNĐ/tháng) khi vượt ngưỡng học viên hoặc cần SLA. Không cần viết lại code, chỉ đổi nơi triển khai.
