import Link from "next/link";
import { Building2, Home, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-brand-blue-pale flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <div className="flex justify-center mb-6">
          <div className="bg-brand-blue rounded-2xl p-4">
            <Building2 className="h-12 w-12 text-white" />
          </div>
        </div>
        <div className="text-8xl font-bold text-brand-blue mb-4">404</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Page Not Found</h1>
        <p className="text-gray-500 mb-8">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <div className="flex gap-3 justify-center">
          <Button asChild variant="outline">
            <Link href="javascript:history.back()">
              <ArrowLeft className="h-4 w-4 mr-2" /> Go Back
            </Link>
          </Button>
          <Button asChild className="bg-brand-blue hover:bg-brand-blue-light text-white">
            <Link href="/">
              <Home className="h-4 w-4 mr-2" /> Go Home
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
