/** Everything the item window (item-modal.tsx) needs about one content item. Used by the content log and the Site editor. */
export const CONTENT_ITEM_FIELDS = `
  _id,
  _createdAt,
  title,
  kind,
  venue,
  date,
  alsoShown,
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
`;

export const ITEMS_QUERY = `*[_type == "contentItem"] | order(_createdAt desc){ ${CONTENT_ITEM_FIELDS} }`;

/* count is scoped to the live primary category specifically — a bare
   references() check would also match categorySecondary/categorySuggested/
   categorySuggestedSecondary now that those exist, inflating the count. */
export const CATEGORIES_QUERY = `*[_type == "category"] | order(name asc){
  _id,
  name,
  "count": count(*[_type == "contentItem" && category._ref == ^._id]),
  refinementQA
}`;
