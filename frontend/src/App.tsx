
import { useState } from 'react'
import BasicInput from './components/basicinput'
import axios from 'axios'
import { useFlowStore } from './store/store'

function App() {
  const [form, setForm] = useState({
    first: '',
    second: '',
    third: '',
    fourth: ''
  })
  const [data, setData] = useState([])
  const { setStatus, appendChunk } = useFlowStore.getState()

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((perv) =>
    ({
      ...perv,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const data = {
      workflowId: '934893',
      steps: [
        { id: 'A', command: form.first },
        { id: 'B', command: form.second, dependsOn: ['A'] },
        { id: 'C', command: form.third, dependsOn: ['A'] },
        { id: 'D', command: form.fourth, dependsOn: ['B', 'C'] }
      ]
    }
    try {

    
      const response = await fetch('http://localhost:3000/work', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data })
      })
      const reader = response.body!.getReader()
      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { value, done } = await reader.read()
        if (done) {
          break
        }
        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() ?? ''
        for (const line of lines) {
          if (!line.trim()) continue
          const event = JSON.parse(line)
          if (event.type === 'flow-done') continue

          if (event.type === 'start') setStatus(event.nodeId, 'streaming')
          if (event.type === 'chunk') appendChunk(event.nodeId, event.content)
          if (event.type === 'done') setStatus(event.nodeId, 'done')
        }
      }
    } catch (error) {
      console.log(error)
    }

  }

  return (
    <>
      <div className='text-3xl text-white'>home</div>
      <form onSubmit={handleSubmit}>

        <div className='text-left'>
          first message
          <BasicInput
            name='first'
            value={form.first}
            onChange={handleChange}
          />
        </div>
        <div className='text-left'>
          second message
          <BasicInput
            name='second'
            value={form.second}
            onChange={handleChange}
          />
        </div>
        <div className='text-left'>
          third message
          <BasicInput
            value={form.third}
            name='third'
            onChange={handleChange}
          />
        </div>
        <div className='text-left'>
          fourth message
          <BasicInput
            value={form.fourth}
            name='fourth'
            onChange={handleChange}
          />
        </div>
        <div className='flex gap-50'>
          <button className="rounded-md border border-transparent py-2 px-4 
        text-center text-sm transition-all text-slate-600 hover:bg-slate-100 
        focus:bg-slate-100 active:bg-slate-100 disabled:pointer-events-none 
        disabled:opacity-50 disabled:shadow-none bg-white" type="button">
            clear
          </button>
          <button className="rounded-md border border-transparent py-2 px-4 text-center
        text-sm transition-all text-slate-600 hover:bg-slate-100 focus:bg-slate-100
        active:bg-slate-100 bg-white disabled:pointer-events-none disabled:opacity-50
        disabled:shadow-none" type="submit">
            submit
          </button>
        </div>
      </form>


      <div className='text-3xl text-white'>

        {/* {
            data.length === 0 ? <span>Loading...</span> : data.map((d,i) => (
              <span key={i}>
                <h1>{d.id}</h1>
                <a>{d.result}</a>
              </span>
            ))
          } */}

        <div className="space-y-3">
          <FlowNodeCard id="A" />
          <div className="grid grid-cols-2 gap-3">
            <FlowNodeCard id="B" />
            <FlowNodeCard id="C" />
          </div>
          <FlowNodeCard id="D" />
        </div>

      </div>
    </>
  )
}

export default App


function FlowNodeCard({ id }: { id: string }) {
  const node = useFlowStore(s => s.nodes[id]);

  const statusColor =
    node?.status === 'done' ? 'border-green-500' :
    node?.status === 'streaming' ? 'border-blue-500 animate-pulse' :
    'border-gray-300';

  return (
    <div className={`rounded-lg border-2 p-3 space-y-1 ${statusColor}`}>
      <div className="text-xs uppercase tracking-wide opacity-60">
        {id} · {node?.status ?? 'idle'}
      </div>
      <pre className="whitespace-pre-wrap text-sm min-h-6">
        {node?.text ?? ''}
      </pre>
    </div>
  );
}