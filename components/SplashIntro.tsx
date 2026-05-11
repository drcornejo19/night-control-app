"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

export function SplashIntro() {
  const [show, setShow] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShow(false);
    }, 2200);

    return () => clearTimeout(timer);
  }, []);

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black">
      <div className="flex flex-col items-center text-center">
        <Image
          src="/night-control-emblem-crop.png"
          alt="Night Control"
          width={150}
          height={150}
          priority
          className="mb-6 object-contain drop-shadow-[0_0_40px_rgba(212,175,55,0.65)]"
        />

        <p className="mb-2 text-xs font-bold uppercase tracking-[0.45em] text-[#D4AF37]">
          Night Control
        </p>

        <h1 className="text-3xl font-black text-white md:text-5xl">
          Gestión inteligente
        </h1>

        <p className="mt-3 text-sm uppercase tracking-[0.3em] text-[#D4AF37]">
          para tu negocio
        </p>
      </div>
    </div>
  );
}