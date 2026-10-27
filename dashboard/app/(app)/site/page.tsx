import { categorizationEnabled } from "@/lib/flags";
import { CATEGORIES_QUERY, ITEMS_QUERY } from "@/lib/queries";
import { sanityClient } from "@/lib/sanity";
import { SITE_PAGES, signPreviewToken, siteUrl } from "@/lib/site";
import type { Category, ContentItem, RefinementQuestion } from "@/lib/types";
import { loadPage } from "./actions";
import { Studio } from "./studio";
import "./studio.css";

export const metadata = { title: "Site editor" };

type CategoryRow = Omit<Category, "pending"> & {
  refinementQA?: RefinementQuestion[];
};

export default async function SitePage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page } = await searchParams;
  const current =
    SITE_PAGES.find((p) => p.id === `site-page-${page}`) ?? SITE_PAGES[0];
  const base = process.env.SITE_URL;

  if (!base || !process.env.SITE_PREVIEW_SECRET) {
    return (
      <main className="p-10">
        <p>
          The Site editor isn’t set up yet: SITE_URL and SITE_PREVIEW_SECRET are
          missing from this app’s settings.
        </p>
      </main>
    );
  }

  // The content log lives in the editor too (the Content rail tab), so its items load here as well.
  const [state, categoryRows, items] = await Promise.all([
    loadPage(current.id),
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
    <Studio
      key={current.id}
      pages={SITE_PAGES.map((p) => ({
        id: p.id,
        title: p.title,
        slug: p.id.replace("site-page-", ""),
        path: p.path,
      }))}
      currentId={current.id}
      initial={state}
      iframeBase={siteUrl(current.path, signPreviewToken())}
      siteOrigin={new URL(base).origin}
      categories={categories}
      items={items}
      categorizationEnabled={categorizationEnabled}
    />
  );
}
