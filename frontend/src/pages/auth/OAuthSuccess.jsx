import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const OAuthSuccess = () => {
    const navigate = useNavigate();
    const { user, loading } = useAuth(); // calls /auth/me
    // console.log("OAuthSuccess: User is authenticated:", user);

    useEffect(() => {
        const init = () => {
            try {
                if (loading) {
                    // Show nothing or a spinner while checking auth
                    return (
                        <div className="flex items-center justify-center min-h-screen">
                            <p>Loading...</p>
                        </div>
                    );
                }
                if (user && !loading) {
                    navigate("/"); // or dashboard
                }
            } catch (err) {
                navigate("/auth/login");
            }
        };

        init();
    }, [user]);
};

export default OAuthSuccess;
