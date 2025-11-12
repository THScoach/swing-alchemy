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

interface OnboardingStep1Props {
  firstName: string;
  dashboardUrl: string;
  analyzeUrl: string;
}

export const OnboardingStep1 = ({ firstName, dashboardUrl, analyzeUrl }: OnboardingStep1Props) => (
  <Html>
    <Head />
    <Preview>Welcome to The Hitting Skool — Here's Your First Step</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>Welcome to The Hitting Skool</Heading>
        
        <Text style={text}>
          Hey {firstName},
        </Text>
        
        <Text style={text}>
          Welcome aboard. You just joined a system built to simplify hitting science — rhythm, sequence, and feel.
        </Text>
        
        <Heading style={h2}>Here's how to start:</Heading>
        
        <Text style={text}>
          1️⃣ Log in → <Link href={dashboardUrl} style={link}>Dashboard</Link><br />
          2️⃣ Watch the short "How to Record Your Swing" video<br />
          3️⃣ Upload one open-face clip today
        </Text>
        
        <Text style={text}>
          Once you upload, the AI will analyze tempo (load:fire), 4B metrics, and give you first drill recommendations.
        </Text>
        
        <Link href={analyzeUrl} style={button}>
          Upload My First Swing →
        </Link>
        
        <Text style={text}>
          Every swing you record teaches the system who <strong>you</strong> are as a hitter.<br />
          Let's start your baseline today.
        </Text>
        
        <Text style={signature}>
          — Coach Rick<br />
          "The feel makes the data make sense."
        </Text>
        
        <Text style={footer}>
          The Hitting Skool
        </Text>
      </Container>
    </Body>
  </Html>
)

export default OnboardingStep1

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

const link = {
  color: '#2754C5',
  textDecoration: 'underline',
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
