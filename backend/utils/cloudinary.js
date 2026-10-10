import { v2 as cloudinary } from 'cloudinary'
import fs from "fs"

const uploadOnCloudinary = async (file) => {
    if (!file) return null;

    const hasCloudinary = process.env.CLOUDINARY_CLOUD_NAME && 
                          process.env.CLOUDINARY_CLOUD_NAME !== "your_cloudinary_cloud_name" &&
                          process.env.CLOUDINARY_API_KEY && 
                          process.env.CLOUDINARY_API_KEY !== "your_cloudinary_api_key";

    if (hasCloudinary) {
        cloudinary.config({
            cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
            api_key: process.env.CLOUDINARY_API_KEY,
            api_secret: process.env.CLOUDINARY_API_SECRET
        });
        try {
            const result = await cloudinary.uploader.upload(file);
            try { fs.unlinkSync(file); } catch (e) {}
            return result.secure_url;
        } catch (error) {
            console.warn("Cloudinary upload failed, using local Data URL fallback:", error.message);
        }
    }

    // Fallback: Read file to base64 Data URL so the image is safely saved and rendered everywhere
    try {
        const fileBuffer = fs.readFileSync(file);
        const ext = file.split('.').pop().toLowerCase();
        const mime = ext === "png" ? "image/png" : ext === "webp" ? "image/webp" : "image/jpeg";
        const dataUrl = `data:${mime};base64,${fileBuffer.toString("base64")}`;
        try { fs.unlinkSync(file); } catch (e) {}
        return dataUrl;
    } catch (err) {
        console.error("Local image fallback error:", err);
        try { fs.unlinkSync(file); } catch (e) {}
        return "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800";
    }
}

export default uploadOnCloudinary