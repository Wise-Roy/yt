import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});

const uploadOnCloudinary = async (localFilePath)=> {
    try{
        if(!localFilePath) return null
        // upload
        const res = await cloudinary.uploader.upload(localFilePath,{
            resource_type: "auto"
        })
        fs.unlinkSync(localFilePath)
        return res;
    } catch(error){
        fs.unlinkSync(localFilePath) // remove file locally as upload failed
        return null;
    }
}


export {uploadOnCloudinary};
 