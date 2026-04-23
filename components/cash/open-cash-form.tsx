"use client";

import { useState, useTransition } from "react";
import { openCash } from "@/actions/cash/open-cash";
import { useRouter } from "next/navigation";

export function OpenCashForm({ nights }: any) {
  const [nightId, setNightId] = useState(nights[0]?.id || "");
  const [opening, setOpening] = useState(0);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function submit(e: any) {
    e.preventDefault();

    startTransition(async () => {
      const res = await openCash({ nightId, opening });

      if (res.ok) {
        router.refresh();
      } else {
        alert(res.message);
      }
    });
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <select value={nightId} onChange={(e) => setNightId(e.target.value)}>
        {nights.map((n: any) => (
          <option key={n.id} value={n.id}>
            {n.name}
          </option>
        ))}
      </select>

      <input
        type="number"
        value={opening}
        onChange={(e) => setOpening(Number(e.target.value))}
      />

      <button type="submit">
        {isPending ? "Abriendo..." : "Abrir caja"}
      </button>
    </form>
  );
}