import type { Response } from "express"
import AICall from "./aicall"
import type { FlowEvent, WorkflowStep } from "./types"
import { Ollama, type Message, type Tool, type WebSearchRequest } from 'ollama'


type WeatherApiResponse = {
    current?: { temp_c: number; condition: { text: string } }
    error?: { message: string }
}

const ollama = new Ollama({ host: 'http://127.0.0.1:11434' })
export const webRes = async (userquery: string) => {
    console.log(userquery)
    return await ollama.webSearch({
        query: userquery,
        maxResults: 3
    })
    
}

const getWeather = async (loc: string) => {
    const apiKey = process.env.WEATHER_API_KEY
    if (!apiKey) {
        throw new Error("WEATHER_API_KEY is not defined in environment variables")
    }
    const res = await fetch(`https://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${encodeURIComponent(loc)}`)
    const data = await res.json() as WeatherApiResponse
    if (!data.current) {
        throw new Error(data.error?.message ?? `could not resolve weather for "${loc}"`)
    }
    return { loc, tempC: data.current.temp_c, condition: data.current.condition.text }
}

const tools: Tool[] = [{
    type: 'function',
    function: {
        name: 'web_res',
        description: 'Searches the web for current events, news, and real-world facts. Do NOT trigger this tool for simple math, coding questions, or general conversation. Only use this when you need external, real-time information to be accurate.',
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
                role:'system',
                content:'You are an AI assistant. You must use the web_res tool to verify real-world facts, current events, and information about specific people or places. However, you MUST NOT use the search tool for basic mathematics (like addition or multiplication), casual greetings, formatting text, or logic puzzles. Answer those directly using your own reasoning.'
            },{
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
                let thinking = ''
                let content = ''
                for await (const chunk of res) {
                    if (chunk.message.thinking) {
                        thinking += chunk.message.thinking
                    }

                    if (chunk.message.content != '') {
                        content += chunk.message.content
                        console.log({ nodeId: step.id, type: 'chunk', content: chunk.message.content })
                        send({ nodeId: step.id, type: 'chunk', content: chunk.message.content })
                    }
                    

                    if (chunk.message.tool_calls) {
                        toolCall.push(...chunk.message.tool_calls)
                        console.log(chunk.message.tool_calls)

                    }
                }

                if(thinking || content || toolCall.length){
                    messages.push({role:'assistant', thinking,content,tool_calls:toolCall})
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
            send({ nodeId: step.id, type: 'done' })

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