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

interface InactiveEmailProps {
  firstName: string;
  analyzeUrl: string;
}

export const HybridEmail4Inactive = ({ firstName, analyzeUrl }: InactiveEmailProps) => (
  <Html>
    <Head />
    <Preview>Quick Nudge: Let's Get Your First Hybrid Results In</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>Quick Nudge: Let's Get Your First Hybrid Results In</Heading>
        
        <Text style={text}>
          Hey {firstName},
        </Text>
        
        <Text style={text}>
          You're in the Hybrid Program — but I haven't seen your first upload yet.
        </Text>
        
        <Text style={text}>
          To give you real feedback, I need at least 1–2 swings:<br />
          - Front/open-face view<br />
          - Clear contact<br />
          - Upload directly in your dashboard
        </Text>
        
        <Link href={analyzeUrl} style={button}>
          Upload Your First Swing →
        </Link>
        
        <Text style={text}>
          Once you do, you'll start seeing:<br />
          - Your 4B breakdown<br />
          - Tempo insights<br />
          - Smart drills tailored to your movement
        </Text>
        
        <Text style={text}>
          You're one upload away from clarity.
        </Text>
        
        <Text style={signature}>
          — Coach Rick
        </Text>
        
        <Text style={footer}>
          The Hitting Skool | Hybrid Coaching Program
        </Text>
      </Container>
    </Body>
  </Html>
)

export default HybridEmail4Inactive

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
