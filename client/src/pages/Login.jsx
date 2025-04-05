import { getBaseUrl } from "../helpers/getBaseUrl";
import { GoogleLogin } from "@react-oauth/google";
import axios from "axios";
import { useNavigate } from "react-router";
// import { useEffect } from "react";

export function Login() {
  const navigate = useNavigate();
  // useEffect(() => {
  //   window.google.accounts.id.initialize({
  //     // fill this with your own client ID
  //     client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
  //     // callback function to handle the response
  //     callback: async (response) => {
  //       console.log("Encoded JWT ID token: " + response.credential)
  //       const { data } = await axios.post('http://localhost:3000/auth/google', {
  //         googleToken: response.credential,
  //       });

  //       localStorage.setItem('access_token', data.access_token);

  //       // navigate to the home page or do magic stuff
  //     },
  //   });
  //   google.accounts.id.renderButton(
  //     // HTML element ID where the button will be rendered
  //     // this should be existed in the DOM
  //     document.getElementById('buttonDiv'),
  //     // customization attributes
  //     { theme: 'outline', size: 'large' },
  //   );
  //   // to display the One Tap dialog, or comment to remove the dialog
  //   google.accounts.id.prompt();
  // }, []);

  return (
    <div style={{display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100vh'}}>
      <h1 style={{color: 'white'}}>Welcome to SPOTT</h1>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          // height: "100vh",
          gap: 20,
        }}
      >
        <button
          type="button"
          className="btn btn-success"
          style={{
            fontSize: "15px",
            fontWeight: "bold",
            color: "black",
            width: 200,
            height: 44,
          }}
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
              Swal.fire({
                theme: 'dark',
                title: error.name,
                text: error.message,
                icon: "error",
                confirmButtonText: "Close",
              });
            }
          }}
        >
          Sign in with spotify
        </button>
        {/* <div id="buttonDiv"></div> */}
        <GoogleLogin
          onSuccess={async (response) => {
            // console.log("Encoded JWT ID token: " + response.credential);
            try {
              const { data } = await axios.post(
                "http://localhost:3000/auth/google",
                {
                  googleToken: response.credential,
                }
              );

              localStorage.setItem("google_token", data.access_token);
            } catch (error) {
              console.log(error);
              Swal.fire({
                title: error.name,
                text: error.message,
                icon: "error",
                confirmButtonText: "Close",
              });
            }

            // navigate to the home page or do magic stuff
            navigate("/non-spotify");
          }}
          onError={() => {
            console.log("Login error gooogleeee");
            Swal.fire({
              theme: 'dark',
              title: error.name,
              text: error.message,
              icon: "error",
              confirmButtonText: "Close",
            });
          }}
        />
      </div>
    </div>
  );
}
