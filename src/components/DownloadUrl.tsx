interface DownloadUrlProps {
    presignedUrl: string,
    resetToInitialState: () => void
}

const DownloadUrl: React.FC<DownloadUrlProps> = ({presignedUrl, resetToInitialState}) => {
    return (
        <div className="flex flex-col gap-6 items-center p-6 bg-white/10 backdrop-blur-sm rounded-3xl border border-white/20">
            <p className="text-2xl font-bold text-theme-white text-center">
                Your subtitled video + srt files are ready! 🎉
            </p>
            <a
                href={presignedUrl}
                className="bg-theme-red hover:bg-red-700 text-black px-8 py-4 rounded-xl font-bold text-lg transition-all duration-300 flex items-center gap-3 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
                <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                    />
                </svg>
                Download Your Video
            </a>
            <button
                onClick={resetToInitialState}
                className="px-6 py-3 bg-white/10 hover:bg-white/20 text-theme-white rounded-xl font-medium transition-all duration-300 flex items-center gap-2 border border-white/30 hover:border-white/50"
            >
                <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M10 19l-7-7m0 0l7-7m-7 7h18"
                    />
                </svg>
                Go Back
            </button>
        </div>
    )
}

export default DownloadUrl
