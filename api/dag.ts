import type { StepStatus, WorkflowStep } from "./types";

const Dag = 
(steps:WorkflowStep[],
stepsStatus: Record<string,StepStatus>)
:WorkflowStep[] => {
    const doneSteps:WorkflowStep[] = steps.filter((s)=> s.dependsOn?.length === 0)
    for(let i=0;i<=steps.length;i++) {

    }

    return doneSteps
    
}