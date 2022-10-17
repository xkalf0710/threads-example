import express from "express";
import axios from "axios";
const app = express();

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

app.use(express.json());


app.get("/token", async(req, res) => {
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

//Иргэн эсвэл байгууллагын зээлийн мэдээллийг шалгах

app.post("/shalgah", async(req, res)=> {
    try{
        const shalgah = await prisma.shalgah.create({
           data: req.body 
        });
    const token = await prisma.token.findUnique({
        where: { id: 1 } 

    })
    if(!shalgah){
        res.status(400).json('hadgalj chadsanf')
    }
     const response  = await axios.post('https://api.burenscore.mn/api/products/:id/inquire', {
         headers: {
             'Content-Type': 'application/json', 
             Authorization: 'Bearer' + token.access_token,
         },
     })
     res.status(200).json({
         ...response
     });
    }catch(error){
        console.log(error)
        res.status(400).json(error)
    }
});

//Иргэн эсвэл байгууллагын зээлийн мэдээллийг шалгах хүсэлт


app.get('/hvselt/id', async(req, res) => {
 try{
     const {id} = req.params;  
     console.log(id);
     res.status(200).json(data);
 }catch(error){
     res.status(400).json(error);
 }

});

app.listen(3000, () => {
    console.log("server started");
  });