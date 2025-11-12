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

interface HybridToTeamStep1Props {
  firstName: string;
  upgradeUrl: string;
}

export const HybridToTeamStep1 = ({ firstName, upgradeUrl }: HybridToTeamStep1Props) => (
  <Html>
    <Head />
    <Preview>Looks Like You're Coaching a Team — Let's Make It Official</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>You're Coaching a Team</Heading>
        
        <Text style={text}>
          Hey {firstName},
        </Text>
        
        <Text style={text}>
          We noticed you're managing multiple hitters through your account — that's awesome.
        </Text>
        
        <Text style={text}>
          You've outgrown the hybrid plan.<br />
          To keep everything running smoothly (and avoid limits), we've set you up for <strong>Team Coach access</strong>.
        </Text>
        
        <Heading style={h2}>Here's what you'll unlock:</Heading>
        
        <Text style={text}>
          ✅ Team Dashboard (manage up to 10 players)<br />
          ✅ Weekly Team Reports + Leaderboards<br />
          ✅ Player Upload Links (no manual work)<br />
          ✅ Seat-based pricing that grows with your roster
        </Text>
        
        <Text style={text}>
          You're already doing the work — now you'll get the tools to scale it.
        </Text>
        
        <Link href={upgradeUrl} style={button}>
          Upgrade to Team Plan Now →
        </Link>
        
        <Text style={signature}>
          — Coach Rick<br />
          "From coach to program — in one click."
        </Text>
        
        <Text style={footer}>
          The Hitting Skool | Team Platform
        </Text>
      </Container>
    </Body>
  </Html>
)

export default HybridToTeamStep1

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
