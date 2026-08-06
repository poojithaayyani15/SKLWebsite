import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  LayoutDashboard, Mail, Users, Briefcase, LogOut, Search, Download, FileText, StickyNote,
  Loader2, Inbox, TrendingUp, Menu, X, Image as ImageIcon, FolderOpen, Settings as SettingsIcon,
  Activity as ActivityIcon, Trash2, Plus, UserPlus, FileDown, Layers, Pencil, ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/Logo";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import api, { API, formatApiError } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

const STATUSES = ["New", "Contacted", "Pending", "Approved", "Rejected"];
const STATUS_STYLES = {
  New: "bg-blue-50 text-blue-700 border-blue-200",
  Contacted: "bg-amber-50 text-amber-700 border-amber-200",
  Pending: "bg-slate-100 text-slate-700 border-slate-200",
  Approved: "bg-emerald-50 text-emerald-700 border-emerald-200",
  Rejected: "bg-rose-50 text-rose-700 border-rose-200",
};
const ROLES = ["super_admin", "admin", "content_manager", "hr", "operations"];
const PERMS = {
  super_admin: ["leads", "content", "projects", "careers", "downloads", "media", "users", "activity"],
  admin: ["leads", "content", "projects", "careers", "downloads", "media", "activity"],
  content_manager: ["content", "projects", "downloads", "media"],
  hr: ["leads", "careers"],
  operations: ["leads"],
};
const MEDIA_FOLDERS = ["General", "APAAR", "PAN 2.0", "Founder", "Team", "Office", "Logos", "Videos", "Brochures", "Downloads"];

const NAV = [
  { key: "overview", label: "Overview", icon: LayoutDashboard, perm: null },
  { key: "search", label: "Global Search", icon: Search, perm: null },
  { key: "leads", label: "Leads & CRM", icon: Inbox, perm: "leads" },
  { key: "media", label: "Media Library", icon: ImageIcon, perm: "media" },
  { key: "careers", label: "Careers", icon: Briefcase, perm: "careers" },
  { key: "downloads", label: "Downloads", icon: FileDown, perm: "downloads" },
  { key: "projects", label: "Projects", icon: Layers, perm: "projects" },
  { key: "users", label: "Users & Roles", icon: Users, perm: "users" },
  { key: "activity", label: "Activity Log", icon: ActivityIcon, perm: "activity" },
  { key: "settings", label: "Website Settings", icon: SettingsIcon, perm: "content" },
];

export default function AdminDashboard() {
  const { user, logout, token } = useAuth();
  const navigate = useNavigate();
  const perms = PERMS[user?.role] || [];
  const can = (p) => !p || perms.includes(p);
  const visibleNav = NAV.filter((n) => can(n.perm));
  const [section, setSection] = useState("overview");
  const [sidebar, setSidebar] = useState(false);

  const doLogout = async () => { await logout(); navigate("/admin/login"); };

  return (
    <div className="min-h-screen bg-slate-100 flex" data-testid="admin-dashboard">
      <aside className={`fixed lg:sticky top-0 z-40 h-screen w-64 bg-slate-950 text-white flex flex-col transition-transform ${sidebar ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}>
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src="/logo-skl.png" alt="SKL" className="h-9 w-9 object-contain" />
            <div className="font-heading font-bold text-sm tracking-tight">SKL Admin</div>
          </div>
          <button className="lg:hidden text-slate-400" onClick={() => setSidebar(false)}><X className="h-5 w-5" /></button>
        </div>
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {visibleNav.map((n) => (
            <button key={n.key} onClick={() => { setSection(n.key); setSidebar(false); }} data-testid={`section-${n.key}`}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-sm text-sm font-medium transition-colors ${section === n.key ? "bg-royal text-white" : "text-slate-400 hover:bg-slate-900 hover:text-white"}`}>
              <n.icon className="h-4 w-4" /> {n.label}
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-slate-800">
          <div className="px-3 py-1 text-xs text-slate-500 truncate">{user?.email}</div>
          <div className="px-3 pb-2 text-[10px] uppercase tracking-wider text-gold">{user?.role?.replace("_", " ")}</div>
          <button onClick={doLogout} data-testid="admin-logout" className="w-full flex items-center gap-3 px-3 py-2.5 rounded-sm text-sm font-medium text-slate-400 hover:bg-slate-900 hover:text-white transition-colors">
            <LogOut className="h-4 w-4" /> Sign Out
          </button>
        </div>
      </aside>
      {sidebar && <div className="fixed inset-0 bg-black/40 z-30 lg:hidden" onClick={() => setSidebar(false)} />}

      <div className="flex-1 min-w-0">
        <header className="bg-white border-b border-slate-200 sticky top-0 z-20 h-16 flex items-center px-5 lg:px-8">
          <button className="lg:hidden text-slate-600 mr-3" onClick={() => setSidebar(true)}><Menu className="h-5 w-5" /></button>
          <h1 className="font-heading text-lg font-bold text-slate-900">{NAV.find((n) => n.key === section)?.label}</h1>
        </header>
        <div className="p-5 lg:p-8">
          {section === "overview" && <Overview setSection={setSection} />}
          {section === "search" && <GlobalSearch />}
          {section === "leads" && <Leads token={token} />}
          {section === "media" && <Media token={token} />}
          {section === "careers" && <Openings />}
          {section === "downloads" && <Downloads />}
          {section === "projects" && <Projects />}
          {section === "users" && <UsersManager currentEmail={user?.email} />}
          {section === "activity" && <ActivityLog />}
          {section === "settings" && <SettingsEditor />}
        </div>
      </div>
    </div>
  );
}

