
import React from "react";
import { Link } from "react-router-dom";
import STECHADLogo from "@/components/STECHADLogo";

const HowItWorks = () => (
  <section className="py-16 bg-white">
    <div className="max-w-3xl mx-auto flex flex-col items-center gap-6 px-4">
      <h2 className="text-2xl font-bold mb-1 text-primary">How it Works</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
        <div className="flex flex-col items-center">
          <span className="rounded-full bg-primary-light p-4 mb-4">
            <span className="text-3xl text-primary">👨‍💻</span>
          </span>
          <h4 className="font-semibold text-lg text-text-main mb-1">Engineers Join</h4>
          <p className="text-text-muted text-center text-sm">
            Sign up and tell us about your skills and experience.
          </p>
        </div>
        <div className="flex flex-col items-center">
          <span className="rounded-full bg-primary-light p-4 mb-4">
            <span className="text-3xl text-primary">✅</span>
          </span>
          <h4 className="font-semibold text-lg text-text-main mb-1">Get Verified</h4>
          <p className="text-text-muted text-center text-sm">
            Complete your profile and upload your CV for review.
          </p>
        </div>
        <div className="flex flex-col items-center">
          <span className="rounded-full bg-primary-light p-4 mb-4">
            <span className="text-3xl text-primary">🚀</span>
          </span>
          <h4 className="font-semibold text-lg text-text-main mb-1">Land Jobs</h4>
          <p className="text-text-muted text-center text-sm">
            Apply to projects that match your skills, and build your career across Europe.
          </p>
        </div>
      </div>
    </div>
  </section>
);

const Landing = () => {
  return (
    <div>
      {/* Hero section */}
      <section className="relative w-full py-16 md:py-28 bg-white">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between px-4 md:px-0">
          <div className="mb-10 md:mb-0 md:mr-10 flex-1">
            <STECHADLogo size={62} />
            <h1 className="text-4xl md:text-5xl font-extrabold text-primary mt-4 mb-4 animate-fade-in">
              Your Next IT Career Starts Here.
            </h1>
            <p className="text-xl md:text-2xl text-text-muted mb-8">
              STECHAD connects skilled engineers with impactful projects across Europe.<br /><span className="text-primary font-medium">Grow, thrive, and work smarter together.</span>
            </p>
            <div className="flex gap-4">
              <Link
                to="/engineer-signup"
                className="inline-block bg-primary text-white hover:bg-primary-faint px-6 py-3 rounded-lg text-lg font-bold transition"
              >
                Engineer? Join Us
              </Link>
              <Link
                to="/login"
                className="inline-block border border-primary text-primary bg-white hover:bg-primary hover:text-white px-6 py-3 rounded-lg text-lg font-bold transition"
              >
                Login
              </Link>
            </div>
          </div>
          {/* Image or visual */}
          <div className="flex-1 flex items-center justify-center">
            <img
              src="https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?auto=format&fit=crop&w=540&q=80"
              alt="STECHAD engineers"
              className="rounded-3xl shadow-lg w-full max-w-md h-80 object-cover"
              style={{ minWidth: 240 }}
            />
          </div>
        </div>
      </section>
      {/* Role-based logins */}
      <section className="max-w-3xl mx-auto mt-8 mb-4 px-4 flex flex-col md:flex-row md:justify-center gap-4 md:gap-10">
        <Link
          to="/login?role=project_manager"
          className="p-4 rounded-lg border border-border shadow-smooth flex-1 hover:shadow-md bg-white transition flex flex-col items-center"
        >
          <span className="text-3xl mb-2">👨‍💼</span>
          <span className="font-semibold text-primary">Project Manager Login</span>
        </Link>
        <Link
          to="/login?role=engineer"
          className="p-4 rounded-lg border border-border shadow-smooth flex-1 hover:shadow-md bg-white transition flex flex-col items-center"
        >
          <span className="text-3xl mb-2">👨‍💻</span>
          <span className="font-semibold text-primary">Engineer Login</span>
        </Link>
      </section>
      <HowItWorks />
    </div>
  );
};

export default Landing;
