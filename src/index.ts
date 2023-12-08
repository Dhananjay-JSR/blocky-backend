import {BTCStream,Connected_Client,ETHStream} from './module/StreamConnector'
import express from 'express'
import expressWs from 'express-ws'
import cors from 'cors'
import { GETTransactions, GetAddress, GetInputOut } from './module/BTCProxy';
import { db } from '../db/db';
import { Address, AddressType, TransactionQueries, TransactionType } from '../db/schema';
import { eq } from 'drizzle-orm';

const appBase = express();
const wsInstance = expressWs(appBase);
let { app } = wsInstance

app.use(cors({
    origin:"*"
}))


app.get("/address",async (req,res)=>{
    let AddressID = req.query.parameters as string
    if(AddressID == undefined){
        res.status(400).send("Bad Request")
        return
    }
    const result: AddressType[] = await db.select().from(Address).where(eq(Address.address,AddressID));

    if (result.length == 0){
        // Cache doesn't Exist Get Data from Upstream
        let AddressDetails = await GetAddress(AddressID)
        let InstertResponse = await db.insert(Address).values({
            address: AddressID,
            json_data: AddressDetails.data
        })
        
        if (InstertResponse.changes == 0){
            res.status(500).send("Internal Server Error")
            return
        }else if(InstertResponse.changes == 1){
            res.status(201).send(AddressDetails.data)
            return
        }
    }else{
        // Cache Exists
       let Data = result[0].json_data
        res.status(200).json(Data)
        return
  }

})


app.get("/search",async (req,res)=>{

    let TransactionID = req.query.parameters as string
    if(TransactionID == undefined){
        res.status(400).send("Bad Request")
        return
    }
    const result: TransactionType[] = await db.select().from(TransactionQueries).where(eq(TransactionQueries.transaction_id,TransactionID));
   
   
    if (result.length == 0){
    // Cache doesn't Exist Get Data from Upstream
    let TransactionDetails = await GETTransactions(TransactionID)
    let Data = await GetInputOut(TransactionID)
    let InAddres = (Data.data.data[0].ins.map((e:any)=>{
        return {
            address: e.addresses.map((f:any)=>{
                return {
                    labels:f.labels,
                    value:f.value,
                    entitities:f.entities.map((g:any)=>g.value)
                }
            }),
            amount: e.amount
        }
    }))

    let OutAddres =  (Data.data.data[0].outs.map((e:any)=>{
        return {
            address: e.addresses.map((f:any)=>{
                return {
                    labels:f.labels,
                    value:f.value,
                    entitities:f.entities.map((g:any)=>g.value)
                }
            }),
            amount: e.amount
        }
    }))
    let InstertResponse = await db.insert(TransactionQueries).values({
        transaction_id: TransactionID,
        json_data: {...TransactionDetails.data,
        AddresRote:{
            InAddress: InAddres,
            OutAddress: OutAddres
        }}
    })
    
    if (InstertResponse.changes == 0){
        res.status(500).send("Internal Server Error")
        return
    }else if(InstertResponse.changes == 1){
        // console.log(TransactionDetails.data)
        res.status(201).send({...TransactionDetails.data,
            AddresRote:{
                InAddress: InAddres,
                OutAddress: OutAddres
            }})
        return
    }

   }else{
         // Cache Exists
        let Data = result[0].json_data
         res.status(200).json(Data)
         return
   }
    

    // let TransactionDetails = await GETTransactions(TransactionID)
    // console.log(TransactionDetails.data)
    // await GETTransactions
})

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