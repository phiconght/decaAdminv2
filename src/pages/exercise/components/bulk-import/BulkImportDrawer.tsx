import { request } from '@umijs/max';
import { Drawer, Input, message, Select, Spin } from 'antd';
import React, { useRef, useState } from 'react';
import type { ImportBatchDetail } from '../../data';
import { getImportBatchDetail, importBatch } from '../../service';
import ImportBatchListPanel from './ImportBatchListPanel';
import ImportBatchPanel from './ImportBatchPanel';

type Props = {
  open: boolean;
  onClose: () => void;
  /** Bao cho trang cha (danh sach bai tap chinh + badge dem lo) can reload. */
  onChanged: () => void;
};

/**
 * Man "Thêm bài tập theo lô" — nhap tu file du lieu .json (Word -> AI boc
 * tach, ngoai he thong) — xem DESIGN_NhapBaiTapTheoLo.md muc 4 +
 * SPEC_NhapBaiTap_TuWord_QuaAI.md §6.
 */
const BulkImportDrawer: React.FC<Props> = ({ open, onClose, onChanged }) => {
  const [subjectId, setSubjectId] = useState<number | undefined>();
  const [topicId, setTopicId] = useState<number | undefined>();
  const [examName, setExamName] = useState('');
  const [uploading, setUploading] = useState(false);
  const [batch, setBatch] = useState<ImportBatchDetail | null>(null);
  const [batchListRefreshKey, setBatchListRefreshKey] = useState(0);
  const [loadingExisting, setLoadingExisting] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const pendingModeRef = useRef<'exercise' | 'exam'>('exercise');

  const reset = () => {
    setBatch(null);
    setSubjectId(undefined);
    setTopicId(undefined);
    setExamName('');
    setBatchListRefreshKey((k) => k + 1);
  };

  const openExistingBatch = (id: number) => {
    setLoadingExisting(true);
    getImportBatchDetail(id)
      .then((res) => setBatch(res.data))
      .catch(() => message.error('Không tải được lô đã chọn'))
      .finally(() => setLoadingExisting(false));
  };

  const triggerImport = (mode: 'exercise' | 'exam') => {
    if (!subjectId) {
      message.error('Chọn môn học trước khi nhập');
      return;
    }
    if (mode === 'exam' && !examName.trim()) {
      message.error('Nhập tên đề thi trước khi import đề thi');
      return;
    }
    pendingModeRef.current = mode;
    fileInputRef.current?.click();
  };

  const handleFileSelected: React.ChangeEventHandler<HTMLInputElement> = async (
    e,
  ) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file || !subjectId) return;
    setUploading(true);
    try {
      const res = await importBatch(
        file,
        subjectId,
        topicId,
        pendingModeRef.current === 'exam' ? examName.trim() : undefined,
      );
      setBatch(res.data);
      setBatchListRefreshKey((k) => k + 1);
      message.success('Đã nhập file — kiểm tra và xác nhận từng câu bên dưới');
      onChanged();
    } catch {
      message.error('Nhập file thất bại — kiểm tra lại định dạng file dữ liệu');
    } finally {
      setUploading(false);
    }
  };

  const refreshBatch = () => {
    if (!batch) return;
    getImportBatchDetail(batch.id).then((res) => setBatch(res.data));
  };

  return (
    <Drawer
      title="Thêm bài tập theo lô"
      width="90vw"
      open={open}
      onClose={onClose}
      destroyOnHidden
      afterOpenChange={(o) => {
        if (!o) reset();
      }}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        style={{ display: 'none' }}
        onChange={handleFileSelected}
      />
      <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start' }}>
        <div style={{ width: 260, flexShrink: 0 }}>
          <SubjectAndTopicFields
            subjectId={subjectId}
            topicId={topicId}
            disabled={!!batch}
            onSubjectChange={(v) => {
              setSubjectId(v);
              setTopicId(undefined);
            }}
            onTopicChange={setTopicId}
          />
          <div style={{ marginBottom: 12 }}>
            <div style={{ marginBottom: 4 }}>Tên đề thi</div>
            <Input
              placeholder="Chỉ cần khi Import Đề Thi"
              value={examName}
              disabled={!!batch}
              onChange={(e) => setExamName(e.target.value)}
            />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <a
              onClick={() => triggerImport('exercise')}
              style={{
                textAlign: 'center',
                padding: '8px 0',
                background: uploading ? '#f5f5f5' : '#1677ff',
                color: uploading ? 'rgba(0,0,0,0.25)' : '#fff',
                borderRadius: 6,
                pointerEvents: uploading || batch ? 'none' : undefined,
              }}
            >
              Import Bài Tập
            </a>
            <a
              onClick={() => triggerImport('exam')}
              style={{
                textAlign: 'center',
                padding: '8px 0',
                border: '1px solid #d9d9d9',
                borderRadius: 6,
                pointerEvents: uploading || batch ? 'none' : undefined,
              }}
            >
              Import Đề Thi
            </a>
          </div>
          {batch && (
            <a
              style={{ display: 'block', marginTop: 12, textAlign: 'center' }}
              onClick={reset}
            >
              ◀ Quay lại danh sách lô
            </a>
          )}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          {!batch ? (
            <Spin spinning={loadingExisting}>
              <div style={{ marginBottom: 8, color: 'rgba(0,0,0,0.45)' }}>
                Chọn Import Bài Tập/Import Đề Thi ở bên trái để nhập lô mới,
                hoặc chọn 1 lô bên dưới để tiếp tục duyệt:
              </div>
              <ImportBatchListPanel
                onSelect={openExistingBatch}
                refreshKey={batchListRefreshKey}
              />
            </Spin>
          ) : (
            <ImportBatchPanel
              batch={batch}
              onRefresh={refreshBatch}
              onChanged={onChanged}
            />
          )}
        </div>
      </div>
    </Drawer>
  );
};

