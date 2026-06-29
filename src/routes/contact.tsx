import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Booking & Inquiries — Vantage" },
      {
        name: "description",
        content:
          "Submit a booking inquiry to Vantage for brand campaigns, festival appearances, editorial, and partnerships.",
      },
      { property: "og:title", content: "Booking & Inquiries — Vantage" },
      {
        property: "og:description",
        content:
          "Brand campaigns, festival headliners, editorial, scoring, partnerships — start a brief.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/contact" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Booking & Inquiries — Vantage" },
      {
        name: "twitter:description",
        content:
          "Brand campaigns, festival headliners, editorial, scoring, partnerships — start a brief.",
      },
    ],
    links: [{ rel: "canonical", href: "/contact" }],
  }),
  component: ContactPage,
});

const schema = z.object({
  name: z.string().trim().min(1, "Required").max(120),
  email: z.string().trim().email("Invalid email").max(255),
  organization: z.string().trim().max(160).optional().or(z.literal("")),
  project_type: z.string().max(80).optional().or(z.literal("")),
  budget: z.string().max(80).optional().or(z.literal("")),
  event_date: z.string().optional().or(z.literal("")),
  message: z.string().trim().min(10, "Tell us a bit more").max(5000),
});
type FormValues = z.infer<typeof schema>;

const PROJECT_TYPES = [
  "Brand Campaign",
  "Festival / Live",
  "Editorial",
  "Film / TV",
  "Scoring",
  "Partnership",
  "Other",
];

function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { project_type: "" },
  });

  const onSubmit = async (values: FormValues) => {
    const { error } = await supabase.from("inquiries").insert({
      name: values.name,
      email: values.email,
      organization: values.organization || null,
      project_type: values.project_type || null,
      budget: values.budget || null,
      event_date: values.event_date || null,
      message: values.message,
    });
    if (error) {
      toast.error("Couldn't send brief. " + error.message);
      return;
    }
    toast.success("Brief received. We'll be in touch.");
    setSubmitted(true);
    reset();
  };

  return (
    <section className="mx-auto grid max-w-6xl gap-16 px-6 py-24 md:grid-cols-2 md:py-32">
      <div className="md:sticky md:top-24 md:self-start">
        <p className="mb-3 text-[10px] uppercase tracking-[0.35em] text-gold">[ Booking & Inquiries ]</p>
        <h1 className="font-display text-5xl uppercase leading-[0.95] md:text-7xl">
          Start a
          <br />
          <span className="italic text-gold">Brief.</span>
        </h1>
        <p className="mt-6 max-w-md text-sm leading-relaxed text-pearl/60">
          For brand partnerships, festival bookings, editorial, scoring, and creative direction.
          We respond to qualified briefs within two business days.
        </p>
        <div className="mt-12 space-y-6 border-t border-pearl/10 pt-8">
          <Field label="Direct" value="bookings@vantage.mgmt" />
          <Field label="Press" value="press@vantage.mgmt" />
          <Field label="Offices" value="New York · London · Tokyo" />
        </div>
      </div>

      <div>
        {submitted ? (
          <div className="border border-gold/40 bg-gold/5 p-10 text-center">
            <p className="font-display text-3xl uppercase italic text-gold">Received.</p>
            <p className="mt-4 text-sm text-pearl/70">
              Your brief is in the inbox. We&apos;ll be back within two business days.
            </p>
            <button
              onClick={() => setSubmitted(false)}
              className="mt-8 text-[10px] uppercase tracking-[0.3em] text-pearl/60 underline hover:text-gold"
            >
              Submit another →
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            <Input label="Your Name" error={errors.name?.message} {...register("name")} />
            <Input label="Email" type="email" error={errors.email?.message} {...register("email")} />
            <Input label="Organization" error={errors.organization?.message} {...register("organization")} />

            <div className="grid gap-8 sm:grid-cols-2">
              <Select
                label="Project Type"
                error={errors.project_type?.message}
                {...register("project_type")}
              >
                <option value="">Select…</option>
                {PROJECT_TYPES.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </Select>
              <Input
                label="Event Date"
                type="date"
                error={errors.event_date?.message}
                {...register("event_date")}
              />
            </div>

            <Input label="Budget Range" placeholder="e.g. $50–100k" error={errors.budget?.message} {...register("budget")} />

            <div>
              <Label>The Vision</Label>
              <textarea
                rows={5}
                {...register("message")}
                className="w-full resize-none border-b border-pearl/20 bg-transparent py-2 text-pearl placeholder-pearl/30 focus:border-gold focus:outline-none"
                placeholder="Tell us about the project, the artist(s) you have in mind, and the timeline."
              />
              {errors.message && (
                <p className="mt-2 text-[10px] uppercase tracking-widest text-destructive">
                  {errors.message.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="group inline-flex items-center gap-6 bg-gold px-8 py-4 font-display text-xs font-bold uppercase tracking-[0.3em] text-obsidian transition-transform hover:translate-x-1 disabled:opacity-50"
            >
              {isSubmitting ? "Sending…" : "Send Brief"}
              <ArrowRight size={16} />
            </button>
          </form>
        )}
      </div>
    </section>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-[0.3em] text-pearl/40">{label}</p>
      <p className="mt-1 text-sm">{value}</p>
    </div>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <label className="mb-2 block text-[10px] uppercase tracking-[0.3em] text-pearl/50">
      {children}
    </label>
  );
}

const Input = ({
  label,
  error,
  ...rest
}: React.InputHTMLAttributes<HTMLInputElement> & { label: string; error?: string }) => (
  <div>
    <Label>{label}</Label>
    <input
      {...rest}
      className="w-full border-b border-pearl/20 bg-transparent py-2 text-pearl placeholder-pearl/30 focus:border-gold focus:outline-none"
    />
    {error && (
      <p className="mt-2 text-[10px] uppercase tracking-widest text-destructive">{error}</p>
    )}
  </div>
);

const Select = ({
  label,
  error,
  children,
  ...rest
}: React.SelectHTMLAttributes<HTMLSelectElement> & { label: string; error?: string }) => (
  <div>
    <Label>{label}</Label>
    <select
      {...rest}
      className="w-full border-b border-pearl/20 bg-transparent py-2 text-pearl focus:border-gold focus:outline-none [&>option]:bg-obsidian"
    >
      {children}
    </select>
    {error && (
      <p className="mt-2 text-[10px] uppercase tracking-widest text-destructive">{error}</p>
    )}
  </div>
);
