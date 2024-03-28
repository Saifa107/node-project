import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import { router as login } from "./api/login"
import { router as vote } from "./api/vote";
import { router as images } from "./api/images";



export const app = express();

app.use(bodyParser.json());

app.use(
    cors({
      origin: "*",
    })
);
app.use("/login",login);
app.use("/vote",vote);
app.use("/images",images);


app.use((req,res)=>{
    res.status(404);
    res.send("Seviec not found");
});