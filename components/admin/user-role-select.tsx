"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateUserRole } from "@/actions/admin/update-user-role";

type RoleValue =
  | "SUPER_ADMIN"
  | "OWNER"
  | "MANAGER"
  | "CASHIER"
  | "BAR"
  | "SECURITY";

type UserRoleSelectProps = {
  userId: string;
  currentRole: RoleValue;
};

const ROLE_OPTIONS: RoleValue[] = [
  "SUPER_ADMIN",
  "OWNER",
  "MANAGER",
  "CASHIER",
  "BAR",
  "SECURITY",
];

export function UserRoleSelect({
  userId,
  currentRole,
}: UserRoleSelectProps) {
  const router = useRouter();
  const [role, setRole] = useState<RoleValue>(currentRole);
  const [isPending, startTransition] = useTransition();

  function handleChange(nextRole: RoleValue) {
    setRole(nextRole);

    startTransition(async () => {
      const result = await updateUserRole({
        userId,
        role: nextRole,
      });

      if (!result.ok) {
        alert(result.message);
        setRole(currentRole);
        return;
      }

      router.refresh();
    });
  }

  return (
    <select
      value={role}
      disabled={isPending}
      onChange={(e) => handleChange(e.target.value as RoleValue)}
      className="rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white outline-none disabled:opacity-50"
    >
      {ROLE_OPTIONS.map((option) => (
        <option key={option} value={option} className="bg-[#111111]">
          {option}
        </option>
      ))}
    </select>
  );
}