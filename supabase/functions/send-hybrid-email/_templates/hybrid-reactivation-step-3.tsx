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

interface ReactivationStep3Props {
  firstName: string;
  dashboardUrl: string;
}

export const HybridReactivationStep3 = ({ firstName, dashboardUrl }: ReactivationStep3Props) => (
  <Html>
    <Head />
    <Preview>Ready for a Fresh Start? I've Reset Your Week 1 Plan.</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>Let's Hit Reset</Heading>
        
        <Text style={text}>
          Hey {firstName},
        </Text>
        
        <Text style={text}>
          Let's hit reset.
        </Text>
        
        <Text style={text}>
          I've reopened your Week 1 Hybrid drills so you can jump back in without starting from scratch.<br />
          You're not behind — you're just one upload away from getting back on track.
        </Text>
        
        <Heading style={h2}>Here's what to do:</Heading>
        
        <Text style={text}>
          ✅ Upload 1 swing (open face, clear contact)<br />
          ✅ Log in to review your Week 1 reset plan<br />
          ✅ Join Monday's call if you can — I'll help you recalibrate your tempo
        </Text>
        
        <Link href={dashboardUrl} style={button}>
          Restart My Hybrid Plan →
        </Link>
        
        <Text style={text}>
          You don't need perfect conditions — just a start.<br />
          Momentum's waiting.
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

export default HybridReactivationStep3

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
