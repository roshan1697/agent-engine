import { describe, expect, test } from 'bun:test'
import { validateGraph } from "../validategraph"
import type { WorkflowStep } from "../types"

describe('validateGraph', () => {
    test('accepts a valid DAG', () => {
        const steps: WorkflowStep[] = [
            { id: "A", command: "..." },
            { id: "B", command: "...", dependsOn: ["A"] },
            { id: "C", command: "...", dependsOn: ["A"] },
            { id: "D", command: "...", dependsOn: ["B", "C"] },
        ]
        expect(validateGraph(steps)).toEqual({ valid: true })
    })

    test('rejects duplicate step ids', () => {
        const steps: WorkflowStep[] = [
            { id: "A", command: "..." },
            { id: "A", command: "..." },
        ]
        const result = validateGraph(steps)
        expect(result.valid).toBe(false)
        if (!result.valid) {
            expect(result.errors.some(e => e.includes('duplicate step id'))).toBe(true)
        }
    })

    test('rejects a dependsOn reference to a step that does not exist', () => {
        const steps: WorkflowStep[] = [
            { id: "A", command: "..." },
            { id: "B", command: "...", dependsOn: ["does-not-exist"] },
        ]
        const result = validateGraph(steps)
        expect(result.valid).toBe(false)
        if (!result.valid) {
            expect(result.errors.some(e => e.includes('unknown step'))).toBe(true)
        }
    })

    test('rejects a direct cycle (A -> B -> A)', () => {
        const steps: WorkflowStep[] = [
            { id: "A", command: "...", dependsOn: ["B"] },
            { id: "B", command: "...", dependsOn: ["A"] },
        ]
        const result = validateGraph(steps)
        expect(result.valid).toBe(false)
        if (!result.valid) {
            expect(result.errors.some(e => e.includes('cycle'))).toBe(true)
        }
    })

    test('rejects a self-dependency', () => {
        const steps: WorkflowStep[] = [
            { id: "A", command: "...", dependsOn: ["A"] },
        ]
        const result = validateGraph(steps)
        expect(result.valid).toBe(false)
        if (!result.valid) {
            expect(result.errors.some(e => e.includes('cycle'))).toBe(true)
        }
    })

    test('rejects an indirect cycle (A -> B -> C -> A)', () => {
        const steps: WorkflowStep[] = [
            { id: "A", command: "...", dependsOn: ["C"] },
            { id: "B", command: "...", dependsOn: ["A"] },
            { id: "C", command: "...", dependsOn: ["B"] },
        ]
        const result = validateGraph(steps)
        expect(result.valid).toBe(false)
    })

    test('accepts an empty graph', () => {
        expect(validateGraph([])).toEqual({ valid: true })
    })
})