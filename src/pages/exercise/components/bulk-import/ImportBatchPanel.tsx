import { Button, Checkbox, message, Popconfirm, Space, Tag, theme } from 'antd';
import React, { useState } from 'react';
import { MathPreview } from '@/components';
import type {
  ChoiceOption,
  ExerciseDetail,
  ExerciseDetailView,
  ImportBatchDetail,
  TrueFalseItem,
} from '../../data';
import {
  confirmExercise,
  confirmExercisesBatch,
  restoreExercise,
  updateExercise,
  updateExerciseStatus,
} from '../../service';
import { EXERCISE_STATUS_META } from '../../statusMeta';
import CreateExerciseForm from '../CreateExerciseForm';
import ImageUpload from '../ImageUpload';
import { uploadIfDataUrl } from '../imageUpload.utils';

const TYPE_LABELS: Record<string, string> = {
  MULTIPLE_CHOICE: 'Trắc nghiệm',
  ESSAY: 'Tự luận',
  TRUE_FALSE: 'Đúng/Sai',
};

type Props = {
  batch: ImportBatchDetail;
  onRefresh: () => void;
  onChanged: () => void;
};

/** Xay payload PUT day du tu 1 ExerciseDetailView + phan patch can doi. */
function toUpdatePayload(
  ex: ExerciseDetailView,
  patch: Partial<ExerciseDetail>,
): ExerciseDetail {
  return {
    title: ex.title,
    subjectId: ex.subjectId,
    topicId: ex.topicId,
    difficulty: ex.difficulty,
    status: ex.status,
    type: ex.type,
    questionText: ex.questionText,
    questionImage: ex.questionImage,
    options: ex.options,
    essayAnswer: ex.essayAnswer,
    essayAnswerImage: ex.essayAnswerImage,
    trueFalseItems: ex.trueFalseItems,
    ...patch,
  };
}

/** Khung hien 1 dap an trac nghiem/dung-sai, danh dau dung/sai bang mau. */
const AnswerBadge: React.FC<{ correct: boolean; label: string }> = ({
  correct,
  label,
}) => {
  const { token } = theme.useToken();
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: 28,
        height: 28,
        padding: '0 6px',
        borderRadius: token.borderRadius,
        fontWeight: 600,
        fontSize: 13,
        flexShrink: 0,
        background: correct ? token.colorSuccessBg : token.colorFillTertiary,
        color: correct ? token.colorSuccess : token.colorTextSecondary,
        border: correct
          ? `1.5px solid ${token.colorSuccess}`
          : `1px solid ${token.colorBorder}`,
      }}
    >
      {label}
    </span>
  );
};

