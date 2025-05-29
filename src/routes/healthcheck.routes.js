import {Router} from "express";

import {healthcheck} from "../controllers/healthcheck.controllers.js"

const router = Router() //create a new router instance
// /api/v1/healthcheck/test

router.route("/").get(healthcheck) //healthcheck route to check if the server is running or not.

export default router