
import { getBaseUrl } from "../helpers/getBaseUrl";
import axios from "axios";

export function Login() {
    
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
      }}
    >
      <button
        type="button"
        className="btn btn-success"
        style={{ fontSize: "24px", fontWeight: "bold", color: "black" }}
        onClick={ async () => {
          const url = new URL(getBaseUrl());
          url.pathname = "/login";

          try {
            const data = await axios.get(url.toString());
            // console.log("🚀 ~ Login ~ data:", data.data);
            window.location.href = data.data;
            // navigate(`${data.data}`);
          } catch (error) {
            console.log("🚀 ~ Login ~ error:", error)
            
          }
        }}
      >
        LOG IN
      </button>
    </div>
  );
}