/* ---------------- OVERVIEW ---------------- */
function Overview({ setSection }) {
  const [d, setD] = useState(null);
  useEffect(() => { api.get("/admin/overview").then((r) => setD(r.data)).catch(() => {}); }, []);
  if (!d) return <Loader2 className="h-6 w-6 animate-spin text-royal" />;
  const cards = [
    { label: "Today's Applications", value: d.today, icon: TrendingUp, c: "text-emerald-600" },
    { label: "Total Records", value: d.total, icon: Inbox, c: "text-royal" },
    { label: "Agent Registrations", value: d.agents, icon: Users, c: "text-amber-600" },
    { label: "Career Applications", value: d.careers, icon: Briefcase, c: "text-blue-600" },
    { label: "Contact Enquiries", value: d.contacts, icon: Mail, c: "text-indigo-600" },
    { label: "Media Files", value: d.media, icon: ImageIcon, c: "text-rose-600" },
    { label: "Active Openings", value: d.openings, icon: FileDown, c: "text-teal-600" },
    { label: "Admin Users", value: d.users, icon: Users, c: "text-slate-600" },
  ];
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((s) => (
          <div key={s.label} className="bg-white border border-slate-200 rounded-sm p-5" data-testid={`ov-${s.label.toLowerCase().replace(/[^a-z]+/g, "-")}`}>
            <div className="flex items-center justify-between"><span className="text-xs uppercase tracking-wider text-slate-500 font-semibold">{s.label}</span><s.icon className={`h-4 w-4 ${s.c}`} /></div>
            <div className="mt-2 font-heading text-3xl font-bold text-slate-900">{s.value}</div>
          </div>
        ))}
      </div>
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-sm p-6">
          <h3 className="font-heading font-semibold text-slate-900 mb-4">Recent Activity</h3>
          {d.recent_activity?.length ? (
            <div className="space-y-3">
              {d.recent_activity.map((a) => (
                <div key={a.id} className="flex items-start gap-3 text-sm border-b border-slate-100 pb-3 last:border-0">
                  <div className="h-2 w-2 rounded-full bg-gold mt-1.5" />
                  <div><span className="font-medium text-slate-800">{a.action}</span> {a.detail && <span className="text-slate-500">— {a.detail}</span>}<div className="text-xs text-slate-400">{a.user} · {new Date(a.at).toLocaleString("en-IN")}</div></div>
                </div>
              ))}
            </div>
          ) : <p className="text-slate-400 text-sm">No activity recorded yet.</p>}
        </div>
        <div className="bg-white border border-slate-200 rounded-sm p-6">
          <h3 className="font-heading font-semibold text-slate-900 mb-4">Quick Actions</h3>
          <div className="space-y-2">
            <button onClick={() => setSection("leads")} className="w-full text-left px-4 py-3 rounded-sm bg-slate-50 hover:bg-royal hover:text-white transition-colors text-sm font-medium">View Leads & CRM</button>
            <button onClick={() => setSection("media")} className="w-full text-left px-4 py-3 rounded-sm bg-slate-50 hover:bg-royal hover:text-white transition-colors text-sm font-medium">Upload Media</button>
            <button onClick={() => setSection("careers")} className="w-full text-left px-4 py-3 rounded-sm bg-slate-50 hover:bg-royal hover:text-white transition-colors text-sm font-medium">Manage Job Openings</button>
            <button onClick={() => setSection("settings")} className="w-full text-left px-4 py-3 rounded-sm bg-slate-50 hover:bg-royal hover:text-white transition-colors text-sm font-medium">Edit Website Settings</button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------------- LEADS ---------------- */
