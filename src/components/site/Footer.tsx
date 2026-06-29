import { Link } from "@tanstack/react-router";

export function Footer() {
  return (
    <footer className="border-t border-pearl/5 px-6 pb-12 pt-12">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="font-display text-3xl font-extrabold uppercase italic tracking-tighter">
            Vantage.
          </p>
          <p className="mt-2 max-w-xs text-xs leading-relaxed text-pearl/40">
            Talent management for the cultural vanguard. New York · London · Tokyo.
          </p>
        </div>
        <div className="flex flex-wrap items-end justify-between gap-8">
          <div className="flex flex-col gap-1 text-[10px] uppercase tracking-[0.25em] text-pearl/50">
            <Link to="/artists" className="hover:text-gold">Roster</Link>
            <Link to="/about" className="hover:text-gold">Agent</Link>
            <Link to="/contact" className="hover:text-gold">Booking</Link>
          </div>
          <div className="flex gap-4 text-[10px] uppercase tracking-[0.25em] text-pearl/50">
            <a href="#" className="hover:text-gold">IG</a>
            <a href="#" className="hover:text-gold">X</a>
            <a href="#" className="hover:text-gold">LI</a>
          </div>
        </div>
      </div>
      <div className="mt-12 flex items-center justify-between border-t border-pearl/5 pt-6 text-[10px] uppercase tracking-[0.25em] text-pearl/30">
        <span>© {new Date().getFullYear()} Vantage Management</span>
        <Link to="/auth" className="hover:text-gold">Admin</Link>
      </div>
    </footer>
  );
}
