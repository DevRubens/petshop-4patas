export default function Home() {
  return (
    <div className="flex h-full min-h-[60vh] flex-col items-center justify-center gap-6 text-center">
      <div className="rounded-[48px] bg-white/70 px-10 py-12 shadow-2xl shadow-[#b8d1c6]/50 backdrop-blur-sm sm:px-16 sm:py-16">
        <img
          src="/logo-4patas.png"
          alt="Petshop 4 Patas"
          className="mx-auto w-[220px] max-w-full sm:w-[280px]"
          draggable={false}
        />
      </div>

      <div className="max-w-2xl text-sm text-[#4f6c5c]">
        <p>
          Bem-vindo ao painel do <strong>Petshop 4 Patas</strong>. Utilize o menu ao lado
          para iniciar vendas, cadastrar novos colaboradores e acompanhar o desempenho
          da loja.
        </p>
      </div>
    </div>
  );
}
