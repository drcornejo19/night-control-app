"use client";

import { type FormEvent, useState, useTransition } from "react";
import { openCash } from "@/actions/cash/open-cash";
import { useRouter } from "next/navigation";

type NightOption = {
  id: string;
  name: string;
};

type OpenCashFormProps = {
  nights: NightOption[];
};

export function OpenCashForm({ nights }: OpenCashFormProps) {
  const [nightId, setNightId] = useState(nights[0]?.id || "");
  const [opening, setOpening] = useState(0);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function submit(e: FormEvent<HTMLFormElement>) {
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
        {nights.map((n) => (
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