const ImportBatchPanel: React.FC<Props> = ({ batch, onRefresh, onChanged }) => {
  const [editId, setEditId] = useState<number | null>(null);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const { token } = theme.useToken();

  const refresh = () => {
    onRefresh();
    onChanged();
  };

  const toggleSelect = (id: number, checked: boolean) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });
  };

  const handleConfirm = async (id: number) => {
    try {
      await confirmExercise(id);
      message.success('Đã xác nhận');
      refresh();
    } catch {
      message.error('Xác nhận thất bại');
    }
  };

  const handleConfirmSelected = async () => {
    if (selected.size === 0) return;
    try {
      await confirmExercisesBatch(Array.from(selected));
      message.success(`Đã xác nhận ${selected.size} câu`);
      setSelected(new Set());
      refresh();
    } catch {
      message.error('Xác nhận thất bại');
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await updateExerciseStatus(id, 'DELETED');
      message.success('Đã xóa câu này khỏi lô');
      refresh();
    } catch {
      message.error('Xóa thất bại');
    }
  };

  const handleDeleteSelected = async () => {
    if (selected.size === 0) return;
    try {
      await Promise.all(
        Array.from(selected).map((id) => updateExerciseStatus(id, 'DELETED')),
      );
      message.success(`Đã xóa ${selected.size} câu`);
      setSelected(new Set());
      refresh();
    } catch {
      message.error('Xóa thất bại');
    }
  };

  const handleRestore = async (id: number) => {
    try {
      await restoreExercise(id);
      message.success('Đã khôi phục');
      refresh();
    } catch {
      message.error('Khôi phục thất bại — lô có thể đã hoàn tất');
    }
  };

  /** Upload 1 anh (data URL) len server roi PUT lai bai tap voi field anh da doi. */
  const persistImage = async (
    ex: ExerciseDetailView,
    dataUrl: string | undefined,
    fileName: string,
    buildPatch: (uploadedUrl: string | undefined) => Partial<ExerciseDetail>,
  ) => {
    try {
      const uploadedUrl = await uploadIfDataUrl(dataUrl, fileName);
      await updateExercise(ex.id, toUpdatePayload(ex, buildPatch(uploadedUrl)));
      refresh();
    } catch {
      message.error('Cập nhật ảnh thất bại');
    }
  };

  const handleQuestionImageChange = (
    ex: ExerciseDetailView,
    dataUrl?: string,
  ) => {
    if (!dataUrl) {
      updateExercise(ex.id, toUpdatePayload(ex, { questionImage: undefined }))
        .then(refresh)
        .catch(() => message.error('Xóa ảnh thất bại'));
      return;
    }
    persistImage(ex, dataUrl, 'question.png', (url) => ({
      questionImage: url,
    }));
  };

  const handleEssayImageChange = (ex: ExerciseDetailView, dataUrl?: string) => {
    if (!dataUrl) {
      updateExercise(
        ex.id,
        toUpdatePayload(ex, { essayAnswerImage: undefined }),
      )
        .then(refresh)
        .catch(() => message.error('Xóa ảnh thất bại'));
      return;
    }
    persistImage(ex, dataUrl, 'answer.png', (url) => ({
      essayAnswerImage: url,
    }));
  };

  const handleOptionImageChange = (
    ex: ExerciseDetailView,
    index: number,
    dataUrl?: string,
  ) => {
    const options = (ex.options ?? []).map((o, i) =>
      i === index ? { ...o, image: dataUrl } : o,
    );
    if (!dataUrl) {
      updateExercise(ex.id, toUpdatePayload(ex, { options }))
        .then(refresh)
        .catch(() => message.error('Xóa ảnh thất bại'));
      return;
    }
    persistImage(ex, dataUrl, `option_${index}.png`, (url) => ({
      options: (ex.options ?? []).map((o, i) =>
        i === index ? { ...o, image: url } : o,
      ),
    }));
  };

  const handleTfImageChange = (
    ex: ExerciseDetailView,
    index: number,
    dataUrl?: string,
  ) => {
    if (!dataUrl) {
      const trueFalseItems = (ex.trueFalseItems ?? []).map((t, i) =>
        i === index ? { ...t, image: undefined } : t,
      );
      updateExercise(ex.id, toUpdatePayload(ex, { trueFalseItems }))
        .then(refresh)
        .catch(() => message.error('Xóa ảnh thất bại'));
      return;
    }
    persistImage(ex, dataUrl, `tf_${index}.png`, (url) => ({
      trueFalseItems: (ex.trueFalseItems ?? []).map((t, i) =>
        i === index ? { ...t, image: url } : t,
      ),
    }));
  };

  const renderAnswer = (ex: ExerciseDetailView) => {
    if (ex.type === 'MULTIPLE_CHOICE') {
      const options: ChoiceOption[] = ex.options ?? [];
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {options.map((opt, i) => (
            <div
              key={`${opt.text}-${opt.isCorrect}`}
              style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}
            >
              <AnswerBadge
                correct={opt.isCorrect}
                label={String.fromCharCode(65 + i)}
              />
              <div style={{ flex: 1, paddingTop: 2 }}>
                <MathPreview content={opt.text} emptyText="—" />
              </div>
              <ImageUpload
                value={opt.image}
                onChange={(img) => handleOptionImageChange(ex, i, img)}
                compact
              />
            </div>
          ))}
        </div>
      );
    }
    if (ex.type === 'TRUE_FALSE') {
      const items: TrueFalseItem[] = ex.trueFalseItems ?? [];
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {items.map((item, i) => (
            <div
              key={`${item.text}-${item.answer}`}
              style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}
            >
              <AnswerBadge
                correct={item.answer}
                label={item.answer ? 'Đúng' : 'Sai'}
              />
              <div style={{ flex: 1, paddingTop: 2 }}>
                <MathPreview content={item.text} emptyText="—" />
              </div>
              <ImageUpload
                value={item.image}
                onChange={(img) => handleTfImageChange(ex, i, img)}
                compact
              />
            </div>
          ))}
        </div>
      );
    }
    // ESSAY
    return (
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
        <div style={{ flex: 1 }}>
          <MathPreview content={ex.essayAnswer} emptyText="Chưa có đáp án" />
        </div>
        <ImageUpload
          value={ex.essayAnswerImage}
          onChange={(img) => handleEssayImageChange(ex, img)}
          compact
        />
      </div>
    );
  };

  return (
    <div>
      <CreateExerciseForm
        editId={editId}
        open={editId !== null}
        onOpenChange={(o) => {
          if (!o) setEditId(null);
        }}
        onSuccess={() => {
          setEditId(null);
          refresh();
        }}
      />

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 12,
        }}
      >
        <div>
          <strong>{batch.sourceFileName}</strong>
          <span style={{ marginLeft: 8, color: 'rgba(0,0,0,0.45)' }}>
            {batch.confirmedCount}/{batch.totalCount} đã xác nhận
            {batch.examName ? ` · Đề thi: ${batch.examName}` : ''}
          </span>
        </div>
        <Space>
          <Popconfirm
            title={`Xác nhận ${selected.size} câu đã chọn?`}
            okText="Xác nhận"
            cancelText="Đóng"
            disabled={selected.size === 0}
            onConfirm={handleConfirmSelected}
          >
            <Button disabled={selected.size === 0}>Xác nhận đã chọn</Button>
          </Popconfirm>
          <Popconfirm
            title={`Xóa ${selected.size} câu đã chọn?`}
            okText="Xóa"
            cancelText="Đóng"
            disabled={selected.size === 0}
            onConfirm={handleDeleteSelected}
          >
            <Button danger disabled={selected.size === 0}>
              Xóa đã chọn
            </Button>
          </Popconfirm>
        </Space>
      </div>

      {batch.exercises.map((ex: ExerciseDetailView, idx: number) => {
        const isDeleted = ex.status === 'DELETED';
        const meta = EXERCISE_STATUS_META[ex.status];
        return (
          <div
            key={ex.id}
            style={{
              border: '1px solid #f0f0f0',
              borderRadius: 8,
              padding: 12,
              marginBottom: 10,
              opacity: isDeleted ? 0.5 : 1,
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                marginBottom: 8,
              }}
            >
              {!isDeleted && (
                <Checkbox
                  checked={selected.has(ex.id)}
                  onChange={(e) => toggleSelect(ex.id, e.target.checked)}
                />
              )}
              <strong>Bài {(ex.orderIndex ?? idx) + 1}</strong>
              <Tag>{TYPE_LABELS[ex.type] ?? ex.type}</Tag>
              <Tag
                color={meta.color}
                style={
                  isDeleted ? { textDecoration: 'line-through' } : undefined
                }
              >
                {meta.label}
              </Tag>
              <span style={{ marginLeft: 'auto' }}>
                {!isDeleted && (
                  <Space>
                    <a onClick={() => setEditId(ex.id)}>Sửa</a>
                    {ex.status === 'PENDING' && (
                      <a onClick={() => handleConfirm(ex.id)}>Xác nhận</a>
                    )}
                    <a
                      style={{ color: '#ff4d4f' }}
                      onClick={() => handleDelete(ex.id)}
                    >
                      Xóa
                    </a>
                  </Space>
                )}
                {isDeleted && (
                  <a onClick={() => handleRestore(ex.id)}>Khôi phục</a>
                )}
              </span>
            </div>

            {!isDeleted && (
              <>
                <div
                  style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}
                >
                  <div style={{ flex: 1 }}>
                    <MathPreview content={ex.questionText} />
                  </div>
                  <ImageUpload
                    value={ex.questionImage}
                    onChange={(img) => handleQuestionImageChange(ex, img)}
                    compact
                  />
                </div>

                <div
                  style={{
                    marginTop: 10,
                    paddingTop: 10,
                    borderTop: `1px dashed ${token.colorBorderSecondary}`,
                  }}
                >
                  <div
                    style={{
                      fontSize: 12,
                      color: token.colorTextSecondary,
                      marginBottom: 6,
                    }}
                  >
                    Đáp án
                  </div>
                  {renderAnswer(ex)}
                </div>
              </>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default ImportBatchPanel;
