"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown } from "lucide-react";
import { setActiveVenue } from "@/actions/venues/set-active-venue";

type VenueOption = {
  id: string;
  name: string;
};

type VenueSwitcherProps = {
  venues: VenueOption[];
  activeVenueId: string | null;
};

export function VenueSwitcher({
  venues,
  activeVenueId,
}: VenueSwitcherProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleChange(nextVenueId: string) {
    startTransition(async () => {
      const result = await setActiveVenue(nextVenueId);

      if (result.ok) {
        router.refresh();
      } else {
        alert(result.message);
      }
    });
  }

  return (
    <div className="relative">
      <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-zinc-500">
        <ChevronDown className="h-4 w-4" />
      </div>

      <select
        value={activeVenueId ?? ""}
        onChange={(e) => handleChange(e.target.value)}
        disabled={isPending}
        className="min-w-[220px] appearance-none rounded-2xl border border-white/10 bg-white/5 px-4 py-3 pr-10 text-sm font-medium text-white outline-none transition hover:border-[#D4AF37]/30 disabled:opacity-50"
      >
        {venues.map((venue) => (
          <option key={venue.id} value={venue.id} className="bg-[#111111]">
            {venue.name}
          </option>
        ))}
      </select>
    </div>
  );
}