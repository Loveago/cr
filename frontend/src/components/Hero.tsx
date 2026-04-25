'use client';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Star, ArrowRight, AlertTriangle, Send } from 'lucide-react';
import { useState } from 'react';

export function Hero() {
  const [email, setEmail] = useState('');
  return (
    <section className="relative overflow-hidden rounded-2xl border border-bg-border bg-gradient-to-br from-bg-soft via-bg to-bg-soft p-6 sm:p-10">
      {/* glow */}
      <div className="pointer-events-none absolute -right-20 top-10 h-72 w-72 rounded-full bg-brand-orange glow-blob" />
      <div className="pointer-events-none absolute right-40 -top-10 h-72 w-72 rounded-full bg-brand-yellow glow-blob" />
      <div className="pointer-events-none absolute right-10 bottom-0 h-72 w-72 rounded-full bg-brand-pink glow-blob opacity-40" />

      <div className="grid gap-10 lg:grid-cols-[1.1fr_1fr]">
        <div className="relative z-10">
          <motion.h1
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
            className="text-5xl font-extrabold leading-tight text-white sm:text-6xl"
          >
            The Most <span className="bg-gradient-to-r from-brand-yellow to-brand-orange bg-clip-text text-transparent">Trusted</span><br />
            Crypto <span className="bg-gradient-to-r from-brand-yellow to-brand-orange bg-clip-text text-transparent">Exchange</span>
          </motion.h1>
          <p className="mt-5 max-w-md text-base text-white/70">
            Buy, sell, trade and invest in 350+ cryptocurrencies with the lowest fees and highest security.
          </p>

          <form
            onSubmit={(e) => { e.preventDefault(); window.location.href = `/register?email=${encodeURIComponent(email)}`; }}
            className="mt-7 flex max-w-md items-center gap-2 rounded-xl border border-bg-border bg-bg-soft/80 p-1.5 backdrop-blur"
          >
            <input
              type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="flex-1 bg-transparent px-3 py-2 text-sm text-white placeholder:text-muted focus:outline-none"
            />
            <button className="btn-primary px-5 py-2 text-sm">Get Started</button>
          </form>

          <div className="mt-4">
            <Link
              href="/recover"
              className="inline-flex items-center gap-2 rounded-xl border border-brand-pink/40 bg-brand-pink/10 px-4 py-2.5 text-sm font-bold text-brand-pink hover:bg-brand-pink/20 transition"
            >
              <AlertTriangle className="h-4 w-4" />
              Lost money to a crypto scam? Recover your funds now →
            </Link>
          </div>

          <div className="mt-3">
            <a
              href="https://t.me/bengoshidesu"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-pink/80 hover:text-brand-pink transition"
            >
              <Send className="h-3 w-3" />
              Contact us on Telegram (@bengoshidesu) for urgent recovery help
            </a>
          </div>

          <div className="mt-6 flex items-center gap-4">
            <div className="flex -space-x-2">
              {['#ff8c2b','#22c55e','#f7c521','#ff3a8c'].map((c, i) => (
                <div key={i} className="h-7 w-7 rounded-full ring-2 ring-bg" style={{ background: c }} />
              ))}
            </div>
            <p className="text-sm text-white/70">Secure trading for everyone</p>
            <div className="flex items-center gap-1">
              <span className="text-sm font-semibold text-white">4.9/5</span>
              <div className="flex text-brand-yellow">
                {Array.from({ length: 5 }).map((_, i) => <Star key={i} className="h-3.5 w-3.5 fill-current" />)}
              </div>
            </div>
          </div>
        </div>

        {/* Coin visual */}
        <div className="relative h-72 overflow-hidden lg:h-auto">
          <FloatingCoin emoji="₿" gradient="from-brand-yellow to-brand-orange" className="absolute right-12 top-12 h-44 w-44" />
          <FloatingCoin emoji="Ξ" gradient="from-indigo-400 to-purple-500" className="absolute right-48 top-2 h-24 w-24" delay={0.2} />
          <FloatingCoin emoji="₮" gradient="from-emerald-400 to-teal-500" className="absolute right-2 top-2 h-20 w-20" delay={0.4} />
          <FloatingCoin emoji="◎" gradient="from-pink-500 to-fuchsia-600" className="absolute right-40 bottom-10 h-16 w-16" delay={0.6} />
          {/* ring */}
          <div className="absolute inset-x-12 bottom-4 h-8 rounded-[100%] bg-gradient-to-r from-brand-orange/40 via-brand-yellow/30 to-transparent blur-md" />
        </div>
      </div>

      <div className="relative z-10 mt-6">
        <Link href="/markets" className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-yellow hover:underline">
          Explore markets <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </section>
  );
}

function FloatingCoin({
  emoji, gradient, className, delay = 0
}: { emoji: string; gradient: string; className: string; delay?: number }) {
  return (
    <motion.div
      initial={{ y: 0 }}
      animate={{ y: [-8, 8, -8] }}
      transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay }}
      className={`flex items-center justify-center rounded-full bg-gradient-to-br ${gradient} text-black font-extrabold shadow-2xl ring-4 ring-black/30 ${className}`}
    >
      <span style={{ fontSize: '50%' }} className="text-[2.5em]">{emoji}</span>
    </motion.div>
  );
}
