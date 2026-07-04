import AICall from "./aicall"
import type { WorkflowStep } from "./types"

const graphResolve = async(steps:WorkflowStep[]):Promise<{result:string,id:string}[] > => {
    return new Promise(async(resolve)=>{
        if(!steps.length){
            resolve([])
            return
        }
        const firstStep = steps.filter(step => !step.dependsOn || step.dependsOn.length === 0)
    
        const result = await Promise.all( firstStep.map(step => AICall(step.command)))
        steps = steps.map(step => {
            if(step.dependsOn){
                return {
                    ...step,
                    dependsOn: step.dependsOn.filter(s => !firstStep.map(v => v.id).includes(s))
                    
                }
            }
            else {
                return step
            }
        }).filter(step => !firstStep.includes(step))

        resolve([
            ...result.map((r,ind) => ({
                result:r.result,
                id:firstStep[ind]!.id
            }) ), ...await graphResolve(steps)
        ])


    })
}

export default graphResolve