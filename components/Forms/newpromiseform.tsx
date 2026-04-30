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
import { Promise } from "@prisma/client";
import { createPromise, updatePromise } from "@/actions/promise";

// ✅ Props
type PromiseFormProps = {
  editingId?: string;
  initialData?: Promise | null;
};

// ✅ Form component
export default function NewPromiseForm({ editingId, initialData }: PromiseFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<Promise>({
    defaultValues: {
      title: initialData?.title ?? "",
      why: initialData?.why ?? "",
      solution: initialData?.solution ?? "",
      impact: initialData?.impact ?? "",
      commitments: initialData?.commitments ?? [],
    },
  });

  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // ✅ Handle form submit
  async function savePromise(data: Promise) {
    try {
        // Split the commitments string into an array of strings
      const commitmentsArray = data.commitments
        ? (data.commitments as unknown as string).split(",").map((item) => item.trim())
        : [];

      const payload = {
        ...data,
        commitments: commitmentsArray,
      };
      setLoading(true);
      console.log(payload)

      if (editingId) {
        await updatePromise(editingId, payload);
        toast.success("Promise updated successfully!");
      } else {
        await createPromise(payload);
        toast.success("Promise registered successfully!");
      }

      reset();
      router.push("/dashboard/promises");
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit(savePromise)}>
      <FormHeader
        href="/dashboard/promises"
        parent=""
        title="Promise"
        editingId={editingId}
        loading={loading}
      />

      <div className="grid grid-cols-12 gap-6 py-8">
        <div className="lg:col-span-8 col-span-full space-y-3">
          <Card>
            <CardHeader>
              <CardTitle>Promise Details</CardTitle>
              <CardDescription>
                Add and manage your promises here.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-6">
                <TextInput
                  register={register}
                  errors={errors}
                  label="Promise Title"
                  name="title"
                />
                <TextArea
                  register={register}
                  errors={errors}
                  label="Why this is a problem"
                  name="why"
                />
                <TextArea
                  register={register}
                  errors={errors}
                  label="Proposed Solution"
                  name="solution"
                />
                <TextInput
                  register={register}
                  errors={errors}
                  label="Impact of the promise"
                  name="impact"
                />
                <TextInput
                  register={register}
                  errors={errors}
                  label="Commitments (comma-separated)"
                  name="commitments"
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <FormFooter
        href="/dashboard/promises"
        editingId={editingId}
        loading={loading}
        title="Promise"
        parent=""
      />
    </form>
  );
}