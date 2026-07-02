import { useParams } from '@umijs/max';
import { Button, Spin } from 'antd';
import { useEffect, useState } from 'react';
import AttendanceDonut from './components/AttendanceDonut';
import BreakdownChart from './components/BreakdownChart';
import { DIFFICULTY_LABEL } from './components/colors';
import ScoreTrendChart from './components/ScoreTrendChart';
import TopicMasteryChart from './components/TopicMasteryChart';
import type { StudentClassSummaryResponse } from './data';
import { getStudentSummary } from './service';

const ROLE_LABEL: Record<string, string> = {
  TEACHER: 'Giáo viên',
  ASSISTANT: 'Trợ giảng',
  PARENT: 'Phụ huynh',
  ADMIN: 'Quản trị',
  EMPLOYEE: 'Nhân viên',
};

const pct = (v: number | null) => (v == null ? '—' : `${Math.round(v * 100)}%`);
const d = (s: string | null) =>
  s ? new Date(s).toLocaleDateString('vi-VN') : '—';

// Mẫu in A4 tổng kết — gọi 1 endpoint summary. In bằng window.print().
const PrintReport = () => {
  const params = useParams();
  const studentId = Number(params.studentId);
  const classId = Number(params.classId);

  const [data, setData] = useState<StudentClassSummaryResponse | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!studentId || !classId) return;
    getStudentSummary(studentId, classId).then((res) => {
      setData(res.data);
      // Chờ chart render xong mới cho in.
      setTimeout(() => setReady(true), 1200);
    });
  }, [studentId, classId]);

  if (!data) {
    return <Spin style={{ display: 'block', margin: '120px auto' }} />;
  }

  const att = data.attendance.summary;
  const avgScore =
    data.exams.length > 0
      ? (
          data.exams.reduce((s, e) => s + (e.score ?? 0), 0) / data.exams.length
        ).toFixed(2)
      : '—';

  return (
    <div className="print-root">
      <style>{`
        .print-root { max-width: 794px; margin: 0 auto; padding: 24px; color: #000; background: #fff; }
        .print-header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #1677ff; padding-bottom: 12px; }
        .print-title { text-align: center; flex: 1; }
        .print-title h1 { font-size: 20px; margin: 0; }
        .print-title p { margin: 4px 0 0; color: #555; font-size: 13px; }
        .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 4px 24px; margin: 16px 0; font-size: 13px; }
        .stat-row { display: flex; gap: 16px; margin: 12px 0; }
        .stat-box { flex: 1; border: 1px solid #ddd; border-radius: 6px; padding: 10px; text-align: center; }
        .stat-box .num { font-size: 22px; font-weight: bold; color: #1677ff; }
        .stat-box .lbl { font-size: 12px; color: #666; }
        table.score-table { width: 100%; border-collapse: collapse; margin: 8px 0 16px; font-size: 12px; }
        table.score-table th, table.score-table td { border: 1px solid #ddd; padding: 6px 8px; text-align: center; }
        table.score-table th { background: #fafafa; }
        .chart-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
        .chart-box { border: 1px solid #eee; border-radius: 6px; padding: 8px; }
        .chart-box h4 { margin: 0 0 8px; font-size: 13px; }
        .comment { border-left: 3px solid #1677ff; padding: 4px 10px; margin: 8px 0; }
        .comment .meta { font-size: 12px; color: #555; }
        .section-title { font-size: 15px; font-weight: bold; margin: 20px 0 8px; border-bottom: 1px solid #eee; padding-bottom: 4px; }
        .print-footer { display: flex; justify-content: space-between; margin-top: 40px; font-size: 13px; }
        @media print {
          .no-print { display: none !important; }
          .print-root { padding: 0; }
          .chart-box, .stat-box, .comment, table.score-table th, table.score-table td {
            -webkit-print-color-adjust: exact; print-color-adjust: exact;
          }
        }
      `}</style>

      <div
        className="no-print"
        style={{ marginBottom: 16, textAlign: 'right' }}
      >
        <Button type="primary" disabled={!ready} onClick={() => window.print()}>
          {ready ? 'In / Lưu PDF' : 'Đang tải biểu đồ...'}
        </Button>
      </div>

      <div className="print-header">
        <div style={{ fontWeight: 'bold' }}>TRUNG TÂM ĐÀO TẠO</div>
        <div className="print-title">
          <h1>BÁO CÁO KẾT QUẢ HỌC TẬP</h1>
          <p>
            Khóa học: {data.clazz.name} — {data.clazz.subjectName}
          </p>
        </div>
        <div style={{ width: 120 }} />
      </div>

      <div className="info-grid">
        <div>
          <b>Học viên:</b> {data.student.fullName}
        </div>
        <div>
          <b>Tài khoản:</b> {data.student.username}
        </div>
        <div>
          <b>Email:</b> {data.student.email || '—'}
        </div>
        <div>
          <b>SĐT:</b> {data.student.phone || '—'}
        </div>
        <div>
          <b>Giáo viên:</b> {data.clazz.teacherNames || '—'}
        </div>
        <div>
          <b>Mã khóa:</b> {data.clazz.code}
        </div>
      </div>

      <div className="stat-row">
        <div className="stat-box">
          <div className="num">{avgScore}</div>
          <div className="lbl">Điểm trung bình</div>
        </div>
        <div className="stat-box">
          <div className="num">{data.exams.length}</div>
          <div className="lbl">Số bài đã làm</div>
        </div>
        <div className="stat-box">
          <div className="num">{pct(att.attendanceRate)}</div>
          <div className="lbl">Chuyên cần</div>
        </div>
        <div className="stat-box">
          <div className="num">{pct(att.onTimeRate)}</div>
          <div className="lbl">Đúng giờ</div>
        </div>
      </div>

      <div className="section-title">Kết quả các bài thi</div>
      <table className="score-table">
        <thead>
          <tr>
            <th>STT</th>
            <th>Tên đề</th>
            <th>Ngày nộp</th>
            <th>Điểm</th>
            <th>Điểm tối đa</th>
          </tr>
        </thead>
        <tbody>
          {data.exams.map((e, i) => (
            <tr key={e.examStudentId}>
              <td>{i + 1}</td>
              <td style={{ textAlign: 'left' }}>{e.examName}</td>
              <td>{d(e.submittedAt)}</td>
              <td>{e.score ?? '—'}</td>
              <td>{e.maxScore ?? '—'}</td>
            </tr>
          ))}
          {data.exams.length === 0 && (
            <tr>
              <td colSpan={5}>Chưa có bài thi đã nộp</td>
            </tr>
          )}
        </tbody>
      </table>

      <div className="section-title">Biểu đồ phân tích</div>
      <div className="chart-grid">
        <div className="chart-box">
          <h4>Xu hướng điểm</h4>
          <ScoreTrendChart points={data.trend} height={220} />
        </div>
        <div className="chart-box">
          <h4>Đúng/sai theo độ khó</h4>
          <BreakdownChart
            buckets={data.breakdown.byDifficulty}
            labelMap={DIFFICULTY_LABEL}
            height={220}
          />
        </div>
        <div className="chart-box">
          <h4>Nắm chắc kiến thức theo chương</h4>
          <TopicMasteryChart items={data.topicMastery} height={240} />
        </div>
        <div className="chart-box">
          <h4>Chuyên cần</h4>
          <AttendanceDonut summary={att} height={220} />
        </div>
      </div>

      <div className="section-title">Nhận xét</div>
      {data.comments.length === 0 && <p>Chưa có nhận xét.</p>}
      {data.comments.map((c) => (
        <div className="comment" key={c.id}>
          <div className="meta">
            [{ROLE_LABEL[c.authorRole] ?? c.authorRole}] {c.authorName} —{' '}
            {new Date(c.createdAt).toLocaleDateString('vi-VN')}
          </div>
          <div style={{ whiteSpace: 'pre-wrap' }}>{c.content}</div>
        </div>
      ))}

      <div className="print-footer">
        <div>Giáo viên phụ trách</div>
        <div>Ngày in: {new Date().toLocaleDateString('vi-VN')}</div>
      </div>
    </div>
  );
};

export default PrintReport;
