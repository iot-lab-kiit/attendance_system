const express = require("express");
const cors = require("cors");
const app=express();
require("dotenv").config();

const PORT =process.env.PORT||4000;

app.use(express.json());
app.use(cors())
const userRoutes=require("./routes/attendance");
app.use("/",userRoutes);


app.listen(PORT,()=>{
    console.log("server started")
})

const dbConnect = require("./config/db");


app.get("/",(req,res)=>{
    res.send("hello");
})