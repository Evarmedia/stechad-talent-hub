
import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const AdminSettings = () => (
  <div className="p-8 max-w-xl">
    <Card>
      <CardHeader>
        <CardTitle>System Settings</CardTitle>
      </CardHeader>
      <CardContent>
        <form className="flex flex-col gap-4">
          <label className="font-semibold text-primary">Contact Email</label>
          <Input value="contact@stechad.com" disabled />
          <label className="font-semibold text-primary">Auto-approve Engineers</label>
          <input type="checkbox" checked className="ml-2" readOnly />
          <label className="font-semibold text-primary">Support Link</label>
          <Input value="https://stechad.com/support" disabled />
          <Button className="mt-2" variant="outline" disabled>Save Changes (stub)</Button>
        </form>
      </CardContent>
    </Card>
  </div>
);

export default AdminSettings;
