export type StepStatus = "PENDING" | "QUEUED" | "RUNNING" | "COMPLETED" | "FAILED"

export type WorkflowStep = {
    id: string
    command: string
    dependsOn?: string[]
    retries?: number
}

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