import { useState, useCallback } from "react";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "../firebase";
import { CloudUpload, FileCheck, ExternalLink, RefreshCw, X, Loader2, FileUp } from 'lucide-react';

const Upload = () => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [url, setUrl] = useState("");
  const [isDragging, setIsDragging] = useState(false);

  const onDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const onDragLeave = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const onDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  }, []);

  const handleFileChange = (e) => {
    if (e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      alert("Please select a file first");
      return;
    }

    try {
      setUploading(true);
      // Mock progress for better UX
      let p = 0;
      const interval = setInterval(() => {
        p += 10;
        if (p > 90) clearInterval(interval);
        setProgress(p);
      }, 200);

      const storageRef = ref(storage, `uploads/${Date.now()}-${file.name}`);
      await uploadBytes(storageRef, file);

      clearInterval(interval);
      setProgress(100);

      const downloadURL = await getDownloadURL(storageRef);
      setUrl(downloadURL);
    } catch (error) {
      console.error("Upload error:", error);
      alert("Upload failed");
      setProgress(0);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-20 px-6 animate-fade-in-up">
      <div className="bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-zinc-100 group">
        <div className="p-8 md:p-14 relative">
          <div className="absolute top-0 right-0 w-64 h-64 bg-zinc-50 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none opacity-50"></div>

          <div className="text-center mb-10 relative z-10">
            <h2 className="text-4xl font-display font-bold text-zinc-900 mb-3 tracking-tight">Upload Credentials</h2>
            <p className="text-zinc-500 font-mono-tech text-xs uppercase tracking-widest">Supported formats: PDF, DOCX, PNG, JPG (Max 10MB)</p>
          </div>

          {!url ? (
            <div className="space-y-8 relative z-10">
              <div
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
                onDrop={onDrop}
                className={`relative border-2 border-dashed rounded-[2rem] p-12 text-center transition-all duration-300 group/dropzone ${isDragging
                  ? "border-zinc-900 bg-zinc-50 scale-[1.02]"
                  : file
                    ? "border-emerald-500 bg-emerald-50/30"
                    : "border-zinc-200 hover:border-zinc-400 hover:bg-zinc-50/50"
                  }`}
              >
                <input
                  type="file"
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />

                <div className="flex flex-col items-center justify-center space-y-6 pointer-events-none">
                  <div className={`w-20 h-20 rounded-2xl flex items-center justify-center transition-all duration-300 shadow-sm ${file ? 'bg-emerald-100 text-emerald-600 rotate-0' : 'bg-white border border-zinc-100 text-zinc-400 group-hover/dropzone:scale-110 group-hover/dropzone:-rotate-6'}`}>
                    {file ? <FileCheck size={40} strokeWidth={1.5} /> : <FileUp size={40} strokeWidth={1.5} />}
                  </div>
                  <div className="space-y-2">
                    <p className={`font-display font-bold text-lg ${file ? 'text-emerald-700' : 'text-zinc-900'}`}>
                      {file ? file.name : "Drop file here or click to browse"}
                    </p>
                    {!file && <p className="text-xs font-mono-tech text-zinc-400 uppercase tracking-wider">Secure Transmission Protocol</p>}
                  </div>
                </div>
              </div>

              {uploading && (
                <div className="w-full bg-zinc-100 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-zinc-900 h-2 rounded-full transition-all duration-300 relative overflow-hidden"
                    style={{ width: `${progress}%` }}
                  >
                    <div className="absolute inset-0 bg-white/20 animate-[scan_1s_linear_infinite]"></div>
                  </div>
                </div>
              )}

              <button
                onClick={handleUpload}
                disabled={uploading || !file}
                className={`w-full py-5 rounded-2xl font-mono-tech font-bold text-xs uppercase tracking-widest shadow-xl transition-all transform flex items-center justify-center gap-2 ${uploading || !file
                  ? "bg-zinc-200 text-zinc-400 cursor-not-allowed shadow-none"
                  : "bg-zinc-900 text-white hover:bg-black hover:-translate-y-1 hover:shadow-2xl"
                  }`}
              >
                {uploading ? <><Loader2 className="animate-spin" size={16} /> Processing...</> : "Begin Transmission"}
              </button>
            </div>
          ) : (
            <div className="text-center space-y-8 animate-fade-in-up relative z-10">
              <div className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner mb-6">
                <FileCheck size={48} strokeWidth={1.5} />
              </div>
              <div>
                <h3 className="text-2xl font-display font-bold text-zinc-900 mb-2">Upload Successful</h3>
                <p className="text-zinc-500 font-mono-tech text-xs uppercase tracking-widest">File is ready for processing node</p>
              </div>

              <div className="p-4 bg-zinc-50 rounded-xl border border-zinc-200 break-all text-sm font-mono text-zinc-600 flex items-center justify-between gap-4">
                <span className="truncate opacity-70">{url}</span>
                <a href={url} target="_blank" rel="noreferrer" className="text-zinc-900 hover:text-emerald-600 transition flex-shrink-0">
                  <ExternalLink size={18} />
                </a>
              </div>

              <button
                onClick={() => { setFile(null); setUrl(""); setProgress(0); }}
                className="text-zinc-400 font-mono-tech text-xs font-bold uppercase tracking-widest hover:text-zinc-900 transition flex items-center justify-center gap-2 mx-auto"
              >
                <RefreshCw size={14} /> Reset Uploader
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Upload;
