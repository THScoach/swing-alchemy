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

interface ReactivationStep2Props {
  firstName: string;
  analyzeUrl: string;
}

export const HybridReactivationStep2 = ({ firstName, analyzeUrl }: ReactivationStep2Props) => (
  <Html>
    <Head />
    <Preview>If You Miss a Week, You Miss Momentum</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>Accountability Nudge</Heading>
        
        <Text style={text}>
          Hey {firstName},
        </Text>
        
        <Text style={text}>
          One thing I've learned after 25+ years of coaching — it's not about working harder, it's about staying in rhythm.
        </Text>
        
        <Text style={text}>
          You signed up for Hybrid Coaching to build a repeatable swing.<br />
          But the only way the AI learns <strong>your</strong> movement patterns… is when it sees fresh swings.
        </Text>
        
        <Text style={text}>
          If you upload 1–2 this week, I'll personally review your next one and add a drill note.
        </Text>
        
        <Link href={analyzeUrl} style={button}>
          Upload Swing Now →
        </Link>
        
        <Text style={text}>
          Consistency beats intensity.<br />
          Stay in rhythm — that's where confidence lives.
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

export default HybridReactivationStep2

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
