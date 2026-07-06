import {GoogleGenAI} from '@google/genai'
const ai = new GoogleGenAI({})

const AICall = async(message:string) => {
    const res = await ai.interactions.create({
        model: 'gemini-3.5-flash',
        input:message
    })

    return res.output_text
}

export default AICall