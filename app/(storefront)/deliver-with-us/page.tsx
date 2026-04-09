import Link from 'next/link';

export default function DeliverWithUsPage() {
  return (
    <main className="section-wrap py-12">
      <section className="overflow-hidden rounded-[2.6rem] border border-[var(--color-border)] bg-[linear-gradient(135deg,rgba(17,17,17,0.98),rgba(35,32,29,0.92),rgba(185,106,60,0.18))] px-6 py-12 text-white shadow-[var(--shadow)] md:px-10 md:py-16">
        <p className="text-[11px] uppercase tracking-[0.32em] text-[var(--color-sand)]">LOKUS delivery network</p>
        <h1 className="mt-6 max-w-4xl font-display text-6xl leading-[0.92] md:text-8xl">Deliver premium pairs. Build weekly earnings.</h1>
        <p className="mt-6 max-w-2xl text-sm leading-7 text-white/72">
          Join the LOKUS delivery partner app to claim open shoe orders, run live tracked trips, and close each handoff with OTP-verified delivery confirmation.
        </p>
        <div className="mt-10 flex flex-wrap gap-4">
          <Link href="/delivery" className="rounded-full bg-white px-6 py-4 text-xs font-semibold uppercase tracking-[0.22em] text-[var(--color-foreground)]">
            Open delivery app
          </Link>
          <Link href="/signup" className="rounded-full border border-white/14 px-6 py-4 text-xs font-semibold uppercase tracking-[0.22em] text-white">
            Create rider account
          </Link>
        </div>
      </section>

      <section className="mt-10 grid gap-6 md:grid-cols-3">
        {[
          ['Hybrid dispatch', 'Admins can assign orders, and approved riders can also claim open jobs in their active zones.'],
          ['Zone-based payouts', 'Each delivered order earns a fixed amount based on the mapped delivery zone and pincode.'],
          ['OTP handoff', 'Customers confirm delivery with a one-time passcode, which protects riders and operations from false completion claims.'],
        ].map(([title, description]) => (
          <div key={title} className="premium-card p-6">
            <p className="text-[11px] uppercase tracking-[0.24em] text-[var(--color-muted-foreground)]">Why it works</p>
            <h2 className="mt-4 text-2xl font-semibold">{title}</h2>
            <p className="mt-4 text-sm leading-7 text-[var(--color-muted-foreground)]">{description}</p>
          </div>
        ))}
      </section>
    </main>
  );
}
