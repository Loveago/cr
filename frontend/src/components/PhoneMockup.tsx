'use client';

export function PhoneMockup() {
  return (
    <div className="relative mx-auto w-full max-w-[300px]">
      <div className="relative rounded-[2.5rem] border-[6px] border-bg-border bg-bg-soft p-2 shadow-2xl">
        <div className="flex items-center justify-between px-4 pt-1 pb-2 text-xs text-white/70">
          <span>9:41</span>
          <span>•••</span>
        </div>
        <div className="rounded-[1.6rem] bg-bg p-3 space-y-3 text-xs">
          <div className="flex items-center gap-2 text-white">
            <div className="h-6 w-6 rounded bg-gradient-to-br from-brand-yellow to-brand-orange" />
            <span className="font-bold tracking-wide">CRYPTEX</span>
          </div>
          <div className="rounded-xl border border-bg-border bg-gradient-to-br from-bg-soft to-bg-card p-3">
            <p className="text-[15px] font-extrabold leading-tight text-white">The Most Trusted<br/>Crypto Exchange</p>
            <p className="mt-1 text-[10px] text-muted">Buy, sell, trade and invest in 350+ cryptocurrencies.</p>
            <div className="mt-2 flex gap-1">
              <button className="flex-1 rounded bg-gradient-to-r from-brand-yellow to-brand-orange py-1 text-[10px] font-bold text-black">Get Started</button>
              <button className="flex-1 rounded border border-bg-border py-1 text-[10px] text-white">Recover</button>
            </div>
          </div>
          <div className="grid grid-cols-5 gap-1 text-center text-[9px] text-white">
            {['Deposit','Buy','Trade','Earn','More'].map(x => (
              <div key={x} className="rounded bg-bg-soft py-2">{x}</div>
            ))}
          </div>
          <div className="rounded-xl border border-bg-border bg-bg-soft p-2 text-[10px]">
            <p className="font-bold text-white">Market Overview</p>
            {['BTC','ETH','BNB','SOL','XRP'].map((s,i) => (
              <div key={s} className="mt-1 flex items-center justify-between">
                <span className="text-white">{s}/USDT</span>
                <span className={i % 4 === 3 ? 'text-brand-red' : 'text-brand-green'}>+{(1 + i*0.4).toFixed(2)}%</span>
              </div>
            ))}
          </div>
          <div className="rounded-xl border border-brand-pink/40 bg-gradient-to-br from-[#2a0e2a] to-[#1a0a25] p-2 text-[10px]">
            <p className="font-bold text-white">Lost Crypto to a Scam?</p>
            <p className="mt-0.5 text-brand-pink">Recover My Funds →</p>
          </div>
        </div>
      </div>
    </div>
  );
}
