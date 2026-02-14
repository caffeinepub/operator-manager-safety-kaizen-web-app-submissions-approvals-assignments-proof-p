export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="container max-w-7xl mx-auto py-8 px-4">
      {children}
    </div>
  );
}
