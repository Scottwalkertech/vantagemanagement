import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { adminMutate } from "@/lib/admin-api";
import {
  agentProfileQuery,
  artistsQuery,
  clientsQuery,
  testimonialsQuery,
} from "@/lib/queries";
import {
  allProductsQuery,
  awardsQuery,
  charityWorksQuery,
  PRODUCT_CATEGORIES,
} from "@/lib/shop-queries";

export const Route = createFileRoute("/_authenticated/admin")({
  component: AdminPage,
});

type Tab = "artists" | "testimonials" | "agent" | "inquiries" | "clients" | "store" | "charity" | "awards";

const TABS: { value: Tab; label: string }[] = [
  { value: "artists", label: "Roster" },
  { value: "store", label: "Store Manager" },
  { value: "charity", label: "Charity Actions" },
  { value: "awards", label: "Awards & Records" },
  { value: "testimonials", label: "Testimonials" },
  { value: "agent", label: "Agent Bio" },
  { value: "clients", label: "Clients" },
  { value: "inquiries", label: "Inquiries" },
];

function AdminPage() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>("artists");

  const logout = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/" });
  };

  return (
    <div className="min-h-screen bg-obsidian text-pearl">
      <header className="sticky top-0 z-10 flex items-center justify-between border-b border-pearl/10 bg-obsidian/90 px-6 py-4 backdrop-blur">
        <Link to="/" className="font-display text-lg font-extrabold uppercase italic">
          Vantage. <span className="text-gold">/admin</span>
        </Link>
        <button onClick={logout} className="text-[10px] uppercase tracking-[0.3em] text-pearl/60 hover:text-gold">
          Sign out
        </button>
      </header>

      <nav className="flex flex-wrap gap-2 border-b border-pearl/10 px-6 py-3">
        {TABS.map((t) => (
          <button
            key={t.value}
            onClick={() => setTab(t.value)}
            className={`px-3 py-1 text-[10px] uppercase tracking-[0.3em] ${
              tab === t.value ? "bg-gold text-obsidian" : "text-pearl/60 hover:text-gold"
            }`}
          >
            {t.label}
          </button>
        ))}
      </nav>

      <div className="px-6 py-8">
        {tab === "artists" && <ArtistsAdmin />}
        {tab === "store" && <StoreAdmin />}
        {tab === "charity" && <CharityAdmin />}
        {tab === "awards" && <AwardsAdmin />}
        {tab === "testimonials" && <TestimonialsAdmin />}
        {tab === "agent" && <AgentAdmin />}
        {tab === "clients" && <ClientsAdmin />}
        {tab === "inquiries" && <InquiriesAdmin />}
      </div>
    </div>
  );
}

function Section({ title, action, children }: { title: string; action?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="mx-auto max-w-5xl">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="font-display text-2xl uppercase">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}

function ArtistsAdmin() {
  const qc = useQueryClient();
  const { data: artists = [] } = useQuery(artistsQuery);
  const [editing, setEditing] = useState<string | null>(null);

  const remove = async (id: string) => {
    if (!confirm("Delete this artist?")) return;
    try {
      await adminMutate({ table: "artists", op: "delete", id });
      toast.success("Deleted");
      qc.invalidateQueries({ queryKey: ["artists"] });
    } catch (e) {
      toast.error((e as Error).message);
    }
  };

  return (
    <Section
      title="Roster"
      action={
        <button
          onClick={() => setEditing("new")}
          className="bg-gold px-4 py-2 text-[10px] font-bold uppercase tracking-[0.3em] text-obsidian"
        >
          + New
        </button>
      }
    >
      {editing && (
        <ArtistForm
          id={editing === "new" ? null : editing}
          onClose={() => setEditing(null)}
        />
      )}
      <div className="space-y-3">
        {artists.map((a) => (
          <div key={a.id} className="flex items-center justify-between border border-pearl/10 p-4">
            <div>
              <p className="font-display text-lg uppercase">{a.name}</p>
              <p className="text-[10px] uppercase tracking-widest text-pearl/40">{a.discipline}</p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setEditing(a.id)} className="border border-pearl/20 px-3 py-1 text-[10px] uppercase tracking-widest hover:border-gold">Edit</button>
              <button onClick={() => remove(a.id)} className="border border-destructive/40 px-3 py-1 text-[10px] uppercase tracking-widest text-destructive">Delete</button>
            </div>
          </div>
        ))}
      </div>
    </Section>
  );
}

