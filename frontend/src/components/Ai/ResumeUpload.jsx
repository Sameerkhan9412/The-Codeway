import React, { useState } from "react";
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf";
import workerSrc from "pdfjs-dist/legacy/build/pdf.worker?url";
import axiosClient from "../../utils/axiosClient";

pdfjsLib.GlobalWorkerOptions.workerSrc = workerSrc;

const ResumeUpload = ({ onFirstQuestion }) => {
  const [loading, setLoading] = useState(false);
  const [fileName, setFileName] = useState("");

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file || file.type !== "application/pdf") {
      alert("Please upload a valid PDF.");
      return;
    }

    setFileName(file.name);
    setLoading(true);

    const reader = new FileReader();
    reader.onload = async function () {
      try {
        const pdf = await pdfjsLib.getDocument({ data: new Uint8Array(this.result) }).promise;
        let text = "";

        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const content = await page.getTextContent();
          text += content.items.map((s) => s.str).join(" ") + "\n";
        }

        sendResumeToBackend(text);
      } catch (err) {
        console.error("❌ Error reading PDF", err);
        alert("Failed to read PDF.");
        setLoading(false);
      }
    };

    reader.readAsArrayBuffer(file);
  };

  const sendResumeToBackend = async (resumeText) => {
    try {
      const res = await axiosClient.post("/api/ai/start", { resume: resumeText });
      const { question } = res.data;
      onFirstQuestion(question);
    } catch (err) {
      alert("Backend failed to respond");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h3>📄 Upload Resume (PDF)</h3>
      <input type="file" accept="application/pdf" onChange={handleFileChange} />
      {fileName && <p>✅ Uploaded: {fileName}</p>}
      {loading && <p>🧠 Extracting and analyzing resume...</p>}
    </div>
  );
};

export default ResumeUpload;
