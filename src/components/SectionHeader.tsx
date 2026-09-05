import type { ReactNode } from 'react';

interface SectionHeaderProps {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: ReactNode;
}

export default function SectionHeader({
  eyebrow,
  title,
  description,
  action,
}: SectionHeaderProps) {
  return (
    <div className="mb-8 flex flex-col gap-5 border-b border-noviq-border pb-6 lg:flex-row lg:items-end lg:justify-between">
      <div className="max-w-2xl">
        {eyebrow ? (
          <p className="mb-3 text-xs font-semibold uppercase text-noviq-gold">{eyebrow}</p>
        ) : null}
        <h2 className="font-heading text-2xl font-bold text-noviq-text sm:text-3xl">{title}</h2>
        {description ? (
          <p className="mt-3 text-sm leading-7 text-noviq-secondaryText">{description}</p>
        ) : null}
      </div>
      {action ? <div className="flex shrink-0 items-center">{action}</div> : null}
    </div>
  );
}
