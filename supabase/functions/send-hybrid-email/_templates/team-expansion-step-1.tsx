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

interface TeamExpansionStep1Props {
  coachName: string;
  currentSeats: number;
  upgradeUrl: string;
}

export const TeamExpansionStep1 = ({ coachName, currentSeats, upgradeUrl }: TeamExpansionStep1Props) => (
  <Html>
    <Head />
    <Preview>You're Out of Seats — Let's Expand Your Roster</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>You're Out of Seats</Heading>
        
        <Text style={text}>
          Hey Coach {coachName},
        </Text>
        
        <Text style={text}>
          Looks like your team has hit capacity — you're maxed out at <strong>{currentSeats} players</strong>.
        </Text>
        
        <Text style={text}>
          To keep adding hitters and tracking progress without interruption, you'll need to upgrade your team plan.
        </Text>
        
        <Heading style={h2}>Here's what's available:</Heading>
        
        <Text style={text}>
          ⚾ 15 Players → $899/mo<br />
          ⚾ 25 Players → $1,299/mo
        </Text>
        
        <Text style={text}>
          Upgrading takes 60 seconds, and you won't lose a single player's data.
        </Text>
        
        <Link href={upgradeUrl} style={button}>
          Upgrade My Team Plan →
        </Link>
        
        <Text style={text}>
          Keep your roster growing — your AI system scales with you.
        </Text>
        
        <Text style={signature}>
          — Coach Rick<br />
          "The data doesn't stop when the seats run out."
        </Text>
        
        <Text style={footer}>
          The Hitting Skool | Team Platform
        </Text>
      </Container>
    </Body>
  </Html>
)

export default TeamExpansionStep1

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
