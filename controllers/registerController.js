const { supabase,rekognition } = require("../config/config");
const { decodeBase64Image } = require("../utils/imageUtils");

const handleRegistration = async (req, res) => {
  try {
    const {
      fullName,
      email,
      phoneNumber,
      purpose,
      personVisiting,
      imageBase64,
    } = req.body;

    if (
      !fullName ||
      !email ||
      !phoneNumber ||
      !purpose ||
      !personVisiting ||
      !imageBase64
    ) {
      return res.status(400).json({ error: "All fields are required." });
    }

    const imageBuffer = decodeBase64Image(imageBase64);
    const imageName = `${Date.now()}.jpg`;

    const { data, error: uploadError } = await supabase.storage
      .from("visitor")
      .upload(imageName, imageBuffer, { contentType: "image/jpeg" });

    if (uploadError) throw new Error(uploadError.message);
    console.log("Image uploaded successfully:", data);

    const { data: publicUrlData, error: publicUrlError } = supabase.storage
      .from("visitor")
      .getPublicUrl(imageName);

    if (publicUrlError) throw new Error(publicUrlError.message);

    const publicUrl = publicUrlData.publicUrl;

    const rekognitionParams = { Image: { Bytes: imageBuffer } };
    const faceDetectionResponse = await rekognition.detectFaces(
      rekognitionParams
    );

    if (faceDetectionResponse.FaceDetails.length > 0) {
      const { error: visitorError } = await supabase.from("visitors").insert([
        {
          full_name: fullName,
          email,
          phone_number: phoneNumber,
          purpose,
          person_visiting: personVisiting,
          image_url: publicUrl,
        },
      ]);

      if (visitorError) throw new Error(visitorError.message);

      res.status(200).json({ message: "Visitor registered successfully!" });
    } else {
      return res.status(400).json({ error: "No face detected in the image." });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { handleRegistration };
