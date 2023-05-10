import Webcam from "react-webcam";

const Camera = () => {
  const videoConstraints = {
    width: 1280,
    height: 720,
    facingMode: "user",
  };

  return (
    <div className="w-full">
      <main className="w-full">
        <h1 className="w-full">Camera</h1>
        <Webcam />
      </main>
    </div>
  );
};

export default Camera;
