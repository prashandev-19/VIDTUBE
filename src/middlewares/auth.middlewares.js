// Importing required modules
import jwt from "jsonwebtoken"; // For verifying the JWT
import { User } from "../models/user.models.js"; // Mongoose model to find user
import { ApiError } from "../utils/ApiError.js"; // Custom error class
import { asyncHandler } from "../utils/asyncHandler.js"; // Wrapper to catch async errors

// Exporting the verifyJWT middleware function
export const verifyJWT = asyncHandler(async (req, _ , next) => {

    // 1️⃣ Get the token from either cookies or the Authorization header
    const token = req.cookies.accessToken || req.header("Authorization")?.replace("Bearer ", "");

    // 2️⃣ If no token is found, throw an unauthorized error
    if (!token) {
        throw new ApiError(401, "Unauthorized access");
    }

    try {
        // 3️⃣ Verify the token using your secret key from .env file
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

        // 4️⃣ Find the user from the database using the ID from the token
        const user = await User.findById(decodedToken?._id)
            .select("-password -refreshToken"); // Exclude sensitive fields

        // 5️⃣ If no user is found, token is invalid
        if (!user) {
            throw new ApiError(401, "Unauthorized access");
        }

        // 6️⃣ Attach the user to the request object so that future middleware/routes can access it
        req.user = user;

        // 7️⃣ Pass control to the next middleware or route handler
        next();

    } catch (error) {
        // 8️⃣ If something fails during verification, throw an error
        throw new ApiError(401, error?.message || "Invalid Access token");
    }
});
