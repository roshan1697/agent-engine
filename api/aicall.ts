import {GoogleGenAI, type Interactions} from '@google/genai'
import  {Ollama, type Tool, type WebSearchRequest}  from 'ollama'
import web_search from 'ollama'
const ai = new GoogleGenAI({})
const ollama = new Ollama({ host: 'http://127.0.0.1:11434' })
const webRes = async( userquery:string) => {
    return await ollama.webSearch({
        query:userquery,
        maxResults:3
    })
}

const getWeather = async(loc:string) =>{
    const apiKey = process.env.WEATHER_API_KEY
    if (!apiKey) {
    throw new Error("WEATHER_API_KEY is not defined in environment variables");
  }
    const res = await fetch(`https://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${encodeURIComponent(loc)}`)
    const data = await res.json()
    return { loc, tempC: data.current.temp_c, condition: data.current.condition.text }
}

const tools:Tool[] = [{
    type:'function',
    function: {
        name:'web_res',
        description:'Search web and gives relevant search result from the web',
        parameters: {
            type:'object',
            required:['userquery'],
            properties:{
                userquery:{type:'string', description:'user query which need web result '}
            }
        }
    }
},
{
    type:'function',
    function: {
        name:'get_weather',
        description: 'Get the current weather for a given city',
        parameters:{
            type:'object',
            required:['loc'],
            properties:{
                loc:{type: 'string', description: 'City name, e.g. "Mumbai"'}
            }
        }
    }

}]
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
        }],
        tools:tools
        
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