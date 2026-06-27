import { EnvironmentOutlined, UserOutlined } from '@ant-design/icons';
import { Empty, Tag, Tooltip } from 'antd';
import { createStyles } from 'antd-style';
import type { Dayjs } from 'dayjs';
import React, { useMemo } from 'react';
import type { TimetableItem, TimetableView } from '../data';

// Khung giờ mặc định + tỉ lệ px/phút (1h ≈ 72px).
const DEFAULT_START_MIN = 7 * 60; // 07:00
const DEFAULT_END_MIN = 21 * 60; // 21:00
const PX_PER_MIN = 1.2;
const SLOT_MIN = 60; // nhãn giờ mỗi 60'
const TIME_COL_PX = 56;

// Palette màu con (view PARENT) — gán theo index studentId.
export const CHILD_COLORS = [
  '#1677ff',
  '#fa8c16',
  '#722ed1',
  '#13c2c2',
  '#eb2f96',
  '#52c41a',
  '#faad14',
  '#2f54eb',
];

const VI_DOW = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];

const useStyles = createStyles(({ token, css }) => ({
  wrapper: css`
    border: 1px solid ${token.colorBorderSecondary};
    border-radius: ${token.borderRadius}px;
    overflow: hidden;
    background: ${token.colorBgContainer};
  `,
  header: css`
    display: grid;
    position: sticky;
    top: 0;
    z-index: 2;
    background: ${token.colorBgContainer};
    border-bottom: 1px solid ${token.colorBorderSecondary};
  `,
  headCell: css`
    padding: 8px 4px;
    text-align: center;
    font-weight: 500;
    border-left: 1px solid ${token.colorBorderSecondary};
    color: ${token.colorText};
  `,
  headTime: css`
    border-left: none;
    color: ${token.colorTextSecondary};
  `,
  todayHead: css`
    background: ${token.colorPrimaryBg};
    color: ${token.colorPrimary};
  `,
  weekendHead: css`
    color: ${token.colorTextTertiary};
  `,
  body: css`
    display: grid;
    position: relative;
  `,
  timeCol: css`
    position: relative;
  `,
  timeLabel: css`
    position: absolute;
    right: 6px;
    transform: translateY(-50%);
    font-size: 12px;
    color: ${token.colorTextTertiary};
  `,
  dayCol: css`
    position: relative;
    border-left: 1px solid ${token.colorBorderSecondary};
  `,
  todayCol: css`
    background: ${token.colorPrimaryBg}33;
  `,
  weekendCol: css`
    background: ${token.colorFillQuaternary};
  `,
  gridLine: css`
    position: absolute;
    left: 0;
    right: 0;
    border-top: 1px dashed ${token.colorBorderSecondary};
  `,
  card: css`
    position: absolute;
    display: block;
    text-align: left;
    font-family: inherit;
    color: ${token.colorText};
    border-radius: ${token.borderRadius}px;
    border: 1px solid ${token.colorPrimaryBorder};
    background: ${token.colorPrimaryBg};
    padding: 4px 6px;
    overflow: hidden;
    cursor: pointer;
    font-size: 12px;
    line-height: 1.35;
    transition: box-shadow 0.15s;
    &:hover {
      box-shadow: ${token.boxShadowSecondary};
      z-index: 3;
    }
  `,
  cardCancelled: css`
    opacity: 0.55;
    text-decoration: line-through;
    background: ${token.colorErrorBg};
    border-color: ${token.colorErrorBorder};
  `,
  cardTitle: css`
    font-weight: 600;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  `,
  cardLine: css`
    color: ${token.colorTextSecondary};
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  `,
  empty: css`
    padding: 48px 0;
  `,
}));

const toMin = (t: string): number => {
  const [h, m] = t.slice(0, 5).split(':').map(Number);
  return h * 60 + m;
};
const hhmm = (t: string): string => t.slice(0, 5);

// Badge điểm danh (chỉ STUDENT/PARENT).
const ATT_BADGE: Record<string, { icon: string; color: string }> = {
  CO_MAT: { icon: '✓', color: 'success' },
  TRE: { icon: '⏱', color: 'warning' },
  VANG: { icon: '✗', color: 'error' },
  CO_PHEP: { icon: 'P', color: 'purple' },
  CHUA_CHECKIN: { icon: '○', color: 'default' },
};

