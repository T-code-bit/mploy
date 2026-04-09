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

interface SignupEmailProps {
  siteName: string
  siteUrl: string
  recipient: string
  confirmationUrl: string
}

export const SignupEmail = ({
  siteName,
  siteUrl,
  recipient,
  confirmationUrl,
}: SignupEmailProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>Welcome to {SITE_NAME}! Confirm your email to get started</Preview>
    <Body style={main}>
      <Container style={wrapper}>
        <EmailHeader />
        <Section style={{ padding: '32px 24px' }}>
          <Heading style={h1}>Welcome aboard! 🎉</Heading>
          <Text style={text}>
            Thank you for joining{' '}
            <Link href={SITE_URL} style={linkStyle}>
              <strong>{SITE_NAME}</strong>
            </Link>
            ! We're excited to help you on your career journey.
          </Text>
          <Text style={text}>
            Please confirm your email address (
            <Link href={`mailto:${recipient}`} style={linkStyle}>
              {recipient}
            </Link>
            ) to activate your account and access verified jobs, ATS-optimized CV tools, and industry-recognized courses.
          </Text>
          <Section style={{ textAlign: 'center' as const, margin: '8px 0 24px' }}>
            <Button style={buttonStyle} href={confirmationUrl}>
              Get Started
            </Button>
          </Section>
          <Text style={{ ...text, fontSize: '13px', color: '#9ca3af' }}>
            If you didn't create an account, you can safely ignore this email.
          </Text>
        </Section>
        <EmailFooter recipient={recipient} />
      </Container>
    </Body>
  </Html>
)

export default SignupEmail
