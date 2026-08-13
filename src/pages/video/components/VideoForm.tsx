import { PlusOutlined } from '@ant-design/icons';
import {
  DrawerForm,
  ProFormSelect,
  ProFormText,
  ProFormTextArea,
} from '@ant-design/pro-components';
import { Button, message } from 'antd';
import React, { useEffect, useState } from 'react';
import type {
  LectureVideoItem,
  LectureVideoForm as VideoFormValues,
} from '../data';
import {
  createLectureVideo,
  getTopic,
  querySubjects,
  queryTopicsBySubject,
  updateLectureVideo,
} from '../service';

type Props = {
  mode: 'create' | 'edit';
  editData?: LectureVideoItem | null;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onSuccess?: () => void;
};

// subjectId chỉ dùng để lọc dropdown chuyên đề ở FE, KHÔNG gửi lên BE
// (lecture_videos chỉ lưu topic_id, không lưu subject_id trực tiếp).
type InternalForm = VideoFormValues & { subjectId?: number | null };

const VideoForm: React.FC<Props> = ({
  mode,
  editData,
  open,
  onOpenChange,
  onSuccess,
}) => {
  const [messageApi, contextHolder] = message.useMessage();
  const isEdit = mode === 'edit';
  const [initialValues, setInitialValues] = useState<Partial<InternalForm>>({});

  // Sửa video: chuyên đề đã có nhưng không biết thuộc môn nào -> tra ngược
  // qua GET /topics/{id} để suy ra subjectId, dùng preselect dropdown Môn.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (isEdit && editData) {
        let subjectId: number | undefined;
        if (editData.topicId) {
          const topic = await getTopic(editData.topicId);
          subjectId = topic?.subjectId;
        }
        if (!cancelled) {
          setInitialValues({
            title: editData.title,
            youtubeUrl: editData.youtubeUrl,
            description: editData.description ?? undefined,
            topicId: editData.topicId ?? null,
            subjectId,
          });
        }
      } else {
        setInitialValues({});
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [isEdit, editData, open]);

  const handleFinish = async (values: InternalForm) => {
    const payload: VideoFormValues = {
      title: values.title.trim(),
      youtubeUrl: values.youtubeUrl.trim(),
      description: values.description,
      topicId: values.topicId ?? null,
    };
    if (isEdit && editData) {
      await updateLectureVideo(editData.id, payload);
      messageApi.success('Cập nhật video thành công');
    } else {
      await createLectureVideo(payload);
      messageApi.success('Thêm video thành công');
    }
    onSuccess?.();
    return true;
  };

  return (
    <>
      {contextHolder}
      <DrawerForm<InternalForm>
        title={isEdit ? 'Sửa video bài giảng' : 'Thêm video bài giảng'}
        trigger={
          isEdit ? undefined : (
            <Button type="primary" icon={<PlusOutlined />}>
              Thêm video
            </Button>
          )
        }
        open={open}
        onOpenChange={onOpenChange}
        key={editData?.id ?? 'create'}
        initialValues={initialValues}
        drawerProps={{ destroyOnHidden: true }}
        onFinish={handleFinish}
      >
        <ProFormText
          name="title"
          label="Tiêu đề"
          placeholder="Ví dụ: Đạo hàm và ứng dụng (P1)"
          fieldProps={{ maxLength: 255 }}
          rules={[{ required: true, message: 'Nhập tiêu đề video' }]}
        />
        <ProFormText
          name="youtubeUrl"
          label="Link YouTube"
          placeholder="https://www.youtube.com/watch?v=..."
          extra="Chỉ chấp nhận link YouTube. Khuyến nghị dùng chế độ 'Không công khai' (unlisted)."
          rules={[
            { required: true, message: 'Nhập link YouTube' },
            { type: 'url', message: 'Link không hợp lệ' },
          ]}
        />
        <ProFormTextArea
          name="description"
          label="Mô tả"
          fieldProps={{ rows: 2 }}
        />
        <ProFormSelect
          name="subjectId"
          label="Môn học"
          placeholder="Chọn môn để lọc chuyên đề (không bắt buộc)"
          allowClear
          request={async () => {
            const subjects = await querySubjects();
            return subjects.map((s) => ({
              label: `${s.name} — ${s.gradeLevel}`,
              value: s.id,
            }));
          }}
          fieldProps={{
            showSearch: true,
            filterOption: (input: string, option?: { label?: string }) =>
              String(option?.label ?? '')
                .toLowerCase()
                .includes(input.toLowerCase()),
            onChange: () => {
              // Đổi môn -> chuyên đề cũ (thuộc môn khác) không còn hợp lệ.
            },
          }}
        />
        <ProFormSelect
          name="topicId"
          label="Chuyên đề"
          placeholder="Chọn môn trước để xem chuyên đề"
          allowClear
          dependencies={['subjectId']}
          request={async ({ subjectId }) => {
            if (!subjectId) return [];
            const topics = await queryTopicsBySubject(subjectId);
            return topics.map((t) => ({ label: t.name, value: t.id }));
          }}
          fieldProps={{
            showSearch: true,
            filterOption: (input: string, option?: { label?: string }) =>
              String(option?.label ?? '')
                .toLowerCase()
                .includes(input.toLowerCase()),
          }}
        />
      </DrawerForm>
    </>
  );
};

export default VideoForm;
