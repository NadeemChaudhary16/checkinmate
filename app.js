const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const { apiRoutes } = require("./routes/apiRoutes");

const app = express();
const PORT = 3000;

app.use(cors());
app.use(bodyParser.json({ limit: "10mb" }));
app.use(bodyParser.urlencoded({ extended: true }));

// API routes
app.use("/api", apiRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
