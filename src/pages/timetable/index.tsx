import { PageContainer, ProCard } from '@ant-design/pro-components';
import { useModel } from '@umijs/max';
import { Alert, Button, Empty, Spin } from 'antd';
import dayjs, { type Dayjs } from 'dayjs';
import isoWeek from 'dayjs/plugin/isoWeek';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import ControlBar from './components/ControlBar';
import SessionDrawer from './components/SessionDrawer';
import WeekGrid from './components/WeekGrid';
import type {
  CalendarMode,
  ChildRef,
  TimetableItem,
  TimetableView,
} from './data';
import { queryChildren, queryTimetable } from './service';

dayjs.extend(isoWeek);

// Suy view khả dụng + view mặc định + có khóa refId không, từ role hiện tại.
function deriveAccess(roles: string[], userid?: string) {
  const isAdmin = roles.includes('ADMIN') || roles.includes('EMPLOYEE');
  const isTeacher = roles.includes('TEACHER');
  const refId = userid ? Number(userid) : undefined;

  if (isAdmin) {
    return {
      availableViews: [
        'STUDENT',
        'TEACHER',
        'ROOM',
        'PARENT',
      ] as TimetableView[],
      defaultView: 'STUDENT' as TimetableView,
      lockedRefId: undefined as number | undefined,
    };
  }
  if (isTeacher) {
    return {
      availableViews: ['TEACHER', 'ROOM'] as TimetableView[],
      defaultView: 'TEACHER' as TimetableView,
      lockedRefId: refId,
    };
  }
  if (roles.includes('PARENT')) {
    return {
      availableViews: ['PARENT'] as TimetableView[],
      defaultView: 'PARENT' as TimetableView,
      lockedRefId: refId,
    };
  }
  // HV hoặc role khác → chỉ xem chính mình
  return {
    availableViews: ['STUDENT'] as TimetableView[],
    defaultView: 'STUDENT' as TimetableView,
    lockedRefId: refId,
  };
}

const TimetablePage: React.FC = () => {
  const { initialState } = useModel('@@initialState');
  const currentUser = initialState?.currentUser as
    | (API.CurrentUser & { roles?: string[] })
    | undefined;
  const roles = useMemo(() => currentUser?.roles ?? [], [currentUser]);
  const cfg = useMemo(
    () => deriveAccess(roles, currentUser?.userid),
    [roles, currentUser?.userid],
  );

  // refId bị khóa khi currentUser là TEACHER tự-xem / HV / PH (không phải admin).
  const refLocked = cfg.lockedRefId != null;

  const [view, setView] = useState<TimetableView>(cfg.defaultView);
  const [mode, setMode] = useState<CalendarMode>('WEEK');
  const [anchorDate, setAnchorDate] = useState<Dayjs>(dayjs());
  // refId khóa được prefill ngay (TEACHER/HV/PH tự xem); view mặc định không phải ROOM.
  const [refId, setRefId] = useState<number | undefined>(
    refLocked && cfg.defaultView !== 'ROOM' ? cfg.lockedRefId : undefined,
  );
  const [branchId, setBranchId] = useState<number | undefined>(undefined);

  const [items, setItems] = useState<TimetableItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [drawerItem, setDrawerItem] = useState<TimetableItem | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // view PARENT: con + map màu.
  const [children, setChildren] = useState<ChildRef[]>([]);
  const childColorIndex = useMemo(() => {
    const m: Record<number, number> = {};
    children.forEach((c, i) => {
      m[c.id] = i;
    });
    return m;
  }, [children]);

  const reqIdRef = useRef(0);

  // Tính from/to theo mode + anchorDate.
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

  // Tải lưới khi đủ điều kiện (có refId).
  useEffect(() => {
    if (refId == null) {
      setItems([]);
      setError(null);
      return;
    }
    const myReq = ++reqIdRef.current;
    setLoading(true);
    setError(null);
    queryTimetable({ view, refId, from, to, branchId })
      .then((data) => {
        if (myReq !== reqIdRef.current) return; // race: bỏ response cũ
        setItems(data);
      })
      .catch((e: { response?: { status?: number } }) => {
        if (myReq !== reqIdRef.current) return;
        setItems([]);
        setError(
          e?.response?.status === 403
            ? 'Bạn không có quyền xem lịch của đối tượng này'
            : 'Không tải được thời khóa biểu',
        );
      })
      .finally(() => {
        if (myReq === reqIdRef.current) setLoading(false);
      });
  }, [view, refId, from, to, branchId]);

  // view PARENT: nạp con khi chọn PH.
  useEffect(() => {
    if (view !== 'PARENT' || refId == null) {
      setChildren([]);
      return;
    }
    queryChildren(refId)
      .then(setChildren)
      .catch(() => setChildren([]));
  }, [view, refId]);

  const handleViewChange = (v: TimetableView) => {
    setView(v);
    setItems([]);
    setError(null);
    if (refLocked && v !== 'ROOM') {
      setRefId(cfg.lockedRefId);
    } else {
      setRefId(undefined);
    }
    if (v !== 'ROOM') setBranchId(undefined);
  };

  const handleNavigate = (dir: -1 | 0 | 1) => {
    if (dir === 0) {
      setAnchorDate(dayjs());
      return;
    }
    const unit = mode === 'DAY' ? 'day' : 'week';
    setAnchorDate((prev) => prev.add(dir, unit));
  };

  const lockedLabel = refLocked ? currentUser?.name : undefined;

  return (
    <PageContainer>
      <ProCard style={{ marginBottom: 16 }}>
        <ControlBar
          view={view}
          mode={mode}
          refId={refId}
          branchId={branchId}
          anchorDate={anchorDate}
          refLocked={refLocked && view !== 'ROOM'}
          refLockedLabel={lockedLabel}
          availableViews={cfg.availableViews}
          childList={children}
          childColorIndex={childColorIndex}
          onViewChange={handleViewChange}
          onModeChange={setMode}
          onRefChange={setRefId}
          onBranchChange={setBranchId}
          onNavigate={handleNavigate}
        />
      </ProCard>

      <ProCard>
        {refId == null ? (
          <Empty
            style={{ padding: '48px 0' }}
            description={
              view === 'PARENT'
                ? 'Hãy chọn phụ huynh để xem lịch'
                : view === 'ROOM'
                  ? 'Hãy chọn phòng để xem lịch'
                  : 'Hãy chọn đối tượng để xem lịch'
            }
          />
        ) : error ? (
          <Alert
            type="error"
            showIcon
            title={error}
            action={
              <Button
                size="small"
                onClick={() => setAnchorDate((d) => d.clone())}
              >
                Thử lại
              </Button>
            }
          />
        ) : view === 'PARENT' && refId != null && children.length === 0 ? (
          <Empty
            style={{ padding: '48px 0' }}
            description="Phụ huynh chưa liên kết học viên nào"
          />
        ) : (
          <Spin spinning={loading}>
            <WeekGrid
              items={items}
              weekDays={weekDays}
              view={view}
              childColorIndex={childColorIndex}
              onClickSession={(it) => {
                setDrawerItem(it);
                setDrawerOpen(true);
              }}
            />
          </Spin>
        )}
      </ProCard>

      <SessionDrawer
        item={drawerItem}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      />
    </PageContainer>
  );
};

export default TimetablePage;
