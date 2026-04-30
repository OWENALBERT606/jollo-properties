"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";

import FormHeader from "./FormHeader";
import FormFooter from "./FormFooter";
import TextInput from "../FormInputs/TextInput";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import TextArea from "../FormInputs/TextAreaInput";
import FormSelectInput from "../FormInputs/FormSelectInput";
import { Member } from "@prisma/client";
import { createMember, updateMember } from "@/actions/members";
import SubmitButton from "../FormInputs/SubmitButton";
import { SplineIcon, User } from "lucide-react";

// ✅ Props
type SelectOption = {
  label: string;
  value: string;
};

type MemberFormProps = {
  editingId?: string;
  initialData?: any | null;
  villageOptions: any[];
  parishOptions: any[];
};

// ✅ Form component
export default function NewMemberForm({ villageOptions,parishOptions,editingId, initialData}: MemberFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<Member>({
    defaultValues: {
      name: initialData?.name ?? "",
      phone: initialData?.phone ?? "",
      email: initialData?.email ?? "",
      motivation: initialData?.motivation ?? "",
      parishId: initialData?.parishId ?? "",
      villageId: initialData?.villageId ?? "",
    },
  });

  const router = useRouter();
  const [loading, setLoading] = useState(false);
    const [selectedParish, setSelectedParish] = useState(parishOptions && parishOptions.length > 0 ? parishOptions[0] : null); 
    const [selectedVillage, setSelectedVillage] = useState(villageOptions && villageOptions.length > 0 ? villageOptions[0] : null);

 
  // ✅ Handle form submit
  async function saveMember(data: Member) {
    data.parishId=selectedParish.value;
    data.villageId=selectedVillage.value;
    try {
      setLoading(true);

      if (!selectedParish || !selectedVillage) {
        toast.error("Please select both a Parish and a Village.");
        setLoading(false);
        return;
      }

     

      if (editingId) {
        await updateMember(editingId, data);
        toast.success("Member updated successfully!");
      } else {
        await createMember(data);
        toast.success("Thank you for registering as a member!");
      }

      reset();
      router.refresh();
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit(saveMember)}>
      {/* <FormHeader
        href="/dashboard/members"
        parent=""
        title="Member"
        editingId={editingId}
        loading={loading}
      /> */}

      <div className="grid grid-cols-12 gap-6 py-8">
        <div className="lg:col-span-12 col-span-full space-y-3">
          <Card>
            <CardHeader>
              <CardTitle>Member Details</CardTitle>
              <CardDescription>
                .
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-6">
                <TextInput
                  register={register}
                  errors={errors}
                  label="Member's Full Name"
                  name="name"
                />
                <TextInput
                  register={register}
                  errors={errors}
                  label="Phone Number"
                  name="phone"
                />
                <TextInput
                  register={register}
                  errors={errors}
                  label="Email"
                  name="email"
                  type="email"
                />
                <FormSelectInput
                  label="Parish"
                  options={parishOptions}
                  option={selectedParish}
                  setOption={setSelectedParish}
                //   isSearchable={true}
                />
                <FormSelectInput
                  label="Village"
                  options={villageOptions}
                  option={selectedVillage}
                  setOption={setSelectedVillage}
                />
                <TextArea
                  register={register}
                  errors={errors}
                  label="Motivation to join"
                  name="motivation"
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      <SubmitButton showIcon loading={loading}  title="Submit" loadingTitle="Submitting......." buttonIcon={User} loaderIcon={SplineIcon} />

      {/* <FormFooter
        href="/dashboard/members"
        editingId={editingId}
        loading={loading}
        title="Member"
        parent=""
      /> */}
    </form>
  );
}