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

export const BAN_REASON_MIN = 10;
export const BAN_REASON_MAX = 300;
export const BAN_DAYS = [7, 30, null] as const;
export type BanDays = (typeof BAN_DAYS)[number];

export const NOTE_MIN = 3;
export const NOTE_MAX = 400;

// Names read best A to Z, everything else starts with the biggest or newest.
export function defaultDirection(sort: UserSort): SortDirection {
  return sort === "name" ? "asc" : "desc";
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
