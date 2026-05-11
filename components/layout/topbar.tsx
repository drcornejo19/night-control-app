import { UserButton } from "@clerk/nextjs";
import { getCurrentAppUser, getEffectiveRoleForActiveVenue } from "@/lib/auth";
import { getActiveVenue } from "@/lib/venues/active-venue";

export async function Topbar() {
  const [currentUser, activeVenue, effectiveRole] = await Promise.all([
    getCurrentAppUser(),
    getActiveVenue(),
    getEffectiveRoleForActiveVenue(),
  ]);

  return (
    <header className="sticky top-0 z-30 border-b border-white/10 bg-black/40 backdrop-blur-xl">
      <div className="flex min-h-[80px] items-center justify-between gap-4 px-4 md:px-6 xl:px-8">
        <div>
          <p className="text-[11px] uppercase tracking-[0.28em] text-zinc-500">
            Boliche activo
          </p>
          <p className="mt-2 text-sm font-medium text-white">
            {activeVenue?.name ?? "Sin boliche"}
          </p>
        </div>

        <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-3 py-2.5">
          <UserButton
            appearance={{
              elements: {
                avatarBox: "h-10 w-10",
              },
            }}
          />

          <div className="hidden sm:block">
            <p className="text-sm font-semibold text-white">
              {currentUser?.fullName || currentUser?.email || "Usuario"}
            </p>
            <p className="text-xs text-zinc-400">
              Rol efectivo: {effectiveRole ?? currentUser?.role ?? "Sin rol"}
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}