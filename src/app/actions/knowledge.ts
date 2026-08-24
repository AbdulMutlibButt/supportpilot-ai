"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireWorkspace } from "@/lib/auth";
import { db } from "@/lib/db";
import { validateUpload } from "@/lib/document-processing";
import * as knowledge from "@/lib/knowledge-service";
import { privateStorage } from "@/lib/storage";

const shortText = z.string().trim().min(1).max(200);
const optionalText = z.string().trim().max(2_000).optional();
const id = z.string().trim().min(1);

export async function uploadDocumentAction(form: FormData) {
  const { user, workspace } = await requireWorkspace(undefined, "AGENT");
  const file = form.get("file");
  if (!(file instanceof File)) throw new Error("Choose a PDF, DOCX, or TXT file");
  const data = Buffer.from(await file.arrayBuffer());
  const validated = validateUpload(file.name, file.type, file.size, data);
  const fields = z.object({ title: shortText, description: optionalText, collectionId: z.string().optional() }).parse(Object.fromEntries(form));
  const document = await knowledge.createUpload(db, privateStorage, user.id, workspace.id, {
    ...fields, collectionId: fields.collectionId || undefined, originalFilename: file.name,
    size: file.size, data, ...validated,
  });
  redirect(`/dashboard/knowledge/${document.id}?uploaded=1`);
}

export async function createArticleAction(form: FormData) {
  const { user, workspace } = await requireWorkspace(undefined, "AGENT");
  const fields = z.object({ title: shortText, description: optionalText, content: z.string().trim().min(1).max(250_000), collectionId: z.string().optional() }).parse(Object.fromEntries(form));
  const document = await knowledge.createArticle(db, user.id, workspace.id, { ...fields, collectionId: fields.collectionId || undefined });
  redirect(`/dashboard/knowledge/${document.id}?created=1`);
}

export async function updateDocumentAction(form: FormData) {
  const { user, workspace } = await requireWorkspace(undefined, "AGENT");
  const fields = z.object({ documentId: id, title: shortText, description: optionalText, content: z.string().optional(), collectionId: z.string().optional() }).parse(Object.fromEntries(form));
  await knowledge.updateArticle(db, user.id, workspace.id, fields.documentId, { ...fields, collectionId: fields.collectionId || undefined });
  revalidatePath(`/dashboard/knowledge/${fields.documentId}`);
  redirect(`/dashboard/knowledge/${fields.documentId}?saved=1`);
}

export async function retryDocumentAction(form: FormData) {
  const { user, workspace } = await requireWorkspace(undefined, "AGENT");
  const documentId = id.parse(form.get("documentId"));
  await knowledge.retryDocument(db, privateStorage, user.id, workspace.id, documentId);
  revalidatePath(`/dashboard/knowledge/${documentId}`);
}

export async function deleteDocumentAction(form: FormData) {
  const { user, workspace } = await requireWorkspace(undefined, "OWNER");
  const fields = z.object({ documentId: id, confirm: z.literal("DELETE") }).parse(Object.fromEntries(form));
  await knowledge.deleteDocument(db, privateStorage, user.id, workspace.id, fields.documentId);
  redirect("/dashboard/knowledge?deleted=1");
}

export async function createCollectionAction(form: FormData) {
  const { user, workspace } = await requireWorkspace(undefined, "AGENT");
  const fields = z.object({ name: shortText, description: optionalText }).parse(Object.fromEntries(form));
  await knowledge.createCollection(db, user.id, workspace.id, fields.name, fields.description);
  revalidatePath("/dashboard/knowledge");
}
