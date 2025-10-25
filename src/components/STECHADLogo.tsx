import React from "react";
import image from "../assets/stechad.png";

type STECHADLogoProps = {
  size?: number; // Overrides width & height
  className?: string;
};

const STECHADLogo: React.FC<STECHADLogoProps> = ({
  size = 100,
  className = "",
}) => {
  const width = size;
  const height = size * 0.8; // Maintain aspect ratio

  return (
    <img
      src={image}
      alt="Stechad Logo"
      width={width}
      height={height}
      className={className}
    />
  );
};

export default STECHADLogo;
