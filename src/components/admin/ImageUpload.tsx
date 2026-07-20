import { useRef, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const BUCKET = "artists";
// ~10 years — bucket is private, so we persist a long-lived signed URL.
const SIGNED_URL_TTL = 60 * 60 * 24 * 365 * 10;

async function uploadOne(file: File): Promise<string> {
  const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const path = `${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, { contentType: file.type, upsert: false });
  if (error) throw error;
  const { data, error: signErr } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(path, SIGNED_URL_TTL);
  if (signErr || !data?.signedUrl) throw signErr ?? new Error("Failed to sign URL");
  return data.signedUrl;
}

type SingleProps = {
  label: string;
  value: string;
  onChange: (url: string) => void;
  className?: string;
};

export function ImageUpload({ label, value, onChange, className = "" }: SingleProps) {
  const ref = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  const handle = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    try {
      const url = await uploadOne(file);
      onChange(url);
      toast.success("Uploaded");
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setBusy(false);
      if (ref.current) ref.current.value = "";
    }
  };

  return (
    <div className={className}>
      <label className="mb-1 block text-[10px] uppercase tracking-[0.3em] text-pearl/60">
        {label}
      </label>
      <div className="flex items-start gap-3">
        {value ? (
          <img src={value} alt="" className="h-20 w-20 border border-pearl/20 object-cover" />
        ) : (
          <div className="grid h-20 w-20 place-items-center border border-dashed border-pearl/20 text-[9px] uppercase tracking-widest text-pearl/40">
            No image
          </div>
        )}
        <div className="flex-1 space-y-2">
          <input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Paste URL or upload"
            className="w-full border border-pearl/20 bg-transparent px-3 py-2 text-sm outline-none focus:border-gold"
          />
          <div className="flex gap-2">
            <button
              type="button"
              disabled={busy}
              onClick={() => ref.current?.click()}
              className="border border-pearl/30 px-3 py-1.5 text-[10px] uppercase tracking-[0.3em] hover:border-gold hover:text-gold disabled:opacity-50"
            >
              {busy ? "Uploading…" : value ? "Replace" : "Upload"}
            </button>
            {value && (
              <button
                type="button"
                onClick={() => onChange("")}
                className="border border-pearl/20 px-3 py-1.5 text-[10px] uppercase tracking-[0.3em] text-pearl/60 hover:text-destructive"
              >
                Clear
              </button>
            )}
          </div>
          <input
            ref={ref}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handle}
          />
        </div>
      </div>
    </div>
  );
}

type MultiProps = {
  label: string;
  value: string; // newline-separated URLs
  onChange: (v: string) => void;
};

export function ImageMultiUpload({ label, value, onChange }: MultiProps) {
  const ref = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const urls = value.split("\n").map((s) => s.trim()).filter(Boolean);

  const handle = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    setBusy(true);
    try {
      const uploaded = await Promise.all(files.map(uploadOne));
      onChange([...urls, ...uploaded].join("\n"));
      toast.success(`Uploaded ${uploaded.length}`);
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setBusy(false);
      if (ref.current) ref.current.value = "";
    }
  };

  const removeAt = (i: number) => {
    const next = urls.filter((_, idx) => idx !== i);
    onChange(next.join("\n"));
  };

  return (
    <div>
      <div className="mb-1 flex items-center justify-between">
        <label className="text-[10px] uppercase tracking-[0.3em] text-pearl/60">{label}</label>
        <button
          type="button"
          disabled={busy}
          onClick={() => ref.current?.click()}
          className="border border-pearl/30 px-3 py-1 text-[10px] uppercase tracking-[0.3em] hover:border-gold hover:text-gold disabled:opacity-50"
        >
          {busy ? "Uploading…" : "Add images"}
        </button>
      </div>
      {urls.length > 0 && (
        <div className="mb-2 grid grid-cols-4 gap-2 sm:grid-cols-6">
          {urls.map((u, i) => (
            <div key={i} className="relative">
              <img src={u} alt="" className="aspect-square w-full border border-pearl/20 object-cover" />
              <button
                type="button"
                onClick={() => removeAt(i)}
                className="absolute right-1 top-1 bg-obsidian/80 px-1.5 text-[10px] text-pearl/80 hover:text-destructive"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={3}
        placeholder="One URL per line"
        className="w-full border border-pearl/20 bg-transparent px-3 py-2 text-sm outline-none focus:border-gold"
      />
      <input
        ref={ref}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={handle}
      />
    </div>
  );
}
