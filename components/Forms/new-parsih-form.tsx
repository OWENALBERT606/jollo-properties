"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";

import FormHeader from "./FormHeader";
import FormFooter from "./FormFooter";
import TextInput from "../FormInputs/TextInput";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import TextArea from "../FormInputs/TextAreaInput";
import { Parish } from "@prisma/client";
import { createParish, updateParish } from "@/actions/parishes";

// ✅ Props
type ParishFormProps = {
  editingId?: string;
  initialData?: Parish | null;
};

// ✅ Form component
export default function NewParishForm({ editingId, initialData }: ParishFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<Parish>({
    defaultValues: {
      name: initialData?.name ?? "",
      description: initialData?.description ?? "",
      population: initialData?.population ?? 0,
    },
  });

  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // ✅ Handle form submit
  async function saveParish(data: Parish) {
    try {
      setLoading(true);
      data.population = parseInt(data.population as any, 10);

      if (editingId) {
        await updateParish(editingId, data);
        toast.success("Parish updated successfully!");
        router.push("/dashboard/parishes");
      } else {
        await createParish(data);
        toast.success("Parish registered successfully!");
        router.push("/dashboard/parishes");
      }

      reset();
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit(saveParish)}>
      <FormHeader
        href="/dashboard/parishes"
        parent=""
        title="Parish"
        editingId={editingId}
        loading={loading}
      />

      <div className="grid grid-cols-12 gap-6 py-8">
        <div className="lg:col-span-8 col-span-full space-y-3">
          <Card>
            <CardHeader>
              <CardTitle>Parish Details</CardTitle>
              <CardDescription>
                Add and manage your parishes here.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-6">
                <TextInput
                  register={register}
                  errors={errors}
                  label="Parish Name"
                  name="name"
                />
                <TextInput
                  register={register}
                  errors={errors}
                  label="Population"
                  name="population"
                  type="number"
                />
                <TextArea
                  register={register}
                  errors={errors}
                  label="Parish Description"
                  name="description"
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <FormFooter
        href="/dashboard/parishes"
        editingId={editingId}
        loading={loading}
        title="Parish"
        parent=""
      />
    </form>
  );
}
