import React, { useEffect, useState, useRef } from 'react';
import { CheckCircle2, ShieldCheck, Cpu, Wifi, Eye } from 'lucide-react';

interface SceneData {
  id: string;
  image: string;
  cameraName: string;
  location: string;
  studentName: string;
  studentId: string;
  department: string;
  targetFace: {
    top: string;
    left: string;
    width: string;
    height: string;
  };
}

const SCENES: SceneData[] = [
  {
    id: 'entrance-verification',
    image: '/images/biometric-bg/campus-entrance-verification.jpg',
    cameraName: 'CAM-04 // TERMINAL A',
    location: 'Faculty of Engineering Concourse',
    studentName: 'Chidera N.',
    studentId: 'STU-2026-4821',
    department: 'Mechanical Engineering',
    targetFace: {
      top: '38%',
      left: '88.5%',
      width: '110px',
      height: '140px'
    }
  },
  {
    id: 'enrollment-lab',
    image: '/images/biometric-bg/biometric-enrollment-lab.jpg',
    cameraName: 'LAB-02 // STATION 3',
    location: 'Biometric Technology & Enrollment Lab',
    studentName: 'Kwame M.',
    studentId: 'STU-2026-3195',
    department: 'Computer Science',
    targetFace: {
      top: '48%',
      left: '46.5%',
      width: '120px',
      height: '145px'
    }
  }
];

