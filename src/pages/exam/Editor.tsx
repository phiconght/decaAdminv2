import { PlusOutlined } from '@ant-design/icons';
import { PageContainer, ProCard } from '@ant-design/pro-components';
import { history, request, useParams } from '@umijs/max';
import {
  Button,
  Col,
  DatePicker,
  Form,
  Input,
  InputNumber,
  message,
  Row,
  Select,
  Space,
  Spin,
  Typography,
} from 'antd';
import dayjs from 'dayjs';
import React, { useEffect, useMemo, useState } from 'react';
import CreateExerciseForm from '@/pages/exercise/components/CreateExerciseForm';
import ExercisePickerModal from './components/ExercisePickerModal';
import SelectedExerciseSections from './components/SelectedExerciseSections';
import type {
  ClassRef,
  ExamExerciseLine,
  ExamType,
  StudentOption,
} from './data';
import {
  createExam,
  getExamDetail,
  queryClassesByIds,
  queryStudentOptions,
  updateExam,
} from './service';

type SubjectOption = { id: number; name: string; gradeLevel: string };
type ClassOption = {
  id: number;
  code: string;
  name: string;
  subjectId: number;
  gradeLevel: string;
  subjectName: string;
};

type EditorProps = {
  id?: number;
  embedded?: boolean;
  onClose?: () => void;
  onSaved?: () => void;
};

