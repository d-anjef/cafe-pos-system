import { useState, useRef } from "react";
import api from "../services/api";
import {
  Upload, X, Sparkles, CheckCircle2, AlertCircle,
  Loader, Image as ImageIcon, Trash2, Edit2, ChevronDown, ChevronRight
} from "lucide-react";
import { showSuccess, showError } from "../utils/toast";

export default function MenuAiUpload({ onClose, onSuccess }) {
  const [step, setStep] = useState("upload"); // upload | processing | review | importing | success
  const [imagePreview, setImagePreview] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [extracted, setExtracted] = useState(null);
  const [importStats, setImportStats] = useState(null);
  const [error, setError] = useState("");
  const [expandedCats, setExpandedCats] = useState({});
  const fileInputRef = useRef(null);

  // ============================================================
  // STEP 1: Handle Image Selection
  // ============================================================
  const handleFileSelect = (file) => {
    if (!file) return;

    // Validate
    const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!validTypes.includes(file.type)) {
      showError("Please upload a JPG, PNG, or WebP image");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      showError("Image too large. Max 10 MB.");
      return;
    }

    setImageFile(file);

    // Show preview
    const reader = new FileReader();
    reader.onload = (e) => setImagePreview(e.target.result);
    reader.readAsDataURL(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    handleFileSelect(file);
  };

  // ============================================================
  // STEP 2: Upload to Backend → Gemini
  // ============================================================
  const handleProcess = async () => {
    if (!imageFile) {
      showError("Please select an image first");
      return;
    }

    setStep("processing");
    setError("");

    try {
      const formData = new FormData();
      formData.append("menuImage", imageFile);

      const res = await api.post("/menu-ai/parse", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        timeout: 60000 // 60 second timeout for AI
      });

      if (res.data.success) {
        const data = res.data.data;

        // Initialize all items as "selected"
        const withSelection = {
          ...data,
          categories: data.categories.map(cat => ({
            ...cat,
            items: cat.items.map(item => ({ ...item, selected: true }))
          }))
        };

        setExtracted(withSelection);

        // Auto-expand all categories
        const expanded = {};
        data.categories.forEach((cat, i) => {
          expanded[i] = true;
        });
        setExpandedCats(expanded);

        setStep("review");
      } else {
        throw new Error(res.data.message || "Failed to process image");
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || err.message || "Processing failed");
      setStep("upload");
      showError(err.response?.data?.message || "Failed to process image");
    }
  };

  // ============================================================
  // STEP 3: Toggle Item Selection
  // ============================================================
  const toggleItem = (catIdx, itemIdx) => {
    const updated = { ...extracted };
    updated.categories[catIdx].items[itemIdx].selected =
      !updated.categories[catIdx].items[itemIdx].selected;
    setExtracted(updated);
  };

  const toggleCategory = (catIdx) => {
    setExpandedCats({ ...expandedCats, [catIdx]: !expandedCats[catIdx] });
  };

  const toggleAllInCategory = (catIdx, value) => {
    const updated = { ...extracted };
    updated.categories[catIdx].items.forEach(item => { item.selected = value; });
    setExtracted(updated);
  };

  const updateItem = (catIdx, itemIdx, field, value) => {
    const updated = { ...extracted };
    updated.categories[catIdx].items[itemIdx][field] = value;
    setExtracted(updated);
  };

  const removeItem = (catIdx, itemIdx) => {
    const updated = { ...extracted };
    updated.categories[catIdx].items.splice(itemIdx, 1);
    setExtracted(updated);
  };

  // ============================================================
  // STEP 4: Import to Database
  // ============================================================
  const handleImport = async () => {
    setStep("importing");

    try {
      // Filter only selected items
      const toImport = {
        categories: extracted.categories
          .map(cat => ({
            ...cat,
            items: cat.items.filter(i => i.selected)
          }))
          .filter(cat => cat.items.length > 0)
      };

      const totalItems = toImport.categories.reduce(
        (sum, cat) => sum + cat.items.length, 0
      );

      if (totalItems === 0) {
        showError("Select at least one item to import");
        setStep("review");
        return;
      }

      const res = await api.post("/menu-ai/import", toImport);

      if (res.data.success) {
        setImportStats(res.data.stats);
        setStep("success");
        showSuccess(`Imported ${res.data.stats.itemsCreated} items!`);
      }
    } catch (err) {
      console.error(err);
      showError(err.response?.data?.message || "Import failed");
      setStep("review");
    }
  };

  // ============================================================
  // STEP 5: Done — Refresh parent + close
  // ============================================================
  const handleDone = () => {
    onSuccess?.();
    onClose();
  };

  // ============================================================
  // COUNTERS
  // ============================================================
  const totalSelected = extracted?.categories?.reduce(
    (sum, cat) => sum + cat.items.filter(i => i.selected).length, 0
  ) || 0;

  const totalItems = extracted?.categories?.reduce(
    (sum, cat) => sum + cat.items.length, 0
  ) || 0;

  // ============================================================
  // CONFIDENCE COLOR
  // ============================================================
  const getConfidenceColor = (conf) => {
    if (conf >= 0.85) return "#4caf50";
    if (conf >= 0.65) return "#ff9800";
    return "#e53935";
  };

  return (
    <div className="settlement-overlay" onClick={step !== "processing" && step !== "importing" ? onClose : undefined}>
      <div
        className="settlement-modal glass-card"
        style={{
          maxWidth: 720,
          maxHeight: "90vh",
          overflowY: "auto",
          width: "95vw"
        }}
        onClick={e => e.stopPropagation()}
      >

        {/* HEADER */}
        <div className="settlement-header">
          <div>
            <h2 style={{ margin: 0, display: "flex", alignItems: "center", gap: 8 }}>
              <Sparkles size={20} color="#d4af37" />
              AI Menu Upload
            </h2>
            <p style={{ margin: "4px 0 0", fontSize: 13, opacity: 0.6 }}>
              Powered by Google Gemini AI
            </p>
          </div>
          {step !== "processing" && step !== "importing" && (
            <button className="settlement-close" onClick={onClose}>✕</button>
          )}
        </div>

        {/* ============================================
            STEP 1: UPLOAD
        ============================================ */}
        {step === "upload" && (
          <div style={{ padding: "12px 0" }}>

            {/* DROP ZONE */}
            <div
              onClick={() => fileInputRef.current?.click()}
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              style={{
                border: imagePreview ? "2px solid #d4af37" : "2px dashed rgba(212,175,55,0.4)",
                borderRadius: 14,
                padding: imagePreview ? 16 : 48,
                textAlign: "center",
                cursor: "pointer",
                background: imagePreview ? "transparent" : "rgba(212,175,55,0.04)",
                transition: "all 0.2s"
              }}
            >
              {imagePreview ? (
                <div>
                  <img
                    src={imagePreview}
                    alt="Menu preview"
                    style={{
                      maxWidth: "100%",
                      maxHeight: 320,
                      borderRadius: 10,
                      display: "block",
                      margin: "0 auto"
                    }}
                  />
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setImagePreview(null);
                      setImageFile(null);
                    }}
                    style={{
                      marginTop: 12,
                      padding: "6px 14px",
                      background: "transparent",
                      border: "1px solid var(--border-soft)",
                      borderRadius: 6,
                      cursor: "pointer",
                      fontSize: 12,
                      color: "#e53935",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 4
                    }}
                  >
                    <Trash2 size={12} /> Remove
                  </button>
                </div>
              ) : (
                <>
                  <Upload size={48} style={{ opacity: 0.4, marginBottom: 12 }} />
                  <h3 style={{ margin: "0 0 6px 0", fontSize: 18 }}>
                    Drop menu image here
                  </h3>
                  <p style={{ margin: 0, fontSize: 13, opacity: 0.6 }}>
                    or click to browse
                  </p>
                  <p style={{ margin: "12px 0 0", fontSize: 11, opacity: 0.5 }}>
                    JPG, PNG, WebP · Max 10 MB
                  </p>
                </>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                onChange={(e) => handleFileSelect(e.target.files[0])}
                style={{ display: "none" }}
              />
            </div>

            {/* TIPS */}
            <div style={{
              marginTop: 16,
              padding: 14,
              background: "rgba(33,150,243,0.08)",
              border: "1px solid rgba(33,150,243,0.2)",
              borderRadius: 10,
              fontSize: 12
            }}>
              <strong style={{ color: "#2196f3", display: "block", marginBottom: 6 }}>
                💡 Tips for best results
              </strong>
              <ul style={{ margin: 0, paddingLeft: 20, lineHeight: 1.7, opacity: 0.8 }}>
                <li>Use a clear, well-lit photo of a printed menu</li>
                <li>Make sure prices are clearly visible</li>
                <li>Avoid blurry, tilted, or shadowy images</li>
                <li>One page at a time works best</li>
                <li>English text works best (Nepali/mixed also supported)</li>
              </ul>
            </div>

            {/* ACTIONS */}
            <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
              <button onClick={onClose} style={{ flex: 1, padding: 12 }}>
                Cancel
              </button>
              <button
                className="gold-btn"
                onClick={handleProcess}
                disabled={!imageFile}
                style={{ flex: 2, padding: 12, opacity: imageFile ? 1 : 0.5 }}
              >
                <Sparkles size={14} /> Extract Menu with AI
              </button>
            </div>
          </div>
        )}

        {/* ============================================
            STEP 2: PROCESSING
        ============================================ */}
        {step === "processing" && (
          <div style={{ padding: 60, textAlign: "center" }}>
            <div style={{
              width: 80,
              height: 80,
              margin: "0 auto 24px",
              borderRadius: "50%",
              background: "rgba(212,175,55,0.15)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}>
              <Sparkles size={36} color="#d4af37" style={{
                animation: "pulse 1.5s ease-in-out infinite"
              }} />
            </div>

            <h3 style={{ margin: "0 0 8px", fontSize: 20 }}>
              AI is reading your menu...
            </h3>
            <p style={{ margin: 0, opacity: 0.6, fontSize: 14 }}>
              This usually takes 10-30 seconds
            </p>

            <div style={{
              marginTop: 32,
              height: 4,
              background: "rgba(212,175,55,0.1)",
              borderRadius: 4,
              overflow: "hidden"
            }}>
              <div style={{
                height: "100%",
                width: "30%",
                background: "linear-gradient(90deg, transparent, #d4af37, transparent)",
                animation: "shimmer 1.5s linear infinite"
              }} />
            </div>

            <style>{`
              @keyframes pulse {
                0%, 100% { opacity: 1; transform: scale(1); }
                50% { opacity: 0.6; transform: scale(0.95); }
              }
              @keyframes shimmer {
                0% { transform: translateX(-100%); }
                100% { transform: translateX(400%); }
              }
            `}</style>

            <div style={{
              marginTop: 32,
              padding: 12,
              background: "rgba(33,150,243,0.08)",
              borderRadius: 8,
              fontSize: 12,
              color: "#2196f3"
            }}>
              💡 Tip: Larger menus take longer to process
            </div>
          </div>
        )}

        {/* ============================================
            STEP 3: REVIEW
        ============================================ */}
        {step === "review" && extracted && (
          <div style={{ padding: "12px 0" }}>

            {/* SUMMARY */}
            <div style={{
              padding: 14,
              background: "rgba(76,175,80,0.08)",
              border: "1px solid rgba(76,175,80,0.2)",
              borderRadius: 10,
              marginBottom: 16
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
                <div>
                  <strong style={{ color: "#4caf50" }}>
                    ✅ Found {totalItems} items in {extracted.categories.length} categories
                  </strong>
                  <p style={{ margin: "4px 0 0", fontSize: 12, opacity: 0.7 }}>
                    Review and uncheck items you don't want to import
                  </p>
                </div>
                <div style={{
                  background: "#d4af37",
                  color: "white",
                  padding: "6px 14px",
                  borderRadius: 20,
                  fontWeight: 700,
                  fontSize: 13
                }}>
                  {totalSelected} / {totalItems} selected
                </div>
              </div>
            </div>

            {/* CATEGORIES */}
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {extracted.categories.map((cat, catIdx) => {
                const expanded = expandedCats[catIdx];
                const selectedInCat = cat.items.filter(i => i.selected).length;

                return (
                  <div key={catIdx} className="glass-card" style={{ padding: 0, overflow: "hidden" }}>

                    {/* CATEGORY HEADER */}
                    <div
                      onClick={() => toggleCategory(catIdx)}
                      style={{
                        padding: "12px 16px",
                        background: "rgba(212,175,55,0.08)",
                        cursor: "pointer",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        gap: 10
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 10, flex: 1 }}>
                        {expanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                        <span style={{ fontSize: 22 }}>{cat.icon}</span>
                        <div>
                          <strong>{cat.name}</strong>
                          <div style={{ fontSize: 11, opacity: 0.6 }}>
                            {selectedInCat} / {cat.items.length} selected
                          </div>
                        </div>
                      </div>

                      <div style={{ display: "flex", gap: 6 }}>
                        <button
                          onClick={(e) => { e.stopPropagation(); toggleAllInCategory(catIdx, true); }}
                          style={smallBtn}
                          title="Select all in this category"
                        >
                          All
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); toggleAllInCategory(catIdx, false); }}
                          style={smallBtn}
                          title="Deselect all in this category"
                        >
                          None
                        </button>
                      </div>
                    </div>

                    {/* CATEGORY ITEMS */}
                    {expanded && (
                      <div style={{ padding: 8 }}>
                        {cat.items.map((item, itemIdx) => (
                          <div
                            key={itemIdx}
                            style={{
                              padding: 10,
                              borderRadius: 8,
                              marginBottom: 4,
                              background: item.selected ? "rgba(212,175,55,0.05)" : "transparent",
                              border: `1px solid ${item.selected ? "rgba(212,175,55,0.2)" : "transparent"}`,
                              display: "flex",
                              alignItems: "center",
                              gap: 10,
                              flexWrap: "wrap"
                            }}
                          >
                            <input
                              type="checkbox"
                              checked={item.selected}
                              onChange={() => toggleItem(catIdx, itemIdx)}
                              style={{ cursor: "pointer", width: 16, height: 16 }}
                            />

                            <div style={{ flex: 1, minWidth: 180 }}>
                              <input
                                value={item.name}
                                onChange={(e) => updateItem(catIdx, itemIdx, "name", e.target.value)}
                                style={{
                                  width: "100%",
                                  padding: "6px 10px",
                                  borderRadius: 6,
                                  border: "1px solid var(--border-soft)",
                                  background: "var(--bg-card)",
                                  fontSize: 13,
                                  fontWeight: 600
                                }}
                              />
                              {item.description && (
                                <div style={{ fontSize: 11, opacity: 0.6, marginTop: 4 }}>
                                  {item.description}
                                </div>
                              )}
                            </div>

                            <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                              <span style={{ fontSize: 12, opacity: 0.6 }}>NPR</span>
                              <input
                                type="number"
                                value={item.price}
                                onChange={(e) => updateItem(catIdx, itemIdx, "price", e.target.value)}
                                style={{
                                  width: 80,
                                  padding: "6px 10px",
                                  borderRadius: 6,
                                  border: "1px solid var(--border-soft)",
                                  background: "var(--bg-card)",
                                  fontSize: 13,
                                  textAlign: "right"
                                }}
                              />
                            </div>

                            {item.confidence !== undefined && (
                              <div
                                title={`AI confidence: ${(item.confidence * 100).toFixed(0)}%`}
                                style={{
                                  padding: "2px 8px",
                                  borderRadius: 10,
                                  fontSize: 10,
                                  fontWeight: 700,
                                  background: `${getConfidenceColor(item.confidence)}22`,
                                  color: getConfidenceColor(item.confidence)
                                }}
                              >
                                {(item.confidence * 100).toFixed(0)}%
                              </div>
                            )}

                            <button
                              onClick={() => removeItem(catIdx, itemIdx)}
                              style={{
                                background: "transparent",
                                border: "none",
                                color: "#e53935",
                                cursor: "pointer",
                                padding: 4
                              }}
                              title="Remove this item"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* ACTIONS */}
            <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
              <button onClick={() => setStep("upload")} style={{ flex: 1, padding: 12 }}>
                ← Re-upload
              </button>
              <button
                className="gold-btn"
                onClick={handleImport}
                disabled={totalSelected === 0}
                style={{ flex: 2, padding: 12, opacity: totalSelected === 0 ? 0.5 : 1 }}
              >
                Import {totalSelected} Items →
              </button>
            </div>
          </div>
        )}

        {/* ============================================
            STEP 4: IMPORTING
        ============================================ */}
        {step === "importing" && (
          <div style={{ padding: 60, textAlign: "center" }}>
            <Loader size={48} color="#d4af37" style={{
              animation: "spin 1s linear infinite",
              marginBottom: 24
            }} />
            <h3 style={{ margin: "0 0 8px" }}>Importing items...</h3>
            <p style={{ margin: 0, opacity: 0.6, fontSize: 13 }}>
              Creating categories and menu items
            </p>
            <style>{`
              @keyframes spin {
                to { transform: rotate(360deg); }
              }
            `}</style>
          </div>
        )}

        {/* ============================================
            STEP 5: SUCCESS
        ============================================ */}
        {step === "success" && importStats && (
          <div style={{ padding: "20px 0", textAlign: "center" }}>
            <div style={{
              width: 80,
              height: 80,
              margin: "0 auto 20px",
              borderRadius: "50%",
              background: "rgba(76,175,80,0.15)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}>
              <CheckCircle2 size={40} color="#4caf50" />
            </div>

            <h3 style={{ margin: "0 0 8px", fontSize: 22 }}>
              Import Complete! 🎉
            </h3>
            <p style={{ margin: 0, opacity: 0.7 }}>
              Your menu has been updated
            </p>

            {/* STATS */}
            <div style={{
              marginTop: 24,
              padding: 20,
              background: "rgba(255,255,255,0.03)",
              borderRadius: 12,
              border: "1px solid var(--border-soft)"
            }}>
              <div style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 16,
                textAlign: "left"
              }}>
                <StatBlock
                  label="Items Created"
                  value={importStats.itemsCreated}
                  color="#4caf50"
                />
                <StatBlock
                  label="New Categories"
                  value={importStats.categoriesCreated}
                  color="#d4af37"
                />
                <StatBlock
                  label="Existing Categories"
                  value={importStats.categoriesExisted}
                  color="#2196f3"
                />
                <StatBlock
                  label="Failed"
                  value={importStats.itemsFailed}
                  color={importStats.itemsFailed > 0 ? "#e53935" : "#666"}
                />
              </div>
            </div>

            {importStats.errors?.length > 0 && (
              <div style={{
                marginTop: 16,
                padding: 12,
                background: "rgba(229,57,53,0.08)",
                borderRadius: 8,
                fontSize: 12,
                textAlign: "left"
              }}>
                <strong style={{ color: "#e53935" }}>⚠️ Some errors:</strong>
                <ul style={{ margin: "6px 0 0", paddingLeft: 20, opacity: 0.8 }}>
                  {importStats.errors.slice(0, 5).map((err, i) => (
                    <li key={i}>{err}</li>
                  ))}
                </ul>
              </div>
            )}

            <div style={{ display: "flex", gap: 10, marginTop: 24 }}>
              <button
                onClick={() => {
                  setStep("upload");
                  setExtracted(null);
                  setImagePreview(null);
                  setImageFile(null);
                  setImportStats(null);
                }}
                style={{ flex: 1, padding: 12 }}
              >
                Upload Another
              </button>
              <button
                className="gold-btn"
                onClick={handleDone}
                style={{ flex: 2, padding: 12 }}
              >
                View Menu →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================
// HELPERS
// ============================================================
function StatBlock({ label, value, color }) {
  return (
    <div>
      <div style={{ fontSize: 11, opacity: 0.6, marginBottom: 4, textTransform: "uppercase", letterSpacing: 0.5 }}>
        {label}
      </div>
      <div style={{ fontSize: 24, fontWeight: 800, color }}>
        {value}
      </div>
    </div>
  );
}

const smallBtn = {
  padding: "4px 10px",
  borderRadius: 6,
  border: "1px solid var(--border-soft)",
  background: "var(--bg-card)",
  cursor: "pointer",
  fontSize: 11,
  fontWeight: 600
};