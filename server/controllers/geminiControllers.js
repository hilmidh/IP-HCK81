const { GoogleGenerativeAI } = require("@google/generative-ai");
const axios = require("axios");

class GeminiControllers {
  static async getGemini(req, res) {
    let artists = [];
    let tracks = [];

    const headers = { Authorization: req.headers.authorization };

    // Fetch top artists
    try {
      const response = await axios.get(
        "https://api.spotify.com/v1/me/top/artists?time_range=short_term&limit=10",
        { headers }
      );
      artists = response.data.items.map((artist) => ({
        name: artist.name,
        genres: artist.genres,
      }));
      console.log(artists)
    } catch (error) {
      console.error("Error fetching top artists:", error);
      return res
        .status(error.status)
        .json({ error: "Failed to fetch top artists" });
    }

    // Fetch top tracks
    try {
      const response = await axios.get(
        "https://api.spotify.com/v1/me/top/tracks?time_range=short_term&limit=10",
        { headers }
      );
      tracks = response.data.items.map((track) => ({
        title: track.name,
        artist:
          track.artists.length > 0
            ? track.artists.map((artist) => artist.name).join(", ")
            : "Unknown Artist",
      }));
      console.log(tracks)
    } catch (error) {
      console.error("Error fetching top tracks:", error.message);
      return res.status(500).json({ error: "Failed to fetch top tracks" });
    }

    // Using Gemini Generative AI
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

    //get song url
    try {
      const songsUrl = await Promise.all(
        songsString.map(async (song, i) => {
          console.log(song, i);
          const response = await axios.get(
            `https://api.spotify.com/v1/search?q=${song}&type=track&market=ID&limit=1&offset=0`,
            { headers }
          );
          return response.data.tracks.items[0].uri;
        })
      );
    
      console.log(songsUrl);
      res.json( songsUrl ); // Send the resolved songsUrl as the response
    } catch (error) {
      console.error("Error fetching songs:", error);
      return res.status(500).json({ error: "Failed to fetch songs" });
    }
  }
}

module.exports = {
  GeminiControllers,
};
