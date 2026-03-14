"use client";

import { useCallback, useRef, useState } from "react";
import { Upload, X, ImageIcon, Loader2, AlertCircle } from "lucide-react";

const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/gif", "image/bmp", "image/webp"];
const MAX_FILE_SIZE = 10 * 1024 * 1024;

interface FileWithPreview { file: File; preview: string; id: string; }
interface Props { onUpload: (files: File[]) => void; loading: boolean; }

export default function UploadArea({ onUpload, loading }: Props) {
    const [files, setFiles] = useState<FileWithPreview[]>([]);
    const [dragActive, setDragActive] = useState(false);
    const [error, setError] = useState("");
    const inputRef = useRef<HTMLInputElement>(null);

    const addFiles = useCallback((newFiles: FileList | File[]) => {
        setError("");
        const valid: FileWithPreview[] = [];
        for (const file of Array.from(newFiles)) {
            if (!ACCEPTED_TYPES.includes(file.type)) { setError(`"${file.name}" is not a supported image format.`); continue; }
            if (file.size > MAX_FILE_SIZE) { setError(`"${file.name}" exceeds 10MB limit.`); continue; }
            valid.push({ file, preview: URL.createObjectURL(file), id: `${file.name}-${Date.now()}-${Math.random()}` });
        }
        setFiles((prev) => [...prev, ...valid]);
    }, []);

    const removeFile = (id: string) => setFiles((prev) => { const r = prev.find((f) => f.id === id); if (r) URL.revokeObjectURL(r.preview); return prev.filter((f) => f.id !== id); });
    const clearAll = () => { files.forEach((f) => URL.revokeObjectURL(f.preview)); setFiles([]); setError(""); };
    const handleSubmit = () => { if (files.length === 0) return; onUpload(files.map((f) => f.file)); };

    const handleDrag = useCallback((e: React.DragEvent) => {
        e.preventDefault(); e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
        else if (e.type === "dragleave") setDragActive(false);
    }, []);
    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault(); e.stopPropagation(); setDragActive(false);
        if (e.dataTransfer.files?.length) addFiles(e.dataTransfer.files);
    }, [addFiles]);

    return (
        <>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=Sora:wght@600;700&display=swap');

                .ua-wrap {
                    font-family: 'DM Sans', sans-serif;
                    border-radius: 20px;
                    padding: 18px;
                    animation: ua-in 0.38s ease both;
                }
                @media (min-width: 640px)  { .ua-wrap { padding: 22px; } }
                @media (min-width: 1024px) { .ua-wrap { padding: 28px; } }

                :root:not(.dark) .ua-wrap {
                    background: #ffffff;
                    border: 1px solid #e9eef5;
                    box-shadow: 0 2px 12px rgba(15,23,42,0.05);
                }
                .dark .ua-wrap {
                    background: #111827;
                    border: 1px solid rgba(255,255,255,0.07);
                    box-shadow: 0 2px 16px rgba(0,0,0,0.35);
                }

                @keyframes ua-in {
                    from { opacity: 0; transform: translateY(12px); }
                    to   { opacity: 1; transform: translateY(0); }
                }

                /* ── Drop zone ── */
                .ua-dropzone {
                    position: relative;
                    border-radius: 14px;
                    border: 2px dashed transparent;
                    padding: 40px 24px;
                    text-align: center;
                    cursor: pointer;
                    transition: border-color 0.18s ease, background 0.18s ease, transform 0.18s ease;
                    -webkit-tap-highlight-color: transparent;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 14px;
                }
                @media (min-width: 640px) { .ua-dropzone { padding: 56px 32px; } }

                :root:not(.dark) .ua-dropzone {
                    border-color: #dde3ed;
                    background: #fafbfd;
                }
                :root:not(.dark) .ua-dropzone:hover {
                    border-color: rgba(32,114,206,0.4);
                    background: rgba(32,114,206,0.02);
                }
                .dark .ua-dropzone {
                    border-color: rgba(255,255,255,0.08);
                    background: rgba(255,255,255,0.02);
                }
                .dark .ua-dropzone:hover {
                    border-color: rgba(32,114,206,0.35);
                    background: rgba(32,114,206,0.04);
                }

                /* Drag active state */
                .ua-dropzone.drag-active {
                    border-color: #2072CE !important;
                    transform: scale(1.01);
                }
                :root:not(.dark) .ua-dropzone.drag-active { background: rgba(32,114,206,0.04) !important; }
                .dark .ua-dropzone.drag-active            { background: rgba(32,114,206,0.07) !important; }

                /* Upload icon */
                .ua-icon-wrap {
                    width: 56px;
                    height: 56px;
                    border-radius: 16px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: transform 0.25s cubic-bezier(0.34,1.56,0.64,1);
                }
                :root:not(.dark) .ua-icon-wrap { background: rgba(32,114,206,0.09); }
                .dark .ua-icon-wrap            { background: rgba(32,114,206,0.1); }

                .ua-dropzone:hover .ua-icon-wrap,
                .ua-dropzone.drag-active .ua-icon-wrap {
                    transform: translateY(-4px) scale(1.08);
                }

                .ua-drop-title {
                    font-size: 0.9rem;
                    font-weight: 500;
                    margin: 0 0 4px;
                }
                :root:not(.dark) .ua-drop-title { color: #475569; }
                .dark .ua-drop-title            { color: #D1D5DB; }

                .ua-drop-link { color: #2072CE; text-decoration: underline; text-underline-offset: 2px; }

                .ua-drop-hint {
                    font-size: 0.75rem;
                    margin: 0;
                }
                :root:not(.dark) .ua-drop-hint { color: #94a3b8; }
                .dark .ua-drop-hint            { color: #9CA3AF; }

                /* ── Error ── */
                .ua-error {
                    display: flex;
                    align-items: center;
                    gap: 7px;
                    margin-top: 12px;
                    padding: 9px 12px;
                    border-radius: 10px;
                    font-size: 0.78rem;
                    animation: ua-slideDown 0.22s ease both;
                }
                :root:not(.dark) .ua-error {
                    background: rgba(239,68,68,0.06);
                    border: 1px solid rgba(239,68,68,0.15);
                    color: #ef4444;
                }
                .dark .ua-error {
                    background: rgba(239,68,68,0.06);
                    border: 1px solid rgba(239,68,68,0.12);
                    color: #f87171;
                }
                @keyframes ua-slideDown {
                    from { opacity: 0; transform: translateY(-6px); }
                    to   { opacity: 1; transform: translateY(0); }
                }

                /* ── File list ── */
                .ua-file-section {
                    margin-top: 18px;
                    animation: ua-fadeUp 0.28s ease both;
                }
                @keyframes ua-fadeUp {
                    from { opacity: 0; transform: translateY(8px); }
                    to   { opacity: 1; transform: translateY(0); }
                }

                .ua-file-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    margin-bottom: 12px;
                }

                .ua-file-count {
                    font-size: 0.7rem;
                    font-weight: 600;
                    letter-spacing: 0.07em;
                    text-transform: uppercase;
                }
                :root:not(.dark) .ua-file-count { color: #94a3b8; }
                .dark .ua-file-count            { color: #9CA3AF; }

                .ua-clear-btn {
                    font-size: 0.75rem;
                    font-weight: 500;
                    border: none;
                    background: transparent;
                    cursor: pointer;
                    padding: 3px 8px;
                    border-radius: 6px;
                    transition: background 0.12s ease, color 0.12s ease;
                    -webkit-tap-highlight-color: transparent;
                    font-family: 'DM Sans', sans-serif;
                }
                :root:not(.dark) .ua-clear-btn { color: #94a3b8; }
                :root:not(.dark) .ua-clear-btn:hover { background: #fee2e2; color: #ef4444; }
                .dark .ua-clear-btn { color: #9CA3AF; }
                .dark .ua-clear-btn:hover { background: rgba(239,68,68,0.08); color: #f87171; }

                /* ── File grid ── */
                .ua-grid {
                    display: grid;
                    grid-template-columns: repeat(2, 1fr);
                    gap: 10px;
                }
                @media (min-width: 640px)  { .ua-grid { grid-template-columns: repeat(3, 1fr); } }
                @media (min-width: 1024px) { .ua-grid { grid-template-columns: repeat(4, 1fr); } }

                /* File card */
                .ua-file-card {
                    border-radius: 12px;
                    overflow: hidden;
                    position: relative;
                    animation: ua-cardIn 0.3s cubic-bezier(0.34,1.2,0.64,1) both;
                    transition: transform 0.18s ease, box-shadow 0.18s ease;
                }
                :root:not(.dark) .ua-file-card {
                    border: 1px solid #e9eef5;
                    background: #f8fafc;
                }
                .dark .ua-file-card {
                    border: 1px solid rgba(255,255,255,0.07);
                    background: rgba(255,255,255,0.03);
                }
                .ua-file-card:hover { transform: translateY(-2px); box-shadow: 0 4px 14px rgba(0,0,0,0.1); }

                @keyframes ua-cardIn {
                    from { opacity: 0; transform: scale(0.88); }
                    to   { opacity: 1; transform: scale(1); }
                }

                .ua-img-wrap {
                    aspect-ratio: 1;
                    position: relative;
                    overflow: hidden;
                }
                .ua-img-wrap img { width: 100%; height: 100%; object-fit: cover; display: block; }

                /* Remove button */
                .ua-remove-btn {
                    position: absolute;
                    top: 6px; right: 6px;
                    width: 24px; height: 24px;
                    border-radius: 50%;
                    border: none;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    opacity: 0;
                    transition: opacity 0.15s ease, transform 0.15s cubic-bezier(0.34,1.56,0.64,1);
                    background: rgba(0,0,0,0.65);
                    -webkit-tap-highlight-color: transparent;
                }
                .ua-file-card:hover .ua-remove-btn { opacity: 1; }
                /* Always show on touch devices */
                @media (hover: none) { .ua-remove-btn { opacity: 1; } }
                .ua-remove-btn:hover { transform: scale(1.15); }
                .ua-remove-btn:active { transform: scale(0.9); }

                .ua-file-meta {
                    padding: 7px 9px 8px;
                }
                .ua-file-name {
                    font-size: 0.7rem;
                    font-weight: 500;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    margin: 0 0 1px;
                }
                :root:not(.dark) .ua-file-name { color: #64748b; }
                .dark .ua-file-name            { color: #D1D5DB; }

                .ua-file-size {
                    font-size: 0.65rem;
                    margin: 0;
                }
                :root:not(.dark) .ua-file-size { color: #94a3b8; }
                .dark .ua-file-size            { color: #9CA3AF; }

                /* Add more tile */
                .ua-add-more {
                    aspect-ratio: 1;
                    border-radius: 12px;
                    border: 2px dashed transparent;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    gap: 5px;
                    cursor: pointer;
                    transition: border-color 0.15s ease, background 0.15s ease, transform 0.18s ease;
                    -webkit-tap-highlight-color: transparent;
                }
                :root:not(.dark) .ua-add-more {
                    border-color: #dde3ed;
                    background: #fafbfd;
                }
                :root:not(.dark) .ua-add-more:hover {
                    border-color: rgba(32,114,206,0.4);
                    background: rgba(32,114,206,0.03);
                    transform: scale(1.03);
                }
                .dark .ua-add-more {
                    border-color: rgba(255,255,255,0.07);
                    background: rgba(255,255,255,0.02);
                }
                .dark .ua-add-more:hover {
                    border-color: rgba(32,114,206,0.3);
                    background: rgba(32,114,206,0.04);
                    transform: scale(1.03);
                }

                .ua-add-more-label {
                    font-size: 0.7rem;
                    font-weight: 500;
                }
                :root:not(.dark) .ua-add-more-label { color: #94a3b8; }
                .dark .ua-add-more-label            { color: #9CA3AF; }

                /* ── Submit button ── */
                .ua-submit-btn {
                    margin-top: 16px;
                    width: 100%;
                    padding: 13px;
                    border: none;
                    border-radius: 13px;
                    font-family: 'DM Sans', sans-serif;
                    font-size: 0.9rem;
                    font-weight: 600;
                    color: #fff;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                    position: relative;
                    overflow: hidden;
                    transition: transform 0.18s cubic-bezier(0.34,1.56,0.64,1),
                                box-shadow 0.18s ease, opacity 0.18s ease;
                    -webkit-tap-highlight-color: transparent;
                }
                :root:not(.dark) .ua-submit-btn {
                    background: linear-gradient(135deg, #2072CE 0%, #1a5aaa 100%);
                    box-shadow: 0 4px 14px rgba(32,114,206,0.28);
                }
                .dark .ua-submit-btn {
                    background: linear-gradient(135deg, #2072CE 0%, #1550a0 100%);
                    box-shadow: 0 4px 16px rgba(32,114,206,0.18);
                }
                .ua-submit-btn::before {
                    content: '';
                    position: absolute; inset: 0;
                    background: linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.13) 50%, transparent 60%);
                    transform: translateX(-100%);
                }
                .ua-submit-btn:not(:disabled):hover::before {
                    transform: translateX(100%);
                    transition: transform 0.5s ease;
                }
                .ua-submit-btn:not(:disabled):hover {
                    transform: translateY(-2px);
                    box-shadow: 0 6px 20px rgba(32,114,206,0.32);
                }
                .ua-submit-btn:not(:disabled):active { transform: scale(0.97); }
                .ua-submit-btn:disabled { opacity: 0.42; cursor: not-allowed; box-shadow: none; }

                .ua-spin { animation: ua-rotate 0.75s linear infinite; }
                @keyframes ua-rotate { to { transform: rotate(360deg); } }

                @media (max-width: 390px) {
                    .ua-dropzone  { padding: 32px 16px; }
                    .ua-icon-wrap { width: 48px; height: 48px; }
                    .ua-submit-btn { padding: 12px; font-size: 0.855rem; }
                }
            `}</style>

            <div className="ua-wrap">
                {/* Drop zone */}
                <div
                    onDragEnter={handleDrag}
                    onDragOver={handleDrag}
                    onDragLeave={handleDrag}
                    onDrop={handleDrop}
                    onClick={() => inputRef.current?.click()}
                    className={`ua-dropzone${dragActive ? " drag-active" : ""}`}
                >
                    <input
                        ref={inputRef}
                        type="file"
                        accept={ACCEPTED_TYPES.join(",")}
                        multiple
                        onChange={(e) => e.target.files && addFiles(e.target.files)}
                        className="hidden"
                    />
                    <div className="ua-icon-wrap">
                        <Upload className="w-6 h-6" style={{ color: "#2072CE" }} strokeWidth={1.8} />
                    </div>
                    <div>
                        <p className="ua-drop-title">
                            <span className="hidden sm:inline">
                                Drop your bills here or <span className="ua-drop-link">browse</span>
                            </span>
                            <span className="sm:hidden">
                                <span className="ua-drop-link">Tap to browse</span> or select files
                            </span>
                        </p>
                        <p className="ua-drop-hint">JPEG, PNG, BMP or WebP · up to 10MB each</p>
                    </div>
                </div>

                {/* Error */}
                {error && (
                    <div className="ua-error">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        <span>{error}</span>
                    </div>
                )}

                {/* File list */}
                {files.length > 0 && (
                    <div className="ua-file-section">
                        <div className="ua-file-header">
                            <span className="ua-file-count">
                                {files.length} file{files.length > 1 ? "s" : ""} selected
                            </span>
                            <button
                                onClick={(e) => { e.stopPropagation(); clearAll(); }}
                                className="ua-clear-btn"
                            >
                                Clear all
                            </button>
                        </div>

                        <div className="ua-grid">
                            {files.map((f) => (
                                <div key={f.id} className="ua-file-card">
                                    <div className="ua-img-wrap">
                                        <img src={f.preview} alt={f.file.name} />
                                        <button
                                            onClick={(e) => { e.stopPropagation(); removeFile(f.id); }}
                                            className="ua-remove-btn"
                                        >
                                            <X className="w-3 h-3 text-white" />
                                        </button>
                                    </div>
                                    <div className="ua-file-meta">
                                        <p className="ua-file-name">{f.file.name}</p>
                                        <p className="ua-file-size">{(f.file.size / 1024).toFixed(0)} KB</p>
                                    </div>
                                </div>
                            ))}

                            {/* Add more tile */}
                            <div
                                onClick={() => inputRef.current?.click()}
                                className="ua-add-more"
                            >
                                <ImageIcon className="w-5 h-5" style={{ color: "#94a3b8" }} />
                                <span className="ua-add-more-label">Add more</span>
                            </div>
                        </div>

                        <button
                            onClick={handleSubmit}
                            disabled={loading || files.length === 0}
                            className="ua-submit-btn"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-4 h-4 ua-spin" />
                                    Parsing {files.length} bill{files.length > 1 ? "s" : ""}…
                                </>
                            ) : (
                                <>
                                    <Upload className="w-4 h-4" />
                                    Upload & Parse {files.length} bill{files.length > 1 ? "s" : ""}
                                </>
                            )}
                        </button>
                    </div>
                )}
            </div>
        </>
    );
}