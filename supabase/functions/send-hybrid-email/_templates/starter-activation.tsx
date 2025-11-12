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

interface StarterActivationProps {
  firstName: string;
  profileLink: string;
  uploadLink: string;
  dashboardLink: string;
  supportEmail: string;
}

export const StarterActivation = ({ 
  firstName, 
  profileLink, 
  uploadLink, 
  dashboardLink,
  supportEmail 
}: StarterActivationProps) => (
  <Html>
    <Head />
    <Preview>You're activated on THS Starter ($29/mo)</Preview>
    <Body style={main}>
      <Container style={container}>
        <Text style={text}>
          Hi {firstName},
        </Text>
        
        <Text style={text}>
          ✅ You're activated on THS Starter ($29/mo).
        </Text>
        
        <Heading style={h2}>What you get:</Heading>
        <Text style={text}>
          • Unlimited swing uploads (single angle)<br />
          • Tempo (Load:Fire) + 4B snapshot (Brain/Body/Bat/Ball)<br />
          • Coach Rick AI guidance + weekly Q&A call access (listen-in)
        </Text>
        
        <Heading style={h2}>Next 3 minutes:</Heading>
        <Text style={text}>
          1) Complete player profile → <Link href={profileLink} style={link}>Profile</Link><br />
          2) Upload an open-face swing (≥60fps) → <Link href={uploadLink} style={link}>Upload</Link><br />
          3) Get your report in-app → <Link href={dashboardLink} style={link}>Dashboard</Link>
        </Text>
        
        <Text style={text}>
          <strong>Pro tip:</strong> Keep the camera steady, chest-high, home plate in frame.
        </Text>
        
        <Text style={signature}>
          — The Hitting Skool
        </Text>
        
        <Text style={footer}>
          Support: <Link href={`mailto:${supportEmail}`} style={link}>{supportEmail}</Link>
        </Text>
      </Container>
    </Body>
  </Html>
)

export default StarterActivation

const main = {
  backgroundColor: '#ffffff',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", sans-serif',
}

const container = {
  margin: '0 auto',
  padding: '20px 0 48px',
  maxWidth: '600px',
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

const signature = {
  color: '#333',
  fontSize: '16px',
  lineHeight: '26px',
  margin: '24px 0',
}

const footer = {
  color: '#898989',
  fontSize: '12px',
  lineHeight: '22px',
  marginTop: '32px',
  textAlign: 'center' as const,
}
