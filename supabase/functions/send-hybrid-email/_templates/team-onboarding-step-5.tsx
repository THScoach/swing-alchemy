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

interface TeamOnboardingStep5Props {
  coachName: string;
  trendsUrl: string;
}

export const TeamOnboardingStep5 = ({ coachName, trendsUrl }: TeamOnboardingStep5Props) => (
  <Html>
    <Head />
    <Preview>We've Built You a Custom Retention Bonus</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>We've Built You a Custom Retention Bonus</Heading>
        
        <Text style={text}>
          Hey Coach {coachName},
        </Text>
        
        <Text style={text}>
          Because you've been using the Team Platform consistently, we've unlocked a bonus feature for you:
        </Text>
        
        <Text style={text}>
          💡 <strong>Team Trends View</strong> — a 90-day rolling chart of every player's swing tempo, 4B scores, and sequence timing.
        </Text>
        
        <Heading style={h2}>This helps you:</Heading>
        
        <Text style={text}>
          ✅ Identify breakout hitters early<br />
          ✅ Adjust your team training plan instantly<br />
          ✅ Keep parents and directors impressed with data
        </Text>
        
        <Link href={trendsUrl} style={button}>
          View My Trends Report →
        </Link>
        
        <Text style={text}>
          This is what long-term development looks like — measurable, visual, and consistent.
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

export default TeamOnboardingStep5

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
