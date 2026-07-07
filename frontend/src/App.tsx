
import { useState } from 'react'
import BasicInput from './components/basicinput'
import axios from 'axios'

function App() {
  const [form, setForm] = useState({
    first: '',
    second: '',
    third: '',
    fourth: ''
  })  

  const handleChange = (e) => {
    const {name , value} = e.target
    setForm((perv)=> 
    ({
      ...perv,
      [name]:value
    }))
  }

  const handleSubmit = async(e) => {
    e.preventDefault()
    const data =  {
  workflowId: '934893',
  steps: [
    { id: 'A', command: form.first },
    { id: 'B', command: form.second, dependsOn: ['A'] },
    { id: 'C', command: form.third, dependsOn: ['A'] },
    { id: 'D', command: form.fourth, dependsOn: ['B', 'C'] }
  ]
}
    //const stringData = JSON.stringify(data)
    try {
        const res = await axios.post('http://localhost:3000/work', {data})
    console.log(res)
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
          name= 'third'
            onChange={handleChange}
          />
        </div>
        <div className='text-left'>
          fourth message
          <BasicInput
            value={form.fourth}
          name = 'fourth'
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
      <div>
        
      </div>
    </>
  )
}

export default App
