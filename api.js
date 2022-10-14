import express from "express";
import path from path;

const api = express();

api.use(express.static(path.join(__dirname, 'public')));
api.use('/', express.static('index.html'));