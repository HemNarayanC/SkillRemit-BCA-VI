import { useLocation, Link, useNavigate } from "react-router-dom";
import { useEffect } from "react";

const PageNotFound = () => {
    const location = useLocation();
    const navigate = useNavigate(-1);

    useEffect(() => {
        console.error("404 Error: User attempted to access non-existent route:", location.pathname);
    }, [location.pathname]);

    return (
        <div className="min-h-screen bg-linear-to-br from-orange-100 via-amber-100 to-orange-200 flex items-center justify-center px-4 sm:px-6 lg:px-8">
            <div className="w-full">
                <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-16 lg:gap-24 overflow-visible min-h-screen w-full px-4 sm:px-6 lg:px-8">
                    {/* Plug Illustration */}
                    <div className="flex-shrink-0 min-w-1/2 sm:w-64 sm:w-full sm:h-64 md:w-72 md:h-72 lg:w-80 lg:h-[550px]">
                        <svg viewBox="0 40 250 170" className="w-full h-full overflow-visible">
                            <defs>
                                <linearGradient id="cableGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" stopColor="#ea580c" />
                                    <stop offset="100%" stopColor="#f97316" />
                                </linearGradient>
                                <linearGradient id="plugGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" stopColor="#f97316" />
                                    <stop offset="50%" stopColor="#ea580c" />
                                    <stop offset="100%" stopColor="#c2410c" />
                                </linearGradient>
                                <filter id="plugShadow" x="-30%" y="-30%" width="160%" height="160%">
                                    <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#ea580c" floodOpacity="0.25" />
                                </filter>
                            </defs>

                            {/* Background circles */}
                            <circle cx="60" cy="115" r="150" fill="#fed7aa" opacity="0.3" />
                            <circle cx="70" cy="115" r="70" fill="#fdba74" opacity="0.2" />

                            {/* Top cable */}
                            <path
                                d="M 195 -5 L 195 15 Q 195 30, 175 30 L 90 30 Q 70 30, 70 50 L 70 60"
                                fill="none"
                                stroke="url(#cableGrad)"
                                strokeWidth="4"
                                strokeLinecap="round"
                            />

                            {/* Female plug */}
                            <g className="animate-[sway_2.5s_ease-in-out_infinite]" style={{ transformOrigin: '70px 60px' }} filter="url(#plugShadow)">
                                <rect x="52" y="60" width="36" height="40" rx="4" fill="url(#plugGrad)" />
                                <rect x="56" y="64" width="28" height="32" rx="3" fill="#c2410c" />
                                <rect x="61" y="70" width="6" height="10" rx="1.5" fill="#431407" />
                                <rect x="73" y="70" width="6" height="10" rx="1.5" fill="#431407" />
                                <rect x="57" y="65" width="2" height="29" rx="1" fill="#fb923c" opacity="0.35" />
                            </g>

                            {/* Sparks */}
                            <g className="animate-[sparkle_0.6s_ease-in-out_infinite]">
                                <line x1="58" y1="106" x2="50" y2="114" stroke="#fbbf24" strokeWidth="2" strokeLinecap="round" />
                                <line x1="70" y1="108" x2="70" y2="118" stroke="#fbbf24" strokeWidth="2" strokeLinecap="round" />
                                <line x1="82" y1="106" x2="90" y2="114" stroke="#fbbf24" strokeWidth="2" strokeLinecap="round" />
                            </g>

                            {/* Male plug with cable */}
                            <g className="animate-[float_2s_ease-in-out_infinite]">
                                <g filter="url(#plugShadow)">
                                    <rect x="52" y="130" width="36" height="36" rx="4" fill="url(#plugGrad)" />
                                    <rect x="56" y="134" width="28" height="28" rx="3" fill="#c2410c" />
                                    <rect x="57" y="135" width="2" height="25" rx="1" fill="#fb923c" opacity="0.35" />
                                </g>

                                {/* Prongs */}
                                <rect x="61" y="118" width="6" height="14" rx="1.5" fill="#fde68a" />
                                <rect x="62" y="119" width="2" height="12" rx="0.5" fill="#fef3c7" />
                                <rect x="73" y="118" width="6" height="14" rx="1.5" fill="#fde68a" />
                                <rect x="74" y="119" width="2" height="12" rx="0.5" fill="#fef3c7" />

                                {/* Bottom cable - extended */}
                                <path
                                    d="M 70 166 L 70 185 Q 70 210, 45 240 Q 15 270, -10 320"
                                    fill="none"
                                    stroke="url(#cableGrad)"
                                    strokeWidth="4"
                                    strokeLinecap="round"
                                />
                            </g>
                        </svg>
                    </div>

                    {/* Text Content */}
                    <div className="text-center md:text-left flex-1 max-w-md">
                        <h1 className="text-7xl sm:text-8xl lg:text-9xl font-extrabold bg-linear-to-r from-teal-600 via-teal-500 to-teal-400 bg-clip-text text-transparent leading-none mb-4">
                            404
                        </h1>
                        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-semibold text-gray-800 mb-4">
                            Page Not Found
                        </h2>
                        <p className="text-gray-700 text-base sm:text-lg mb-6 leading-relaxed">
                            Oops! The page you’re looking for doesn’t exist, or it has been moved. Try going back or return home.
                        </p>

                        <div className="flex flex-col sm:flex-row items-center gap-4">
                            {/* Go Home Button */}
                            <Link
                                to="/"
                                className="inline-flex items-center justify-center gap-2 bg-linear-to-r from-teal-500 to-teal-600 text-white px-6 sm:px-8 py-3 rounded-lg font-semibold text-base hover:from-teal-600 hover:to-teal-700 transition-all duration-300 shadow-md hover:shadow-lg hover:scale-105"
                            >
                                Go Home
                            </Link>

                            {/* Go Back Button */}
                            <button
                                onClick={() => navigate(-1)}
                                className="inline-flex items-center justify-center gap-2 border border-teal-500 text-teal-600 px-6 sm:px-8 py-3 rounded-lg font-semibold text-base hover:bg-teal-50 transition-all duration-300 shadow-sm hover:shadow-md"
                            >
                                Go Back
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
        @keyframes sway {
          0%, 100% { transform: rotate(-2deg); }
          50% { transform: rotate(2deg); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-5px) rotate(1deg); }
        }
        @keyframes sparkle {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.2; }
        }
      `}</style>
        </div>
    );
};

export default PageNotFound;