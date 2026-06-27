import { LeftOutlined, RightOutlined } from '@ant-design/icons';
import {
  Button,
  Drawer,
  Empty,
  Flex,
  Segmented,
  Space,
  Spin,
  Tag,
  Typography,
} from 'antd';
import dayjs, { type Dayjs } from 'dayjs';
import isoWeek from 'dayjs/plugin/isoWeek';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import type { CalendarMode, ChildRef, TimetableItem } from '../data';
import { queryChildren, queryTimetable } from '../service';
import SessionDrawer from './SessionDrawer';
import WeekGrid, { CHILD_COLORS } from './WeekGrid';

dayjs.extend(isoWeek);

type Props = {
  open: boolean;
  onClose: () => void;
  /** Góc nhìn cố định: lịch dạy GV / lịch học HV / lịch các con của PH. */
  view: 'TEACHER' | 'STUDENT' | 'PARENT';
  /** id user (giáo viên / học viên / phụ huynh). */
  refId?: number;
  title?: string;
};

/**
 * Drawer thời khóa biểu nhúng (dùng lại WeekGrid + SessionDrawer của module timetable)
 * cho 1 đối tượng cố định — gắn vào nút "Lịch dạy" (GV) / "Lịch học" (HV) / "Lịch học" (PH→các con).
 */
const TimetableDrawer: React.FC<Props> = ({
  open,
  onClose,
  view,
  refId,
  title,
}) => {
  const [mode, setMode] = useState<CalendarMode>('WEEK');
  const [anchorDate, setAnchorDate] = useState<Dayjs>(dayjs());
  const [items, setItems] = useState<TimetableItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [children, setChildren] = useState<ChildRef[]>([]);
  const [detailItem, setDetailItem] = useState<TimetableItem | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const reqIdRef = useRef(0);

  // Mỗi lần mở: về tuần hiện tại.
  useEffect(() => {
    if (open) {
      setAnchorDate(dayjs());
      setMode('WEEK');
    }
  }, [open]);

  // view PARENT: nạp danh sách con để tô màu theo con.
  useEffect(() => {
    if (!open || view !== 'PARENT' || refId == null) {
      setChildren([]);
      return;
    }
    queryChildren(refId)
      .then(setChildren)
      .catch(() => setChildren([]));
  }, [open, view, refId]);

  const childColorIndex = useMemo(() => {
    const m: Record<number, number> = {};
    children.forEach((c, i) => {
      m[c.id] = i;
    });
    return m;
  }, [children]);

  const [from, to, weekDays] = useMemo<[string, string, Dayjs[]]>(() => {
    if (mode === 'DAY') {
      const d = anchorDate.format('YYYY-MM-DD');
      return [d, d, [anchorDate]];
    }
    const start = anchorDate.startOf('isoWeek');
    const end = anchorDate.endOf('isoWeek');
    const days = Array.from({ length: 7 }, (_, i) => start.add(i, 'day'));
    return [start.format('YYYY-MM-DD'), end.format('YYYY-MM-DD'), days];
  }, [mode, anchorDate]);

  useEffect(() => {
    if (!open || refId == null) {
      setItems([]);
      return;
    }
    const myReq = ++reqIdRef.current;
    setLoading(true);
    queryTimetable({ view, refId, from, to })
      .then((data) => {
        if (myReq === reqIdRef.current) setItems(data);
      })
      .catch(() => {
        if (myReq === reqIdRef.current) setItems([]);
      })
      .finally(() => {
        if (myReq === reqIdRef.current) setLoading(false);
      });
  }, [open, view, refId, from, to]);

  const navigate = (dir: -1 | 0 | 1) => {
    if (dir === 0) {
      setAnchorDate(dayjs());
      return;
    }
    setAnchorDate((p) => p.add(dir, mode === 'DAY' ? 'day' : 'week'));
  };

  const rangeLabel =
    mode === 'DAY'
      ? anchorDate.format('DD/MM/YYYY')
      : `${weekDays[0].format('DD/MM')} – ${weekDays[6].format('DD/MM/YYYY')}`;

  const noChildren =
    view === 'PARENT' && refId != null && children.length === 0;

  return (
    <Drawer
      title={title ?? 'Thời khóa biểu'}
      open={open}
      onClose={onClose}
      destroyOnHidden
    >
      <Flex
        justify="space-between"
        align="center"
        wrap
        gap="small"
        style={{ marginBottom: 12 }}
      >
        <Space>
          <Button icon={<LeftOutlined />} onClick={() => navigate(-1)} />
          <Button onClick={() => navigate(0)}>Hôm nay</Button>
          <Button icon={<RightOutlined />} onClick={() => navigate(1)} />
          <Typography.Text strong>{rangeLabel}</Typography.Text>
        </Space>
        <Segmented<CalendarMode>
          value={mode}
          onChange={setMode}
          options={[
            { label: 'Tuần', value: 'WEEK' },
            { label: 'Ngày', value: 'DAY' },
          ]}
        />
      </Flex>

      {view === 'PARENT' && children.length > 0 && (
        <Space wrap style={{ marginBottom: 12 }}>
          {children.map((c, i) => (
            <Tag key={c.id} color={CHILD_COLORS[i % CHILD_COLORS.length]}>
              {c.fullName || c.username}
            </Tag>
          ))}
        </Space>
      )}

      {refId == null ? (
        <Empty description="Không xác định đối tượng" />
      ) : noChildren ? (
        <Empty description="Phụ huynh chưa liên kết học viên nào" />
      ) : (
        <Spin spinning={loading}>
          <WeekGrid
            items={items}
            weekDays={weekDays}
            view={view}
            childColorIndex={view === 'PARENT' ? childColorIndex : undefined}
            onClickSession={(it) => {
              setDetailItem(it);
              setDetailOpen(true);
            }}
          />
        </Spin>
      )}

      <SessionDrawer
        item={detailItem}
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
      />
    </Drawer>
  );
};

export default TimetableDrawer;
