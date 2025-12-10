// GoogleAuthHandler.jsx
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function GoogleAuthHandler() {
    const navigate = useNavigate();

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const token = params.get("token");

        if (token) {
            localStorage.setItem("stechad_token", token);
            window.history.replaceState({}, "", "/dashboard");
            navigate("/dashboard");
        }
    }, []);

    return <p>Loading Google Login...</p>;
}
