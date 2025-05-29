import mongoose from "mongoose"
import {Video} from "../models/video.model.js"
import {subscription} from "../models/subscription.model.js"
import {Like} from "../models/like.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import { video } from "../models/video.models.js"

const getChannelStats = asyncHandler(async (req, res) => {
    // TODO: Get the channel stats like total video views, total subscribers, total videos, total likes etc.
    const userId = req.user?._id

    const totalSubscribers = await subscription.aggregate(
        [
            {
                $match:{
                    channel: new mongoose.Types.objectId(userId)
                }
            },
            {
                $group:{
                    _id:null,
                    subscriberscount:{
                        $sum:1
                    }
                }
            }
        ]
    )

    const totalVideos = await Video.aggregate(
        [
          {
            $match:{
                owner: new mongoose.Types.ObjectId(userId)
            }
          },
          {
            $lookup:{
                from:"likes",
                localField:"_id",
                foreignField:"video",
                as:"likes"
            }
          },
          {
            $project:{
                totalLikes:{
                    $size:"$likes"
                },
                totalViews:"$views"
          }
        },
            {
                $group: {
                    _id: null,
                    totalLikes: { $sum: "$totalLikes" },
                    totalViews: { $sum: "$totalViews" },
                    totalVideos: { $sum: 1 }
                }
            }
        ]
    )

    const channelStats = {
        totalSubscribers: totalSubscribers[0]?.subscribersCount || 0,
        totalLikes: video[0]?.totalLikes || 0,
        totalViews: video[0]?.totalViews || 0,
        totalVideos: video[0]?.totalVideos || 0
    };

    return res
    .status(200)
    .json(new ApiResponse(200 , channelStats , "Channel stats fetched successfully"))
})

const getChannelVideos = asyncHandler(async (req, res) => {
    const userId = req.user?._id

    if(!userId){
        throw new ApiError(404 , "User not found")
    }

    const channelVideos = await Video.aggregate(
        [
            {
                $match:{
                    channel: new mongoose.Types.ObjectId(userId)
                }
            },
            {
                $lookup:{
                    from:"likes",
                    localField:"_id",
                    foreignField:"video",
                    as:"likes"
                }
            },
            {
                $addFields: {
                    likeCount: { $size: "$likes" }
                }
            },
            {
                $project: {
                    title: 1,
                    description: 1,
                    views: 1,
                    createdAt: 1,
                    likeCount: 1
                }
            }
        ]
    )

    return res
    .status(200)
    .json(new ApiResponse(200 , channelVideos , "Channel videos fetched successfully"))
})

export {
    getChannelStats, 
    getChannelVideos
    }