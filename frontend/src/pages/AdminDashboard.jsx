import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  LayoutDashboard, Mail, Users, Briefcase, LogOut, Search, Download,
  FileText, StickyNote, Loader2, Inbox, TrendingUp, Menu, X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Logo } from "@/components/Logo";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import api, { API } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

const STATUSES = ["New", "Contacted", "Pending", "Approved", "Rejected"];
const STATUS_STYLES = {
  New: "bg-blue-50 text-blue-700 border-blue-200",
  Contacted: "bg-amber-50 text-amber-700 border-amber-200",
  Pending: "bg-slate-100 text-slate-700 border-slate-200",
  Approved: "bg-emerald-50 text-emerald-700 border-emerald-200",
  Rejected: "bg-rose-50 text-rose-700 border-rose-200",
};

const TABS = [
  { key: "contacts", label: "Contact Forms", icon: Mail },
  { key: "agents", label: "Agent Applications", icon: Users },
  { key: "careers", label: "Career Applications", icon: Briefcase },
];

export default function AdminDashboard() {
  const { user, logout, token } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState("contacts");
  const [stats, setStats] = useState({ contacts: 0, agents: 0, careers: 0, new_leads: 0, total: 0 });
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [sort, setSort] = useState("newest");
  const [noteFor, setNoteFor] = useState(null);
  const [noteText, setNoteText] = useState("");
  const [sidebar, setSidebar] = useState(false);

  const loadStats = useCallback(async () => {
    try { const { data } = await api.get("/admin/stats"); setStats(data); } catch { /* ignore */ }
  }, []);

  const loadRows = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/admin/${tab}`, { params: { search, status, sort } });
      setRows(data);
    } catch { toast.error("Failed to load records"); }
    finally { setLoading(false); }
  }, [tab, search, status, sort]);

  useEffect(() => { loadStats(); }, [loadStats, rows.length]);
  useEffect(() => { const t = setTimeout(loadRows, 250); return () => clearTimeout(t); }, [loadRows]);

  const doLogout = async () => { await logout(); navigate("/admin/login"); };

  const changeStatus = async (id, newStatus) => {
    try {
      await api.patch(`/admin/${tab}/${id}/status`, { status: newStatus });
      setRows((r) => r.map((x) => (x.id === id ? { ...x, status: newStatus } : x)));
      toast.success(`Marked as ${newStatus}`);
      loadStats();
    } catch { toast.error("Update failed"); }
  };

  const saveNote = async () => {
    if (!noteText.trim()) return;
    try {
      const { data } = await api.post(`/admin/${tab}/${noteFor.id}/notes`, { note: noteText });
      setRows((r) => r.map((x) => (x.id === noteFor.id ? { ...x, notes: [...(x.notes || []), data.note] } : x)));
      setNoteFor((f) => ({ ...f, notes: [...(f.notes || []), data.note] }));
      setNoteText("");
      toast.success("Note added");
    } catch { toast.error("Failed to add note"); }
  };

  const exportCsv = async () => {
    try {
      const res = await api.get(`/admin/${tab}/export`, { responseType: "blob" });
      const url = URL.createObjectURL(res.data);
      const a = document.createElement("a");
      a.href = url; a.download = `${tab}_export.csv`; a.click();
      URL.revokeObjectURL(url);
      toast.success("Export downloaded");
    } catch { toast.error("Export failed"); }
  };

  const viewResume = (id) => {
    window.open(`${API}/admin/careers/${id}/resume?auth=${token}`, "_blank");
  };

  const statCards = [
    { label: "Total Records", value: stats.total, icon: Inbox, color: "text-royal" },
    { label: "New Leads", value: stats.new_leads, icon: TrendingUp, color: "text-emerald-600" },
    { label: "Contact Forms", value: stats.contacts, icon: Mail, color: "text-blue-600" },
    { label: "Agent Applications", value: stats.agents, icon: Users, color: "text-amber-600" },
  ];

  const columns = {
    contacts: ["Name", "Email", "Phone", "Subject"],
    agents: ["Name", "Contact", "Location", "Project / Role"],
    careers: ["Name", "Contact", "Position", "Resume"],
  };

  return (
    <div className="min-h-screen bg-slate-100 flex" data-testid="admin-dashboard">
      {/* SIDEBAR */}
      <aside className={`fixed lg:sticky top-0 z-40 h-screen w-64 bg-slate-950 text-white flex flex-col transition-transform ${sidebar ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}>
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src="/logo-skl.png" alt="SKL" className="h-9 w-9 object-contain" />
            <div className="font-heading font-bold text-sm tracking-tight">SKL CRM</div>
          </div>
          <button className="lg:hidden text-slate-400" onClick={() => setSidebar(false)}><X className="h-5 w-5" /></button>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          <div className="flex items-center gap-3 px-3 py-2.5 text-slate-300 text-sm font-medium"><LayoutDashboard className="h-4 w-4 text-gold" /> Dashboard</div>
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => { setTab(t.key); setSearch(""); setStatus("all"); setSidebar(false); }}
              data-testid={`tab-${t.key}`}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-sm text-sm font-medium transition-colors ${tab === t.key ? "bg-royal text-white" : "text-slate-400 hover:bg-slate-900 hover:text-white"}`}
            >
              <t.icon className="h-4 w-4" /> {t.label}
              <span className="ml-auto text-xs opacity-70">{stats[t.key]}</span>
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-slate-800">
          <div className="px-3 py-2 text-xs text-slate-500 truncate">{user?.email}</div>
          <button onClick={doLogout} data-testid="admin-logout" className="w-full flex items-center gap-3 px-3 py-2.5 rounded-sm text-sm font-medium text-slate-400 hover:bg-slate-900 hover:text-white transition-colors">
            <LogOut className="h-4 w-4" /> Sign Out
          </button>
        </div>
      </aside>
      {sidebar && <div className="fixed inset-0 bg-black/40 z-30 lg:hidden" onClick={() => setSidebar(false)} />}

      {/* MAIN */}
      <div className="flex-1 min-w-0">
        <header className="bg-white border-b border-slate-200 sticky top-0 z-20">
          <div className="px-5 lg:px-8 h-16 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button className="lg:hidden text-slate-600" onClick={() => setSidebar(true)}><Menu className="h-5 w-5" /></button>
              <h1 className="font-heading text-lg font-bold text-slate-900">{TABS.find((t) => t.key === tab)?.label}</h1>
            </div>
            <Button onClick={exportCsv} data-testid="export-csv" variant="outline" className="rounded-sm border-slate-300 h-9 text-sm">
              <Download className="h-4 w-4 mr-2" /> Export CSV
            </Button>
          </div>
        </header>

        <div className="p-5 lg:p-8">
          {/* STATS */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {statCards.map((s) => (
              <div key={s.label} className="bg-white border border-slate-200 rounded-sm p-5" data-testid={`stat-card-${s.label.toLowerCase().replace(/\s+/g, "-")}`}>
                <div className="flex items-center justify-between">
                  <span className="text-xs uppercase tracking-wider text-slate-500 font-semibold">{s.label}</span>
                  <s.icon className={`h-4 w-4 ${s.color}`} />
                </div>
                <div className="mt-2 font-heading text-3xl font-bold text-slate-900">{s.value}</div>
              </div>
            ))}
          </div>

          {/* TOOLBAR */}
          <div className="bg-white border border-slate-200 rounded-sm">
            <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input data-testid="search-input" placeholder="Search name, email, phone…" value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 h-10 rounded-sm border-slate-300" />
              </div>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger className="w-full sm:w-44 h-10 rounded-sm border-slate-300" data-testid="filter-status"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  {STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={sort} onValueChange={setSort}>
                <SelectTrigger className="w-full sm:w-40 h-10 rounded-sm border-slate-300" data-testid="sort-select"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="oldest">Oldest First</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* TABLE */}
            <div className="overflow-x-auto">
              {loading ? (
                <div className="py-20 flex justify-center"><Loader2 className="h-6 w-6 animate-spin text-royal" /></div>
              ) : rows.length === 0 ? (
                <div className="py-20 text-center text-slate-400" data-testid="empty-state">
                  <Inbox className="h-10 w-10 mx-auto mb-3 opacity-40" />
                  No records found.
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50">
                      {columns[tab].map((c) => <TableHead key={c} className="text-xs uppercase tracking-wider text-slate-500 font-semibold">{c}</TableHead>)}
                      <TableHead className="text-xs uppercase tracking-wider text-slate-500 font-semibold">Date</TableHead>
                      <TableHead className="text-xs uppercase tracking-wider text-slate-500 font-semibold">Status</TableHead>
                      <TableHead className="text-right text-xs uppercase tracking-wider text-slate-500 font-semibold">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rows.map((r) => (
                      <TableRow key={r.id} className="hover:bg-slate-50/70" data-testid={`row-${r.id}`}>
                        {tab === "contacts" && (<>
                          <TableCell className="font-medium text-slate-900">{r.name}</TableCell>
                          <TableCell className="text-slate-600">{r.email}</TableCell>
                          <TableCell className="text-slate-600">{r.phone}</TableCell>
                          <TableCell className="text-slate-600 max-w-[200px] truncate">{r.subject || "—"}</TableCell>
                        </>)}
                        {tab === "agents" && (<>
                          <TableCell className="font-medium text-slate-900">{r.name}</TableCell>
                          <TableCell className="text-slate-600"><div>{r.email}</div><div className="text-xs text-slate-400">{r.mobile}</div></TableCell>
                          <TableCell className="text-slate-600">{r.city}, {r.district}<div className="text-xs text-slate-400">{r.state} · {r.pincode}</div></TableCell>
                          <TableCell className="text-slate-600">{r.project || "General"}{r.role ? <div className="text-xs text-slate-400">{r.role}</div> : null}</TableCell>
                        </>)}
                        {tab === "careers" && (<>
                          <TableCell className="font-medium text-slate-900">{r.name}</TableCell>
                          <TableCell className="text-slate-600"><div>{r.email}</div><div className="text-xs text-slate-400">{r.phone}</div></TableCell>
                          <TableCell className="text-slate-600">{r.position}{r.experience ? <div className="text-xs text-slate-400">{r.experience}</div> : null}</TableCell>
                          <TableCell>
                            <button onClick={() => viewResume(r.id)} data-testid={`resume-${r.id}`} className="inline-flex items-center gap-1 text-royal hover:text-royal-dark text-sm font-medium">
                              <FileText className="h-4 w-4" /> View
                            </button>
                          </TableCell>
                        </>)}
                        <TableCell className="text-slate-500 text-sm whitespace-nowrap">{new Date(r.created_at).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</TableCell>
                        <TableCell>
                          <Select value={r.status} onValueChange={(v) => changeStatus(r.id, v)}>
                            <SelectTrigger className={`h-8 w-32 rounded-sm border text-xs font-medium ${STATUS_STYLES[r.status] || ""}`} data-testid={`status-${r.id}`}><SelectValue /></SelectTrigger>
                            <SelectContent>{STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell className="text-right">
                          <button onClick={() => setNoteFor(r)} data-testid={`note-${r.id}`} className="inline-flex items-center gap-1 text-slate-500 hover:text-royal text-sm">
                            <StickyNote className="h-4 w-4" />{r.notes?.length ? <span className="text-xs">{r.notes.length}</span> : null}
                          </button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* NOTES / DETAIL DIALOG */}
      <Dialog open={!!noteFor} onOpenChange={(o) => { if (!o) { setNoteFor(null); setNoteText(""); } }}>
        <DialogContent className="max-w-lg rounded-sm" data-testid="notes-dialog">
          <DialogHeader><DialogTitle className="font-heading">{noteFor?.name} — Details &amp; Notes</DialogTitle></DialogHeader>
          {noteFor && (
            <div className="space-y-4">
              <div className="bg-slate-50 border border-slate-200 rounded-sm p-4 text-sm space-y-1 max-h-40 overflow-y-auto">
                {Object.entries(noteFor).filter(([k]) => !["id", "notes", "type", "status", "resume_path", "resume_content_type", "created_at"].includes(k)).map(([k, v]) => (
                  <div key={k} className="flex gap-2"><span className="text-slate-400 capitalize w-28 shrink-0">{k}:</span><span className="text-slate-700 break-words">{String(v) || "—"}</span></div>
                ))}
              </div>
              <div>
                <div className="text-xs uppercase tracking-wider text-slate-500 font-semibold mb-2">Internal Notes</div>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {noteFor.notes?.length ? noteFor.notes.map((n, i) => (
                    <div key={i} className="bg-royal/5 border-l-2 border-royal rounded-sm p-3 text-sm">
                      <p className="text-slate-700">{n.text}</p>
                      <p className="text-xs text-slate-400 mt-1">{n.by} · {new Date(n.at).toLocaleString("en-IN")}</p>
                    </div>
                  )) : <p className="text-slate-400 text-sm">No notes yet.</p>}
                </div>
              </div>
              <div className="flex gap-2">
                <Textarea value={noteText} onChange={(e) => setNoteText(e.target.value)} placeholder="Add an internal note…" rows={2} className="rounded-sm border-slate-300" data-testid="note-textarea" />
                <Button onClick={saveNote} data-testid="save-note" className="bg-royal hover:bg-royal-dark text-white rounded-sm self-end">Add</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