// Gán cột con cho các buổi trùng khung trong 1 ngày (interval graph coloring).
type Placed = { item: TimetableItem; col: number; cols: number };
function layoutDay(items: TimetableItem[]): Placed[] {
  const sorted = [...items].sort(
    (a, b) =>
      toMin(a.startTime) - toMin(b.startTime) ||
      toMin(a.endTime) - toMin(b.endTime),
  );
  const result: Placed[] = [];
  let cluster: TimetableItem[] = [];
  let clusterEnd = -1;

  const flush = () => {
    if (!cluster.length) return;
    // gán cột tham lam trong cụm
    const colEnd: number[] = []; // phút kết thúc của mỗi cột
    const assign = new Map<TimetableItem, number>();
    for (const it of cluster) {
      const s = toMin(it.startTime);
      let placed = false;
      for (let c = 0; c < colEnd.length; c++) {
        if (s >= colEnd[c]) {
          colEnd[c] = toMin(it.endTime);
          assign.set(it, c);
          placed = true;
          break;
        }
      }
      if (!placed) {
        assign.set(it, colEnd.length);
        colEnd.push(toMin(it.endTime));
      }
    }
    const cols = colEnd.length;
    for (const it of cluster) {
      result.push({ item: it, col: assign.get(it) ?? 0, cols });
    }
    cluster = [];
    clusterEnd = -1;
  };

  for (const it of sorted) {
    const s = toMin(it.startTime);
    if (cluster.length && s >= clusterEnd) flush();
    cluster.push(it);
    clusterEnd = Math.max(clusterEnd, toMin(it.endTime));
  }
  flush();
  return result;
}

type Props = {
  items: TimetableItem[];
  weekDays: Dayjs[]; // 1 phần tử (DAY) hoặc 7 (WEEK)
  view: TimetableView;
  // map studentId → index màu (view PARENT)
  childColorIndex?: Record<number, number>;
  onClickSession: (item: TimetableItem) => void;
};

