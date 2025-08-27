export type FileState = {
  file: File | null;
  setFile: React.Dispatch<React.SetStateAction<File | null>>;
  status:
    | "idle"
    | "uploading"
    | "processing"
    | "success"
    | "fail"
    | "downloading";
  setStatus: React.Dispatch<React.SetStateAction<FileState["status"]>>;
  setProgress: React.Dispatch<React.SetStateAction<number>>;
  uploadFile: () => Promise<void>;
};