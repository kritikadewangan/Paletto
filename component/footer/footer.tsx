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

      <div className="max-w-6xl mx-auto px-6 pt-16 pb-12 grid grid-cols-1 md:grid-cols-4 gap-12">
        {/* Brand - Takes more space on desktop */}
        <div className="md:col-span-2 ">
          <Link href="/" className="flex items-center mb-4 gap-2.5 group">
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
          <p className="text-sm text-gray-500 leading-relaxed max-w-sm">
            Discover beautiful color palettes powered by colormagic.app. <br className="hidden md:block" />
            Find your perfect color story in seconds.
          </p>
        </div>

        {/* Navigate */}
        <div className="flex flex-col">
          <p className="text-[10px] font-black text-gray-900 uppercase tracking-[0.2em] mb-6">Navigate</p>
          <ul className="space-y-3.5">
            {[
              { href: "/", label: "Explore Palettes" },
              { href: "/saved", label: "Saved Palette" },
              { href: "/game", label: "Play Games" },
            ].map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="text-sm text-gray-500 hover:text-gray-900 transition-colors duration-200 font-medium">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Stack */}
        <div className="flex flex-col">
          <p className="text-[10px] font-black text-gray-900 uppercase tracking-[0.2em] mb-6">Built With</p>
          <ul className="space-y-3.5">
            {["Next.js 14", "TypeScript", "Tailwind CSS"].map((t) => (
              <li key={t} className="flex items-center gap-3 text-sm text-gray-500 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-black/10 flex-shrink-0" />
                {t}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-black/[0.06] mt-4">
  <div className="max-w-6xl mx-auto py-8 px-6 flex flex-col items-center justify-center">
    <p className="text-[14px] text-gray-400 font-medium text-center tracking-wider">
      © {new Date().getFullYear()} Paletto. All rights reserved.
    </p>
  </div>
</div>
    </footer>
  );
}