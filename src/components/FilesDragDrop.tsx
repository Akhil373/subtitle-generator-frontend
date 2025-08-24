import { useState } from "react"

const FilesDragDrop = () => {
    const [isDragging, setIsDragging] = useState<boolean>(false)
    const [files, setFiles] = useState<DataTransferItem[]>([])
    // const [error, setError] = useState<String | null>();

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault()
        e.dataTransfer.dropEffect = "copy"
        setIsDragging(true)
    }

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault()
        setIsDragging(false)
        const dropped = Array.from(e.dataTransfer.items)
        setFiles(dropped)
        console.log(files)
    }

    return (
        <div
            className="flex-1 flex items-start p-[16px] justify-center"
            onDragOver={handleDragOver}
            onDragEnter={() => setIsDragging(true)}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
        >
            <div
                className={`p-[128px] flex gap-3 flex-col items-center justify-center h-[128px] border-4 border-dashed border-white w-[300px] md:w-fit rounded-3xl
            ${isDragging ? " bg-theme-red" : ""}`}
            >
                <p className="text-nowrap">
                    {isDragging ? (
                        "Drop it!"
                    ) : (
                        <>
                            Drag & <span className="font-bold">Drop</span> files
                            here
                        </>
                    )}
                </p>
                <div>
                    <label
                        htmlFor="file-input"
                        className="cursor-pointer bg-theme-red hover:bg-red-700 text-black px-4 py-2 rounded-xl font-medium transition-colors duration-200 flex items-center gap-2 shadow-lg w-[128px]"
                    >
                        <img src="files.svg" alt="file upload" className="w-10 shrink-0" />
                        <span className="">Choose Files</span>
                    </label>
                    <input type="file" id="file-input" className="hidden" />
                </div>
            </div>
        </div>
    )
}

export default FilesDragDrop
