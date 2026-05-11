"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createMembership } from "@/actions/admin/create-membership";

type RoleValue =
  | "SUPER_ADMIN"
  | "OWNER"
  | "MANAGER"
  | "CASHIER"
  | "BAR"
  | "SECURITY";

type VenueOption = {
  id: string;
  name: string;
};

type CreateMembershipFormProps = {
  userId: string;
  venues: VenueOption[];
};

const ROLE_OPTIONS: RoleValue[] = [
  "SUPER_ADMIN",
  "OWNER",
  "MANAGER",
  "CASHIER",
  "BAR",
  "SECURITY",
];

export function CreateMembershipForm({
  userId,
  venues,
}: CreateMembershipFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [venueId, setVenueId] = useState(venues[0]?.id ?? "");
  const [role, setRole] = useState<RoleValue>("CASHIER");

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    startTransition(async () => {
      const result = await createMembership({
        userId,
        venueId,
        role,
      });

      if (!result.ok) {
        alert(result.message);
        return;
      }

      router.refresh();
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-wrap items-end gap-2">
      <div className="min-w-[180px]">
        <label className="mb-1 block text-xs uppercase tracking-[0.15em] text-zinc-500">
          Boliche
        </label>
        <select
          value={venueId}
          onChange={(e) => setVenueId(e.target.value)}
          className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white outline-none"
        >
          {venues.map((venue) => (
            <option key={venue.id} value={venue.id} className="bg-[#111111]">
              {venue.name}
            </option>
          ))}
        </select>
      </div>

      <div className="min-w-[160px]">
        <label className="mb-1 block text-xs uppercase tracking-[0.15em] text-zinc-500">
          Rol
        </label>
        <select
          value={role}
          onChange={(e) => setRole(e.target.value as RoleValue)}
          className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white outline-none"
        >
          {ROLE_OPTIONS.map((option) => (
            <option key={option} value={option} className="bg-[#111111]">
              {option}
            </option>
          ))}
        </select>
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="rounded-xl bg-[#D4AF37] px-4 py-2 text-sm font-semibold text-black disabled:opacity-50"
      >
        {isPending ? "Agregando..." : "Agregar"}
      </button>
    </form>
  );
}