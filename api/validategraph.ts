


export type GraphValidationResult =
    | { valid: true }
    | { valid: false; errors: string[] }

export const validateGraph = (steps: WorkflowStep[]): GraphValidationResult => {
    const errors: string[] = []

    const idCounts = new Map<string, number>()
    for (const step of steps) {
        idCounts.set(step.id, (idCounts.get(step.id) ?? 0)  1)
    }
    for (const [id, count] of idCounts) {
        if (count > 1) errors.push(`duplicate step id: "${id}"`)
    }

    const idSet = new Set(steps.map(s => s.id))
    for (const step of steps) {
        for (const dep of step.dependsOn ?? []) {
            if (!idSet.has(dep)) {
                errors.push(`step "${step.id}" depends on unknown step "${dep}"`)
            }
        }
    }

    if (errors.length) {
        
        return { valid: false, errors }
    }

    const byId = new Map(steps.map(s => [s.id, s]))
    const WHITE = 0, GRAY = 1, BLACK = 2
    const color = new Map<string, 0 | 1 | 2>(steps.map(s => [s.id, WHITE]))

    const visit = (id: string, path: string[]): string[] | null => {
        color.set(id, GRAY)
        const step = byId.get(id)
        for (const dep of step?.dependsOn ?? []) {
            if (color.get(dep) === GRAY) return [...path, id, dep]
            if (color.get(dep) === WHITE) {
                const cycle = visit(dep, [...path, id])
                if (cycle) return cycle
            }
        }
        color.set(id, BLACK)
        return null
    }

    for (const step of steps) {
        if (color.get(step.id) === WHITE) {
            const cycle = visit(step.id, [])
            if (cycle) {
                errors.push(`dependency cycle detected: ${cycle.join(" -> ")}`)
                break
            }
        }
    }

    return errors.length ? { valid: false, errors } : { valid: true }
}