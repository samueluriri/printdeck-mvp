import { useState } from "react";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "../firebase";

const Upload = () => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [url, setUrl] = useState("");

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

      // Create storage reference
      const storageRef = ref(storage, `uploads/${Date.now()}-${file.name}`);

      // Upload file
      await uploadBytes(storageRef, file);

      // Get file URL
      const downloadURL = await getDownloadURL(storageRef);

      setUrl(downloadURL);
      alert("Upload successful!");
    } catch (error) {
      console.error("Upload error:", error);
      alert("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Upload File</h2>

      <input type="file" onChange={handleFileChange} />

      <br /><br />

      <button onClick={handleUpload} disabled={uploading}>
        {uploading ? "Uploading..." : "Upload"}
      </button>

      {url && (
        <div style={{ marginTop: "20px" }}>
          <p>Uploaded File:</p>
          <a href={url} target="_blank" rel="noreferrer">
            View File
          </a>
        </div>
      )}
    </div>
  );
};

export default Upload;
