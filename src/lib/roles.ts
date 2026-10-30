export const roles = ["USER", "CREATOR", "MODERATOR", "ADMIN"] as const;

export type Role = (typeof roles)[number];

export function isRole(value: unknown): value is Role {
  return roles.some((role) => role === value);
}

// Better Auth gives the role back as a plain string.
export function toRole(value: unknown): Role {
  return isRole(value) ? value : "USER";
}

export function isStaff(role: Role) {
  return role === "MODERATOR" || role === "ADMIN";
}

export function isAdmin(role: Role) {
  return role === "ADMIN";
}

export function canCreateQuizzes(role: Role) {
  return role === "CREATOR" || isStaff(role);
}
