import express from 'express'

const app = express()

app.use(express.json())

app.get('/')

app.get('/workflow',async(req,res)=>{
    const workflow =  req.body.workflow
    const task = workflow.filter(task => task.dependsOn.length === 0 || task.dependsOn === undefined)

    for(let i = 0; i < workflow.length; i++
    ){
        if(workflow[i].dependsOn.length === 0 || workflow[i].dependsOn === undefined){
            continue
        }
        const depend = workflow[i].dependsOn
        let count = 0
        while(count < depend.length){
            const dependId = depend[count]
            const val = task.some(t => t.id === dependId)
            if(!val){
                break
            }
            count++
        }
        if(count != depend.length){
            continue
        }
        task.push(workflow[i])
    }

    
})

const AICall = async(message) => {
    return message
}

app.get('/work', async(req,res)=>{
    const workflow = req.body
    const response = await getMessage(workflow.steps)
    res.status(200).json({response})
})

app.listen('3000',()=>
    console.log('server is running on port 3000')
)

const getMessage = async(steps) => {
    return new Promise(async(resolve)=>{

        const firstStep = steps.filter(step => !step.dependsOn || step.dependsOn.length === 0)
        const result = await Promise.all( firstStep.map(step => AICall(step.message)))
        steps = steps.map(step => {
            if(step.dependsOn){
                return {
                    ...step,
                    
                }
            }
        })

    })
}