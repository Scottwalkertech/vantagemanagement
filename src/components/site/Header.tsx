import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";

const NAV = [
  { to: "/", label: "Index" },
  { to: "/artists", label: "Roster" },
  { to: "/shop", label: "Shop" },
  { to: "/track-record", label: "Record" },
  { to: "/charity", label: "Charity" },
  { to: "/about", label: "Agent" },
  { to: "/contact", label: "Booking" },
] as const;

export function Header() {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    document.documentElement.style.overflow = open ? "hidden" : "";
    return () => {
      document.documentElement.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <nav className="fixed top-0 z-50 flex h-16 w-full items-center justify-between border-b border-pearl/5 bg-obsidian/70 px-6 backdrop-blur-md">
        <Link to="/" className="font-display text-xl font-extrabold uppercase italic tracking-tighter text-pearl">
          Vantage.
        </Link>
        <div className="hidden items-center gap-6 lg:flex">
          {NAV.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              className="text-[11px] uppercase tracking-[0.25em] text-pearl/70 transition-colors hover:text-gold"
              activeProps={{ className: "text-gold" }}
              activeOptions={{ exact: n.to === "/" }}
            >
              {n.label}
            </Link>
          ))}
        </div>
        <button
          aria-label="Toggle menu"
          className="lg:hidden"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </nav>

      {open && (
        <div className="fixed inset-0 z-40 flex flex-col bg-obsidian/95 pt-24 backdrop-blur-xl">
          <div className="flex flex-col gap-6 px-8">
            {NAV.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                onClick={() => setOpen(false)}
                className="font-display text-3xl uppercase italic tracking-tight text-pearl"
                activeProps={{ className: "text-gold" }}
                activeOptions={{ exact: n.to === "/" }}
              >
                {n.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
