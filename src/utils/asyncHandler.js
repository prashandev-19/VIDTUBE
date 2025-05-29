// A higher-order function that takes an async function (requestHandler) as argument
const asyncHandler = (requestHandler) => {

    // It returns a new function that Express can use as a middleware
    return (req, res, next) => {

        // Executes the async function and automatically catches any errors
        // and passes them to 'next' (which will be caught by Express error middleware)
        Promise.resolve(requestHandler(req, res, next)).catch((err) => next(err));
    };
};

// Exporting it to use in other files
export { asyncHandler };
// This is a utility function that helps in writing cleaner and more readable code
// when dealing with asynchronous operations in Express.js routes.