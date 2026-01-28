
import React from "react";
import { Link, useLocation, Outlet } from "react-router-dom";
import STECHADLogo from "@/components/STECHADLogo";
import { useAuthContext } from "@/hooks/useAuthContext";

const PublicLayout: React.FC = () => {
  const location = useLocation();
  const { token, logout } = useAuthContext();

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <header className="w-full shadow-sm bg-white">
        <div className="container flex items-center justify-between py-3 px-2 md:px-8">
          <Link to="/" className="flex items-center gap-2">
            <STECHADLogo size={36} />
            <span className="font-inter font-bold text-2xl text-primary ml-2 tracking-wide">STECHAD</span>
          </Link>
          
          {token ? (<nav className="hidden md:flex gap-6">
            <Link to="/engineer-signup" className="font-medium hover:underline text-primary">Engineer Signup</Link>
            <button onClick={logout} className="font-medium hover:underline text-text-main">Logout</button>
          </nav>) : (<nav className="hidden md:flex gap-6">
            <Link to="/engineer-signup" className="font-medium hover:underline text-primary">Engineer Signup</Link>
            <Link to="/login" className="font-medium hover:underline text-text-main">Login</Link>
          </nav>)}

        </div>
      </header>
      <main className="flex-grow">
        <Outlet />
      </main>
      <footer className="w-full bg-muted py-7 text-center text-sm text-text-muted mt-12">
        <span>© {new Date().getFullYear()} STECHAD | <a href="mailto:contact@stechad.com" className="text-primary underline hover:text-primary-faint">Contact</a></span>
      </footer>
    </div>
  );
};

export default PublicLayout;
