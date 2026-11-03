import { Link } from "@/i18n/navigation";
import type { LucideIcon } from "lucide-react";
import { ArrowRight, Briefcase, FileText, Youtube } from "lucide-react";
import { audiences, type AudienceSlug } from "@/lib/audiences";

const icons: Record<AudienceSlug, LucideIcon> = {
  youtubers: Youtube,
  bloggers: FileText,
  agencies: Briefcase,
};

const order: AudienceSlug[] = ["youtubers", "bloggers", "agencies"];

export default function AudienceCards() {
  return (
    <section className="px-6 py-24 sm:px-10 lg:px-16">
      <div className="mx-auto max-w-7xl">
        <div className="max-w-2xl">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Built for how you work
          </h2>
          <p className="mt-4 text-lg leading-8 text-slate-400">
            Pick your workflow and start with the tools that fit it.
          </p>
        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {order.map((slug) => {
            const audience = audiences[slug];
            const Icon = icons[slug];
            return (
              <Link
                key={slug}
                href={"/for/" + slug}
                className="group rounded-2xl border border-white/10 bg-white/[0.025] p-7 transition hover:-translate-y-0.5 hover:border-emerald-400/30 hover:bg-white/[0.045]"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-400/10 text-emerald-300">
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="mt-5 text-lg font-semibold text-white">
                  {audience.eyebrow}
                </h3>
                <p className="mt-2 text-sm leading-6 text-slate-400">
                  {audience.subheadline}
                </p>
                <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-emerald-300">
                  See the tools
                  <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5 rtl:rotate-180" />
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
