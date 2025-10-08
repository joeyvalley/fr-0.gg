import React, { useEffect, useMemo, useRef, useState } from 'react';

export type Track = {
  src: string;
  title?: string;
  id?: string;    // optional stable key
};

type MiniPlayerProps = {
  tracks: Track[];              // pass 1+ tracks
  startIndex?: number;          // default 0
  storageKey?: string;          // key for localStorage (position/volume)
  autoPlay?: boolean;           // default false (mobile browsers block anyway)
};

const fmt = (s: number) => {
  if (!isFinite(s) || s < 0) return '0:00';
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, '0')}`;
};

const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));

const MiniPlayer: React.FC<MiniPlayerProps> = ({
  tracks,
  startIndex = 0,
  storageKey = 'miniPlayer',
  autoPlay = false,
}) => {
  const [i, setI] = useState(clamp(startIndex, 0, Math.max(0, tracks.length - 1)));
  const [isPlaying, setIsPlaying] = useState(false);
  const [ready, setReady] = useState(false);
  const [t, setT] = useState(0);       // currentTime (s)
  const [dur, setDur] = useState(0);   // duration (s)
  const [vol, setVol] = useState(0.9);
  const [seeking, setSeeking] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  const track = tracks[i];
  const key = useMemo(() => `${storageKey}:${track?.id ?? i}`, [storageKey, track?.id, i]);

  // Restore persisted settings (volume + last position for this track)
  useEffect(() => {
    try {
      const saved = localStorage.getItem(key);
      if (saved) {
        const { volume, time } = JSON.parse(saved);
        if (typeof volume === 'number') setVol(clamp(volume, 0, 1));
        if (typeof time === 'number') setT(Math.max(0, time));
      } else {
        setT(0);
      }
    } catch {
      /* ignore */
    }
  }, [key]);

  // Wire up audio element
  useEffect(() => {
    const el = audioRef.current!;
    if (!el) return;

    const onLoaded = () => {
      setDur(el.duration || 0);
      setReady(true);
      // jump to saved position (after metadata is ready)
      if (t > 0 && t < (el.duration || Infinity)) {
        el.currentTime = t;
      }
      if (autoPlay) {
        el.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
      }
    };
    const onTime = () => {
      if (!seeking) setT(el.currentTime || 0);
    };
    const onEnd = () => {
      // go to next track if exists, else stop
      if (i < tracks.length - 1) {
        setI(i + 1);
      } else {
        setIsPlaying(false);
        el.currentTime = 0;
      }
    };

    el.volume = vol;
    el.addEventListener('loadedmetadata', onLoaded);
    el.addEventListener('timeupdate', onTime);
    el.addEventListener('ended', onEnd);

    return () => {
      el.removeEventListener('loadedmetadata', onLoaded);
      el.removeEventListener('timeupdate', onTime);
      el.removeEventListener('ended', onEnd);
    };
  }, [i, tracks.length, autoPlay, seeking, t, vol]);

  // Persist volume + time periodically
  useEffect(() => {
    const id = window.setInterval(() => {
      try {
        localStorage.setItem(key, JSON.stringify({ volume: vol, time: t }));
      } catch { /* ignore */ }
    }, 1000);
    return () => window.clearInterval(id);
  }, [key, t, vol]);

  // Keep element volume in sync
  useEffect(() => {
    const el = audioRef.current!;
    if (el) el.volume = vol;
  }, [vol]);

  const toggle = async () => {
    const el = audioRef.current!;
    if (!el) return;
    if (!ready) return; // metadata not ready yet
    if (el.paused) {
      try {
        await el.play();
        setIsPlaying(true);
      } catch {
        setIsPlaying(false);
      }
    } else {
      el.pause();
      setIsPlaying(false);
    }
  };

  const seek = (val: number) => {
    const el = audioRef.current!;
    if (!el || !isFinite(dur) || dur <= 0) return;
    const target = clamp(val, 0, dur);
    el.currentTime = target;
    setT(target);
  };

  const skipRel = (deltaSec: number) => {
    seek((audioRef.current?.currentTime || 0) + deltaSec);
  };

  const next = () => {
    if (i < tracks.length - 1) setI(i + 1);
  };
  const prev = () => {
    if (i > 0) setI(i - 1);
  };

  // Keyboard controls: space (play/pause), ←/→ (seek 5s), M (mute toggle)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement)?.tagName === 'INPUT') return;
      if (e.code === 'Space') { e.preventDefault(); toggle(); }
      else if (e.code === 'ArrowRight') { e.preventDefault(); skipRel(5); }
      else if (e.code === 'ArrowLeft') { e.preventDefault(); skipRel(-5); }
      else if (e.key.toLowerCase() === 'm') {
        setVol(v => (v > 0 ? 0 : 0.9));
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [toggle]);

  if (!track) return null;

  return (
    <>
      <audio ref={audioRef} src={track.src} preload="metadata" loop />

      <div className="mini-player" role="region" aria-label="Audio player">
        {/* <button className="mp-btn" onClick={prev} aria-label="Previous" disabled={i === 0}>⏮︎</button> */}

        <button className="mp-btn mp-play" onClick={toggle} aria-label={isPlaying ? 'Pause' : 'Play'}>
          {isPlaying ? '⏸︎' : '▶︎'}
        </button>

        <div
  className="mp-bar"
  onClick={(e) => {
    const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect(); // ✅
    const pct = (e.clientX - rect.left) / rect.width;
    if (dur > 0 && isFinite(dur)) seek(dur * Math.max(0, Math.min(1, pct)));
  }}
>
  <div className="mp-fill" style={{ width: dur > 0 ? `${(t / dur) * 100}%` : '0%' }} />
</div>
        <svg version="1.0" xmlns="http://www.w3.org/2000/svg"
 width="2rem" height="2rem" viewBox="0 0 300.000000 266.000000"
 preserveAspectRatio="xMidYMid meet">
<g transform="translate(0.000000,266.000000) scale(0.100000,-0.100000)"
fill="black" stroke="none">
<path d="M711 2370 c-94 -34 -148 -82 -196 -176 -31 -60 -35 -77 -35 -146 0
-42 7 -103 17 -135 18 -65 28 -172 18 -210 -3 -14 -49 -70 -103 -125 -115
-119 -161 -193 -190 -310 -27 -109 -28 -192 -2 -319 53 -261 233 -469 440
-509 25 -5 58 -12 73 -16 40 -9 155 25 161 48 17 65 22 71 66 86 58 19 385 23
445 5 22 -7 51 -14 65 -17 38 -8 107 -56 121 -85 7 -14 21 -38 31 -53 10 -14
18 -33 18 -42 0 -9 9 -21 20 -28 11 -7 20 -18 20 -24 0 -20 70 -92 112 -115
36 -19 56 -23 128 -21 82 1 141 14 245 54 79 30 85 33 188 84 200 99 371 304
425 512 46 175 22 328 -80 504 -29 51 -55 97 -57 103 -2 5 -11 19 -21 30 -10
11 -34 62 -54 113 -28 72 -39 117 -47 200 -24 256 -38 352 -49 352 -5 0 -11
13 -15 29 -7 33 -80 106 -122 122 -69 26 -157 37 -217 28 -76 -12 -132 -45
-206 -119 -90 -88 -160 -115 -375 -141 -55 -6 -117 -14 -138 -16 -21 -3 -58
-2 -83 2 -48 7 -68 24 -264 228 -36 38 -87 79 -113 92 -66 34 -155 39 -226 15z
m165 -55 c10 -8 30 -15 44 -15 16 0 42 -17 70 -45 25 -25 48 -45 52 -45 4 0
37 -38 74 -84 53 -67 73 -86 99 -90 18 -4 50 -18 71 -33 39 -26 39 -26 149
-15 60 6 142 18 180 27 39 9 97 20 130 23 58 7 125 40 125 63 0 5 5 9 12 9 6
0 29 18 51 41 75 76 197 120 275 100 20 -5 57 -15 81 -21 102 -27 164 -143
176 -330 12 -189 30 -286 68 -358 63 -118 127 -249 127 -258 0 -5 14 -29 30
-53 17 -24 30 -55 30 -68 0 -13 7 -38 16 -54 26 -52 11 -221 -29 -309 -33 -74
-47 -108 -47 -113 0 -3 -16 -32 -36 -65 -29 -50 -110 -136 -165 -177 -96 -70
-238 -135 -416 -189 -61 -19 -192 -20 -243 -3 -19 7 -40 22 -46 35 -6 12 -19
30 -28 40 -25 26 -67 92 -87 138 -19 42 -54 85 -79 97 -8 4 -22 11 -30 16 -92
54 -147 64 -350 62 -167 -1 -227 -17 -285 -76 -22 -22 -52 -48 -67 -58 -60
-38 -238 -6 -328 59 -64 47 -140 129 -140 152 0 10 -9 27 -20 37 -26 24 -45
84 -72 240 -29 168 4 387 69 457 64 68 98 98 111 98 6 0 21 15 33 33 13 17 27
34 31 38 4 3 19 33 33 67 26 65 31 117 16 185 -5 23 -15 81 -22 128 -10 76
-10 90 5 119 9 18 16 39 16 46 0 25 62 104 85 110 13 3 29 12 36 20 6 8 26 14
43 14 17 0 38 5 46 10 23 15 84 12 106 -5z"/>
<path d="M783 2162 c-31 -5 -68 -45 -83 -93 -11 -33 -11 -52 -2 -97 6 -30 16
-58 21 -61 4 -3 12 -19 15 -36 11 -45 77 -136 115 -158 46 -28 97 -15 129 33
20 30 23 44 19 95 -7 84 -15 123 -32 158 -8 17 -15 35 -15 42 0 18 -83 96
-116 109 -16 6 -39 10 -51 8z m63 -63 c43 -26 82 -91 100 -166 18 -76 17 -117
-1 -153 -13 -24 -22 -30 -50 -30 -44 0 -82 45 -130 156 -45 107 -45 142 3 197
20 22 37 22 78 -4z"/>
<path d="M2149 2112 c-56 -26 -99 -84 -120 -160 -39 -140 -18 -220 65 -243 26
-7 44 -6 73 6 38 15 83 70 83 100 0 9 7 45 16 81 14 56 15 73 4 125 -10 48
-19 65 -45 85 -38 28 -31 28 -76 6z m68 -62 c30 -58 5 -229 -40 -277 -27 -30
-79 -31 -107 -1 -25 27 -27 92 -4 168 20 67 40 98 79 122 37 23 56 20 72 -12z"/>
<path d="M470 1320 c0 -36 39 -98 93 -149 28 -26 82 -76 118 -110 84 -78 132
-95 284 -95 61 -1 147 5 193 12 63 10 87 10 104 1 12 -7 98 -17 191 -22 171
-11 173 -11 516 25 109 11 181 8 399 -19 39 -5 42 -3 42 19 0 28 -28 57 -80
84 -67 35 -232 27 -460 -21 -159 -34 -359 -36 -548 -6 -73 11 -279 6 -317 -9
-14 -6 -56 -10 -93 -10 -90 0 -163 27 -217 82 -24 24 -51 48 -61 54 -24 14
-64 90 -64 121 0 16 -8 27 -25 33 -14 5 -25 14 -25 20 0 5 -11 10 -25 10 -18
0 -25 -5 -25 -20z m1825 -289 c17 -10 7 -11 -60 -7 -43 4 -83 10 -88 15 -14
14 125 7 148 -8z"/>
</g>
</svg>

      </div>
    </>
  );
};

export default MiniPlayer;