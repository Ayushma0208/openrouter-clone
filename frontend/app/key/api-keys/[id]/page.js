"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";

const STORAGE_KEY = "openrouter_demo_api_keys";

function getKeys() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (_error) {
    return [];
  }
}

function saveKeys(keys) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(keys));
}

function formatDate(value) {
  if (!value) return "No expiration";
  return new Date(value).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false
  });
}

export default function ApiKeyDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [keyData, setKeyData] = useState(null);

  const [name, setName] = useState("");
  const [creditLimit, setCreditLimit] = useState("");
  const [resetLimit, setResetLimit] = useState("na");

  useEffect(() => {
    const keys = getKeys();
    const current = keys.find((item) => item.id === params.id);
    if (!current) return;
    setKeyData(current);
    setName(current.name || "");
    setCreditLimit(current.creditLimit === "unlimited" ? "" : current.creditLimit);
    setResetLimit(current.resetLimit || "na");
  }, [params.id]);

  const expiresText = useMemo(() => formatDate(keyData?.expiresAt), [keyData?.expiresAt]);

  const handleSave = () => {
    if (!keyData) return;
    const keys = getKeys();
    const updated = keys.map((item) =>
      item.id === keyData.id
        ? {
            ...item,
            name: name.trim() || item.name,
            creditLimit: creditLimit.trim() || "unlimited",
            resetLimit
          }
        : item
    );
    saveKeys(updated);
    const fresh = updated.find((item) => item.id === keyData.id);
    setKeyData(fresh || null);
  };

  const handleDisableEnable = () => {
    if (!keyData) return;
    const keys = getKeys();
    const updated = keys.map((item) =>
      item.id === keyData.id ? { ...item, enabled: !item.enabled } : item
    );
    saveKeys(updated);
    const fresh = updated.find((item) => item.id === keyData.id);
    setKeyData(fresh || null);
  };

  const handleDelete = () => {
    if (!keyData) return;
    const keys = getKeys();
    const updated = keys.filter((item) => item.id !== keyData.id);
    saveKeys(updated);
    router.push("/key/api-keys");
  };

  if (!keyData) {
    return (
      <main className="api-key-detail-page">
        <p className="detail-empty">Key not found.</p>
      </main>
    );
  }

  return (
    <main className="api-key-detail-page">
      <header className="detail-header">
        <button className="back-arrow" onClick={() => router.push("/key/api-keys")}>
          ←
        </button>
        <div>
          <h1>{keyData.name}</h1>
          <p>
            {keyData.maskedKey} • {formatDate(keyData.createdAt)}
          </p>
        </div>
        <span className="status-pill">{keyData.enabled ? "Enabled" : "Disabled"}</span>
      </header>

      <section className="detail-grid">
        <article className="detail-card">
          <h2>Edit</h2>
          <label>Name</label>
          <input value={name} onChange={(event) => setName(event.target.value)} />

          <label>Expiration</label>
          <input value={expiresText} readOnly />

          <label>Credit limit (optional)</label>
          <input
            value={creditLimit}
            onChange={(event) => setCreditLimit(event.target.value)}
            placeholder="Leave blank for unlimited"
          />

          <label>Reset limit every...</label>
          <select value={resetLimit} onChange={(event) => setResetLimit(event.target.value)}>
            <option value="na">N/A</option>
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
          </select>

          <button className="save-btn" onClick={handleSave}>
            Save
          </button>
        </article>

        <article className="detail-card">
          <h2>Overview</h2>
          <p className="overview-row">
            <span>Expires</span>
            <strong>{expiresText}</strong>
          </p>
          <p className="overview-row">
            <span>Last Used</span>
            <strong>{keyData.lastUsed || "Never"}</strong>
          </p>
          <p className="overview-row">
            <span>Total</span>
            <strong>${(keyData.usage || 0).toFixed(4)}</strong>
          </p>
          <p className="overview-row">
            <span>This Month</span>
            <strong>${(keyData.usage || 0).toFixed(4)}</strong>
          </p>
          <p className="overview-row">
            <span>Limit</span>
            <strong>{keyData.creditLimit || "unlimited"}</strong>
          </p>
        </article>
      </section>

      <section className="detail-card danger-zone">
        <p className="overview-row">
          <span>{keyData.enabled ? "Disable Key" : "Enable Key"}</span>
          <button className="danger-action-btn" onClick={handleDisableEnable}>
            {keyData.enabled ? "Disable" : "Enable"}
          </button>
        </p>
        <p className="overview-row">
          <span>Delete Key</span>
          <button className="danger-action-btn" onClick={handleDelete}>
            Delete
          </button>
        </p>
      </section>
    </main>
  );
}
