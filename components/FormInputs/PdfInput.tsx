
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UploadButton } from "@/lib/uploadthing";
import React, { useState, useEffect } from "react";

type PdfInputProps = {
  title: string;
  pdfUrl: string | null; // always string or null
  setPdfUrl: (url: string) => void;
  endpoint: any;
};

export default function PdfInput({
  title,
  pdfUrl,
  setPdfUrl,
  endpoint,
}: PdfInputProps) {
  const [fileName, setFileName] = useState("");

  useEffect(() => {
    if (pdfUrl && typeof pdfUrl === "string") {
      setFileName(pdfUrl.split("/").pop() || "");
    } else {
      setFileName("");
    }
  }, [pdfUrl]);

  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-2">
          {fileName && (
            <div className="p-4 border rounded-md bg-gray-50 dark:bg-slate-800">

              {/* Display PDF in iframe */}
              <iframe
                src={pdfUrl!}
                className="w-full h-60 mt-2 border rounded-md"
                title="PDF Preview"
              />
            </div>
          )}

          <UploadButton
            className="col-span-full"
            endpoint={endpoint}
            onClientUploadComplete={(res) => {
              if (res.length > 0) {
                setPdfUrl(res[0].url); // always a string
              }
            }}
            onUploadError={(error: Error) => {
              alert(`Upload Error: ${error.message}`);
            }}
            // optional: restrict file types with allowedFileTypes
          />
        </div>
      </CardContent>
    </Card>
  );
}