function Leads({ token }) {
  const TABS = [{ key: "contacts", label: "Contact Forms" }, { key: "agents", label: "Agent Applications" }, { key: "careers", label: "Career Applications" }];
  const [tab, setTab] = useState("contacts");
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [sort, setSort] = useState("newest");
  const [noteFor, setNoteFor] = useState(null);
  const [noteText, setNoteText] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try { const { data } = await api.get(`/admin/leads/${tab}`, { params: { search, status, sort } }); setRows(data); }
    catch { toast.error("Failed to load"); } finally { setLoading(false); }
  }, [tab, search, status, sort]);
  useEffect(() => { const t = setTimeout(load, 250); return () => clearTimeout(t); }, [load]);

  const changeStatus = async (id, s) => { try { await api.patch(`/admin/leads/${tab}/${id}/status`, { status: s }); setRows((r) => r.map((x) => x.id === id ? { ...x, status: s } : x)); toast.success(`Marked ${s}`); } catch { toast.error("Failed"); } };
  const saveNote = async () => { if (!noteText.trim()) return; try { const { data } = await api.post(`/admin/leads/${tab}/${noteFor.id}/notes`, { note: noteText }); setRows((r) => r.map((x) => x.id === noteFor.id ? { ...x, notes: [...(x.notes || []), data.note] } : x)); setNoteFor((f) => ({ ...f, notes: [...(f.notes || []), data.note] })); setNoteText(""); toast.success("Note added"); } catch { toast.error("Failed"); } };
  const exportFile = async (fmt) => { try { const res = await api.get(`/admin/leads/${tab}/export`, { params: { format: fmt }, responseType: "blob" }); const url = URL.createObjectURL(res.data); const a = document.createElement("a"); a.href = url; a.download = `${tab}_export.${fmt === "xlsx" ? "xlsx" : "csv"}`; a.click(); URL.revokeObjectURL(url); toast.success("Downloaded"); } catch { toast.error("Export failed"); } };
  const cols = { contacts: ["Name", "Email", "Phone", "Subject"], agents: ["Name", "Contact", "Location", "Project / Role"], careers: ["Name", "Contact", "Position", "Resume"] };

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-4">
        {TABS.map((t) => (
          <button key={t.key} onClick={() => { setTab(t.key); setSearch(""); setStatus("all"); }} data-testid={`tab-${t.key}`}
            className={`px-4 py-2 rounded-sm text-sm font-medium transition-colors ${tab === t.key ? "bg-royal text-white" : "bg-white border border-slate-200 text-slate-600 hover:border-royal"}`}>{t.label}</button>
        ))}
        <div className="ml-auto flex gap-2">
          <Button onClick={() => exportFile("xlsx")} data-testid="export-xlsx" variant="outline" className="rounded-sm h-9 text-sm"><Download className="h-4 w-4 mr-1" /> Excel</Button>
          <Button onClick={() => exportFile("csv")} data-testid="export-csv" variant="outline" className="rounded-sm h-9 text-sm"><Download className="h-4 w-4 mr-1" /> CSV</Button>
        </div>
      </div>
      <div className="bg-white border border-slate-200 rounded-sm">
        <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" /><Input data-testid="search-input" placeholder="Search…" value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 h-10 rounded-sm" /></div>
          <Select value={status} onValueChange={setStatus}><SelectTrigger className="w-full sm:w-44 h-10 rounded-sm" data-testid="filter-status"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">All Statuses</SelectItem>{STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent></Select>
          <Select value={sort} onValueChange={setSort}><SelectTrigger className="w-full sm:w-40 h-10 rounded-sm" data-testid="sort-select"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="newest">Newest First</SelectItem><SelectItem value="oldest">Oldest First</SelectItem></SelectContent></Select>
        </div>
        <div className="overflow-x-auto">
          {loading ? <div className="py-20 flex justify-center"><Loader2 className="h-6 w-6 animate-spin text-royal" /></div>
            : rows.length === 0 ? <div className="py-20 text-center text-slate-400" data-testid="empty-state"><Inbox className="h-10 w-10 mx-auto mb-3 opacity-40" />No records found.</div>
            : <Table><TableHeader><TableRow className="bg-slate-50">{cols[tab].map((c) => <TableHead key={c} className="text-xs uppercase tracking-wider text-slate-500 font-semibold">{c}</TableHead>)}<TableHead className="text-xs uppercase text-slate-500 font-semibold">Date</TableHead><TableHead className="text-xs uppercase text-slate-500 font-semibold">Status</TableHead><TableHead className="text-right text-xs uppercase text-slate-500 font-semibold">Notes</TableHead></TableRow></TableHeader>
              <TableBody>{rows.map((r) => (
                <TableRow key={r.id} className="hover:bg-slate-50/70" data-testid={`row-${r.id}`}>
                  {tab === "contacts" && (<><TableCell className="font-medium">{r.name}</TableCell><TableCell className="text-slate-600">{r.email}</TableCell><TableCell className="text-slate-600">{r.phone}</TableCell><TableCell className="text-slate-600 max-w-[200px] truncate">{r.subject || "—"}</TableCell></>)}
                  {tab === "agents" && (<><TableCell className="font-medium">{r.name}</TableCell><TableCell className="text-slate-600"><div>{r.email}</div><div className="text-xs text-slate-400">{r.mobile}</div></TableCell><TableCell className="text-slate-600">{r.city}, {r.district}<div className="text-xs text-slate-400">{r.state} · {r.pincode}</div></TableCell><TableCell className="text-slate-600">{r.project || "General"}{r.role ? <div className="text-xs text-slate-400">{r.role}</div> : null}</TableCell></>)}
                  {tab === "careers" && (<><TableCell className="font-medium">{r.name}</TableCell><TableCell className="text-slate-600"><div>{r.email}</div><div className="text-xs text-slate-400">{r.phone}</div></TableCell><TableCell className="text-slate-600">{r.position}</TableCell><TableCell><button onClick={() => window.open(`${API}/admin/leads/careers/${r.id}/resume?auth=${token}`, "_blank")} data-testid={`resume-${r.id}`} className="inline-flex items-center gap-1 text-royal text-sm font-medium"><FileText className="h-4 w-4" /> View</button></TableCell></>)}
                  <TableCell className="text-slate-500 text-sm whitespace-nowrap">{new Date(r.created_at).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</TableCell>
                  <TableCell><Select value={r.status} onValueChange={(v) => changeStatus(r.id, v)}><SelectTrigger className={`h-8 w-32 rounded-sm border text-xs font-medium ${STATUS_STYLES[r.status] || ""}`} data-testid={`status-${r.id}`}><SelectValue /></SelectTrigger><SelectContent>{STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent></Select></TableCell>
                  <TableCell className="text-right"><button onClick={() => setNoteFor(r)} data-testid={`note-${r.id}`} className="inline-flex items-center gap-1 text-slate-500 hover:text-royal text-sm"><StickyNote className="h-4 w-4" />{r.notes?.length ? <span className="text-xs">{r.notes.length}</span> : null}</button></TableCell>
                </TableRow>))}</TableBody></Table>}
        </div>
      </div>
      <Dialog open={!!noteFor} onOpenChange={(o) => { if (!o) { setNoteFor(null); setNoteText(""); } }}>
        <DialogContent className="max-w-lg rounded-sm" data-testid="notes-dialog">
          <DialogHeader><DialogTitle className="font-heading">{noteFor?.name} — Details & Notes</DialogTitle></DialogHeader>
          {noteFor && (<div className="space-y-4">
            <div className="bg-slate-50 border rounded-sm p-4 text-sm space-y-1 max-h-40 overflow-y-auto">{Object.entries(noteFor).filter(([k]) => !["id", "notes", "type", "status", "resume_path", "resume_content_type", "created_at"].includes(k)).map(([k, v]) => (<div key={k} className="flex gap-2"><span className="text-slate-400 capitalize w-28 shrink-0">{k}:</span><span className="text-slate-700 break-words">{String(v) || "—"}</span></div>))}</div>
            <div><div className="text-xs uppercase tracking-wider text-slate-500 font-semibold mb-2">Internal Notes</div><div className="space-y-2 max-h-40 overflow-y-auto">{noteFor.notes?.length ? noteFor.notes.map((n, i) => (<div key={i} className="bg-royal/5 border-l-2 border-royal rounded-sm p-3 text-sm"><p className="text-slate-700">{n.text}</p><p className="text-xs text-slate-400 mt-1">{n.by} · {new Date(n.at).toLocaleString("en-IN")}</p></div>)) : <p className="text-slate-400 text-sm">No notes yet.</p>}</div></div>
            <div className="flex gap-2"><Textarea value={noteText} onChange={(e) => setNoteText(e.target.value)} placeholder="Add a note…" rows={2} className="rounded-sm" data-testid="note-textarea" /><Button onClick={saveNote} data-testid="save-note" className="bg-royal text-white rounded-sm self-end">Add</Button></div>
          </div>)}
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* ---------------- MEDIA ---------------- */
function Media({ token }) {
  const [folder, setFolder] = useState("all");
  const [q, setQ] = useState("");
  const [items, setItems] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [upFolder, setUpFolder] = useState("General");
  const load = useCallback(async () => { try { const { data } = await api.get("/admin/media", { params: { folder } }); setItems(data); } catch { toast.error("Failed"); } }, [folder]);
  useEffect(() => { load(); }, [load]);
  const shown = items.filter((m) => (m.original_filename || "").toLowerCase().includes(q.toLowerCase()));
  const upload = async (e) => { const f = e.target.files[0]; if (!f) return; setUploading(true); try { const fd = new FormData(); fd.append("folder", upFolder); fd.append("file", f); await api.post("/admin/media", fd, { headers: { "Content-Type": "multipart/form-data" } }); toast.success("Uploaded"); load(); } catch (err) { toast.error(formatApiError(err.response?.data?.detail) || "Upload failed"); } finally { setUploading(false); e.target.value = ""; } };
  const del = async (id) => { if (!window.confirm("Delete this file?")) return; try { await api.delete(`/admin/media/${id}`); setItems((x) => x.filter((i) => i.id !== id)); toast.success("Deleted"); } catch { toast.error("Failed"); } };
  return (
    <div>
      <div className="flex flex-wrap gap-3 mb-5 items-center">
        <div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" /><Input data-testid="media-search" placeholder="Search files…" value={q} onChange={(e) => setQ(e.target.value)} className="pl-9 h-10 rounded-sm w-52" /></div>
        <Select value={folder} onValueChange={setFolder}><SelectTrigger className="w-44 h-10 rounded-sm" data-testid="media-folder-filter"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">All Folders</SelectItem>{MEDIA_FOLDERS.map((f) => <SelectItem key={f} value={f}>{f}</SelectItem>)}</SelectContent></Select>
        <div className="ml-auto flex gap-2 items-center">
          <Select value={upFolder} onValueChange={setUpFolder}><SelectTrigger className="w-40 h-10 rounded-sm" data-testid="media-upload-folder"><SelectValue /></SelectTrigger><SelectContent>{MEDIA_FOLDERS.map((f) => <SelectItem key={f} value={f}>{f}</SelectItem>)}</SelectContent></Select>
          <label className="inline-flex items-center gap-2 bg-royal hover:bg-royal-dark text-white px-4 h-10 rounded-sm cursor-pointer text-sm font-medium" data-testid="media-upload">{uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />} Upload<input type="file" className="hidden" onChange={upload} accept="image/*,video/*,.pdf,.docx" /></label>
        </div>
      </div>
      {shown.length === 0 ? <div className="py-20 text-center text-slate-400"><FolderOpen className="h-10 w-10 mx-auto mb-3 opacity-40" />No media found.</div>
        : <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">{shown.map((m) => { const url = `${API}/admin/media/${m.id}/file?auth=${token}`; const isImg = (m.content_type || "").startsWith("image"); return (
          <div key={m.id} className="bg-white border border-slate-200 rounded-sm overflow-hidden group" data-testid={`media-${m.id}`}>
            <div className="aspect-square bg-slate-100 flex items-center justify-center overflow-hidden">{isImg ? <img src={url} alt={m.original_filename} loading="lazy" className="w-full h-full object-cover" /> : <FileText className="h-10 w-10 text-slate-400" />}</div>
            <div className="p-2"><p className="text-xs text-slate-600 truncate" title={m.original_filename}>{m.original_filename}</p><p className="text-[10px] text-gold uppercase">{m.folder}</p>
              <div className="flex items-center justify-between mt-1">
                <button onClick={() => { navigator.clipboard.writeText(url); toast.success("URL copied — reuse it anywhere"); }} data-testid={`media-copy-${m.id}`} className="text-[10px] text-royal font-medium">Copy URL</button>
                <div className="flex gap-2"><a href={url} target="_blank" rel="noreferrer" className="text-slate-500"><ExternalLink className="h-3.5 w-3.5" /></a><button onClick={() => del(m.id)} data-testid={`media-del-${m.id}`} className="text-rose-500"><Trash2 className="h-3.5 w-3.5" /></button></div>
              </div></div>
          </div>); })}</div>}
    </div>
  );
}

