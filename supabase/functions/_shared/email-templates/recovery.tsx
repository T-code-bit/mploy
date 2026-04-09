/// <reference types="npm:@types/react@18.3.1" />

import * as React from 'npm:react@18.3.1'

import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
} from 'npm:@react-email/components@0.0.22'

import { EmailHeader, EmailFooter, SITE_NAME, main, wrapper, h1, text, buttonStyle } from './brand.tsx'

interface RecoveryEmailProps {
  siteName: string
  confirmationUrl: string
}

export const RecoveryEmail = ({
  siteName,
  confirmationUrl,
}: RecoveryEmailProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>Reset your {SITE_NAME} password</Preview>
    <Body style={main}>
      <Container style={wrapper}>
        <EmailHeader />
        <Section style={{ padding: '32px 24px' }}>
          <Heading style={h1}>Reset your password</Heading>
          <Text style={text}>
            We received a request to reset your {SITE_NAME} password. Click the button below to choose a new password.
          </Text>
          <Section style={{ textAlign: 'center' as const, margin: '8px 0 24px' }}>
            <Button style={buttonStyle} href={confirmationUrl}>
              Reset Password
            </Button>
          </Section>
          <Text style={{ ...text, fontSize: '13px', color: '#9ca3af' }}>
            If you didn't request a password reset, you can safely ignore this email. Your password will not be changed.
          </Text>
        </Section>
        <EmailFooter />
      </Container>
    </Body>
  </Html>
)

export default RecoveryEmail
