
import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "react-router-dom";

interface QuickActionsProps {
  loading: boolean;
}

const quickLinks = [
  { to: "/dashboard/engineer/jobs", label: "Browse Jobs", icon: "💼" },
  { to: "/dashboard/engineer/applications", label: "My Applications", icon: "📝" },
  { to: "/dashboard/engineer/projects", label: "My Projects", icon: "🏗️" },
  { to: "/dashboard/engineer/profile", label: "Profile", icon: "👤" },
];

const QuickActions: React.FC<QuickActionsProps> = ({ loading }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Array(4).fill(0).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {quickLinks.map(link => (
              <Button asChild key={link.label} variant="outline" className="h-auto py-3">
                <Link to={link.to} className="flex flex-col items-center gap-2">
                  <span className="text-lg">{link.icon}</span>
                  <span className="text-xs text-center">{link.label}</span>
                </Link>
              </Button>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default QuickActions;
