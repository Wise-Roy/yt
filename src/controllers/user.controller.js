import {asyncHandler} from "../utils/asynchandler.js"
import {APIError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {User} from "../models/user.model.js"
import{uploadOnCloudinary} from "../utils/fileUpload.js"



const generateAccessRefreshToken=async(userId)=> {
    try{
        const user = await User.findById(userId);
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        user.refreshToken = refreshToken;
        user.save({validateBeforeSave: false});

        return { accessToken, refreshToken };
    } catch(err){
        throw new APIError(500,err);
    }
}

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

    const existedUser = await User.findOne({
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

    const user = await User.create({
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

const loginUser = asyncHandler(async(req,res)=> {
    // req , data extract
    // check if data exist
    // check if user exist
    // check if password is correct
    // generate refresh and access token

    const {email,username, password} = req.body;
    if(!username || !password || !email) {throw new APIError(400,"Credentials Required")};
    const existedUser = await User.findOne(
        {$or: [{username},{email}]}
    );
    if(!existedUser) { throw new APIError(400,"User does not exist")}
    const checkPassword = existedUser.isPasswordCorrect(password);
    if(!checkPassword){
        throw new APIError(401, "Invalid Username or password");
    }
    const { refreshToken, accessToken } = await generateAccessRefreshToken(
      existedUser._id
    );

    const options = {
        httpOnly: true,
        secure: true
    }

    return res.status(200).cookie("accessToken",accessToken,options)
    .cookie("refreshToken",refreshToken,options).json(
        new ApiResponse(
            200,
            {user: accessToken, refreshToken},
            "User LogedIn successfully"
        )
    );
});

const logoutUser = asyncHandler(async(req,res)=> {
    User.findByIdAndUpdate(req.user._id, {
        $set: {
            refreshToken : undefined
        },
        
    },
{
    new: true
});

const options = {
  httpOnly: true,
  secure: true,
};

return res.status(200)
.clearCookie("accessToken",options)
.clearCookie("refreshToken", options)
.json(new ApiResponse(200, {},"User Logged Out"));
})

const refreshAccessToken = asyncHandler(async(req,res,next)=> {
    try {
        const token = req.cookies.refreshToken || ReadableByteStreamController.body.refreshToken;
        if(!token){
            throw new APIError(401, "Unauthorized Error");
        }
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        const user = User.findById(decodedToken?._id);
        if(!user){
            throw new APIError(402, "Invalid token");
        }
    
        if(token !== user?.refreshToken){
            throw new APIError(401, "Refresh Token is Invalid token");
        }
    
        const options = {
            http: true,
            secure: true
        };
        const { newRefreshToken, accessToken } = await generateAccessRefreshToken(
          existedUser._id
        );
    
        return res
          .status(200)
          .cookie("accessToken", accessToken, options)
          .cookie("accessToken", newRefreshToken, options)
          .json(
            new ApiResponse(
                200,
                "Access Token refreshed"
            )
          )
    } catch (error) {
        throw new APIError(500, error?.message || "Server Error");
    }
  


})

export { registerUser, loginUser, logoutUser, refreshAccessToken };