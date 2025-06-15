
import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const initialData = {
  name: "Pat Smith",
  email: "pm@email.com",
  company: "Acme Corp",
  country: "Germany",
};

const PMProfile = () => {
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
            <label className="text-primary font-semibold">Company</label>
            <Input name="company" value={data.company} disabled={!editing} onChange={handleChange} />
            <label className="text-primary font-semibold">Country</label>
            <Input name="country" value={data.country} disabled={!editing} onChange={handleChange} />
          </form>
        </CardContent>
        <CardFooter>
          <Button onClick={() => setEditing((e) => !e)} variant={editing ? "default" : "outline"}>
            {editing ? "Save" : "Edit Profile"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default PMProfile;
