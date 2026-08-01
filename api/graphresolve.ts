import type { Response } from "express"
import AICall from "./aicall"
import type { WorkflowStep } from "./types"
import { Ollama, type Message, type Tool, type WebSearchRequest } from 'ollama'

const ollama = new Ollama({ host: 'http://127.0.0.1:11434' })
const webRes = async (userquery: string) => {
    return await ollama.webSearch({
        query: userquery,
        maxResults: 3
    })
}

const getWeather = async (loc: string) => {
    const apiKey = process.env.WEATHER_API_KEY
    if (!apiKey) {
        throw new Error("WEATHER_API_KEY is not defined in environment variables");
    }
    console.log(loc)
    const res = await fetch(`https://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${encodeURIComponent(loc)}`)
    const data = await res.json()
    console.log(data)
    return { loc, tempC: data.current.temp_c, condition: data.current.condition.text }
}

const tools: Tool[] = [{
    type: 'function',
    function: {
        name: 'web_res',
        description: 'Search web and gives relevant search result from the web',
        parameters: {
            type: 'object',
            required: ['userquery'],
            properties: {
                userquery: { type: 'string', description: 'user query which need web result ' }
            }
        }
    }
},
{
    type: 'function',
    function: {
        name: 'get_weather',
        description: 'Get the current weather for a given city',
        parameters: {
            type: 'object',
            required: ['loc'],
            properties: {
                loc: { type: 'string', description: 'City name, e.g. "Mumbai"' }
            }
        }
    }

}]



const graphResolve = async (steps: WorkflowStep[], res: Response): Promise<{ result: string, id: string }[]> => {
    const send = (obj: unknown) => res.write(JSON.stringify(obj) + '\n')
    return new Promise(async (resolve) => {
        if (!steps.length) {

            send({ type: 'flow-done' })
            res.end()
            console.log({ type: 'flow-done' })
            resolve([])
            return
        }
        const firstStep = steps.filter(step => !step.dependsOn || step.dependsOn.length === 0)

        await Promise.all(firstStep.map(async (step) => {
            const messages: Message[] = [{
                role: 'user',
                content: step.command
            }]
            while (true) {


                const res = await ollama.chat({
                    model: 'gemma4:12b',
                    stream: true,

                    messages,
                    tools: tools

                })
                const toolCall = []
                for await (const chunk of res) {
                    if (chunk.message.content != '') {

                        console.log({ nodeId: step.id, type: 'chunk', content: chunk.message.content })
                        send({ nodeId: step.id, type: 'chunk', content: chunk.message.content })
                    }
                    if (chunk.done === true) {
                        console.log({ nodeId: step.id, type: 'done' })
                        send({ nodeId: step.id, type: 'done' })
                    }
                    if (chunk.message.tool_calls) {
                        toolCall.push(...chunk.message.tool_calls)
                        console.log(chunk.message.tool_calls)

                    }
                }
                if (!toolCall.length) {

                    break
                }

                for (const call of toolCall) {
                    if (call.function.name === 'get_weather') {
                        const args = call.function.arguments
                        const result = await getWeather(args.loc)
                        messages.push({ role: 'tool', tool_name: call.function.name, content: JSON.stringify(result) })
                    }
                    if (call.function.name === 'web_res') {
                        const args = call.function.arguments
                        const result = await webRes(args.userquery)
                        messages.push({ role: 'tool', tool_name: call.function.name, content: JSON.stringify(result) })
                    }
                    else {
                        messages.push({ role: 'tool', tool_name: call.function.name, content: 'Unknown tool' })
                    }
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