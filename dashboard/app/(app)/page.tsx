import { categorizationEnabled } from "@/lib/flags";
import { CATEGORIES_QUERY, ITEMS_QUERY } from "@/lib/queries";
import { sanityClient } from "@/lib/sanity";
import type { Category, ContentItem, RefinementQuestion } from "@/lib/types";
import { Dashboard } from "./dashboard";

type CategoryRow = Omit<Category, "pending"> & { refinementQA?: RefinementQuestion[] };

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
