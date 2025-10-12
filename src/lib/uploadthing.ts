import { generateUploadButton, generateUploadDropzone, generateReactHelpers } from "@uploadthing/react";
 
import type { OurFileRouter } from "./uploadthing-config";
 
export const UploadButton = generateUploadButton<OurFileRouter>();
export const UploadDropzone = generateUploadDropzone<OurFileRouter>();
 
export const { useUploadThing } = generateReactHelpers<OurFileRouter>();