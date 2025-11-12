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

interface ReactivationEmailProps {
  firstName: string;
  analyzeUrl: string;
  subjectVariant?: number;
}

export const HybridEmailReactivation = ({ firstName, analyzeUrl, subjectVariant = 1 }: ReactivationEmailProps) => (
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
          Just checking in.
        </Text>
        
        <Text style={text}>
          It looks like it's been a little while since your last upload — and I want to make sure you're still getting reps in.
        </Text>
        
        <Text style={text}>
          This isn't a "where have you been" message.<br />
          It's a <strong>"let's get back in rhythm"</strong> message.
        </Text>
        
        <Text style={text}>
          The Hybrid system only works when you do —<br />
          because every swing you upload helps the AI learn your timing, your sequence, your feel.
        </Text>
        
        <Heading style={h2}>Here's what to do right now:</Heading>
        
        <Text style={text}>
          ✅ Record 1 new swing — open-face view, 240fps if possible.<br />
          ✅ Upload it here →
        </Text>
        
        <Link href={analyzeUrl} style={button}>
          Upload New Swing →
        </Link>
        
        <Text style={text}>
          ✅ Join Monday's Live Call if you can — we'll walk through it together.
        </Text>
        
        <Text style={text}>
          If life's been busy, no stress — that happens.<br />
          Just don't lose your rhythm. Two swings a week keeps your data fresh and your tempo sharp.
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

export default HybridEmailReactivation

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