/** Tach rieng vi request() cua @umijs/max chi goi duoc trong async function, khong the inline options tinh. */
const SubjectAndTopicFields: React.FC<{
  subjectId?: number;
  topicId?: number;
  disabled?: boolean;
  onSubjectChange: (v: number) => void;
  onTopicChange: (v: number | undefined) => void;
}> = ({ subjectId, topicId, disabled, onSubjectChange, onTopicChange }) => {
  const [subjects, setSubjects] = useState<{ label: string; value: number }[]>(
    [],
  );
  const [topics, setTopics] = useState<{ label: string; value: number }[]>([]);

  React.useEffect(() => {
    request('/api/v1/subjects', {
      params: { status: 'ACTIVE', pageSize: 100 },
    }).then((res) => {
      setSubjects(
        (res.data ?? []).map(
          (s: { id: number; name: string; gradeLevel: string }) => ({
            label: `${s.name} — ${s.gradeLevel}`,
            value: s.id,
          }),
        ),
      );
    });
  }, []);

  React.useEffect(() => {
    if (!subjectId) {
      setTopics([]);
      return;
    }
    request('/api/v1/topics', { params: { subjectId } }).then((res) => {
      setTopics(
        (res.data ?? []).map((t: { id: number; name: string }) => ({
          label: t.name,
          value: t.id,
        })),
      );
    });
  }, [subjectId]);

  return (
    <>
      <div style={{ marginBottom: 12 }}>
        <div style={{ marginBottom: 4 }}>Môn học *</div>
        <Select
          style={{ width: '100%' }}
          placeholder="Chọn môn học"
          showSearch
          value={subjectId}
          disabled={disabled}
          options={subjects}
          filterOption={(input, option) =>
            String(option?.label ?? '')
              .toLowerCase()
              .includes(input.toLowerCase())
          }
          onChange={onSubjectChange}
        />
      </div>
      <div style={{ marginBottom: 12 }}>
        <div style={{ marginBottom: 4 }}>Chuyên đề</div>
        <Select
          style={{ width: '100%' }}
          placeholder="Chọn chuyên đề (tùy chọn)"
          allowClear
          showSearch
          value={topicId}
          disabled={disabled || !subjectId}
          options={topics}
          filterOption={(input, option) =>
            String(option?.label ?? '')
              .toLowerCase()
              .includes(input.toLowerCase())
          }
          onChange={onTopicChange}
        />
      </div>
    </>
  );
};

export default BulkImportDrawer;
