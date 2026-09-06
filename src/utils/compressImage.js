import imageCompression from "browser-image-compression";

export const compressImage = (file) => {
  if (!(file instanceof File) || !file.type.startsWith("image/")) return file;

  return imageCompression(file, {
    maxSizeMB: 1,
    maxWidthOrHeight: 1200,
    useWebWorker: true,
    fileType: "image/jpeg",
  });
};
