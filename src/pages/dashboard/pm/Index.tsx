
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
const PMIndex = () => {
  const navigate = useNavigate();
  useEffect(() => {
    navigate("/dashboard/pm/post-job", { replace: true });
  }, [navigate]);
  return null;
};
export default PMIndex;
