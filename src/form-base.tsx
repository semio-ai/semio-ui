export function FormBase({ children, title }: { children: React.ReactNode; title?: string }) {
  return (
    <div className="flex items-center justify-center">
      <div className="max-w-(--breakpoint-md) min-w-72 rounded-lg bg-white p-8 shadow-lg">
        <h2 className="mb-4 text-center text-2xl font-bold">{title}</h2>
        {children}
      </div>
    </div>
  );
}
