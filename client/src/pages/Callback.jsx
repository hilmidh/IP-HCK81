import React, { useEffect } from "react";
import { useNavigate } from "react-router";
import axios from "axios";
import { getBaseUrl } from "../helpers/getBaseUrl";

const Callback = () => {
  const params = new URLSearchParams(window.location.search);
  const code = params.get("code");
  const state = params.get("state");
  const navigate = useNavigate();

  useEffect(() => {
    // console.log("🚀 ~ Callback ~ code:", code);
    // console.log("🚀 ~ Callback ~ state:", state);
    const fetchToken = async () => {
    
      try {
        const response = await axios.get(`${getBaseUrl()}/callback?code=${code}&state=${state}`);
        // console.log("🚀 ~ Callback ~ response:", response);
        console.log("🚀 ~ Callback ~ response.data:", response.data);
        localStorage.setItem("spotify_token", response.data.access_token)

        navigate("/home");
      } catch (error) {
        console.log("🚀 ~ Callback ~ error:", error);
        Swal.fire({
          theme: 'dark',
          title: error.name,
          text: error.message,
          icon: "error",
          confirmButtonText: "Close",
        });
        navigate('/login')
      }
    };

    fetchToken();
  }, []);

  return <div>Loading...</div>;
};

export { Callback };
