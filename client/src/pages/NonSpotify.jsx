import { getBaseUrl } from "../helpers/getBaseUrl";
import axios from "axios";

export function NonSpotify() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
      }}
    >
      <h1>You cannot access spotify features if you sign in with google,</h1>
      <h1>Please sign in again with your spotify account</h1>
      <button
        type="button"
        className="btn btn-success"
        style={{ fontSize: "24px", fontWeight: "bold", color: "black" }}
        onClick={async () => {
          const url = new URL(getBaseUrl());
          url.pathname = "/login";

          try {
            const data = await axios.get(url.toString());
            // console.log("🚀 ~ Login ~ data:", data.data);
            window.location.href = data.data;
            // navigate(`${data.data}`);
          } catch (error) {
            console.log("🚀 ~ Login ~ error:", error);
          }
        }}
      >
        LOG IN
      </button>
      {/* <div id="buttonDiv"></div> */}
    </div>
  );
}
