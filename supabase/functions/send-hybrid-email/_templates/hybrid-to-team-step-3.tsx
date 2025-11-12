import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Text,
} from 'https://esm.sh/@react-email/components@0.0.15'
import * as React from 'https://esm.sh/react@18.2.0'

interface HybridToTeamStep3Props {
  firstName: string;
  upgradeUrl: string;
}

export const HybridToTeamStep3 = ({ firstName, upgradeUrl }: HybridToTeamStep3Props) => (
  <Html>
    <Head />
    <Preview>Keep Your Players Connected — Upgrade Before Friday</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>Keep Your Players Connected</Heading>
        
        <Text style={text}>
          Hey {firstName},
        </Text>
        
        <Text style={text}>
          We'll be locking hybrid accounts with multiple player uploads starting next week to keep the system running smoothly.
        </Text>
        
        <Heading style={h2}>Upgrade now to:</Heading>
        
        <Text style={text}>
          ⚾ Keep your roster connected<br />
          ⚾ Preserve your uploaded player data<br />
          ⚾ Access Team Reports every Monday
        </Text>
        
        <Text style={text}>
          Upgrade takes 60 seconds →
        </Text>
        
        <Link href={upgradeUrl} style={button}>
          Upgrade Now →
        </Link>
        
        <Text style={text}>
          This keeps your coaching business scalable — and your players' data safe.
        </Text>
        
        <Text style={signature}>
          — Coach Rick<br />
          "The future favors organized coaches."
        </Text>
        
        <Text style={footer}>
          The Hitting Skool | Team Platform
        </Text>
      </Container>
    </Body>
  </Html>
)

export default HybridToTeamStep3

const main = {
  backgroundColor: '#ffffff',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", sans-serif',
}

const container = {
  margin: '0 auto',
  padding: '20px 0 48px',
  maxWidth: '600px',
}

const h1 = {
  color: '#1a1a1a',
  fontSize: '24px',
  fontWeight: 'bold',
  margin: '40px 0 20px',
  padding: '0',
  lineHeight: '1.4',
}

const h2 = {
  color: '#1a1a1a',
  fontSize: '18px',
  fontWeight: 'bold',
  margin: '24px 0 16px',
  padding: '0',
  lineHeight: '1.4',
}

const text = {
  color: '#333',
  fontSize: '16px',
  lineHeight: '26px',
  margin: '16px 0',
}

const button = {
  backgroundColor: '#FFD700',
  borderRadius: '5px',
  color: '#000',
  display: 'inline-block',
  fontSize: '16px',
  fontWeight: 'bold',
  padding: '12px 24px',
  textDecoration: 'none',
  textAlign: 'center' as const,
  margin: '20px 0',
}

const signature = {
  color: '#333',
  fontSize: '16px',
  lineHeight: '26px',
  margin: '24px 0',
  fontStyle: 'italic',
}

const footer = {
  color: '#898989',
  fontSize: '12px',
  lineHeight: '22px',
  marginTop: '32px',
  textAlign: 'center' as const,
}
