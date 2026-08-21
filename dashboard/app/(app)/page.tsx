import { categorizationEnabled } from "@/lib/flags";
import { sanityClient } from "@/lib/sanity";
import type { Category, ContentItem, RefinementQuestion } from "@/lib/types";
import { Dashboard } from "./dashboard";

type CategoryRow = Omit<Category, "pending"> & { refinementQA?: RefinementQuestion[] };

const CATEGORIES_QUERY = `*[_type == "category"] | order(name asc){
  _id,
  name,
  "count": count(*[_type == "contentItem" && references(^._id)]),
  refinementQA
}`;

const ITEMS_QUERY = `*[_type == "contentItem"] | order(_createdAt desc){
  _id,
  _createdAt,
  title,
  url,
  description,
  categoryNote,
  "fileName": file.asset->originalFilename,
  "fileUrl": file.asset->url,
  "hasBody": count(body) > 0,
  "categoryId": category._ref,
  "categoryName": category->name
}`;

export default async function DashboardPage() {
  const [categoryRows, items] = await Promise.all([
    categorizationEnabled
      ? sanityClient.fetch<CategoryRow[]>(CATEGORIES_QUERY)
      : Promise.resolve([]),
    sanityClient.fetch<ContentItem[]>(ITEMS_QUERY),
  ]);

  const categories: Category[] = categoryRows.map((row) => ({
    _id: row._id,
    name: row.name,
    count: row.count,
    pending: (row.refinementQA ?? []).filter((qa) => !qa.answer),
  }));

  return (
    <Dashboard
      categories={categories}
      items={items}
      categorizationEnabled={categorizationEnabled}
    />
  );
}
