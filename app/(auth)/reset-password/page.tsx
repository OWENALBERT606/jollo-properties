import { Metadata } from "next";
import Link from "next/link";
import { Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Reset Password | Demo Properties",
};

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen bg-brand-blue-pale flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="shadow-xl border-0">
          <CardHeader className="pb-2 text-center space-y-3">
            <div className="flex justify-center">
              <div className="bg-brand-blue rounded-xl p-3">
                <Building2 className="h-8 w-8 text-white" />
              </div>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-brand-blue">New Password</h1>
              <p className="text-sm text-muted-foreground mt-1">Enter your new password below</p>
            </div>
          </CardHeader>
          <CardContent className="pt-4 space-y-4">
            <div className="space-y-1">
              <Label htmlFor="password">New Password</Label>
              <Input id="password" type="password" placeholder="••••••••" />
            </div>
            <div className="space-y-1">
              <Label htmlFor="confirm">Confirm Password</Label>
              <Input id="confirm" type="password" placeholder="••••••••" />
            </div>
            <Button className="w-full bg-brand-blue hover:bg-brand-blue-light text-white">
              Update Password
            </Button>
            <p className="text-center text-sm text-muted-foreground">
              <Link href="/login" className="text-brand-blue-light hover:underline">
                Back to Sign In
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
