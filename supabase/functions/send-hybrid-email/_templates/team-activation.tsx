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

interface TeamActivationProps {
  firstName: string;
  orgName: string;
  planName: string;
  joinUrl: string;
  expiresDate: string;
  supportEmail: string;
}

export const TeamActivation = ({ 
  firstName, 
  orgName,
  planName,
  joinUrl, 
  expiresDate,
  supportEmail 
}: TeamActivationProps) => (
  <Html>
    <Head />
    <Preview>Your Team Is In — Welcome to The Hitting Skool</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>🎯 Your Team Is Activated</Heading>
        
        <Text style={text}>
          Hey {firstName},
        </Text>
        
        <Text style={text}>
          Congrats — your {planName} is live! Your team of up to 10 players now has full access to:
        </Text>
        
        <Text style={text}>
          ⚾ The Hitting Skool Community<br />
          ⚾ 4B Biomechanics Training System<br />
          ⚾ Player Progress Tracking<br />
          ⚾ Weekly Team Performance Reports
        </Text>
        
        <Heading style={h2}>📋 Next Steps:</Heading>
        
        <Text style={text}>
          <strong>1. Share Your Team Join Link</strong><br />
          Send this link to your players:
        </Text>
        
        <Link href={joinUrl} style={button}>
          {joinUrl}
        </Link>
        
        <Text style={text}>
          <strong>2. Access Your Coach Dashboard</strong><br />
          Track all your players' progress and uploads in one place.
        </Text>
        
        <Text style={text}>
          <strong>3. Players Can Upgrade Anytime</strong><br />
          Team access includes community. Players can upgrade to 1-on-1 coaching whenever they're ready.
        </Text>
        
        <Text style={text}>
          Your team access expires on <strong>{expiresDate}</strong>. We'll send a reminder before then.
        </Text>
        
        <Text style={signature}>
          Let's build something special,<br />
          — Coach Rick<br />
          The Hitting Skool
        </Text>
        
        <Text style={footer}>
          Questions? Reply to this email or contact us at {supportEmail}
        </Text>
      </Container>
    </Body>
  </Html>
)

export default TeamActivation

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
  fontSize: '14px',
  fontWeight: 'bold',
  padding: '12px 24px',
  textDecoration: 'none',
  textAlign: 'center' as const,
  margin: '20px 0',
  wordBreak: 'break-all' as const,
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
