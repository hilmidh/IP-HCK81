import { BrowserRouter, Routes, Route } from "react-router";
import { Home } from "./pages/Home";
import { Login } from "./pages/Login";
import { Callback } from "./pages/Callback";
import { GoogleOAuthProvider } from "@react-oauth/google";
//import env from "react-dotenv";
// import dotenv from "dotenv";
// dotenv.config();

function App() {
  return (
    <>
      <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/callback" element={<Callback />} />
          </Routes>
        </BrowserRouter>
      </GoogleOAuthProvider>
    </>
  );
}

export default App;
