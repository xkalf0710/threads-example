import { PrismaClient } from "@prisma/client";
import crypto  from "crypto-js";
import express  from "express";
const app = express();
import fetch from 'node-fetch';

const {HmacSHA256} = crypto; 

const prisma = new PrismaClient();

import * as http from 'http';
const server = http.createServer(app);
import {Server} from 'socket.io';
const io = new Server(server);

//io.listen(3000);


app.use(express.json());



//localhost:3000 /invoice 
app.post("/invoice", async (req, res) => {
  // db d nehemjleliin medeelel uusgeh
  const invoice = await prisma.invoice.create({
    // nehemjlel uusgeh medeelel
    data: {
      amount: parseFloat(req.body.amount.toFixed(2))
    },
  });
  if (invoice) {
    // social pay luu yvuulah medeelel
    const data = {
      amount: invoice.amount.toString(),
      callback: "https://vulcan.mn/",
      genToken: "N",
      returnType: "GET",
      transactionId: invoice.id.toString(),
    };
    const hash = HmacSHA256(
      data.transactionId + data.amount + data.returnType + data.callback,
      "O1Kn)Xxl%Nhvi8OT"
    ).toString(crypto.enc.Hex);
    
    // golomtoos nehemjlel uusgeh uyd ireh data  
    const response = await (
      await fetch("https://ecommerce.golomtbank.com/api/invoice", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization:
            "Bearer eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJNRVJDSEFOVF9WVUxDQU5fQU5BTElUWUNTX0xMQyIsImlhdCI6MTY2MDMwMTQwMH0.5S_u88JkeJ5EGQafbN3-5CftMOUEerQ8OBRhGjnLo9E",
        },
        body: JSON.stringify({
          ...data,
          checksum: hash,
        }),
      })
    ).json();
    // irsen data zuv eshiig shalgah 0
    if (
      response.checksum ===
      HmacSHA256(
        response.invoice + response.transactionId,
        "O1Kn)Xxl%Nhvi8OT"
      ).toString(crypto.enc.Hex)
    ) {
      return res.status(200).json({
        ...response, // response udamjilana 
        redirect_url: `https://ecommerce.golomtbank.com/socialpay/mn/${response.invoice}`,
      });
    } else {
      return res.status(400).json("Check sum not match");
    }
  } else {
    return res.status(400).json("nehemjleliin medeelel baazad hadgalagdsangui.");
  }
});

// tulbur tulugdsun eshiig shalgah
app.get("/invoice/check/:id", async (req, res) => {
  const { id } = req.params;
  const hash = HmacSHA256(id + id, "O1Kn)Xxl%Nhvi8OT").toString(crypto.enc.Hex);
  const response = await (
    await fetch("https://ecommerce.golomtbank.com/api/inquiry", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization:
          "Bearer eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJNRVJDSEFOVF9WVUxDQU5fQU5BTElUWUNTX0xMQyIsImlhdCI6MTY2MDMwMTQwMH0.5S_u88JkeJ5EGQafbN3-5CftMOUEerQ8OBRhGjnLo9E",
      },
      body: JSON.stringify({
        checksum: hash,
        transactionId: id,
      }),
    })
  ).json();

  // return res.status(200).json(response);

  res.sendFile(
    path.json(__dirname, "index.html")
  );
});

app.listen(3000, () => {
  console.log("server started");
});

