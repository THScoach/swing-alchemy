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

interface HybridEmail2Props {
  firstName: string;
  zoomLink: string;
  analyzeUrl: string;
}

export const HybridEmail2 = ({ firstName, zoomLink, analyzeUrl }: HybridEmail2Props) => (
  <Html>
    <Head />
    <Preview>Your First Live Call Is Coming — Here's How to Get Ready</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>Your First Live Call Is Coming</Heading>
        
        <Text style={text}>
          Hey {firstName},
        </Text>
        
        <Text style={text}>
          Our next <strong>Hybrid Live Call</strong> is coming up Monday at 7:00 PM CST.<br />
          We'll break down swings, talk tempo, and uncover what your body's really doing in motion.
        </Text>
        
        <Text style={text}>
          Here's how to prep:
        </Text>
        
        <Text style={text}>
          ✅ Upload 1–2 swings (preferably 240 fps).<br />
          ✅ Check your Smart Drill Engine — complete your starter drills.<br />
          ✅ Bring your questions — I'll answer them live.
        </Text>
        
        <div style={buttonContainer}>
          <Link href={zoomLink} style={button}>
            Join Live Call →
          </Link>
          <Link href={analyzeUrl} style={buttonSecondary}>
            Upload Swing for Review →
          </Link>
        </div>
        
        <Text style={text}>
          This is where we turn your data into development.
        </Text>
        
        <Text style={signature}>
          — Coach Rick<br />
          <em>"Every swing has a rhythm. We'll find yours."</em>
        </Text>
        
        <Text style={footer}>
          The Hitting Skool | Hybrid Coaching Program
        </Text>
      </Container>
    </Body>
  </Html>
)

export default HybridEmail2

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

const buttonContainer = {
  margin: '24px 0',
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
  margin: '8px 8px 8px 0',
}

const buttonSecondary = {
  backgroundColor: '#f4f4f4',
  borderRadius: '5px',
  border: '1px solid #ddd',
  color: '#333',
  display: 'inline-block',
  fontSize: '16px',
  fontWeight: 'bold',
  padding: '12px 24px',
  textDecoration: 'none',
  textAlign: 'center' as const,
  margin: '8px 0',
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
