import Card from '../components/Card'

export default function Home() {
  return (
    <div className="max-w-6xl mx-auto p-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <Card className="md:col-span-2">
        <h2 className="text-lg font-semibold mb-2">Bem-vindo(a)!</h2>
        <p className="text-gray-600">Esta é a tela inicial do Petshop 4 Patas. Personalize widgets e atalhos aqui.</p>
        <img src="/Tela Inicial.png" alt="Tela Inicial" className="mt-3 rounded-xl border max-h-64 object-cover" onError={(e)=>{(e.target as HTMLImageElement).style.display='none'}}/>
      </Card>

      <Card>
        <h3 className="font-semibold mb-2">Atalhos</h3>
        <ul className="text-sm list-disc pl-5 space-y-1">
          <li>Nova venda</li>
          <li>Cadastro de produtos</li>
          <li>Relatórios</li>
        </ul>
      </Card>

      <Card className="md:col-span-2">
        <h3 className="font-semibold mb-2">Avisos</h3>
        <p className="text-sm text-gray-600">Coloque aqui avisos e notificações para os atendentes.</p>
      </Card>
    </div>
  )
}