const WeekGrid: React.FC<Props> = ({
  items,
  weekDays,
  view,
  childColorIndex,
  onClickSession,
}) => {
  const { styles, cx } = useStyles();
  const today = useMemo(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }, []);

  // Khung giờ thực: mở rộng theo dữ liệu nếu có buổi ngoài 07:00–21:00.
  const [startMin, endMin] = useMemo(() => {
    let s = DEFAULT_START_MIN;
    let e = DEFAULT_END_MIN;
    for (const it of items) {
      s = Math.min(s, Math.floor(toMin(it.startTime) / 60) * 60);
      e = Math.max(e, Math.ceil(toMin(it.endTime) / 60) * 60);
    }
    return [s, e];
  }, [items]);

  const totalHeight = (endMin - startMin) * PX_PER_MIN;
  const gridCols = `${TIME_COL_PX}px repeat(${weekDays.length}, 1fr)`;

  // Group buổi theo ngày (YYYY-MM-DD).
  const byDay = useMemo(() => {
    const m = new Map<string, TimetableItem[]>();
    for (const it of items) {
      const arr = m.get(it.date) ?? [];
      arr.push(it);
      m.set(it.date, arr);
    }
    return m;
  }, [items]);

  const slotLabels = useMemo(() => {
    const arr: number[] = [];
    for (let t = startMin; t <= endMin; t += SLOT_MIN) arr.push(t);
    return arr;
  }, [startMin, endMin]);

  if (!items.length) {
    return (
      <div className={styles.empty}>
        <Empty description="Không có buổi học trong khoảng này" />
      </div>
    );
  }

  const colorForItem = (it: TimetableItem): string | undefined => {
    if (view !== 'PARENT' || !childColorIndex || it.studentId == null) {
      return undefined;
    }
    const idx = childColorIndex[it.studentId];
    return idx == null ? undefined : CHILD_COLORS[idx % CHILD_COLORS.length];
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.header} style={{ gridTemplateColumns: gridCols }}>
        <div className={cx(styles.headCell, styles.headTime)}>Giờ</div>
        {weekDays.map((d) => {
          const ymd = d.format('YYYY-MM-DD');
          const isToday = ymd === today;
          const isWeekend = d.day() === 0; // Chủ nhật
          return (
            <div
              key={ymd}
              className={cx(
                styles.headCell,
                isToday && styles.todayHead,
                isWeekend && styles.weekendHead,
              )}
            >
              {VI_DOW[(d.day() + 6) % 7]} {d.format('DD/MM')}
            </div>
          );
        })}
      </div>

      <div className={styles.body} style={{ gridTemplateColumns: gridCols }}>
        {/* Cột giờ */}
        <div className={styles.timeCol} style={{ height: totalHeight }}>
          {slotLabels.map((t) => (
            <span
              key={t}
              className={styles.timeLabel}
              style={{ top: (t - startMin) * PX_PER_MIN }}
            >
              {String(Math.floor(t / 60)).padStart(2, '0')}:
              {String(t % 60).padStart(2, '0')}
            </span>
          ))}
        </div>

        {/* Cột ngày */}
        {weekDays.map((d) => {
          const ymd = d.format('YYYY-MM-DD');
          const isToday = ymd === today;
          const isWeekend = d.day() === 0;
          const dayItems = byDay.get(ymd) ?? [];
          const placed = layoutDay(dayItems);
          return (
            <div
              key={ymd}
              className={cx(
                styles.dayCol,
                isToday && styles.todayCol,
                isWeekend && styles.weekendCol,
              )}
              style={{ height: totalHeight }}
            >
              {slotLabels.map((t) => (
                <div
                  key={t}
                  className={styles.gridLine}
                  style={{ top: (t - startMin) * PX_PER_MIN }}
                />
              ))}
              {placed.map(({ item, col, cols }) => {
                const top = (toMin(item.startTime) - startMin) * PX_PER_MIN;
                const height = Math.max(
                  (toMin(item.endTime) - toMin(item.startTime)) * PX_PER_MIN,
                  22,
                );
                const widthPct = 100 / cols;
                const cancelled = item.status === 'CANCELLED';
                const childColor = colorForItem(item);
                const att =
                  (view === 'STUDENT' || view === 'PARENT') &&
                  item.attendanceStatus
                    ? ATT_BADGE[item.attendanceStatus]
                    : undefined;
                const title = `${item.subjectName ?? item.className}${item.gradeLevel ? ` ${item.gradeLevel}` : ''}`;
                return (
                  <Tooltip
                    key={item.sessionId}
                    title={`${title} · ${hhmm(item.startTime)}–${hhmm(item.endTime)}${item.roomName ? ` · ${item.roomName}` : ''}${cancelled ? ' · Đã hủy' : ''}`}
                  >
                    <button
                      type="button"
                      className={cx(
                        styles.card,
                        cancelled && styles.cardCancelled,
                      )}
                      style={{
                        top,
                        height,
                        left: `calc(${col * widthPct}% + 2px)`,
                        width: `calc(${widthPct}% - 4px)`,
                        ...(childColor
                          ? {
                              borderLeft: `4px solid ${childColor}`,
                              background: `${childColor}1a`,
                            }
                          : {}),
                      }}
                      onClick={() => onClickSession(item)}
                    >
                      <div className={styles.cardTitle}>
                        {title}
                        {cancelled && (
                          <Tag
                            color="error"
                            style={{ marginInlineStart: 4, lineHeight: '14px' }}
                          >
                            HỦY
                          </Tag>
                        )}
                        {att && (
                          <Tag
                            color={att.color}
                            style={{ marginInlineStart: 4, lineHeight: '14px' }}
                          >
                            {att.icon}
                          </Tag>
                        )}
                      </div>
                      <div className={styles.cardLine}>
                        {hhmm(item.startTime)}–{hhmm(item.endTime)}
                      </div>
                      {height > 50 && (
                        <div className={styles.cardLine}>
                          <EnvironmentOutlined />{' '}
                          {item.roomName ?? 'Chưa xếp phòng'}
                        </div>
                      )}
                      {height > 68 && (
                        <div className={styles.cardLine}>
                          <UserOutlined /> {item.teacherName ?? '—'}
                        </div>
                      )}
                    </button>
                  </Tooltip>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default WeekGrid;
