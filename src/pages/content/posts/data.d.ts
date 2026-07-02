export type PostStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';

export type PostItem = {
  id: number;
  title: string;
  summary?: string;
  coverImageUrl?: string;
  status: PostStatus;
  pinned: boolean;
  publishedAt?: string;
  createdAt?: string;
  author?: string;
};

export type PostDetail = PostItem & {
  contentMd: string;
};

export type PostForm = {
  title: string;
  summary?: string;
  coverImageUrl?: string;
  contentMd: string;
  pinned?: boolean;
};

export type PostQuery = {
  title?: string;
  status?: PostStatus;
  current?: number;
  pageSize?: number;
};
