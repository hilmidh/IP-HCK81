const { GoogleGenerativeAI } = require("@google/generative-ai");
const axios = require("axios");

class GeminiControllers {
  static async getGemini(req, res) {
    let artists = [];
    let tracks = [];
    //fetch top artists
    try {
      const response = await axios.get(
        "https://api.spotify.com/v1/me/top/artists?time_range=short_term&limit=10",
        {
          headers: {
            Authorization: req.headers.authorization,
          },
        }
      );
      artists = response.data.items.map((artist) => {
        return {
          name: artist.name,
          genres: artist.genres,
        };
      });
      //   res.json(artists);
    } catch (error) {
      console.error(error);
      res.status(500).send("Error fetch top artists");
    }

    //fetch top tracks
    try {
      const response = await axios.get(
        "https://api.spotify.com/v1/me/top/tracks?time_range=short_term&limit=10",
        {
          headers: {
            Authorization: req.headers.authorization,
          },
        }
      );
      tracks = response.data.items.map((track) => {
        return {
          name: track.name,
          artist:
            track.artists.length < 1
              ? track.artists[0].name
              : track.artists.map((artist) => artist.name).join(", "),
          album: track.album.name,
          image: track.album.images[0].url,
          release_date: track.album.release_date,
        };
      });
    } catch (error) {
      console.error(error);
      //   res.status(500).send("Error fetch top tracks");
    }

    //using gemini generative AI
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash",
      generationConfig: {
        responseMimeType: "application/json",
      },
    });

    const prompt = `Give me 10 song recomendations based on my top artists and tracks 
    here is the reference:
    ${artists.map((artist) => artist.name).join(", ")}
    ${tracks.map((track) => track.name).join(", ")}
    using this json schema:
    Song={'title':string, 'artist':string}
    Return: Array<Song>`;

    try {
      const result = await model.generateContent(prompt);
      const songs = JSON.parse(
        result.response.candidates[0].content.parts[0].text
      );

      //make function to replace " " with "+" for each element in a string
      const replaceSpace = (str) => {
        return str.split(" ").join("+");
      };

      const songsString = songs.map((e) =>
        replaceSpace(`${e.title} ${e.artist}`)
      );
      //   const songUrl = songsString.map()

      // try to get song url
      try {
        const response = await axios.get(
          `https://api.spotify.com/v1/search?q=${songsString[0]}&type=track&limit=1`,
          {
            headers: {
              Authorization: req.headers.authorization,
            },
          }
        );
      } catch (error) {
        console.error(error);
        res.status(500).send("Error fetch top tracks");
      }




      res.json(songsString);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = {
  GeminiControllers,
};
