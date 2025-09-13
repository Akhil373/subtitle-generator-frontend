import { useState } from "react";
import { type FileState } from "../types/FileState";

interface YouTubeInputProps {
  youtubeUrl: string;
  setYoutubeUrl: (url: string) => void;
  onSubmit: () => void;
  status: "idle" | "uploading" | "processing" | "success" | "fail" | "checking";
  setStatus:  React.Dispatch<React.SetStateAction<FileState["status"]>>;
}

const YouTubeInput: React.FC<YouTubeInputProps> = ({ 
  youtubeUrl, 
  setYoutubeUrl, 
  onSubmit,
  status,
  setStatus
}) => {
  const [isValid, setIsValid] = useState(true);

  const validateYouTubeUrl = (url: string): boolean => {
    const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/;
    return youtubeRegex.test(url) && url.length > 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    setYoutubeUrl(url);
    setIsValid(validateYouTubeUrl(url) || url.length === 0);
  };

  const handleSubmit = () => {
    if (validateYouTubeUrl(youtubeUrl)) {
      onSubmit();
    } else {
      setIsValid(false);
    }
  };

  const handleClear = () => {
    setYoutubeUrl("");
    setIsValid(true);
    setStatus("idle");
  };

  return (
    <div className="flex flex-col items-center justify-center w-full">
      <div className="relative w-full max-w-2xl">
        <input
          type="url"
          value={youtubeUrl}
          onChange={handleInputChange}
          placeholder="Enter YouTube URL..."
          className={`w-full px-6 py-4 pr-12 text-lg bg-white/10 backdrop-blur-sm border-4 rounded-3xl text-theme-white placeholder-theme-grey focus:outline-none focus:border-theme-red transition-all duration-300 ${
            isValid ? "border-white/30" : "border-theme-red"
          }`}
          disabled={status === "uploading" || status === "processing" }
        />
        {youtubeUrl && (
          <button
            onClick={handleClear}
            disabled={status === "uploading" || status === "processing"}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-theme-grey hover:text-theme-white disabled:text-gray-500 transition-colors duration-200"
            title="Clear URL"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
        {!isValid && youtubeUrl.length > 0 && (
          <p className="absolute -bottom-8 left-0 text-theme-red text-sm mt-2">
            Please enter a valid YouTube URL
          </p>
        )}
      </div>
      
      <button
        onClick={handleSubmit}
        disabled={!youtubeUrl || status === "uploading" || status === "processing" || !isValid}
        className="mt-8 bg-theme-red text-black rounded-xl cursor-pointer hover:bg-red-700 disabled:bg-gray-500 disabled:cursor-not-allowed p-[16px] font-bold w-32 transition-all duration-300"
      >
        {status === "uploading" ? "Processing..." : "Submit"}
      </button>
    </div>
  );
};

export default YouTubeInput;