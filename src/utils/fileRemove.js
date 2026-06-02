import fs from "fs";
import { asyncHandler } from "./asynchandler";

const deleteLocalFile = (filePath)=>{
    try{
        if(filePath && fs.existsSync(filePath)){
            fs.unlinkSync(filepath)
        }
    } catch (error) {
        console.error("Error deleting file:", error.message);
      }
}

export {deleteLocalFile}