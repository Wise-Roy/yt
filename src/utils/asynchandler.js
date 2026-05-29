export {asyncHandler}

// Try catch way of writing function
// const asyncHandler=(fn)=> async (req,res,next) => {
//     try{
//         await fn(req,res,next);
//     } catch(error){
//         res.status(error.code || 500).json({
//             success : false,
//             message: error.message
//         })
//     }
// }

// Promise method of writing it
const asyncHandler = (requestHandler) => {
return (req,res,next) => {
    Promise.resolve(requestHandler(req,res,next)).catch((err)=> next(err));
}
}