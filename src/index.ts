import {BTCStream,Connected_Client,ETHStream} from './module/StreamConnector'
import express from 'express'
import expressWs from 'express-ws'
import cors from 'cors'

const appBase = express();
const wsInstance = expressWs(appBase);
let { app } = wsInstance

app.use(cors({
    origin:"*"
}))

app.ws('/btc',(ws ,req)=>{
    const Handler = (data:any)=>{
        ws.send(JSON.stringify(data))
    }
    BTCStream.on("data",Handler)

    ws.on("close",()=>{
        BTCStream.removeListener("data",Handler)
    })
    
})

app.ws('/eth',(ws ,req)=>{
    const Handler = (data:any)=>{
        ws.send(JSON.stringify(data))
    }
    ETHStream.on("data",Handler)

    ws.on("close",()=>{
        ETHStream.removeListener("data",Handler)
    })
})

app.get('/health',(req,res)=>{
    res.send("OK")
})

app.listen(3000,()=>{
    console.log("Server Started on 3000")
})