function ArtistForm({ id, onClose }: { id: string | null; onClose: () => void }) {
  const qc = useQueryClient();
  const { data: all = [] } = useQuery(artistsQuery);
  const existing = id ? all.find((a) => a.id === id) : null;

  const [form, setForm] = useState({
    slug: existing?.slug ?? "",
    name: existing?.name ?? "",
    discipline: existing?.discipline ?? "",
    industry: existing?.industry ?? "Music",
    representation_status: existing?.representation_status ?? "Active",
    live_photo_url: existing?.live_photo_url ?? "",
    press_kit_url: existing?.press_kit_url ?? "",
    short_bio: existing?.short_bio ?? "",
    bio: existing?.bio ?? "",
    achievements: (existing?.achievements ?? []).join("\n"),
    cover_image: existing?.cover_image ?? "",
    gallery: (existing?.gallery ?? []).join("\n"),
    sort_order: existing?.sort_order ?? 99,
  });


  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      ...form,
      achievements: form.achievements.split("\n").filter(Boolean),
      gallery: form.gallery.split("\n").filter(Boolean),
      sort_order: Number(form.sort_order),
    };
    try {
      if (id) await adminMutate({ table: "artists", op: "update", id, values: payload });
      else await adminMutate({ table: "artists", op: "insert", values: payload });
      toast.success("Saved");
      qc.invalidateQueries({ queryKey: ["artists"] });
      onClose();
    } catch (e2) {
      toast.error((e2 as Error).message);
    }
  };

  return (
    <form onSubmit={save} className="mb-6 space-y-3 border border-gold/40 bg-gold/5 p-6">
      <div className="grid gap-3 md:grid-cols-2">
        <AInput label="Name" value={form.name} onChange={(v) => setForm({ ...form, name: v })} />
        <AInput label="Slug" value={form.slug} onChange={(v) => setForm({ ...form, slug: v })} />
        <AInput label="Discipline" value={form.discipline} onChange={(v) => setForm({ ...form, discipline: v })} />
        <ASelect
          label="Industry"
          value={form.industry}
          onChange={(v) => setForm({ ...form, industry: v })}
          options={["Music", "Film & TV", "Sports", "Literary", "Digital Creators"]}
        />
        <ASelect
          label="Representation status"
          value={form.representation_status}
          onChange={(v) => setForm({ ...form, representation_status: v })}
          options={["Active", "On Hold", "Alumni"]}
        />
        <AInput label="Sort order" value={String(form.sort_order)} onChange={(v) => setForm({ ...form, sort_order: Number(v) })} />
        <AInput label="Cover image URL" value={form.cover_image} onChange={(v) => setForm({ ...form, cover_image: v })} className="md:col-span-2" />
        <AInput label="Live photo URL" value={form.live_photo_url} onChange={(v) => setForm({ ...form, live_photo_url: v })} className="md:col-span-2" />
        <AInput label="Press kit URL (PDF)" value={form.press_kit_url} onChange={(v) => setForm({ ...form, press_kit_url: v })} className="md:col-span-2" />
      </div>
      <ATextarea label="Short bio (1 line)" value={form.short_bio} onChange={(v) => setForm({ ...form, short_bio: v })} rows={2} />

      <ATextarea label="Full bio" value={form.bio} onChange={(v) => setForm({ ...form, bio: v })} rows={5} />
      <ATextarea label="Achievements (one per line)" value={form.achievements} onChange={(v) => setForm({ ...form, achievements: v })} rows={4} />
      <ATextarea label="Gallery (one URL per line)" value={form.gallery} onChange={(v) => setForm({ ...form, gallery: v })} rows={3} />
      <div className="flex gap-2 pt-2">
        <button type="submit" className="bg-gold px-4 py-2 text-[10px] font-bold uppercase tracking-[0.3em] text-obsidian">Save</button>
        <button type="button" onClick={onClose} className="border border-pearl/20 px-4 py-2 text-[10px] uppercase tracking-[0.3em]">Cancel</button>
      </div>
    </form>
  );
}

function TestimonialsAdmin() {
  const qc = useQueryClient();
  const { data = [] } = useQuery(testimonialsQuery);
  const [draft, setDraft] = useState({ quote: "", author: "", author_role: "" });

  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await adminMutate({
        table: "testimonials",
        op: "insert",
        values: { ...draft, sort_order: data.length + 1 },
      });
      toast.success("Added");
      setDraft({ quote: "", author: "", author_role: "" });
      qc.invalidateQueries({ queryKey: ["testimonials"] });
    } catch (e2) {
      toast.error((e2 as Error).message);
    }
  };

  const remove = async (id: string) => {
    try {
      await adminMutate({ table: "testimonials", op: "delete", id });
      qc.invalidateQueries({ queryKey: ["testimonials"] });
    } catch (e) {
      toast.error((e as Error).message);
    }
  };

  return (
    <Section title="Testimonials">
      <form onSubmit={add} className="mb-8 space-y-3 border border-pearl/10 p-4">
        <ATextarea label="Quote" value={draft.quote} onChange={(v) => setDraft({ ...draft, quote: v })} rows={3} />
        <div className="grid gap-3 md:grid-cols-2">
          <AInput label="Author" value={draft.author} onChange={(v) => setDraft({ ...draft, author: v })} />
          <AInput label="Author role" value={draft.author_role} onChange={(v) => setDraft({ ...draft, author_role: v })} />
        </div>
        <button className="bg-gold px-4 py-2 text-[10px] font-bold uppercase tracking-[0.3em] text-obsidian">+ Add testimonial</button>
      </form>
      <div className="space-y-3">
        {data.map((t) => (
          <div key={t.id} className="flex items-start justify-between gap-4 border border-pearl/10 p-4">
            <div>
              <p className="font-serif italic">&ldquo;{t.quote}&rdquo;</p>
              <p className="mt-2 text-[10px] uppercase tracking-widest text-pearl/50">{t.author} — {t.author_role}</p>
            </div>
            <button onClick={() => remove(t.id)} className="text-[10px] uppercase text-destructive">Delete</button>
          </div>
        ))}
      </div>
    </Section>
  );
}

