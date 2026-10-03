export default function ToolsLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <section className="bg-slate-950 text-white">
      <div className="mx-auto max-w-6xl px-6 py-10">
        {children}
      </div>
    </section>
  );
}