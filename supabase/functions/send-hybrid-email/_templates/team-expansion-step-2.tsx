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

interface TeamExpansionStep2Props {
  coachName: string;
  upgradeUrl: string;
}

export const TeamExpansionStep2 = ({ coachName, upgradeUrl }: TeamExpansionStep2Props) => (
  <Html>
    <Head />
    <Preview>Don't Lose Progress — Your Players Still Need You</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>Don't Lose Progress</Heading>
        
        <Text style={text}>
          Hey Coach {coachName},
        </Text>
        
        <Text style={text}>
          Your team has been crushing it — but your upload slots are full.
        </Text>
        
        <Text style={text}>
          If new players try to upload now, their data won't register.<br />
          That means your Team Report will stop updating for them.
        </Text>
        
        <Heading style={h2}>The fix is simple:</Heading>
        
        <Text style={text}>
          🔁 Upgrade to the next tier (adds instant seats)<br />
          ✅ Keeps all player data and reports intact<br />
          🧠 Expands your dashboard analytics automatically
        </Text>
        
        <Link href={upgradeUrl} style={button}>
          Upgrade My Team Plan Now →
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

export default TeamExpansionStep2

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
