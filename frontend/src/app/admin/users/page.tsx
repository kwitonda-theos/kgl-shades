"use client";

import React, { useEffect, useState } from "react";

interface User {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: number;
  role: string;
  createdAt: string;
}

interface UserForm {
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  passwordHash: string;
}

const emptyForm: UserForm = {
  email: "",
  firstName: "",
  lastName: "",
  phone: "",
  passwordHash: "",
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [form, setForm] = useState<UserForm>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const token = typeof window !== "undefined" ? localStorage.getItem("kgl-token") : null;

  const fetchUsers = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/users");
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filteredUsers = users.filter(
    (u) =>
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      `${u.firstName} ${u.lastName}`.toLowerCase().includes(search.toLowerCase())
  );

  const openCreateModal = () => {
    setEditingUser(null);
    setForm(emptyForm);
    setError("");
    setModalOpen(true);
  };

  const openEditModal = (user: User) => {
    setEditingUser(user);
    setForm({
      email: user.email,
      firstName: user.firstName || "",
      lastName: user.lastName || "",
      phone: user.phone?.toString() || "",
      passwordHash: "",
    });
    setError("");
    setModalOpen(true);
  };

  const handleSave = async () => {
    setSaving(true);
    setError("");

    try {
      if (editingUser) {
        // Update user
        const body: Record<string, string | number> = {
          email: form.email,
          firstName: form.firstName,
          lastName: form.lastName,
          phone: parseInt(form.phone),
        };
        // Only include password if provided
        if (form.passwordHash) {
          body.passwordHash = form.passwordHash;
        }

        const res = await fetch(`http://localhost:5000/api/users/${editingUser._id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(body),
        });

        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.message || "Failed to update user");
        }
      } else {
        // Create user
        const res = await fetch("http://localhost:5000/api/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: form.email,
            firstName: form.firstName,
            lastName: form.lastName,
            phone: parseInt(form.phone),
            passwordHash: form.passwordHash,
          }),
        });

        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.message || "Failed to create user");
        }
      }

      setModalOpen(false);
      fetchUsers();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (userId: string) => {
    try {
      const res = await fetch(`http://localhost:5000/api/users/${userId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || "Failed to delete user");
      }

      setDeleteConfirm(null);
      fetchUsers();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Delete failed");
    }
  };

  if (loading) {
    return (
      <div className="admin-page-loading">
        <div className="admin-loading-spinner" />
        <p>Loading users...</p>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <h1 className="admin-page-title">Users</h1>
        <button className="admin-btn admin-btn--primary" onClick={openCreateModal}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Add User
        </button>
      </div>

      {/* Search */}
      <div className="admin-search-bar">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          type="text"
          placeholder="Search by name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="admin-search-input"
        />
      </div>

      {/* Users Table */}
      <div className="admin-table-wrapper">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Role</th>
              <th>Joined</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.length === 0 ? (
              <tr>
                <td colSpan={6} className="admin-table-empty">
                  No users found
                </td>
              </tr>
            ) : (
              filteredUsers.map((user) => (
                <tr key={user._id}>
                  <td className="admin-table-name">
                    {user.firstName} {user.lastName}
                  </td>
                  <td>{user.email}</td>
                  <td>{user.phone}</td>
                  <td>
                    <span className={`admin-role-badge admin-role-badge--${user.role || "user"}`}>
                      {user.role || "user"}
                    </span>
                  </td>
                  <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                  <td>
                    <div className="admin-table-actions">
                      <button
                        className="admin-action-btn admin-action-btn--edit"
                        onClick={() => openEditModal(user)}
                        title="Edit"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                        </svg>
                      </button>
                      <button
                        className="admin-action-btn admin-action-btn--delete"
                        onClick={() => setDeleteConfirm(user._id)}
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
          <div className="admin-modal">
            <div className="admin-modal-header">
              <h2 className="admin-modal-title">
                {editingUser ? "Edit User" : "Create User"}
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
                <div className="admin-form-group">
                  <label className="admin-form-label">First Name</label>
                  <input
                    className="admin-form-input"
                    value={form.firstName}
                    onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                  />
                </div>
                <div className="admin-form-group">
                  <label className="admin-form-label">Last Name</label>
                  <input
                    className="admin-form-input"
                    value={form.lastName}
                    onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                  />
                </div>
              </div>

              <div className="admin-form-group">
                <label className="admin-form-label">Email</label>
                <input
                  className="admin-form-input"
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </div>

              <div className="admin-form-group">
                <label className="admin-form-label">Phone</label>
                <input
                  className="admin-form-input"
                  type="number"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                />
              </div>

              <div className="admin-form-group">
                <label className="admin-form-label">
                  {editingUser ? "New Password (leave blank to keep current)" : "Password"}
                </label>
                <input
                  className="admin-form-input"
                  type="password"
                  value={form.passwordHash}
                  onChange={(e) => setForm({ ...form, passwordHash: e.target.value })}
                  placeholder={editingUser ? "••••••••" : ""}
                />
              </div>
            </div>

            <div className="admin-modal-footer">
              <button className="admin-btn admin-btn--ghost" onClick={() => setModalOpen(false)}>
                Cancel
              </button>
              <button className="admin-btn admin-btn--primary" onClick={handleSave} disabled={saving}>
                {saving ? "Saving..." : editingUser ? "Save Changes" : "Create User"}
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
              <h2 className="admin-modal-title">Delete User</h2>
            </div>
            <div className="admin-modal-body">
              <p className="admin-confirm-text">
                Are you sure you want to delete this user? This action cannot be undone.
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
