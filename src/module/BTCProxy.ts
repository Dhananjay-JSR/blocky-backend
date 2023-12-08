import axios from "axios"

let config = {
 
};

export function GETTransactions(transactionID:string){
    return axios.request({
        method: 'get',
        maxBodyLength: Infinity,
        url: 'https://api.blockchain.info/haskoin-store/btc/transaction/'+transactionID,
        headers: { 
          'authority': 'api.blockchain.info', 
          'accept': 'application/json, text/plain, */*', 
          'accept-language': 'en-US,en;q=0.9', 
          'cache-control': 'no-cache', 
          'origin': 'https://www.blockchain.com', 
          'pragma': 'no-cache', 
          'referer': 'https://www.blockchain.com/', 
          'sec-ch-ua': '"Google Chrome";v="119", "Chromium";v="119", "Not?A_Brand";v="24"', 
          'sec-ch-ua-mobile': '?0', 
          'sec-ch-ua-platform': '"Windows"', 
          'sec-fetch-dest': 'empty', 
          'sec-fetch-mode': 'cors', 
          'sec-fetch-site': 'cross-site', 
          'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36'
        }
    })
}

export function GetInputOut(transactionID:string){
return axios.request({method: 'get',
maxBodyLength: Infinity,
url: 'https://api.oxt.me/txs/'+transactionID,
headers: { 
  'Accept': '*/*', 
  'Accept-Language': 'en-US,en;q=0.9', 
  'Cache-Control': 'no-cache', 
  'Connection': 'keep-alive', 
  'Origin': 'https://oxt.me', 
  'Pragma': 'no-cache', 
  'Referer': 'https://oxt.me/', 
  'Sec-Fetch-Dest': 'empty', 
  'Sec-Fetch-Mode': 'cors', 
  'Sec-Fetch-Site': 'same-site', 
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36', 
  'sec-ch-ua': '"Google Chrome";v="119", "Chromium";v="119", "Not?A_Brand";v="24"', 
  'sec-ch-ua-mobile': '?0', 
  'sec-ch-ua-platform': '"Windows"'
}})

}


export function GetAddress(address:string){
  return axios.request({
    method: 'get',
    maxBodyLength: Infinity,
    url: `https://api.blockchain.info/haskoin-store/btc/address/`+address+`/transactions?limit=100&offset=0`,
    headers: { 
      'authority': 'api.blockchain.info', 
      'accept': 'application/json, text/plain, */*', 
      'accept-language': 'en-US,en;q=0.9', 
      'cache-control': 'no-cache', 
      'origin': 'https://www.blockchain.com', 
      'pragma': 'no-cache', 
      'referer': 'https://www.blockchain.com/', 
      'sec-ch-ua': '"Google Chrome";v="119", "Chromium";v="119", "Not?A_Brand";v="24"', 
      'sec-ch-ua-mobile': '?0', 
      'sec-ch-ua-platform': '"Windows"', 
      'sec-fetch-dest': 'empty', 
      'sec-fetch-mode': 'cors', 
      'sec-fetch-site': 'cross-site', 
      'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36'
    }
  })
  
}