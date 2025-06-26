import express from 'express'
import cors from "cors"
import cookieParser from 'cookie-parser';


const app = express(); //create express app

app.use(
    cors({                         //CORS - cross-origin resource sharing , helps connecting frontend and backend.
        origin:process.env.CORS_ORIGIN,
        credentials:true
    })
)

//Commom middleware 
app.use(express.json({limit:"16kb"}))
app.use(express.urlencoded({extended:true , limit:"16kb"}))
app.use(express.static("public"))  //static files like images, css, js etc.
app.use(cookieParser()); //parses cookies from the request headers.

//import Routes
import healthcheckRouter from "./routes/healthcheck.routes.js" //healthcheck route to check if the server is running or not.
import userRouter from "./routes/user.routes.js"  //user route for user related operations.
import { errorHandler } from './middlewares/error.middlewares.js'; 

//Routes

app.use("/api/v1/healthcheck" , healthcheckRouter)
app.use("/api/v1/users" , userRouter)

//app.use(errorHandler)
export {app}