

const request = require("supertest");
const {app} = require("../app");

jest.mock("../controllers/spotifyController", () => ({
  SpotifyControllers: {
    getUser: jest.fn(),
    getTopTracks: jest.fn(),
    getTopArtists: jest.fn(),
    login: jest.fn(),
    callback: jest.fn(),
    refresh_token: jest.fn(),
  },
}));

jest.mock("../controllers/geminiControllers", () => ({
  GeminiControllers: {
    getGemini: jest.fn(),
  },
}));

const { SpotifyControllers } = require("../controllers/spotifyController");
const { GeminiControllers } = require("../controllers/geminiControllers");

describe("App Routes", () => {
  describe("GET /getuser", () => {
    it("should return user data", async () => {
      SpotifyControllers.getUser.mockResolvedValue({ id: "user123", name: "Test User" });

      const response = await request(app).get("/getuser");

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ id: "user123", name: "Test User" });
      expect(SpotifyControllers.getUser).toHaveBeenCalled();
    });

    it("should return an error if something goes wrong", async () => {
      SpotifyControllers.getUser.mockRejectedValue({ status: 500, message: "Internal Server Error" });

      const response = await request(app).get("/getuser");

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ status: 500, message: "Internal Server Error" });
    });
  });

  describe("GET /gettoptracks", () => {
    it("should return top tracks", async () => {
      SpotifyControllers.getTopTracks.mockResolvedValue([
        { id: "track1", name: "Track 1" },
        { id: "track2", name: "Track 2" },
      ]);

      const response = await request(app).get("/gettoptracks");

      expect(response.status).toBe(200);
      expect(response.body).toEqual([
        { id: "track1", name: "Track 1" },
        { id: "track2", name: "Track 2" },
      ]);
      expect(SpotifyControllers.getTopTracks).toHaveBeenCalled();
    });

    it("should return an error if something goes wrong", async () => {
      SpotifyControllers.getTopTracks.mockRejectedValue({ status: 500, message: "Internal Server Error" });

      const response = await request(app).get("/gettoptracks");

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ status: 500, message: "Internal Server Error" });
    });
  });

  describe("GET /gettopartists", () => {
    it("should return top artists", async () => {
      SpotifyControllers.getTopArtists.mockResolvedValue([
        { id: "artist1", name: "Artist 1" },
        { id: "artist2", name: "Artist 2" },
      ]);

      const response = await request(app).get("/gettopartists");

      expect(response.status).toBe(200);
      expect(response.body).toEqual([
        { id: "artist1", name: "Artist 1" },
        { id: "artist2", name: "Artist 2" },
      ]);
      expect(SpotifyControllers.getTopArtists).toHaveBeenCalled();
    });

    it("should return an error if something goes wrong", async () => {
      SpotifyControllers.getTopArtists.mockRejectedValue({ status: 500, message: "Internal Server Error" });

      const response = await request(app).get("/gettopartists");

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ status: 500, message: "Internal Server Error" });
    });
  });

  describe("POST /generate", () => {
    it("should call GeminiControllers.getGemini", async () => {
      GeminiControllers.getGemini.mockImplementation((req, res) => {
        res.status(200).json({ message: "Gemini generated" });
      });

      const response = await request(app).post("/generate");

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ message: "Gemini generated" });
      expect(GeminiControllers.getGemini).toHaveBeenCalled();
    });
  });
});