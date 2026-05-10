"use client";

import React, { useState } from "react";
import {
  Plus,
  Pin,
  FileText,
  File,
  Upload,
  Shield,
  Briefcase,
  Heart,
  DollarSign,
  Home,
  AlertTriangle,
} from "lucide-react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Modal, ModalBody, ModalFooter } from "@/components/ui/modal";
import { Input, Textarea, Select } from "@/components/ui/input";
import { formatDate, formatRelativeDate } from "@/lib/utils";

// TODO: Replace with Supabase queries
const MOCK_NOTES = [
  { id: "1", title: "Home Wi-Fi Password", content: "Network: HomeNetwork_5G\nPassword: duohome2025!\n\nRouter admin: 192.168.1.1", tags: ["Passwords", "Home"], is_pinned: true, created_at: "2025-04-15T10:00:00Z", updated_at: "2025-04-15T10:00:00Z" },
  { id: "2", title: "Dog Vet Info", content: "Dr. Sarah Miller — City Pet Clinic\n📞 (555) 234-5678\n🗓 Next visit: June 15, 2025\n\nMax's medications:\n- Heartworm pill: Monthly (1st of month)\n- Flea prevention: Monthly", tags: ["Pets", "Medical"], is_pinned: true, created_at: "2025-04-20T09:00:00Z", updated_at: "2025-05-01T14:00:00Z" },
  { id: "3", title: "Apartment Landlord Contact", content: "Maria Gonzalez\n📞 (555) 987-6543\n📧 mgonzalez@apartmentco.com\n\nMaintenance requests: online portal at portal.apartmentco.com", tags: ["Home", "Contacts"], is_pinned: false, created_at: "2025-03-10T11:00:00Z", updated_at: "2025-03-10T11:00:00Z" },
  { id: "4", title: "Date Night Ideas", content: "🍝 Osteria restaurant (make reservation!)\n🎭 Community theater - check schedule\n🎨 Paint & Sip night\n🌿 Botanical garden evening walk\n🎬 Rooftop cinema\n🍕 Pizza + board games night in", tags: ["Fun", "Dating"], is_pinned: false, created_at: "2025-04-28T15:00:00Z", updated_at: "2025-05-05T10:00:00Z" },
  { id: "5", title: "Car Service Record", content: "2019 Honda Civic\nPlate: ABC-1234\n\nLast oil change: March 2025 @ 45,200 mi\nNext due: June 2025 or 48,200 mi\n\nTire rotation: April 2025\nBrakes replaced: Jan 2025", tags: ["Car", "Maintenance"], is_pinned: false, created_at: "2025-03-25T08:00:00Z", updated_at: "2025-04-05T09:00:00Z" },
  { id: "6", title: "Grocery Favorites List", content: "Trader Joe's:\n- Everything But the Bagel seasoning\n- Unexpected Cheddar\n- Mandarin orange chicken\n\nWhole Foods:\n- 365 pasta\n- Organic almond butter\n\nCostco:\n- Kirkland olive oil\n- Rotisserie chicken", tags: ["Food", "Shopping"], is_pinned: false, created_at: "2025-04-10T12:00:00Z", updated_at: "2025-04-10T12:00:00Z" },
];

// TODO: Replace with Supabase Storage uploads
const MOCK_DOCUMENTS = [
  { id: "1", name: "Renter's Insurance Policy 2025", file_type: "PDF", file_size_bytes: 2_400_000, category: "insurance", expiry_date: "2026-01-15", created_at: "2025-01-15T10:00:00Z" },
  { id: "2", name: "Lease Agreement", file_type: "PDF", file_size_bytes: 1_800_000, category: "legal", expiry_date: "2025-12-31", created_at: "2024-12-30T10:00:00Z" },
  { id: "3", name: "Alex Health Insurance Card", file_type: "PNG", file_size_bytes: 450_000, category: "medical", expiry_date: "2025-12-31", created_at: "2025-01-01T10:00:00Z" },
  { id: "4", name: "Jordan Health Insurance Card", file_type: "PNG", file_size_bytes: 480_000, category: "medical", expiry_date: "2025-12-31", created_at: "2025-01-01T10:00:00Z" },
  { id: "5", name: "2024 Joint Tax Return", file_type: "PDF", file_size_bytes: 3_200_000, category: "financial", expiry_date: null, created_at: "2025-04-12T10:00:00Z" },
  { id: "6", name: "Car Title — Honda Civic", file_type: "PDF", file_size_bytes: 980_000, category: "legal", expiry_date: null, created_at: "2024-06-10T10:00:00Z" },
];

