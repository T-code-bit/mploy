/// <reference types="npm:@types/react@18.3.1" />

import * as React from 'npm:react@18.3.1'

import {
  Container,
  Heading,
  Hr,
  Img,
  Link,
  Section,
  Text,
} from 'npm:@react-email/components@0.0.22'

const ASSETS = 'https://ypqdeaarllhwnxyijshs.supabase.co/storage/v1/object/public/email-assets'

export const SITE_NAME = 'M-Ploy'
export const SITE_URL = 'https://mploy.lovable.app'

/* ── shared styles ── */
export const main = {
  backgroundColor: '#ffffff',
  fontFamily: "'Plus Jakarta Sans', Arial, sans-serif",
}

export const wrapper = {
  maxWidth: '600px',
  margin: '0 auto',
  backgroundColor: '#ffffff',
}

export const headerSection = {
  background: 'linear-gradient(135deg, #1a9a6e 0%, #22b07e 50%, #e8952e 100%)',
  padding: '32px 24px',
  textAlign: 'center' as const,
  borderRadius: '0 0 16px 16px',
}

export const h1 = {
  fontSize: '24px',
  fontWeight: '700' as const,
  color: '#1a2b1d',
  margin: '0 0 16px',
  fontFamily: "'Space Grotesk', Arial, sans-serif",
}

export const text = {
  fontSize: '15px',
  color: '#555d5f',
  lineHeight: '1.65',
  margin: '0 0 20px',
}

export const buttonStyle = {
  backgroundColor: '#1a9a6e',
  color: '#ffffff',
  fontSize: '15px',
  fontWeight: '600' as const,
  borderRadius: '14px',
  padding: '14px 28px',
  textDecoration: 'none',
  display: 'inline-block',
  textAlign: 'center' as const,
}

export const codeBlock = {
  fontFamily: "'Space Grotesk', Courier, monospace",
  fontSize: '28px',
  fontWeight: '700' as const,
  color: '#1a9a6e',
  letterSpacing: '4px',
  margin: '0 0 30px',
  textAlign: 'center' as const,
}

export const linkStyle = { color: '#1a9a6e', textDecoration: 'underline' }

export const footerText = {
  fontSize: '12px',
  color: '#9ca3af',
  margin: '0 0 8px',
  lineHeight: '1.5',
}

/* ── Header Component ── */
export const EmailHeader = () => (
  <Section style={headerSection}>
    <Img
      src={`${ASSETS}/mploy-logo.png`}
      alt="M-Ploy"
      width="56"
      height="56"
      style={{ margin: '0 auto 12px', borderRadius: '12px' }}
    />
    <Text style={{ color: '#ffffff', fontSize: '22px', fontWeight: '700', margin: '0', fontFamily: "'Space Grotesk', Arial, sans-serif" }}>
      M-Ploy
    </Text>
    <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: '13px', margin: '4px 0 0' }}>
      Your Career Journey Starts Here
    </Text>
  </Section>
)

/* ── Footer Component ── */
export const EmailFooter = ({ recipient }: { recipient?: string }) => (
  <>
    <Hr style={{ borderColor: '#e5e7eb', margin: '32px 0 24px' }} />

    {/* Social Links */}
    <Section style={{ textAlign: 'center' as const, marginBottom: '20px' }}>
      <Text style={{ fontSize: '13px', color: '#6b7280', margin: '0 0 12px', fontWeight: '600' }}>
        Connect with M-Ploy
      </Text>
      <Text style={{ margin: '0' }}>
        <Link href="https://www.facebook.com/betheleader001/" style={{ ...linkStyle, margin: '0 8px', fontSize: '13px' }}>Facebook</Link>
        {' · '}
        <Link href="https://x.com/LeaderBtl5600/" style={{ ...linkStyle, margin: '0 8px', fontSize: '13px' }}>Twitter / X</Link>
        {' · '}
        <Link href="https://ke.linkedin.com/company/be-the-leader-btl" style={{ ...linkStyle, margin: '0 8px', fontSize: '13px' }}>LinkedIn</Link>
        {' · '}
        <Link href="https://www.instagram.com/betheleader_org/" style={{ ...linkStyle, margin: '0 8px', fontSize: '13px' }}>Instagram</Link>
        {' · '}
        
      </Text>
    </Section>

    {/* Contact info */}
    <Section style={{ textAlign: 'center' as const, marginBottom: '20px' }}>
      <Text style={{ fontSize: '13px', color: '#374151', margin: '0 0 4px', fontWeight: '600' }}>
        M-Ploy · Nairobi, Kenya
      </Text>
      <Text style={{ fontSize: '12px', color: '#6b7280', margin: '0 0 4px' }}>
        <Link href="tel:+254793264418" style={linkStyle}>+254 793 264 418</Link>
        {' · '}
        <Link href="mailto:mploykenya@gmail.com" style={linkStyle}>mploykenya@gmail.com</Link>
      </Text>
      <Text style={{ fontSize: '11px', color: '#9ca3af', margin: '0' }}>
        Mon – Fri · 8:00 AM – 5:00 PM (EAT)
      </Text>
    </Section>

    {/* Partner Logos */}
    <Section style={{ textAlign: 'center' as const, marginBottom: '24px' }}>
      <Text style={{ fontSize: '11px', color: '#9ca3af', margin: '0 0 12px', textTransform: 'uppercase' as const, letterSpacing: '1px' }}>
        Our Partners
      </Text>
      <table cellPadding="0" cellSpacing="0" role="presentation" style={{ margin: '0 auto' }}>
        <tr>
          <td style={{ padding: '0 10px' }}>
            <Img src={`${ASSETS}/partner-btl.png`} alt="BTL" width="40" height="40" style={{ borderRadius: '6px' }} />
          </td>
          <td style={{ padding: '0 10px' }}>
            <Img src={`${ASSETS}/partner-kenya-seal.png`} alt="Republic of Kenya" width="40" height="40" style={{ borderRadius: '6px' }} />
          </td>
          <td style={{ padding: '0 10px' }}>
            <Img src={`${ASSETS}/partner-gye.png`} alt="GYE" width="40" height="40" style={{ borderRadius: '6px' }} />
          </td>
          <td style={{ padding: '0 10px' }}>
            <Img src={`${ASSETS}/partner-ict-kenya.png`} alt="ICT Authority Kenya" width="40" height="40" style={{ borderRadius: '6px' }} />
          </td>
        </tr>
      </table>
    </Section>

    {/* Footer text */}
    <Section style={{ textAlign: 'center' as const, padding: '0 24px 32px' }}>
      {recipient && (
        <Text style={footerText}>
          This email was sent to {recipient}
        </Text>
      )}
      <Text style={footerText}>
        © {new Date().getFullYear()} M-Ploy. All rights reserved.
      </Text>
      <Text style={footerText}>
        <Link href={`${SITE_URL}/privacy`} style={{ color: '#9ca3af', textDecoration: 'underline' }}>Privacy Policy</Link>
        {' · '}
        <Link href={`${SITE_URL}/terms`} style={{ color: '#9ca3af', textDecoration: 'underline' }}>Terms of Service</Link>
        {' · '}
        <Link href={`${SITE_URL}/cookies`} style={{ color: '#9ca3af', textDecoration: 'underline' }}>Cookie Policy</Link>
      </Text>
    </Section>
  </>
)
