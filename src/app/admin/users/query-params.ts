export const userFilters = [
  "all",
  "players",
  "creators",
  "staff",
  "banned",
] as const;
export type UserFilter = (typeof userFilters)[number];

export const userSorts = ["joined", "active", "name", "xp", "quizzes"] as const;
export type UserSort = (typeof userSorts)[number];

export type SortDirection = "asc" | "desc";

export const USERS_PAGE_SIZE = 20;
export const USERS_LIST_KEY = "admin.users.list";
export const defaultSort: UserSort = "joined";

export type UserQuery = {
  q: string;
  filter: UserFilter;
  sort: UserSort;
  dir: SortDirection;
  page: number;
};

// Names read best A to Z, everything else starts with the biggest or newest.
export function defaultDirection(sort: UserSort): SortDirection {
  return sort === "name" ? "asc" : "desc";
}

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export function parseUserQuery(
  raw: Record<string, string | string[] | undefined>,
): UserQuery {
  const rawFilter = first(raw.filter);
  const rawSort = first(raw.sort);
  const rawDir = first(raw.dir);
  const parsedPage = Number.parseInt(first(raw.page) ?? "1", 10);

  const sort = userSorts.find((item) => item === rawSort) ?? defaultSort;
  const dir =
    rawDir === "asc" || rawDir === "desc" ? rawDir : defaultDirection(sort);

  return {
    q: first(raw.q)?.trim().slice(0, 80) ?? "",
    filter: userFilters.find((item) => item === rawFilter) ?? "all",
    sort,
    dir,
    page: Number.isFinite(parsedPage) && parsedPage > 0 ? parsedPage : 1,
  };
}

// Defaults are left out so the common views keep a clean URL.
export function toSearchString(query: UserQuery) {
  const params = new URLSearchParams();

  if (query.q) params.set("q", query.q);
  if (query.filter !== "all") params.set("filter", query.filter);
  if (query.sort !== defaultSort) params.set("sort", query.sort);
  if (query.dir !== defaultDirection(query.sort)) params.set("dir", query.dir);
  if (query.page > 1) params.set("page", String(query.page));

  return params.toString();
}