export const BiometricCampusBackground: React.FC = () => {
  const [activeSceneIdx, setActiveSceneIdx] = useState(0);
  const [scanPhase, setScanPhase] = useState<0 | 1 | 2 | 3>(0);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Scene transition timer
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveSceneIdx((prev) => (prev + 1) % SCENES.length);
      setScanPhase(0);
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  // Scan HUD progression cycle
  useEffect(() => {
    const t1 = setTimeout(() => setScanPhase(1), 1500);
    const t2 = setTimeout(() => setScanPhase(2), 3500);
    const t3 = setTimeout(() => setScanPhase(3), 5000);
    const t4 = setTimeout(() => setScanPhase(0), 8000);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, [activeSceneIdx]);

  // Particle constellation network on canvas
  useEffect(() => {
    if (prefersReducedMotion) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    const PARTICLE_COUNT = Math.min(35, Math.floor(width / 45));
    const particles: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      radius: number;
    }> = [];

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        radius: Math.random() * 1.5 + 1
      });
    }

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        const isDark = document.documentElement.classList.contains('dark');
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = isDark ? 'rgba(255, 255, 255, 0.4)' : 'rgba(15, 23, 42, 0.35)';
        ctx.fill();

        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dx = p.x - p2.x;
          const dy = p.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 110) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = isDark 
              ? `rgba(255, 255, 255, ${0.15 * (1 - dist / 110)})`
              : `rgba(15, 23, 42, ${0.15 * (1 - dist / 110)})`;
            ctx.lineWidth = 0.6;
            ctx.stroke();
          }
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [prefersReducedMotion]);

  const currentScene = SCENES[activeSceneIdx];

  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden select-none pointer-events-none bg-slate-100 dark:bg-[#0f172a] transition-colors duration-300">
      {/* Base Solid Background */}
      <div className="absolute inset-0 bg-slate-100 dark:bg-[#0f172a]" />

      {/* University Background Images with Cinematic Crossfade - High Visibility */}
      <div className="absolute inset-0 w-full h-full">
        {SCENES.map((scene, idx) => {
          const isActive = idx === activeSceneIdx;
          return (
            <div
              key={scene.id}
              className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ease-in-out ${
                isActive ? 'opacity-100' : 'opacity-0'
              }`}
            >
              <img
                src={scene.image}
                alt={`${scene.location} - African University Biometric Attendance`}
                className={`w-full h-full object-cover object-center brightness-100 contrast-[1.05] saturate-[1.1] transition-transform duration-[12000ms] ease-out ${
                  !prefersReducedMotion && isActive ? 'scale-105 translate-x-1' : 'scale-100'
                }`}
                loading="eager"
              />
            </div>
          );
        })}
      </div>

      {/* Refined Contrast Gradient: Feathered on the left for hero text, completely transparent across center & right so students are fully visible */}
      <div className="absolute inset-0 bg-gradient-to-r from-slate-50/95 via-slate-50/50 via-35% to-transparent dark:from-[#0f172a]/95 dark:via-[#0f172a]/45 dark:via-35% dark:to-transparent transition-colors duration-300" />

      {/* Subtle edge feathering at bottom only */}
      <div className="absolute inset-0 bg-gradient-to-t from-slate-50/80 via-transparent to-transparent dark:from-[#0f172a]/80 dark:via-transparent dark:to-transparent transition-colors duration-300" />

      {/* Biometric Constellation Particles */}
      {!prefersReducedMotion && (
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full pointer-events-none opacity-50 hidden sm:block"
        />
      )}

      {/* Biometric Face HUD & Verification Telemetry */}
      <div className="absolute inset-0 w-full h-full pointer-events-none">
        {/* Camera Node Telemetry Badge */}
        <div className="hidden lg:flex items-center gap-2.5 absolute top-24 right-8 lg:right-16 px-4 py-2 rounded-full bg-white/95 dark:bg-slate-900/90 border border-emerald-500/40 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-mono shadow-2xl backdrop-blur-md transition-colors duration-200">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-bold tracking-wide text-slate-900 dark:text-white">{currentScene.cameraName}</span>
          <span className="text-slate-400">|</span>
          <span className="text-slate-700 dark:text-slate-300 text-[11px] font-sans font-medium">{currentScene.location}</span>
          <div className="flex items-center gap-1 ml-2 text-emerald-600 dark:text-emerald-400">
            <Wifi className="w-3.5 h-3.5" />
            <span className="text-[10px] font-bold">14ms</span>
          </div>
        </div>

        {/* Dynamic Biometric Face Target HUD on Active Student */}
        <div
          className="absolute hidden lg:block transition-all duration-700 ease-out"
          style={{
            top: currentScene.targetFace.top,
            left: currentScene.targetFace.left,
            width: currentScene.targetFace.width,
            height: currentScene.targetFace.height
          }}
        >
          {/* Target Face Bounding Box Frame */}
          <div className="relative w-full h-full rounded-xl border-2 border-emerald-500 dark:border-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.5)]">
            {/* Corner Brackets */}
            <div className="absolute -top-2 -left-2 w-4 h-4 border-t-3 border-l-3 border-emerald-600 dark:border-emerald-300" />
            <div className="absolute -top-2 -right-2 w-4 h-4 border-t-3 border-r-3 border-emerald-600 dark:border-emerald-300" />
            <div className="absolute -bottom-2 -left-2 w-4 h-4 border-b-3 border-l-3 border-emerald-600 dark:border-emerald-300" />
            <div className="absolute -bottom-2 -right-2 w-4 h-4 border-b-3 border-r-3 border-emerald-600 dark:border-emerald-300" />

            {/* Scanning Laser Beam */}
            {scanPhase === 1 && !prefersReducedMotion && (
              <div className="absolute inset-x-0 h-1 bg-emerald-500 dark:bg-emerald-400 shadow-[0_0_14px_#10b981] animate-scan-beam" />
            )}

            {/* Status Pill Badge attached to Target Box */}
            <div className="absolute -top-9 right-0">
              {scanPhase === 0 && (
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/95 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white text-[11px] font-mono shadow-lg whitespace-nowrap animate-pulse">
                  <Eye className="w-3 h-3 text-emerald-600 dark:text-white" />
                  <span>FACE DETECTED</span>
                </div>
              )}

              {scanPhase === 1 && (
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/95 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white text-[11px] font-mono shadow-lg whitespace-nowrap">
                  <Cpu className="w-3 h-3 text-emerald-600 dark:text-white animate-spin" />
                  <span>EXTRACTING 512-D VECTOR (99.4%)</span>
                </div>
              )}

              {scanPhase === 2 && (
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/95 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white text-[11px] font-mono shadow-lg whitespace-nowrap">
                  <ShieldCheck className="w-3 h-3 text-emerald-600 dark:text-white" />
                  <span className="text-emerald-700 dark:text-emerald-300 font-bold">3D LIVENESS: PASS</span>
                </div>
              )}

              {scanPhase === 3 && (
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/95 dark:bg-slate-800 border border-emerald-500/40 dark:border-slate-600 text-slate-800 dark:text-white text-xs font-mono shadow-xl whitespace-nowrap">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <div>
                    <span className="font-bold text-slate-900 dark:text-white">{currentScene.studentName}</span>
                    <span className="text-emerald-700 dark:text-emerald-300 ml-1.5 font-sans font-medium text-[11px]">
                      • Verified & Logged
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Student ID & Dept Meta tag at bottom */}
            <div className="absolute -bottom-8 left-0 whitespace-nowrap">
              <div className="text-[10px] font-mono text-slate-700 dark:text-white bg-white/95 dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700 shadow-md">
                ID: {currentScene.studentId} • {currentScene.department}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
