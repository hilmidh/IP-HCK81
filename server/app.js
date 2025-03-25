if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const axios = require("axios");
var express = require("express");
var request = require("request");
var crypto = require("crypto");
var cors = require("cors");
var querystring = require("querystring");
var cookieParser = require("cookie-parser");
const { release } = require("os");

var client_id = process.env.CLIENT_ID; // your clientId
var client_secret = process.env.CLIENT_SECRET; // Your secret
var redirect_uri = process.env.REDIRECT_URI; // Your redirect uri

const generateRandomString = (length) => {
  return crypto.randomBytes(60).toString("hex").slice(0, length);
};

var stateKey = "spotify_auth_state";

var app = express();

app
  .use(express.static(__dirname + "/public"))
  .use(cors())
  .use(cookieParser())
  .use(express.json());

app.get("/login", function (req, res) {
  var state = generateRandomString(16);
  res.cookie(stateKey, state);

  // your application requests authorization
  var scope =
    "user-read-private user-read-email user-top-read playlist-modify-public playlist-modify-private";
  res.send(
    "https://accounts.spotify.com/authorize?" +
      querystring.stringify({
        response_type: "code",
        client_id: client_id,
        scope: scope,
        redirect_uri: redirect_uri,
        state: state,
      })
  );
});

app.get("/callback", function (req, res) {
  // your application requests refresh and access tokens
  // after checking the state parameter

  var code = req.query.code || null;
  var state = req.query.state || null;
  var storedState = req.cookies ? req.cookies[stateKey] : null;

  // if (state === null || state !== storedState) {
  if (state === null) {
    res.redirect(
      "/#" +
        querystring.stringify({
          error: "state_mismatch",
        })
    );
  } else {
    res.clearCookie(stateKey);
    var authOptions = {
      url: "https://accounts.spotify.com/api/token",
      form: {
        code: code,
        redirect_uri: redirect_uri,
        grant_type: "authorization_code",
      },
      headers: {
        "content-type": "application/x-www-form-urlencoded",
        Authorization:
          "Basic " +
          new Buffer.from(client_id + ":" + client_secret).toString("base64"),
      },
      json: true,
    };

    request.post(authOptions, function (error, response, body) {
      if (!error && response.statusCode === 200) {
        var access_token = body.access_token,
          refresh_token = body.refresh_token;

        // var options = {
        //   url: "https://api.spotify.com/v1/me",
        //   headers: { Authorization: "Bearer " + access_token },
        //   json: true,
        // };

        // // use the access token to access the Spotify Web API
        // request.get(options, function (error, response, body) {
        //   console.log(body);
        // });
        res.status(200).json({ access_token, refresh_token });
        // we can also pass the token to the browser to make requests from there
        // res.redirect(
        //   "/?" +
        //     querystring.stringify({
        //       access_token: access_token,
        //       refresh_token: refresh_token,
        //     })
        // );
      } else {
        res.status(400).json({ error: "invalid_token" });
        // res.redirect(
        //   "/#" +
        //     querystring.stringify({
        //       error: "invalid_token",
        //     })
        // );
      }
    });
  }
});

app.get("/refresh_token", function (req, res) {
  var refresh_token = req.query.refresh_token;
  var authOptions = {
    url: "https://accounts.spotify.com/api/token",
    headers: {
      "content-type": "application/x-www-form-urlencoded",
      Authorization:
        "Basic " +
        new Buffer.from(client_id + ":" + client_secret).toString("base64"),
    },
    form: {
      grant_type: "refresh_token",
      refresh_token: refresh_token,
    },
    json: true,
  };

  request.post(authOptions, function (error, response, body) {
    if (!error && response.statusCode === 200) {
      var access_token = body.access_token,
        refresh_token = body.refresh_token;
      res.send({
        access_token: access_token,
        refresh_token: refresh_token,
      });
    }
  });
});

app.get("/getuser", async (req, res) => {
  try {
    const response = await axios.get("https://api.spotify.com/v1/me", {
      headers: {
        Authorization: req.headers.authorization,
      },
    });
    res.json(response.data);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error fetch user");
  }
});

app.get("/gettoptracks", async (req, res) => {
  try {
    const response = await axios.get(
      "https://api.spotify.com/v1/me/top/tracks?time_range=medium_term&limit=10",
      {
        headers: {
          Authorization: req.headers.authorization,
        },
      }
    );
    const tracks = response.data.items.map((track) => {
      return {
        name: track.name,
        artist: track.artists[0].name,
        image: track.album.images[0].url,
        release_date: track.album.release_date,
      };
    });
    res.json(tracks);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error fetch top tracks");
  }
});

app.get("/gettopartists", async (req, res) => {
  try {
    const response = await axios.get(
      "https://api.spotify.com/v1/me/top/artists?time_range=medium_term&limit=10",
      {
        headers: {
          Authorization: req.headers.authorization,
        },
      }
    );
    const artists = response.data.items.map((artist) => {
      return {
        name: artist.name,
        image: artist.images[0].url,
        genres: artist.genres,
      }
    } )
    res.json(artists);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error fetch top artists");
  }
});

console.log("Listening on 3000");
app.listen(3000);
