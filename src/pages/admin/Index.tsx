
import React, { useEffect, useState } from "react";
import AdminHeader from "./components/AdminHeader";
import AdminStats from "./components/AdminStats";
import RecentEngineers from "./components/RecentEngineers";
import LatestJobs from "./components/LatestJobs";
import RecentProjects from "./components/RecentProjects";

const AdminIndex = () => {
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 900);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="p-4 md:p-8">
      <AdminHeader />
      <AdminStats loading={loading} />
      
      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <RecentEngineers loading={loading} />
        <LatestJobs loading={loading} />
        <RecentProjects loading={loading} />
      </div>
    </div>
  );
};

export default AdminIndex;
