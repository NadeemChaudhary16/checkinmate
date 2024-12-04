const axios = require("axios");

// Function to convert image URL to base64 (Node.js version)
const convertToBase64 = async (url) => {
  try {
    const response = await axios.get(url, { responseType: "arraybuffer" });
    const imageBuffer = Buffer.from(response.data, "binary");
    return imageBuffer.toString("base64");
  } catch (error) {
    console.error("Error fetching image:", error);
    throw error;
  }
};

const decodeBase64Image = (base64String) => {
  const base64Data = base64String.replace(/^data:image\/\w+;base64,/, "");
  return Buffer.from(base64Data, "base64");
};

module.exports = { convertToBase64, decodeBase64Image };
