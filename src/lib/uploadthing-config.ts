import { createUploadthing, type FileRouter } from "uploadthing/server";
 
const f = createUploadthing();
 
export const ourFileRouter = {
  videoUploader: f({ video: { maxFileSize: "256MB", maxFileCount: 1 } })
    .middleware(async ({ req }) => {
      return { userId: "user" };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("Upload complete for userId:", metadata.userId);
      console.log("file url", file.url);
      return { uploadedBy: metadata.userId };
    }),
} satisfies FileRouter;
 
export type OurFileRouter = typeof ourFileRouter;