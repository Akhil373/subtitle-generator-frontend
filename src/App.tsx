import axios from "axios"
import { useState } from "react"
import BlurText from "./components/BlurText"
import FilesDragDrop from "./components/FilesDragDrop"
import TopBar from "./components/TopBar"

function App() {
    const [file, setFile] = useState<File | null>(null)
    const [progress, setProgress] = useState<number>(0)
    const [status, setStatus] = useState<
        "idle" | "uploading" | "processing" | "success" | "fail" | "downloading"
    >("idle")

    const uploadFile = async () => {
        if (!file) {
            return
        }
        const formData = new FormData()
        formData.append("file", file)

        setStatus("uploading")
        setProgress(0)

        try {
            const response = await axios.post(
                "https://axletoe-whisper-subtitle-generator.hf.space/generate-subtitles",
                formData,
                {
                    responseType: "blob",
                    onUploadProgress: (progressEvent) => {
                        const percentCompleted = Math.round(
                            (progressEvent.loaded * 100) /
                                (progressEvent.total ?? progressEvent.loaded)
                        )
                        setProgress(percentCompleted)

                        if (percentCompleted === 100) {
                            setStatus("processing")
                            setProgress(0)
                        }
                    },
                    onDownloadProgress: (progressEvent) => {
                        setStatus("downloading")
                        if (progressEvent.total) {
                            const percentCompleted = Math.round(
                                (progressEvent.loaded * 100) /
                                    (progressEvent.total ??
                                        progressEvent.loaded)
                            )
                            setProgress(percentCompleted)
                            if(percentCompleted===100){setStatus("success")}
                        }
                    },
                }
            )
            const url = window.URL.createObjectURL(new Blob([response.data]))
            const link = document.createElement("a")
            link.href = url
            link.download = "result.zip"
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
            window.URL.revokeObjectURL(url)
            setStatus("success")
        } catch (e) {
            if(e instanceof Error) {alert("Error: " + e.message)}
            else {alert("Unknown Error: " + e)}
            setStatus("fail")
        }
    }

    return (
        <>
            <div className="font-sans flex flex-col lg:flex-row p-[32px] g-16 lg:gap-32 items-center justify-center">
                <TopBar />
                <BlurText
                    text={"Automatic\nSubtitle\nGenerator."}
                    delay={150}
                    animateBy="letters"
                    direction="top"
                    className="text-[32px] lg:text-[44px] bg-linear-to-r from-theme-red to-transparent lg:w-128 w-64 whitespace-pre-line rounded-2xl lg:p-4 p-2 flex justify-start items-center text-black font-extrabold mb-[16px]"
                />
                <div>
                    <div className="flex w-full px-5 justify-between">
                        <p>Progress: {progress}</p>
                        <p>Status: {status}</p> 
                    </div>
                    <FilesDragDrop
                        fileState= {{
                            file,
                            setFile,
                            status,
                            setStatus,
                            setProgress,
                            uploadFile
                        }}
                    />
                </div>
            </div>
        </>
    )
}

export default App
