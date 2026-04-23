type DashboardSectionProps = {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
};

export function DashboardSection({
  title,
  subtitle,
  action,
  children,
}: DashboardSectionProps) {
  return (
    <section className="rounded-[30px] border border-white/10 bg-gradient-to-br from-[#111111] to-[#090909] p-5 md:p-6">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-[0.28em] text-white">
            {title}
          </h2>
          {subtitle ? (
            <p className="mt-2 text-sm text-zinc-400">{subtitle}</p>
          ) : null}
        </div>

        {action}
      </div>

      {children}
    </section>
  );
}