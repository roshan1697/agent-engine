import {z} from 'zod'

export type StepStatus = "PENDING" | "QUEUED" | "RUNNING" | "COMPLETED" | "FAILED"

export type WorkflowStep = {
    id:string
    command:string
    dependsOn?:string[]
    retries?: number
}

export const WorkflowSchema = z.object({
    workflowId: z.string(),
    steps:z.object({
        id: z.string(),
        command: z.string(),
        dependsOn: z.string().array().optional(),
        retries: z.number().optional()
    }).array()
})


export type Workflow = {
    workflowId: string
    steps: WorkflowStep[]
}

export type QueuedStep = {
    stepId: string
    workflowId: string
    command: string
    enqueuedAt: number
}

export type StepResult = {
    stepId: string
    workflowId: string
    podId: string
    status: "RUNNING" | "COMPLETED" | "FAILED"
    stdout?: string
    exitCode?: number
    error?: string
}   

export type FlowEvent =
    | { nodeId: string; type: "chunk"; content: string }
    | { nodeId: string; type: "done" }
    | { nodeId: string; type: "error"; message: string }
    | { nodeId: string; type: "skipped"; message: string }
    | { type: "flow-done" }
    | { type: "flow-error"; message: string }

