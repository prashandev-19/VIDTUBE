import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middlewares.js";

import{
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
} from "../controllers/playlist.controllers.js";
import { get } from "mongoose";

const router = Router()

router.use(verifyJWT() , upload.none()) // Apply JWT verification to all routes in this router

router.route("/").post(createPlaylist) // Create a new playlist

router.route("/user/:userId").get(getUserPlaylists) // Get all playlists of the user
router.route("/:playListId").get(getPlaylistById) // Get a specific playlist by ID

router.route("/add/:videoId/:playlistId").patch(addVideoToPlaylist); // Add a video to a playlist
//patch request - to update a resource

router.route("/remove/:videoId/:playListId").patch(removeVideoFromPlaylist); // Remove a video from a playlist
router.route("/delete/:playListId").delete(deletePlaylist); // Delete a playlist
router.route("/update/:playListId").patch(updatePlaylist); // Update a playlist

export default router