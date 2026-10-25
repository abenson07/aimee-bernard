import Link from "next/link";
import { SITE_PAGES, signPreviewToken, siteUrl } from "@/lib/site";
import { loadPage } from "./actions";
import { SiteEditor } from "./site-editor";

export const metadata = { title: "Site editor" };

export default async function SitePage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const { page } = await searchParams;
  const current = SITE_PAGES.find((p) => p.id === `site-page-${page}`) ?? SITE_PAGES[0];
  const state = await loadPage(current.id);
  const base = process.env.SITE_URL;

  if (!base || !process.env.SITE_PREVIEW_SECRET) {
    return (
      <main className="p-10">
        <p>The Site editor isn’t set up yet: SITE_URL and SITE_PREVIEW_SECRET are missing from this app’s settings.</p>
      </main>
    );
  }

  return (
    <>
      <header className="topbar">
        <div className="wordmark">Aimee Pugh Bernard</div>
        <div className="topbar-actions">
          <Link href="/" className="btn-secondary">
            ← Content log
          </Link>
        </div>
      </header>
      <SiteEditor
        pages={SITE_PAGES.map((p) => ({ id: p.id, title: p.title, slug: p.id.replace("site-page-", "") }))}
        currentId={current.id}
        initial={state}
        iframeBase={siteUrl(current.path, signPreviewToken())}
        siteOrigin={new URL(base).origin}
      />
    </>
  );
}
