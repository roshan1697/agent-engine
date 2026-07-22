import express from 'express'

import { WorkflowSchema } from './types'
import graphResolve from './graphresolve'
import cors from 'cors'

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
    try {
        await graphResolve(workflow.data.steps , res)
        res.end()
    } catch (error) {
        console.error(error)
    }

})

app.listen('3000',()=>
    console.log('server is running on port 3000')
)

