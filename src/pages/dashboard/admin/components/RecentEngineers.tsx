
import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "react-router-dom";

interface RecentEngineersProps {
  loading: boolean;
  engineers: any[];
}

const RecentEngineers: React.FC<RecentEngineersProps> = ({ loading, engineers }) => {
  const recentEngineers = engineers.slice(0, 5);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center justify-between">
          Recent Engineer Signups
          <Button asChild variant="outline" size="sm" className="text-xs">
            <Link to="/admin/engineers">View All</Link>
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
            {recentEngineers.map((e, idx) => (
              <div key={idx} className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-sm">{e.name}</div>
                  <div className="text-xs text-muted-foreground">{e.country}</div>
                </div>
                {e.isVetted && (
                  <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700">
                    Vetted
                  </Badge>
                )}
              </div>
            ))}
            {recentEngineers.length === 0 && (
              <div className="text-center text-muted-foreground py-4">
                No engineers found
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RecentEngineers;
