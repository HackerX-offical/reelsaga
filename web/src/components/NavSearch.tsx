import { FormEvent, useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import "./NavSearch.css";

export function NavSearch() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [q, setQ] = useState(params.get("q") ?? "");
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setQ(params.get("q") ?? "");
  }, [params]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    const term = q.trim();
    navigate(term ? `/search?q=${encodeURIComponent(term)}` : "/browse");
    setOpen(false);
  }

  return (
    <form
      className={`nav-search ${open ? "nav-search--open" : ""}`}
      onSubmit={onSubmit}
      onFocus={() => setOpen(true)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node)) {
          setOpen(false);
        }
      }}
    >
      <button
        type="button"
        className="nav-search__icon-btn"
        onClick={() => {
          setOpen(true);
          inputRef.current?.focus();
        }}
        aria-label="Search"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
          <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
          <path d="M20 20l-3-3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </button>
      <input
        ref={inputRef}
        type="search"
        className="nav-search__input"
        placeholder="Search"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        aria-label="Search shows"
      />
      {open && q.trim() && (
        <button type="submit" className="nav-search__submit" aria-label="Go">
          ↵
        </button>
      )}
    </form>
  );
}
