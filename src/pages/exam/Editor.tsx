import { PlusOutlined } from '@ant-design/icons';
import { PageContainer, ProCard } from '@ant-design/pro-components';
import { history, request, useParams } from '@umijs/max';
import {
  Button,
  DatePicker,
  Form,
  Input,
  InputNumber,
  message,
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

const ExamEditor: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const isEdit = !!id;

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
  const [studentOptions, setStudentOptions] = useState<StudentOption[]>([]);

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
        setSelectedClassIds(d.classes.map((c: ClassRef) => c.id));
        setSelectedStudentIds(d.students.map((s: StudentOption) => s.id));
      })
      .finally(() => setLoading(false));
  }, [id]);

  const selectedClasses = useMemo(
    () => classes.filter((c) => selectedClassIds.includes(c.id)),
    [classes, selectedClassIds],
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

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      setSubmitting(true);

      const publishAtValue = values.publishAt
        ? (values.publishAt as ReturnType<typeof dayjs>).toISOString()
        : undefined;
      const endAtValue = values.endAt
        ? (values.endAt as ReturnType<typeof dayjs>).toISOString()
        : undefined;

      const payload = {
        name: values.name,
        subjectId: values.subjectId,
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
      history.push('/exam');
    } catch (e: unknown) {
      if (e && typeof e === 'object' && 'errorFields' in e) return;
      message.error('Lưu thất bại');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PageContainer
      title={isEdit ? 'Sửa đề thi' : 'Tạo đề thi'}
      extra={
        <Space>
          <Button onClick={() => history.push('/exam')}>Hủy</Button>
          <Button type="primary" loading={submitting} onClick={handleSave}>
            Lưu
          </Button>
        </Space>
      }
    >
      <Spin spinning={loading}>
        {/* Thông tin đề */}
        <ProCard title="Thông tin đề" style={{ marginBottom: 16 }}>
          <Form form={form} layout="vertical">
            <Form.Item
              name="name"
              label="Tên đề"
              rules={[{ required: true, message: 'Nhập tên đề' }]}
            >
              <Input placeholder="Nhập tên đề thi" />
            </Form.Item>

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
                }}
              />
            </Form.Item>

            <Form.Item
              name="type"
              label="Loại đề"
              initialValue="BY_CLASS"
              rules={[{ required: true }]}
            >
              <Select
                options={[
                  { label: 'Theo lớp (cả lớp làm)', value: 'BY_CLASS' },
                  { label: 'Bổ sung (riêng học sinh)', value: 'SUPPLEMENTARY' },
                ]}
                onChange={(v: ExamType) => setExamType(v)}
              />
            </Form.Item>

            <Form.Item name="durationMinutes" label="Thời gian làm (phút)">
              <InputNumber
                min={1}
                placeholder="Nhập số phút"
                style={{ width: '100%' }}
              />
            </Form.Item>

            <Form.Item name="publishAt" label="Thời điểm phát đề">
              <DatePicker
                showTime
                format="DD/MM/YYYY HH:mm"
                style={{ width: '100%' }}
              />
            </Form.Item>

            <Form.Item name="endAt" label="Thời điểm kết thúc">
              <DatePicker
                showTime
                format="DD/MM/YYYY HH:mm"
                style={{ width: '100%' }}
              />
            </Form.Item>

            <Form.Item name="status" label="Trạng thái" initialValue="ACTIVE">
              <Select
                options={[
                  { label: 'ACTIVE', value: 'ACTIVE' },
                  { label: 'INACTIVE', value: 'INACTIVE' },
                ]}
              />
            </Form.Item>
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
            <Form.Item label="Lớp áp dụng">
              <Select
                mode="multiple"
                placeholder={subjectId ? 'Chọn lớp' : 'Chọn môn học trước'}
                disabled={!subjectId}
                value={selectedClassIds}
                onChange={(vals: number[]) =>
                  setSelectedClassIds(vals.map(Number))
                }
                style={{ width: '100%' }}
                showSearch
                filterOption={(input: string, opt?: { searchText?: string }) =>
                  String(opt?.searchText ?? '')
                    .toLowerCase()
                    .includes(input.toLowerCase())
                }
                options={classes.map((c) => ({
                  label: c.code,
                  value: c.id,
                  searchText: `${c.code} ${c.name} ${c.gradeLevel} ${c.subjectName}`,
                  gradeLevel: c.gradeLevel,
                  subjectName: c.subjectName,
                  name: c.name,
                  code: c.code,
                }))}
                optionRender={(opt) =>
                  `${opt.data.code} — ${opt.data.name} — ${opt.data.gradeLevel} — ${opt.data.subjectName}`
                }
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
                  selectedClassIds.length === 0 ? 'Chọn lớp trước' : undefined
                }
              >
                <Select
                  mode="multiple"
                  placeholder={
                    selectedClassIds.length === 0
                      ? 'Chọn lớp trước'
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
        alreadyIds={alreadyIds}
        onClose={() => setPickerOpen(false)}
        onAdd={(lines) =>
          setExercises((prev) => [
            ...prev,
            ...lines.filter((l) => !alreadyIds.has(l.exerciseId)),
          ])
        }
      />
    </PageContainer>
  );
};

export default ExamEditor;
