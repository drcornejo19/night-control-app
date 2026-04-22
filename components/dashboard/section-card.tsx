type SectionCardProps = {
  title: string;
  action?: string;
  children: React.ReactNode;
};

export function SectionCard({
  title,
  action,
  children,
}: SectionCardProps) {
  return (
    <section className="rounded-[30px] border border-white/10 bg-gradient-to-br from-[#111111] to-[#090909] p-5 md:p-6">
      <div className="mb-5 flex items-center justify-between gap-4">
        <h2 className="text-sm font-semibold uppercase tracking-[0.28em] text-white/90">
          {title}
        </h2>

        {action ? (
          <button className="text-sm font-medium text-[#D4AF37] transition hover:text-[#E8C764]">
            {action}
          </button>
        ) : null}
      </div>

      {children}
    </section>
  );
}