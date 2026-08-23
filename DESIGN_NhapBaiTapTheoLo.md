# Thiết kế UI/UX — Nhập bài tập/đề thi theo lô (từ file Word qua AI)

Trạng thái: bản thiết kế giao diện, **chưa code**. Giữ đúng pattern UI hiện có của trang admin (`PageContainer` / `ProCard` filter / `ProTable` / `Drawer` / `DrawerForm`), tái dùng tối đa component đã có trong `src/pages/exercise/` và `src/pages/exam/`.

## 1. Phạm vi

- Nhập bài tập/đề thi hàng loạt từ file dữ liệu do AI bóc tách từ Word, **hoặc** nhập tay theo lô (cùng 1 màn hình, chỉ khác điểm khởi tạo).
- 3 dạng câu hỏi hỗ trợ: Trắc nghiệm, Tự luận, Đúng/Sai — khớp `ExerciseType` hiện có (`MULTIPLE_CHOICE` / `ESSAY` / `TRUE_FALSE`).
- File nhập vào DecaMath là **file dữ liệu** (không phải .docx trực tiếp) — bước Word → AI → file dữ liệu nằm ngoài phạm vi UI này.
- Ảnh **không** có trong file dữ liệu lúc nhập; chỉ thêm khi người dùng chỉnh sửa thủ công trên giao diện duyệt lô.

## 2. Mô hình trạng thái

Mở rộng `ExerciseStatus` / `ExamStatus` hiện tại (`ACTIVE` / `INACTIVE`) thành 3 mức:

| Trạng thái | Mã | Màu Tag | Ý nghĩa |
|---|---|---|---|
| Chờ xác nhận | `PENDING` | gold | Vừa nhập (Word hoặc tay), chưa dùng được, còn sửa được |
| Hoạt động | `ACTIVE` | success (xanh) | Đã xác nhận, dùng được trong đề thi/giao bài |
| Xóa | `DELETED` | default (xám, gạch ngang) | Xóa mềm, ẩn khỏi danh sách chọn nhưng giữ lại để đối chiếu |

Quy tắc chuyển trạng thái:
- Nhập (Word/tay) → tạo bản ghi `PENDING`.
- `PENDING` → **Xác nhận** → `ACTIVE`. Chỉ `PENDING` mới có nút Xác nhận.
- `PENDING` hoặc `ACTIVE` → **Xóa** → `DELETED` (đều cần xác nhận thao tác qua `Popconfirm`, không cho xóa nhầm).
- `DELETED` chỉ xem, không sửa/xác nhận lại.
- Gắn 1 bài `PENDING` vào đề thi (mục 6) → tự chuyển `ACTIVE` (đã dùng thì không cần xác nhận riêng nữa).

## 3. Entry point trên trang Bài Tập / Đề Thi hiện có

`src/pages/exercise/index.tsx` và `src/pages/exam/index.tsx`, toolbar bảng thêm nút cạnh nút tạo sẵn:

```
[+ Tạo bài tập]   [⭱ Nhập theo lô (2)]
```

- Số `(2)` là badge đếm số lô còn dở dang (`PENDING` chưa duyệt hết) — bấm vào mở lại lô gần nhất chưa hoàn tất, hoặc danh sách lô nếu có nhiều hơn 1.
- Bộ lọc "Trạng thái" trong `QueryFilter` thêm option `Chờ xác nhận`. Giữ mặc định lọc `ACTIVE` như hiện tại — lô đang chờ duyệt không làm loãng danh sách chính.
- Cột **Trạng thái** trên bảng: đổi từ Tag-bấm-để-toggle (đang có ở `class`/`exercise` — dễ bấm nhầm) sang Tag tĩnh + action tương ứng trong cột **Thao tác** (Xác nhận / Xóa, có `Popconfirm`), nhất quán với cách `fee/Invoices.tsx` đang làm.

## 4. Màn hình chính: "Thêm bài tập theo lô"

Mở dạng **Drawer rộng** (`width` lớn, kiểu `DrawerForm width="66vw"` đã dùng cho `CreateExerciseForm`), không chuyển trang — giữ context danh sách phía sau. Bố cục 2 cột cố định trái/phải trong cùng 1 Drawer.

### 4.1 Panel trái — cấu hình & nhập file (~230px, cố định)

```
Thêm bài tập theo lô
─────────────────────
Khối học *      [Select ▾]   ← chọn trước, lọc bớt Môn học
Môn học *       [Select ▾]
Chuyên đề       [Select ▾]   ← optional
─────────────────────
Tên đề thi      [Text]       ← CHỈ hiện khi bấm "Import Đề Thi"
─────────────────────
[⭱ Import Bài Tập]   (nút primary)
[⭱ Import Đề Thi]    (nút outline)
```

