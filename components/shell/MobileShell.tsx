export default function MobileShell({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    /*
     * The app frame. Fills the dynamic viewport (accounts for mobile browser
     * chrome appearing/disappearing). overflow-hidden prevents any child from
     * causing document scroll — all scrolling happens inside content areas.
     */
    <div
      className="relative w-full overflow-hidden bg-white dark:bg-neutral-950"
      style={{ height: "100dvh" }}
    >
      {children}
    </div>
  );
}
