import type { Response } from "express"
import AICall from "./aicall"
import type { WorkflowStep } from "./types"

const graphResolve = async (steps: WorkflowStep[], res: Response): Promise<{ result: string, id: string }[]> => {
    const send = (obj:unknown) => res.write(JSON.stringify(obj) + '\n')
    return new Promise(async (resolve) => {
        if (!steps.length) {

            send({type:'flow-done'})
            res.end()
            console.log({type:'flow-done'})
            resolve([])
            return
        }
        const firstStep = steps.filter(step => !step.dependsOn || step.dependsOn.length === 0)

        await Promise.all(firstStep.map( async   (step) => {
            
            const res = await AICall(step.command)
            for await (const chunk of res){
                if(chunk.message.content != ''){

                    console.log({nodeId:step.id, type:'chunk', content:chunk.message.content})
                    send({nodeId:step.id, type:'chunk', content:chunk.message.content})
                }
                if(chunk.done === true){
                    console.log({nodeId:step.id, type: 'done'})
                    send({nodeId:step.id, type: 'done'})
                }
            }
        }))

        
        steps = steps.map(step => {
            if (step.dependsOn) {
                return {
                    ...step,
                    dependsOn: step.dependsOn.filter(s => !firstStep.map(v => v.id).includes(s))

                }
            }
            else {
                return step
            }
        }).filter(step => !firstStep.map(s => s.id).includes(step.id))


        resolve(
            await graphResolve(steps, res)
        )


    })
}

export default graphResolve