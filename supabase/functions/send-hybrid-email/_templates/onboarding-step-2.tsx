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

interface OnboardingStep2Props {
  firstName: string;
  analyzeUrl: string;
}

export const OnboardingStep2 = ({ firstName, analyzeUrl }: OnboardingStep2Props) => (
  <Html>
    <Head />
    <Preview>Your Swing Tells the Story — Ready to See It?</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>Your Swing Tells the Story</Heading>
        
        <Text style={text}>
          Hey {firstName},
        </Text>
        
        <Text style={text}>
          If you haven't uploaded yet — no worries.<br />
          But remember: AI can't coach what it hasn't seen.
        </Text>
        
        <Heading style={h2}>Your first upload triggers:</Heading>
        
        <Text style={text}>
          ✅ Tempo ratio calculation (Load:Fire)<br />
          ✅ 4B scores across Brain, Body, Bat, Ball<br />
          ✅ Personalized drill playlist
        </Text>
        
        <Text style={text}>
          This is where progress becomes visible.<br />
          Upload 1 clip today →
        </Text>
        
        <Link href={analyzeUrl} style={button}>
          Upload My Swing →
        </Link>
        
        <Text style={signature}>
          — Coach Rick
        </Text>
        
        <Text style={footer}>
          The Hitting Skool
        </Text>
      </Container>
    </Body>
  </Html>
)

export default OnboardingStep2

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
