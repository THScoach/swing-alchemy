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

interface TeamExpansionStep3Props {
  coachName: string;
  upgradeUrl: string;
}

export const TeamExpansionStep3 = ({ coachName, upgradeUrl }: TeamExpansionStep3Props) => (
  <Html>
    <Head />
    <Preview>Final Reminder — Don't Let Data Drop Off</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>Final Reminder — Don't Let Data Drop Off</Heading>
        
        <Text style={text}>
          Hey Coach {coachName},
        </Text>
        
        <Text style={text}>
          You've hit 100% of your team capacity, and your new uploads are on hold.
        </Text>
        
        <Heading style={h2}>If you upgrade this week, we'll unlock:</Heading>
        
        <Text style={text}>
          - Expanded roster space<br />
          - 90-day Team Trends View<br />
          - Priority AI analysis speed
        </Text>
        
        <Link href={upgradeUrl} style={button}>
          Unlock More Seats Now →
        </Link>
        
        <Text style={text}>
          We're locking early-adopter pricing this Friday — your current rate will stay locked in for 12 months when you upgrade now.
        </Text>
        
        <Text style={signature}>
          — Coach Rick<br />
          "Your team's rhythm deserves to keep flowing."
        </Text>
        
        <Text style={footer}>
          The Hitting Skool | Team Platform
        </Text>
      </Container>
    </Body>
  </Html>
)

export default TeamExpansionStep3

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
