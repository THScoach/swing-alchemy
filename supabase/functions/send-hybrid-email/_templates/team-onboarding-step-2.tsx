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

interface TeamOnboardingStep2Props {
  coachName: string;
  reportsUrl: string;
}

export const TeamOnboardingStep2 = ({ coachName, reportsUrl }: TeamOnboardingStep2Props) => (
  <Html>
    <Head />
    <Preview>How to Read Your First Team Report</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>How to Read Your First Team Report</Heading>
        
        <Text style={text}>
          Hey Coach {coachName},
        </Text>
        
        <Text style={text}>
          Your first Team Report is about to hit your inbox.
        </Text>
        
        <Heading style={h2}>Here's how to read it:</Heading>
        
        <Text style={text}>
          📊 <strong>Tempo Trends</strong> — Are your players loading and firing in rhythm?<br />
          📈 <strong>Sequence Score</strong> — Measures efficiency from hips → hands → barrel<br />
          🎯 <strong>Focus Drill</strong> — Each player's #1 movement priority
        </Text>
        
        <Text style={text}>
          Open your Team Dashboard →
        </Text>
        
        <Link href={reportsUrl} style={button}>
          View Reports →
        </Link>
        
        <Text style={text}>
          The system auto-updates each week based on new uploads.<br />
          The more your players upload, the smarter the AI becomes.
        </Text>
        
        <Text style={signature}>
          — Coach Rick
        </Text>
        
        <Text style={footer}>
          The Hitting Skool | Team Platform
        </Text>
      </Container>
    </Body>
  </Html>
)

export default TeamOnboardingStep2

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