/* ---------------- CAREERS OPENINGS ---------------- */
function Openings() {
  const [items, setItems] = useState([]);
  const [edit, setEdit] = useState(null);
  const blank = { title: "", type: "Full-time", location: "", desc: "", status: "open" };
  const load = async () => { try { const { data } = await api.get("/admin/openings"); setItems(data); } catch { toast.error("Failed"); } };
  useEffect(() => { load(); }, []);
  const save = async () => { if (!edit.title) { toast.error("Title required"); return; } try { if (edit.id) await api.put(`/admin/openings/${edit.id}`, edit); else await api.post("/admin/openings", edit); toast.success("Saved"); setEdit(null); load(); } catch { toast.error("Failed"); } };
  const del = async (id) => { if (!window.confirm("Delete?")) return; try { await api.delete(`/admin/openings/${id}`); load(); toast.success("Deleted"); } catch { toast.error("Failed"); } };
  return (
    <div>
      <div className="flex justify-end mb-4"><Button onClick={() => setEdit(blank)} data-testid="opening-add" className="bg-royal text-white rounded-sm"><Plus className="h-4 w-4 mr-1" /> Add Opening</Button></div>
      <div className="bg-white border border-slate-200 rounded-sm overflow-x-auto">
        <Table><TableHeader><TableRow className="bg-slate-50"><TableHead>Title</TableHead><TableHead>Type</TableHead><TableHead>Location</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
          <TableBody>{items.map((o) => (<TableRow key={o.id} data-testid={`opening-row-${o.id}`}><TableCell className="font-medium">{o.title}</TableCell><TableCell>{o.type}</TableCell><TableCell>{o.location}</TableCell><TableCell><span className={`text-xs px-2 py-1 rounded-sm ${o.status === "open" ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>{o.status}</span></TableCell><TableCell className="text-right"><button onClick={() => setEdit(o)} className="text-royal mr-3" data-testid={`opening-edit-${o.id}`}><Pencil className="h-4 w-4" /></button><button onClick={() => del(o.id)} className="text-rose-500" data-testid={`opening-del-${o.id}`}><Trash2 className="h-4 w-4" /></button></TableCell></TableRow>))}</TableBody></Table>
        {items.length === 0 && <div className="py-12 text-center text-slate-400">No openings yet.</div>}
      </div>
      <Dialog open={!!edit} onOpenChange={(o) => !o && setEdit(null)}><DialogContent className="rounded-sm" data-testid="opening-dialog"><DialogHeader><DialogTitle>{edit?.id ? "Edit" : "New"} Opening</DialogTitle></DialogHeader>{edit && (<div className="space-y-4">
        <div><Label className="mb-1 block">Title</Label><Input value={edit.title} onChange={(e) => setEdit({ ...edit, title: e.target.value })} data-testid="opening-title" className="rounded-sm" /></div>
        <div className="grid grid-cols-2 gap-3"><div><Label className="mb-1 block">Type</Label><Input value={edit.type} onChange={(e) => setEdit({ ...edit, type: e.target.value })} className="rounded-sm" /></div><div><Label className="mb-1 block">Location</Label><Input value={edit.location} onChange={(e) => setEdit({ ...edit, location: e.target.value })} className="rounded-sm" /></div></div>
        <div><Label className="mb-1 block">Description</Label><Textarea value={edit.desc} onChange={(e) => setEdit({ ...edit, desc: e.target.value })} rows={3} className="rounded-sm" /></div>
        <div><Label className="mb-1 block">Status</Label><Select value={edit.status} onValueChange={(v) => setEdit({ ...edit, status: v })}><SelectTrigger className="rounded-sm"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="open">Open</SelectItem><SelectItem value="closed">Closed</SelectItem></SelectContent></Select></div>
      </div>)}<DialogFooter><Button onClick={save} data-testid="opening-save" className="bg-royal text-white rounded-sm">Save</Button></DialogFooter></DialogContent></Dialog>
    </div>
  );
}

/* ---------------- DOWNLOADS ---------------- */
function Downloads() {
  const [items, setItems] = useState([]);
  const [f, setF] = useState({ label: "", type: "PDF", url: "", category: "General" });
  const load = async () => { try { const { data } = await api.get("/admin/downloads"); setItems(data); } catch { toast.error("Failed"); } };
  useEffect(() => { load(); }, []);
  const add = async () => { if (!f.label) { toast.error("Label required"); return; } try { await api.post("/admin/downloads", f); setF({ label: "", type: "PDF", url: "", category: "General" }); load(); toast.success("Added"); } catch { toast.error("Failed"); } };
  const del = async (id) => { try { await api.delete(`/admin/downloads/${id}`); load(); } catch { toast.error("Failed"); } };
  return (
    <div className="space-y-5">
      <div className="bg-white border border-slate-200 rounded-sm p-5 grid sm:grid-cols-5 gap-3 items-end">
        <div className="sm:col-span-2"><Label className="mb-1 block">Label</Label><Input value={f.label} onChange={(e) => setF({ ...f, label: e.target.value })} data-testid="download-label" className="rounded-sm" /></div>
        <div><Label className="mb-1 block">Type</Label><Input value={f.type} onChange={(e) => setF({ ...f, type: e.target.value })} className="rounded-sm" /></div>
        <div><Label className="mb-1 block">URL</Label><Input value={f.url} onChange={(e) => setF({ ...f, url: e.target.value })} placeholder="media URL" className="rounded-sm" /></div>
        <Button onClick={add} data-testid="download-add" className="bg-royal text-white rounded-sm"><Plus className="h-4 w-4 mr-1" /> Add</Button>
      </div>
      <div className="bg-white border border-slate-200 rounded-sm overflow-x-auto"><Table><TableHeader><TableRow className="bg-slate-50"><TableHead>Label</TableHead><TableHead>Type</TableHead><TableHead>Category</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader><TableBody>{items.map((d) => (<TableRow key={d.id}><TableCell className="font-medium">{d.label}</TableCell><TableCell>{d.type}</TableCell><TableCell>{d.category}</TableCell><TableCell className="text-right">{d.url && <a href={d.url} target="_blank" rel="noreferrer" className="text-royal mr-3 inline-block"><ExternalLink className="h-4 w-4" /></a>}<button onClick={() => del(d.id)} className="text-rose-500"><Trash2 className="h-4 w-4" /></button></TableCell></TableRow>))}</TableBody></Table>{items.length === 0 && <div className="py-12 text-center text-slate-400">No downloads yet.</div>}</div>
    </div>
  );
}

/* ---------------- PROJECTS ---------------- */
function Projects() {
  const [items, setItems] = useState([]);
  const [edit, setEdit] = useState(null);
  const blank = { slug: "", name: "", tagline: "", coverage: "South India", hero: "", order: 99, status: "published" };
  const load = async () => { try { const { data } = await api.get("/admin/projects"); setItems(data); } catch { toast.error("Failed"); } };
  useEffect(() => { load(); }, []);
  const save = async () => { if (!edit.name || !edit.slug) { toast.error("Name & slug required"); return; } try { const body = { data: edit }; if (edit.id) await api.put(`/admin/projects/${edit.id}`, body); else await api.post("/admin/projects", body); toast.success("Saved"); setEdit(null); load(); } catch { toast.error("Failed"); } };
  const del = async (id) => { if (!window.confirm("Delete project?")) return; try { await api.delete(`/admin/projects/${id}`); load(); } catch { toast.error("Failed"); } };
  return (
    <div>
      <p className="text-sm text-slate-500 mb-4 bg-amber-50 border border-amber-200 rounded-sm p-3">Manage project cards shown in listings. Full rich project detail content (objectives, FAQs, process) for the two flagship projects is maintained in code for pixel-perfect layout.</p>
      <div className="flex justify-end mb-4"><Button onClick={() => setEdit(blank)} data-testid="project-add" className="bg-royal text-white rounded-sm"><Plus className="h-4 w-4 mr-1" /> Add Project</Button></div>
      <div className="bg-white border border-slate-200 rounded-sm overflow-x-auto"><Table><TableHeader><TableRow className="bg-slate-50"><TableHead>Name</TableHead><TableHead>Slug</TableHead><TableHead>Coverage</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader><TableBody>{items.map((p) => (<TableRow key={p.id}><TableCell className="font-medium">{p.name}</TableCell><TableCell>{p.slug}</TableCell><TableCell>{p.coverage}</TableCell><TableCell>{p.status}</TableCell><TableCell className="text-right"><button onClick={() => setEdit(p)} className="text-royal mr-3"><Pencil className="h-4 w-4" /></button><button onClick={() => del(p.id)} className="text-rose-500"><Trash2 className="h-4 w-4" /></button></TableCell></TableRow>))}</TableBody></Table></div>
      <Dialog open={!!edit} onOpenChange={(o) => !o && setEdit(null)}><DialogContent className="rounded-sm" data-testid="project-dialog"><DialogHeader><DialogTitle>{edit?.id ? "Edit" : "New"} Project</DialogTitle></DialogHeader>{edit && (<div className="space-y-3">
        <div className="grid grid-cols-2 gap-3"><div><Label className="mb-1 block">Name</Label><Input value={edit.name} onChange={(e) => setEdit({ ...edit, name: e.target.value })} data-testid="project-name" className="rounded-sm" /></div><div><Label className="mb-1 block">Slug</Label><Input value={edit.slug} onChange={(e) => setEdit({ ...edit, slug: e.target.value })} className="rounded-sm" /></div></div>
        <div><Label className="mb-1 block">Tagline</Label><Input value={edit.tagline} onChange={(e) => setEdit({ ...edit, tagline: e.target.value })} className="rounded-sm" /></div>
        <div className="grid grid-cols-2 gap-3"><div><Label className="mb-1 block">Coverage</Label><Input value={edit.coverage} onChange={(e) => setEdit({ ...edit, coverage: e.target.value })} className="rounded-sm" /></div><div><Label className="mb-1 block">Hero image URL</Label><Input value={edit.hero} onChange={(e) => setEdit({ ...edit, hero: e.target.value })} className="rounded-sm" /></div></div>
      </div>)}<DialogFooter><Button onClick={save} data-testid="project-save" className="bg-royal text-white rounded-sm">Save</Button></DialogFooter></DialogContent></Dialog>
    </div>
  );
}

/* ---------------- USERS ---------------- */
function UsersManager({ currentEmail }) {
  const [items, setItems] = useState([]);
  const [edit, setEdit] = useState(null);
  const blank = { name: "", email: "", password: "", role: "operations" };
  const load = async () => { try { const { data } = await api.get("/admin/users"); setItems(data); } catch { toast.error("Failed"); } };
  useEffect(() => { load(); }, []);
  const save = async () => {
    try {
      if (edit.id) { const body = { name: edit.name, role: edit.role }; if (edit.password) body.password = edit.password; await api.put(`/admin/users/${edit.id}`, body); }
      else { if (!edit.name || !edit.email || !edit.password) { toast.error("All fields required"); return; } await api.post("/admin/users", edit); }
      toast.success("Saved"); setEdit(null); load();
    } catch (err) { toast.error(formatApiError(err.response?.data?.detail) || "Failed"); }
  };
  const del = async (id) => { if (!window.confirm("Delete user?")) return; try { await api.delete(`/admin/users/${id}`); load(); toast.success("Deleted"); } catch (err) { toast.error(formatApiError(err.response?.data?.detail) || "Failed"); } };
  return (
    <div>
      <div className="flex justify-end mb-4"><Button onClick={() => setEdit(blank)} data-testid="user-add" className="bg-royal text-white rounded-sm"><UserPlus className="h-4 w-4 mr-1" /> Add User</Button></div>
      <div className="bg-white border border-slate-200 rounded-sm overflow-x-auto"><Table><TableHeader><TableRow className="bg-slate-50"><TableHead>Name</TableHead><TableHead>Email</TableHead><TableHead>Role</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader><TableBody>{items.map((u) => (<TableRow key={u.id} data-testid={`user-row-${u.id}`}><TableCell className="font-medium">{u.name}</TableCell><TableCell>{u.email}</TableCell><TableCell><span className="text-xs px-2 py-1 rounded-sm bg-royal/10 text-royal uppercase">{u.role?.replace("_", " ")}</span></TableCell><TableCell className="text-right"><button onClick={() => setEdit({ ...u, password: "" })} className="text-royal mr-3" data-testid={`user-edit-${u.id}`}><Pencil className="h-4 w-4" /></button>{u.email !== currentEmail && <button onClick={() => del(u.id)} className="text-rose-500" data-testid={`user-del-${u.id}`}><Trash2 className="h-4 w-4" /></button>}</TableCell></TableRow>))}</TableBody></Table></div>
      <Dialog open={!!edit} onOpenChange={(o) => !o && setEdit(null)}><DialogContent className="rounded-sm" data-testid="user-dialog"><DialogHeader><DialogTitle>{edit?.id ? "Edit User" : "New User"}</DialogTitle></DialogHeader>{edit && (<div className="space-y-3">
        <div><Label className="mb-1 block">Name</Label><Input value={edit.name} onChange={(e) => setEdit({ ...edit, name: e.target.value })} data-testid="user-name" className="rounded-sm" /></div>
        {!edit.id && <div><Label className="mb-1 block">Email</Label><Input type="email" value={edit.email} onChange={(e) => setEdit({ ...edit, email: e.target.value })} data-testid="user-email" className="rounded-sm" /></div>}
        <div><Label className="mb-1 block">{edit.id ? "New Password (leave blank to keep)" : "Password"}</Label><Input type="text" value={edit.password} onChange={(e) => setEdit({ ...edit, password: e.target.value })} data-testid="user-password" className="rounded-sm" /></div>
        <div><Label className="mb-1 block">Role</Label><Select value={edit.role} onValueChange={(v) => setEdit({ ...edit, role: v })}><SelectTrigger className="rounded-sm" data-testid="user-role"><SelectValue /></SelectTrigger><SelectContent>{ROLES.map((r) => <SelectItem key={r} value={r}>{r.replace("_", " ")}</SelectItem>)}</SelectContent></Select></div>
      </div>)}<DialogFooter><Button onClick={save} data-testid="user-save" className="bg-royal text-white rounded-sm">Save</Button></DialogFooter></DialogContent></Dialog>
    </div>
  );
}

/* ---------------- ACTIVITY ---------------- */
function ActivityLog() {
  const [items, setItems] = useState([]);
  useEffect(() => { api.get("/admin/activity").then((r) => setItems(r.data)).catch(() => {}); }, []);
  return (
    <div className="bg-white border border-slate-200 rounded-sm overflow-x-auto" data-testid="activity-table">
      <Table><TableHeader><TableRow className="bg-slate-50"><TableHead>Date & Time</TableHead><TableHead>User</TableHead><TableHead>Action</TableHead><TableHead>Detail</TableHead><TableHead>IP</TableHead></TableRow></TableHeader>
        <TableBody>{items.map((a) => (<TableRow key={a.id}><TableCell className="whitespace-nowrap text-sm">{new Date(a.at).toLocaleString("en-IN")}</TableCell><TableCell className="text-sm">{a.user}</TableCell><TableCell className="text-sm font-medium">{a.action}</TableCell><TableCell className="text-sm text-slate-500">{a.detail}</TableCell><TableCell className="text-xs text-slate-400">{a.ip}</TableCell></TableRow>))}</TableBody></Table>
      {items.length === 0 && <div className="py-12 text-center text-slate-400">No activity recorded yet.</div>}
    </div>
  );
}

/* ---------------- SETTINGS ---------------- */
function SettingsEditor() {
  const [d, setD] = useState(null);
  const [saving, setSaving] = useState(false);
  useEffect(() => { api.get("/admin/settings").then((r) => setD(r.data || {})).catch(() => setD({})); }, []);
  const save = async () => { setSaving(true); try { await api.put("/admin/settings", { data: d }); toast.success("Settings saved — changes are live"); } catch { toast.error("Failed"); } finally { setSaving(false); } };
  if (!d) return <Loader2 className="h-6 w-6 animate-spin text-royal" />;
  const fields = [
    ["company_name", "Company Name"], ["positioning", "Positioning"], ["tagline", "Tagline"],
    ["hero_headline", "Hero Headline"], ["hero_subheadline", "Hero Subheadline"], ["hero_image", "Hero Image URL"],
    ["address", "Office Address"], ["phone", "Phone"], ["whatsapp", "WhatsApp"], ["email", "Email"],
    ["hours", "Business Hours"], ["founder_name", "Founder Name"], ["founder_title", "Founder Title"],
    ["company_description", "Company Description (footer)"], ["footer_note", "Footer Note"],
    ["linkedin", "LinkedIn URL"], ["facebook", "Facebook URL"], ["instagram", "Instagram URL"],
    ["youtube", "YouTube URL"], ["twitter", "X / Twitter URL"],
    ["seo_description", "Default SEO Description"], ["partnership", "Strategic Partnership Statement"],
  ];
  const wide = ["seo_description", "partnership", "address", "hero_subheadline", "company_description"];
  return (
    <div className="bg-white border border-slate-200 rounded-sm p-6 lg:p-8 max-w-3xl" data-testid="settings-form">
      <div className="grid sm:grid-cols-2 gap-4">
        {fields.map(([k, label]) => (
          <div key={k} className={wide.includes(k) ? "sm:col-span-2" : ""}>
            <Label className="mb-1 block">{label}</Label>
            {wide.includes(k)
              ? <Textarea value={d[k] || ""} onChange={(e) => setD({ ...d, [k]: e.target.value })} rows={2} className="rounded-sm" data-testid={`set-${k}`} />
              : <Input value={d[k] || ""} onChange={(e) => setD({ ...d, [k]: e.target.value })} className="rounded-sm" data-testid={`set-${k}`} />}
          </div>
        ))}
      </div>
      <div className="mt-6 border-t border-slate-200 pt-6 grid sm:grid-cols-2 gap-4">
        <div><Label className="mb-1 block">Maintenance Mode</Label><Select value={d.maintenance_mode ? "on" : "off"} onValueChange={(v) => setD({ ...d, maintenance_mode: v === "on" })}><SelectTrigger className="rounded-sm" data-testid="set-maintenance"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="off">Off — site is live</SelectItem><SelectItem value="on">On — show maintenance page</SelectItem></SelectContent></Select></div>
        <div><Label className="mb-1 block">Maintenance Message</Label><Input value={d.maintenance_message || ""} onChange={(e) => setD({ ...d, maintenance_message: e.target.value })} className="rounded-sm" data-testid="set-maintenance_message" /></div>
      </div>
      <Button onClick={save} disabled={saving} data-testid="settings-save" className="mt-6 bg-royal text-white rounded-sm h-11 px-8">{saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null} Save Settings</Button>
    </div>
  );
}
