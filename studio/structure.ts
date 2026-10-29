import type { StructureResolver } from "sanity/structure";

// Page documents are singletons: one fixed ID each, no create/delete. They
// live under "Pages" and are filtered out of the normal document list.
const PAGE_TYPES = [{ type: "pageCommunicator", title: "Communicator" }];
const PAGE_TYPE_NAMES = PAGE_TYPES.map((p) => p.type);

export const structure: StructureResolver = (S) =>
  S.list()
    .title("Content")
    .items([
      S.listItem()
        .title("Pages")
        .child(
          S.list()
            .title("Pages")
            .items(
              PAGE_TYPES.map((p) =>
                S.listItem()
                  .title(p.title)
                  .id(p.type)
                  .child(S.document().schemaType(p.type).documentId(p.type).title(p.title)),
              ),
            ),
        ),
      S.divider(),
      ...S.documentTypeListItems().filter((item) => !PAGE_TYPE_NAMES.includes(item.getId() ?? "")),
    ]);
