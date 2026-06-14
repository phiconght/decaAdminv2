import { DeleteOutlined } from '@ant-design/icons';
import { Flex, InputNumber, Space, Table, Typography } from 'antd';
import React from 'react';
import type { ExamExerciseLine, TfItemScoreLine } from '../data';

type Props = {
  exercises: ExamExerciseLine[];
  onChange: (exercises: ExamExerciseLine[]) => void;
};

const TYPE_LABEL: Record<string, string> = {
  MULTIPLE_CHOICE: 'Trắc nghiệm',
  ESSAY: 'Tự luận',
  TRUE_FALSE: 'Đúng/Sai',
};

const GROUPS: { type: string; color: string }[] = [
  { type: 'MULTIPLE_CHOICE', color: '#1677ff' },
  { type: 'ESSAY', color: '#52c41a' },
  { type: 'TRUE_FALSE', color: '#fa8c16' },
];

const SelectedExerciseSections: React.FC<Props> = ({ exercises, onChange }) => {
  const updatePoints = (exerciseId: number, value: number | null) => {
    onChange(
      exercises.map((e) =>
        e.exerciseId === exerciseId ? { ...e, points: value ?? undefined } : e,
      ),
    );
  };

  const updateItemScore = (
    exerciseId: number,
    tfItemId: number,
    value: number | null,
  ) => {
    onChange(
      exercises.map((e) => {
        if (e.exerciseId !== exerciseId) return e;
        return {
          ...e,
          itemScores: (e.itemScores ?? []).map((s) =>
            s.tfItemId === tfItemId ? { ...s, points: value ?? 0 } : s,
          ),
        };
      }),
    );
  };

  const removeExercise = (exerciseId: number) => {
    onChange(exercises.filter((e) => e.exerciseId !== exerciseId));
  };

  return (
    <>
      {GROUPS.map(({ type, color }) => {
        const group = exercises.filter((e) => e.type === type);
        if (group.length === 0) return null;
        return (
          <div key={type} style={{ marginBottom: 16 }}>
            <Typography.Title level={5} style={{ color }}>
              {TYPE_LABEL[type]} ({group.length} câu)
            </Typography.Title>
            <Table
              rowKey="exerciseId"
              dataSource={group}
              size="small"
              pagination={false}
              columns={[
                { title: 'Mã', dataIndex: 'code', width: 130 },
                {
                  title: 'Nội dung',
                  dataIndex: 'title',
                  ellipsis: true,
                  render: (v: string) => v || '—',
                },
                ...(type !== 'TRUE_FALSE'
                  ? [
                      {
                        title: 'Điểm',
                        width: 110,
                        render: (_: unknown, record: ExamExerciseLine) => (
                          <InputNumber
                            min={0}
                            step={0.25}
                            value={record.points}
                            onChange={(v) => updatePoints(record.exerciseId, v)}
                            placeholder="0"
                            style={{ width: 90 }}
                          />
                        ),
                      },
                    ]
                  : [
                      {
                        title: 'Điểm từng ý',
                        render: (_: unknown, record: ExamExerciseLine) => (
                          <Flex vertical gap={4} style={{ width: '100%' }}>
                            {(record.itemScores ?? []).map(
                              (s: TfItemScoreLine) => (
                                <Space key={s.tfItemId}>
                                  <Typography.Text
                                    ellipsis
                                    style={{
                                      maxWidth: 200,
                                      display: 'inline-block',
                                    }}
                                  >
                                    {s.text}
                                  </Typography.Text>
                                  <InputNumber
                                    min={0}
                                    step={0.25}
                                    value={s.points}
                                    onChange={(v) =>
                                      updateItemScore(
                                        record.exerciseId,
                                        s.tfItemId,
                                        v,
                                      )
                                    }
                                    style={{ width: 80 }}
                                  />
                                </Space>
                              ),
                            )}
                          </Flex>
                        ),
                      },
                    ]),
                {
                  title: '',
                  width: 40,
                  render: (_: unknown, record: ExamExerciseLine) => (
                    <DeleteOutlined
                      style={{ color: '#ff4d4f', cursor: 'pointer' }}
                      onClick={() => removeExercise(record.exerciseId)}
                    />
                  ),
                },
              ]}
            />
          </div>
        );
      })}
    </>
  );
};

export default SelectedExerciseSections;
