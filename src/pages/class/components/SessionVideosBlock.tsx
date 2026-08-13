import { Button, message, Select, Spin } from 'antd';
import React, { useEffect, useState } from 'react';
import { quickSearchLectureVideos } from '../../video/service';
import type { SessionVideoItem } from '../schedule.data';
import { assignSessionVideos, listSessionVideos } from '../schedule.service';

type Props = {
  sessionId: number;
};

type Option = { label: string; value: number };

// Khối "Video bài giảng" trong SessionEditModal — chọn (nhiều) từ kho video có
// sẵn, lưu ngay bằng nút riêng (khác nút "Lưu" chính của modal — video/zoom là
// nội dung, không phải lịch). Xem SPEC_VideoBaiGiang_Zoom.md §4.2.
const SessionVideosBlock: React.FC<Props> = ({ sessionId }) => {
  const [messageApi, contextHolder] = message.useMessage();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selected, setSelected] = useState<number[]>([]);
  const [options, setOptions] = useState<Option[]>([]);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    listSessionVideos(sessionId)
      .then((res) => {
        if (cancelled) return;
        const items = res.data ?? [];
        setSelected(items.map((v) => v.videoId));
        setOptions(
          items.map((v: SessionVideoItem) => ({
            label: v.title,
            value: v.videoId,
          })),
        );
      })
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [sessionId]);

  const handleSearch = async (q: string) => {
    setSearching(true);
    try {
      const found = await quickSearchLectureVideos(q);
      // Giữ lại option đã chọn (không nằm trong kết quả tìm mới) để không mất selection.
      setOptions((prev) => {
        const kept = prev.filter((o) => selected.includes(o.value));
        const merged = [...kept];
        for (const v of found) {
          if (!merged.some((o) => o.value === v.id)) {
            merged.push({ label: v.title, value: v.id });
          }
        }
        return merged;
      });
    } finally {
      setSearching(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await assignSessionVideos(sessionId, selected);
      messageApi.success('Đã lưu danh sách video của buổi.');
    } catch {
      messageApi.error('Lưu video thất bại, thử lại.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Spin size="small" />;

  return (
    <div>
      {contextHolder}
      <Select
        mode="multiple"
        style={{ width: '100%' }}
        placeholder="Tìm và chọn video trong kho"
        value={selected}
        options={options}
        filterOption={false}
        notFoundContent={searching ? <Spin size="small" /> : null}
        onSearch={handleSearch}
        onChange={(vals: number[]) => setSelected(vals)}
      />
      <div style={{ marginTop: 8, textAlign: 'right' }}>
        <Button
          size="small"
          type="primary"
          loading={saving}
          onClick={handleSave}
        >
          Lưu video
        </Button>
      </div>
    </div>
  );
};

export default SessionVideosBlock;
