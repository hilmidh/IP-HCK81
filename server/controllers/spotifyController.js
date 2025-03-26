const axios = require("axios");
var request = require("request");
var crypto = require("crypto");
var querystring = require("querystring");
var cookieParser = require("cookie-parser");

var client_id = process.env.CLIENT_ID; // your clientId
var client_secret = process.env.CLIENT_SECRET; // Your secret
var redirect_uri = process.env.REDIRECT_URI; // Your redirect uri

const generateRandomString = (length) => {
  return crypto.randomBytes(60).toString("hex").slice(0, length);
};

var stateKey = "spotify_auth_state";

let spotifyToken = "";

class SpotifyControllers {
  static async login(req, res) {
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
  }

  static async callback(req, res) {
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

          // assign spotify login token to spotifyToken
          spotifyToken = access_token;

          res.status(200).json({ access_token, refresh_token });
        } else {
          res.status(400).json({ error: "invalid_token" });
        }
      });
    }
  }

  static async refresh_token(req, res) {
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
  }

  static async getUser(req, res) {
    try {
      const response = await axios.get("https://api.spotify.com/v1/me", {
        headers: {
          Authorization: `Bearer ${spotifyToken}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  static async getTopTracks(req, res) {
    try {
      const response = await axios.get(
        "https://api.spotify.com/v1/me/top/tracks?time_range=short_term&limit=10",
        {
          headers: {
            Authorization: `Bearer ${spotifyToken}`,
          },
        }
      );
      const tracks = response.data.items.map((track) => {
        return {
          title: track.name,
          artist:
            track.artists.length < 1
              ? track.artists[0].name
              : track.artists.map((artist) => artist.name).join(", "),
          album: track.album.name,
          image: track.album.images[0].url,
          release_date: track.album.release_date,
        };
      });
      return tracks;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  static async getTopArtists(req, res) {
    try {
      const response = await axios.get(
        "https://api.spotify.com/v1/me/top/artists?time_range=short_term&limit=10",
        {
          headers: {
            Authorization: `Bearer ${spotifyToken}`,
          },
        }
      );
      const artists = response.data.items.map((artist) => {
        return {
          name: artist.name,
          image: artist.images[0].url,
          genres: artist.genres,
        };
      });
      return artists;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  static async getSongsUri(songsString) {
    try {
      let songsUri = await Promise.all(
        songsString.map(async (song, i) => {
          console.log(song, i);
          const response = await axios.get(
            `https://api.spotify.com/v1/search?q=${song}&type=track&market=ID&limit=1&offset=0`,
            {
              headers: {
                Authorization: `Bearer ${spotifyToken}`,
              },
            }
          );
          return response.data.tracks.items[0].uri;
        })
      );

      return songsUri;
      // res.json(songsUri); // Send the resolved songsUri as the response
    } catch (error) {
      console.error("Error fetching songs:", error);
      throw error;
    }
  }

  static async createPlaylist(id) {
    try {
      const response = await axios.post(
        `https://api.spotify.com/v1/users/${id}/playlists`,
        {
          name: "Recommended by SPOTT",
          description:
            "SPOTT knows you best - Handpicked just for you, this playlist matches your vibe, mood, and taste. Sit back and enjoy the perfect tunes!",
          public: true,
        },
        {
          headers: {
            Authorization: `Bearer ${spotifyToken}`,
          },
        }
      );
      let playlistId = response.data.id;
      return playlistId;
      // res.json(playlistId); // Send the resolved playlistId as the response
    } catch (error) {
      console.error("Error creating playlist:", error);
      throw error;
    }
  }

  static async addSong(playlistId, songsUri) {
    try {
      const response = await axios.post(
        `https://api.spotify.com/v1/playlists/${playlistId}/tracks?position=0&uris=${songsUri
          .join(",")
          .replace(/:/g, "%3A")
          .replace(/,/g, "%2C")}`,
        {
          uris: "string",
          position: 0,
        },
        {
          headers: {
            Authorization: `Bearer ${spotifyToken}`,
            "Content-Type": "application/json",
          },
        }
      );
      console.log(response.data);
      return { response: response.data, playlistId }
      // res.json({ response: response.data, playlistId }); // Send the resolved response as the response
    } catch (error) {
      console.error("Error adding songs to playlist:", error.message);
      throw error
    }
  }
}

module.exports = {
  SpotifyControllers,
  spotifyToken,
};
