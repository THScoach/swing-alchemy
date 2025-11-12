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

interface ReactivationStep1Props {
  firstName: string;
  analyzeUrl: string;
}

export const HybridReactivationStep1 = ({ firstName, analyzeUrl }: ReactivationStep1Props) => (
  <Html>
    <Head />
    <Preview>Quick Check-In — Haven't Seen a Swing in a While</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>Quick Check-In</Heading>
        
        <Text style={text}>
          Hey {firstName},
        </Text>
        
        <Text style={text}>
          Just wanted to check in — looks like it's been a couple weeks since your last upload.
        </Text>
        
        <Text style={text}>
          No pressure — but every swing you record helps the system fine-tune your progress.<br />
          The drills, tempo feedback, even your AI recommendations — they only stay accurate if your uploads stay current.
        </Text>
        
        <Text style={text}>
          Here's your quick link to drop in a swing right now:
        </Text>
        
        <Link href={analyzeUrl} style={button}>
          Upload New Swing →
        </Link>
        
        <Text style={text}>
          Don't overthink it. Just film one open-face view, upload, and keep the rhythm alive.
        </Text>
        
        <Text style={text}>
          You're closer than you think.
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

export default HybridReactivationStep1

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
