import { useEffect, useState } from "react";
import { getBaseUrl } from "../helpers/getBaseUrl";
import axios from "axios";
import { useNavigate } from "react-router";

export function Playlist() {
  const [playlist, setPlaylist] = useState({});
  const [playlistName, setPlaylistName] = useState(playlist.name);
  const [playlistId, setPlaylistId] = useState("");
  const navigate = useNavigate()

  const generatePlaylist = async () => {
    const url = new URL(getBaseUrl());
    url.pathname = "/generate";

    try {
      const { data } = await axios.post(url.toString(), {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("spotify_token")}`,
        },
      });
      setPlaylistName(data.name);
      setPlaylist(data);
      setPlaylistId(data.id);
    } catch (error) {
      console.log(error, "<<<<<<<<<<<<<<<<<<<<<");
      if (error.name == "AxiosError") {
        Swal.fire({
          theme: "dark",
          title: error.name,
          text: error.message,
          icon: "error",
          confirmButtonText: "Close",
        });
        localStorage.clear();
        navigate("/login");
      } else {
        Swal.fire({
          theme: "dark",
          title: error.response.status,
          text: error.response.data.message,
          icon: "error",
          confirmButtonText: "Close",
        });

        localStorage.clear();
        navigate("/login");
      }
    }
  };

  // const changePlaylistName = async () => {
  //   const url = new URL(getBaseUrl());
  //   url.pathname = "/updatePlaylistName";

  //   try {
  //     const { data } = await axios.put(url.toString(),{
  //       playlistId: playlistId,
  //       name: playlistName,
  //     }, {
  //       headers: {
  //         Authorization: `Bearer ${localStorage.getItem("spotify_token")}`,
  //       },
  //     });
  //     // setPlaylistName(data.name);
  //     console.log(data)
  //   } catch (error) {
  //     Swal.fire({
  //       theme: 'dark',
  //       title: error.response.status,
  //       text: error.response.data.message,
  //       icon: "error",
  //       confirmButtonText: "Close",
  //     });

  //     localStorage.clear();
  //     navigate("/login");
  //   }
  // }

  useEffect(() => {
    // generatePlaylist();
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
      <h1>{playlist.name}</h1>
      {/* <form onSubmit={() => {changePlaylistName}}>
        <input 
        placeholder="Enter playlist name"
        value={playlistName}
        onChange={(e) => setPlaylistName(e.target.value)}
        />
        <button type="submit">change playlist name</button>
      </form> */}
      <p>You can check your spotify account to listen to this playlist</p>
      <button
        type="button"
        class="btn btn-succes btn-lg"
        style={{ width: "30%", backgroundColor: "green", fontWeight: "bold" }}
        onClick={generatePlaylist}
      >
        Click here to generate your playlist
      </button>
      <table
        className="table table-dark table-striped"
        style={{ width: "50%" }}
      >
        <thead>
          <tr>
            <th scope="col">#</th>
            <th scope="col">Title</th>
            <th scope="col">Artist</th>
            <th scope="col">Album</th>
          </tr>
        </thead>
        <tbody>
          {playlist.tracks?.map((song, i) => (
            <tr key={i}>
              <td>{i + 1}</td>
              <td>{song.title}</td>
              <td>{song.artist}</td>
              <td>{song.album}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
