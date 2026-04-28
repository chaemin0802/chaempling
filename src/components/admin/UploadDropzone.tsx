'use client';

import { useField, FieldLabel } from '@payloadcms/ui';
import { useCallback, useEffect, useRef, useState } from 'react';

type FieldProps = {
  path: string;
  schemaPath?: string;
  field?: { hasMany?: boolean; label?: string | Record<string, string> };
};

type MediaDoc = {
  id: string;
  url?: string;
  mimeType?: string;
  filename?: string;
  width?: number;
  height?: number;
};

type Value = string | string[] | null | undefined;

const uploadEndpoint = '/api/media';

async function uploadFile(file: File): Promise<MediaDoc> {
  const fd = new FormData();
  fd.append('file', file);
  fd.append('_payload', JSON.stringify({ alt: file.name }));
  const res = await fetch(uploadEndpoint, { method: 'POST', body: fd });
  if (!res.ok) throw new Error(`Upload failed: ${res.status}`);
  const json = await res.json();
  return json.doc;
}

async function fetchMedia(id: string): Promise<MediaDoc | null> {
  try {
    const res = await fetch(`${uploadEndpoint}/${id}`);
    if (!res.ok) return null;
    return (await res.json()) as MediaDoc;
  } catch {
    return null;
  }
}

function isVideo(doc: MediaDoc | undefined): boolean {
  return !!doc?.mimeType?.startsWith('video/');
}

