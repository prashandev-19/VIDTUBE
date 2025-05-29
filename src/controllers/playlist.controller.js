import mongoose, {isValidObjectId} from "mongoose"
import {Playlist} from "../models/playlist.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import { Video } from "../models/video.models.js"


const createPlaylist = asyncHandler(async (req, res) => {
    const {name, description} = req.body

    if(!name || !description){
        throw new ApiError(400, "Name and description are required")
    }

    const playlist = await Playlist.create({
        name,
        description,
        owner: req.user?._id
    })

    if(!playlist){
        throw new ApiError(500 , "Something went wrong while creating playlist")
    }

    return res
    .status(200)
    .json(new ApiResponse(200, playlist, "PLaylist created successfully"))
})

const getUserPlaylists = asyncHandler(async (req, res) => {
    const {userId} = req.params
    
    if(!isValidObjectId(userId)){
        throw new ApiError(400, "Invalid user id")
    }

    const userPlaylist = await Playlist.aggregate(
        [
            {
                $match: {
                    owner: new mongoose.Types.ObjectId(userId)
                }
            },
            {
                $lookup: {
                    from: "videos",
                    localField: "videos",
                    foreignField: "_id",
                    as: "videos"
                }
            },
            {
                $addFields: {
                    totalVideos: {
                        $size: "$videos"
                    },
                    totalViews: {
                        $sum: "$videos.views"
                    }
                }
            },
            {
                $project: {
                    _id: 1,
                    name: 1,
                    description: 1,
                    totalVideos: 1,
                    totalViews: 1,
                    updatedAt: 1
                }
            }
        ]
    )

    if(!userPlaylist){
        throw new ApiError(400 , "Something went wrong while fetching user playlist")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200 , userPlaylist , "User playlist fetched successfully")
    )
})

const getPlaylistById = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    
    if(!isValidObjectId(playlistId)){
        throw new ApiError(400, "Invalid playlist id")
    }

    const playlist = await Playlist.findById(playlistId)

    if(!playlist){
        throw new ApiError(404, "Playlist not found")
    }

    const playlistVideos = await Playlist.aggregate(
        [
            {
                $match:{
                    _id: new mongoose.Types.objectId(playlistId)
                }
            },
            {
                $lookup:{
                    from: "videos",
                    localField: "videos",
                    foreignField: "_id",
                    as: "videos"
                }
            },
            {
                $lookup:{
                    from: "users",
                    localField: "owner",
                    foreignField: "_id",
                    as: "owner"
                }
            },
            {
                addFields:{
                    totalVideos:{
                        $size : "$videos"
                    },
                    
                    Owner:{
                        $first : "$owner"
                    },
                    
                    totalViews:{
                        $sum : "$videos.views"
                    }
                }
            },
            {
                $project: {
                    name: 1,
                    description: 1,
                    createdAt: 1,
                    updatedAt: 1,
                    totalVideos: 1,
                    totalViews: 1,
                    videos: {
                        _id: 1,
                        "videoFile.url": 1,
                        "thumbnail.url": 1,
                        title: 1,
                        description: 1,
                        duration: 1,
                        createdAt: 1,
                        views: 1
                    },
                    owner: {
                        username: 1,
                        fullName: 1,
                        "avatar.url": 1
                    }
                }
            }
        ]
    );

    return res
    .status(200)
    .json(200 , playlistVideos[0],"Playlist fetched successfully!")
})

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params

    if(!playlistId || videoId){
        throw new ApiError(500 , "Invalid ID !")
    }

    const playList = await Playlist.findById(playlistId)
    const video = await Video.findById(videoId)

    if(!isValidObjectId(playList)){
        throw new ApiError(404 , "Playlist not found!")
    }

    if(!isValidObjectId(video)){
        throw new ApiError(404 , "Video not found!")
    }

    if(playList.owner?.toString() != req.user?._id.toString()){
        throw new ApiError(403 , "You are not allowed to add video to this playlist")
    }

    if(playList.videos.include(videoId)){
        throw new ApiError(400 , "Video already exists in playlist")
    }

    const updatedPlayList = await Playlist.findByIdAndUpdate(playlistId,
        {
          $push:{
            videos:videoId
          }
        },
        {
            new :true
        }
    )

    if(!updatedPlayList){
        throw new ApiError(500 , "Something went wrong while adding video to playlist")

    }

    return res
    .status(200)
    .json(
        new ApiResponse(200 , updatedPlayList , "Video added to playlist successfully")
    )
})

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params
    
    if(!playlistId || videoId){
        throw new ApiError(500 , "Invalid ID !")
    }

    const playList = await Playlist.findById(playlistId)
    const video = await Video.findById(videoId)

    if(!isValidObjectId(playList)){
        throw new ApiError(404 , "Playlist not found!")
    }

    if(!isValidObjectId(video)){
        throw new ApiError(404 , "Video not found!")
    }

    if(playList.owner?.toString() != req.user?._id.toString()){
        throw new ApiError(403 , "You are not allowed to remove video from this playlist")
    }

    if(!playList.videos.include(videoId)){
        throw new ApiError(400 , "Video does not exist in playlist")
    }

    const updatedPlayList = await Playlist.findByIdAndUpdate(
        playlistId,
            {
                $pull:{
                    videos:videoId
                }
            },
            {
                new : true
            }
    )


    if(!updatedPlayList){
        throw new ApiError(500 , "Something went wrong while removing video from playlist")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200 , updatedPlayList , "Video removed from playlist successfully")
    )
})

const deletePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    
    if(!playlistId){
        throw new ApiError(500 , "Invalid ID !")
    }

    const playList = await Playlist.findById(playlistId)

    if(!isValidObjectId(playList)){
        throw new ApiError(404 , "PlayList not found")
    }

    if(playList.owner?.toString() != req.user?._id.toString()){
        throw new ApiError(403 , "You are not allowed to delete this playlist")
    }

    const deletedPlaylist = await Playlist.findByIdAndDelete(playlistId)

    if(!deletedPlaylist){
        throw new ApiError(500 , "Something went wrong while deleting playlist")
    }

    return res
    .status(200)
    .json(400 , deletedPlaylist , "PlayList deleted successfully")
})

const updatePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    const {name, description} = req.body
    
    if(!playlistId){
        throw new ApiError(500 , "Invalid ID !")
    }

    if(!name || !description){
        throw new ApiError(400 , "Name and description are required")
    }

    const playList = await Playlist.findById(playlistId)

    if(!isValidObjectId(playList)){
        throw new ApiError(404 , "PlayList not found")
    }

    if(playList.owner?.toString() != req.user?._id.toString()){
        throw new ApiError(403 , "You are not allowed to update this playlist")
    }

    const updatedPlayList = await Playlist.findByIdAndUpdate(playlistId , 
        {
            $set:{
                name,
                description
            }
        },
        {
            new : true
        }
    )

    if(!updatedPlayList){
        throw new ApiError(404 , "Something went wrong while updating playlist")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200 , updatedPlayList , "Playlist updated successfully")
    )
})

export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
}