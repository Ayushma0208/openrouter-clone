"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

const EXPIRATION_OPTIONS = [
  { label: "No expiration", value: "none" },
  { label: "1 hour", value: "1h", ms: 1 * 60 * 60 * 1000 },
  { label: "1 day", value: "1d", ms: 1 * 24 * 60 * 60 * 1000 },
  { label: "7 days", value: "7d", ms: 7 * 24 * 60 * 60 * 1000 },
  { label: "30 days", value: "30d", ms: 30 * 24 * 60 * 60 * 1000 },
  { label: "90 days", value: "90d", ms: 90 * 24 * 60 * 60 * 1000 },
  { label: "180 days", value: "180d", ms: 180 * 24 * 60 * 60 * 1000 },
  { label: "1 year", value: "1y", ms: 365 * 24 * 60 * 60 * 1000 }
];

function generateApiKey() {
  const randomHex = Array.from(crypto.getRandomValues(new Uint8Array(24)))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
  return `sk-or-v1-${randomHex}`;
}

const STORAGE_KEY = "openrouter_demo_api_keys";

function getKeysFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (_error) {
    return [];
  }
}

function saveKeysToStorage(keys) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(keys));
}

function maskKey(fullKey) {
  return `${fullKey.slice(0, 12)}...${fullKey.slice(-3)}`;
}

function formatExpiryDistance(timestamp) {
  if (!timestamp) return "No expiration";
  const diff = timestamp - Date.now();
  if (diff <= 0) return "Expired";
  const days = Math.ceil(diff / (24 * 60 * 60 * 1000));
  if (days <= 1) return "In 1 day";
  if (days < 30) return `In ${days} days`;
  const months = Math.round(days / 30);
  return `In ${months} months`;
}

