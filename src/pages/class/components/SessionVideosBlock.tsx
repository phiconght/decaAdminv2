import { Button, message, Select, Spin } from 'antd';
import React, { useEffect, useState } from 'react';
import {
  querySubjects,
  queryTopicsBySubject,
  quickSearchLectureVideos,
} from '../../video/service';
import type { SessionVideoItem } from '../schedule.data';
import { assignSessionVideos, listSessionVideos } from '../schedule.service';

type Props = {
  sessionId: number;
};

type Option = { label: string; value: number };

// Khối "Video bài giảng" trong SessionEditModal — chọn (nhiều) từ kho video có
// sẵn, lưu ngay bằng nút riêng (khác nút "Lưu" chính của modal — video/zoom là
// nội dung, không phải lịch). Xem SPEC_VideoBaiGiang_Zoom.md §4.2.
// Có thêm bộ lọc Khối lớp (Môn học) / Chương học để thu hẹp kết quả tìm kiếm,
// khớp với cách video được gắn Môn/Chuyên đề lúc tạo (VideoForm.tsx).
const SessionVideosBlock: React.FC<Props> = ({ sessionId }) => {
  const [messageApi, contextHolder] = message.useMessage();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selected, setSelected] = useState<number[]>([]);
  const [options, setOptions] = useState<Option[]>([]);
  const [searching, setSearching] = useState(false);
  const [keyword, setKeyword] = useState('');
  const [subjectOptions, setSubjectOptions] = useState<Option[]>([]);
  const [topicOptions, setTopicOptions] = useState<Option[]>([]);
  const [subjectId, setSubjectId] = useState<number | undefined>(undefined);
  const [topicId, setTopicId] = useState<number | undefined>(undefined);

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

  // Danh sách Môn học (khối lớp) cho bộ lọc — tải 1 lần.
  useEffect(() => {
    querySubjects().then((subjects) => {
      setSubjectOptions(
        subjects.map((s) => ({
          label: `${s.name} — ${s.gradeLevel}`,
          value: s.id,
        })),
      );
    });
  }, []);

  // Danh sách Chương học phụ thuộc Môn đã chọn.
  useEffect(() => {
    if (!subjectId) {
      setTopicOptions([]);
      return;
    }
    let cancelled = false;
    queryTopicsBySubject(subjectId).then((topics) => {
      if (!cancelled) {
        setTopicOptions(topics.map((t) => ({ label: t.name, value: t.id })));
      }
    });
    return () => {
      cancelled = true;
    };
  }, [subjectId]);

  const runSearch = async (q: string, filterTopicId?: number) => {
    setSearching(true);
    try {
      const found = await quickSearchLectureVideos(q, filterTopicId);
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

  const handleSearch = (q: string) => {
    setKeyword(q);
    runSearch(q, topicId);
  };

  const handleSubjectChange = (val?: number) => {
    setSubjectId(val);
    setTopicId(undefined);
    runSearch(keyword, undefined);
  };

  const handleTopicChange = (val?: number) => {
    setTopicId(val);
    runSearch(keyword, val);
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
      <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
        <Select
          allowClear
          showSearch
          placeholder="Lọc theo khối lớp / môn"
          style={{ flex: 1 }}
          options={subjectOptions}
          value={subjectId}
          filterOption={(input, option) =>
            String(option?.label ?? '')
              .toLowerCase()
              .includes(input.toLowerCase())
          }
          onChange={handleSubjectChange}
        />
        <Select
          allowClear
          showSearch
          placeholder="Lọc theo chương học"
          style={{ flex: 1 }}
          options={topicOptions}
          value={topicId}
          disabled={!subjectId}
          filterOption={(input, option) =>
            String(option?.label ?? '')
              .toLowerCase()
              .includes(input.toLowerCase())
          }
          onChange={handleTopicChange}
        />
      </div>
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
