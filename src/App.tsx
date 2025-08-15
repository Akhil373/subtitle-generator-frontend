import BlurText from "./components/BlurText";
import FilesDragDrop from "./components/FilesDragDrop";

function App() {

  const handleAnimationComplete = () => {
    console.log('Animation completed!');
  };

  return (
    <>
      <div className="font-sans flex flex-col gap-16 md:p-[64px] p-[32px] items-center justify-center">

        <BlurText
          text={"Automatic\nSubtitle\nGenerator."}
          delay={150}
          animateBy="letters"
          direction="top"
          onAnimationComplete={handleAnimationComplete}
          className="text-[32px] md:text-[44px] bg-theme-red md:w-128 w-64 whitespace-pre-line rounded-2xl md:p-4 p-2 flex justify-start items-center text-black font-extrabold"
        />
        <FilesDragDrop />
      </div>
    </>
  )
}

export default App;
