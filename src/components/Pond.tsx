import { useEffect, useRef, useState } from "react";

interface PondProps {
  setModal: (value: boolean) => void;
  fr0gg: string;
  date: string;
}

const prompt_close = new Audio('/assets/prompt_close.mp3');

const Pond: React.FC<PondProps> = ({ setModal, fr0gg, date }) => {
  const [loaded, setLoaded] = useState(false);
  const pondRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    setTimeout(() => {
      setLoaded(true);
    }, 200);
  }, []);

  const handleClose = () => {
    prompt_close.play();
    setTimeout(() => {
      setModal(false);
    }, 200);
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    const pondElement = pondRef.current;
    if (pondElement) {
      const offsetX = e.clientX - pondElement.getBoundingClientRect().left;
      const offsetY = e.clientY - pondElement.getBoundingClientRect().top;

      const handleMouseMove = (moveEvent: MouseEvent) => {
        pondElement.style.left = `${moveEvent.clientX - offsetX}px`;
        pondElement.style.top = `${moveEvent.clientY - offsetY}px`;
      };

      const handleMouseUp = () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };

      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }
  };

  return (
    <div className={`pond ${loaded ? "pond-loaded" : null}`} >
      <div className="pond-fr0gg-container" ref={pondRef} onMouseDown={handleMouseDown}>
        <div className="pond-fr0gg-container-header">
          <div className="pond-fr0gg-container-header-date">{date}</div>
          <div className="pond-closer" onClick={() => handleClose()}>X</div>
        </div>
        <img src={fr0gg} alt="Selected fr0gg" className="pond-fr0gg" />
      </div>
    </div>
  );
}

export default Pond;