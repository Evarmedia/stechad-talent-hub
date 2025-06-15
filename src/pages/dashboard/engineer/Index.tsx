
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
const EngineerIndex = () => {
  const navigate = useNavigate();
  useEffect(() => {
    navigate("/dashboard/engineer/jobs", { replace: true });
  }, [navigate]);
  return null;
};
export default EngineerIndex;
