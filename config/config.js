const { Rekognition } = require("@aws-sdk/client-rekognition");
const { createClient } = require("@supabase/supabase-js");

require("dotenv").config();

// AWS Rekognition setup
const rekognition = new Rekognition({
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
  region: "ap-south-1",
});

// Supabase setup
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

module.exports = { rekognition, supabase };
