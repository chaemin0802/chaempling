'use client';

import { useEffect, useRef, useState } from 'react';

interface MuteToggleVideoProps {
  src: string;
  className?: string;
  style?: React.CSSProperties;
  fill?: boolean;
}

export default function MuteToggleVideo({ src, className, style, fill = false }: MuteToggleVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [muted, setMuted] = useState(true);
  const [hasAudio, setHasAudio] = useState<boolean | null>(null);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;

    const detect = () => {
      const el = v as HTMLVideoElement & {
        mozHasAudio?: boolean;
        webkitAudioDecodedByteCount?: number;
        audioTracks?: { length: number };
      };
      const audio =
        el.mozHasAudio === true ||
        (typeof el.webkitAudioDecodedByteCount === 'number' && el.webkitAudioDecodedByteCount > 0) ||
        (el.audioTracks && el.audioTracks.length > 0);
      setHasAudio(Boolean(audio));
    };

    if (v.readyState >= 1) detect();
    v.addEventListener('loadedmetadata', detect);
    v.addEventListener('playing', detect);
    return () => {
      v.removeEventListener('loadedmetadata', detect);
      v.removeEventListener('playing', detect);
    };
  }, []);

  const toggle = () => {
    if (!hasAudio) return;
    const next = !muted;
    setMuted(next);
    if (!next) {
      document.querySelectorAll<HTMLVideoElement>('video[data-mute-toggle="true"]').forEach((other) => {
        if (other !== videoRef.current) other.muted = true;
      });
      document.dispatchEvent(new CustomEvent('mute-toggle:unmute', { detail: videoRef.current }));
    }
  };

  useEffect(() => {
    const onOtherUnmute = (e: Event) => {
      const target = (e as CustomEvent).detail as HTMLVideoElement | null;
      if (target && target !== videoRef.current) setMuted(true);
    };
    document.addEventListener('mute-toggle:unmute', onOtherUnmute);
    return () => document.removeEventListener('mute-toggle:unmute', onOtherUnmute);
  }, []);

  const wrapperStyle: React.CSSProperties = fill
    ? { position: 'absolute', inset: 0, ...style }
    : { position: 'relative', width: '100%', ...style };

  const videoStyle: React.CSSProperties = fill
    ? {
        display: 'block',
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        cursor: hasAudio ? 'pointer' : 'default',
      }
    : {
        display: 'block',
        width: '100%',
        height: 'auto',
        cursor: hasAudio ? 'pointer' : 'default',
      };

  return (
    <div className={className} style={wrapperStyle}>
      <video
        ref={videoRef}
        src={src}
        autoPlay
        muted={muted}
        loop
        playsInline
        preload="metadata"
        data-mute-toggle="true"
        onClick={toggle}
        style={videoStyle}
      />
      {hasAudio && (
        <button
          type="button"
          onClick={toggle}
          aria-label={muted ? 'Unmute' : 'Mute'}
          style={{
            position: 'absolute',
            bottom: 12,
            right: 12,
            width: 36,
            height: 36,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '0.5px solid rgba(255,255,255,0.3)',
            background: 'rgba(0,0,0,0.5)',
            backdropFilter: 'blur(8px)',
            color: 'white',
            cursor: 'pointer',
            zIndex: 2,
          }}
        >
          {muted ? (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 5L6 9H2v6h4l5 4V5z" />
              <line x1="23" y1="9" x2="17" y2="15" />
              <line x1="17" y1="9" x2="23" y2="15" />
            </svg>
          ) : (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 5L6 9H2v6h4l5 4V5z" />
              <path d="M15.54 8.46a5 5 0 010 7.07" />
              <path d="M19.07 4.93a10 10 0 010 14.14" />
            </svg>
          )}
        </button>
      )}
    </div>
  );
}
