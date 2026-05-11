import Link from "next/link";
import { navigationItems } from "@/lib/constants/navigation";
import { getCurrentAppUser, getEffectiveRoleForActiveVenue, hasRole } from "@/lib/auth";

export async function Sidebar() {
  const [currentUser, effectiveRole] = await Promise.all([
    getCurrentAppUser(),
    getEffectiveRoleForActiveVenue(),
  ]);

  const role = effectiveRole ?? currentUser?.role ?? "CASHIER";

  const visibleItems = navigationItems.filter((item) =>
    hasRole(role, item.roles)
  );

  return (
    <aside className="hidden w-72 shrink-0 border-r border-white/10 bg-[#0a0a0a] xl:block">
      <div className="flex h-full flex-col px-5 py-6">
        <div className="mb-8">
          <p className="text-xs uppercase tracking-[0.32em] text-[#D4AF37]/70">
            Night Control
          </p>
          <h1 className="mt-3 text-2xl font-semibold text-white">
            Panel operativo
          </h1>
          <p className="mt-2 text-sm text-zinc-400">
            Rol efectivo: {role}
          </p>
        </div>

        <nav className="flex flex-1 flex-col gap-2">
          {visibleItems.map((item) => {
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className="group flex items-center gap-3 rounded-2xl border border-transparent px-4 py-3 text-sm font-medium text-zinc-300 transition hover:border-white/10 hover:bg-white/5 hover:text-white"
              >
                <Icon className="h-5 w-5 text-zinc-500 transition group-hover:text-[#D4AF37]" />
                <span>{item.title}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}