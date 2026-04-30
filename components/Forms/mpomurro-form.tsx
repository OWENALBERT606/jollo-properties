"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import FormHeader from "./FormHeader";
import TextInput from "../FormInputs/TextInput";
import TextArea from "../FormInputs/TextAreaInput";
import ImageInput from "../FormInputs/ImageInput";
import FormFooter from "./FormFooter";
import { Mpomurro } from "@prisma/client";
import { createMpomurro, updateMpomurro } from "@/actions/mpomurro";
import VideoInput from "../FormInputs/VideoInput";

// ✅ Props
type MpomurroFormProps = {
  editingId?: string;
  initialData?: Mpomurro | null;
};

// ✅ Form component
export default function NewMpomurroForm({ editingId, initialData }: MpomurroFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<Mpomurro>({
    defaultValues: {
      title: initialData?.title ?? "",
      thumbnail: initialData?.thumbnail ?? "",
      videoUrl: initialData?.videoUrl ?? "",
      description: initialData?.description ?? "",
    },
  });

  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const initialImage = initialData?.thumbnail || "/placeholder.svg";
  const initialVideo = initialData?.videoUrl || "";
  const [imageUrl, setImageUrl] = useState(initialImage);
  const [videoUrl, setVideoUrl] = useState(initialVideo);

  // ✅ Handle form submit
  async function saveMpomurro(data: any) {
    try {
      setLoading(true);
      data.thumbnail = imageUrl;
      data.videoUrl = videoUrl;

      if (editingId) {
        await updateMpomurro(editingId, data);
        toast.success("Mpomurro updated successfully!");
        router.push("/dashboard/mpomurro");
      } else {
        await createMpomurro(data);
        toast.success("Mpomurro registered successfully!");
        router.push("/dashboard/mpomurro");
      }

      reset();
      setImageUrl("/placeholder.svg");
      setVideoUrl("");
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit(saveMpomurro)}>
      <FormHeader
        href="/dashboard/mpomurro"
        parent=""
        title="Mpomurro"
        editingId={editingId}
        loading={loading}
      />

      <div className="grid grid-cols-12 gap-6 py-8">
        <div className="lg:col-span-8 col-span-full space-y-3">
          <Card>
            <CardHeader>
              <CardTitle>Mpomurro Details</CardTitle>
              <CardDescription>
                Add and manage your Mpomurro content here.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-6">
                <TextInput
                  register={register}
                  errors={errors}
                  label="Mpomurro Title"
                  name="title"
                />
                <TextArea
                  register={register}
                  errors={errors}
                  label="Mpomurro Description"
                  name="description"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-4 col-span-full">
          <div className="grid auto-rows-max items-start gap-4">
            <ImageInput
              title="Mpomurro Thumbnail"
              imageUrl={imageUrl}
              setImageUrl={setImageUrl}
              endpoint="mpomurroThumbnail"
            />
          </div>
        </div>
      </div>

      <div className="w-2/3">
        <VideoInput
          title="Upload Mpomurro Video"
          videoUrl={videoUrl}
          setVideoUrl={setVideoUrl}
          endpoint="mpomurroVideo" // 👈 must match your Uploadthing endpoint
        />
      </div>

      <FormFooter
        href="/dashboard/mpomurro"
        editingId={editingId}
        loading={loading}
        title="Mpomurro"
        parent=""
      />
    </form>
  );
}