- Khối học đặt **trước** Môn học (không phải song song như bản phác thảo gốc): vì mỗi Môn trong hệ thống đã gắn sẵn 1 khối cụ thể (VD "Toán — Khối 9" là 1 `subjectId` riêng biệt), chọn Khối trước giúp lọc bớt danh sách Môn dài.
- Cả 2 nút import đều mở file picker hệ điều hành, chỉ nhận `.json` (file dữ liệu, không phải `.docx`).
- **"Import Đề Thi" không phải nhánh tách biệt của "Import Bài Tập"** — đúng theo luật nghiệp vụ "tạo đề thi sẽ import bài tập trước, rồi nối bài tập vào đề thi sau": bấm nút này thực chất chạy **cả 2 bước tự động trong 1 lần bấm** — (a) tạo các bài tập `PENDING` như nhánh trái, (b) tự tạo thêm 1 đề thi `PENDING` gắn các bài đó theo đúng thứ tự trong file. Vì vậy cần thêm ô "Tên đề thi" (bản phác thảo gốc thiếu ô này).
- Sau khi chọn xong file, panel phải load danh sách; panel trái vẫn ở đó để người dùng nhập tiếp lô khác nếu muốn (không đóng Drawer).

### 4.2 Panel phải — danh sách duyệt lô

```
Word_ToanK9_PT_bac2.json — 2/4 đã xác nhận      [Xác nhận đã chọn] [Xóa đã chọn]
─────────────────────────────────────────────────────────────────────────────
☑ Bài 1  [Trắc nghiệm] [Đã xác nhận]                          [Sửa]  [Xóa]
   Giải phương trình x² − 5x + 6 = 0. Nghiệm là:
   Đề bài [+ Thêm ảnh]   Đáp án (4 lựa chọn)  A[+] B[+] C[+] D[+]
─────────────────────────────────────────────────────────────────────────────
☐ Bài 2  [Tự luận] [Chờ xác nhận]                             [Sửa]  [Xóa]
   Tính đạo hàm của f(x) = x³ − 3x + 1 tại x = 2.
   Đề bài [+ Thêm ảnh]   Đáp án [+ Thêm ảnh]
   [Xác nhận]
─────────────────────────────────────────────────────────────────────────────
   Bài 3  [Đúng/Sai] [Đã xóa] — mờ, gạch ngang, không có action
─────────────────────────────────────────────────────────────────────────────
```

Chi tiết từng phần:

- **Header lô**: tên file gốc + tỉ lệ đã xác nhận (`n/m`), giúp biết còn bao nhiêu việc phải làm. Toolbar hàng loạt: "Xác nhận đã chọn" / "Xóa đã chọn" dùng `Popconfirm` khi số lượng > 0.
- **Số thứ tự `Bài N`**: lấy đúng theo thứ tự trong file dữ liệu (`orderIndex`), **không cho kéo-thả đổi thứ tự** ở màn này — giữ đúng thứ tự nguồn như yêu cầu. Bài bị xóa vẫn giữ số thứ tự cũ (hiển thị mờ) để không gây hiểu lầm là lỗi hệ thống khi thấy nhảy số.
- **Tag loại câu** (Trắc nghiệm / Tự luận / Đúng-Sai) và **Tag trạng thái** (Chờ xác nhận / Đã xác nhận / Đã xóa) đặt cạnh nhau, không dùng chung 1 tag để tránh nhầm lẫn 2 loại thông tin khác nhau.
- **Preview nội dung**: dùng lại component `MathPreview` (đã có, KaTeX qua `@ant-design/x-markdown`) để hiện đúng công thức toán ngay trong danh sách, không cần mở riêng mới xem được.
- **Nút Sửa**: mở lại chính `CreateExerciseForm` hiện có (`editId=item.id`) — form này đã có sẵn `ImageUpload` đầy đủ cho từng phần, nên việc "cho sửa mới thêm ảnh" không cần dựng form mới.
- **Nút Xóa** (từng câu): `Popconfirm` "Xóa câu này khỏi lô?" → set `DELETED`. Có thể thêm nút **Khôi phục** nhỏ ngay trên thẻ đã xóa (trong lúc còn ở màn duyệt lô) để sửa nhầm không phải nhập lại từ đầu.
- **Nút Xác nhận riêng từng câu** (chỉ hiện khi `PENDING`): với các lô nhỏ, người dùng có thể xác nhận từng câu ngay sau khi kiểm tra xong câu đó, không cần đợi duyệt hết cả lô.

### 4.3 Khu vực "Thêm ảnh" — theo từng loại câu hỏi

Không dùng chung 1 nút "Đề / Đáp án + Thêm ảnh" cho mọi loại (khác với bản phác thảo gốc), vì cấu trúc dữ liệu đáp án khác nhau theo loại:

