"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";

interface LensOption {
  _id?: string;
  name: string;
  description: string;
  priceUpcharge: number;
}

interface Product {
  _id: string;
  name: string;
  basePrice: number;
  mainImage: string;
  lensOption: LensOption[];
  createdAt: string;
}

interface ProductForm {
  name: string;
  basePrice: string;
  mainImage: string;
  lensOption: LensOption[];
}

const emptyLens: LensOption = { name: "", description: "", priceUpcharge: 0 };

const emptyForm: ProductForm = {
  name: "",
  basePrice: "",
  mainImage: "",
  lensOption: [{ ...emptyLens }],
};

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [form, setForm] = useState<ProductForm>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const token = typeof window !== "undefined" ? localStorage.getItem("kgl-token") : null;

  const fetchProducts = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/products");
      if (res.ok) {
        const data = await res.json();
        setProducts(data);
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  const openCreateModal = () => {
    setEditingProduct(null);
    setForm(emptyForm);
    setImagePreview(null);
    setError("");
    setModalOpen(true);
  };

  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    setForm({
      name: product.name,
      basePrice: product.basePrice.toString(),
      mainImage: product.mainImage,
      lensOption: product.lensOption.length > 0
        ? product.lensOption.map((l) => ({
            name: l.name,
            description: l.description,
            priceUpcharge: l.priceUpcharge,
          }))
        : [{ ...emptyLens }],
    });
    setImagePreview(product.mainImage);
    setError("");
    setModalOpen(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
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
      setForm((prev) => ({ ...prev, mainImage: data.imagePath }));
      setImagePreview(data.imagePath);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const addLensOption = () => {
    setForm((prev) => ({
      ...prev,
      lensOption: [...prev.lensOption, { ...emptyLens }],
    }));
  };

  const removeLensOption = (idx: number) => {
    setForm((prev) => ({
      ...prev,
      lensOption: prev.lensOption.filter((_, i) => i !== idx),
    }));
  };

  const updateLensOption = (idx: number, field: keyof LensOption, value: string | number) => {
    setForm((prev) => ({
      ...prev,
      lensOption: prev.lensOption.map((l, i) =>
        i === idx ? { ...l, [field]: value } : l
      ),
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    setError("");

    try {
      const body = {
        name: form.name,
        basePrice: parseFloat(form.basePrice),
        mainImage: form.mainImage,
        lensOption: form.lensOption.filter((l) => l.name.trim() !== ""),
      };

      const url = editingProduct
        ? `http://localhost:5000/api/products/${editingProduct._id}`
        : "http://localhost:5000/api/products";

      const res = await fetch(url, {
        method: editingProduct ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || "Failed to save product");
      }

      setModalOpen(false);
      fetchProducts();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (productId: string) => {
    try {
      const res = await fetch(`http://localhost:5000/api/products/${productId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || "Failed to delete product");
      }

      setDeleteConfirm(null);
      fetchProducts();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Delete failed");
    }
  };

  if (loading) {
    return (
      <div className="admin-page-loading">
        <div className="admin-loading-spinner" />
        <p>Loading products...</p>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <h1 className="admin-page-title">Products</h1>
        <button className="admin-btn admin-btn--primary" onClick={openCreateModal}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Add Product
        </button>
      </div>

      {/* Search */}
      <div className="admin-search-bar">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          type="text"
          placeholder="Search products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="admin-search-input"
        />
      </div>

      {/* Products Table */}
      <div className="admin-table-wrapper">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Image</th>
              <th>Name</th>
              <th>Base Price</th>
              <th>Lens Options</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.length === 0 ? (
              <tr>
                <td colSpan={6} className="admin-table-empty">
                  No products found
                </td>
              </tr>
            ) : (
              filteredProducts.map((product) => (
                <tr key={product._id}>
                  <td>
                    <div className="admin-table-thumb">
                      <Image
                        src={product.mainImage}
                        alt={product.name}
                        fill
                        sizes="48px"
                        style={{ objectFit: "cover" }}
                      />
                    </div>
                  </td>
                  <td className="admin-table-name">{product.name}</td>
                  <td>${product.basePrice}</td>
                  <td>{product.lensOption?.length || 0}</td>
                  <td>{new Date(product.createdAt).toLocaleDateString()}</td>
                  <td>
                    <div className="admin-table-actions">
                      <button
                        className="admin-action-btn admin-action-btn--edit"
                        onClick={() => openEditModal(product)}
                        title="Edit"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                        </svg>
                      </button>
                      <button
                        className="admin-action-btn admin-action-btn--delete"
                        onClick={() => setDeleteConfirm(product._id)}
                        title="Delete"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                          <polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Create/Edit Modal */}
      {modalOpen && (
        <>
          <div className="admin-modal-backdrop" onClick={() => setModalOpen(false)} />
          <div className="admin-modal admin-modal--large">
            <div className="admin-modal-header">
              <h2 className="admin-modal-title">
                {editingProduct ? "Edit Product" : "Create Product"}
              </h2>
              <button className="admin-modal-close" onClick={() => setModalOpen(false)}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>

            {error && <div className="admin-modal-error">{error}</div>}

            <div className="admin-modal-body">
              <div className="admin-form-row">
                <div className="admin-form-group" style={{ flex: 2 }}>
                  <label className="admin-form-label">Product Name</label>
                  <input
                    className="admin-form-input"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="e.g. PHANTOM"
                  />
                </div>
                <div className="admin-form-group" style={{ flex: 1 }}>
                  <label className="admin-form-label">Base Price ($)</label>
                  <input
                    className="admin-form-input"
                    type="number"
                    value={form.basePrice}
                    onChange={(e) => setForm({ ...form, basePrice: e.target.value })}
                    placeholder="e.g. 189"
                  />
                </div>
              </div>

              {/* Image Upload */}
              <div className="admin-form-group">
                <label className="admin-form-label">Product Image</label>
                <div className="admin-upload-area">
                  {imagePreview ? (
                    <div className="admin-upload-preview">
                      <Image
                        src={imagePreview}
                        alt="Preview"
                        fill
                        sizes="200px"
                        style={{ objectFit: "cover" }}
                      />
                      <button
                        className="admin-upload-remove"
                        onClick={() => {
                          setImagePreview(null);
                          setForm((prev) => ({ ...prev, mainImage: "" }));
                        }}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M18 6L6 18M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ) : (
                    <label className="admin-upload-dropzone">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="admin-upload-input"
                      />
                      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" />
                      </svg>
                      <span>{uploading ? "Uploading..." : "Click to upload image"}</span>
                      <span className="admin-upload-hint">JPEG, PNG, WebP — Max 5MB</span>
                    </label>
                  )}
                </div>
              </div>

              {/* Lens Options */}
              <div className="admin-form-group">
                <div className="admin-form-label-row">
                  <label className="admin-form-label">Lens Options</label>
                  <button className="admin-btn admin-btn--ghost admin-btn--small" onClick={addLensOption}>
                    + Add Lens
                  </button>
                </div>

                <div className="admin-lens-list">
                  {form.lensOption.map((lens, idx) => (
                    <div key={idx} className="admin-lens-row">
                      <input
                        className="admin-form-input"
                        placeholder="Lens name"
                        value={lens.name}
                        onChange={(e) => updateLensOption(idx, "name", e.target.value)}
                      />
                      <input
                        className="admin-form-input"
                        placeholder="Description"
                        value={lens.description}
                        onChange={(e) => updateLensOption(idx, "description", e.target.value)}
                      />
                      <input
                        className="admin-form-input admin-form-input--small"
                        type="number"
                        placeholder="$0"
                        value={lens.priceUpcharge}
                        onChange={(e) => updateLensOption(idx, "priceUpcharge", parseFloat(e.target.value) || 0)}
                      />
                      {form.lensOption.length > 1 && (
                        <button
                          className="admin-action-btn admin-action-btn--delete"
                          onClick={() => removeLensOption(idx)}
                          title="Remove lens option"
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <path d="M18 6L6 18M6 6l12 12" />
                          </svg>
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="admin-modal-footer">
              <button className="admin-btn admin-btn--ghost" onClick={() => setModalOpen(false)}>
                Cancel
              </button>
              <button className="admin-btn admin-btn--primary" onClick={handleSave} disabled={saving}>
                {saving ? "Saving..." : editingProduct ? "Save Changes" : "Create Product"}
              </button>
            </div>
          </div>
        </>
      )}

      {/* Delete Confirmation Dialog */}
      {deleteConfirm && (
        <>
          <div className="admin-modal-backdrop" onClick={() => setDeleteConfirm(null)} />
          <div className="admin-modal admin-modal--small">
            <div className="admin-modal-header">
              <h2 className="admin-modal-title">Delete Product</h2>
            </div>
            <div className="admin-modal-body">
              <p className="admin-confirm-text">
                Are you sure you want to delete this product? This action cannot be undone.
              </p>
            </div>
            <div className="admin-modal-footer">
              <button className="admin-btn admin-btn--ghost" onClick={() => setDeleteConfirm(null)}>
                Cancel
              </button>
              <button className="admin-btn admin-btn--danger" onClick={() => handleDelete(deleteConfirm)}>
                Delete
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
