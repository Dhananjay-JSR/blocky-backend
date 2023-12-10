import {BTCStream,Connected_Client,ETHStream} from './module/StreamConnector'
import express from 'express'
import expressWs from 'express-ws'
import cors from 'cors'
import { GETTransactions, GetAddress, GetAddressMetaData, GetInputOut } from './module/BTCProxy';
import { db } from '../db/db';
import { Address, AddressType, TransactionQueries, TransactionType } from '../db/schema';
import { eq } from 'drizzle-orm';
import axios, { AxiosError } from 'axios';

const appBase = express();
const wsInstance = expressWs(appBase);
let { app } = wsInstance

app.use(cors({
    origin:"*"
}))

// Send US Address ID get Back Transaction
app.get("/address",async (req,res)=>{
    let AddressID = req.query.parameters as string
    if(AddressID == undefined){
        res.status(400).send("Bad Request")
        return
    }
    const result: AddressType[] = await db.select().from(Address).where(eq(Address.address,AddressID));

    if (result.length == 0){
        // Cache doesn't Exist Get Data from Upstream
        
        let TransactionsList = await GetAddress(AddressID)
        let TxList = TransactionsList.data.map((tx:any)=>tx.txid)
        let TxMetaData = await GetAddressMetaData(TxList)

        

        const MashedData = (TxMetaData.data.map(((txMeta:any)=>{
            if (txMeta.inputs.some((e:any)=>e.address==AddressID)){
                return {
                    id: txMeta.txid,
                    IncomingTx:false
                }
            }

            if (txMeta.outputs.some((e:any)=>e.address==AddressID)){
                return {
                    id: txMeta.txid,
                    IncomingTx:true
                }
            }
        })))
        let InstertResponse = await db.insert(Address).values({
            address: AddressID,
            json_data: MashedData
        })
        
        if (InstertResponse.changes == 0){
            res.status(500).send("Internal Server Error")
            return
        }else if(InstertResponse.changes == 1){
            res.status(201).send(MashedData)
            return
        }
    }else{
        // Cache Exists
       let Data = result[0].json_data
        res.status(200).json(Data)
        return
  }

})

// This Route Gets Address ID and Return All Participating Transaction -> used in Graph
app.get("/address/tx",async (req,res)=>{
    let AddressID = req.query.parameters as string
    if(AddressID == undefined){
        res.status(400).send("Bad Request")
        return
    }
    const result: AddressType[] = await db.select().from(Address).where(eq(Address.address,AddressID));

    if (result.length == 0){
        // Cache doesn't Exist Get Data from Upstream
        let TransactionsList
        try{
            TransactionsList  = await GetAddress(AddressID)
        }
        catch(error){
            const err = error as AxiosError
            if (err.response?.status){
                res.status(err.response.status).json({
                    message: err.response.statusText,
                    error:true
                })
                return
            }
        }


        let TxList = TransactionsList?.data.map((tx:any)=>tx.txid)
        let TxMetaData = await GetAddressMetaData(TxList)
        const MashedData = (TxMetaData.data.map(((txMeta:any)=>{
            if (txMeta.inputs.some((e:any)=>e.address==AddressID)){
                return {
                    id: txMeta.txid,
                    IncomingTx:false
                }
            }

            if (txMeta.outputs.some((e:any)=>e.address==AddressID)){
                return {
                    id: txMeta.txid,
                    IncomingTx:true
                }
            }
        })))
        let InstertResponse = await db.insert(Address).values({
            address: AddressID,
            json_data: MashedData
        })
        
        if (InstertResponse.changes == 0){
            res.status(500).send("Internal Server Error")
            return
        }else if(InstertResponse.changes == 1){
            res.status(201).send(MashedData)
            return
        }
    }else{
        // Cache Exists
       let Data = result[0].json_data
        res.status(200).json(Data)
        return
  }

})

// This Route Received Tx ID and Return All Participating Address -> used in Graph 
app.get("/transaction/addr",async(req,res)=>{
    let TransactionID =  req.query.parameters as string
        // console.log(TransactionID)
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


            res.status(201).json([...Array.from(new Set(TransactionDetails.data.inputs.map((e:any)=>e.address))).map((e:any)=>{
                return {
                    address: e,
                    inputAddress: true
                }
            }),...Array.from(new Set(TransactionDetails.data.outputs.map((e:any)=>e.address))).map((e:any)=>{
                return {
                    address: e,
                    inputAddress: false
                }})])
            // console.log(TransactionDetails.data)
            // res.status(201).send({...TransactionDetails.data,
            //     AddresRote:{
            //         InAddress: InAddres,
            //         OutAddress: OutAddres
            //     }})

            // res.status(201).json({
            //     inputs: [...new Set(TransactionDetails.data.inputs.map((e:any)=>e.address))],
            //     outputs: [...new Set(TransactionDetails.data.outputs.map((e:any)=>e.address))]
            //  })
            
            return
        }
    
       }else{
             // Cache Exists
            let Data = result[0].json_data as any
            // res.status(200).json(Data)
            //  res.status(200).json({
            //     inputs: [...new Set(Data.inputs.map((e:any)=>e.address))],
            //     outputs: [...new Set(Data.outputs.map((e:any)=>e.address))]
            //  })
            res.status(200).json([...Array.from(new Set(Data.inputs.map((e:any)=>e.address))).map((e:any)=>{
                return {
                    address: e,
                    inputAddress: true
                }
            }),...Array.from(new Set(Data.outputs.map((e:any)=>e.address))).map((e:any)=>{
                return {
                    address: e,
                    inputAddress: false
                }})])
             return
       }
        
})

// Send Us Trasacntion get All Partiicipating Input
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
    console.log(TransactionDetails)
    // let Data = await GetInputOut(TransactionID)
    // let InAddres = (Data.data.data[0].ins.map((e:any)=>{
    //     return {
    //         address: e.addresses.map((f:any)=>{
    //             return {
    //                 labels:f.labels,
    //                 value:f.value,
    //                 entitities:f.entities.map((g:any)=>g.value)
    //             }
    //         }),
    //         amount: e.amount
    //     }
    // }))

    // let OutAddres =  (Data.data.data[0].outs.map((e:any)=>{
    //     return {
    //         address: e.addresses.map((f:any)=>{
    //             return {
    //                 labels:f.labels,
    //                 value:f.value,
    //                 entitities:f.entities.map((g:any)=>g.value)
    //             }
    //         }),
    //         amount: e.amount
    //     }
    // }))
    // let InstertResponse = await db.insert(TransactionQueries).values({
    //     transaction_id: TransactionID,
    //     json_data: {...TransactionDetails.data,
    //     AddresRote:{
    //         InAddress: InAddres,
    //         OutAddress: OutAddres
    //     }}
    // })
    
    // if (InstertResponse.changes == 0){
    //     res.status(500).send("Internal Server Error")
    //     return
    // }else if(InstertResponse.changes == 1){
    //     // console.log(TransactionDetails.data)
    //     res.status(201).send({...TransactionDetails.data,
    //         AddresRote:{
    //             InAddress: InAddres,
    //             OutAddress: OutAddres
    //         }})
    //     return
    // }

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