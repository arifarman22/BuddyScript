"use client";

export default function Avatar({ firstName, lastName, size = "md" }) {
  const initials = `${(firstName || "")[0] || ""}${(lastName || "")[0] || ""}`.toUpperCase();
  const cls = size === "sm" ? "_avatar_circle_sm" : size === "lg" ? "_avatar_circle_lg" : "_avatar_circle";
  return <div className={cls}>{initials}</div>;
}
