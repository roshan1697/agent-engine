import express from 'express'

import { WorkflowSchema } from './types'
import graphResolve from './graphresolve'

const app = express()

app.use(express.json())

app.get('/')

app.get('/workflow',async(req,res)=>{
    const workflow =  req.body.workflow
    

    
})



app.get('/work', async(req,res)=>{
    const workflow = WorkflowSchema.safeParse(req.body)
    if(!workflow.success){
        res.status(404).json({message:'validation error'})
        return
    }
    const response = await graphResolve(workflow.data.steps)
    res.status(200).json({response})
})

app.listen('3000',()=>
    console.log('server is running on port 3000')
)

