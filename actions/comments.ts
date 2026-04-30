"use server";

import { db } from "@/prisma/db";
import { revalidatePath } from "next/cache";

// ---------- Blog Comments Types ----------
export type BlogCommentProps = {
  content: string;
  postId: string;
  userId: string;
};

// ---------- Blog Comments Actions ----------

// Create new comment
export async function createBlogComment(data: BlogCommentProps) {
  try {
    const newComment = await db.blogComment.create({
      data,
      include: {
        user: true,
        blog: true,
      },
    });

    // Revalidate blog detail page so new comment shows up
    revalidatePath(`/blogs/${data.postId}`);
    return newComment;
  } catch (error) {
    console.log(error);
    return null;
  }
}

// Get comments for a blog post
export async function getCommentsByBlogId(postId: string) {
  try {
    const comments = await db.blogComment.findMany({
      where: { postId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return comments;
  } catch (error) {
    console.log(error);
    return [];
  }
}

// Delete a comment
export async function deleteBlogComment(id: string) {
  try {
    const deleted = await db.blogComment.delete({
      where: { id },
    });

    revalidatePath("/dashboard/blogs");
    return { ok: true, data: deleted };
  } catch (error) {
    console.log(error);
    return null;
  }
}

// Update a comment (optional)
export async function updateBlogComment(id: string, content: string) {
  try {
    const updated = await db.blogComment.update({
      where: { id },
      data: { content },
    });

    revalidatePath("/dashboard/blogs");
    return updated;
  } catch (error) {
    console.log(error);
    return null;
  }
}