export default function UploadDropzone(props: FieldProps) {
  const { path, field } = props;
  const { value, setValue } = useField<Value>({ path });

  const hasMany = field?.hasMany ?? Array.isArray(value);
  const ids: string[] = Array.isArray(value) ? (value as string[]) : value ? [value as string] : [];

  const [cache, setCache] = useState<Record<string, MediaDoc>>({});
  const [uploading, setUploading] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [reorderIndex, setReorderIndex] = useState<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Fetch missing media info for ids we don't have cached
  useEffect(() => {
    const missing = ids.filter((id) => id && !cache[id]);
    if (missing.length === 0) return;
    let cancelled = false;
    (async () => {
      const entries = await Promise.all(missing.map(async (id) => [id, await fetchMedia(id)] as const));
      if (cancelled) return;
      setCache((prev) => {
        const next = { ...prev };
        for (const [id, doc] of entries) if (doc) next[id] = doc;
        return next;
      });
    })();
    return () => {
      cancelled = true;
    };
  }, [ids, cache]);

  const addFiles = useCallback(
    async (files: FileList | File[]) => {
      const arr = Array.from(files);
      if (arr.length === 0) return;
      setError(null);
      setUploading((n) => n + arr.length);
      try {
        const uploaded: MediaDoc[] = [];
        for (const f of arr) {
          try {
            const doc = await uploadFile(f);
            uploaded.push(doc);
          } catch (e) {
            setError((e as Error).message);
          }
        }
        if (uploaded.length > 0) {
          setCache((prev) => {
            const next = { ...prev };
            for (const d of uploaded) next[d.id] = d;
            return next;
          });
          if (hasMany) {
            setValue([...ids, ...uploaded.map((d) => d.id)]);
          } else {
            setValue(uploaded[0].id);
          }
        }
      } finally {
        setUploading((n) => Math.max(0, n - arr.length));
      }
    },
    [hasMany, ids, setValue],
  );

  function removeAt(index: number) {
    if (hasMany) {
      const next = ids.slice();
      next.splice(index, 1);
      setValue(next);
    } else {
      setValue(null);
    }
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files?.length) {
      void addFiles(e.dataTransfer.files);
    }
  }

  // Thumbnail internal drag-reorder (hasMany only)
  function onThumbDragStart(index: number) {
    setReorderIndex(index);
  }
  function onThumbDragOver(e: React.DragEvent, overIndex: number) {
    if (reorderIndex === null || reorderIndex === overIndex) return;
    e.preventDefault();
    const next = ids.slice();
    const [moved] = next.splice(reorderIndex, 1);
    next.splice(overIndex, 0, moved);
    setValue(next);
    setReorderIndex(overIndex);
  }
  function onThumbDragEnd() {
    setReorderIndex(null);
  }

  const empty = ids.length === 0;

  return (
    <div style={{ marginBottom: 16 }}>
      <FieldLabel path={path} />
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        style={{
          border: `1.5px dashed ${dragOver ? 'var(--theme-success-500, #22c55e)' : 'var(--theme-elevation-150, #3a3a3a)'}`,
          borderRadius: 4,
          padding: 12,
          background: dragOver ? 'var(--theme-success-50, rgba(34,197,94,0.06))' : 'var(--theme-elevation-50, rgba(255,255,255,0.02))',
          transition: 'border-color 120ms, background 120ms',
        }}
      >
        {empty ? (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            style={{
              display: 'block',
              width: '100%',
              minHeight: 120,
              background: 'transparent',
              color: 'var(--theme-elevation-500, #aaa)',
              border: 'none',
              cursor: 'pointer',
              fontSize: 13,
            }}
          >
            파일을 드래그하거나 클릭해서 업로드
          </button>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: hasMany ? 'repeat(auto-fill, minmax(120px, 1fr))' : 'minmax(200px, 360px)',
              gap: 8,
            }}
          >
            {ids.map((id, i) => {
              const doc = cache[id];
              const src = doc?.url ?? '';
              return (
                <div
                  key={`${id}-${i}`}
                  draggable={hasMany}
                  onDragStart={() => onThumbDragStart(i)}
                  onDragOver={(e) => onThumbDragOver(e, i)}
                  onDragEnd={onThumbDragEnd}
                  style={{
                    position: 'relative',
                    aspectRatio: '1',
                    background: 'var(--theme-elevation-100, #222)',
                    borderRadius: 3,
                    overflow: 'hidden',
                    cursor: hasMany ? 'grab' : 'default',
                    opacity: reorderIndex === i ? 0.5 : 1,
                  }}
                >
                  {src ? (
                    isVideo(doc) ? (
                      <video src={src} muted loop playsInline style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={src} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    )
                  ) : (
                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, color: '#888' }}>
                      loading...
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeAt(i);
                    }}
                    aria-label="remove"
                    style={{
                      position: 'absolute',
                      top: 4,
                      right: 4,
                      width: 22,
                      height: 22,
                      borderRadius: '50%',
                      border: 'none',
                      background: 'rgba(0,0,0,0.65)',
                      color: '#fff',
                      fontSize: 14,
                      lineHeight: 1,
                      cursor: 'pointer',
                    }}
                  >
                    ×
                  </button>
                </div>
              );
            })}
            {hasMany && (
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                style={{
                  aspectRatio: '1',
                  background: 'transparent',
                  border: '1px dashed var(--theme-elevation-150, #3a3a3a)',
                  borderRadius: 3,
                  color: 'var(--theme-elevation-500, #888)',
                  cursor: 'pointer',
                  fontSize: 22,
                }}
                aria-label="add more"
              >
                +
              </button>
            )}
          </div>
        )}
        <input
          ref={inputRef}
          type="file"
          multiple={hasMany}
          accept="image/*,video/*"
          onChange={(e) => {
            if (e.target.files) void addFiles(e.target.files);
            e.target.value = '';
          }}
          style={{ display: 'none' }}
        />
      </div>
      {uploading > 0 && (
        <p style={{ fontSize: 11, color: 'var(--theme-elevation-500, #888)', margin: '6px 0 0' }}>
          업로드 중… {uploading}개 남음
        </p>
      )}
      {error && <p style={{ fontSize: 12, color: '#f66', margin: '6px 0 0' }}>{error}</p>}
    </div>
  );
}
