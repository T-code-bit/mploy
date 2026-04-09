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

import { EmailHeader, EmailFooter, SITE_NAME, main, wrapper, h1, text, buttonStyle, linkStyle } from './brand.tsx'

interface EmailChangeEmailProps {
  siteName: string
  email: string
  newEmail: string
  confirmationUrl: string
}

export const EmailChangeEmail = ({
  siteName,
  email,
  newEmail,
  confirmationUrl,
}: EmailChangeEmailProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>Confirm your email change for {SITE_NAME}</Preview>
    <Body style={main}>
      <Container style={wrapper}>
        <EmailHeader />
        <Section style={{ padding: '32px 24px' }}>
          <Heading style={h1}>Confirm your email change</Heading>
          <Text style={text}>
            You requested to change your {SITE_NAME} email address from{' '}
            <Link href={`mailto:${email}`} style={linkStyle}>{email}</Link>
            {' '}to{' '}
            <Link href={`mailto:${newEmail}`} style={linkStyle}>{newEmail}</Link>.
          </Text>
          <Section style={{ textAlign: 'center' as const, margin: '8px 0 24px' }}>
            <Button style={buttonStyle} href={confirmationUrl}>
              Confirm Email Change
            </Button>
          </Section>
          <Text style={{ ...text, fontSize: '13px', color: '#9ca3af' }}>
            If you didn't request this change, please secure your account immediately.
          </Text>
        </Section>
        <EmailFooter recipient={email} />
      </Container>
    </Body>
  </Html>
)

export default EmailChangeEmail
