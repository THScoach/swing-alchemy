import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Text,
} from 'https://esm.sh/@react-email/components@0.0.15'
import * as React from 'https://esm.sh/react@18.2.0'

interface HybridEmail3Props {
  firstName: string;
}

export const HybridEmail3 = ({ firstName }: HybridEmail3Props) => (
  <Html>
    <Head />
    <Preview>You're Part of the Elite Tier — Here's What Happens Next</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>You're Part of the Elite Tier</Heading>
        
        <Text style={text}>
          Hey {firstName},
        </Text>
        
        <Text style={text}>
          You're officially part of the <strong>Hybrid Elite Tier</strong> — that means you'll always get:
        </Text>
        
        <Text style={text}>
          🔥 Priority analysis feedback<br />
          🔥 Exclusive weekly Q&A calls<br />
          🔥 AI + Coach feedback on every upload<br />
          🔥 Early access to new drills and tools
        </Text>
        
        <Text style={text}>
          The best way to stay on track?
        </Text>
        
        <Text style={text}>
          ➡ Upload weekly.<br />
          ➡ Watch your reports.<br />
          ➡ Trust the rhythm.
        </Text>
        
        <Text style={text}>
          Every time you train, Coach Rick AI learns more about your sequence — and your drills evolve automatically.
        </Text>
        
        <Text style={text}>
          This is not a one-size-fits-all system.<br />
          This is precision training that grows with you.
        </Text>
        
        <Text style={text}>
          Let's make this your best swing season yet.
        </Text>
        
        <Text style={signature}>
          — Coach Rick<br />
          <em>"Smarter every swing."</em>
        </Text>
        
        <Text style={footer}>
          The Hitting Skool | Hybrid Coaching Program
        </Text>
      </Container>
    </Body>
  </Html>
)

export default HybridEmail3

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
