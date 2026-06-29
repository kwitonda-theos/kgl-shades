"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";

interface ProductRef {
  _id: string;
  name: string;
  mainImage: string;
}

interface Collection {
  _id: string;
  name: string;
  slug: string;
  description: string;
  coverImage: string;
  products: ProductRef[];
  createdAt: string;
}

interface CollectionForm {
  name: string;
  description: string;
  coverImage: string;
  productIds: string[];
}

const emptyForm: CollectionForm = {
  name: "",
  description: "",
  coverImage: "",
  productIds: [],
};

export default function AdminCollectionsPage() {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [allProducts, setAllProducts] = useState<ProductRef[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCollection, setEditingCollection] = useState<Collection | null>(null);
  const [form, setForm] = useState<CollectionForm>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);

  const token =
    typeof window !== "undefined" ? localStorage.getItem("kgl-token") : null;

  const fetchCollections = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/collections");
      if (res.ok) {
        const data = await res.json();
        setCollections(data);
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/products");
      if (res.ok) {
        const data = await res.json();
        setAllProducts(data);
      }
    } catch {
      // silently fail
    }
  };

  useEffect(() => {
    fetchCollections();
    fetchProducts();
  }, []);

  const filteredCollections = collections.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  const openCreateModal = () => {
    setEditingCollection(null);
    setForm(emptyForm);
    setCoverPreview(null);
    setError("");
    setModalOpen(true);
  };

  const openEditModal = (collection: Collection) => {
    setEditingCollection(collection);
    setForm({
      name: collection.name,
      description: collection.description,
      coverImage: collection.coverImage,
      productIds: collection.products.map((p) => p._id),
    });
    setCoverPreview(collection.coverImage || null);
    setError("");
    setModalOpen(true);
  };

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("image", file);

    try {
      const res = await fetch("http://localhost:5000/api/admin/upload", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || "Upload failed");
      }
      const data = await res.json();
      setForm((prev) => ({ ...prev, coverImage: data.imagePath }));
      setCoverPreview(data.imagePath);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const toggleProduct = (productId: string) => {
    setForm((prev) => {
      const already = prev.productIds.includes(productId);
      return {
        ...prev,
        productIds: already
          ? prev.productIds.filter((id) => id !== productId)
          : [...prev.productIds, productId],
      };
    });
  };

  const handleSave = async () => {
    setSaving(true);
    setError("");

    try {
      const body = {
        name: form.name,
        description: form.description,
        coverImage: form.coverImage,
        products: form.productIds,
      };

      const url = editingCollection
        ? `http://localhost:5000/api/collections/${editingCollection._id}`
        : "http://localhost:5000/api/collections";

      const res = await fetch(url, {
        method: editingCollection ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || "Failed to save collection");
      }

      setModalOpen(false);
      fetchCollections();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (collectionId: string) => {
    try {
      const res = await fetch(
        `http://localhost:5000/api/collections/${collectionId}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || "Failed to delete collection");
      }
      setDeleteConfirm(null);
      fetchCollections();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Delete failed");
    }
  };

  if (loading) {
    return (
      <div className="admin-page-loading">
        <div className="admin-loading-spinner" />
        <p>Loading collections...</p>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <h1 className="admin-page-title">Collections</h1>
        <button
          className="admin-btn admin-btn--primary"
          onClick={openCreateModal}
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          New Collection
        </button>
      </div>

      {/* Search */}
      <div className="admin-search-bar">
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        >
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          type="text"
          placeholder="Search collections..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="admin-search-input"
        />
      </div>

      {/* Collections Table */}
      <div className="admin-table-wrapper">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Cover</th>
              <th>Name</th>
              <th>Description</th>
              <th>Products</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredCollections.length === 0 ? (
              <tr>
                <td colSpan={6} className="admin-table-empty">
                  No collections found
                </td>
              </tr>
            ) : (
              filteredCollections.map((col) => {
                // Fallback cover: first product's lifestyle image
                const coverSrc =
                  col.coverImage ||
                  (col.products[0] as any)?.lifestyleImage ||
                  col.products[0]?.mainImage ||
                  "";
                return (
                  <tr key={col._id}>
                    <td>
                      <div className="admin-table-thumb">
                        {coverSrc ? (
                          <Image
                            src={coverSrc}
                            alt={col.name}
                            fill
                            sizes="48px"
                            style={{ objectFit: "cover" }}
                          />
                        ) : (
                          <div
                            style={{
                              width: "100%",
                              height: "100%",
                              background: "var(--surface-2)",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: "10px",
                              color: "var(--text-muted)",
                            }}
                          >
                            No img
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="admin-table-name">{col.name}</td>
                    <td style={{ maxWidth: "200px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {col.description || "—"}
                    </td>
                    <td>{col.products.length}</td>
                    <td>{new Date(col.createdAt).toLocaleDateString()}</td>
                    <td>
                      <div className="admin-table-actions">
                        <button
                          className="admin-action-btn admin-action-btn--edit"
                          onClick={() => openEditModal(col)}
                          title="Edit"
                        >
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.5"
                          >
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                          </svg>
                        </button>
                        <button
                          className="admin-action-btn admin-action-btn--delete"
                          onClick={() => setDeleteConfirm(col._id)}
                          title="Delete"
                        >
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.5"
                          >
                            <polyline points="3 6 5 6 21 6" />
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Create / Edit Modal */}
      {modalOpen && (
        <>
          <div
            className="admin-modal-backdrop"
            onClick={() => setModalOpen(false)}
          />
          <div className="admin-modal admin-modal--large">
            <div className="admin-modal-header">
              <h2 className="admin-modal-title">
                {editingCollection ? "Edit Collection" : "Create Collection"}
              </h2>
              <button
                className="admin-modal-close"
                onClick={() => setModalOpen(false)}
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>

            {error && <div className="admin-modal-error">{error}</div>}

            <div className="admin-modal-body">
              {/* Name */}
              <div className="admin-form-group">
                <label className="admin-form-label">Collection Name</label>
                <input
                  className="admin-form-input"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. SHADOW SERIES"
                />
              </div>

              {/* Description */}
              <div className="admin-form-group">
                <label className="admin-form-label">Description</label>
                <textarea
                  className="admin-form-input"
                  rows={3}
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                  placeholder="What defines this collection..."
                  style={{ resize: "vertical", fontFamily: "inherit" }}
                />
              </div>

              {/* Cover Image Upload */}
              <div className="admin-form-group">
                <label className="admin-form-label">
                  Cover Image{" "}
                  <span
                    style={{ color: "var(--text-muted)", fontWeight: 400 }}
                  >
                    (optional — falls back to first product's lifestyle image)
                  </span>
                </label>
                <div className="admin-upload-area">
                  {coverPreview ? (
                    <div className="admin-upload-preview">
                      <Image
                        src={coverPreview}
                        alt="Cover Preview"
                        fill
                        sizes="200px"
                        style={{ objectFit: "cover" }}
                      />
                      <button
                        className="admin-upload-remove"
                        onClick={() => {
                          setCoverPreview(null);
                          setForm((prev) => ({ ...prev, coverImage: "" }));
                        }}
                      >
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path d="M18 6L6 18M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ) : (
                    <label className="admin-upload-dropzone">
                      <input
                        type="file"
                        accept="image/*,.avif"
                        onChange={handleCoverUpload}
                        className="admin-upload-input"
                      />
                      <svg
                        width="32"
                        height="32"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                      >
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                        <polyline points="17 8 12 3 7 8" />
                        <line x1="12" y1="3" x2="12" y2="15" />
                      </svg>
                      <span>
                        {uploading
                          ? "Uploading..."
                          : "Click to upload cover image"}
                      </span>
                      <span className="admin-upload-hint">
                        JPEG, PNG, WebP, AVIF — Max 5MB
                      </span>
                    </label>
                  )}
                </div>
              </div>

              {/* Product selector */}
              <div className="admin-form-group">
                <label className="admin-form-label">
                  Assign Products{" "}
                  <span style={{ color: "var(--text-muted)", fontWeight: 400 }}>
                    ({form.productIds.length} selected)
                  </span>
                </label>
                <div
                  style={{
                    maxHeight: "260px",
                    overflowY: "auto",
                    border: "1px solid var(--border)",
                    borderRadius: "var(--radius-sm)",
                    padding: "8px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "6px",
                  }}
                >
                  {allProducts.length === 0 ? (
                    <p
                      style={{
                        color: "var(--text-muted)",
                        padding: "8px",
                        margin: 0,
                      }}
                    >
                      No products available yet.
                    </p>
                  ) : (
                    allProducts.map((p) => {
                      const checked = form.productIds.includes(p._id);
                      return (
                        <label
                          key={p._id}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "12px",
                            padding: "8px 10px",
                            borderRadius: "var(--radius-sm)",
                            cursor: "pointer",
                            background: checked
                              ? "var(--accent-glow)"
                              : "transparent",
                            border: checked
                              ? "1px solid var(--accent)"
                              : "1px solid transparent",
                            transition: "all 0.15s",
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => toggleProduct(p._id)}
                            style={{ accentColor: "var(--accent)", width: "16px", height: "16px" }}
                          />
                          <div
                            style={{
                              width: "36px",
                              height: "36px",
                              borderRadius: "4px",
                              overflow: "hidden",
                              position: "relative",
                              flexShrink: 0,
                            }}
                          >
                            <Image
                              src={p.mainImage}
                              alt={p.name}
                              fill
                              sizes="36px"
                              style={{ objectFit: "cover" }}
                            />
                          </div>
                          <span style={{ fontSize: "14px", fontWeight: 500 }}>
                            {p.name}
                          </span>
                        </label>
                      );
                    })
                  )}
                </div>
              </div>
            </div>

            <div className="admin-modal-footer">
              <button
                className="admin-btn admin-btn--ghost"
                onClick={() => setModalOpen(false)}
              >
                Cancel
              </button>
              <button
                className="admin-btn admin-btn--primary"
                onClick={handleSave}
                disabled={saving}
              >
                {saving
                  ? "Saving..."
                  : editingCollection
                  ? "Save Changes"
                  : "Create Collection"}
              </button>
            </div>
          </div>
        </>
      )}

      {/* Delete Confirmation */}
      {deleteConfirm && (
        <>
          <div
            className="admin-modal-backdrop"
            onClick={() => setDeleteConfirm(null)}
          />
          <div className="admin-modal admin-modal--small">
            <div className="admin-modal-header">
              <h2 className="admin-modal-title">Delete Collection</h2>
            </div>
            <div className="admin-modal-body">
              <p className="admin-confirm-text">
                Are you sure you want to delete this collection? The products
                inside it will not be deleted.
              </p>
            </div>
            <div className="admin-modal-footer">
              <button
                className="admin-btn admin-btn--ghost"
                onClick={() => setDeleteConfirm(null)}
              >
                Cancel
              </button>
              <button
                className="admin-btn admin-btn--danger"
                onClick={() => handleDelete(deleteConfirm)}
              >
                Delete
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
