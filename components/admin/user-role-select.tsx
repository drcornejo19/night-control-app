"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateUserRole } from "@/actions/admin/update-user-role";
import { appRoles, roleLabels, type AppRole } from "@/lib/constants/roles";

type UserRoleSelectProps = {
  userId: string;
  currentRole: AppRole;
};

export function UserRoleSelect({
  userId,
  currentRole,
}: UserRoleSelectProps) {
  const router = useRouter();
  const [role, setRole] = useState<AppRole>(currentRole);
  const [isPending, startTransition] = useTransition();

  function handleChange(nextRole: AppRole) {
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
      onChange={(e) => handleChange(e.target.value as AppRole)}
      className="rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white outline-none disabled:opacity-50"
    >
      {appRoles.map((option) => (
        <option key={option} value={option} className="bg-[#111111]">
          {roleLabels[option]}
        </option>
      ))}
    </select>
  );
}
