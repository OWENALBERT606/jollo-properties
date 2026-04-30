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
import { Nosigaki } from "@prisma/client";
import { createNosigaki, updateNosigaki } from "@/actions/nosigaki";
import VideoInput from "../FormInputs/VideoInput";

// ✅ Props
type NosigakiFormProps = {
  editingId?: string;
  initialData?: Nosigaki | null;
};

// ✅ Form component
export default function NewNosigakiForm({ editingId, initialData }: NosigakiFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<Nosigaki>({
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
  const initialVideo = initialData?.videoUrl || "/placeholder.svg";
  const [imageUrl, setImageUrl] = useState(initialImage);
    const [videoUrl, setVideoUrl] = useState(initialVideo);


  // ✅ Handle form submit
  async function saveNosigaki(data: any) {
    try {
      setLoading(true);
      data.thumbnail = imageUrl;
      data.videoUrl= videoUrl;

      if (editingId) {
        await updateNosigaki(editingId, data);
        toast.success("Nosigaki updated successfully!");
        router.push("/dashboard/nosigaki");
      } else {
        await createNosigaki(data);
        toast.success("Nosigaki registered successfully!");
        router.push("/dashboard/nosigaki");
      }

      reset();
      setImageUrl("/placeholder.svg");
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit(saveNosigaki)}>
      <FormHeader
        href="/dashboard/nosigaki"
        parent=""
        title="Nosigaki"
        editingId={editingId}
        loading={loading}
      />

      <div className="grid grid-cols-12 gap-6 py-8">
        <div className="lg:col-span-8 col-span-full space-y-3">
          <Card>
            <CardHeader>
              <CardTitle>Nosigaki Details</CardTitle>
              <CardDescription>
                Add and manage your nosigaki content here.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-6">
                <TextInput
                  register={register}
                  errors={errors}
                  label="Nosigaki Title"
                  name="title"
                />
                <TextArea
                  register={register}
                  errors={errors}
                  label="Nosigaki Description"
                  name="description"
                />
              </div>
            </CardContent>
          </Card>
        </div>
        <div className="lg:col-span-4 col-span-full">
          <div className="grid auto-rows-max items-start gap-4">
            <ImageInput
              title="Nosigaki Thumbnail"
              imageUrl={imageUrl}
              setImageUrl={setImageUrl}
              endpoint="nosigakiThumbnail"
            />
          </div>
        </div>
      </div>
        <div className="w-2/3">
           <VideoInput
        title="Upload Nosigaki"
        videoUrl={videoUrl}
        setVideoUrl={setVideoUrl}
        endpoint="videoUploader" // 👈 this should match your Uploadthing endpoint
      />
        </div>

      <FormFooter
        href="/dashboard/nosigaki"
        editingId={editingId}
        loading={loading}
        title="Nosigaki"
        parent=""
      />
    </form>
  );
}