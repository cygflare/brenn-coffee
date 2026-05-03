import type { Metadata } from 'next';

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="container-x py-16 lg:py-24 max-w-md mx-auto">
      {children}
    </div>
  );
}
