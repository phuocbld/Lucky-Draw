import { useEffect, useRef, useState } from "react";
import "./App.css";

const STORAGE_KEY = "lucky_wheel_options";

const COLORS = [
  "#ef4444",
  "#f97316",
  "#facc15",
  "#22c55e",
  "#06b6d4",
  "#3b82f6",
  "#6366f1",
  "#8b5cf6",
  "#ec4899",
  "#14b8a6",
];

export default function App() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [options, setOptions] = useState<string[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved);
    return ["Đi xem phim", "Đi cà phê", "Đi du lịch"];
  });
  const [newOption, setNewOption] = useState("");
  const [result, setResult] = useState<string | null>(null);
  const [angle, setAngle] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const isLoadedRef = useRef(false);
  

  /* =======================
     Load options once
     ======================= */


  /* =======================
     Save + redraw
     ======================= */
     useEffect(() => {
      if (!canvasRef.current || options.length === 0) return;
    
      // đợi browser render xong canvas
      requestAnimationFrame(() => {
        drawWheel();
      });
     }, [options, angle]);
  
     useEffect(() => {
      console.log("🔥 SAVE OPTIONS:", options);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(options));
     }, [options]);
  
    
    
    

  /* =======================
     Draw Wheel
     ======================= */
  const drawWheel = () => {
    const canvas = canvasRef.current;
    if (!canvas || options.length === 0) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const size = canvas.width;
    const radius = size / 2;
    ctx.clearRect(0, 0, size, size);

    const slice = (2 * Math.PI) / options.length;

    options.forEach((opt, i) => {
      const start = angle + i * slice;
      const end = start + slice;

      // slice
      ctx.beginPath();
      ctx.moveTo(radius, radius);
      ctx.arc(radius, radius, radius - 10, start, end);
      ctx.fillStyle = COLORS[i % COLORS.length];
      ctx.fill();

      // text
      ctx.save();
      ctx.translate(radius, radius);
      ctx.rotate(start + slice / 2);
      ctx.textAlign = "right";
      ctx.fillStyle = "#fff";
      ctx.font = "bold 14px Arial";

      const text = opt.length > 14 ? opt.slice(0, 14) + "…" : opt;
      ctx.fillText(text, radius - 20, 5);
      ctx.restore();
    });
  };

  /* =======================
     Spin
     ======================= */
  const spin = () => {
    if (spinning || options.length === 0) return;

    setSpinning(true);
    setResult(null);

    const spinAngle = Math.random() * 2000 + 3000;
    const duration = 3000;
    const start = performance.now();

    const animate = (time: number) => {
      const progress = Math.min((time - start) / duration, 1);
      const easeOut = 1 - Math.pow(1 - progress, 3);

      const newAngle = (spinAngle * easeOut * Math.PI) / 180;
      setAngle(newAngle);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        const slice = (2 * Math.PI) / options.length;
        const index =
          options.length -
          Math.floor(((newAngle + Math.PI / 2) % (2 * Math.PI)) / slice) -
          1;

        setResult(options[(index + options.length) % options.length]);
        setSpinning(false);
      }
    };

    requestAnimationFrame(animate);
  };

  /* =======================
     Option CRUD
     ======================= */
  const addOption = () => {
    if (!newOption.trim()) return;
    setOptions([...options, newOption.trim()]);
    setNewOption("");
  };

  const editOption = (index: number) => {
    const value = prompt("Sửa option:", options[index]);
    if (!value) return;
    const copy = [...options];
    copy[index] = value;
    setOptions(copy);
  };

  const deleteOption = (index: number) => {
    setOptions(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="app">
      <div className="container">
        {/* Wheel */}
        <div className="wheel-area">
          <div className="pointer">⬇️</div>
          <canvas ref={canvasRef} width={360} height={360} />
          <button className="spin-btn" onClick={spin}>
            Quay vòng quay
          </button>

          {result && (
            <div className="result">
              🎉 Trúng: <strong>{result}</strong>
            </div>
          )}
        </div>

        {/* Option Panel */}
        <div className="option-panel">
          <h3>⚙️ Quản lý option</h3>

          <div className="option-input">
            <input
              value={newOption}
              onChange={(e) => setNewOption(e.target.value)}
              placeholder="Nhập option..."
            />
            <button onClick={addOption}>Thêm</button>
          </div>

          <div className="option-list">
            {options.map((o, i) => (
              <div key={i} className="option-item">
                <span>{o}</span>
                <div className="option-actions">
                  <button onClick={() => editOption(i)}>Sửa</button>
                  <button onClick={() => deleteOption(i)}>Xóa</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
