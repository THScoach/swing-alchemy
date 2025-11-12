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

interface ReactivationConfirmationProps {
  firstName: string;
  dashboardUrl: string;
}

export const HybridReactivationConfirmation = ({ firstName, dashboardUrl }: ReactivationConfirmationProps) => (
  <Html>
    <Head />
    <Preview>Got It — Your Swing Is Being Reanalyzed</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>Welcome back — your new swing just came through. 🔥</Heading>
        
        <Text style={text}>
          Hey {firstName},
        </Text>
        
        <Text style={text}>
          I've queued it for analysis, and your Hybrid AI is already recalculating your updated 4B and tempo metrics.<br />
          You'll see your refreshed data and drill recommendations inside your dashboard within 24 hours.
        </Text>
        
        <Heading style={h2}>Here's what's happening right now:</Heading>
        
        <Text style={text}>
          ✅ AI recalibrates your tempo + sequencing<br />
          ✅ Reboot metrics update (if Model Mode)<br />
          ✅ Coach Rick review scheduled for Monday's session
        </Text>
        
        <Text style={text}>
          You're back in rhythm — stay with it this week.<br />
          If you upload again within 3 days, your metrics confidence score increases automatically.
        </Text>
        
        <Link href={dashboardUrl} style={button}>
          View My Updated Dashboard →
        </Link>
        
        <Text style={text}>
          Proud of you for getting back after it.
        </Text>
        
        <Text style={signature}>
          — Coach Rick<br />
          "The feel makes the data make sense."
        </Text>
        
        <Text style={footer}>
          The Hitting Skool | Hybrid Coaching Program
        </Text>
      </Container>
    </Body>
  </Html>
)

export default HybridReactivationConfirmation

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
