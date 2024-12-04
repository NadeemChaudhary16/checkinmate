const { supabase } = require("../config/config");
const { convertToBase64 } = require("../utils/imageUtils");
const { compareFaces } = require("../utils/faceUtils");

const handleCheckOut = async (req, res) => {
  const { imageBase64 } = req.body;
  if (!imageBase64) {
    console.error("No image provided.");
    return res
      .status(400)
      .json({ success: false, error: "No image provided." });
  }

  try {
    const twelveHoursAgo = new Date(
      Date.now() - 12 * 60 * 60 * 1000
    ).toISOString();

    const { data: visitors, error: fetchError } = await supabase
      .from("visitors")
      .select("id, full_name, image_url, created_at, check_out_time")
      .gte("created_at", twelveHoursAgo);

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

    // Check if the visitor has already checked out
    if (matchedVisitor.check_out_time) {
      console.log("Visitor has already checked out:", matchedVisitor.full_name);
      return res.status(200).json({
        success: true,
        message: `Hello, ${matchedVisitor.full_name}! You have already checked out.`,
      });
    }

    console.log("Check-out matched visitor:", matchedVisitor.full_name);

    const { error: updateError } = await supabase
      .from("visitors")
      .update({ check_out_time: new Date().toISOString() })
      .eq("id", matchedVisitor.id);

    if (updateError) {
      console.error("Error updating check-out time:", updateError);
      return res
        .status(500)
        .json({ success: false, error: "Failed to update check-out time." });
    }

    return res.status(200).json({
      success: true,
      message: `Welcome, ${matchedVisitor.full_name}!`,
    });
  } catch (error) {
    console.error("Error in check-out process:", error);
    return res.status(500).json({
      success: false,
      error: "Check-out failed. Please try again.",
    });
  }
};

module.exports = { handleCheckOut };
