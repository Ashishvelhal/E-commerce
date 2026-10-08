import React, { useEffect, useState } from 'react';
import {
  Building2,
  Search,
  Loader2,
  Phone,
  Mail,
  Calendar,
  Package,
  MessageCircle,
  Clock,
  Trash2,
  Edit,
  Save,
  CheckCircle2,
  AlertCircle,
  FileText,
  ChevronLeft,
  ChevronRight,
  Filter,
  LayoutGrid,
  LayoutList,
} from 'lucide-react';
import { AdminNavbar } from '../../components/admin/AdminNavbar';
import { BulkInquiry } from '../../types';
import { useToastStore } from '../../store/useToastStore';
import { useSettingsStore } from '../../store/useSettingsStore';
import { formatDate } from '../../utils/formatters';
import { cleanWhatsAppPhone } from '../../utils/whatsapp';
import api from '../../services/api';

const STATUS_COLORS: Record<string, string> = {
  New: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  Contacted: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
  Quoted: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
  'In Production': 'bg-purple-500/15 text-purple-400 border-purple-500/30',
  Completed: 'bg-green-500/15 text-green-400 border-green-500/30',
  Declined: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
};

export const AdminBulkInquiriesPage: React.FC = () => {
  const { settings } = useSettingsStore();
  const { addToast } = useToastStore();

  const [inquiries, setInquiries] = useState<BulkInquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState<'cards' | 'list'>('cards');
  const [statusFilter, setStatusFilter] = useState('All');
  const [editingNotesId, setEditingNotesId] = useState<string | null>(null);
  const [notesDraft, setNotesDraft] = useState('');
  const [stats, setStats] = useState({ totalNew: 0, totalQuoted: 0, totalProduction: 0 });

  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const fetchInquiries = async () => {
    setLoading(true);
    try {
      const res = await api.get(
        `/bulk-inquiries?page=${page}&limit=15&status=${statusFilter}&search=${encodeURIComponent(search)}`
      );
      if (res.data?.success) {
        setInquiries(res.data.data || []);
        if (res.data.pagination) {
          setTotalPages(res.data.pagination.pages || 1);
          setTotalCount(res.data.pagination.total || 0);
        }
        if (res.data.stats) {
          setStats(res.data.stats);
        }
      }
    } catch (err: any) {
      console.error(err);
      addToast('Failed to load bulk inquiries', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInquiries();
  }, [page, statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchInquiries();
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      const res = await api.put(`/bulk-inquiries/${id}`, { status: newStatus });
      if (res.data?.success) {
        setInquiries((prev) =>
          prev.map((inq) => (inq._id === id ? { ...inq, status: newStatus as any } : inq))
        );
        addToast(`Lead status updated to ${newStatus}`, 'success');
      }
    } catch (err) {
      addToast('Failed to update status', 'error');
    }
  };

  const handleSaveNotes = async (id: string) => {
    try {
      const res = await api.put(`/bulk-inquiries/${id}`, { notes: notesDraft });
      if (res.data?.success) {
        setInquiries((prev) =>
          prev.map((inq) => (inq._id === id ? { ...inq, notes: notesDraft } : inq))
        );
        setEditingNotesId(null);
        addToast('Internal workshop notes saved', 'success');
      }
    } catch (err) {
      addToast('Failed to save notes', 'error');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this bulk inquiry lead?')) return;
    try {
      await api.delete(`/bulk-inquiries/${id}`);
      setInquiries((prev) => prev.filter((i) => i._id !== id));
      addToast('Inquiry removed', 'info');
    } catch (err) {
      addToast('Failed to delete inquiry', 'error');
    }
  };

  const handleSendWhatsAppQuote = (inq: BulkInquiry) => {
    const cleanPhone = cleanWhatsAppPhone(inq.phone);
    const message = `Hello *${inq.name}*! 👋

Thank you for your inquiry with *${settings.storeName || 'Rasin Arts Luxury Studio'}* regarding *${inq.estimatedQuantity} units* of *${inq.productInterest}* for *${inq.companyOrEvent}*.

We have reviewed your request and would love to assist you with custom metallic branding, resin color swirls, and luxury packaging.

Could we schedule a quick call or send across digital 3D sample renders for your approval?

Best regards,
*Artisan Director, Rasin Arts Studio*`;

    const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  return (
    <div>
      <AdminNavbar
        title="B2B Bulk Inquiries & Corporate Leads"
        subtitle="Manage custom quotes, corporate volume orders, and wedding favor leads"
      />

      <div className="p-3 xs:p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
        {/* KPI Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <div className="p-4 rounded-2xl bg-white border border-art-800 space-y-1">
            <span className="text-[10px] text-art-500 uppercase font-bold tracking-wider">
              Total Inquiries
            </span>
            <div className="text-xl sm:text-2xl font-black text-art-300 font-mono">
              {totalCount}
            </div>
            <span className="text-[11px] text-art-500">All registered B2B leads</span>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-art-800 space-y-1">
            <span className="text-[10px] text-emerald-500 uppercase font-bold tracking-wider">
              New Leads
            </span>
            <div className="text-xl sm:text-2xl font-black text-emerald-400 font-mono">
              {stats.totalNew}
            </div>
            <span className="text-[11px] text-emerald-500/80">Pending review / reply</span>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-art-800 space-y-1">
            <span className="text-[10px] text-amber-500 uppercase font-bold tracking-wider">
              Quoted Leads
            </span>
            <div className="text-xl sm:text-2xl font-black text-amber-400 font-mono">
              {stats.totalQuoted}
            </div>
            <span className="text-[11px] text-amber-500/80">Proposal / samples sent</span>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-art-800 space-y-1">
            <span className="text-[10px] text-purple-500 uppercase font-bold tracking-wider">
              In Production
            </span>
            <div className="text-xl sm:text-2xl font-black text-purple-400 font-mono">
              {stats.totalProduction}
            </div>
            <span className="text-[11px] text-purple-500/80">Workshop casting batch</span>
          </div>
        </div>

        {/* Filters & Search Toolbar */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-art-800">
          {/* Status Filter Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
            {['All', 'New', 'Contacted', 'Quoted', 'In Production', 'Completed', 'Declined'].map(
              (status) => (
                <button
                  key={status}
                  type="button"
                  onClick={() => {
                    setStatusFilter(status);
                    setPage(1);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                    statusFilter === status
                      ? 'bg-brand-500 text-white shadow-md'
                      : 'bg-art-950 text-art-400 hover:text-art-200 border border-art-800'
                  }`}
                >
                  {status}
                </button>
              )
            )}
          </div>

          {/* Search Input & View Toggle */}
          <div className="flex items-center gap-2.5 flex-wrap">
            {/* View Mode Toggle Switch */}
            <div className="flex items-center gap-1 p-1 bg-art-950 border border-art-800 rounded-xl shadow-xs">
              <button
                type="button"
                onClick={() => setViewMode('cards')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  viewMode === 'cards'
                    ? 'bg-brand-500 text-white shadow-sm'
                    : 'text-art-500 hover:text-art-300 hover:bg-art-900'
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>Cards</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('list')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  viewMode === 'list'
                    ? 'bg-brand-500 text-white shadow-sm'
                    : 'text-art-500 hover:text-art-300 hover:bg-art-900'
                }`}
              >
                <LayoutList className="w-3.5 h-3.5" />
                <span>List</span>
              </button>
            </div>

            <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-64 shrink-0">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-art-600" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search client, company, phone..."
                className="w-full bg-art-950 border border-art-800 rounded-xl pl-10 pr-4 py-2 text-xs text-art-200 placeholder-art-600 focus:outline-none focus:border-brand-500"
              />
            </form>
          </div>
        </div>

        {/* Inquiries List */}
        {loading ? (
          <div className="h-64 flex flex-col items-center justify-center gap-3 text-brand-600">
            <Loader2 className="w-8 h-8 animate-spin" />
            <span className="text-xs font-mono uppercase tracking-widest text-art-500">
              Loading B2B Inquiries...
            </span>
          </div>
        ) : inquiries.length === 0 ? (
          <div className="p-12 text-center bg-white border border-art-800 rounded-3xl text-art-500 space-y-2">
            <Building2 className="w-8 h-8 mx-auto text-art-600" />
            <h3 className="text-base font-bold text-art-300">No Inquiries Found</h3>
            <p className="text-xs">No bulk gifting or corporate inquiries match the selected filter.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {viewMode === 'cards' ? (
              /* CARDS VIEW */
              <div className="space-y-4">
                {inquiries.map((inq) => (
              <div
                key={inq._id}
                className="p-5 sm:p-6 rounded-3xl bg-white border border-art-800 shadow-sm space-y-4 hover:border-art-700 transition-all"
              >
                {/* Header Row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-art-800/80">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-bold text-art-300 font-sans">
                        {inq.companyOrEvent}
                      </span>
                      <span className="text-xs text-art-500">&bull;</span>
                      <span className="text-xs font-semibold text-art-400">
                        {inq.name}
                      </span>
                      <span
                        className={`text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full border ${
                          STATUS_COLORS[inq.status] || 'bg-art-800 text-art-400'
                        }`}
                      >
                        {inq.status}
                      </span>
                    </div>
                    <div className="text-[11px] text-art-500 flex items-center gap-2 flex-wrap">
                      <span>Submitted on {formatDate(inq.createdAt, 'full')}</span>
                      <span>&bull;</span>
                      <span className="text-brand-400 font-medium">{inq.eventType}</span>
                    </div>
                  </div>

                  {/* Pipeline Status Dropdown & WhatsApp Action */}
                  <div className="flex items-center gap-2 flex-wrap self-start sm:self-auto">
                    <select
                      value={inq.status}
                      onChange={(e) => handleStatusChange(inq._id, e.target.value)}
                      className="bg-art-950 border border-art-700 rounded-xl px-3 py-1.5 text-xs text-art-300 font-semibold focus:outline-none focus:border-brand-500"
                    >
                      <option value="New">New</option>
                      <option value="Contacted">Contacted</option>
                      <option value="Quoted">Quoted</option>
                      <option value="In Production">In Production</option>
                      <option value="Completed">Completed</option>
                      <option value="Declined">Declined</option>
                    </select>

                    <button
                      type="button"
                      onClick={() => handleSendWhatsAppQuote(inq)}
                      className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm active:scale-95 cursor-pointer"
                      title="Send WhatsApp Quote"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>WhatsApp Quote</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDelete(inq._id)}
                      className="p-1.5 rounded-xl bg-art-900 hover:bg-rose-500/20 text-art-500 hover:text-rose-400 border border-art-800 transition-colors"
                      title="Delete Inquiry"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  <div className="p-3 rounded-2xl bg-art-950 border border-art-800/80 space-y-1">
                    <span className="text-[10px] text-art-500 uppercase font-bold tracking-wider block">
                      Product &amp; Volume
                    </span>
                    <div className="text-xs font-bold text-art-300 truncate">
                      {inq.productInterest}
                    </div>
                    <div className="text-xs font-black text-brand-400 font-mono">
                      {inq.estimatedQuantity} Units
                    </div>
                  </div>

                  <div className="p-3 rounded-2xl bg-art-950 border border-art-800/80 space-y-1">
                    <span className="text-[10px] text-art-500 uppercase font-bold tracking-wider block">
                      Client Contact
                    </span>
                    <div className="text-xs font-mono font-bold text-art-300 flex items-center gap-1.5">
                      <Phone className="w-3 h-3 text-emerald-500 shrink-0" />
                      <span>{inq.phone}</span>
                    </div>
                    <div className="text-[11px] text-art-400 truncate flex items-center gap-1.5">
                      <Mail className="w-3 h-3 text-brand-400 shrink-0" />
                      <span>{inq.email}</span>
                    </div>
                  </div>

                  <div className="p-3 rounded-2xl bg-art-950 border border-art-800/80 space-y-1">
                    <span className="text-[10px] text-art-500 uppercase font-bold tracking-wider block">
                      Target Delivery Date
                    </span>
                    <div className="text-xs font-bold text-art-300 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                      <span>{inq.targetDate ? formatDate(inq.targetDate, 'short') : 'Flexible'}</span>
                    </div>
                    <div className="text-[10px] text-art-500">
                      Budget: {inq.budgetRange || 'Standard Tier'}
                    </div>
                  </div>

                  <div className="p-3 rounded-2xl bg-art-950 border border-art-800/80 space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] text-art-500 uppercase font-bold tracking-wider">
                        Internal Studio Notes
                      </span>
                      {editingNotesId !== inq._id && (
                        <button
                          type="button"
                          onClick={() => {
                            setEditingNotesId(inq._id);
                            setNotesDraft(inq.notes || '');
                          }}
                          className="text-[10px] text-brand-400 hover:underline flex items-center gap-1"
                        >
                          <Edit className="w-2.5 h-2.5" />
                          <span>Edit</span>
                        </button>
                      )}
                    </div>

                    {editingNotesId === inq._id ? (
                      <div className="space-y-1.5">
                        <textarea
                          rows={2}
                          value={notesDraft}
                          onChange={(e) => setNotesDraft(e.target.value)}
                          placeholder="e.g. Sample sent via courier. Waiting for logo SVG."
                          className="w-full bg-art-900 border border-art-700 rounded-lg p-1.5 text-[11px] text-art-200 focus:outline-none focus:border-brand-500"
                        />
                        <div className="flex items-center gap-1.5 justify-end">
                          <button
                            type="button"
                            onClick={() => setEditingNotesId(null)}
                            className="text-[10px] text-art-500 hover:text-art-400 px-2 py-0.5"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={() => handleSaveNotes(inq._id)}
                            className="text-[10px] font-bold text-white bg-brand-500 hover:bg-brand-600 px-2.5 py-0.5 rounded flex items-center gap-1"
                          >
                            <Save className="w-2.5 h-2.5" />
                            <span>Save</span>
                          </button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-[11px] text-art-400 italic line-clamp-2">
                        {inq.notes || 'No private notes yet. Click edit to add.'}
                      </p>
                    )}
                  </div>
                </div>

                {/* Custom Branding Specifications */}
                {inq.customizationDetails && (
                  <div className="p-3 rounded-2xl bg-art-950/60 border border-art-800/60 text-xs">
                    <span className="text-[10px] font-bold text-art-500 uppercase tracking-wider block mb-0.5">
                      Client Customization Specifications:
                    </span>
                    <p className="text-art-300 leading-relaxed whitespace-pre-line">
                      {inq.customizationDetails}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
            ) : (
              /* LIST TABLE VIEW */
              <div className="bg-white border border-art-800 rounded-2xl sm:rounded-3xl overflow-hidden shadow-xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse min-w-[800px]">
                    <thead>
                      <tr className="border-b border-art-800 bg-art-950/60 text-[11px] font-bold text-art-500 uppercase tracking-wider">
                        <th className="py-4 px-6">Company / Client</th>
                        <th className="py-4 px-4">Product & Volume</th>
                        <th className="py-4 px-4">Contact Info</th>
                        <th className="py-4 px-4">Target Date & Budget</th>
                        <th className="py-4 px-4">Pipeline Status</th>
                        <th className="py-4 px-6 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-art-800 text-xs">
                      {inquiries.map((inq) => (
                        <tr key={inq._id} className="hover:bg-art-950/50 transition-colors">
                          <td className="py-4 px-6">
                            <div className="font-bold text-art-300 text-sm">{inq.companyOrEvent}</div>
                            <div className="text-xs text-art-500 font-medium">{inq.name}</div>
                            <div className="text-[10px] text-brand-500 font-semibold">{inq.eventType}</div>
                          </td>

                          <td className="py-4 px-4">
                            <div className="font-bold text-art-300">{inq.productInterest}</div>
                            <div className="font-mono font-black text-brand-500">{inq.estimatedQuantity} Units</div>
                          </td>

                          <td className="py-4 px-4">
                            <div className="font-mono text-art-300 text-xs flex items-center gap-1">
                              <Phone className="w-3 h-3 text-emerald-600" />
                              <span>{inq.phone}</span>
                            </div>
                            <div className="text-[11px] text-art-500 truncate max-w-[180px]">{inq.email}</div>
                          </td>

                          <td className="py-4 px-4">
                            <div className="text-art-300 font-semibold">
                              {inq.targetDate ? formatDate(inq.targetDate, 'short') : 'Flexible'}
                            </div>
                            <div className="text-[10px] text-art-500">{inq.budgetRange || 'Standard'}</div>
                          </td>

                          <td className="py-4 px-4">
                            <select
                              value={inq.status}
                              onChange={(e) => handleStatusChange(inq._id, e.target.value)}
                              className="bg-art-950 border border-art-700 rounded-xl px-2.5 py-1 text-xs text-art-300 font-semibold focus:outline-none focus:border-brand-500"
                            >
                              <option value="New">New</option>
                              <option value="Contacted">Contacted</option>
                              <option value="Quoted">Quoted</option>
                              <option value="In Production">In Production</option>
                              <option value="Completed">Completed</option>
                              <option value="Declined">Declined</option>
                            </select>
                          </td>

                          <td className="py-4 px-6 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                type="button"
                                onClick={() => handleSendWhatsAppQuote(inq)}
                                className="px-2.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all flex items-center gap-1 shadow-xs"
                                title="Send WhatsApp Quote"
                              >
                                <MessageCircle className="w-3.5 h-3.5" />
                                <span className="hidden sm:inline">WhatsApp</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDelete(inq._id)}
                                className="p-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 transition-colors"
                                title="Delete Inquiry"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between border-t border-art-800 pt-4 flex-wrap gap-3">
                <p className="text-xs text-art-500">
                  Showing page <span className="font-bold text-art-300">{page}</span> of{' '}
                  <span className="font-bold text-art-300">{totalPages}</span>
                </p>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="p-2 rounded-xl border border-art-800 bg-white hover:bg-art-950 disabled:opacity-40 text-art-500"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="p-2 rounded-xl border border-art-800 bg-white hover:bg-art-950 disabled:opacity-40 text-art-500"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
