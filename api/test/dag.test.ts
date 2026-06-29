import Dag from "../dag";
import { describe, expect, test } from 'bun:test'
import type { StepStatus, WorkflowStep } from "../types";

describe('DAG', () => {

    test('test1', () => {
        const steps: WorkflowStep[] = [
            { id: "A", command: "sleep 2 && echo A" },
            { id: "B", command: "sleep 5 && echo B", dependsOn: ["A"] },
            { id: "C", command: "sleep 5 && echo C", dependsOn: ["A"] },
            { id: "D", command: "echo D", dependsOn: ["B", "C"] }
        ]
        const stepsStatus: Record<string, StepStatus> = {
            A: "PENDING",
            B: "QUEUED",
            C: "COMPLETED",
            D: "RUNNING"
        }
        const resultSteps = Dag(steps,stepsStatus)
        expect(resultSteps.length).toBe(0)
    })

    test('test1', () => {
        const steps: WorkflowStep[] = [
            { id: "A", command: "sleep 2 && echo A" },
            { id: "B", command: "sleep 5 && echo B", dependsOn: ["A"] },
            { id: "C", command: "sleep 5 && echo C", dependsOn: ["A"] },
            { id: "D", command: "echo D", dependsOn: ["B", "C"] }
        ]
        const stepsStatus: Record<string, StepStatus> = {
            A: "COMPLETED",
            B: "QUEUED",
            C: "COMPLETED",
            D:"RUNNING"
        }
        const resultSteps = Dag(steps,stepsStatus)
        expect(resultSteps.length).toBe(2)
    })



})
