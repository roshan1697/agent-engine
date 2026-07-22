import {GoogleGenAI, type Interactions} from '@google/genai'
import  {Ollama}  from 'ollama'
const ai = new GoogleGenAI({})
const ollama = new Ollama({ host: 'http://127.0.0.1:11434' })
const AICall = async(message:string):Promise<any> => {
    // return await ai.interactions.create({
    //     model: 'gemini-3.5-flash',
    //     input:message,
    //     stream: true
    // })

   // return {result:res.output_text!}
    // for await ( const chunk of res){
    //     return {result: chunk}
    // } 

    return await ollama.chat({
        model:'gemma4:12b',
        stream:true,
        messages:[{
            role:'user',
            content:message
        }]
    })  
    
    // for await (const chunk of res){
    //     if(chunk.message.thinking){

    //         console.log(chunk.message.thinking)
    //     }else{
    //         console.log(chunk.message.content)
    //     }
    // }

    
    // return res.message.content
   // return  { result: res.message.content !}
    // console.log(message)
    // return { result:message}
}

export default AICall