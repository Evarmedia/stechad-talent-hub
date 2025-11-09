
import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

interface AccountOverviewProps {
  loading: boolean;
  user: any;
}

const AccountOverview: React.FC<AccountOverviewProps> = ({ loading, user }) => {
  const skills = user?.engineer?.specialization || ["React", "Node.js", "SQL", "AWS", "TypeScript", "Python"];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Account Overview</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <>
            <Skeleton className="h-6 w-60 mb-3" />
            <Skeleton className="h-5 w-40 mb-2" />
            <Skeleton className="h-5 w-32" />
          </>
        ) : (
          <div className="space-y-3">
            <div>
              <span className="font-semibold text-sm">Active Skills:</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {skills.map(s => (
                  <Badge key={s} variant="outline" className="text-xs">{s}</Badge>
                ))}
              </div>
            </div>
            <div className="flex justify-between text-sm">
              <span className="font-semibold">Availability:</span>
              <Badge className="bg-green-100 text-green-800">
                {user.engineer?.availability || "Available"}
              </Badge>
            </div>
            <div className="flex justify-between text-sm">
              <span className="font-semibold">Profile Completion:</span>
              <span>85%</span>
            </div>
            <Progress value={85} className="h-2" />
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AccountOverview;
