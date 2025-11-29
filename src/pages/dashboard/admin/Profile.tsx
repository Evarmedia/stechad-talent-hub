
import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const initialData = {
  name: "Alex Admin",
  email: "admin@email.com",
  role: "Platform Administrator",
};

const AdminProfile = () => {
  const [data, setData] = useState(initialData);
  const [editing, setEditing] = useState(false);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setData((d) => ({ ...d, [e.target.name]: e.target.value }));
  }

  return (
    <div className="p-8 max-w-xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>My Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="flex flex-col gap-4">
            <label className="text-primary font-semibold">Full Name</label>
            <Input name="name" value={data.name} disabled={!editing} onChange={handleChange} />
            <label className="text-primary font-semibold">Email</label>
            <Input name="email" value={data.email} disabled />
            <label className="text-primary font-semibold">Role</label>
            <Input name="role" value={data.role} disabled />
          </form>
        </CardContent>
        <CardFooter>
          <Button onClick={() => setEditing((e) => !e)} variant={editing ? "default" : "outline"} disabled>
            Edit Profile
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default AdminProfile;
