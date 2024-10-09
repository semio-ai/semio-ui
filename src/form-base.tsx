export function FormBase({ children, title }: { children: React.ReactNode; title?: string }) {
  return (
    <div className="flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg min-w-72 max-w-screen-md">
        <h2 className="text-2xl font-bold mb-4 text-center">{title}</h2>
        {children}
      </div>
    </div>
  );
}
