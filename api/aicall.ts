import {GoogleGenAI} from '@google/genai'
import  {Ollama}  from 'ollama'
const ai = new GoogleGenAI({})
const ollama = new Ollama({ host: 'http://127.0.0.1:11434' })
const AICall = async(message:string):Promise<{result:string}> => {
    const res = await ai.interactions.create({
        model: 'gemini-3.5-flash',
        input:message
    })

    return {result:res.output_text!}

    // const res = await ollama.chat({
    //     model:'gemma4:12b',
    //     messages:[{
    //         role:'user',
    //         content:message
    //     }]
    // })  
    console.log(res)
    // return res.message.content
   // return  { result: res.message.content !}
    // console.log(message)
    // return { result:message}
}

export default AICall