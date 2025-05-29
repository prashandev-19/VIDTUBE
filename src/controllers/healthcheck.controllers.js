import {ApiResponse} from '../utils/ApiResponse.js';
import {asyncHandler} from '../utils/asyncHandler.js';

// const healthcheck = async (req , res) =>{
//     try {                                  this is the way to handle api response without asyncHandler.
//         res.status(200).json.ApiResponses.success('API is working fine');
//     } catch (error) {                                                  
//         res.status(500).json(ApiResponses.error(error.message)); 
//     }
// }

//But we have created asyncHandler to handle the error and success response in a better way.

const healthcheck = asyncHandler(async (req , res) => {
    // return res
    // .status(200)
    // .json({message : "test ok"}) // but this is not standardized response.

    return res
    .status(200)
    .json(new ApiResponse(200 , "OK" , "Health check passed"))
})

export {healthcheck}