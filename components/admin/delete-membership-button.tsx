"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteMembership } from "@/actions/admin/delete-membership";

type DeleteMembershipButtonProps = {
  membershipId: string;
};

export function DeleteMembershipButton({
  membershipId,
}: DeleteMembershipButtonProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    startTransition(async () => {
      const result = await deleteMembership({ membershipId });

      if (!result.ok) {
        alert(result.message);
        return;
      }

      router.refresh();
    });
  }

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={handleDelete}
      className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-1.5 text-xs font-medium text-red-400 disabled:opacity-50"
    >
      {isPending ? "Quitando..." : "Quitar"}
    </button>
  );
}