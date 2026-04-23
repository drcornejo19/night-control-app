"use client";

import { useState, useTransition } from "react";
import { closeCash } from "@/actions/cash/close-cash";
import { useRouter } from "next/navigation";

export function CloseCashForm({ cashBox }: any) {
  const [closing, setClosing] = useState(0);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function submit(e: any) {
    e.preventDefault();

    startTransition(async () => {
      const res = await closeCash({
        cashBoxId: cashBox.id,
        closing,
      });

      if (res.ok) {
        router.refresh();
      } else {
        alert(res.message);
      }
    });
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <input
        type="number"
        value={closing}
        onChange={(e) => setClosing(Number(e.target.value))}
      />

      <button type="submit">
        {isPending ? "Cerrando..." : "Cerrar caja"}
      </button>
    </form>
  );
}