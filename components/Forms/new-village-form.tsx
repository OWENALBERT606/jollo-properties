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
import { Village } from "@prisma/client";
import { createVillage, updateVillage } from "@/actions/villages";
import FormSelectInput from "../FormInputs/FormSelectInput";

// ✅ Props
type VillageFormProps = {
  editingId?: string;
  initialData?: Village | null;
  parishes?:any;
};

// ✅ Form component
export default function NewVillageForm({ editingId, initialData,parishes }: VillageFormProps) {
    // name
// description
// population
//   parish   Parish @relation(fields: [parishId], references: [id])
//  parishId
// houseHolds
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<Village>({
    defaultValues: {
      name: initialData?.name ?? "",
      description: initialData?.description ?? "",
      population: initialData?.population ?? 0,
    },
  });

  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [selectedParish, setSelectedParish] = useState(parishes ? parishes[0]: null);

  // ✅ Handle form submit
  async function saveVillage(data: Village) {
    try {
      setLoading(true);
      data.houseHolds = parseInt(data.houseHolds as any, 10);
      data.parishId = selectedParish?.value || "";


      if (editingId) {
        await updateVillage(editingId, data);
        toast.success("Village updated successfully!");
        router.push("/dashboard/villages");
      } else {
        await createVillage(data);
        toast.success("Village registered successfully!");
        router.push("/dashboard/villages");
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
    <form onSubmit={handleSubmit(saveVillage)}>
      <FormHeader
        href="/dashboard/villages"
        parent=""
        title="Village"
        editingId={editingId}
        loading={loading}
      />

      <div className="grid grid-cols-12 gap-6 py-8">
        <div className="lg:col-span-8 col-span-full space-y-3">
          <Card>
            <CardHeader>
              <CardTitle>Village Details</CardTitle>
              <CardDescription>
                Add and manage your villages here.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-6">
                <TextInput
                  register={register}
                  errors={errors}
                  label="Village Name"
                  name="name"
                />
                {/* <TextInput
                  register={register}
                  errors={errors}
                  label="Population"
                  name="population"
                  type="number"
                /> */}
                <TextInput
                  register={register}
                  errors={errors}
                  label="House Holds"
                  name="houseHolds"
                  type="number"
                />
                   <FormSelectInput
                    label="Parish"
                    options={parishes}
                    option={selectedParish}
                    setOption={setSelectedParish}
                              />
                <TextArea
                  register={register}
                  errors={errors}
                  label="Village Description"
                  name="description"
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <FormFooter
        href="/dashboard/villages"
        editingId={editingId}
        loading={loading}
        title="Village"
        parent=""
      />
    </form>
  );
}
