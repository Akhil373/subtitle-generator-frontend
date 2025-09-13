import axios from "axios"
import {useEffect, useState} from "react"
import BlurText from "./components/BlurText"
import DownloadUrl from "./components/DownloadUrl"
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
        "idle" | "uploading" | "processing" | "success" | "fail" | "checking"
    >("idle")
    const [jobId, setJobId] = useState<null | string>(null)
    const [inputMode, setInputMode] = useState<"file" | "youtube">("file")
    const [youtubeUrl, setYoutubeUrl] = useState<string>("")
    const [pollInterval, setPollInterval] = useState<number | null>(null)
    const [presignedUrl, setPresignedUrl] = useState<string | null>(null)

    const getJobIdFromUrl = (): string | null => {
        const urlParams = new URLSearchParams(window.location.search)
        return urlParams.get("job_id")
    }

    const updateUrlWithJobId = (jobId: string) => {
        const url = new URL(window.location.href)
        url.searchParams.set("job_id", jobId)
        window.history.replaceState({}, "", url.toString())
    }

    const resetToInitialState = () => {
        if (pollInterval) {
            clearInterval(pollInterval)
            setPollInterval(null)
        }

        const url = new URL(window.location.href)
        url.searchParams.delete("job_id")
        window.history.replaceState({}, "", url.toString())

        setFile(null)
        setProgress(0)
        setStatus("idle")
        setJobId(null)
        setYoutubeUrl("")
        setPresignedUrl(null)
    }

    const pollJobStatus = (jobId: string) => {
        if (pollInterval) {
            clearInterval(pollInterval)
        }

        const newPollInterval = setInterval(async () => {
            try {
                const statusResponse = await axios.get<JobStatusResponse>(
                    `${import.meta.env.VITE_BACKEND_URL}/job-status/${jobId}`
                )

                const {status, download_url} = statusResponse.data

                if (status === "PROCESSING") {
                    setStatus("processing")
                } else if (status === "COMPLETED" && download_url) {
                    clearInterval(newPollInterval)
                    setPollInterval(null)
                    setPresignedUrl(download_url)
                    setStatus("success")
                } else if (status === "FAILED") {
                    clearInterval(newPollInterval)
                    setPollInterval(null)
                    setStatus("fail")
                    alert("Job processing failed")
                }
            } catch (error) {
                console.error("Error polling job status:", error)
                clearInterval(newPollInterval)
                setPollInterval(null)
                setStatus("fail")
                alert("Error checking job status")
            }
        }, 3000)

        setPollInterval(newPollInterval)
        return newPollInterval
    }

    useEffect(() => {
        const existingJobId = getJobIdFromUrl()
        if (existingJobId) {
            setJobId(existingJobId)
            setStatus("checking")
            pollJobStatus(existingJobId)
        }
    }, [])

    useEffect(() => {
        return () => {
            if (pollInterval) {
                clearInterval(pollInterval)
            }
        }
    }, [pollInterval])

    const uploadContent = async () => {
        if (!file && !youtubeUrl) {
            alert("Please provide either a file or YouTube URL")
            return
        }

        if (file && youtubeUrl) {
            alert("Please provide either a file OR YouTube URL, not both")
            return
        }

        const formData = new FormData()

        if (file) {
            formData.append("file", file)
        } else if (youtubeUrl) {
            formData.append("youtube_url", youtubeUrl)
        }

        if (pollInterval) {
            clearInterval(pollInterval)
            setPollInterval(null)
        }

        setStatus("uploading")
        setProgress(0)

        try {
            const response = await axios.post<GenerateSubtitlesResponse>(
                `${import.meta.env.VITE_BACKEND_URL}/generate-subtitles/`,
                formData,
                {
                    onUploadProgress: (progressEvent) => {
                        if (file) {
                            const percentCompleted = Math.round(
                                (progressEvent.loaded * 100) /
                                    (progressEvent.total ??
                                        progressEvent.loaded)
                            )
                            setProgress(percentCompleted)

                            if (percentCompleted === 100) {
                                setStatus("processing")
                                setProgress(0)
                            }
                        } else {
                            setStatus("processing")
                        }
                    },
                }
            )

            const {job_id} = response.data
            console.log(jobId)
            setJobId(job_id)

            updateUrlWithJobId(job_id)
            pollJobStatus(job_id)
        } catch (e) {
            console.error("Upload error:", e)
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
                    {presignedUrl ? (
                        <DownloadUrl
                            presignedUrl={presignedUrl}
                            resetToInitialState={resetToInitialState}
                        />
                    ) : (
                        <>
                            <div
                                className={`flex w-full px-5 justify-between
                        ${
                            status === "processing" || status === "checking"
                                ? "flex-col items-center"
                                : "flex-row"
                        }
                    `}
                            >
                                {status === "processing" ? (
                                    <p>
                                        You can bookmark this page and return
                                        later to download your subtitles.
                                    </p>
                                ) : status === "checking" ? (
                                    <p>
                                        Checking status for your previous job...
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
                                    uploadContent,
                                    inputMode,
                                    setInputMode,
                                    youtubeUrl,
                                    setYoutubeUrl,
                                }}
                            />
                        </>
                    )}
                </div>
            </div>
        </>
    )
}

export default App
