// Kho video bài giảng (YouTube, dùng lại nhiều buổi). Xem SPEC_VideoBaiGiang_Zoom.md.

export type LectureVideoItem = {
  id: number;
  title: string;
  youtubeUrl: string;
  description?: string | null;
  topicId?: number | null;
  topicName?: string | null;
  thumbnailUrl?: string | null;
  durationSeconds?: number | null;
};

export type LectureVideoForm = {
  title: string;
  youtubeUrl: string;
  description?: string;
  topicId?: number | null;
};

export type LectureVideoQuery = {
  topicId?: number;
  q?: string;
  current?: number;
  pageSize?: number;
};
