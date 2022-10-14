import express from "express";

const app = express();

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

app.use(express.json());


app.post("/token", async(req, res) => {
  try{
     const data =  {
        client_id: "", 
        secretKey: ""
     };
     const response  = await axios.post('https://api.burenscore.mn/api/auth/login', {}, {
       headers: {
           'Content-Type': 'application/json',
       },
       body: JSON.stringify({
           ...data,
       }),
     });
     const token = await prisma.token.upsert({
         where:{
             id: 1
         }, 
         update: {
             access_token: data.access_token, 
             refresh_token: data.refresh_token
         }, 
         create: {
             access_token: data.access_token, 
             refresh_token: data.refresh_token
         }
     }).json();
     res.status(200).json({...response});
  }catch(error){
      res.status(400).json(error);
  }
});





app.listen(3000, () => {
    console.log("server started");
  });