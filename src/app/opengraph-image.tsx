import { ImageResponse } from 'next/og'
import { getSiteSettings } from '@/lib/data/public'

// Aperçu affiché quand un lien du site est partagé sur WhatsApp (1200 x 630 obligatoire).
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'
export const alt =
  'Fondation MIRADEL FEVEPA : autonomiser les femmes et les jeunes vulnérables en RDC'

export default async function OpenGraphImage() {
  const settings = await getSiteSettings()
  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '72px 80px',
        background: '#f6f1e7',
        color: '#1c2a21',
        fontFamily: 'serif',
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <div style={{ fontSize: 30, letterSpacing: 12, color: '#8f5114' }}>FONDATION</div>
        <div style={{ fontSize: 132, lineHeight: 1, marginTop: 8 }}>MIRADEL</div>
        <div style={{ fontSize: 30, letterSpacing: 12, marginTop: 10, color: '#4b5a4f' }}>
          FEVEPA
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <div style={{ fontSize: 42, color: '#1f5a3d', maxWidth: 1000 }}>
          {settings.tagline ?? ''}
        </div>
      </div>
    </div>,
    size,
  )
}
