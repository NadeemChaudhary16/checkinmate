const { rekognition } = require("../config/config");
const { decodeBase64Image } = require("./imageUtils");

const compareFaces = async (sourceBase64, targetBase64) => {
  console.log("Starting face comparison...");
  try {
    const sourceBuffer = decodeBase64Image(sourceBase64);
    const targetBuffer = decodeBase64Image(targetBase64);

    const params = {
      SourceImage: { Bytes: sourceBuffer },
      TargetImage: { Bytes: targetBuffer },
      SimilarityThreshold: 80,
    };

    const result = await rekognition.compareFaces(params);
    return (result.FaceMatches?.length ?? 0) > 0;
  } catch (error) {
    console.error("Error in face comparison:", error);
    throw error;
  }
};

module.exports = { compareFaces };
