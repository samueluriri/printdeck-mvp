import { useState, useCallback } from "react";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "../firebase";

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
      // Mock progress for better UX since uploadBytes doesn't give granular progress easily without uploadBytesResumable
      // We'll just animate it
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
    <div className="max-w-2xl mx-auto py-20 px-6">
      <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100">
        <div className="p-8 md:p-12">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-slate-900 mb-2">Upload Your Document</h2>
            <p className="text-slate-500">Supported formats: PDF, DOCX, PNG, JPG (Max 10MB)</p>
          </div>

          {!url ? (
            <div className="space-y-6">
              <div
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
                onDrop={onDrop}
                className={`relative border-2 border-dashed rounded-2xl p-10 text-center transition-all duration-300 ${isDragging
                    ? "border-indigo-500 bg-indigo-50 scale-[1.02]"
                    : file
                      ? "border-emerald-400 bg-emerald-50"
                      : "border-slate-300 hover:border-indigo-400 hover:bg-slate-50"
                  }`}
              >
                <input
                  type="file"
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />

                <div className="flex flex-col items-center justify-center space-y-4 pointer-events-none">
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl transition-colors ${file ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                    {file ? '✓' : '☁️'}
                  </div>
                  <div className="space-y-1">
                    <p className={`font-medium ${file ? 'text-emerald-700' : 'text-slate-700'}`}>
                      {file ? file.name : "Click to upload or drag and drop"}
                    </p>
                    {!file && <p className="text-sm text-slate-400">PDF, image or docs</p>}
                  </div>
                </div>
              </div>

              {uploading && (
                <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                  <div
                    className="bg-indigo-600 h-2.5 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
              )}

              <button
                onClick={handleUpload}
                disabled={uploading || !file}
                className={`w-full py-4 rounded-xl font-bold text-white shadow-lg transition-all transform ${uploading || !file
                    ? "bg-slate-300 cursor-not-allowed shadow-none"
                    : "bg-indigo-600 hover:bg-indigo-700 hover:-translate-y-1 hover:shadow-indigo-200"
                  }`}
              >
                {uploading ? "Uploading..." : "Proceed to Print Settings"}
              </button>
            </div>
          ) : (
            <div className="text-center space-y-6 animate-fade-in-up">
              <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center text-4xl mx-auto">
                🎉
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">File Uploaded Successfully!</h3>
                <p className="text-slate-500">Your file is ready for printing.</p>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 break-all text-sm text-slate-600">
                <a href={url} target="_blank" rel="noreferrer" className="hover:text-indigo-600 hover:underline">
                  View Uploaded File
                </a>
              </div>

              <button
                onClick={() => { setFile(null); setUrl(""); setProgress(0); }}
                className="text-indigo-600 font-medium hover:text-indigo-700 hover:underline"
              >
                Upload Another File
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Upload;
