import { PlusOutlined } from '@ant-design/icons';
import type { ProFormInstance } from '@ant-design/pro-components';
import {
  DrawerForm,
  ProForm,
  ProFormDependency,
  ProFormRadio,
  ProFormSelect,
  ProFormText,
  ProFormTextArea,
} from '@ant-design/pro-components';
import { request } from '@umijs/max';
import { Button, Divider, Form, message, Spin } from 'antd';
import React, { useEffect, useRef, useState } from 'react';
import { uploadFile } from '@/services/file';
import type { ChoiceOption, ExerciseDetail, TrueFalseItem } from '../data';
import { createExercise, getExerciseDetail, updateExercise } from '../service';
import ImageUpload from './ImageUpload';
import MultipleChoiceInput from './MultipleChoiceInput';
import TrueFalseInput from './TrueFalseInput';

// ── Upload-on-submit helpers ──────────────────────────────────────────────────

function dataUrlToFile(dataUrl: string, filename: string): File {
  const [header, b64] = dataUrl.split(',');
  const mime = header.match(/:(.*?);/)?.[1] ?? 'image/png';
  const bytes = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
  return new File([bytes], filename, { type: mime });
}

async function uploadIfDataUrl(
  value: string | undefined,
  name: string,
): Promise<string | undefined> {
  if (!value?.startsWith('data:')) return value;
  try {
    const res = await uploadFile(dataUrlToFile(value, name), 'exercise');
    return res.success ? res.data.url : value;
  } catch {
    return value;
  }
}

async function resolveImages(payload: ExerciseDetail): Promise<ExerciseDetail> {
  const [questionImage, essayAnswerImage] = await Promise.all([
    uploadIfDataUrl(payload.questionImage, 'question.png'),
    uploadIfDataUrl(payload.essayAnswerImage, 'answer.png'),
  ]);

  const options = payload.options
    ? await Promise.all(
        payload.options.map(async (o, i) => ({
          ...o,
          image: await uploadIfDataUrl(o.image, `option_${i}.png`),
        })),
      )
    : undefined;

  const trueFalseItems = payload.trueFalseItems
    ? await Promise.all(
        payload.trueFalseItems.map(async (t, i) => ({
          ...t,
          image: await uploadIfDataUrl(t.image, `tf_${i}.png`),
        })),
      )
    : undefined;

  return {
    ...payload,
    questionImage,
    essayAnswerImage,
    options,
    trueFalseItems,
  };
}

// ─────────────────────────────────────────────────────────────────────────────

type Props = {
  onSuccess?: () => void;
  /** Edit / view mode: fetch and populate form with this exercise's data */
  editId?: number | null;
  /** Controlled open state (required for edit mode; optional for create mode) */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Show form read-only (no save button, all fields disabled) */
  readOnly?: boolean;
  /**
   * Create mode only: lock the subject select to this subjectId.
   * Used when creating exercises from inside the exam editor so the
   * subject always matches the exam being edited.
   */
  lockedSubjectId?: number;
};

const emptyOptions: ChoiceOption[] = Array.from({ length: 4 }, () => ({
  text: '',
  isCorrect: false,
}));

const emptyTrueFalse: TrueFalseItem[] = Array.from({ length: 4 }, () => ({
  text: '',
  answer: true,
}));

