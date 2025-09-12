export type InputMode = "file" | "youtube";

export type FileState = {
  file: File | null;
  setFile: React.Dispatch<React.SetStateAction<File | null>>;
  status:
    | "idle"
    | "uploading"
    | "processing"
    | "success"
    | "fail";
  setStatus: React.Dispatch<React.SetStateAction<FileState["status"]>>;
  setProgress: React.Dispatch<React.SetStateAction<number>>;
  uploadContent: () => Promise<void>;
  inputMode: InputMode;
  setInputMode: React.Dispatch<React.SetStateAction<InputMode>>;
  youtubeUrl: string;
  setYoutubeUrl: React.Dispatch<React.SetStateAction<string>>;
};
