import { Navigate, useNavigate } from "react-router";
import { HomeCard } from "../components/HomeCard";
import { useEffect, useState } from "react";
import { getBaseUrl } from "../helpers/getBaseUrl";
import axios from "axios";
import { ArtistCard } from "../components/ArtistCard";

export function Home() {
  const [songs, setSongs] = useState([]);
  const [artists, setArtists] = useState([]);
  const navigate = useNavigate();

  const fetchData = async () => {
    const url = new URL(getBaseUrl());
    url.pathname = "/gettoptracks";
    const url2 = new URL(getBaseUrl());
    url2.pathname = "/gettopartists";

    try {
      const { data } = await axios.get(url.toString(), {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("spotify_token")}`,
        },
      });
      setSongs(data);
      const response = await axios.get(url2.toString(), {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("spotify_token")}`,
        },
      });
      const dataArtis = response.data;
      //   console.log(dataArtis.data, "<<<<<<<<<")
      setArtists(dataArtis);
      //   console.log(data);
    } catch (error) {
      Swal.fire({
        title: error.response.status,
        text: error.response.data.message,
        icon: "error",
        confirmButtonText: "Close",
      });

      localStorage.clear();
      navigate("/login");
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 15,
        alignItems: "center",
      }}
    >
      {/* <h1 style={{ textAlign: "center" }}>Welcome to Spotify</h1> */}
      <button
        type="button"
        class="btn btn-succes btn-lg"
        style={{ width: "20%", backgroundColor: "green", fontWeight: "bold" }}
        onClick={() => {
          navigate("/home/playlist");
        }}
      >
        Generate your playlist
      </button>

      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: 15,
          alignItems: "flex-start",
          flexWrap: "wrap",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            // height: "100vh",
          }}
        >
          <h1>Your Top Tracks</h1>
          {songs.map((song) => {
            return (
              <HomeCard
                song={{
                  title: song.title,
                  image: song.image,
                  album: song.album,
                  artist: song.artist,
                  releaseDate: song.release_date.slice(0, 4),
                }}
              />
            );
          })}
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            // height: "100vh",
          }}
        >
          <h1>Your Top Artists</h1>
          {artists.map((artist) => {
            return (
              <ArtistCard
                artist={{
                  name: artist.name,
                  image: artist.image,
                  genres: artist.genres.join(", "),
                }}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
