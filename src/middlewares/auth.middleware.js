import jwt from "jsonwebtoken";
import { APIError } from "../utils/ApiError";
import { asyncHandler } from "../utils/asynchandler";

export const verifyJWT = asyncHandler(async(req,res,next)=> {
    try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ","");
        if(!token){
            throw new APIError(401, "Unauthorized User");
        }
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    
        const user = await User.findById(decodedToken?._id).select("-password -refreshToken");
    
        if(!user){
            throw new APIError(401, "Unauthorized User");
        }
        req.user = user;
        next();
    } catch (error) {
        throw new APIError(401, error?.message || "Invalid access Token");
    }
})