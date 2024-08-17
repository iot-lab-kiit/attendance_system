const express = require("express");
const cors = require("cors");
const path = require("path");
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
    res.sendFile(path.join(__dirname, '/index.html'));
});

app.get("/user/register", (req, res) => {
    res.sendFile(path.join(__dirname, '/register.html'));
});
app.get("/public/:file", (req, res) => {
    const {file} = req.params;
    res.sendFile(path.join(__dirname, `/public/${file}`));
});
app.get("/user/public/:file", (req, res) => {
    const {file} = req.params;
    res.sendFile(path.join(__dirname, `/public/${file}`));
});