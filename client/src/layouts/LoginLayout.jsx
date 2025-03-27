import { Navigate, Outlet } from "react-router";


export function LoginLayout() {
    const googleToken = localStorage.getItem("google_token");
    const spotifyToken = localStorage.getItem("spotify_token");

    if (!googleToken && !spotifyToken) {
        return <Outlet/>;
    }else if(googleToken && !spotifyToken){
        return <Navigate to="/non-spotify" />;
    }else if(spotifyToken){
        return <Navigate to="/home" />;
    }
}