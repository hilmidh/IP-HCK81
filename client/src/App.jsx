import { BrowserRouter, Routes, Route } from "react-router";
import { GoogleOAuthProvider } from "@react-oauth/google";

import { Home } from "./pages/Home";
import { Login } from "./pages/Login";
import { Callback } from "./pages/Callback";
import { NonSpotify } from "./pages/NonSpotify";

import { LoginLayout } from "./layouts/LoginLayout";
import { AuthLayout } from "./layouts/AuthLayout";
import { Playlist } from "./pages/Playlist";
//import env from "react-dotenv";
// import dotenv from "dotenv";
// dotenv.config();

function App() {
  return (
    <>
      <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
        <BrowserRouter>
          <Routes>
            <Route path="/non-spotify" element={<NonSpotify />} />
            <Route path="/callback" element={<Callback />} />

            <Route path="/login" element={<LoginLayout />}>
              <Route index element={<Login />} />
            </Route>

            <Route path="/home" element={<AuthLayout />}>
              <Route index element={<Home />} />
              <Route path="/home/playlist" element={<Playlist/>}/>
            </Route>
          </Routes>
        </BrowserRouter>
      </GoogleOAuthProvider>
    </>
  );
}

export default App;
