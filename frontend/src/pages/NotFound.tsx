export default function NotFound() {
  return (
    <div className="relative min-h-screen">
      <div
        className="pointer-events-none absolute inset-0 bg-[url('/background.png')] bg-[length:420px] bg-center opacity-40 mix-blend-multiply"
        aria-hidden
      />
      <div className="relative mx-auto max-w-3xl p-6 text-center">
        <h1 className="mb-2 text-2xl font-bold">404</h1>
        <p className="text-gray-700">Página não encontrada.</p>
      </div>
    </div>
  );
}

