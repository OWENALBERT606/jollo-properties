import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UploadButton } from "@/lib/uploadthing";
import React from "react";

type VideoInputProps = {
  title: string;
  videoUrl: string;
  setVideoUrl: (url: string) => void;
  endpoint: any;
};

export default function VideoInput({
  title,
  videoUrl,
  setVideoUrl,
  endpoint,
}: VideoInputProps) {
  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-2">
          {videoUrl ? (
            <video
              src={videoUrl}
              controls
              className="h-40 w-full rounded-md object-cover"
            />
          ) : (
            <div className="h-40 w-full flex items-center justify-center border rounded-md text-sm text-gray-500">
              No video uploaded
            </div>
          )}

          <UploadButton
            className="col-span-full"
            endpoint={endpoint}
            onClientUploadComplete={(res) => {
              console.log("Files: ", res);
              setVideoUrl(res[0].url);
            }}
            onUploadError={(error: Error) => {
              alert(`ERROR! ${error.message}`);
            }}
          />
        </div>
      </CardContent>
    </Card>
  );
}
