import { categorizationEnabled } from "@/lib/flags";
import { sanityClient } from "@/lib/sanity";
import type { Category, ContentItem, RefinementQuestion } from "@/lib/types";
import { Dashboard } from "./dashboard";

type CategoryRow = Omit<Category, "pending"> & { refinementQA?: RefinementQuestion[] };

/* count is scoped to the live primary category specifically — a bare
   references() check would also match categorySecondary/categorySuggested/
   categorySuggestedSecondary now that those exist, inflating the count. */
const CATEGORIES_QUERY = `*[_type == "category"] | order(name asc){
  _id,
  name,
  "count": count(*[_type == "contentItem" && category._ref == ^._id]),
  refinementQA
}`;

const ITEMS_QUERY = `*[_type == "contentItem"] | order(_createdAt desc){
  _id,
  _createdAt,
  title,
  kind,
  venue,
  date,
  url,
  "firstLinkUrl": links[0].url,
  links[]{_key, label, url},
  description,
  categoryNote,
  body,
  "bodyPreview": pt::text(body),
  "fileName": file.asset->originalFilename,
  "fileUrl": file.asset->url,
  "categoryId": category._ref,
  "categoryName": category->name,
  "categorySecondaryId": categorySecondary._ref,
  "categorySecondaryName": categorySecondary->name,
  "categorySuggestedId": categorySuggested._ref,
  "categorySuggestedName": categorySuggested->name,
  "categorySuggestedSecondaryId": categorySuggestedSecondary._ref,
  "categorySuggestedSecondaryName": categorySuggestedSecondary->name,
  categoryRationale,
  categoryFlaggedForReview,
  categoryReviewedAt,
  "categoryStatus": select(
    !defined(categorySuggested) => null,
    !defined(categoryReviewedAt) => "pending",
    category._ref == categorySuggested._ref
      && categorySecondary._ref == categorySuggestedSecondary._ref => "confirmed",
    "changed"
  )
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
