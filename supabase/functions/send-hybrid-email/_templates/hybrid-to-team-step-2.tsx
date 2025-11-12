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

interface HybridToTeamStep2Props {
  firstName: string;
  upgradeUrl: string;
}

export const HybridToTeamStep2 = ({ firstName, upgradeUrl }: HybridToTeamStep2Props) => (
  <Html>
    <Head />
    <Preview>You're Coaching a Team — Here's How to Save $297 This Year</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>Save $297 This Year</Heading>
        
        <Text style={text}>
          Hey {firstName},
        </Text>
        
        <Text style={text}>
          Right now, your hybrid plan is charging you per player upload — and it adds up fast.
        </Text>
        
        <Heading style={h2}>By switching to the Team Plan, you'll:</Heading>
        
        <Text style={text}>
          💰 Pay one flat rate (covers all 10+ players)<br />
          📊 Unlock team-level analytics + 4B averages<br />
          🧠 Save hours of admin work every week
        </Text>
        
        <Heading style={h2}>Example:</Heading>
        
        <Text style={text}>
          - 4 players on hybrid = $396/mo<br />
          - Team Plan (10 players) = $699/mo<br />
          <strong>That's more data, less work, lower cost.</strong>
        </Text>
        
        <Link href={upgradeUrl} style={button}>
          Upgrade My Plan →
        </Link>
        
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

export default HybridToTeamStep2

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
