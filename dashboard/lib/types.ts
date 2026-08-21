export interface RefinementQuestion {
  _key: string;
  question: string;
  questionType?: "open" | "choice";
  options?: string[];
  answer?: string;
  answeredAt?: string;
}

export interface Category {
  _id: string;
  name: string;
  count: number;
  pending: RefinementQuestion[];
}

export type SourceKind = "file" | "url" | "body";

export interface ContentItem {
  _id: string;
  _createdAt: string;
  title: string;
  url?: string;
  fileName?: string;
  fileUrl?: string;
  hasBody?: boolean;
  categoryId?: string;
  categoryName?: string;
  categoryNote?: string;
  description?: string;
}
