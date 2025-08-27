import { useState } from "react";
import { type FileState } from "../types/FileState";

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
    const {file, setFile, status, setStatus, setProgress, uploadFile} = fileState
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

    return (
        <div
            className="flex-1 flex gap-8 p-[16px] flex-col items-center justify-center"
            onDragOver={handleDragOver}
            onDragEnter={() => setIsDragging(true)}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
        >
            <div
                className={`p-[128px] flex gap-3 flex-col items-center justify-center lg:h-[400px] border-4 border-dashed border-white w-[300px] h-[64px] md:h-[256px] lg:w-[512px] rounded-3xl
            ${isDragging ? " bg-red-300/50" : ""}`}
            >
                {file ? (
                    <p className="font-bold text-theme-red">Selected Files</p>
                ) : (
                    <p className="text-nowrap">
                        {isDragging ? (
                            "Drop it!"
                        ) : (
                            <>
                                Drag & <span className="font-bold">Drop</span>{" "}
                                files here
                            </>
                        )}
                    </p>
                )}
                {file ? (
                    <>
                        <p
                            className="text-sm text-gray-500"
                            title={file.name}
                        >
                            {truncate(file.name)}
                        </p>
                    </>
                ) : (
                    <div>
                        <label
                            htmlFor="file-input"
                            className="cursor-pointer bg-theme-red hover:bg-red-700 text-black px-4 py-2 rounded-xl font-medium transition-colors duration-200 flex items-center gap-2 shadow-lg w-[128px]"
                        >
                            <img
                                src="files.svg"
                                alt="file upload"
                                className="w-10 shrink-0"
                            />
                            Choose Files
                        </label>
                        <input
                            type="file"
                            id="file-input"
                            onChange={handleFileChange}
                            className="hidden"
                            accept=".mp4, .mp3, .mpeg, .wav, .mpga, .webm"
                        />
                    </div>
                )}
                {error && (
                    <p className="error text-theme-red text-wrap">{error}</p>
                )}
            </div>

            <div className="flex w-full justify-center items-center gap-16">
                <button
                    onClick={uploadFile}
                    className="bg-purple-600 text-black rounded-xl cursor-pointer hover:bg-purple-900 p-[16px] font-bold w-32"
                    disabled={!file}
                >
                    Upload
                </button>
                {status === "success" || status === "idle" ? (
                    <button
                        className="bg-red-600 text-black rounded-xl cursor-pointer hover:bg-red-900 p-[16px] font-bold w-32"
                        onClick={() => {
                            setFile(null)
                            setStatus("idle")
                            setProgress(0)
                        }}
                    >
                        Clear
                    </button>
                ) : null}
            </div>
        </div>
    )
}

export default FilesDragDrop
