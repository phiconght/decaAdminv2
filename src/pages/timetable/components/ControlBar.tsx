import { LeftOutlined, RightOutlined } from '@ant-design/icons';
import {
  Badge,
  Button,
  Flex,
  Segmented,
  Select,
  Space,
  Typography,
} from 'antd';
import type { Dayjs } from 'dayjs';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import type {
  BranchOption,
  CalendarMode,
  ChildRef,
  RefOption,
  TimetableView,
} from '../data';
import {
  queryBranches,
  queryRoomsByBranch,
  queryUserOptions,
} from '../service';
import { CHILD_COLORS } from './WeekGrid';

type Props = {
  view: TimetableView;
  mode: CalendarMode;
  refId?: number;
  branchId?: number;
  anchorDate: Dayjs;
  // Khóa bộ chọn refId (TEACHER tự xem / HV / PH) — chỉ hiển thị label, không đổi.
  refLocked?: boolean;
  refLockedLabel?: string;
  availableViews: TimetableView[];
  // view PARENT
  childList?: ChildRef[];
  childColorIndex?: Record<number, number>;
  onViewChange: (v: TimetableView) => void;
  onModeChange: (m: CalendarMode) => void;
  onRefChange: (id?: number) => void;
  onBranchChange: (id?: number) => void;
  onNavigate: (dir: -1 | 0 | 1) => void; // 0 = về hôm nay/tuần này
};

const VIEW_LABELS: Record<TimetableView, string> = {
  STUDENT: 'Học viên',
  TEACHER: 'Giáo viên',
  ROOM: 'Phòng',
  PARENT: 'Phụ huynh',
};

const USER_ROLE: Record<
  'STUDENT' | 'TEACHER' | 'PARENT',
  'STUDENT' | 'TEACHER' | 'PARENT'
> = { STUDENT: 'STUDENT', TEACHER: 'TEACHER', PARENT: 'PARENT' };

const ControlBar: React.FC<Props> = ({
  view,
  mode,
  refId,
  branchId,
  anchorDate,
  refLocked,
  refLockedLabel,
  availableViews,
  childList,
  childColorIndex,
  onViewChange,
  onModeChange,
  onRefChange,
  onBranchChange,
  onNavigate,
}) => {
  const [options, setOptions] = useState<RefOption[]>([]);
  const [optLoading, setOptLoading] = useState(false);
  const [branches, setBranches] = useState<BranchOption[]>([]);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Tải danh sách cơ sở 1 lần (cho view ROOM + lọc).
  useEffect(() => {
    queryBranches()
      .then(setBranches)
      .catch(() => setBranches([]));
  }, []);

  // Tải option refId theo view.
  const loadOptions = (keyword?: string) => {
    setOptLoading(true);
    const p =
      view === 'ROOM'
        ? branchId
          ? queryRoomsByBranch(branchId)
          : Promise.resolve<RefOption[]>([])
        : queryUserOptions(
            USER_ROLE[view as 'STUDENT' | 'TEACHER' | 'PARENT'],
            keyword,
          );
    p.then(setOptions)
      .catch(() => setOptions([]))
      .finally(() => setOptLoading(false));
  };

  // Khi đổi view / branch (view ROOM) → nạp lại option.
  useEffect(() => {
    if (refLocked) return;
    setOptions([]);
    if (view === 'ROOM' && !branchId) return;
    loadOptions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view, branchId, refLocked]);

  const onSearch = (kw: string) => {
    if (view === 'ROOM') return; // phòng load theo cơ sở, lọc client
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => loadOptions(kw), 300);
  };

  const periodLabel = useMemo(() => {
    if (mode === 'DAY') return anchorDate.format('DD/MM/YYYY');
    const start = anchorDate.startOf('isoWeek');
    const end = anchorDate.endOf('isoWeek');
    return `${start.format('DD/MM')}–${end.format('DD/MM/YYYY')}`;
  }, [anchorDate, mode]);

  const todayLabel = mode === 'DAY' ? 'Hôm nay' : 'Tuần này';
  const refPlaceholder =
    view === 'ROOM'
      ? branchId
        ? 'Chọn phòng'
        : 'Chọn cơ sở trước'
      : `Chọn ${VIEW_LABELS[view].toLowerCase()}`;

  return (
    <Flex vertical gap={12}>
      <Flex wrap gap={12} align="center">
        <Segmented<TimetableView>
          value={view}
          onChange={onViewChange}
          options={availableViews.map((v) => ({
            label: VIEW_LABELS[v],
            value: v,
          }))}
        />
        {/* view ROOM: chọn cơ sở trước → nạp phòng */}
        {view === 'ROOM' && (
          <Select<number>
            placeholder="Chọn cơ sở"
            style={{ minWidth: 200 }}
            allowClear
            value={branchId}
            options={branches}
            onChange={(v) => {
              onBranchChange(v);
              onRefChange(undefined);
            }}
            showSearch={{
              filterOption: (input, option) =>
                String(option?.label ?? '')
                  .toLowerCase()
                  .includes(input.toLowerCase()),
            }}
          />
        )}
        {refLocked ? (
          <Typography.Text strong style={{ minWidth: 200 }}>
            {refLockedLabel}
          </Typography.Text>
        ) : (
          <Select<number>
            placeholder={refPlaceholder}
            style={{ minWidth: 260 }}
            allowClear
            showSearch={{
              onSearch,
              filterOption:
                view === 'ROOM'
                  ? (input, option) =>
                      String(option?.label ?? '')
                        .toLowerCase()
                        .includes(input.toLowerCase())
                  : false,
            }}
            value={refId}
            loading={optLoading}
            options={options}
            disabled={view === 'ROOM' && !branchId}
            onChange={onRefChange}
            notFoundContent={optLoading ? 'Đang tải...' : 'Không có dữ liệu'}
          />
        )}
        {/* view khác ROOM: lọc cơ sở (optional) */}
        {view !== 'ROOM' && (
          <Select<number>
            placeholder="Cơ sở (tất cả)"
            style={{ minWidth: 180 }}
            allowClear
            value={branchId}
            options={branches}
            onChange={onBranchChange}
            showSearch={{
              filterOption: (input, option) =>
                String(option?.label ?? '')
                  .toLowerCase()
                  .includes(input.toLowerCase()),
            }}
          />
        )}
      </Flex>

      <Flex wrap gap={12} align="center" justify="space-between">
        <Segmented<CalendarMode>
          value={mode}
          onChange={onModeChange}
          options={[
            { label: 'Ngày', value: 'DAY' },
            { label: 'Tuần', value: 'WEEK' },
          ]}
        />
        <Space>
          <Button
            icon={<LeftOutlined />}
            onClick={() => onNavigate(-1)}
            aria-label="Trước"
          />
          <Button onClick={() => onNavigate(0)}>{todayLabel}</Button>
          <Button
            icon={<RightOutlined />}
            onClick={() => onNavigate(1)}
            aria-label="Sau"
          />
          <Typography.Text strong>{periodLabel}</Typography.Text>
        </Space>
      </Flex>

      {/* Chú thích màu con (view PARENT) */}
      {view === 'PARENT' && childList && childList.length > 0 && (
        <Space wrap>
          {childList.map((c) => (
            <Badge
              key={c.id}
              color={
                CHILD_COLORS[
                  (childColorIndex?.[c.id] ?? 0) % CHILD_COLORS.length
                ]
              }
              text={c.fullName || c.username}
            />
          ))}
        </Space>
      )}
    </Flex>
  );
};

export default ControlBar;
