import { PrismaClient } from "@prisma/client";
import crypto  from "crypto-js";
import express  from "express";
const app = express();
import fetch from 'node-fetch'

const {HmacSHA256} = crypto

const prisma = new PrismaClient();

app.use(express.json());

app.post("/invoice", async (req, res) => {
  const invoice = await prisma.invoice.create({
    data: req.body,
  });
  if (invoice) {
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

    const request = await (
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

    if (
      request.checksum ===
      HmacSHA256(
        request.invoice + request.transactionId,
        "O1Kn)Xxl%Nhvi8OT"
      ).toString(crypto.enc.Hex)
    ) {
      return res.status(200).json({
        ...request,
        redirect_url: `https://ecommerce.golomtbank.com/socialpay/mn/${request.invoice}`,
      });
    } else {
      return res.status(400).json({
        from: hex,
        to: request.checksum,
      });
    }
  } else {
    return res.status(400).json("error");
  }
});

app.get("/invoice/check/:id", async (req, res) => {
  const { id } = req.params;
  const hash = HmacSHA256(id + id, "O1Kn)Xxl%Nhvi8OT").toString(crypto.enc.Hex);
  const request = await (
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

  return res.status(200).json(request);
});

app.listen(3000, () => {
  console.log("server started");
});