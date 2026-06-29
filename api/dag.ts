import type { StepStatus, WorkflowStep } from "./types";

const Dag = 
(steps:WorkflowStep[],
stepsStatus: Record<string,StepStatus>)
:WorkflowStep[] => {
    const doneSteps:WorkflowStep[]  = []
    if(!steps){
        return doneSteps
    }
    for(let i=0;i<steps.length;i++) {
        const step = steps[i]
        if(!step){
            continue
        }
        if(!step.dependsOn || step.dependsOn.length === 0){
            if(stepsStatus[step.id] === 'COMPLETED'){
                doneSteps.push(step)
            }
            continue
        }
        // for(let j =0 ; j< step.dependsOn.length;j++ ){
        //     const depend = step.dependsOn[j]
        //     if(!depend){
        //         continue
        //     }
        //     const result = stepsStatus[depend]

        // }
        if(stepsStatus[step.id] != 'COMPLETED'){
            continue
        }
        let count = 0 
        while(count < step.dependsOn.length){
            const depend = step.dependsOn[count]
            if(!depend){
                count++
                continue
            }
            const result = stepsStatus[depend]
            if(result != 'COMPLETED'){
                break
            }

            count++
        }
        if(count != step.dependsOn.length){
            continue
        }
        doneSteps.push(step)
    }

    return doneSteps
    
}

export default Dag