const CATEGORY_CONFIG = {
  insurance: { label: "Insurance", icon: Shield, color: "#6366F1" },
  legal: { label: "Legal", icon: Briefcase, color: "#8B5CF6" },
  medical: { label: "Medical", icon: Heart, color: "#EF4444" },
  financial: { label: "Financial", icon: DollarSign, color: "#10B981" },
  property: { label: "Property", icon: Home, color: "#F97316" },
  other: { label: "Other", icon: File, color: "#64748B" },
};

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(0) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
}

type Tab = "notes" | "documents";

export default function NotesPage() {
  const [activeTab, setActiveTab] = useState<Tab>("notes");
  const [notes] = useState(MOCK_NOTES);
  const [documents] = useState(MOCK_DOCUMENTS);
  const [selectedNote, setSelectedNote] = useState<typeof MOCK_NOTES[0] | null>(null);
  const [showAddNote, setShowAddNote] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [docCategory, setDocCategory] = useState<keyof typeof CATEGORY_CONFIG | "all">("all");
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [newNote, setNewNote] = useState({ title: "", content: "", tags: "" });
  const [newDoc, setNewDoc] = useState({ name: "", category: "other", expiry_date: "" });

  const allTags = Array.from(new Set(notes.flatMap((n) => n.tags)));
  const pinnedNotes = notes.filter((n) => n.is_pinned);
  const unpinnedNotes = notes.filter((n) => !n.is_pinned);
  const filteredNotes = activeTag
    ? notes.filter((n) => n.tags.includes(activeTag))
    : notes;

  const filteredDocs = docCategory === "all"
    ? documents
    : documents.filter((d) => d.category === docCategory);

  const isExpiringSoon = (date: string | null) => {
    if (!date) return false;
    const days = Math.ceil((new Date(date).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    return days <= 30 && days >= 0;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1 bg-white rounded-xl border border-[#E7E5E4] p-0.5">
          {(["notes", "documents"] as Tab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors capitalize ${
                activeTab === tab ? "bg-primary-500 text-white" : "text-[#78716C] hover:text-[#1C1917]"
              }`}
            >
              {tab === "notes" ? "Notes" : "Documents"}
            </button>
          ))}
        </div>
        {activeTab === "notes" ? (
          <Button leftIcon={<Plus className="h-4 w-4" />} onClick={() => setShowAddNote(true)}>
            New Note
          </Button>
        ) : (
          <Button leftIcon={<Upload className="h-4 w-4" />} onClick={() => setShowUpload(true)}>
            Upload Document
          </Button>
        )}
      </div>

      {activeTab === "notes" && (
        <>
          {/* Tag filter */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setActiveTag(null)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                !activeTag ? "bg-primary-500 text-white" : "bg-gray-100 text-[#78716C] hover:bg-gray-200"
              }`}
            >
              All
            </button>
            {allTags.map((tag) => (
              <button
                key={tag}
                onClick={() => setActiveTag(activeTag === tag ? null : tag)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                  activeTag === tag ? "bg-primary-500 text-white" : "bg-gray-100 text-[#78716C] hover:bg-gray-200"
                }`}
              >
                {tag}
              </button>
            ))}
          </div>

          {/* Pinned notes */}
          {pinnedNotes.length > 0 && !activeTag && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Pin className="h-4 w-4 text-[#78716C]" />
                <h3 className="text-sm font-semibold text-[#78716C] uppercase tracking-wider">Pinned</h3>
              </div>
              <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-0">
                {pinnedNotes.map((note) => (
                  <NoteCard key={note.id} note={note} pinned onClick={() => setSelectedNote(note)} />
                ))}
              </div>
            </div>
          )}

          {/* Regular notes */}
          <div>
            {!activeTag && pinnedNotes.length > 0 && (
              <h3 className="text-sm font-semibold text-[#78716C] uppercase tracking-wider mb-3">Notes</h3>
            )}
            <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-0">
              {(activeTag ? filteredNotes : unpinnedNotes).map((note) => (
                <NoteCard key={note.id} note={note} onClick={() => setSelectedNote(note)} />
              ))}
            </div>
          </div>
        </>
      )}

      {activeTab === "documents" && (
        <div className="flex gap-6">
          {/* Category sidebar */}
          <div className="w-48 flex-shrink-0">
            <nav className="space-y-1">
              <button
                onClick={() => setDocCategory("all")}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium transition-colors text-left ${
                  docCategory === "all" ? "bg-primary-50 text-primary-700" : "text-[#78716C] hover:bg-gray-100"
                }`}
              >
                <FileText className="h-4 w-4" />
                All Documents
                <span className="ml-auto text-xs">{documents.length}</span>
              </button>
              {Object.entries(CATEGORY_CONFIG).map(([key, config]) => {
                const count = documents.filter((d) => d.category === key).length;
                if (count === 0) return null;
                const Icon = config.icon;
                return (
                  <button
                    key={key}
                    onClick={() => setDocCategory(key as keyof typeof CATEGORY_CONFIG)}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium transition-colors text-left ${
                      docCategory === key
                        ? "bg-primary-50 text-primary-700"
                        : "text-[#78716C] hover:bg-gray-100"
                    }`}
                  >
                    <Icon className="h-4 w-4" style={docCategory === key ? { color: config.color } : undefined} />
                    {config.label}
                    <span className="ml-auto text-xs">{count}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Document cards */}
          <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {filteredDocs.map((doc) => {
              const catConfig = CATEGORY_CONFIG[doc.category as keyof typeof CATEGORY_CONFIG];
              const Icon = catConfig.icon;
              const expiring = isExpiringSoon(doc.expiry_date);

              return (
                <motion.div
                  key={doc.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <Card hover>
                    <div className="flex items-start gap-3">
                      <div
                        className="h-10 w-10 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: catConfig.color + "18" }}
                      >
                        <Icon className="h-5 w-5" style={{ color: catConfig.color }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-[#1C1917] truncate">{doc.name}</p>
                        <p className="text-xs text-[#78716C] mt-0.5">
                          {doc.file_type} · {formatFileSize(doc.file_size_bytes)}
                        </p>
                        <p className="text-xs text-[#78716C]">
                          Added {formatDate(doc.created_at, "MMM d, yyyy")}
                        </p>
                        {doc.expiry_date && (
                          <div className={`flex items-center gap-1 mt-1.5 ${expiring ? "text-amber-600" : "text-[#78716C]"}`}>
                            {expiring && <AlertTriangle className="h-3 w-3" />}
                            <p className="text-xs font-medium">
                              {expiring ? "Expiring soon: " : "Expires: "}
                              {formatDate(doc.expiry_date)}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {/* Note Detail Modal */}
      {selectedNote && (
        <Modal open={!!selectedNote} onClose={() => setSelectedNote(null)} title={selectedNote.title} size="lg">
          <ModalBody>
            <div className="flex flex-wrap gap-1.5 mb-4">
              {selectedNote.tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
              ))}
            </div>
            <div className="text-sm text-[#1C1917] whitespace-pre-wrap leading-relaxed bg-gray-50 rounded-xl p-4 min-h-[200px]">
              {selectedNote.content}
            </div>
            <p className="text-xs text-[#78716C] mt-3">
              Updated {formatRelativeDate(selectedNote.updated_at)}
            </p>
          </ModalBody>
          <ModalFooter>
            <Button variant="outline" onClick={() => setSelectedNote(null)}>Close</Button>
            <Button>Edit Note</Button>
          </ModalFooter>
        </Modal>
      )}

      {/* Add Note Modal */}
      <Modal open={showAddNote} onClose={() => setShowAddNote(false)} title="New Note" size="md">
        <ModalBody className="space-y-4">
          <Input
            label="Title"
            placeholder="Note title"
            value={newNote.title}
            onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
          />
          <Textarea
            label="Content"
            placeholder="Write your note here..."
            value={newNote.content}
            onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
            className="min-h-[160px]"
          />
          <Input
            label="Tags"
            placeholder="Home, Passwords, Medical (comma separated)"
            value={newNote.tags}
            onChange={(e) => setNewNote({ ...newNote, tags: e.target.value })}
            helperText="Separate multiple tags with commas"
          />
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setShowAddNote(false)}>Cancel</Button>
          <Button onClick={() => setShowAddNote(false)}>Save Note</Button>
        </ModalFooter>
      </Modal>

      {/* Upload Document Modal */}
      <Modal open={showUpload} onClose={() => setShowUpload(false)} title="Upload Document" size="md">
        <ModalBody className="space-y-4">
          <Input
            label="Document name"
            placeholder="e.g. Home Insurance Policy 2025"
            value={newDoc.name}
            onChange={(e) => setNewDoc({ ...newDoc, name: e.target.value })}
          />
          <Select
            label="Category"
            value={newDoc.category}
            onChange={(e) => setNewDoc({ ...newDoc, category: e.target.value })}
            options={Object.entries(CATEGORY_CONFIG).map(([k, v]) => ({ value: k, label: v.label }))}
          />
          <Input
            label="Expiry date (optional)"
            type="date"
            value={newDoc.expiry_date}
            onChange={(e) => setNewDoc({ ...newDoc, expiry_date: e.target.value })}
            helperText="Set for time-sensitive documents like insurance policies"
          />
          <div className="border-2 border-dashed border-[#E7E5E4] rounded-xl p-8 text-center hover:border-primary-300 transition-colors cursor-pointer">
            <Upload className="h-8 w-8 text-[#78716C] mx-auto mb-2" />
            <p className="text-sm font-medium text-[#1C1917]">Click to upload or drag and drop</p>
            <p className="text-xs text-[#78716C] mt-1">PDF, PNG, JPG, DOCX up to 50MB</p>
            <p className="text-xs text-indigo-500 mt-2">Stored securely in Supabase Storage</p>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setShowUpload(false)}>Cancel</Button>
          <Button onClick={() => setShowUpload(false)}>Upload Document</Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}

function NoteCard({
  note,
  pinned = false,
  onClick,
}: {
  note: typeof MOCK_NOTES[0];
  pinned?: boolean;
  onClick: () => void;
}) {
  const COLORS = ["#fef9c3", "#f0fdf4", "#eff6ff", "#fdf4ff", "#fff7ed", "#f0f9ff"];
  const colorIndex = note.id.charCodeAt(0) % COLORS.length;
  const bg = COLORS[colorIndex];

  return (
    <div className="break-inside-avoid mb-4">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -2 }}
        transition={{ duration: 0.2 }}
        className="rounded-xl border border-[#E7E5E4] p-4 cursor-pointer shadow-card hover:shadow-card-hover transition-shadow"
        style={{ backgroundColor: bg }}
        onClick={onClick}
      >
        <div className="flex items-start justify-between mb-2">
          <h3 className="text-sm font-semibold text-[#1C1917] flex items-center gap-2">
            {pinned && <Pin className="h-3.5 w-3.5 text-[#78716C] flex-shrink-0" />}
            {note.title}
          </h3>
        </div>
        <p className="text-xs text-[#78716C] leading-relaxed line-clamp-4">
          {note.content}
        </p>
        {note.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-3">
            {note.tags.map((tag) => (
              <span key={tag} className="px-2 py-0.5 rounded-full bg-white/60 text-xs text-[#78716C]">
                {tag}
              </span>
            ))}
          </div>
        )}
        <p className="text-xs text-[#78716C] mt-2 opacity-60">
          {formatDate(note.updated_at, "MMM d")}
        </p>
      </motion.div>
    </div>
  );
}
