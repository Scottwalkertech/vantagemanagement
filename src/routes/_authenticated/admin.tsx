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
        <AInput label="Sort order" value={String(form.sort_order)} onChange={(v) => setForm({ ...form, sort_order: Number(v) })} />
        <AInput label="Cover image URL" value={form.cover_image} onChange={(v) => setForm({ ...form, cover_image: v })} className="md:col-span-2" />
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
