import express from 'express'

import { WorkflowSchema } from './types'
import graphResolve from './graphresolve'
import cors from 'cors'

const app = express()

app.use(express.json())
app.use(cors({
    origin:'http://localhost:5173/',
     methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
      optionsSuccessStatus: 200 
}))
app.get('/')

app.get('/workflow',async(req,res)=>{
    const workflow =  req.body.workflow
    

    
})



app.post('/work', async(req,res)=>{
    const workflow = WorkflowSchema.safeParse(req.body)
    console.log(req.body)
    if(!workflow.success){
        res.status(504).json({message:'validation error'})
        return
    }
    const response = await graphResolve(workflow.data.steps)
    res.status(200).json({response})
})

app.listen('3000',()=>
    console.log('server is running on port 3000')
)

