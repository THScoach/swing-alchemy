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

interface HybridActivationProps {
  firstName: string;
  goalsLink: string;
  uploadLink: string;
  drillsLink: string;
  supportEmail: string;
}

export const HybridActivation = ({ 
  firstName, 
  goalsLink, 
  uploadLink, 
  drillsLink,
  supportEmail 
}: HybridActivationProps) => (
  <Html>
    <Head />
    <Preview>Your Hybrid plan ($99/mo) is active</Preview>
    <Body style={main}>
      <Container style={container}>
        <Text style={text}>
          Hi {firstName},
        </Text>
        
        <Text style={text}>
          🔥 Your Hybrid plan ($99/mo) is active.
        </Text>
        
        <Heading style={h2}>You get:</Heading>
        <Text style={text}>
          • Weekly personal coaching touch (DM/voice or live group)<br />
          • App-driven training plan that adapts as you improve<br />
          • Tempo + 4B deep dives with targeted drills<br />
          • Priority responses + progress tracking
        </Text>
        
        <Heading style={h2}>Start now (2 mins):</Heading>
        <Text style={text}>
          1) Set your training goal → <Link href={goalsLink} style={link}>Goals</Link><br />
          2) Upload 2–3 swings (≥60fps) → <Link href={uploadLink} style={link}>Upload</Link><br />
          3) See your assigned drills → <Link href={drillsLink} style={link}>Drills</Link>
        </Text>
        
        <Text style={text}>
          <strong>First checkpoint:</strong> You'll receive your plan update within 48 hours of your first upload.
        </Text>
        
        <Text style={text}>
          Let's go.
        </Text>
        
        <Text style={signature}>
          — Coach Rick
        </Text>
        
        <Text style={footer}>
          Support: <Link href={`mailto:${supportEmail}`} style={link}>{supportEmail}</Link>
        </Text>
      </Container>
    </Body>
  </Html>
)

export default HybridActivation

const main = {
  backgroundColor: '#ffffff',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", sans-serif',
}

const container = {
  margin: '0 auto',
  padding: '20px 0 48px',
  maxWidth: '600px',
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

const link = {
  color: '#2754C5',
  textDecoration: 'underline',
}

const signature = {
  color: '#333',
  fontSize: '16px',
  lineHeight: '26px',
  margin: '24px 0',
}

const footer = {
  color: '#898989',
  fontSize: '12px',
  lineHeight: '22px',
  marginTop: '32px',
  textAlign: 'center' as const,
}
