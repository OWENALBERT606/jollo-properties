"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";

import FormHeader from "./FormHeader";
import FormFooter from "./FormFooter";
import TextArea from "../FormInputs/TextAreaInput";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { BlogComment } from "@prisma/client";
import SubmitButton from "../FormInputs/SubmitButton";
import { MessageCircle, SplineIcon } from "lucide-react";
import { createBlogComment } from "@/actions/comments";

// ✅ Props
type BlogCommentFormProps = {
  postId: string;
  userId: any;
};

// ✅ Form component
export default function CommentForm({  postId, userId }: BlogCommentFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<BlogComment>({
    defaultValues: {
      content: "",
    },
  });

  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // ✅ Handle form submit
  async function saveComment(data: BlogComment) {
    data.postId = postId;
    data.userId = userId;
    console.log(data);

    try {
      setLoading(true);


        await createBlogComment(data);
        toast.success("Comment submitted successfully!");
      

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
    <form onSubmit={handleSubmit(saveComment)}>
      {/* <FormHeader
        href={`/blog/${postId}`}
        parent=""
        title="Comment"
        editingId={editingId}
        loading={loading}
      /> */}

      <div className="grid grid-cols-12 gap-6 py-8">
        <div className="lg:col-span-12 col-span-full space-y-3">
          <Card>
            <CardHeader>
              <CardTitle>Leave a Comment</CardTitle>
              <CardDescription>
                Share your thoughts on this post.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-6">
                <TextArea
                  register={register}
                  errors={errors}
                  label="Your Comment"
                  name="content"
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      <SubmitButton
        showIcon
        loading={loading}
        title="Submit Comment"
        loadingTitle="Submitting......."
        buttonIcon={MessageCircle}
        loaderIcon={SplineIcon}
      />
    </form>
  );
}