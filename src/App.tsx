import { useState } from "react";
import "./App.css";

type FormState = {
  weight: string;
  bodyFat: string;
  muscleMass: string;
  waterPercent: string;
  notes: string;
  loggedAt: string;
};

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
  const [form, setForm] = useState<FormState>(emptyForm());

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0] ?? null;

    setFile(f);
    setError("");
    setSuccess("");

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

    setTimeout(() => {
      setForm((prev) => ({
        ...prev,
        weight: "212.4",
        bodyFat: "24.8",
        muscleMass: "145.2",
        waterPercent: "52.1",
        notes: "auto-read (fake)",
      }));
      setIsReading(false);
    }, 800);
  }

  async function handleSave() {
    if (!form.weight) {
      setError("Weight required");
      return;
    }

    setIsSaving(true);
    setError("");
    setSuccess("");

    console.log("Saved:", form);

    setTimeout(() => {
      setSuccess("Saved!");
      clearCurrentEntry();
      setIsSaving(false);
    }, 500);
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
      </div>
    </div>
  );
}

function getNow() {
  const now = new Date();
  const offset = now.getTimezoneOffset() * 60000;
  return new Date(now.getTime() - offset).toISOString().slice(0, 16);
}
