import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Turntable — 3D Inspection Viewer',
  description:
    'Drop a .glb model onto a lit turntable and inspect it: rotate, zoom, swap materials, toggle wireframe.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
