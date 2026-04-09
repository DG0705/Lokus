import { ContactForm } from '@/app/components/storefront/ContactForm';
import { Reveal } from '@/app/components/storefront/Reveal';

export default function ContactPage() {
  return (
    <main className="pb-20 pt-10">
      <section className="section-wrap grid gap-8 lg:grid-cols-[4rem_minmax(0,1fr)_minmax(20rem,0.95fr)]">
        <div className="hidden lg:flex lg:justify-center">
          <span className="lokus-rail text-[10px] text-[var(--color-muted-foreground)]">Contact Lokus</span>
        </div>
        <Reveal className="space-y-8">
          <div className="lokus-panel bg-white px-6 py-10 md:px-10 md:py-12">
            <p className="text-[11px] uppercase tracking-[0.3em] text-[var(--color-muted-foreground)]">Contact</p>
            <h1 className="mt-5 font-display text-6xl leading-[0.92] md:text-7xl">Need help before or after your order?</h1>
            <p className="mt-6 max-w-2xl text-base leading-8 text-[var(--color-muted-foreground)]">
              Reach the LOKUS support desk for sizing help, exchange requests, delivery questions, or brand guidance. Replies can come from the official LOKUS sender once SMTP is configured.
            </p>
            <div className="mt-8 space-y-4 text-sm leading-7 text-[var(--color-muted-foreground)]">
              <p>Email: support@lokus.store</p>
              <p>Phone: +91 98765 43210</p>
              <p>Hours: Monday to Saturday, 10 AM to 7 PM IST</p>
            </div>
          </div>
          <div className="grid gap-5 md:grid-cols-3">
            {[
              ['Sizing support', 'We help narrow down fit before checkout.'],
              ['Delivery help', 'Use your phone number and pincode for accurate shipment handling.'],
              ['Drop requests', 'Ask about the next countdown launch or private list access.'],
            ].map(([title, body], index) => (
              <Reveal key={title} delay={Math.min(index * 0.05, 0.14)} className="rounded-[1.75rem] border border-[var(--color-border)] bg-white px-5 py-6 shadow-[var(--shadow)]">
                <h2 className="font-display text-3xl">{title}</h2>
                <p className="mt-3 text-sm leading-7 text-[var(--color-muted-foreground)]">{body}</p>
              </Reveal>
            ))}
          </div>
        </Reveal>
        <Reveal delay={0.08}>
          <ContactForm />
        </Reveal>
      </section>
    </main>
  );
}
