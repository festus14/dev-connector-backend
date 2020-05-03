const express = require("express");

const users = require("./routes/apis/users");
const profile = require("./routes/apis/profile");
const posts = require("./routes/apis/posts");

const app = express();

const MongoClient = require("mongodb").MongoClient;
const uri = "mongodb://127.0.0.1/dev_connector";
const client = new MongoClient(uri, {
  useUnifiedTopology: true,
  useNewUrlParser: true,
});
client.connect((err) => {
  if (err) console.log(err);
  else {
    console.log("MongoDB Connected");
  }
  // const collection = client.db("test").collection("devices");
  // perform actions on the collection object
  client.close();
});

// @route   GET /
// @desc    Test home route
// @access  Public
app.get("/", (req, res) => {
  res.send("Hello megan");
});

// Use Route
app.use("/api/users", users);
app.use("/api/profile", profile);
app.use("/api/posts", posts);

const port = process.env.PORT || 5000;

app.listen(port, () => console.log(`Server running on port ${port}`));
