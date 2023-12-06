import {client as WSClient} from 'websocket'

let BTCClient = new WSClient();
let BTC_Confirmation = false;
let ETH_Confirmation = false;
BTCClient.on("connect",(conn)=>{
    console.log("Connection established")
    conn.send(JSON.stringify({"coin":"btc","command":"subscribe","entity":"pending_transaction"}))
    conn.send(JSON.stringify({"coin":"eth","command":"subscribe","entity":"pending_transaction"}))
    try{
    conn.on("message",(msg)=>{
        if (msg.type === "utf8"){
            
            if (BTC_Confirmation==false ){
                let Response = JSON.parse(msg.utf8Data) as {success:boolean, entity:string, coin:string,message:string}
                if (Response.coin=="btc"){
                    if (Response.success){

                        console.log("BTC Peer Establishment Successfull")
                        BTC_Confirmation=true;
                    }else{
                        new Error("BTC Peer Establishment Failed")
                    }
                }               
            }else if (ETH_Confirmation==false){
                let Response = JSON.parse(msg.utf8Data) as {success:boolean, entity:string, coin:string,message:string}
                if (Response.coin=="eth"){
                    if (Response.success){

                        console.log("Etherium Peer Establishment Successfull")
                        ETH_Confirmation=true;
                    }else{
                        new Error("Etherium Peer Establishment Failed")
                    }
                }

            }
            else if (BTC_Confirmation && ETH_Confirmation){
                let resp = (JSON.parse(msg.utf8Data))
                if (resp.coin=="btc"){
                    console.log("BTC Transaction Received")
                }

                if (resp.coin=="eth"){
                    console.log("ETH Transaction Received")
                }
            }


            // while (BTC_Confirmation==false && ETC_Confirmation==false){
              
            //     let Response = JSON.parse(msg.utf8Data) as {success:boolean, entity:string, coin:string,message:string}
            //     console.log(Response)
              
            //     // if (Response.coin=="btc"&& Response.success){
            //     //     console.log("BTC Peer Establishment Successfull")
            //     //     BTC_Confirmation=true;
            //     // }

            //     // if (Response.coin=="eth"&& Response.success){
            //     //     console.log("ETC Peer Establishment Successfull")
            //     //     ETC_Confirmation=true;
            //     // }
            //     // if (Response.success){
            //     //     console.log("BTC Peer Establishment Successfull")
            //     // }
            // }
            // console.log(JSON.parse(msg.utf8Data))
            // if (!Iniaitlized){
            //     Iniaitlized = true;
            //     let Response = JSON.parse(msg.utf8Data) as {success:boolean, entity:string, coin:number,message:string}
            //     if (Response.success){
            //         console.log("BTC Peer Establishment Successfull")
            //     }else {
            //         new Error("BTC Peer Establishment Failed")
            //     }
            // }else{
            //     // console.log(JSON.parse(msg.utf8Data)) // Uncomment to see the raw data provided by BTC
            // }
        }
    })

}
catch (e){
    console.error(e)
}
})
BTCClient.connect("wss://ws.blockchain.info/coins")
