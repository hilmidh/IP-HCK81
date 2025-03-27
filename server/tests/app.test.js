const request = require("supertest");
const app = require("../app"); // Adjust the path to your app.js file

jest.mock("../controllers/spotifyController", () => ({
  SpotifyControllers: {
    updatePlaylistName: jest.fn(),
  },
}));

const { SpotifyControllers } = require("../controllers/spotifyController");

describe("PUT /updatePlaylistName", () => {
  it("should update the playlist name and return the updated data", async () => {
    // Mock the SpotifyControllers.updatePlaylistName function
    SpotifyControllers.updatePlaylistName.mockResolvedValue({
      id: "12345",
      name: "Updated Playlist Name",
    });

    const response = await request(app)
      .put("/updatePlaylistName")
      .send({
        playlistId: "12345",
        name: "Updated Playlist Name",
      })
      .set("Authorization", "Bearer mockSpotifyToken");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      id: "12345",
      name: "Updated Playlist Name",
    });
    expect(SpotifyControllers.updatePlaylistName).toHaveBeenCalledWith(
      "12345",
      "Updated Playlist Name"
    );
  });

  it("should return a 400 error if playlistId or name is missing", async () => {
    const response = await request(app)
      .put("/updatePlaylistName")
      .send({
        name: "Updated Playlist Name",
      })
      .set("Authorization", "Bearer mockSpotifyToken");

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      error: "playlistId and name are required",
    });
  });

  it("should return a 500 error if an internal error occurs", async () => {
    // Mock the SpotifyControllers.updatePlaylistName function to throw an error
    SpotifyControllers.updatePlaylistName.mockRejectedValue(
      new Error("Internal Server Error")
    );

    const response = await request(app)
      .put("/updatePlaylistName")
      .send({
        playlistId: "12345",
        name: "Updated Playlist Name",
      })
      .set("Authorization", "Bearer mockSpotifyToken");

    expect(response.status).toBe(500);
    expect(response.body).toEqual({
      error: "Internal Server Error",
    });
  });
});