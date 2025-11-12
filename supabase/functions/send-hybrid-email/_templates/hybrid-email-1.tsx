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

interface HybridEmail1Props {
  firstName: string;
  analyzeUrl: string;
}

export const HybridEmail1 = ({ firstName, analyzeUrl }: HybridEmail1Props) => (
  <Html>
    <Head />
    <Preview>Welcome to Hybrid Coaching — Let's Get Your Swing in Motion</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>Welcome to The Hitting Skool Hybrid Program</Heading>
        
        <Text style={text}>
          Hey {firstName},
        </Text>
        
        <Text style={text}>
          Welcome to <strong>The Hitting Skool Hybrid Program</strong> — you just stepped into the highest level of training we offer.
        </Text>
        
        <Text style={text}>
          Here's how it works starting today:
        </Text>
        
        <Text style={text}>
          1️⃣ Upload your first swing — we'll review it live on Monday's call.<br />
          2️⃣ Your Smart Drill Engine will adjust to your data automatically.<br />
          3️⃣ You'll start seeing the pattern behind your power, not just the mechanics.
        </Text>
        
        <Text style={text}>
          Hybrid means <strong>AI + human insight</strong> — you'll get the best of both.<br />
          The AI tracks the tempo. I help you find the feel.
        </Text>
        
        <Link href={analyzeUrl} style={button}>
          Upload Your Swing Now →
        </Link>
        
        <Text style={text}>
          You're officially in the loop.
        </Text>
        
        <Text style={signature}>
          — Coach Rick<br />
          <em>"The feel makes the data make sense."</em>
        </Text>
        
        <Text style={footer}>
          The Hitting Skool | Hybrid Coaching Program
        </Text>
      </Container>
    </Body>
  </Html>
)

export default HybridEmail1

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
