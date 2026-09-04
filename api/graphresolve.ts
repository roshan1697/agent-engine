import type { Response } from "express"
import AICall from "./aicall"
import type { FlowEvent, WorkflowStep } from "./types"
import { Ollama, type Message, type Tool, type WebSearchRequest } from 'ollama'


type WeatherApiResponse = {
    current?: { temp_c: number; condition: { text: string } }
    error?: { message: string }
}

const MAX_TOOL_ITERATIONS = Number(process.env.MAX_TOOL_ITERATIONS ?? 8)
const OLLAMA_MODEL = process.env.OLLAMA_MODEL ?? 'gemma4:12b'

const ollama = new Ollama({ host: 'http://127.0.0.1:11434' })
export const webRes = async (userquery: string) => {
    
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

const runTool = async (call: { function: { name: string; arguments: any } }): Promise<string> => {
    try {
        if (call.function.name === 'get_weather') {
            return JSON.stringify(await getWeather(call.function.arguments.loc))
        }
        if (call.function.name === 'web_res') {
            return JSON.stringify(await webRes(call.function.arguments.userquery))
        }
        return JSON.stringify({ error: `unknown tool "${call.function.name}"` })
    } catch (error) {
        return JSON.stringify({ error: error instanceof Error ? error.message : 'tool execution failed' })
    }
}

const runStep = async (step: WorkflowStep, send: (event: FlowEvent) => void): Promise<'completed' | 'failed'> => {
    const messages: Message[] = [
        {
            role: 'system',
            content: 'You are an AI assistant. You must use the web_res tool to verify real-world facts, current events, and information about specific people or places. However, you MUST NOT use the search tool for basic mathematics (like addition or multiplication), casual greetings, formatting text, or logic puzzles. Answer those directly using your own reasoning.'
        },
        {
            role: 'user',
            content: step.command
        }]

    try {
        for (let iteration = 0; iteration < MAX_TOOL_ITERATIONS; iteration) {
            const response = await ollama.chat({
                model: OLLAMA_MODEL, //gemma4:12b
                stream: true,
                messages,
                tools
            })

            const toolCalls: any[] = []
            let thinking = ''
            let content = ''

            for await (const chunk of response) {
                if (chunk.message.thinking) {
                    thinking = chunk.message.thinking
                }
                if (chunk.message.content) {
                    content = chunk.message.content
                    send({ nodeId: step.id, type: 'chunk', content: chunk.message.content })
                }
                if (chunk.message.tool_calls) {
                    toolCalls.push(...chunk.message.tool_calls)
                }
            }
            if (thinking || content || toolCalls.length) {
                messages.push({ role: 'assistant', thinking, content, tool_calls: toolCalls })
            }
            if (!toolCalls.length) {
                send({ nodeId: step.id, type: 'done' })
                return 'completed'
            }
 
            for (const call of toolCalls) {
                messages.push({ role: 'tool', tool_name: call.function.name, content: await runTool(call) })
            }
        }

    
    
    send({ nodeId: step.id, type: 'error', message: `step exceeded ${MAX_TOOL_ITERATIONS} tool-calling iterations without finishing` })
        return 'failed'
    } catch (error) {
        send({ nodeId: step.id, type: 'error', message: error instanceof Error ? error.message : 'unknown error' })
        return 'failed'
    }
}

const graphResolve = async (
    steps: WorkflowStep[],
    res: Response,
    resolvedIds: Set<string> = new Set(),
    failedIds: Set<string> = new Set()
): Promise<void> => {
    const send = (event: FlowEvent) => res.write(JSON.stringify(event) + '\n')

    const remaining = steps.filter(step => !resolvedIds.has(step.id))
    if (!remaining.length) {
        send({ type: 'flow-done' })
        return
    }
 
    const ready = remaining.filter(step => (step.dependsOn ?? []).every(dep => resolvedIds.has(dep)))

    if (!ready.length) {
        
        for (const step of remaining) {
            send({ nodeId: step.id, type: 'error', message: 'unresolved dependency' })
        }
        send({ type: 'flow-done' })
        return
    }

    await Promise.all(ready.map(async (step) => {
        const blockedBy = (step.dependsOn ?? []).filter(dep => failedIds.has(dep))
        if (blockedBy.length) {
            send({ nodeId: step.id, type: 'skipped', message: `dependency failed: ${blockedBy.join(', ')}` })
            failedIds.add(step.id)
            resolvedIds.add(step.id)
            return
        }

        const outcome = await runStep(step, send)
        if (outcome === 'failed') failedIds.add(step.id)
        resolvedIds.add(step.id)
    }))

    
    await graphResolve(steps, res, resolvedIds, failedIds)
}



export default graphResolve