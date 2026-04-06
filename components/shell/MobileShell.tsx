export default function MobileShell({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative w-full h-[100dvh] overflow-hidden bg-white">
      {children}
    </div>
  );
}
