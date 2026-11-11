
import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "react-router-dom";
import type { DashboardTalent } from "@/types/dashboard";

interface RecentTalentsProps {
  loading: boolean;
  talents: DashboardTalent[];
}

const RecentTalents: React.FC<RecentTalentsProps> = ({ loading, talents }) => {
  const recentTalents = talents.slice(0, 3);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center justify-between">
          Recent Talent Signups
          <Button asChild variant="outline" size="sm" className="text-xs">
            <Link to="/admin/talents">View All</Link>
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-3">
            {Array(5).fill(0).map((_, i) => (
              <div key={i} className="flex items-center justify-between">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-5 w-16" />
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {recentTalents.map((e, idx) => (
              <div key={idx} className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-sm">{`${e.user.first_name} ${e.user.last_name}`}</div>
                  <div className="text-xs text-muted-foreground">{e.user.country || "Remote"}</div>
                </div>
                {e.is_vetted ? (
                  <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700">
                    Vetted
                  </Badge>
                ) : ( 
                <>
                  <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700">
                    Not Vetted
                </Badge></>)}
              </div>
            ))}
            {recentTalents.length === 0 && (
              <div className="text-center text-muted-foreground py-4">
                No talents found
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RecentTalents;