export default function ApiKeysPage() {
  const router = useRouter();
  const [apiKeys, setApiKeys] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [search, setSearch] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isResultOpen, setIsResultOpen] = useState(false);
  const [createdKey, setCreatedKey] = useState("");

  const [name, setName] = useState("");
  const [creditLimit, setCreditLimit] = useState("");
  const [resetLimit, setResetLimit] = useState("na");
  const [expiration, setExpiration] = useState("none");

  const selectedExpiration = useMemo(
    () => EXPIRATION_OPTIONS.find((option) => option.value === expiration),
    [expiration]
  );

  useEffect(() => {
    setApiKeys(getKeysFromStorage());
  }, []);

  const filteredKeys = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return apiKeys;
    return apiKeys.filter((item) => item.name.toLowerCase().includes(term));
  }, [apiKeys, search]);

  const allFilteredSelected =
    filteredKeys.length > 0 && filteredKeys.every((item) => selectedIds.includes(item.id));

  const expiryPreview = useMemo(() => {
    if (!selectedExpiration?.ms) return "";
    const expiryDate = new Date(Date.now() + selectedExpiration.ms);
    return expiryDate.toLocaleString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false
    });
  }, [selectedExpiration]);

  const handleCreate = () => {
    if (!name.trim()) return;
    const newKey = generateApiKey();
    const now = Date.now();
    const newEntry = {
      id: crypto.randomUUID(),
      name: name.trim(),
      fullKey: newKey,
      maskedKey: maskKey(newKey),
      createdAt: now,
      expiresAt: selectedExpiration?.ms ? now + selectedExpiration.ms : null,
      creditLimit: creditLimit.trim() || "unlimited",
      resetLimit,
      enabled: true,
      usage: 0,
      lastUsed: "Never"
    };
    const updatedKeys = [newEntry, ...apiKeys];
    setApiKeys(updatedKeys);
    saveKeysToStorage(updatedKeys);
    setCreatedKey(newKey);
    setIsCreateOpen(false);
    setIsResultOpen(true);
    resetForm();
  };

  const resetForm = () => {
    setName("");
    setCreditLimit("");
    setResetLimit("na");
    setExpiration("none");
  };

  const closeAllModals = () => {
    setIsCreateOpen(false);
    setIsResultOpen(false);
    resetForm();
  };

  const copyKey = async () => {
    try {
      await navigator.clipboard.writeText(createdKey);
    } catch (_error) {
      // Keep silent; key remains visible to copy manually.
    }
  };

  const toggleSelectOne = (id) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
  };

  const toggleSelectAllFiltered = () => {
    if (allFilteredSelected) {
      const filteredIdSet = new Set(filteredKeys.map((item) => item.id));
      setSelectedIds((prev) => prev.filter((id) => !filteredIdSet.has(id)));
      return;
    }

    setSelectedIds((prev) => {
      const merged = new Set(prev);
      filteredKeys.forEach((item) => merged.add(item.id));
      return Array.from(merged);
    });
  };

  const handleBulkDelete = () => {
    if (selectedIds.length === 0) return;
    const selectedSet = new Set(selectedIds);
    const updatedKeys = apiKeys.filter((item) => !selectedSet.has(item.id));
    setApiKeys(updatedKeys);
    saveKeysToStorage(updatedKeys);
    setSelectedIds([]);
  };

  const handleBulkDisable = () => {
    if (selectedIds.length === 0) return;
    const selectedSet = new Set(selectedIds);
    const updatedKeys = apiKeys.map((item) =>
      selectedSet.has(item.id) ? { ...item, enabled: false } : item
    );
    setApiKeys(updatedKeys);
    saveKeysToStorage(updatedKeys);
    setSelectedIds([]);
  };

  return (
    <main className="api-keys-page">
      <aside className="api-keys-sidebar" />
      <section className="api-keys-content">
        <header className="api-keys-header">
          <div>
            <h1>API Keys</h1>
            <p>Create and manage your API keys.</p>
          </div>
          <button className="api-top-back-btn" onClick={() => router.push("/dashboard")}>
            Back to Dashboard
          </button>
        </header>

        {apiKeys.length > 0 ? (
          <div className="api-keys-toolbar">
            <p>Manage your keys to access all models</p>
            <div className="api-keys-toolbar-right">
              <input
                className="api-search"
                placeholder="Search by name..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
              <button className="key-primary-btn" onClick={() => setIsCreateOpen(true)}>
                Create
              </button>
            </div>
          </div>
        ) : null}

        {selectedIds.length > 0 ? (
          <div className="selection-toolbar">
            <span>{selectedIds.length} selected</span>
            <div className="selection-actions">
              <button className="selection-disable-btn" onClick={handleBulkDisable}>
                Disable
              </button>
              <button className="selection-delete-btn" onClick={handleBulkDelete}>
                Delete
              </button>
            </div>
          </div>
        ) : null}

        {filteredKeys.length === 0 ? (
          <div className="api-keys-empty">
            <div className="api-icon">🔑</div>
            <h2>No API keys yet</h2>
            <p>Create your first API key to start using OpenRouter</p>
            <button className="key-primary-btn" onClick={() => setIsCreateOpen(true)}>
              Create
            </button>
          </div>
        ) : (
          <div className="keys-table-wrap">
            <div className="keys-table keys-table-head">
              <span className="check-col">
                <input type="checkbox" checked={allFilteredSelected} onChange={toggleSelectAllFiltered} />
              </span>
              <span>Key</span>
              <span>Guardrails</span>
              <span>Expires</span>
              <span>Last Used</span>
              <span>Usage</span>
              <span>Limit</span>
            </div>
            {filteredKeys.map((item) => (
              <div
                key={item.id}
                className="keys-table keys-table-row"
                onClick={() => router.push(`/key/api-keys/${item.id}`)}
              >
                <span className="check-col" onClick={(event) => event.stopPropagation()}>
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(item.id)}
                    onChange={() => toggleSelectOne(item.id)}
                  />
                </span>
                <span className="key-cell">
                  <strong>{item.name}</strong>
                  <small>{item.maskedKey}</small>
                </span>
                <span className="guardrails">Account • Workspace</span>
                <span className={formatExpiryDistance(item.expiresAt).includes("7 days") ? "warn" : ""}>
                  {formatExpiryDistance(item.expiresAt)}
                </span>
                <span>{item.lastUsed}</span>
                <span>${item.usage.toFixed(3)}</span>
                <span className="limit-cell">{item.creditLimit}</span>
              </div>
            ))}
          </div>
        )}
      </section>

      {isCreateOpen ? (
        <div className="modal-overlay">
          <div className="create-key-modal">
            <button className="modal-close" onClick={closeAllModals}>
              x
            </button>
            <h3>Name</h3>
            <input
              className="modal-input"
              placeholder='e.g. "Chatbot Key"'
              value={name}
              onChange={(event) => setName(event.target.value)}
            />

            <h3>Credit limit (optional)</h3>
            <input
              className="modal-input"
              placeholder="Leave blank for unlimited"
              value={creditLimit}
              onChange={(event) => setCreditLimit(event.target.value)}
            />

            <h3>Reset limit every...</h3>
            <select
              className="modal-select"
              value={resetLimit}
              onChange={(event) => setResetLimit(event.target.value)}
            >
              <option value="na">N/A</option>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>

            <h3>Expiration</h3>
            <select
              className="modal-select"
              value={expiration}
              onChange={(event) => setExpiration(event.target.value)}
            >
              {EXPIRATION_OPTIONS.map((option) => (
                <option value={option.value} key={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            {expiryPreview ? <p className="expiry-preview">Key will expire on: {expiryPreview}</p> : null}

            <div className="modal-actions">
              <button className="modal-create-btn" disabled={!name.trim()} onClick={handleCreate}>
                Create
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {isResultOpen ? (
        <div className="modal-overlay">
          <div className="result-key-modal">
            <button className="modal-close" onClick={closeAllModals}>
              x
            </button>
            <h3>Your new key:</h3>
            <div className="result-key-row">
              <code>{createdKey}</code>
              <button className="copy-btn" onClick={copyKey}>
                Copy
              </button>
            </div>
            <p>Please copy it now and write it down somewhere safe. You will not be able to see it again.</p>
          </div>
        </div>
      ) : null}
    </main>
  );
}
