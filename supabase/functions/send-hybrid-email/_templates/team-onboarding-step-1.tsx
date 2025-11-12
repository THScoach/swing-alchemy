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

interface TeamOnboardingStep1Props {
  coachName: string;
  dashboardUrl: string;
}

export const TeamOnboardingStep1 = ({ coachName, dashboardUrl }: TeamOnboardingStep1Props) => (
  <Html>
    <Head />
    <Preview>Your Team Dashboard Is Ready — Let's Get Your Players Set Up</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>Your Team Dashboard Is Ready</Heading>
        
        <Text style={text}>
          Hey Coach {coachName},
        </Text>
        
        <Text style={text}>
          Welcome to <strong>The Hitting Skool Team Platform</strong> — your new player development command center.
        </Text>
        
        <Heading style={h2}>Here's your 3-step setup:</Heading>
        
        <Text style={text}>
          1️⃣ Add your players (name, level, handedness)<br />
          2️⃣ Send them their upload link<br />
          3️⃣ Upload one sample swing from each hitter this week
        </Text>
        
        <Heading style={h2}>Once uploaded, you'll see:</Heading>
        
        <Text style={text}>
          ⚾ Tempo ratios (Load:Fire)<br />
          💪 4B scores (Brain, Body, Bat, Ball)<br />
          🎯 Drill recommendations auto-generated per player
        </Text>
        
        <Link href={dashboardUrl} style={button}>
          Launch My Team Dashboard →
        </Link>
        
        <Text style={text}>
          We'll email your first weekly Team Report every Monday.
        </Text>
        
        <Text style={signature}>
          — Coach Rick<br />
          "Train smarter. Coach faster."
        </Text>
        
        <Text style={footer}>
          The Hitting Skool | Team Platform
        </Text>
      </Container>
    </Body>
  </Html>
)

export default TeamOnboardingStep1

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
