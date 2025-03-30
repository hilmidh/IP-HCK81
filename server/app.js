
  require("dotenv").config();


const axios = require("axios");
var express = require("express");
var request = require("request");
const jwt = require("jsonwebtoken");
var crypto = require("crypto");
var cors = require("cors");
var querystring = require("querystring");
var cookieParser = require("cookie-parser");

const { GeminiControllers } = require("./controllers/geminiControllers");
const { SpotifyControllers } = require("./controllers/spotifyController");
const { User } = require("./models");

const {OAuth2Client} = require('google-auth-library');
// const { authentication } = require("./middlewares/authentication");
const client = new OAuth2Client();



var app = express();


app
  .use(express.static(__dirname + "/public"))
  .use(cors())
  .use(cookieParser())
  .use(express.json());

app.post("/auth/google", async (req, res) => {
  const { googleToken } = req.body;
  try {
    const ticket = await client.verifyIdToken({
      idToken: googleToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    const [user, created] = await User.findOrCreate({
      where: { email: payload.email },
      defaults: {
        name: payload.name,
        email: payload.email,
        picture: payload.picture,
        provider: "google",
        password: "google_id",
      },
      hooks: false,
    });
    

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET);
    res.status(created ? 201 : 200).json({ access_token: token });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get("/login", SpotifyControllers.login);

app.get("/callback", SpotifyControllers.callback);

app.post("/refresh_token", SpotifyControllers.refresh_token);

// app.use(authentication)
app.get('getCurrentUser', async (req, res) => {
  try {
    const data = await SpotifyControllers.getUser();
    res.json(data);
  } catch (error) {
    res.status(error.status).send(error)
  }
})

app.get("/getuser", async (req, res) => {
  try {
    const data = await SpotifyControllers.getUser();
    res.json(data);
  } catch (error) {
    res.status(error.status).send(error)
  }
});

app.get("/gettoptracks", async (req, res) => {
  try {
    const data = await SpotifyControllers.getTopTracks();
    res.json(data);
  } catch (error) {
    res.status(error.status).send(error)
  }
});

app.get("/gettopartists", async (req, res) => {
  try {
    const data = await SpotifyControllers.getTopArtists();
    res.json(data);
  } catch (error) {
    res.status(error.status).send(error)
  }
});

app.post("/generate", GeminiControllers.getGemini);


app.put("/updatePlaylistName", async (req, res) => {
  try {
    const { playlistId, name } = req.body;
    const data = await SpotifyControllers.updatePlaylistName(playlistId, name);
    res.json(data);
  } catch (error) {
    res.status(error.status).send(error);
  }
})

// app.get('loggedIn', async () => {

// })

console.log("Listening on 3000");
app.listen(3000);