function ClientsAdmin() {
  const qc = useQueryClient();
  const { data = [] } = useQuery(clientsQuery);
  const [name, setName] = useState("");

  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;
    try {
      await adminMutate({
        table: "clients",
        op: "insert",
        values: { name, sort_order: data.length + 1 },
      });
      setName("");
      qc.invalidateQueries({ queryKey: ["clients"] });
    } catch (e2) {
      toast.error((e2 as Error).message);
    }
  };
  const remove = async (id: string) => {
    try {
      await adminMutate({ table: "clients", op: "delete", id });
      qc.invalidateQueries({ queryKey: ["clients"] });
    } catch (e) {
      toast.error((e as Error).message);
    }
  };

  return (
    <Section title="Featured Clients">
      <form onSubmit={add} className="mb-6 flex gap-2">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="CLIENT NAME"
          className="flex-1 border-b border-pearl/20 bg-transparent py-2 focus:border-gold focus:outline-none"
        />
        <button className="bg-gold px-4 py-2 text-[10px] font-bold uppercase tracking-[0.3em] text-obsidian">+ Add</button>
      </form>
      <div className="grid gap-2 md:grid-cols-2">
        {data.map((c) => (
          <div key={c.id} className="flex items-center justify-between border border-pearl/10 px-4 py-3">
            <span className="font-display uppercase tracking-tight">{c.name}</span>
            <button onClick={() => remove(c.id)} className="text-[10px] uppercase text-destructive">×</button>
          </div>
        ))}
      </div>
    </Section>
  );
}

function AgentAdmin() {
  const qc = useQueryClient();
  const { data } = useQuery(agentProfileQuery);
  const [form, setForm] = useState({
    name: "", title: "", headshot_url: "", story: "", philosophy: "", years_experience: "", focus: "",
  });
  useEffect(() => {
    if (data) setForm({
      name: data.name, title: data.title, headshot_url: data.headshot_url ?? "",
      story: data.story ?? "", philosophy: data.philosophy ?? "",
      years_experience: data.years_experience ?? "", focus: data.focus ?? "",
    });
  }, [data]);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!data) return;
    try {
      await adminMutate({
        table: "agent_profile",
        op: "update",
        id: data.id,
        values: form,
      });
      toast.success("Saved");
      qc.invalidateQueries({ queryKey: ["agent-profile"] });
    } catch (e2) {
      toast.error((e2 as Error).message);
    }
  };

  if (!data) return <p className="text-pearl/60">Loading…</p>;

  return (
    <Section title="The Agent">
      <form onSubmit={save} className="space-y-3">
        <div className="grid gap-3 md:grid-cols-2">
          <AInput label="Name" value={form.name} onChange={(v) => setForm({ ...form, name: v })} />
          <AInput label="Title" value={form.title} onChange={(v) => setForm({ ...form, title: v })} />
          <AInput label="Years experience" value={form.years_experience} onChange={(v) => setForm({ ...form, years_experience: v })} />
          <AInput label="Focus" value={form.focus} onChange={(v) => setForm({ ...form, focus: v })} />
          <AInput label="Headshot URL" value={form.headshot_url} onChange={(v) => setForm({ ...form, headshot_url: v })} className="md:col-span-2" />
        </div>
        <ATextarea label="Story" value={form.story} onChange={(v) => setForm({ ...form, story: v })} rows={6} />
        <ATextarea label="Philosophy" value={form.philosophy} onChange={(v) => setForm({ ...form, philosophy: v })} rows={3} />
        <button className="bg-gold px-4 py-2 text-[10px] font-bold uppercase tracking-[0.3em] text-obsidian">Save</button>
      </form>
    </Section>
  );
}

