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

interface OnboardingStep3Props {
  firstName: string;
  analyzeUrl: string;
}

export const OnboardingStep3 = ({ firstName, analyzeUrl }: OnboardingStep3Props) => (
  <Html>
    <Head />
    <Preview>Your AI Coach Is Ready to Break Down Your Swing</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>Your AI Coach Is Ready</Heading>
        
        <Text style={text}>
          Hey {firstName},
        </Text>
        
        <Text style={text}>
          The system is now tracking your progress zones:
        </Text>
        
        <Text style={text}>
          🎯 Brain – decision speed<br />
          💪 Body – sequence & anchor timing<br />
          ⚾ Bat – speed & lag<br />
          🎯 Ball – impact consistency
        </Text>
        
        <Text style={text}>
          Upload again this week to see how your tempo ratio changes as you train.<br />
          Every upload adjusts your AI Coach Rick's recommendations in real time.
        </Text>
        
        <Link href={analyzeUrl} style={button}>
          Upload New Swing →
        </Link>
        
        <Text style={text}>
          Stay consistent — the AI gets smarter as you do.
        </Text>
        
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

export default OnboardingStep3

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
