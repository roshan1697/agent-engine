import express from 'express'

const app = express()

app.use(express.json())

app.get('/')

app.get('/workflow',(req,res)=>{
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

app.listen('3000',()=>
    console.log('server is running on port 3000')
)