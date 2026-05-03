'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';

export function Footer() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    // TODO: hook up to Mailchimp / Resend in phase 2
    setSubmitted(true);
    setTimeout(() => {
      setEmail('');
      setSubmitted(false);
    }, 3000);
  };

  return (
    <footer className="border-t border-bone-200/10 mt-32">
      <div className="container-x py-20">
        <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr_1fr_1fr] gap-12 mb-16">
          <div>
            <Link href="/" className="inline-flex items-center mb-8" aria-label="Brenn Coffee — home">
              <Image
                src="/brand/svg/brenn-wordmark-color.svg"
                alt="Brenn"
                width={160}
                height={70}
                className="h-8 w-auto hidden dark:block"
              />
              <Image
                src="/brand/svg/brenn-wordmark-color-light.svg"
                alt="Brenn"
                width={160}
                height={70}
                className="h-8 w-auto block dark:hidden"
              />
            </Link>
            <h3 className="font-serif text-3xl text-bone-100 mb-4">Stay in the loop.</h3>
            <p className="text-sm text-bone-200/60 leading-relaxed mb-6 max-w-md">
              Brewing tips, new releases, and the occasional discount. No spam — we promise.
            </p>
            <form
              onSubmit={handleSubmit}
              className="flex border-b border-bone-200/20 pb-3 max-w-md"
            >
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                className="flex-1 bg-transparent text-sm text-bone-200 outline-none placeholder:text-bone-200/40 py-2"
              />
              <button
                type="submit"
                className="text-xs tracking-[0.15em] uppercase text-ember hover:text-ember-400 transition-colors"
              >
                {submitted ? 'Thanks ✓' : 'Subscribe →'}
              </button>
            </form>
          </div>

          <FooterColumn
            title="Shop"
            links={[
              { label: 'All coffee', href: '/shop' },
              { label: 'Single origin', href: '/shop?filter=single' },
              { label: 'Subscriptions', href: '/subscriptions' },
              { label: 'Gift cards', href: '/gift-cards' },
            ]}
          />
          <FooterColumn
            title="Learn"
            links={[
              { label: 'Brewing guides', href: '/brewing' },
              { label: 'Origins', href: '/origins' },
              { label: 'Journal', href: '/journal' },
              { label: 'FAQ', href: '/faq' },
            ]}
          />
          <FooterColumn
            title="Company"
            links={[
              { label: 'About us', href: '/about' },
              { label: 'Sustainability', href: '/sustainability' },
              { label: 'Wholesale', href: '/wholesale' },
              { label: 'Contact', href: '/contact' },
            ]}
          />
        </div>

        <div className="pt-8 border-t border-bone-200/10 flex flex-col sm:flex-row justify-between gap-4 text-xs text-bone-200/40">
          <span>© {new Date().getFullYear()} Brenn Coffee Roasters Ltd.</span>
          <span>London · United Kingdom</span>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({
  title,
  links,
}: {
  title: string;
  links: { label: string; href: string }[];
}) {
  return (
    <div>
      <h4 className="text-[11px] tracking-[0.2em] uppercase text-ember mb-5 font-medium">
        {title}
      </h4>
      <ul className="space-y-3">
        {links.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className="text-sm text-bone-200/60 hover:text-ember transition-colors"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
