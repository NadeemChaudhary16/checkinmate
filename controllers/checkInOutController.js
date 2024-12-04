const { supabase } = require("../config/config");
const { convertToBase64 } = require("../utils/imageUtils");
const { compareFaces } = require("../utils/faceUtils");

const handleCheckInOut = async (req, res, type) => {
  const { imageBase64 } = req.body;
  if (!imageBase64) {
    console.error("No image provided.");
    return res
      .status(400)
      .json({ success: false, error: "No image provided." });
  }

  try {
    const twentyFourHoursAgo = new Date(
      Date.now() - 12 * 60 * 60 * 1000
    ).toISOString();
    const { data: visitors, error: fetchError } = await supabase
      .from("visitors")
      .select("id, full_name, image_url, created_at")
      .gte("created_at", twentyFourHoursAgo);

    if (fetchError) {
      console.error("Error fetching visitors:", fetchError);
      return res
        .status(500)
        .json({ success: false, error: "Failed to retrieve visitors." });
    }

    let matchedVisitor = null;

    for (const visitor of visitors || []) {
      const targetBase64 = await convertToBase64(visitor.image_url);
      const isMatch = await compareFaces(imageBase64, targetBase64);
      if (isMatch) {
        matchedVisitor = visitor;
        break;
      }
    }

    if (!matchedVisitor) {
      console.error("No matching visitor found.");
      return res
        .status(404)
        .json({ success: false, error: "No matching visitor found." });
    }
    console.log(
      `${type.charAt(0).toUpperCase() + type.slice(1)} matched visitor:`,
      matchedVisitor.full_name
    );

    const updateData =
      type === "check-in"
        ? { check_in_time: new Date().toISOString() }
        : { check_out_time: new Date().toISOString() };

    const { error: updateError } = await supabase
      .from("visitors")
      .update(updateData)
      .eq("id", matchedVisitor.id);

    if (updateError) {
      console.error(`Error updating ${type} time:`, updateError);
      return res
        .status(500)
        .json({ success: false, error: `Failed to update ${type} time.` });
    }

    console.log(`${type.charAt(0).toUpperCase() + type.slice(1)} successful.`);
    return res.status(200).json({
      success: true,
      message: `${type === "check-in" ? "Welcome" : "Bye"}, ${
        matchedVisitor.full_name
      }!`,
    });
  } catch (error) {
    console.error(`Error in ${type} process:`, error);
    return res.status(500).json({
      success: false,
      error: `${
        type.charAt(0).toUpperCase() + type.slice(1)
      } failed. Please try again.`,
    });
  }
};

module.exports = { handleCheckInOut };
