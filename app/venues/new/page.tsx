import { AppShell } from "@/components/layout/app-shell";
import { NewVenueForm } from "@/components/venues/new-venue-form";

export default function NewVenuePage() {
  return (
    <AppShell>
      <div className="mx-auto max-w-4xl space-y-6">
        <div>
          <p className="text-sm uppercase tracking-[0.28em] text-[#D4AF37]/80">
            Boliches
          </p>
          <h1 className="mt-2 text-4xl font-semibold text-white">
            Nuevo boliche
          </h1>
          <p className="mt-2 text-zinc-400">
            Creá el contenedor principal (tenant) del sistema.
          </p>
        </div>

        <div className="rounded-[28px] border border-white/10 bg-gradient-to-br from-[#131313] to-[#090909] p-6">
          <NewVenueForm />
        </div>
      </div>
    </AppShell>
  );
}