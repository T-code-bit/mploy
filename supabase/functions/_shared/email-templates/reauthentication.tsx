/// <reference types="npm:@types/react@18.3.1" />

import * as React from 'npm:react@18.3.1'

import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
} from 'npm:@react-email/components@0.0.22'

import { EmailHeader, EmailFooter, SITE_NAME, main, wrapper, h1, text, codeBlock } from './brand.tsx'

interface ReauthenticationEmailProps {
  token: string
}

export const ReauthenticationEmail = ({ token }: ReauthenticationEmailProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>Your {SITE_NAME} verification code</Preview>
    <Body style={main}>
      <Container style={wrapper}>
        <EmailHeader />
        <Section style={{ padding: '32px 24px' }}>
          <Heading style={h1}>Verification code</Heading>
          <Text style={text}>
            Use the code below to confirm your identity on {SITE_NAME}:
          </Text>
          <Text style={codeBlock}>{token}</Text>
          <Text style={{ ...text, fontSize: '13px', color: '#9ca3af' }}>
            This code will expire shortly. If you didn't request this, you can safely ignore this email.
          </Text>
        </Section>
        <EmailFooter />
      </Container>
    </Body>
  </Html>
)

export default ReauthenticationEmail
