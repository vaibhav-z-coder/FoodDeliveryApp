import express from "express"
import dotenv from "dotenv"
dotenv.config()
import connectDb from "./config/db.js"
import cookieParser from "cookie-parser"
import authRouter from "./routes/auth.routes.js"
import cors from "cors"
import userRouter from "./routes/user.routes.js"

import itemRouter from "./routes/item.routes.js"
import shopRouter from "./routes/shop.routes.js"
import orderRouter from "./routes/order.routes.js"
import http from "http"
import { Server } from "socket.io"
import { socketHandler } from "./socket.js"

const app=express()
const server=http.createServer(app)

const isAllowedOrigin = (origin) => {
    if (!origin) return true; // allow curl, mobile, server-to-server
    if (origin.startsWith("http://localhost:") || origin.startsWith("http://127.0.0.1:")) return true;
    if (origin === "https://vingo-food-delivery-app-1.onrender.com") return true;
    return false;
};

const io=new Server(server,{
   cors:{
    origin: (origin, callback) => {
        if (isAllowedOrigin(origin)) callback(null, true);
        else callback(new Error("Not allowed by CORS"));
    },
    credentials:true,
    methods:['POST','GET','PUT','DELETE','PATCH']
}
})

app.set("io",io)



const port=process.env.PORT || 5000
app.use(cors({
    origin: (origin, callback) => {
        if (isAllowedOrigin(origin)) callback(null, true);
        else callback(new Error("Not allowed by CORS"));
    },
    credentials:true
}))
app.use(express.json({ limit: "50mb" }))
app.use(express.urlencoded({ limit: "50mb", extended: true }))
app.use(cookieParser())
app.use("/api/auth",authRouter)
app.use("/api/user",userRouter)
app.use("/api/shop",shopRouter)
app.use("/api/item",itemRouter)
app.use("/api/order",orderRouter)

app.get("/", (req, res) => {
    res.status(200).json({
        success: true,
        message: "BiteRush Backend is running"
    })
})

socketHandler(io)
server.listen(port,()=>{
    connectDb()
    console.log(`server started at ${port}`)
})

