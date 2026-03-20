"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users, Search, Shield, ShieldOff, Trash2, Loader2,
  ChevronLeft, ChevronRight, UserPlus, X, Save, Edit2,
} from "lucide-react";
import { formatDate } from "@/lib/utils";

const emptyCreate = { name: "", email: "", password: "", phone: "", role: "BUYER" };

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [roleFilter, setRoleFilter] = useState("");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkLoading, setBulkLoading] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [createForm, setCreateForm] = useState(emptyCreate);
  const [createSaving, setCreateSaving] = useState(false);
  const [createError, setCreateError] = useState("");
  const [editModal, setEditModal] = useState<any>(null);
  const [editForm, setEditForm] = useState({ name: "", phone: "", role: "", isActive: true });
  const [editSaving, setEditSaving] = useState(false);
  const [toast, setToast] = useState("");

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(""), 3000); };

  const fetchUsers = async (page = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("page", page.toString());
      if (roleFilter) params.set("role", roleFilter);
      if (search) params.set("search", search);
      const res = await fetch(`/api/admin/users?${params.toString()}`);
      const data = await res.json();
      setUsers(data.users || []);
      setPagination(data.pagination || { page: 1, pages: 1, total: 0 });
      setSelected(new Set());
    } catch (error) { console.error("Error:", error); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchUsers(); }, [roleFilter]);

  // ─── Single actions ─────────────────────────────────────────
  const handleToggleActive = async (id: string, isActive: boolean) => {
    try {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: "PUT", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !isActive }),
      });
      if (res.ok) { fetchUsers(pagination.page); showToast(isActive ? "User deactivated" : "User activated"); }
    } catch (error) { console.error("Error:", error); }
  };

  const handleChangeRole = async (id: string, role: string) => {
    try {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: "PUT", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role }),
      });
      if (res.ok) { fetchUsers(pagination.page); showToast(`Role changed to ${role}`); }
    } catch (error) { console.error("Error:", error); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this user? This cannot be undone.")) return;
    try {
      const res = await fetch(`/api/admin/users/${id}`, { method: "DELETE" });
      if (res.ok) { fetchUsers(pagination.page); showToast("User deleted"); }
    } catch (error) { console.error("Error:", error); }
  };

  // ─── Create user ───────────────────────────────────────────
  const handleCreate = async () => {
    setCreateSaving(true);
    setCreateError("");
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(createForm),
      });
      const data = await res.json();
      if (res.ok) {
        setShowCreate(false);
        setCreateForm(emptyCreate);
        fetchUsers(1);
        showToast("User created successfully");
      } else {
        setCreateError(data.error || "Failed to create user");
      }
    } catch { setCreateError("Network error"); }
    finally { setCreateSaving(false); }
  };

  // ─── Edit user ─────────────────────────────────────────────
  const openEdit = (u: any) => {
    setEditModal(u);
    setEditForm({ name: u.name, phone: u.phone || "", role: u.role, isActive: u.isActive });
  };

  const handleEditSave = async () => {
    if (!editModal) return;
    setEditSaving(true);
    try {
      const res = await fetch(`/api/admin/users/${editModal.id}`, {
        method: "PUT", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });
      if (res.ok) { setEditModal(null); fetchUsers(pagination.page); showToast("User updated"); }
    } catch (error) { console.error("Error:", error); }
    finally { setEditSaving(false); }
  };

  // ─── Bulk actions ──────────────────────────────────────────
  const toggleSelect = (id: string) => {
    setSelected(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  };
  const toggleSelectAll = () => {
    if (selected.size === users.length) setSelected(new Set());
    else setSelected(new Set(users.map(u => u.id)));
  };

  const handleBulkAction = async (action: string, value?: string) => {
    if (selected.size === 0) return;
    if (action === "delete" && !confirm(`Delete ${selected.size} users? This cannot be undone.`)) return;
    setBulkLoading(true);
    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: Array.from(selected), action, value }),
      });
      if (res.ok) {
        fetchUsers(pagination.page);
        showToast(`Action applied to ${selected.size} users`);
      }
    } catch (error) { console.error("Error:", error); }
    finally { setBulkLoading(false); }
  };

  return (
    <div className="space-y-6">
      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            className="fixed top-6 right-6 z-50 px-5 py-3 bg-secondary text-white text-sm font-medium rounded-xl shadow-lg">
            {toast}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-secondary">User Management</h2>
          <p className="text-sm text-muted-foreground">Manage users, roles, and permissions ({pagination.total} total)</p>
        </div>
        <button onClick={() => { setCreateForm(emptyCreate); setCreateError(""); setShowCreate(true); }}
          className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary-dark transition-all">
          <UserPlus className="w-4 h-4" /> Add User
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl p-4 border border-border flex flex-col sm:flex-row gap-4">
        <div className="flex-1 flex items-center gap-2 bg-muted rounded-lg px-3 py-2">
          <Search className="w-4 h-4 text-gray-400" />
          <input type="text" placeholder="Search users..." value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && fetchUsers(1)}
            className="w-full bg-transparent text-sm focus:outline-none" />
        </div>
        <div className="flex gap-2">
          {["", "ADMIN", "SELLER", "BUYER"].map((role) => (
            <button key={role} onClick={() => setRoleFilter(role)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                roleFilter === role ? "bg-primary text-white" : "bg-muted text-muted-foreground hover:bg-gray-200"
              }`}>
              {role || "All"}
            </button>
          ))}
        </div>
      </div>

      {/* Bulk Actions Bar */}
      {selected.size > 0 && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="bg-secondary text-white rounded-xl px-5 py-3 flex items-center justify-between flex-wrap gap-2">
          <span className="text-sm font-medium">{selected.size} selected</span>
          <div className="flex items-center gap-2 flex-wrap">
            <button onClick={() => handleBulkAction("activate")} disabled={bulkLoading}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-green-600 hover:bg-green-700 flex items-center gap-1 disabled:opacity-50">
              {bulkLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Shield className="w-3 h-3" />} Activate
            </button>
            <button onClick={() => handleBulkAction("deactivate")} disabled={bulkLoading}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-orange-600 hover:bg-orange-700 flex items-center gap-1 disabled:opacity-50">
              {bulkLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <ShieldOff className="w-3 h-3" />} Deactivate
            </button>
            <select onChange={(e) => { if (e.target.value) handleBulkAction("changeRole", e.target.value); e.target.value = ""; }}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-600 text-white border-0" defaultValue="">
              <option value="" disabled>Change Role...</option>
              <option value="BUYER">Set BUYER</option>
              <option value="SELLER">Set SELLER</option>
              <option value="ADMIN">Set ADMIN</option>
            </select>
            <button onClick={() => handleBulkAction("delete")} disabled={bulkLoading}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-red-600 hover:bg-red-700 flex items-center gap-1 disabled:opacity-50">
              {bulkLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />} Delete
            </button>
            <button onClick={() => setSelected(new Set())} className="ml-2 p-1.5 hover:bg-white/10 rounded-lg">
              <X className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      )}

      {/* Table */}
      <div className="bg-white rounded-xl border border-border overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-20">
            <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-muted-foreground">No users found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="px-4 py-3 w-10">
                    <input type="checkbox" checked={selected.size === users.length && users.length > 0}
                      onChange={toggleSelectAll} className="w-4 h-4 rounded border-gray-300 text-primary" />
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">User</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Role</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Status</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Properties</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Joined</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user: any) => (
                  <tr key={user.id} className={`border-b border-border hover:bg-muted/30 transition-colors ${selected.has(user.id) ? "bg-primary/5" : ""}`}>
                    <td className="px-4 py-4">
                      <input type="checkbox" checked={selected.has(user.id)}
                        onChange={() => toggleSelect(user.id)} className="w-4 h-4 rounded border-gray-300 text-primary" />
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                          {user.name?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-secondary">{user.name}</p>
                          <p className="text-xs text-muted-foreground">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <select value={user.role} onChange={(e) => handleChangeRole(user.id, e.target.value)}
                        className="px-2 py-1 text-xs font-semibold rounded-lg bg-muted border border-border">
                        <option value="BUYER">BUYER</option>
                        <option value="SELLER">SELLER</option>
                        <option value="ADMIN">ADMIN</option>
                      </select>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`px-2.5 py-1 text-xs font-semibold rounded-lg ${
                        user.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                      }`}>
                        {user.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-sm text-muted-foreground">{user._count?.properties || 0}</td>
                    <td className="px-4 py-4 text-sm text-muted-foreground">{formatDate(user.createdAt)}</td>
                    <td className="px-4 py-4">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => openEdit(user)}
                          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Edit">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleToggleActive(user.id, user.isActive)}
                          className={`p-2 rounded-lg transition-colors ${user.isActive
                            ? "text-gray-400 hover:text-orange-600 hover:bg-orange-50"
                            : "text-gray-400 hover:text-green-600 hover:bg-green-50"
                          }`} title={user.isActive ? "Deactivate" : "Activate"}>
                          {user.isActive ? <ShieldOff className="w-4 h-4" /> : <Shield className="w-4 h-4" />}
                        </button>
                        <button onClick={() => handleDelete(user.id)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Delete">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {pagination.pages > 1 && (
          <div className="px-6 py-4 border-t border-border flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Showing {(pagination.page - 1) * 20 + 1} to {Math.min(pagination.page * 20, pagination.total)} of {pagination.total}
            </p>
            <div className="flex gap-1">
              <button onClick={() => fetchUsers(pagination.page - 1)} disabled={pagination.page <= 1}
                className="p-2 rounded-lg hover:bg-muted disabled:opacity-50"><ChevronLeft className="w-4 h-4" /></button>
              <button onClick={() => fetchUsers(pagination.page + 1)} disabled={pagination.page >= pagination.pages}
                className="p-2 rounded-lg hover:bg-muted disabled:opacity-50"><ChevronRight className="w-4 h-4" /></button>
            </div>
          </div>
        )}
      </div>

      {/* Create User Modal */}
      <AnimatePresence>
        {showCreate && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setShowCreate(false)}>
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-secondary">Create New User</h3>
                <button onClick={() => setShowCreate(false)} className="p-2 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5" /></button>
              </div>
              {createError && <div className="mb-4 px-4 py-2.5 bg-red-50 text-red-700 text-sm rounded-lg">{createError}</div>}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-secondary mb-1">Full Name *</label>
                  <input value={createForm.name} onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                    placeholder="John Doe" className="w-full px-3 py-2.5 bg-muted border border-border rounded-lg text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-secondary mb-1">Email *</label>
                  <input type="email" value={createForm.email} onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                    placeholder="user@example.com" className="w-full px-3 py-2.5 bg-muted border border-border rounded-lg text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-secondary mb-1">Password *</label>
                  <input type="password" value={createForm.password} onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
                    placeholder="Min 6 characters" className="w-full px-3 py-2.5 bg-muted border border-border rounded-lg text-sm" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-secondary mb-1">Phone</label>
                    <input value={createForm.phone} onChange={(e) => setCreateForm({ ...createForm, phone: e.target.value })}
                      placeholder="+233..." className="w-full px-3 py-2.5 bg-muted border border-border rounded-lg text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-secondary mb-1">Role</label>
                    <select value={createForm.role} onChange={(e) => setCreateForm({ ...createForm, role: e.target.value })}
                      className="w-full px-3 py-2.5 bg-muted border border-border rounded-lg text-sm">
                      <option value="BUYER">Buyer</option>
                      <option value="SELLER">Seller</option>
                      <option value="ADMIN">Admin</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button onClick={() => setShowCreate(false)}
                  className="flex-1 py-2.5 bg-gray-100 text-secondary rounded-xl font-semibold hover:bg-gray-200 transition-all text-sm">Cancel</button>
                <button onClick={handleCreate} disabled={createSaving || !createForm.name || !createForm.email || !createForm.password}
                  className="flex-1 py-2.5 bg-primary text-white rounded-xl font-semibold hover:bg-primary-dark transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-50">
                  {createSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />} Create User
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit User Modal */}
      <AnimatePresence>
        {editModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setEditModal(null)}>
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-secondary">Edit User</h3>
                <button onClick={() => setEditModal(null)} className="p-2 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5" /></button>
              </div>
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                  <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-bold text-sm">
                    {editModal.name?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-secondary">{editModal.email}</p>
                    <p className="text-xs text-muted-foreground">Joined {formatDate(editModal.createdAt)}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-secondary mb-1">Role</label>
                    <select value={editForm.role} onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                      className="w-full px-3 py-2.5 bg-muted border border-border rounded-lg text-sm">
                      <option value="BUYER">BUYER</option>
                      <option value="SELLER">SELLER</option>
                      <option value="ADMIN">ADMIN</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-secondary mb-1">Status</label>
                    <select value={editForm.isActive ? "active" : "inactive"}
                      onChange={(e) => setEditForm({ ...editForm, isActive: e.target.value === "active" })}
                      className="w-full px-3 py-2.5 bg-muted border border-border rounded-lg text-sm">
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button onClick={() => setEditModal(null)}
                  className="flex-1 py-2.5 bg-gray-100 text-secondary rounded-xl font-semibold hover:bg-gray-200 transition-all text-sm">Cancel</button>
                <button onClick={handleEditSave} disabled={editSaving}
                  className="flex-1 py-2.5 bg-primary text-white rounded-xl font-semibold hover:bg-primary-dark transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-50">
                  {editSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save Changes
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
