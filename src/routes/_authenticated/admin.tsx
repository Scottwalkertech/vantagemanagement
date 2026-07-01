import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
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
    const { error } = await supabase.from("artists").delete().eq("id", id);
    if (error) toast.error(error.message);
    else {
      toast.success("Deleted");
      qc.invalidateQueries({ queryKey: ["artists"] });
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
    const q = id
      ? supabase.from("artists").update(payload).eq("id", id)
      : supabase.from("artists").insert(payload);
    const { error } = await q;
    if (error) toast.error(error.message);
    else {
      toast.success("Saved");
      qc.invalidateQueries({ queryKey: ["artists"] });
      onClose();
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
    const { error } = await supabase.from("testimonials").insert({ ...draft, sort_order: data.length + 1 });
    if (error) toast.error(error.message);
    else {
      toast.success("Added");
      setDraft({ quote: "", author: "", author_role: "" });
      qc.invalidateQueries({ queryKey: ["testimonials"] });
    }
  };

  const remove = async (id: string) => {
    const { error } = await supabase.from("testimonials").delete().eq("id", id);
    if (error) toast.error(error.message);
    else qc.invalidateQueries({ queryKey: ["testimonials"] });
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
    const { error } = await supabase.from("clients").insert({ name, sort_order: data.length + 1 });
    if (error) toast.error(error.message);
    else {
      setName("");
      qc.invalidateQueries({ queryKey: ["clients"] });
    }
  };
  const remove = async (id: string) => {
    await supabase.from("clients").delete().eq("id", id);
    qc.invalidateQueries({ queryKey: ["clients"] });
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
    const { error } = await supabase.from("agent_profile").update(form).eq("id", data.id);
    if (error) toast.error(error.message);
    else {
      toast.success("Saved");
      qc.invalidateQueries({ queryKey: ["agent-profile"] });
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
    await supabase.from("inquiries").update({ status }).eq("id", id);
    qc.invalidateQueries({ queryKey: ["inquiries"] });
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

function StoreAdmin() {
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
    const q = editingId
      ? supabase.from("products").update(payload).eq("id", editingId)
      : supabase.from("products").insert(payload);
    const { error } = await q;
    if (error) return toast.error(error.message);
    toast.success("Saved");
    setDraft(empty);
    setEditingId(null);
    qc.invalidateQueries({ queryKey: ["products"] });
  };

  const adjustStock = async (id: string, delta: number, current: number) => {
    const next = Math.max(0, current + delta);
    const { error } = await supabase.from("products").update({ stock: next }).eq("id", id);
    if (error) toast.error(error.message);
    else qc.invalidateQueries({ queryKey: ["products"] });
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this product?")) return;
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) toast.error(error.message);
    else qc.invalidateQueries({ queryKey: ["products"] });
  };

  return (
    <Section title="Store Manager">
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
    </Section>
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
    const q = editingId
      ? supabase.from("charity_works").update(payload).eq("id", editingId)
      : supabase.from("charity_works").insert(payload);
    const { error } = await q;
    if (error) return toast.error(error.message);
    toast.success("Saved");
    setDraft(empty);
    setEditingId(null);
    qc.invalidateQueries({ queryKey: ["charity_works"] });
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this initiative?")) return;
    const { error } = await supabase.from("charity_works").delete().eq("id", id);
    if (error) toast.error(error.message);
    else qc.invalidateQueries({ queryKey: ["charity_works"] });
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
    const q = editingId
      ? supabase.from("awards_records").update(payload).eq("id", editingId)
      : supabase.from("awards_records").insert(payload);
    const { error } = await q;
    if (error) return toast.error(error.message);
    toast.success("Saved");
    setDraft(empty);
    setEditingId(null);
    qc.invalidateQueries({ queryKey: ["awards_records"] });
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this record?")) return;
    const { error } = await supabase.from("awards_records").delete().eq("id", id);
    if (error) toast.error(error.message);
    else qc.invalidateQueries({ queryKey: ["awards_records"] });
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
