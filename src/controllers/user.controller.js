import {asyncHandler} from "../utils/asynchandler.js"
import {APIError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {User} from "../models/user.model.js"
import{uploadOnCloudinary} from "../utils/fileUpload.js"


const registerUser = asyncHandler(async(req,res)=> {
    // get user details from frontend
    // validation
    // user already exists or not
    // check for images, and avatar
    // upload them to cloudinary
    // create user object - entry in db
    // remove password and refresh token  field from response
    // check user created 
    // return response

    const {username, email, fullname, password} = req.body
    if ([fullname,email,username,password].some((field)=>
    field?.trim()=== "")){
        throw new APIError(400,"All Fields are required");
    }

    const existedUser = User.findOne({
        $or: [{username},{email}]
    })
    if(existedUser){
        throw new APIError(409,"User already exist");
    }

    const avatarLocalPath = req.files?.avatar[0]?.path;
    const coverImageLocalPath = req.files?.coverImage[0]?.path;

    if(!avatarLocalPath) throw new APIError(400,"Avatar Not found");

    const avatar = await uploadOnCloudinary(avatarLocalPath);
    const coverImage = await uploadOnCloudinary(coverImageLocalPath);
    if(!avatar)throw new APIError(400, "Avatar image Not found");

    const user = User.create({
        fullname,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email,
        password,
        username: username.toLowerCase()
    })

    const createdUser = await User.findById(user._id).select("-password -refreshToken")

    if(!createdUser) throw new APIError(500, "Something went wrong")

        return res.status(201).json(
            new ApiResponse(200,createdUser,"User Created Successfully!!")
        )


})

export {registerUser}