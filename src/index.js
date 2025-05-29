import { app } from "./app.js";
import dotenv, { configDotenv } from "dotenv"
import connectDB from "./db/index.js";

dotenv.config({      // Load environment variables from .env file into process.env
    path:"./.env"
})

const PORT = process.env.PORT || 7000; 
// PORT is set to the value of the environment variable PORT or defaults to 7000 if not defined.
// The PORT is the port number on which the server will listen for incoming requests.

// The app is imported from the app.js file, which contains the Express application setup and middleware configuration.
connectDB()
.then(() =>{   // .then() is used to handle the promise returned by connectDB() function if successful.
    app.listen(PORT , () => {
        console.log(`Server is running on port ${PORT}`)
    })
})
.catch((err) => { // .catch() is used to handle the promise returned by connectDB() function if failed.
    console.log("Mongodb connection error " , err)
})