| Loại | Trường ảnh | UI |
|---|---|---|
| Trắc nghiệm | `questionImage` + `options[].image` (4 đáp án, mỗi cái ảnh riêng) | 1 nút "Thêm ảnh" cho Đề bài + 4 nút nhỏ A/B/C/D cho từng đáp án |
| Tự luận | `questionImage` + `essayAnswerImage` (1 ảnh đề, 1 ảnh đáp án) | 2 nút "Thêm ảnh" — Đề bài & Đáp án (đúng như bản phác thảo gốc) |
| Đúng/Sai | `questionImage` + `trueFalseItems[].image` (mỗi ý có ảnh riêng) | 1 nút cho Đề bài + N nút nhỏ theo từng ý (Ý 1, Ý 2, …) |

Ảnh thêm trực tiếp tại đây dùng chung cơ chế đã có (`ImageUpload` → lưu dạng data URL tạm, upload thật khi lưu, giống `resolveImages()` trong `CreateExerciseForm.tsx`).

### 4.4 Trạng thái rỗng / lỗi

- Chưa import gì: panel phải hiện thông báo trống + hướng dẫn ngắn "Chọn Import Bài Tập hoặc Import Đề Thi ở bên trái để bắt đầu".
- File dữ liệu không đọc được / rỗng: `message.error` + không tạo lô rỗng.
- Nhập tay không qua file: panel phải bắt đầu rỗng kèm nút dashed `+ Thêm bài trống` ở cuối danh sách (giống mẫu `+ Thêm ý` / `+ Thêm đáp án` đã dùng trong `TrueFalseInput.tsx` / `MultipleChoiceInput.tsx`) — mỗi lần bấm mở `CreateExerciseForm` trống, lưu xong tự thêm vào danh sách lô như 1 câu vừa "nhập từ Word".

## 5. Nối bài tập có sẵn vào đề thi

`ExercisePickerModal` (đang dùng trong `exam/Editor.tsx` để tìm bài `ACTIVE` gắn vào đề) thêm 1 `Tabs` ở đầu Modal:

```
[ Tìm bài có sẵn ]     [ Từ lô vừa nhập ]
```

Tab "Từ lô vừa nhập" hiển thị rút gọn của màn 4.2 (chỉ preview + checkbox chọn, ẩn nút Sửa/Xóa/ảnh), lọc theo đúng `subjectId` của đề thi đang tạo. Bấm "Thêm (n)" → gắn vào `SelectedExerciseSections` như luồng thủ công hiện tại, đồng thời tự chuyển các bài đó từ `PENDING` → `ACTIVE`.

## 6. Component tái sử dụng (không cần dựng mới)

| Việc cần làm | Component có sẵn |
|---|---|
| Form sửa 1 câu (mọi loại, có ảnh) | `src/pages/exercise/components/CreateExerciseForm.tsx` |
| Preview công thức toán (KaTeX) | `src/components/MathMarkdownEditor/MathPreview.tsx` |
| Upload ảnh từng phần | `src/pages/exercise/components/ImageUpload.tsx` |
| Chọn bài có sẵn gắn vào đề thi | `src/pages/exam/components/ExercisePickerModal.tsx` (thêm Tab) |
| Danh sách câu đã chọn trong đề, theo nhóm loại | `src/pages/exam/components/SelectedExerciseSections.tsx` |
| Tag/Popconfirm cho đổi trạng thái, xóa | pattern đã dùng ở `src/pages/fee/Invoices.tsx` |

## 7. Việc cần dựng mới

- Enum trạng thái 3 mức (`PENDING/ACTIVE/DELETED`) cho `ExerciseStatus` và `ExamStatus`.
- Modal/trigger chọn file dữ liệu `.json` + gọi API tạo lô (2 panel, mục 4.1).
- Component "thẻ câu hỏi trong lô" (mục 4.2–4.3) — card layout, không phải `ProTable` (nội dung câu hỏi dài, bảng sẽ vỡ layout).
- Tab "Từ lô vừa nhập" trong `ExercisePickerModal`.
- Badge đếm lô dở dang trên nút entry point (mục 3).

## 8. Câu hỏi còn mở (cần xác nhận thêm trước khi code)

- File dữ liệu `.json` từ AI có schema cụ thể thế nào (tên field, cấu trúc đáp án)? Cần khớp đúng với `ExerciseDetail` hiện có hoặc viết lớp map riêng.
- 1 lô có giới hạn số câu tối đa không (ảnh hưởng hiệu năng render danh sách card)?
- Cho phép nhiều lô `PENDING` chạy song song hay chỉ 1 lô/người dùng tại 1 thời điểm?
- Xóa mềm (`DELETED`) có cần lịch sử/audit log riêng không, hay chỉ cần giữ bản ghi ẩn khỏi UI?
