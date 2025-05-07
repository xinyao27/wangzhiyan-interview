import { Hono } from "hono";

// Create Hono instance for upload
const uploadApi = new Hono();

// Upload image API
uploadApi.post("/upload", async (c) => {
  try {
    const formData = await c.req.formData();
    const image = formData.get("image") as File;

    if (!image) {
      return c.json({ error: "No image file provided" }, 400);
    }

    // Validate file is an image
    if (!image.type.startsWith("image/")) {
      return c.json({ error: "File must be an image" }, 400);
    }

    // Limit file size (5MB)
    if (image.size > 5 * 1024 * 1024) {
      return c.json({ error: "Image size must be less than 5MB" }, 400);
    }

    // Convert File to arrayBuffer then Buffer
    const bytes = await image.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Upload to ImgBB
    const apiKey = process.env.IMGBB_API_KEY;
    if (!apiKey) {
      return c.json({ error: "ImgBB API key not configured" }, 500);
    }

    // Create multipart form data for ImgBB
    const imgbbFormData = new FormData();
    imgbbFormData.append("key", apiKey);

    // Convert buffer to Blob and append to form
    const blob = new Blob([buffer], { type: image.type });
    imgbbFormData.append("image", blob, image.name);

    // Send to ImgBB API
    const response = await fetch("https://api.imgbb.com/1/upload", {
      method: "POST",
      body: imgbbFormData,
    });

    if (!response.ok) {
      console.error("ImgBB API error:", response.status, await response.text());
      return c.json({ error: "Failed to upload image to ImgBB" }, 500);
    }

    const imgbbData = await response.json();

    // Return ImgBB image URL
    return c.json({
      success: true,
      imageUrl: imgbbData.data.url,
      thumbnailUrl: imgbbData.data.thumb?.url || imgbbData.data.url,
      message: "Image uploaded successfully to ImgBB",
    });
  } catch (error) {
    console.error("Error uploading image:", error);
    return c.json({ error: "Failed to upload image" }, 500);
  }
});

export { uploadApi };
