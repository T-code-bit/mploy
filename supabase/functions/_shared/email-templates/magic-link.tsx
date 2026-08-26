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

interface MagicLinkEmailProps {
  siteName: string
  confirmationUrl: string
}

export const MagicLinkEmail = ({
  siteName,
  confirmationUrl,
}: MagicLinkEmailProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>Your {SITE_NAME} login link</Preview>
    <Body style={main}>
      <Container style={wrapper}>
        <EmailHeader />
        <Section style={{ padding: '32px 24px' }}>
          <Heading style={h1}>Your login link</Heading>
          <Text style={text}>
            Click the button below to log in to {SITE_NAME}. This link will expire shortly.
          </Text>
          <Section style={{ textAlign: 'center' as const, margin: '8px 0 24px' }}>
            <Button style={buttonStyle} href={confirmationUrl}>
              Log In to {SITE_NAME}
            </Button>
          </Section>
          <Text style={{ ...text, fontSize: '13px', color: '#9ca3af' }}>
            If you didn't request this link, you can safely ignore this email.
          </Text>
        </Section>
        <EmailFooter />
      </Container>
    </Body>
  </Html>
)

export default MagicLinkEmail