const formatNow = () => {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `Bài tập ${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

const CreateExerciseForm: React.FC<Props> = ({
  onSuccess,
  editId,
  open,
  onOpenChange,
  readOnly = false,
  lockedSubjectId,
}) => {
  const [messageApi, contextHolder] = message.useMessage();
  const formRef = useRef<ProFormInstance | undefined>(undefined);
  const isEdit = editId != null;
  // Controlled if parent supplies open state (edit mode or create-from-exam)
  const isControlled = isEdit || open !== undefined;
  const [loadingDetail, setLoadingDetail] = useState(false);

  const drawerTitle = readOnly
    ? 'Xem bài tập'
    : isEdit
      ? 'Sửa bài tập'
      : 'Tạo bài tập';

  // Edit / view mode: fetch detail and populate form
  useEffect(() => {
    if (!isEdit || !open || !editId) return;
    setLoadingDetail(true);
    getExerciseDetail(editId)
      .then((res) => {
        const d = res.data;
        setTimeout(() => {
          formRef.current?.setFieldsValue({
            title: d.title,
            subjectId: d.subjectId,
            type: d.type,
            status: d.status,
            questionText: d.questionText,
            questionImage: d.questionImage,
            options: d.options?.length ? d.options : emptyOptions,
            essayAnswer: d.essayAnswer,
            essayAnswerImage: d.essayAnswerImage,
            trueFalseItems: d.trueFalseItems?.length
              ? d.trueFalseItems
              : emptyTrueFalse,
          });
        }, 50);
      })
      .catch(() => messageApi.error('Không tải được bài tập'))
      .finally(() => setLoadingDetail(false));
  }, [open, editId]);

  // Controlled create mode: auto-fill title (and locked subject) on open
  useEffect(() => {
    if (isEdit || open !== true) return;
    setTimeout(() => {
      formRef.current?.setFieldValue('title', formatNow());
    }, 0);
  }, [open, isEdit]);

  const handleFinish = async (values: ExerciseDetail) => {
    const payload: ExerciseDetail = {
      ...values,
      options: values.type === 'MULTIPLE_CHOICE' ? values.options : undefined,
      essayAnswer: values.type === 'ESSAY' ? values.essayAnswer : undefined,
      essayAnswerImage:
        values.type === 'ESSAY' ? values.essayAnswerImage : undefined,
      trueFalseItems:
        values.type === 'TRUE_FALSE' ? values.trueFalseItems : undefined,
    };

    if (
      payload.type === 'MULTIPLE_CHOICE' &&
      !payload.options?.some((o) => o.isCorrect)
    ) {
      messageApi.error(
        'Vui lòng chọn ít nhất 1 đáp án đúng (click vào A/B/C/D)',
      );
      return false;
    }

    const resolved = await resolveImages(payload);

    if (isEdit && editId) {
      await updateExercise(editId, resolved);
      messageApi.success('Cập nhật bài tập thành công');
    } else {
      await createExercise(resolved);
      messageApi.success('Tạo bài tập thành công');
    }
    onSuccess?.();
    return true;
  };

  return (
    <>
      {contextHolder}
      <DrawerForm<ExerciseDetail>
        title={drawerTitle}
        width="66vw"
        formRef={formRef}
        trigger={
          isControlled ? undefined : (
            <Button type="primary" icon={<PlusOutlined />}>
              Tạo bài tập
            </Button>
          )
        }
        open={isControlled ? (open ?? false) : undefined}
        onOpenChange={
          isControlled
            ? onOpenChange
            : (o) => {
                if (o) {
                  setTimeout(() => {
                    formRef.current?.setFieldValue('title', formatNow());
                  }, 0);
                }
              }
        }
        initialValues={{
          status: 'ACTIVE',
          type: 'MULTIPLE_CHOICE',
          options: emptyOptions,
          trueFalseItems: emptyTrueFalse,
          // Pre-fill locked subject for create-from-exam flow
          ...(lockedSubjectId != null ? { subjectId: lockedSubjectId } : {}),
        }}
        drawerProps={{ destroyOnHidden: true }}
        submitter={
          readOnly
            ? false
            : { searchConfig: { submitText: isEdit ? 'Lưu' : 'Tạo' } }
        }
        onFinish={readOnly ? undefined : handleFinish}
      >
        <Spin spinning={loadingDetail}>
          <fieldset
            disabled={readOnly}
            style={{ border: 'none', padding: 0, margin: 0 }}
          >
            <ProForm.Group>
              <ProFormText
                name="title"
                label="Tên bài tập"
                placeholder="Để trống sẽ lấy thời gian tạo"
                width="md"
                rules={[{ max: 30, message: 'Tên tối đa 30 ký tự' }]}
              />
            </ProForm.Group>
            <ProForm.Group>
              <ProFormSelect
                name="subjectId"
                label="Môn học"
                placeholder="Chọn môn học"
                width="md"
                request={async () => {
                  const res = await request('/api/v1/subjects', {
                    params: { status: 'ACTIVE', pageSize: 100 },
                  });
                  return (res.data ?? []).map(
                    (s: {
                      id: number;
                      name: string;
                      gradeLevel: string;
                      code: string;
                    }) => ({
                      label: `${s.name} — ${s.gradeLevel} (${s.code})`,
                      value: s.id,
                    }),
                  );
                }}
                fieldProps={{
                  showSearch: true,
                  filterOption: (input: string, option?: { label?: string }) =>
                    String(option?.label ?? '')
                      .toLowerCase()
                      .includes(input.toLowerCase()),
                  // Lock subject in create-from-exam mode
                  disabled: !isEdit && lockedSubjectId != null,
                }}
                rules={
                  readOnly ? [] : [{ required: true, message: 'Chọn môn học' }]
                }
              />
              <ProFormSelect
                name="status"
                label="Trạng thái"
                options={[
                  { label: 'ACTIVE', value: 'ACTIVE' },
                  { label: 'INACTIVE', value: 'INACTIVE' },
                ]}
                width="xs"
                allowClear={false}
              />
            </ProForm.Group>

            <Divider titlePlacement="start">Đề bài</Divider>
            <ProFormTextArea
              name="questionText"
              label="Nội dung đề bài"
              placeholder="Nhập nội dung đề bài..."
              fieldProps={{ autoSize: { minRows: 6 } }}
              rules={
                readOnly
                  ? []
                  : [{ required: true, message: 'Nhập nội dung đề bài' }]
              }
            />
            <Form.Item name="questionImage" label="Ảnh đề bài">
              <ImageUpload text="Ảnh đề" />
            </Form.Item>

            <Divider titlePlacement="start">Đáp án</Divider>
            <ProFormRadio.Group
              name="type"
              label="Loại bài tập"
              radioType="button"
              options={[
                { label: 'Trắc nghiệm', value: 'MULTIPLE_CHOICE' },
                { label: 'Tự luận', value: 'ESSAY' },
                { label: 'Đúng / Sai', value: 'TRUE_FALSE' },
              ]}
            />

            <ProFormDependency name={['type']}>
              {({ type }) => {
                if (type === 'MULTIPLE_CHOICE') {
                  return (
                    <Form.Item
                      name="options"
                      extra={
                        readOnly
                          ? undefined
                          : 'Click vào ô A/B/C/D để đánh dấu đáp án đúng (hiện xanh).'
                      }
                    >
                      <MultipleChoiceInput />
                    </Form.Item>
                  );
                }
                if (type === 'ESSAY') {
                  return (
                    <>
                      <ProFormTextArea
                        name="essayAnswer"
                        label="Đáp án"
                        placeholder="Nhập đáp án..."
                        fieldProps={{ autoSize: { minRows: 6 } }}
                      />
                      <Form.Item name="essayAnswerImage" label="Ảnh đáp án">
                        <ImageUpload text="Ảnh đáp án" />
                      </Form.Item>
                    </>
                  );
                }
                return (
                  <Form.Item name="trueFalseItems" label="Các ý Đúng/Sai">
                    <TrueFalseInput />
                  </Form.Item>
                );
              }}
            </ProFormDependency>
          </fieldset>
        </Spin>
      </DrawerForm>
    </>
  );
};

export default CreateExerciseForm;
