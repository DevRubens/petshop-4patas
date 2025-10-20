import { useState } from 'react'
import Card from '../components/Card'
import Button from '../components/Button'
import Input from '../components/Input'

type Item = { id: number; nome: string; qtd: number; preco: number }

export default function Venda() {
  const [itens, setItens] = useState<Item[]>([])
  const [nome, setNome] = useState('Ração Premium 10kg')
  const [qtd, setQtd] = useState(1)
  const [preco, setPreco] = useState(199.9)

  const addItem = () => {
    if (!nome || qtd <= 0 || preco <= 0) return
    setItens(i => [...i, { id: Date.now(), nome, qtd, preco }])
  }

  const total = itens.reduce((acc, i) => acc + i.qtd * i.preco, 0)

  return (
    <div className="max-w-6xl mx-auto p-4 grid gap-4 md:grid-cols-3">
      <Card className="md:col-span-2">
        <h2 className="text-lg font-semibold mb-2">Nova Venda</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Input label="Produto" value={nome} onChange={e => setNome(e.target.value)} />
          <Input label="Qtd" type="number" value={qtd} onChange={e => setQtd(Number(e.target.value))} />
          <Input label="Preço" type="number" step="0.01" value={preco} onChange={e => setPreco(Number(e.target.value))} />
        </div>
        <div className="mt-3">
          <Button onClick={addItem}>Adicionar</Button>
        </div>

        <div className="mt-4">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left border-b">
                <th className="py-2">Produto</th>
                <th className="py-2">Qtd</th>
                <th className="py-2">Preço</th>
                <th className="py-2">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {itens.map(i => (
                <tr key={i.id} className="border-b">
                  <td className="py-2">{i.nome}</td>
                  <td className="py-2">{i.qtd}</td>
                  <td className="py-2">R$ {i.preco.toFixed(2)}</td>
                  <td className="py-2">R$ {(i.qtd * i.preco).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={3} className="py-2 text-right font-semibold">Total:</td>
                <td className="py-2 font-semibold">R$ {total.toFixed(2)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </Card>

      <Card>
        <h3 className="font-semibold mb-2">Preview</h3>
        <img src="/Venda.png" alt="Venda" className="rounded-xl border" onError={(e)=>{(e.target as HTMLImageElement).style.display='none'}}/>
      </Card>
    </div>
  )
}
