"use client";

import React, { useState, useEffect } from "react";
import { Plus, Pin, FileText, File, Upload, Shield, Briefcase, Heart, DollarSign, Home, AlertTriangle, Trash2 } from "lucide-react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Modal, ModalBody, ModalFooter } from "@/components/ui/modal";
import { Input, Textarea, Select } from "@/components/ui/input";
import { formatDate, formatRelativeDate } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";

type Note = { id: string; title: string; content: string | null; tags: string[] | null; is_pinned: boolean; created_by: string | null; created_at: string; updated_at: string };

const CATEGORY_CONFIG = {
  insurance: { label: "Insurance", icon: Shield, color: "#6366F1" },
  legal: { label: "Legal", icon: Briefcase, color: "#8B5CF6" },
  medical: { label: "Medical", icon: Heart, color: "#EF4444" },
  financial: { label: "Financial", icon: DollarSign, color: "#10B981" },
  property: { label: "Property", icon: Home, color: "#F97316" },
  other: { label: "Other", icon: File, color: "#64748B" },
};

type Tab = "notes" | "documents";

export default function NotesPage() {
  const [activeTab, setActiveTab] = useState<Tab>("notes");
  const [notes, setNotes] = useState<Note[]>([]);
  const [householdId, setHouseholdId] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [showAddNote, setShowAddNote] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [newNote, setNewNote] = useState({ title: "", content: "", tags: "" });

  useEffect(() => {
    async function load() {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        setUserId(user.id);
        const { data: profile } = await supabase.from("profiles").select("household_id").eq("id", user.id).single();
        if (!profile?.household_id) return;
        setHouseholdId(profile.household_id);
        const { data } = await supabase.from("notes").select("*").eq("household_id", profile.household_id).order("is_pinned", { ascending: false }).order("updated_at", { ascending: false });
        setNotes(data || []);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  async function addNote() {
    setSaveError(null);
    if (!newNote.title.trim()) { setSaveError("Title is required."); return; }
    if (!householdId || !userId) { setSaveError("No household found. Please sign out and sign back in."); return; }
    setSaving(true);
    const supabase = createClient();
    const tags = newNote.tags ? newNote.tags.split(",").map((t) => t.trim()).filter(Boolean) : [];
    const now = new Date().toISOString();
    const { data, error } = await supabase.from("notes").insert({
      household_id: householdId,
      created_by: userId,
      title: newNote.title,
      content: newNote.content || null,
      tags,
      is_pinned: false,
      created_at: now,
      updated_at: now,
    }).select().single();
    setSaving(false);
    if (error) { setSaveError(error.message); return; }
    if (data) {
      setNotes((prev) => [data, ...prev]);
      setNewNote({ title: "", content: "", tags: "" });
      setShowAddNote(false);
    }
  }

  async function deleteNote(id: string) {
    const supabase = createClient();
    await supabase.from("notes").delete().eq("id", id);
    setNotes((prev) => prev.filter((n) => n.id !== id));
    if (selectedNote?.id === id) setSelectedNote(null);
  }

  async function togglePin(note: Note) {
    const supabase = createClient();
    await supabase.from("notes").update({ is_pinned: !note.is_pinned }).eq("id", note.id);
    setNotes((prev) => prev.map((n) => n.id === note.id ? { ...n, is_pinned: !n.is_pinned } : n).sort((a, b) => (b.is_pinned ? 1 : 0) - (a.is_pinned ? 1 : 0)));
    if (selectedNote?.id === note.id) setSelectedNote((prev) => prev ? { ...prev, is_pinned: !prev.is_pinned } : null);
  }

  const allTags = Array.from(new Set(notes.flatMap((n) => n.tags || [])));
  const pinnedNotes = notes.filter((n) => n.is_pinned);
  const unpinnedNotes = notes.filter((n) => !n.is_pinned);
  const filteredNotes = activeTag ? notes.filter((n) => (n.tags || []).includes(activeTag)) : notes;

  if (loading) return <div className="flex items-center justify-center h-64 text-[#78716C]">Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1 bg-white rounded-xl border border-[#E7E5E4] p-0.5">
          {(["notes", "documents"] as Tab[]).map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)} className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors capitalize ${activeTab === tab ? "bg-primary-500 text-white" : "text-[#78716C] hover:text-[#1C1917]"}`}>
              {tab === "notes" ? "Notes" : "Documents"}
            </button>
          ))}
        </div>
        {activeTab === "notes" ? (
          <Button leftIcon={<Plus className="h-4 w-4" />} onClick={() => setShowAddNote(true)}>New Note</Button>
        ) : (
          <Button leftIcon={<Upload className="h-4 w-4" />}>Upload Document</Button>
        )}
      </div>

      {activeTab === "notes" && (
        <>
          <div className="flex flex-wrap gap-2">
            <button onClick={() => setActiveTag(null)} className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${!activeTag ? "bg-primary-500 text-white" : "bg-gray-100 text-[#78716C] hover:bg-gray-200"}`}>All</button>
            {allTags.map((tag) => (
              <button key={tag} onClick={() => setActiveTag(activeTag === tag ? null : tag)} className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${activeTag === tag ? "bg-primary-500 text-white" : "bg-gray-100 text-[#78716C] hover:bg-gray-200"}`}>{tag}</button>
            ))}
          </div>

          {notes.length === 0 ? (
            <div className="text-center py-16 text-[#78716C]">
              <FileText className="h-10 w-10 mx-auto mb-3 text-gray-300" />
              <p className="font-medium">No notes yet</p>
              <p className="text-sm mt-1">Save important info, passwords, contacts, and more!</p>
            </div>
          ) : (
            <>
              {pinnedNotes.length > 0 && !activeTag && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Pin className="h-4 w-4 text-[#78716C]" />
                    <h3 className="text-sm font-semibold text-[#78716C] uppercase tracking-wider">Pinned</h3>
                  </div>
                  <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-0">
                    {pinnedNotes.map((note) => <NoteCard key={note.id} note={note} pinned onClick={() => setSelectedNote(note)} onDelete={() => deleteNote(note.id)} />)}
                  </div>
                </div>
              )}
              <div>
                {!activeTag && pinnedNotes.length > 0 && <h3 className="text-sm font-semibold text-[#78716C] uppercase tracking-wider mb-3">Notes</h3>}
                <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-0">
                  {(activeTag ? filteredNotes : unpinnedNotes).map((note) => <NoteCard key={note.id} note={note} onClick={() => setSelectedNote(note)} onDelete={() => deleteNote(note.id)} />)}
                </div>
              </div>
            </>
          )}
        </>
      )}

      {activeTab === "documents" && (
        <div className="text-center py-16 text-[#78716C]">
          <File className="h-10 w-10 mx-auto mb-3 text-gray-300" />
          <p className="font-medium">Document storage coming soon</p>
          <p className="text-sm mt-1">Upload and organize your important documents</p>
        </div>
      )}

      {selectedNote && (
        <Modal open={!!selectedNote} onClose={() => setSelectedNote(null)} title={selectedNote.title} size="lg">
          <ModalBody>
            <div className="flex flex-wrap gap-1.5 mb-4">
              {(selectedNote.tags || []).map((tag) => <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>)}
            </div>
            <div className="text-sm text-[#1C1917] whitespace-pre-wrap leading-relaxed bg-gray-50 rounded-xl p-4 min-h-[200px]">{selectedNote.content}</div>
            <p className="text-xs text-[#78716C] mt-3">Updated {formatRelativeDate(selectedNote.updated_at)}</p>
          </ModalBody>
          <ModalFooter>
            <Button variant="destructive" onClick={() => deleteNote(selectedNote.id)}>Delete</Button>
            <button onClick={() => togglePin(selectedNote)} className="px-4 py-2 text-sm text-[#78716C] hover:text-[#1C1917] transition-colors">
              {selectedNote.is_pinned ? "Unpin" : "Pin"}
            </button>
            <Button variant="outline" onClick={() => setSelectedNote(null)}>Close</Button>
          </ModalFooter>
        </Modal>
      )}

      <Modal open={showAddNote} onClose={() => { setShowAddNote(false); setSaveError(null); }} title="New Note" size="md">
        <ModalBody className="space-y-4">
          <Input label="Title" placeholder="Note title" value={newNote.title} onChange={(e) => setNewNote({ ...newNote, title: e.target.value })} />
          <Textarea label="Content" placeholder="Write your note here..." value={newNote.content} onChange={(e) => setNewNote({ ...newNote, content: e.target.value })} className="min-h-[160px]" />
          <Input label="Tags" placeholder="Home, Passwords, Medical (comma separated)" value={newNote.tags} onChange={(e) => setNewNote({ ...newNote, tags: e.target.value })} helperText="Separate multiple tags with commas" />
        </ModalBody>
        <ModalFooter>
          {saveError && <p className="text-sm text-red-500 flex-1">{saveError}</p>}
          <Button variant="outline" onClick={() => { setShowAddNote(false); setSaveError(null); }}>Cancel</Button>
          <Button onClick={addNote} loading={saving}>Save Note</Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}

function NoteCard({ note, pinned = false, onClick, onDelete }: { note: Note; pinned?: boolean; onClick: () => void; onDelete: () => void }) {
  const COLORS = ["#fef9c3", "#f0fdf4", "#eff6ff", "#fdf4ff", "#fff7ed", "#f0f9ff"];
  const bg = COLORS[note.id.charCodeAt(0) % COLORS.length];
  return (
    <div className="break-inside-avoid mb-4">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} whileHover={{ y: -2 }} transition={{ duration: 0.2 }} className="rounded-xl border border-[#E7E5E4] p-4 cursor-pointer shadow-card hover:shadow-card-hover transition-shadow relative group" style={{ backgroundColor: bg }} onClick={onClick}>
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(); }}
          className="absolute top-2 right-2 p-1 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-red-100 text-gray-300 hover:text-red-400 transition-all"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
        <div className="flex items-start justify-between mb-2">
          <h3 className="text-sm font-semibold text-[#1C1917] flex items-center gap-2 pr-6">
            {pinned && <Pin className="h-3.5 w-3.5 text-[#78716C] flex-shrink-0" />}
            {note.title}
          </h3>
        </div>
        <p className="text-xs text-[#78716C] leading-relaxed line-clamp-4">{note.content}</p>
        {(note.tags || []).length > 0 && (
          <div className="flex flex-wrap gap-1 mt-3">
            {(note.tags || []).map((tag) => <span key={tag} className="px-2 py-0.5 rounded-full bg-white/60 text-xs text-[#78716C]">{tag}</span>)}
          </div>
        )}
        <p className="text-xs text-[#78716C] mt-2 opacity-60">{formatDate(note.updated_at, "MMM d")}</p>
      </motion.div>
    </div>
  );
}