function InquiriesAdmin() {
  const qc = useQueryClient();
  const { data = [], isLoading, error } = useQuery({
    queryKey: ["inquiries"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("inquiries")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const mark = async (id: string, status: string) => {
    try {
      await adminMutate({ table: "inquiries", op: "update", id, values: { status } });
      qc.invalidateQueries({ queryKey: ["inquiries"] });
    } catch (e) {
      toast.error((e as Error).message);
    }
  };

  if (isLoading) return <p className="text-pearl/60">Loading…</p>;
  if (error) return <p className="text-destructive">{(error as Error).message}</p>;

  return (
    <Section title={`Inquiries (${data.length})`}>
      <div className="space-y-3">
        {data.map((i) => (
          <div key={i.id} className="border border-pearl/10 p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="font-display text-lg uppercase">{i.name} <span className="text-pearl/40 text-xs">· {i.email}</span></p>
                <p className="text-[10px] uppercase tracking-widest text-pearl/50">
                  {i.organization} · {i.project_type} · {new Date(i.created_at).toLocaleString()}
                </p>
              </div>
              <select
                value={i.status}
                onChange={(e) => mark(i.id, e.target.value)}
                className="border border-pearl/20 bg-obsidian px-2 py-1 text-[10px] uppercase tracking-widest"
              >
                <option value="new">new</option>
                <option value="contacted">contacted</option>
                <option value="closed">closed</option>
              </select>
            </div>
            <p className="mt-3 whitespace-pre-wrap text-sm text-pearl/80">{i.message}</p>
          </div>
        ))}
        {data.length === 0 && <p className="text-pearl/40">No inquiries yet.</p>}
      </div>
    </Section>
  );
}

function AInput({
  label, value, onChange, className = "",
}: { label: string; value: string; onChange: (v: string) => void; className?: string }) {
  return (
    <div className={className}>
      <label className="mb-1 block text-[10px] uppercase tracking-[0.3em] text-pearl/50">{label}</label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border-b border-pearl/20 bg-transparent py-2 focus:border-gold focus:outline-none"
      />
    </div>
  );
}

function ATextarea({
  label, value, onChange, rows = 3,
}: { label: string; value: string; onChange: (v: string) => void; rows?: number }) {
  return (
    <div>
      <label className="mb-1 block text-[10px] uppercase tracking-[0.3em] text-pearl/50">{label}</label>
      <textarea
        value={value}
        rows={rows}
        onChange={(e) => onChange(e.target.value)}
        className="w-full resize-y border border-pearl/15 bg-obsidian/40 p-3 focus:border-gold focus:outline-none"
      />
    </div>
  );
}

function ASelect({
  label, value, onChange, options, className = "",
}: { label: string; value: string; onChange: (v: string) => void; options: string[]; className?: string }) {
  return (
    <div className={className}>
      <label className="mb-1 block text-[10px] uppercase tracking-[0.3em] text-pearl/50">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border-b border-pearl/20 bg-obsidian py-2 focus:border-gold focus:outline-none"
      >
        {options.map((o) => (
          <option key={o} value={o}>{o}</option>
        ))}
      </select>
    </div>
  );
}


type StoreSubTab = "inventory" | "assignments";

function StoreAdmin() {
  const [sub, setSub] = useState<StoreSubTab>("inventory");
  return (
    <Section title="Store Manager">
      <div className="mb-6 flex gap-2 border-b border-pearl/10 pb-3">
        {([
          { v: "inventory", l: "Inventory" },
          { v: "assignments", l: "Artist Assignments" },
        ] as { v: StoreSubTab; l: string }[]).map((t) => (
          <button
            key={t.v}
            onClick={() => setSub(t.v)}
            className={`px-3 py-1 text-[10px] uppercase tracking-[0.3em] ${
              sub === t.v ? "bg-gold text-obsidian" : "text-pearl/60 hover:text-gold"
            }`}
          >
            {t.l}
          </button>
        ))}
      </div>
      {sub === "inventory" ? <StoreInventory /> : <ArtistAssignments />}
    </Section>
  );
}

function ArtistAssignments() {
  const qc = useQueryClient();
  const { data: artists = [] } = useQuery(artistsQuery);
  const { data: products = [] } = useQuery(allProductsQuery);
  const [artistId, setArtistId] = useState<string>("");
  const [assigned, setAssigned] = useState<Set<string>>(new Set());
  const [saving, setSaving] = useState(false);

  const selectedArtist = artists.find((a) => a.id === artistId);
  const originalAssigned = new Set(
    products.filter((p) => p.artist_id === artistId).map((p) => p.id),
  );

  // Reset selection when artist changes.
  useEffect(() => {
    if (!artistId) {
      setAssigned(new Set());
      return;
    }
    setAssigned(
      new Set(products.filter((p) => p.artist_id === artistId).map((p) => p.id)),
    );
  }, [artistId, products]);

  const assignedList = products.filter((p) => assigned.has(p.id));
  const unassignedList = products.filter((p) => !assigned.has(p.id));

  const move = (id: string, direction: "assign" | "unassign") => {
    setAssigned((prev) => {
      const next = new Set(prev);
      if (direction === "assign") next.add(id);
      else next.delete(id);
      return next;
    });
  };

  const dirty =
    assigned.size !== originalAssigned.size ||
    [...assigned].some((id) => !originalAssigned.has(id));

  const save = async () => {
    if (!artistId) return;
    setSaving(true);
    try {
      const { data: sess } = await supabase.auth.getSession();
      const token = sess.session?.access_token;
      if (!token) throw new Error("Session expired — sign in again.");
      const res = await fetch("/api/admin/bulk-link", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          artist_id: artistId,
          product_ids: [...assigned],
        }),
      });
      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(text || `Save failed (${res.status})`);
      }
      toast.success("Assignments saved");
      qc.invalidateQueries({ queryKey: ["products"] });
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-end gap-4 border border-pearl/10 p-6">
        <div className="min-w-[240px] flex-1">
          <label className="mb-2 block text-[10px] uppercase tracking-[0.3em] text-pearl/50">
            Select Public Figure
          </label>
          <select
            value={artistId}
            onChange={(e) => setArtistId(e.target.value)}
            className="w-full border-b border-pearl/20 bg-obsidian py-2 focus:border-gold focus:outline-none"
          >
            <option value="">— Choose an artist —</option>
            {artists.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name} · {a.industry}
              </option>
            ))}
          </select>
        </div>
        <button
          onClick={save}
          disabled={!artistId || !dirty || saving}
          className="bg-gold px-6 py-3 text-[10px] font-bold uppercase tracking-[0.3em] text-obsidian disabled:cursor-not-allowed disabled:bg-pearl/20 disabled:text-pearl/40"
        >
          {saving ? "Saving…" : "Save Assignments"}
        </button>
      </div>

      {!artistId ? (
        <p className="py-16 text-center text-[10px] uppercase tracking-[0.3em] text-pearl/40">
          Select an artist above to manage their assigned products.
        </p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          <AssignmentColumn
            title="Assigned"
            count={assignedList.length}
            sub={selectedArtist ? `Linked to ${selectedArtist.name}` : ""}
            tone="gold"
            products={assignedList}
            actionLabel="Remove →"
            emptyLabel="No products assigned yet."
            onAction={(id) => move(id, "unassign")}
            artists={artists}
          />
          <AssignmentColumn
            title="Unassigned"
            count={unassignedList.length}
            sub="Available inventory"
            tone="pearl"
            products={unassignedList}
            actionLabel="← Assign"
            emptyLabel="Everything is currently assigned."
            onAction={(id) => move(id, "assign")}
            artists={artists}
          />
        </div>
      )}
    </div>
  );
}

