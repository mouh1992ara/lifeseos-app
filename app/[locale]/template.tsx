/**
 * A template (unlike a layout) gets a new instance on every navigation, so the
 * page subtree — headings included — remounts when the visitor switches
 * language or changes route. That is what lets the per-language entrance
 * animation replay instead of silently keeping the previous state.
 */
export default function LocaleTemplate({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
