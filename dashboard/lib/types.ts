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

import type { PortableTextBlock } from "@portabletext/editor";

export type SourceKind = "file" | "url" | "body";

export const KIND_OPTIONS = [
  { title: "Talk", value: "talk" },
  { title: "Podcast", value: "podcast" },
  { title: "Press Mentions", value: "press-mentions" },
  { title: "Article", value: "article" },
  { title: "Educational Content", value: "educational-content" },
  { title: "Position", value: "position" },
  { title: "Course", value: "course" },
  { title: "Award", value: "award" },
  { title: "Research Publication", value: "research-publication" },
] as const;

export type CategoryReviewStatus = "pending" | "confirmed" | "changed";

export interface ContentItem {
  _id: string;
  _createdAt: string;
  title: string;
  kind?: string;
  venue?: string;
  date?: string;
  url?: string;
  firstLinkUrl?: string;
  fileName?: string;
  fileUrl?: string;
  body?: PortableTextBlock[];
  bodyPreview?: string;
  categoryId?: string;
  categoryName?: string;
  categorySecondaryId?: string;
  categorySecondaryName?: string;
  categoryNote?: string;
  categorySuggestedId?: string;
  categorySuggestedName?: string;
  categorySuggestedSecondaryId?: string;
  categorySuggestedSecondaryName?: string;
  categoryRationale?: string;
  categoryFlaggedForReview?: boolean;
  categoryReviewedAt?: string;
  categoryStatus?: CategoryReviewStatus;
  description?: string;
}
