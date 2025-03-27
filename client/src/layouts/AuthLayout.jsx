import { Navigate, Outlet } from "react-router";
import { Navbar } from "../components/navbar";



export function AuthLayout() {
    const token = localStorage.getItem("spotify_token");
    if(!token) {
    return <Navigate to="/login" />
    }
    return (
        <div>
            <Navbar />
            <Outlet/>
        </div>
    );
}