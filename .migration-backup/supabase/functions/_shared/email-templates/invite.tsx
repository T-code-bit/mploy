/// <reference types="npm:@types/react@18.3.1" />

import * as React from 'npm:react@18.3.1'

import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from 'npm:@react-email/components@0.0.22'

import { EmailHeader, EmailFooter, SITE_NAME, SITE_URL, main, wrapper, h1, text, buttonStyle, linkStyle } from './brand.tsx'

interface InviteEmailProps {
  siteName: string
  siteUrl: string
  confirmationUrl: string
}

export const InviteEmail = ({
  siteName,
  siteUrl,
  confirmationUrl,
}: InviteEmailProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>You've been invited to join {SITE_NAME}</Preview>
    <Body style={main}>
      <Container style={wrapper}>
        <EmailHeader />
        <Section style={{ padding: '32px 24px' }}>
          <Heading style={h1}>You've been invited! 🎉</Heading>
          <Text style={text}>
            You've been invited to join{' '}
            <Link href={SITE_URL} style={linkStyle}>
              <strong>{SITE_NAME}</strong>
            </Link>
            . Accept the invitation below to create your account and start exploring verified job opportunities.
          </Text>
          <Section style={{ textAlign: 'center' as const, margin: '8px 0 24px' }}>
            <Button style={buttonStyle} href={confirmationUrl}>
              Accept Invitation
            </Button>
          </Section>
          <Text style={{ ...text, fontSize: '13px', color: '#9ca3af' }}>
            If you weren't expecting this invitation, you can safely ignore this email.
          </Text>
        </Section>
        <EmailFooter />
      </Container>
    </Body>
  </Html>
)

export default InviteEmail
