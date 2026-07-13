import type { Response } from "express"
import AICall from "./aicall"
import type { WorkflowStep } from "./types"

const graphResolve = async (steps: WorkflowStep[], res: Response): Promise<{ result: string, id: string }[]> => {
    return new Promise(async (resolve) => {
        if (!steps.length) {
            resolve([])
            return
        }
        const firstStep = steps.filter(step => !step.dependsOn || step.dependsOn.length === 0)

        const result = await Promise.all(firstStep.map(step => AICall(step.command)))

        for await (const chunk of result) {
            for await (const stream of chunk){
                console.log(stream.delta.text)
            }
            if (chunk) {
               // res.write(chunk)
            }
        }
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