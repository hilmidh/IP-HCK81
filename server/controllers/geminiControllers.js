const { GoogleGenerativeAI } = require("@google/generative-ai");
const axios = require("axios");
// let { spotifyToken } = require("../controllers/spotifyController.js");
const { SpotifyControllers } = require("../controllers/spotifyController.js");

class GeminiControllers {
  static async getGemini(req, res) {
    try {
      let artists = [];
      let tracks = [];

      // const headers = { Authorization: `Bearer ${spotifyToken}` };

      ////////////////////////////// Fetch top artists
      // console.log(headers, "<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<")
      // try {
      //   const response = await axios.get(
      //     "https://api.spotify.com/v1/me/top/artists?time_range=short_term&limit=10",
      //     { headers }
      //   );
      //   artists = response.data.items.map((artist) => ({
      //     name: artist.name,
      //     genres: artist.genres,
      //   }));
      //   console.log(artists);
      // } catch (error) {
      //   console.error("Error fetching top artists:", error);
      //   return res
      //     .status(error.status)
      //     .json({ error: "Failed to fetch top artists" });
      // }

      artists = await SpotifyControllers.getTopArtists();

      /////////////////////////// Fetch top tracks
      // try {
      //   const response = await axios.get(
      //     "https://api.spotify.com/v1/me/top/tracks?time_range=short_term&limit=10",
      //     { headers }
      //   );
      //   tracks = response.data.items.map((track) => ({
      //     title: track.name,
      //     artist:
      //       track.artists.length > 0
      //         ? track.artists.map((artist) => artist.name).join(", ")
      //         : "Unknown Artist",
      //   }));
      //   console.log(tracks);
      // } catch (error) {
      //   console.error("Error fetching top tracks:", error.message);
      //   return res.status(500).json({ error: "Failed to fetch top tracks" });
      // }

      tracks = await SpotifyControllers.getTopTracks();

      /////////////////////// Using Gemini Generative AI
      if (!process.env.GEMINI_API_KEY) {
        return res.status(500).json({ error: "GEMINI_API_KEY is not set" });
      }

      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

      const model = genAI.getGenerativeModel({
        model: "gemini-2.0-flash",
        generationConfig: {
          responseMimeType: "application/json",
        },
      });

      const prompt = `Give me 10 song recommendations based on my top artists and tracks:
    Artists: ${artists.map((artist) => artist.name).join(", ")}
    Tracks: ${tracks.map((track) => track.name).join(", ")}
    Use this JSON schema:
    Song={'title':string, 'artist':string}
    Return: Array<Song>`;
      let songsString = [];
      try {
        const result = await model.generateContent(prompt);

        if (
          !result ||
          !result.response ||
          !result.response.candidates ||
          !result.response.candidates[0] ||
          !result.response.candidates[0].content ||
          !result.response.candidates[0].content.parts ||
          !result.response.candidates[0].content.parts[0].text
        ) {
          throw new Error("Invalid AI response format");
        }

        const songs = JSON.parse(
          result.response.candidates[0].content.parts[0].text
        );

        songsString = songs.map((e) =>
          `${e.title} ${e.artist}`.replace(/ /g, "+")
        );

        console.log(songsString);
      } catch (error) {
        console.error("Error processing AI response:", error.message);
        res
          .status(500)
          .json({ error: "Failed to generate song recommendations" });
      }

      ////////////////get song uri
      let songsUri = [];
      // try {
      //   songsUri = await Promise.all(
      //     songsString.map(async (song, i) => {
      //       console.log(song, i);
      //       const response = await axios.get(
      //         `https://api.spotify.com/v1/search?q=${song}&type=track&market=ID&limit=1&offset=0`,
      //         { headers }
      //       );
      //       return response.data.tracks.items[0].uri;
      //     })
      //   );

      //   console.log(songsUri);
      //   // res.json(songsUri); // Send the resolved songsUri as the response
      // } catch (error) {
      //   console.error("Error fetching songs:", error);
      //   res.status(500).json({ error: "Failed to fetch songs" });
      // }

      songsUri = await SpotifyControllers.getSongsUri(songsString);

      //////////////get user id
      let id = "";
      // try {
      //   const response = await axios.get("https://api.spotify.com/v1/me", {
      //     headers,
      //   });
      //   id = response.data.id;
      // } catch (error) {
      //   console.error(error);
      //   res.status(500).send("Error fetch user");
      // }

      let dataUser = await SpotifyControllers.getUser();
      id = dataUser.id;

      //////////////create playlist
      let playlistId = "";
      // try {
      //   const response = await axios.post(
      //     `https://api.spotify.com/v1/users/${id}/playlists`,
      //     {
      //       name: "Recommended by SPOTT",
      //       description:
      //         "SPOTT knows you best - Handpicked just for you, this playlist matches your vibe, mood, and taste. Sit back and enjoy the perfect tunes!",
      //       public: true,
      //     },
      //     { headers }
      //   );
      //   playlistId = response.data.id;
      //   console.log(playlistId);
      //   // res.json(playlistId); // Send the resolved playlistId as the response
      // } catch (error) {
      //   console.error("Error creating playlist:", error);
      //   res.status(500).json({ error: "Failed to create playlist" });
      // }

      playlistId = await SpotifyControllers.createPlaylist(id);

      ////////add songs to playlist
      // try {
      //   const response = await axios.post(
      //     `https://api.spotify.com/v1/playlists/${playlistId}/tracks?position=0&uris=${songsUri.join(",").replace(/:/g, "%3A").replace(/,/g, "%2C")}`,
      //     {
      //       uris: 'string',
      //       position: 0,
      //     },
      //     {
      //       headers: {
      //         Authorization: req.headers.authorization,
      //         "Content-Type": "application/json",
      //       },
      //     }
      //   );
      //   console.log(response.data);
      //   res.json({response: response.data, playlistId}); // Send the resolved response as the response
      // } catch (error) {
      //   console.error("Error adding songs to playlist:", error.message);
      //   res.status(error.status).json({ error: "Failed to add songs to playlist" });
      // }

      let data = await SpotifyControllers.addSong(playlistId, songsUri);
      console.log(data)

      let playlist = await SpotifyControllers.getPlaylist(playlistId);
      res.json(playlist);
    } catch (error) {
      res.send(error);
    }
  }
}

module.exports = {
  GeminiControllers,
};