function AssignmentColumn({
  title,
  count,
  sub,
  tone,
  products,
  actionLabel,
  emptyLabel,
  onAction,
  artists,
}: {
  title: string;
  count: number;
  sub: string;
  tone: "gold" | "pearl";
  products: { id: string; title: string; price: number; currency: string; category: string; artist_id: string | null }[];
  actionLabel: string;
  emptyLabel: string;
  onAction: (id: string) => void;
  artists: { id: string; name: string }[];
}) {
  const border = tone === "gold" ? "border-gold/40" : "border-pearl/10";
  const accent = tone === "gold" ? "text-gold" : "text-pearl/60";
  return (
    <div className={`flex flex-col border ${border}`}>
      <div className="flex items-baseline justify-between border-b border-pearl/10 px-4 py-3">
        <div>
          <p className={`text-[10px] uppercase tracking-[0.3em] ${accent}`}>
            {title} [ {String(count).padStart(2, "0")} ]
          </p>
          {sub && (
            <p className="mt-1 text-[10px] uppercase tracking-[0.25em] text-pearl/40">{sub}</p>
          )}
        </div>
      </div>
      <div className="max-h-[520px] overflow-y-auto">
        {products.length === 0 ? (
          <p className="px-4 py-8 text-center text-[10px] uppercase tracking-[0.3em] text-pearl/30">
            {emptyLabel}
          </p>
        ) : (
          <ul className="divide-y divide-pearl/5">
            {products.map((p) => {
              const other =
                p.artist_id && tone === "pearl"
                  ? artists.find((a) => a.id === p.artist_id)?.name
                  : null;
              return (
                <li
                  key={p.id}
                  className="flex items-center justify-between gap-3 px-4 py-3 hover:bg-pearl/5"
                >
                  <div className="min-w-0">
                    <p className="truncate font-display text-sm uppercase tracking-wide">
                      {p.title}
                    </p>
                    <p className="text-[10px] uppercase tracking-widest text-pearl/40">
                      {p.category} · {Number(p.price).toFixed(2)} {p.currency}
                      {other && (
                        <span className="ml-2 text-destructive">· held by {other}</span>
                      )}
                    </p>
                  </div>
                  <button
                    onClick={() => onAction(p.id)}
                    className="shrink-0 border border-pearl/20 px-3 py-1 text-[10px] uppercase tracking-[0.3em] text-pearl/70 hover:border-gold hover:text-gold"
                  >
                    {actionLabel}
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}

function StoreInventory() {
  const qc = useQueryClient();
  const { data: products = [] } = useQuery(allProductsQuery);
  const { data: artists = [] } = useQuery(artistsQuery);
  const empty = {
    title: "", description: "", price: "0", currency: "USD",
    image_url: "", category: "merchandise", stock: "0",
    artist_id: "", is_published: true, sort_order: "0",
  };
  const [draft, setDraft] = useState(empty);
  const [editingId, setEditingId] = useState<string | null>(null);

  const startEdit = (p: typeof products[number]) => {
    setEditingId(p.id);
    setDraft({
      title: p.title, description: p.description ?? "", price: String(p.price),
      currency: p.currency, image_url: p.image_url ?? "", category: p.category,
      stock: String(p.stock), artist_id: p.artist_id ?? "",
      is_published: p.is_published, sort_order: String(p.sort_order),
    });
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      title: draft.title,
      description: draft.description || null,
      price: Number(draft.price),
      currency: draft.currency,
      image_url: draft.image_url || null,
      category: draft.category,
      stock: Number(draft.stock),
      artist_id: draft.artist_id || null,
      is_published: draft.is_published,
      sort_order: Number(draft.sort_order),
    };
    try {
      if (editingId)
        await adminMutate({ table: "products", op: "update", id: editingId, values: payload });
      else await adminMutate({ table: "products", op: "insert", values: payload });
      toast.success("Saved");
      setDraft(empty);
      setEditingId(null);
      qc.invalidateQueries({ queryKey: ["products"] });
    } catch (e2) {
      toast.error((e2 as Error).message);
    }
  };

  const adjustStock = async (id: string, delta: number, current: number) => {
    const next = Math.max(0, current + delta);
    try {
      await adminMutate({ table: "products", op: "update", id, values: { stock: next } });
      qc.invalidateQueries({ queryKey: ["products"] });
    } catch (e) {
      toast.error((e as Error).message);
    }
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this product?")) return;
    try {
      await adminMutate({ table: "products", op: "delete", id });
      qc.invalidateQueries({ queryKey: ["products"] });
    } catch (e) {
      toast.error((e as Error).message);
    }
  };

  return (
    <div>
      <form onSubmit={save} className="mb-8 space-y-3 border border-gold/40 bg-gold/5 p-6">
        <div className="grid gap-3 md:grid-cols-2">
          <AInput label="Title" value={draft.title} onChange={(v) => setDraft({ ...draft, title: v })} />
          <AInput label="Image URL" value={draft.image_url} onChange={(v) => setDraft({ ...draft, image_url: v })} />
          <AInput label="Price" value={draft.price} onChange={(v) => setDraft({ ...draft, price: v })} />
          <AInput label="Currency" value={draft.currency} onChange={(v) => setDraft({ ...draft, currency: v })} />
          <AInput label="Stock" value={draft.stock} onChange={(v) => setDraft({ ...draft, stock: v })} />
          <AInput label="Sort order" value={draft.sort_order} onChange={(v) => setDraft({ ...draft, sort_order: v })} />
          <div>
            <label className="mb-1 block text-[10px] uppercase tracking-[0.3em] text-pearl/50">Category</label>
            <select
              value={draft.category}
              onChange={(e) => setDraft({ ...draft, category: e.target.value })}
              className="w-full border-b border-pearl/20 bg-obsidian py-2 focus:border-gold focus:outline-none"
            >
              {PRODUCT_CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-[10px] uppercase tracking-[0.3em] text-pearl/50">Assigned Artist</label>
            <select
              value={draft.artist_id}
              onChange={(e) => setDraft({ ...draft, artist_id: e.target.value })}
              className="w-full border-b border-pearl/20 bg-obsidian py-2 focus:border-gold focus:outline-none"
            >
              <option value="">— None —</option>
              {artists.map((a) => (
                <option key={a.id} value={a.id}>{a.name}</option>
              ))}
            </select>
          </div>
        </div>
        <ATextarea label="Description" value={draft.description} onChange={(v) => setDraft({ ...draft, description: v })} rows={3} />
        <label className="flex items-center gap-2 text-[10px] uppercase tracking-[0.3em] text-pearl/70">
          <input
            type="checkbox"
            checked={draft.is_published}
            onChange={(e) => setDraft({ ...draft, is_published: e.target.checked })}
          />
          Published
        </label>
        <div className="flex gap-2">
          <button className="bg-gold px-4 py-2 text-[10px] font-bold uppercase tracking-[0.3em] text-obsidian">
            {editingId ? "Update" : "+ Add product"}
          </button>
          {editingId && (
            <button
              type="button"
              onClick={() => { setEditingId(null); setDraft(empty); }}
              className="border border-pearl/20 px-4 py-2 text-[10px] uppercase tracking-[0.3em]"
            >Cancel</button>
          )}
        </div>
      </form>

      <div className="space-y-3">
        {products.map((p) => {
          const artist = artists.find((a) => a.id === p.artist_id);
          return (
            <div key={p.id} className="flex flex-wrap items-center justify-between gap-3 border border-pearl/10 p-4">
              <div className="min-w-0 flex-1">
                <p className="font-display text-lg uppercase">{p.title}</p>
                <p className="text-[10px] uppercase tracking-widest text-pearl/40">
                  {p.category} · {Number(p.price).toFixed(2)} {p.currency}
                  {artist && <> · {artist.name}</>}
                  {!p.is_published && <span className="text-destructive"> · DRAFT</span>}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => adjustStock(p.id, -1, p.stock)} className="border border-pearl/20 px-2 py-1 text-xs">−</button>
                <span className="w-12 text-center text-[11px] uppercase tracking-widest">{p.stock}</span>
                <button onClick={() => adjustStock(p.id, 1, p.stock)} className="border border-pearl/20 px-2 py-1 text-xs">+</button>
                <button onClick={() => startEdit(p)} className="border border-pearl/20 px-3 py-1 text-[10px] uppercase tracking-widest hover:border-gold">Edit</button>
                <button onClick={() => remove(p.id)} className="border border-destructive/40 px-3 py-1 text-[10px] uppercase tracking-widest text-destructive">×</button>
              </div>
            </div>
          );
        })}
        {products.length === 0 && <p className="text-pearl/40">No products yet.</p>}
      </div>
    </div>
  );
}

function CharityAdmin() {
  const qc = useQueryClient();
  const { data: works = [] } = useQuery(charityWorksQuery);
  const empty = { organization: "", title: "", summary: "", completed_on: "", evidence_images: "", sort_order: "0" };
  const [draft, setDraft] = useState(empty);
  const [editingId, setEditingId] = useState<string | null>(null);

  const startEdit = (w: typeof works[number]) => {
    setEditingId(w.id);
    setDraft({
      organization: w.organization, title: w.title, summary: w.summary ?? "",
      completed_on: w.completed_on ?? "",
      evidence_images: w.evidence_images.join("\n"),
      sort_order: String(w.sort_order),
    });
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      organization: draft.organization,
      title: draft.title,
      summary: draft.summary || null,
      completed_on: draft.completed_on || null,
      evidence_images: draft.evidence_images.split("\n").map((s) => s.trim()).filter(Boolean),
      sort_order: Number(draft.sort_order),
    };
    try {
      if (editingId)
        await adminMutate({ table: "charity_works", op: "update", id: editingId, values: payload });
      else await adminMutate({ table: "charity_works", op: "insert", values: payload });
      toast.success("Saved");
      setDraft(empty);
      setEditingId(null);
      qc.invalidateQueries({ queryKey: ["charity_works"] });
    } catch (e2) {
      toast.error((e2 as Error).message);
    }
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this initiative?")) return;
    try {
      await adminMutate({ table: "charity_works", op: "delete", id });
      qc.invalidateQueries({ queryKey: ["charity_works"] });
    } catch (e) {
      toast.error((e as Error).message);
    }
  };

  return (
    <Section title="Charity Actions">
      <form onSubmit={save} className="mb-8 space-y-3 border border-gold/40 bg-gold/5 p-6">
        <div className="grid gap-3 md:grid-cols-2">
          <AInput label="Organization" value={draft.organization} onChange={(v) => setDraft({ ...draft, organization: v })} />
          <AInput label="Initiative Title" value={draft.title} onChange={(v) => setDraft({ ...draft, title: v })} />
          <AInput label="Completed on (YYYY-MM-DD)" value={draft.completed_on} onChange={(v) => setDraft({ ...draft, completed_on: v })} />
          <AInput label="Sort order" value={draft.sort_order} onChange={(v) => setDraft({ ...draft, sort_order: v })} />
        </div>
        <ATextarea label="Summary" value={draft.summary} onChange={(v) => setDraft({ ...draft, summary: v })} rows={3} />
        <ATextarea label="Evidence image URLs (one per line)" value={draft.evidence_images} onChange={(v) => setDraft({ ...draft, evidence_images: v })} rows={5} />
        <div className="flex gap-2">
          <button className="bg-gold px-4 py-2 text-[10px] font-bold uppercase tracking-[0.3em] text-obsidian">
            {editingId ? "Update" : "+ Add initiative"}
          </button>
          {editingId && (
            <button
              type="button"
              onClick={() => { setEditingId(null); setDraft(empty); }}
              className="border border-pearl/20 px-4 py-2 text-[10px] uppercase tracking-[0.3em]"
            >Cancel</button>
          )}
        </div>
      </form>

      <div className="space-y-3">
        {works.map((w) => (
          <div key={w.id} className="flex items-start justify-between gap-4 border border-pearl/10 p-4">
            <div>
              <p className="font-display text-lg uppercase">{w.title}</p>
              <p className="text-[10px] uppercase tracking-widest text-pearl/40">
                {w.organization} · {w.completed_on ?? "Ongoing"} · {w.evidence_images.length} images
              </p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => startEdit(w)} className="border border-pearl/20 px-3 py-1 text-[10px] uppercase tracking-widest hover:border-gold">Edit</button>
              <button onClick={() => remove(w.id)} className="border border-destructive/40 px-3 py-1 text-[10px] uppercase tracking-widest text-destructive">×</button>
            </div>
          </div>
        ))}
        {works.length === 0 && <p className="text-pearl/40">No initiatives yet.</p>}
      </div>
    </Section>
  );
}

function AwardsAdmin() {
  const qc = useQueryClient();
  const { data: awards = [] } = useQuery(awardsQuery);
  const { data: artists = [] } = useQuery(artistsQuery);
  const empty = { year: String(new Date().getFullYear()), award_body: "", category: "", artist_id: "", sort_order: "0" };
  const [draft, setDraft] = useState(empty);
  const [editingId, setEditingId] = useState<string | null>(null);

  const startEdit = (a: typeof awards[number]) => {
    setEditingId(a.id);
    setDraft({
      year: String(a.year), award_body: a.award_body, category: a.category,
      artist_id: a.artist_id ?? "", sort_order: String(a.sort_order),
    });
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      year: Number(draft.year),
      award_body: draft.award_body,
      category: draft.category,
      artist_id: draft.artist_id || null,
      sort_order: Number(draft.sort_order),
    };
    try {
      if (editingId)
        await adminMutate({ table: "awards_records", op: "update", id: editingId, values: payload });
      else await adminMutate({ table: "awards_records", op: "insert", values: payload });
      toast.success("Saved");
      setDraft(empty);
      setEditingId(null);
      qc.invalidateQueries({ queryKey: ["awards_records"] });
    } catch (e2) {
      toast.error((e2 as Error).message);
    }
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this record?")) return;
    try {
      await adminMutate({ table: "awards_records", op: "delete", id });
      qc.invalidateQueries({ queryKey: ["awards_records"] });
    } catch (e) {
      toast.error((e as Error).message);
    }
  };

  return (
    <Section title="Awards & Records">
      <form onSubmit={save} className="mb-8 space-y-3 border border-gold/40 bg-gold/5 p-6">
        <div className="grid gap-3 md:grid-cols-2">
          <AInput label="Year" value={draft.year} onChange={(v) => setDraft({ ...draft, year: v })} />
          <AInput label="Award Body" value={draft.award_body} onChange={(v) => setDraft({ ...draft, award_body: v })} />
          <AInput label="Category / Hit Item" value={draft.category} onChange={(v) => setDraft({ ...draft, category: v })} className="md:col-span-2" />
          <div>
            <label className="mb-1 block text-[10px] uppercase tracking-[0.3em] text-pearl/50">Target Artist</label>
            <select
              value={draft.artist_id}
              onChange={(e) => setDraft({ ...draft, artist_id: e.target.value })}
              className="w-full border-b border-pearl/20 bg-obsidian py-2 focus:border-gold focus:outline-none"
            >
              <option value="">— None —</option>
              {artists.map((a) => (
                <option key={a.id} value={a.id}>{a.name}</option>
              ))}
            </select>
          </div>
          <AInput label="Sort order" value={draft.sort_order} onChange={(v) => setDraft({ ...draft, sort_order: v })} />
        </div>
        <div className="flex gap-2">
          <button className="bg-gold px-4 py-2 text-[10px] font-bold uppercase tracking-[0.3em] text-obsidian">
            {editingId ? "Update" : "+ Log award"}
          </button>
          {editingId && (
            <button
              type="button"
              onClick={() => { setEditingId(null); setDraft(empty); }}
              className="border border-pearl/20 px-4 py-2 text-[10px] uppercase tracking-[0.3em]"
            >Cancel</button>
          )}
        </div>
      </form>

      <div className="space-y-2">
        {awards.map((a) => {
          const artist = artists.find((x) => x.id === a.artist_id);
          return (
            <div key={a.id} className="flex flex-wrap items-center justify-between gap-3 border border-pearl/10 p-4">
              <div>
                <p className="font-display text-lg uppercase">
                  <span className="text-gold">{a.year}</span> · {a.award_body}
                </p>
                <p className="text-[10px] uppercase tracking-widest text-pearl/40">
                  {a.category}{artist && <> · {artist.name}</>}
                </p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => startEdit(a)} className="border border-pearl/20 px-3 py-1 text-[10px] uppercase tracking-widest hover:border-gold">Edit</button>
                <button onClick={() => remove(a.id)} className="border border-destructive/40 px-3 py-1 text-[10px] uppercase tracking-widest text-destructive">×</button>
              </div>
            </div>
          );
        })}
        {awards.length === 0 && <p className="text-pearl/40">No records yet.</p>}
      </div>
    </Section>
  );
}
