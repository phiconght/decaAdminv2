export type AudienceType = 'ALL' | 'ROLE' | 'CLASS' | 'USERS';

export type SendAnnouncementBody = {
  title: string;
  contentMd: string;
  audience: AudienceType;
  audienceRef?: string;
  postId?: number;
};

export type AnnouncementItem = {
  id: number;
  title: string;
  audience: AudienceType;
  audienceRef?: string;
  sentCount: number;
  postId?: number;
  createdAt?: string;
  author?: string;
};
