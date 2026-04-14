"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  const links = [
    { href: "/", label: "Generate" },
    { href: "/game", label: "Game" },
    { href: "/saved", label: "Saved" },
    
  ];

  return (
    <>
      
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-[#f5f3ef]/90 backdrop-blur-lg border-b border-black/[0.07] shadow-sm "
            : "bg-transparent border-b border-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="flex gap-1">
              {["#FF6B6B", "#FFD166", "#06D6A0", "#118AB2"].map((c, i) => (
                <span
                  key={c}
                  className="w-2.5 h-2.5 rounded-full"
                  style={{
                    background: c,
                    animation: "wave 1.4s ease-in-out infinite",
                    animationDelay: `${i * 0.12}s`,
                  }}
                />
              ))}
            </div>
            <span
              className="font-bold text-gray-900 text-xl tracking-tight"
              style={{ fontFamily: "'Fraunces', serif" }}
            >
              Paletto
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-1">
            {links.map((link) => {
              const active = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-4 py-2 text-sm font-medium rounded-full transition-all duration-200 ${
                    active
                      ? "underline underline-offset-4  text-gray-900"
                      : "text-gray-500 hover:text-gray-900 hover:underline hover:underline-offset-4"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Mobile Hamburger */}
          <button
            className="lg:hidden p-2 flex flex-col gap-1.5 z-50"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle Menu"
          >
            <span className={`block w-5 h-0.5 bg-gray-900 transition-all duration-300 ${menuOpen ? "rotate-45 translate-y-2" : ""}`} />
            <span className={`block w-5 h-0.5 bg-gray-900 transition-all duration-300 ${menuOpen ? "opacity-0" : ""}`} />
            <span className={`block w-5 h-0.5 bg-gray-900 transition-all duration-300 ${menuOpen ? "-rotate-45 -translate-y-2" : ""}`} />
          </button>
        </div>

        {/* Mobile Menu Content */}
        <div
          className={`lg:hidden overflow-hidden transition-all duration-300 ease-in-out ${
            menuOpen ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <div className="px-6 pb-8 pt-2 flex flex-col gap-1 bg-[#f5f3ef] border-t border-black/[0.06] shadow-xl">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className={`px-4 py-3 rounded-xl text-base transition-colors ${
                  pathname === link.href
                    ? "font-semibold text-gray-900 bg-black/[0.05]"
                    : "font-medium text-gray-600 hover:bg-black/[0.04]"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </header>

     
      <div className="h-[60px] " aria-hidden="true" />
    </>
  );
}