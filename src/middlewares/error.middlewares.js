import mongoose from "mongoose";
import { ApiError } from "../utils/ApiError.js";

// Centralized error-handling middleware for the app
const errorHandler = (err, req, res, next) => {
    let error = err;

    // If the thrown error is NOT an instance of ApiError, convert it into one
    if (!(error instanceof ApiError)) {
        const statusCode = error.statusCode || (error instanceof mongoose.Error ? 400 : 500); // Use 400 for Mongoose errors, otherwise default to 500
        const message = error.message || "Something went wrong"; // Default message if none provided
        error = new ApiError(
            statusCode,
            message,
            error?.errors || [], // Optional array of specific error details
            err.stack            // Stack trace for debugging
        );
    }

    // Build the response object
    const response = {
        ...error, // Spread custom error properties
        message: error.message,
        ...(process.env.NODE_ENV === "development" ? { stack: error.stack } : {}) // Show stack only in development
    };

    // Return the structured error response
    return res.status(error.statusCode).json(response);
};

export { errorHandler };
