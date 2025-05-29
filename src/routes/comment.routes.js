import { Router } from "express";
import { getVideoComments, 
    addComment, 
    updateComment,
    deleteComment}
from "../controllers/comment.controller.js"
import {verifyJWT} from "../middlewares/auth.middlewares.js"
import { upload } from "../middlewares/multer.middleware.js";


const router = Router()

router.use(verifyJWT , upload.none())

router.route("/:videoId").get(getVideoComments).post(addComment)
router.route("/c/:commentId").delete(deleteComment).patch(updateComment)

export default router