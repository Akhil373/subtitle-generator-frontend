import axios from "axios"
import { useState } from "react"
import BlurText from "./components/BlurText"
import FilesDragDrop from "./components/FilesDragDrop"
import TopBar from "./components/TopBar"

interface GenerateSubtitlesResponse {
    message: string
    job_id: string
}

interface JobStatusResponse {
    job_id: string
    status: string
    download_url?: string
}

function App() {
    const [file, setFile] = useState<File | null>(null)
    const [progress, setProgress] = useState<number>(0)
    const [status, setStatus] = useState<
        "idle" | "uploading" | "processing" | "success" | "fail"
    >("idle")
    const [jobId, setJobId] = useState<null | string>(null)

    const uploadFile = async () => {
        if (!file) {
            return
        }
        const formData = new FormData()
        formData.append("file", file)

        setStatus("uploading")
        setProgress(0)

        try {
            const response = await axios.post<GenerateSubtitlesResponse>(
                `${import.meta.env.VITE_BACKEND_URL}/generate-subtitles/`,
                formData,
                {
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
                }
            )
            console.log(jobId)
            const {job_id} = response.data
            setJobId(job_id)

            const pollInterval = setInterval(async () => {
                try {
                    const statusResponse = await axios.get<JobStatusResponse>(
                        `${
                            import.meta.env.VITE_BACKEND_URL
                        }/job-status/${job_id}`
                    )

                    const {status, download_url} = statusResponse.data
                    if (status === "PROCESSING") setStatus("processing")

                    if (status === "COMPLETED" && download_url) {
                        clearInterval(pollInterval)
                        window.location.href = download_url
                        setStatus("success")
                    } else if (status === "FAILED") {
                        clearInterval(pollInterval)
                        setStatus("fail")
                        alert("Job processing failed")
                    }
                } catch (error) {
                    console.error("Error polling job status:", error)
                }
            }, 3000)
        } catch (e) {
            if (e instanceof Error) {
                alert("Error: " + e.message)
            } else {
                alert("Unknown Error: " + e)
            }
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
                    <div
                        className={`flex w-full px-5 justify-between
                        ${
                            status === "processing"
                                ? "flex-col items-center"
                                : "flex-row"
                        }    
                    `}
                    >
                        {status === "processing" ? (
                            <p>
                                No need to wait here; your download will start
                                automatically.
                            </p>
                        ) : (
                            <p>Progress: {progress}%</p>
                        )}
                        <p>Status: {status}</p>
                    </div>
                    <FilesDragDrop
                        fileState={{
                            file,
                            setFile,
                            status,
                            setStatus,
                            setProgress,
                            uploadFile,
                        }}
                    />
                </div>
            </div>
        </>
    )
}

export default App
