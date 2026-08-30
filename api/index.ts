import express from 'express'

import { WorkflowSchema } from './types'
import graphResolve from './graphresolve'
import cors from 'cors'
import { validateGraph } from './validategraph'

const app = express()

app.use(express.json())
app.use(cors({
    origin:'http://localhost:5173',
    
}))
app.get('/')

app.get('/workflow',async(req,res)=>{
    const workflow =  req.body.workflow
    

    
})



app.post('/work', async(req,res)=>{
    res.setHeader('Content-Type', 'application/x-ndjson')
    res.setHeader('Cache-Control', 'no-cache')
    res.flushHeaders()
    const workflow = WorkflowSchema.safeParse(req.body.data)
    
    if(!workflow.success){
        res.status(511).json({message:'validation error'})
        return
    }

    const validation = validateGraph(workflow.data.steps)
    if (!validation.valid) {
        res.status(400).json({ message: 'invalid workflow graph', errors: validation.errors })
        return
    }
    try {
        await graphResolve(workflow.data.steps , res)
    } catch (error) {
        console.error('workflow execution failed:', error)
        res.write(JSON.stringify({ type: 'flow-error', message: 'internal error while executing workflow' }) + '\n')
    }
    finally{
        res.end()

    }

})

app.listen('3000',async()=>
    console.log('server is running on port 3000')
)

