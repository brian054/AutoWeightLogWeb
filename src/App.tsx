import { useEffect, useState } from "react";
import "./App.css";

type FormState = {
  weight: string;
  bodyFat: string;
  muscleMass: string;
  waterPercent: string;
  notes: string;
  loggedAt: string;
};

const SHOW_DEBUG = false;

const emptyForm = (): FormState => ({
  weight: "",
  bodyFat: "",
  muscleMass: "",
  waterPercent: "",
  notes: "",
  loggedAt: getNow(),
});

export default function App() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState("");
  const [isReading, setIsReading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [form, setForm] = useState<FormState>(emptyForm());

  // Not really necessary for this, but just in case....free the old image if a new one is taken/selected.
  // prev behavior: if you 'use photo' but then upload a new one....you're stacking them on top of each other.
  // This should never be an issue but I wanna leave it here just in case.
  useEffect(() => {
    if (!preview) return;

    return () => {
      URL.revokeObjectURL(preview);
    };
  }, [preview]);

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0] ?? null;

    setFile(f);
    setError("");
    setSuccess("");
    setDebugInfo(null);

    if (!f) {
      setPreview("");
      return;
    }

    setPreview(URL.createObjectURL(f));
  }

  function update(key: keyof FormState, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function clearCurrentEntry() {
    setFile(null);
    setPreview("");
    setError("");
    setDebugInfo(null);
    setIsReading(false);
    setIsSaving(false);
    setForm(emptyForm());

    const fileInput = document.getElementById(
      "file-input",
    ) as HTMLInputElement | null;

    if (fileInput) {
      fileInput.value = "";
    }
  }

  async function handleRead() {
    if (!file) {
      setError("Upload a photo first");
      return;
    }

    setIsReading(true);
    setError("");
    setSuccess("");
    setDebugInfo(null);

    try {
      const base64 = await fileToBase64(file);

      const res = await fetch("/api/extractWeight", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          imageBase64: base64,
          mimeType: file.type,
        }),
      });

      const result = await res.json();

      console.log("DEBUG FROM API:", result.debug);
      setDebugInfo(result.debug ?? null);

      if (!res.ok) {
        console.error("Backend error:", result);
        throw new Error(result.error || "Backend request failed");
      }

      if (!result.success) {
        throw new Error(result.error || "Failed to read image");
      }

      const data = result.data;

      setForm((prev) => ({
        ...prev,
        weight: data.weight?.toString() ?? "",
        bodyFat: data.bodyFat?.toString() ?? "",
        muscleMass: data.muscleMass?.toString() ?? "",
        waterPercent: data.waterPercent?.toString() ?? "",
        notes: "auto-read",
      }));
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Something went wrong");
    } finally {
      setIsReading(false);
    }
  }

  async function handleSave() {
    if (!form.weight) {
      setError("Weight required");
      return;
    }

    setIsSaving(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch("/api/logWeight", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          loggedAt: form.loggedAt,
          weight: form.weight,
          bodyFat: form.bodyFat,
          muscleMass: form.muscleMass,
          notes: form.notes,
        }),
      });

      const result = await res.json();

      if (!res.ok || !result.success) {
        throw new Error(result.error || "Failed to save");
      }

      setSuccess("Saved!");
      clearCurrentEntry();
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to save");
    } finally {
      setIsSaving(false);
    }
  }

  const hasData =
    form.weight ||
    form.bodyFat ||
    form.muscleMass ||
    form.waterPercent ||
    form.notes;

  return (
    <div className="page">
      <div className="card">
        <h1 className="title">Weight Log</h1>
        <p className="subtitle">Photo → confirm → save</p>

        <label className="label" htmlFor="file-input">
          Take or upload photo
        </label>

        <input
          id="file-input"
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleFile}
          className="file-input"
        />

        {preview && (
          <div className="preview">
            <img src={preview} alt="Scale preview" />
          </div>
        )}

        <button
          className="button button-primary"
          onClick={handleRead}
          disabled={!file || isReading}
        >
          {isReading ? "Reading..." : "Read numbers"}
        </button>

        {hasData && (
          <>
            <div className="confirm-header">
              <div className="divider" />
              <button
                type="button"
                className="close-button"
                onClick={clearCurrentEntry}
                aria-label="Clear current entry"
                title="Clear current entry"
              >
                ×
              </button>
            </div>

            <div className="grid">
              <input
                className="input"
                placeholder="Weight"
                value={form.weight}
                onChange={(e) => update("weight", e.target.value)}
              />
              <input
                className="input"
                placeholder="Body Fat %"
                value={form.bodyFat}
                onChange={(e) => update("bodyFat", e.target.value)}
              />
              <input
                className="input"
                placeholder="Muscle Mass"
                value={form.muscleMass}
                onChange={(e) => update("muscleMass", e.target.value)}
              />
              <input
                className="input"
                placeholder="Water %"
                value={form.waterPercent}
                onChange={(e) => update("waterPercent", e.target.value)}
              />
            </div>

            <label className="label">Date</label>
            <input
              type="datetime-local"
              className="input"
              value={form.loggedAt}
              onChange={(e) => update("loggedAt", e.target.value)}
            />

            <label className="label">Notes</label>
            <textarea
              className="textarea"
              rows={3}
              value={form.notes}
              onChange={(e) => update("notes", e.target.value)}
            />

            <button
              className="button button-success"
              onClick={handleSave}
              disabled={isSaving}
            >
              {isSaving ? "Saving..." : "Confirm & Save"}
            </button>
          </>
        )}

        {error && <p className="error">{error}</p>}
        {success && <p className="success">{success}</p>}

        {SHOW_DEBUG && debugInfo && (
          <pre className="debug-box">{JSON.stringify(debugInfo, null, 2)}</pre>
        )}
      </div>
    </div>
  );
}

function getNow() {
  const now = new Date();
  const offset = now.getTimezoneOffset() * 60000;
  return new Date(now.getTime() - offset).toISOString().slice(0, 16);
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      const result = reader.result;
      if (typeof result !== "string") {
        reject(new Error("Failed to read file"));
        return;
      }

      resolve(result.split(",")[1]);
    };

    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
