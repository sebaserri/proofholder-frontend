// src/components/Logo.tsx
import { Link } from "@tanstack/react-router";

interface LogoProps {
  to?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export default function Logo({ to = "/", size = "md", className = "" }: LogoProps) {
  const sizes = {
    sm: {
      container: "w-6 h-6",
      icon: "w-4 h-4",
      text: "text-lg",
    },
    md: {
      container: "w-8 h-8",
      icon: "w-5 h-5",
      text: "text-2xl",
    },
    lg: {
      container: "w-10 h-10",
      icon: "w-6 h-6",
      text: "text-3xl",
    },
  };

  const sizeClasses = sizes[size];

  const LogoContent = () => (
    <div className={`flex items-center space-x-2 group cursor-pointer ${className}`}>
      {/* Icon with AI Spark */}
      <div
        className={`${sizeClasses.container} gradient-bg rounded-lg flex items-center justify-center shadow-lg relative overflow-hidden transition-all duration-300 group-hover:scale-110 group-hover:rotate-3`}
      >
        <div className="absolute inset-0 bg-white/10 animate-pulse" />
        <svg
          className={`${sizeClasses.icon} text-white relative z-10`}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          aria-hidden="true"
        >
          {/* Document icon */}
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
          {/* AI Spark */}
          <path
            d="M16 2l1 3 3 1-3 1-1 3-1-3-3-1 3-1z"
            fill="currentColor"
            stroke="none"
            opacity="0.9"
          />
        </svg>
      </div>

      {/* Text with gradient */}
      <div
        className={`${sizeClasses.text} font-black gradient-text transition-all duration-300 group-hover:tracking-wide`}
      >
        ProofHolder
      </div>

      <style>{`
        .gradient-bg {
          background: linear-gradient(135deg, #3B82F6 0%, #2563EB 50%, #6366F1 100%);
          background-size: 200% 200%;
          animation: gradient-shift 8s ease infinite;
        }

        .gradient-text {
          background: linear-gradient(135deg, #3B82F6 0%, #1E40AF 50%, #6366F1 100%);
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        @keyframes gradient-shift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
      `}</style>
    </div>
  );

  if (to) {
    return (
      <Link to={to}>
        <LogoContent />
      </Link>
    );
  }

  return <LogoContent />;
}

// Export individual parts if needed elsewhere
export function LogoIcon({ className = "", size = "md" }: { className?: string; size?: "sm" | "md" | "lg" }) {
  const sizes = {
    sm: "w-6 h-6",
    md: "w-8 h-8",
    lg: "w-10 h-10",
  };

  const iconSizes = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6",
  };

  return (
    <div
      className={`${sizes[size]} gradient-bg rounded-lg flex items-center justify-center shadow-lg relative overflow-hidden ${className}`}
    >
      <div className="absolute inset-0 bg-white/10 animate-pulse" />
      <svg
        className={`${iconSizes[size]} text-white relative z-10`}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
        />
        <path
          d="M16 2l1 3 3 1-3 1-1 3-1-3-3-1 3-1z"
          fill="currentColor"
          stroke="none"
          opacity="0.9"
        />
      </svg>
      <style>{`
        .gradient-bg {
          background: linear-gradient(135deg, #3B82F6 0%, #2563EB 50%, #6366F1 100%);
          background-size: 200% 200%;
          animation: gradient-shift 8s ease infinite;
        }

        @keyframes gradient-shift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
      `}</style>
    </div>
  );
}

export function LogoText({ className = "", size = "md" }: { className?: string; size?: "sm" | "md" | "lg" }) {
  const sizes = {
    sm: "text-lg",
    md: "text-2xl",
    lg: "text-3xl",
  };

  return (
    <>
      <div className={`${sizes[size]} font-black gradient-text ${className}`}>
        ProofHolder
      </div>
      <style>{`
        .gradient-text {
          background: linear-gradient(135deg, #3B82F6 0%, #1E40AF 50%, #6366F1 100%);
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
        }
      `}</style>
    </>
  );
}
