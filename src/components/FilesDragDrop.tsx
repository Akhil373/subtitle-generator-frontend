import { useState } from "react";
import { type FileState } from "../types/FileState";
import YouTubeInput from "./YouTubeInput";

type FilesDragDropProps = {
  fileState: FileState;
};

const SUPPORTED_TYPES: string[] = [
    "audio/wav",
    "audio/mp3",
    "audio/mpga",
    "audio/mp4",
    "video/mp4",
    "video/mpeg",
    "video/webm",
]

const FilesDragDrop: React.FC<FilesDragDropProps> = ({ fileState }) => {
    const {file, setFile, status, setStatus, setProgress, uploadFile, inputMode, setInputMode, youtubeUrl, setYoutubeUrl} = fileState
    const [isDragging, setIsDragging] = useState<boolean>(false)
    const [error, setError] = useState<string | null>()

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault()
        const items = e.dataTransfer.items
        let unsupported: boolean = false
        for (let i = 0; i < items.length; i++) {
            if (items[i].type && !SUPPORTED_TYPES.includes(items[i].type)) {
                unsupported = true
                break
            }
        }

        e.dataTransfer.dropEffect = unsupported ? "none" : "copy"
        setError(
            unsupported
                ? "Supported file formats: wav,mp3, mpga, mp4, mpeg, webm"
                : ""
        )
        setIsDragging(!unsupported)
    }

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault()
        setIsDragging(false)
        const dropped = Array.from(e.dataTransfer.files)
        if (dropped.length > 0) {
            setFile(dropped[0])
        }
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setFile(e.target.files[0])
        }
    }

    const truncate = (str: string, len = 40) => {
        return str.length > len ? str.slice(0, len) + "..." : str
    }

    const handleYouTubeSubmit = async () => {
        fileState.uploadYouTubeUrl();
    };

    return (
        <div className="flex-1 flex gap-8 p-[16px] flex-col items-center justify-center">
            {/* Mode Toggle */}
            <div className="flex gap-4 mb-4">
                <button
                    onClick={() => setInputMode("file")}
                    className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
                        inputMode === "file"
                            ? "bg-theme-red text-black"
                            : "bg-white/10 text-theme-white hover:bg-white/20"
                    }`}
                >
                    File Upload
                </button>
                <button
                    onClick={() => setInputMode("youtube")}
                    className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
                        inputMode === "youtube"
                            ? "bg-theme-red text-black"
                            : "bg-white/10 text-theme-white hover:bg-white/20"
                    }`}
                >
                    YouTube URL
                </button>
            </div>

            {inputMode === "file" ? (
                <div
                    className="w-full flex flex-col items-center justify-center"
                    onDragOver={handleDragOver}
                    onDragEnter={() => setIsDragging(true)}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={handleDrop}
                >
                    <div
                        className={`p-[128px] flex gap-4 flex-col items-center justify-center lg:h-[400px] border-4 border-dashed w-[300px] h-[64px] md:h-[256px] lg:w-[512px] rounded-3xl transition-all duration-300 backdrop-blur-sm ${
                            isDragging
                                ? "border-theme-red bg-theme-red/20"
                                : "border-white/30 bg-white/10 hover:border-white/50"
                        }`}
                    >
                        {file ? (
                            <>
                                <p className="font-bold text-theme-red text-xl">Selected File</p>
                                <p
                                    className="text-sm text-theme-white/80 text-center max-w-xs truncate"
                                    title={file.name}
                                >
                                    {truncate(file.name)}
                                </p>
                                <p className="text-xs text-theme-grey">
                                    {(file.size / (1024 * 1024)).toFixed(2)} MB
                                </p>
                            </>
                        ) : (
                            <>
                                <div className="flex flex-col items-center gap-3">
                                    <div className={`w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300 ${
                                        isDragging ? "bg-theme-red/30" : "bg-white/10"
                                    }`}>
                                        <svg className="w-8 h-8 text-theme-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                        </svg>
                                    </div>
                                    <p className="text-theme-white text-lg font-medium text-center">
                                        {isDragging ? (
                                            "Drop your file here!"
                                        ) : (
                                            <>
                                                Drag & <span className="font-bold text-theme-red">Drop</span> files here
                                            </>
                                        )}
                                    </p>
                                    <p className="text-theme-grey text-sm">or</p>
                                </div>
                                
                                <label
                                    htmlFor="file-input"
                                    className="cursor-pointer bg-theme-red hover:bg-red-700 disabled:bg-gray-500 disabled:cursor-not-allowed text-black px-6 py-3 rounded-xl font-medium transition-all duration-200 flex items-center gap-3 shadow-lg hover:shadow-xl"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                                    </svg>
                                    Choose File
                                </label>
                                <input
                                    type="file"
                                    id="file-input"
                                    onChange={handleFileChange}
                                    className="hidden"
                                    accept=".mp4, .mp3, .mpeg, .wav, .mpga, .webm"
                                />
                            </>
                        )}
                        {error && (
                            <p className="text-theme-red text-sm mt-2 text-center">{error}</p>
                        )}
                    </div>

                    <div className="flex w-full justify-center items-center gap-4 mt-8">
                        {(status === "idle" || status === "fail") && (
                            <button
                                onClick={uploadFile}
                                className="bg-purple-600 text-black rounded-xl cursor-pointer hover:bg-purple-900 disabled:bg-gray-500 disabled:cursor-not-allowed p-[16px] font-bold w-32 transition-all duration-300"
                                disabled={!file}
                            >
                                Upload
                            </button>
                        )}
                        {(status === "success" || status === "idle" || status === 'fail') && file && (
                            <button
                                className="bg-red-600 text-black rounded-xl cursor-pointer hover:bg-red-900 p-[16px] font-bold w-32 transition-all duration-300"
                                onClick={() => {
                                    setFile(null)
                                    setStatus("idle")
                                    setProgress(0)
                                }}
                            >
                                Clear
                            </button>
                        )}
                    </div>
                </div>
            ) : (
                <YouTubeInput
                    youtubeUrl={youtubeUrl}
                    setYoutubeUrl={setYoutubeUrl}
                    onSubmit={handleYouTubeSubmit}
                    status={status}
                />
            )}
        </div>
    )
}

export default FilesDragDrop
