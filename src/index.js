// Old syntax for dotenv library
// require('dotenv').config({path:'./env'});
import dotenv from "dotenv"
import mongoose from "mongoose";
import connectDB from "./db/index.js";
import { app } from "./app.js";
dotenv.config({
    path: './env'
});

connectDB().then(()=>{
    app.listen(process.env.PORT || 8000, ()=>{
        console.log(`Connected on port: ${process.env.PORT}`)
    })
}).catch((error)=> {
    console.log("Not connected to port",error)
})

// Traditional method or old way to connect DB 
// import express from "express";
// const app = express();
// (async()=> {
//     try{
//         await mongoose.connect(`${process.env.MONGODB_URL}`);
//         app.on('error',(error)=> {
//             console.log("Error",error)
//             throw error;
//         })
//     }catch (error) {
//         console.error("Error", error)
//         throw err
//     }
// })()