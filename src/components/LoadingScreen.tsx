// components/LoadingScreen.tsx
import { Navigation } from "lucide-react";

export function LoadingScreen() {
  return (
    <div className="fixed inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center z-50">
      <div className="text-center">
        {/* Animated Logo */}
        <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-2xl mb-6 animate-pulse">
          <Navigation className="w-10 h-10 text-white animate-spin-slow" />
        </div>

        {/* Title */}
        <h1
          className="text-3xl font-bold text-white mb-2"
          style={{ fontFamily: '"Space Grotesk", sans-serif' }}
        >
          Level GUN
        </h1>

        {/* Subtitle */}
        <p className="text-slate-400 mb-6">Initializing system...</p>

        {/* Loading Bar */}
        <div className="w-48 h-2 bg-slate-800 rounded-full overflow-hidden mx-auto">
          <div className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 animate-loading-bar" />
        </div>
      </div>

      <style>{`
        @keyframes spin-slow {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        @keyframes loading-bar {
          0% {
            width: 0%;
          }
          50% {
            width: 70%;
          }
          100% {
            width: 100%;
          }
        }

        .animate-spin-slow {
          animation: spin-slow 3s linear infinite;
        }

        .animate-loading-bar {
          animation: loading-bar 2s ease-in-out;
        }
      `}</style>
    </div>
  );
}
