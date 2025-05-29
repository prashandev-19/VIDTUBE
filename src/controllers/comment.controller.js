import mongoose from "mongoose"
import {Comment} from "../models/comment.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {Video} from "../models/video.model.js"
import { Like } from "../models/like.models.js"

const getVideoComments = asyncHandler(async (req, res) => {
    const {videoId} = req.params
    const {page = 1, limit = 10} = req.query

    const video = await Video.findById(videoId);
    if(!video){
        throw new ApiError(404, "Video not found")
    }

    const comment = await Comment.aggregate([
        {
          $match: {
            video: mongoose.Types.ObjectId(videoId)
          }
        },
        {
          $lookup: {
            from: "users",
            localField: "user",
            foreignField: "_id",
            as: "user"
          }
        },
        {
          $lookup: {
            from: "Like",
            localField: "_id",
            foreignField: "comment",
            as: "likes"
          }
        },
        {
          $addFields: {
            likesCount: {
              $size: "$likes"
            },
            owner: {
              $first: "$user"
            },
            isLiked: {
              $cond: {
                if: { $in: [req.user?._id, "$likes.likedBy"] },
                then: true,
                else: false
              }
            }
          }
        },
        {
          $sort: {
            createdAt: -1
          }
        },
        {
          $project: {
            content: 1,
            createdAt: 1,
            likesCount: 1,
            owner: {
              username: 1,
              fullname: 1,
              "avatar.url": 1
            },
            isLiked: 1
          }
        }
      ])

      //pagination - is used to limit the number of documents returned in a single query and 
      // to skip a certain number of documents before returning the results.
      const options={
        page:parseInt(page , 10), //as page is string we need to convert it to number with base 10
        limit:parseInt(limit , 10)
      };

      const comments = await Comment.aggregratePaginate(comment , options) 
      //returns an object with { docs:[], totalDocs:0, totalPages:0, page:0, limit:0, hasNextPage:false, hasPrevPage:false, nextPage:0, prevPage:0}
      // docs is an array of objects with the same properties as the original comment object and some additional properties like page, limit, hasNextPage, etc.

      return res
      .status(200)
      .json(new ApiResponse(200 , comments , "Comments fetched successfully"))

})

const addComment = asyncHandler(async (req, res) => {
    const {videoId} = req.params
    const {content} = req.body

    if(!content){
        throw new ApiError(400 , "Content is required")
    }
    
    const video = await Video.findById(videoId)

    if(!video){
        throw new ApiError(404 , "Video not found!")
    }

    const comment = await Comment.create(
        {
            content,
            video:videoId,
            owner:req.user?._id
        }
    )

    if(!comment){
        throw new ApiError(400 , "Something went wrong while adding comment")
    }

    return res
    .status(200)
    .json(new ApiResponse(201 , "Comment added successfully!"))

})

const updateComment = asyncHandler(async (req, res) => {
    const {commentId} = req.params
    const {content} = req.body

    if(!content){
        throw new ApiError(400 , "Content is required")
    }

    const comment = await Comment.findById(commentId)

    if(!comment){
        throw new ApiError(404 , "Comment not found")
    }

    if(comment.owner.toString() !== req.user?._id.toString()){
        throw new ApiError(400 , "Only owner can update comment")
    }
    const updatedComment = await Comment.findByIdAndUpdate(commentId,

        {
            $set:{
                content
            }
        },
        {
            new : true
        }
    )

    if(!updateComment){
        throw new ApiError(500 , "Something went wrong while updating comment")
    }

    return res
    .status(200)
    .json(200 , updatedComment , "Comment updated successfully")
})

const deleteComment = asyncHandler(async (req, res) => {
    const {commentId} = req.params

    const comment = await Comment.findById(commentId)

    if(!comment){
        throw new ApiError(404 , "Comment not found")
    }

    if(comment.owner.toString() !== req.user?._id.toString()){
        throw new ApiError(403 , "only owner can delete comment")
    }

    const deletedComment = await Comment.findByIdAndDelete(commentId)

    return res
    .status(200)
    .json(new ApiResponse(200 , deletedComment , "Comment deleted successfully"))
})

export {
    getVideoComments, 
    addComment, 
    updateComment,
    deleteComment
    }