import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-[#f5f3ef] border-t border-black/[0.07] mt-auto">
      {/* Top color bar */}
      <div className="flex h-1">
        {["#FF6B6B", "#FFD166", "#06D6A0", "#118AB2", "#9B5DE5", "#F72585"].map((c) => (
          <div key={c} className="flex-1" style={{ background: c }} />
        ))}
      </div>

      <div className="max-w-6xl mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-3 gap-10">
        {/* Brand */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="flex gap-1">
              {["#FF6B6B", "#FFD166", "#06D6A0"].map((c) => (
                <span key={c} className="w-2 h-2 rounded-full" style={{ background: c }} />
              ))}
            </div>
            <span className="font-bold text-gray-900 text-lg" style={{ fontFamily: "'Fraunces', serif" }}>
              Paletto
            </span>
          </div>
          <p className="text-sm text-gray-500 leading-relaxed max-w-xs">
            Discover beautiful color palettes powered by colormagic.app. Find your perfect color story in seconds.
          </p>
        </div>

        {/* Navigate */}
        <div>
          <p className="text-xs font-semibold text-gray-900 uppercase tracking-widest mb-4">Navigate</p>
          <ul className="space-y-2.5">
            {[
              { href: "/", label: "Explore Palettes" },
              { href: "/about", label: "About Paletto" },
            ].map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="text-sm text-gray-500 hover:text-gray-900 transition-colors duration-200">
                  {l.label}
                </Link>
              </li>
            ))}
            <li>
              <a
                href="https://colormagic.app"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-gray-500 hover:text-gray-900 transition-colors duration-200"
              >
                colormagic.app ↗
              </a>
            </li>
          </ul>
        </div>

        {/* Stack */}
        <div>
          <p className="text-xs font-semibold text-gray-900 uppercase tracking-widest mb-4">Built With</p>
          <ul className="space-y-2.5">
            {["Next.js 14", "TypeScript", "Tailwind CSS", "colormagic API"].map((t) => (
              <li key={t} className="flex items-center gap-2 text-sm text-gray-500">
                <span className="w-1 h-1 rounded-full bg-gray-400" />
                {t}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-black/[0.06] py-5 px-6 max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
        <p className="text-xs text-gray-400">© {new Date().getFullYear()} Paletto. Palette data from colormagic.app.</p>
        <p className="text-xs text-gray-400">Click any swatch to copy HEX</p>
      </div>
    </footer>
  );
}