const ExamEditor: React.FC<EditorProps> = ({
  id: idProp,
  embedded,
  onClose,
  onSaved,
}) => {
  const params = useParams<{ id?: string }>();
  // Giữ id dạng string để các chỗ Number(id) bên dưới không phải đổi
  const id = idProp != null ? String(idProp) : params.id;
  const isEdit = !!id;

  const finish = () => (onSaved ? onSaved() : history.push('/exam'));
  const cancel = () => (onClose ? onClose() : history.push('/exam'));

  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [createExerciseOpen, setCreateExerciseOpen] = useState(false);

  const [exercises, setExercises] = useState<ExamExerciseLine[]>([]);
  const [selectedClassIds, setSelectedClassIds] = useState<number[]>([]);
  const [selectedStudentIds, setSelectedStudentIds] = useState<number[]>([]);
  const [examType, setExamType] = useState<ExamType>('BY_CLASS');
  const [subjectId, setSubjectId] = useState<number | undefined>();

  const [subjects, setSubjects] = useState<SubjectOption[]>([]);
  const [classes, setClasses] = useState<ClassOption[]>([]);
  // Khóa đã chọn (lấy theo id) — đảm bảo hiển thị đủ nhãn dù không nằm trong list theo môn
  const [selectedClassInfo, setSelectedClassInfo] = useState<ClassOption[]>([]);
  const [studentOptions, setStudentOptions] = useState<StudentOption[]>([]);
  const [topics, setTopics] = useState<{ id: number; name: string }[]>([]);
  // Chuyên đề đang chọn → lọc bài tập trong picker
  const topicId = Form.useWatch('topicId', form) as number | undefined;

  // Khi load edit, subjectId thay đổi do fetch dữ liệu (không phải do user) → không xóa classIds đã load
  const skipClassClearRef = React.useRef(false);

  useEffect(() => {
    request('/api/v1/subjects', { params: { pageSize: 100 } }).then((res) =>
      setSubjects(res.data ?? []),
    );
  }, []);

  useEffect(() => {
    if (!subjectId) {
      setClasses([]);
      return;
    }
    if (skipClassClearRef.current) {
      skipClassClearRef.current = false;
    } else {
      setSelectedClassIds([]);
      setSelectedStudentIds([]);
    }
    request('/api/v1/classes', {
      params: { subjectId, status: 'ACTIVE', pageSize: 100 },
    }).then((res) =>
      setClasses(
        (res.data ?? []).map((c: ClassOption) => ({ ...c, id: Number(c.id) })),
      ),
    );
  }, [subjectId]);

  // Nạp chuyên đề theo môn học
  useEffect(() => {
    if (!subjectId) {
      setTopics([]);
      return;
    }
    request('/api/v1/topics', { params: { subjectId } }).then((res) =>
      setTopics(res.data ?? []),
    );
  }, [subjectId]);

  useEffect(() => {
    if (examType !== 'SUPPLEMENTARY' || selectedClassIds.length === 0) {
      setStudentOptions([]);
      setSelectedStudentIds((prev) => (prev.length > 0 ? [] : prev));
      return;
    }
    queryStudentOptions(selectedClassIds).then((res) =>
      setStudentOptions(res.data ?? []),
    );
  }, [examType, selectedClassIds]);

  useEffect(() => {
    if (!isEdit || !id) return;
    setLoading(true);
    getExamDetail(Number(id))
      .then((res) => {
        const d = res.data;
        form.setFieldsValue({
          name: d.name,
          subjectId: d.subjectId,
          topicId: d.topicId,
          type: d.type,
          durationMinutes: d.durationMinutes,
          publishAt: d.publishAt ? dayjs(d.publishAt) : undefined,
          endAt: d.endAt ? dayjs(d.endAt) : undefined,
          status: d.status,
        });
        skipClassClearRef.current = true;
        setSubjectId(d.subjectId);
        setExamType(d.type);
        setExercises(d.exercises);
        const classIds = d.classes.map((c: ClassRef) => c.id);
        setSelectedClassIds(classIds);
        if (classIds.length) {
          queryClassesByIds(classIds).then((r) =>
            setSelectedClassInfo(
              (r.data ?? []).map((c) => ({ ...c, id: Number(c.id) })),
            ),
          );
        }
        setSelectedStudentIds(d.students.map((s: StudentOption) => s.id));
      })
      .finally(() => setLoading(false));
  }, [id]);

  // Gộp khóa theo môn + khóa đã chọn (theo id) để options luôn đủ nhãn
  const classOptions = useMemo(() => {
    const map = new Map<number, ClassOption>();
    for (const c of classes) map.set(c.id, c);
    for (const c of selectedClassInfo) {
      if (!map.has(c.id)) map.set(c.id, c);
    }
    return Array.from(map.values());
  }, [classes, selectedClassInfo]);

  const selectedClasses = useMemo(
    () => classOptions.filter((c) => selectedClassIds.includes(c.id)),
    [classOptions, selectedClassIds],
  );

  const alreadyIds = useMemo(
    () => new Set(exercises.map((e) => e.exerciseId)),
    [exercises],
  );

  const totalPoints = useMemo(
    () =>
      exercises.reduce((sum, e) => {
        if (e.type === 'TRUE_FALSE') {
          return (
            sum + (e.itemScores ?? []).reduce((s, i) => s + (i.points ?? 0), 0)
          );
        }
        return sum + (e.points ?? 0);
      }, 0),
    [exercises],
  );

  // Kết thúc = Bắt đầu + Thời gian (tự tính, cập nhật tức thì khi đổi 1 trong 2)
  const watchPublishAt = Form.useWatch('publishAt', form);
  const watchDuration = Form.useWatch('durationMinutes', form);
  useEffect(() => {
    if (watchPublishAt && watchDuration) {
      form.setFieldValue(
        'endAt',
        dayjs(watchPublishAt).add(Number(watchDuration), 'minute'),
      );
    } else {
      form.setFieldValue('endAt', undefined);
    }
  }, [watchPublishAt, watchDuration]);

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      setSubmitting(true);

      // Chuẩn hóa về mốc phút (bỏ giây/mili) để chính xác đến từng phút
      const publishAtValue = values.publishAt
        ? (values.publishAt as ReturnType<typeof dayjs>)
            .second(0)
            .millisecond(0)
            .toISOString()
        : undefined;
      // Kết thúc luôn = Bắt đầu + Thời gian (không lấy từ ô disabled)
      const endAtValue =
        values.publishAt && values.durationMinutes
          ? (values.publishAt as ReturnType<typeof dayjs>)
              .add(Number(values.durationMinutes), 'minute')
              .second(0)
              .millisecond(0)
              .toISOString()
          : undefined;

      const payload = {
        name: values.name,
        subjectId: values.subjectId,
        topicId: values.topicId,
        type: values.type,
        durationMinutes: values.durationMinutes,
        publishAt: publishAtValue,
        endAt: endAtValue,
        status: values.status,
        exercises: exercises.map((e, i) => ({
          exerciseId: e.exerciseId,
          sortOrder: i,
          points: e.type !== 'TRUE_FALSE' ? (e.points ?? undefined) : undefined,
          itemScores:
            e.type === 'TRUE_FALSE'
              ? (e.itemScores ?? []).map((s) => ({
                  tfItemId: s.tfItemId,
                  points: s.points,
                }))
              : [],
        })),
        classIds: selectedClassIds,
        studentIds: examType === 'SUPPLEMENTARY' ? selectedStudentIds : [],
      };

      if (isEdit) {
        await updateExam(Number(id), payload);
        message.success('Cập nhật đề thi thành công');
      } else {
        await createExam(payload);
        message.success('Tạo đề thi thành công');
      }
      finish();
    } catch (e: unknown) {
      if (e && typeof e === 'object' && 'errorFields' in e) return;
      message.error('Lưu thất bại');
    } finally {
      setSubmitting(false);
    }
  };

  const renderActions = () => (
    <Space>
      <Button onClick={cancel}>Hủy</Button>
      <Button type="primary" loading={submitting} onClick={handleSave}>
        Lưu
      </Button>
    </Space>
  );

  const body = (
    <>
      <div
        style={{
          display: 'flex',
          justifyContent: 'flex-end',
          marginBottom: 16,
        }}
      >
        {renderActions()}
      </div>

      <Spin spinning={loading}>
        {/* Thông tin đề */}
        <ProCard title="Thông tin đề" style={{ marginBottom: 16 }}>
          <Form form={form} layout="vertical">
            <Row gutter={16}>
              <Col span={24}>
                <Form.Item
                  name="name"
                  label="Tên đề"
                  rules={[{ required: true, message: 'Nhập tên đề' }]}
                >
                  <Input placeholder="Nhập tên đề thi" />
                </Form.Item>
              </Col>

              <Col xs={24} md={8}>
                <Form.Item
                  name="subjectId"
                  label="Môn học"
                  rules={[{ required: true, message: 'Chọn môn học' }]}
                >
                  <Select
                    showSearch
                    filterOption={(input: string, opt?: { label?: string }) =>
                      String(opt?.label ?? '')
                        .toLowerCase()
                        .includes(input.toLowerCase())
                    }
                    placeholder="Chọn môn học"
                    options={subjects.map((s) => ({
                      label: `${s.name} — ${s.gradeLevel}`,
                      value: s.id,
                    }))}
                    onChange={(v: number) => {
                      setSubjectId(v);
                      form.setFieldValue('subjectId', v);
                      // Đổi môn → bỏ chuyên đề đã chọn
                      form.setFieldValue('topicId', undefined);
                    }}
                  />
                </Form.Item>
              </Col>

              <Col xs={24} md={8}>
                <Form.Item name="topicId" label="Chuyên đề">
                  <Select
                    allowClear
                    showSearch
                    disabled={!subjectId}
                    placeholder={
                      subjectId ? 'Chọn chuyên đề' : 'Chọn môn trước'
                    }
                    filterOption={(input: string, opt?: { label?: string }) =>
                      String(opt?.label ?? '')
                        .toLowerCase()
                        .includes(input.toLowerCase())
                    }
                    options={topics.map((t) => ({
                      label: t.name,
                      value: t.id,
                    }))}
                  />
                </Form.Item>
              </Col>

              <Col xs={24} md={8}>
                <Form.Item
                  name="type"
                  label="Loại đề"
                  initialValue="BY_CLASS"
                  rules={[{ required: true }]}
                >
                  <Select
                    options={[
                      { label: 'Theo khóa (cả khóa làm)', value: 'BY_CLASS' },
                      {
                        label: 'Bổ sung (riêng học sinh)',
                        value: 'SUPPLEMENTARY',
                      },
                    ]}
                    onChange={(v: ExamType) => setExamType(v)}
                  />
                </Form.Item>
              </Col>

              <Col xs={24} md={8}>
                <Form.Item
                  name="status"
                  label="Trạng thái"
                  initialValue="ACTIVE"
                >
                  <Select
                    options={[
                      { label: 'Đã phát hành', value: 'ACTIVE' },
                      { label: 'Chưa phát hành', value: 'INACTIVE' },
                    ]}
                  />
                </Form.Item>
              </Col>

              <Col xs={24} md={8}>
                <Form.Item name="publishAt" label="Bắt đầu">
                  <DatePicker
                    showTime={{ format: 'HH:mm' }}
                    format="DD/MM/YYYY HH:mm"
                    minuteStep={1}
                    style={{ width: '100%' }}
                  />
                </Form.Item>
              </Col>

              <Col xs={24} md={8}>
                <Form.Item name="durationMinutes" label="Thời gian">
                  <InputNumber
                    min={1}
                    step={1}
                    precision={0}
                    addonAfter="phút"
                    placeholder="Nhập số phút"
                    style={{ width: '100%' }}
                  />
                </Form.Item>
              </Col>

              <Col xs={24} md={8}>
                <Form.Item name="endAt" label="Kết thúc">
                  <DatePicker
                    disabled
                    showTime={{ format: 'HH:mm' }}
                    format="DD/MM/YYYY HH:mm"
                    placeholder="Tự tính theo Bắt đầu + Thời gian"
                    style={{ width: '100%' }}
                  />
                </Form.Item>
              </Col>
            </Row>
          </Form>
        </ProCard>

        {/* Nội dung đề */}
        <ProCard
          title={
            <Space>
              <span>Nội dung đề</span>
              <Typography.Text type="secondary" style={{ fontSize: 13 }}>
                Tổng điểm:{' '}
                <Typography.Text strong>
                  {totalPoints.toFixed(2)}
                </Typography.Text>
              </Typography.Text>
            </Space>
          }
          extra={
            <Space>
              <Button
                icon={<PlusOutlined />}
                disabled={!subjectId}
                onClick={() => setCreateExerciseOpen(true)}
              >
                Tạo bài tập
              </Button>
              <Button
                type="dashed"
                icon={<PlusOutlined />}
                onClick={() => setPickerOpen(true)}
                disabled={!subjectId}
              >
                Thêm bài tập
              </Button>
            </Space>
          }
          style={{ marginBottom: 16 }}
        >
          {exercises.length === 0 ? (
            <Typography.Text type="secondary">
              Chưa có bài tập nào. Bấm &ldquo;Thêm bài tập&rdquo; để chọn.
            </Typography.Text>
          ) : (
            <SelectedExerciseSections
              exercises={exercises}
              onChange={setExercises}
            />
          )}
        </ProCard>

        {/* Phạm vi áp dụng */}
        <ProCard title="Phạm vi áp dụng">
          <Form layout="vertical">
            <Form.Item label="Khóa áp dụng">
              <Select
                mode="multiple"
                placeholder={subjectId ? 'Chọn khóa' : 'Chọn môn học trước'}
                disabled={!subjectId}
                value={selectedClassIds}
                onChange={(vals: number[]) =>
                  setSelectedClassIds(vals.map(Number))
                }
                style={{ width: '100%' }}
                showSearch
                filterOption={(input: string, opt?: { label?: string }) =>
                  String(opt?.label ?? '')
                    .toLowerCase()
                    .includes(input.toLowerCase())
                }
                options={classOptions.map((c) => ({
                  label: `${c.code} — ${c.name} — ${c.gradeLevel}`,
                  value: c.id,
                }))}
              />
              {selectedClasses.length > 0 && (
                <div
                  style={{
                    marginTop: 12,
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: 8,
                  }}
                >
                  {selectedClasses.map((c) => (
                    <div
                      key={c.id}
                      style={{
                        padding: '6px 10px',
                        background: '#f5f5f5',
                        borderRadius: 6,
                        fontSize: 13,
                        lineHeight: '1.6',
                      }}
                    >
                      <div style={{ fontWeight: 600 }}>{c.code}</div>
                      <div style={{ color: '#555' }}>
                        {c.name} · {c.gradeLevel} · {c.subjectName}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Form.Item>

            {examType === 'SUPPLEMENTARY' && (
              <Form.Item
                label="Học sinh nhận đề bổ sung"
                help={
                  selectedClassIds.length === 0 ? 'Chọn khóa trước' : undefined
                }
              >
                <Select
                  mode="multiple"
                  placeholder={
                    selectedClassIds.length === 0
                      ? 'Chọn khóa trước'
                      : 'Chọn học sinh'
                  }
                  disabled={selectedClassIds.length === 0}
                  value={selectedStudentIds}
                  onChange={setSelectedStudentIds}
                  style={{ width: '100%' }}
                  showSearch
                  filterOption={(input, opt) =>
                    String(opt?.label ?? '')
                      .toLowerCase()
                      .includes(input.toLowerCase())
                  }
                  options={studentOptions.map((s) => ({
                    label: `${s.fullName} (${s.username})`,
                    value: s.id,
                  }))}
                />
              </Form.Item>
            )}
          </Form>
        </ProCard>
      </Spin>

      <div
        style={{
          display: 'flex',
          justifyContent: 'flex-end',
          marginTop: 16,
        }}
      >
        {renderActions()}
      </div>

      <CreateExerciseForm
        open={createExerciseOpen}
        onOpenChange={(o) => {
          if (!o) setCreateExerciseOpen(false);
        }}
        lockedSubjectId={subjectId}
        onSuccess={() => setCreateExerciseOpen(false)}
      />

      <ExercisePickerModal
        open={pickerOpen}
        subjectId={subjectId}
        topicId={topicId}
        alreadyIds={alreadyIds}
        onClose={() => setPickerOpen(false)}
        onAdd={(lines) =>
          setExercises((prev) => [
            ...prev,
            ...lines.filter((l) => !alreadyIds.has(l.exerciseId)),
          ])
        }
      />
    </>
  );

  // Chế độ nhúng (mở trong Drawer): không bọc PageContainer.
  // body đã có sẵn cụm nút Lưu/Hủy ở cả trên đầu và cuối.
  if (embedded) {
    return body;
  }

  return (
    <PageContainer title={isEdit ? 'Sửa đề thi' : 'Tạo đề thi'}>
      {body}
    </PageContainer>
  );
};

export default ExamEditor;
