import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Text,
} from 'npm:@react-email/components@0.0.22';
import * as React from 'npm:react@18.3.1';

interface WinterToHybridProps {
  firstName: string;
  hybridOrderLink: string;
}

export const WinterToHybrid = ({
  firstName,
  hybridOrderLink,
}: WinterToHybridProps) => (
  <Html>
    <Head />
    <Preview>Keep momentum after winter (save your progress)</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>Hi {firstName},</Heading>
        
        <Text style={text}>
          <strong>Subject: Keep momentum after winter (save your progress)</strong>
        </Text>

        <Text style={text}>
          Stay year-round with Hybrid ($99/mo). Your drills keep adapting; your access doesn't lapse.
        </Text>

        <Text style={text}>
          <Link href={hybridOrderLink} style={buttonLink}>
            Activate Hybrid →
          </Link>
        </Text>

        <Text style={signature}>
          — Coach Rick
        </Text>
      </Container>
    </Body>
  </Html>
);

export default WinterToHybrid;

const main = {
  backgroundColor: '#ffffff',
  fontFamily:
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif",
};

const container = {
  margin: '0 auto',
  padding: '20px 0 48px',
  maxWidth: '580px',
};

const h1 = {
  color: '#333',
  fontSize: '24px',
  fontWeight: '600',
  lineHeight: '1.3',
  margin: '0 0 20px',
};

const text = {
  color: '#333',
  fontSize: '16px',
  lineHeight: '1.6',
  margin: '0 0 16px',
};

const buttonLink = {
  backgroundColor: '#2754C5',
  color: '#ffffff',
  padding: '12px 24px',
  borderRadius: '6px',
  textDecoration: 'none',
  fontWeight: '600',
  display: 'inline-block',
  marginTop: '8px',
};

const signature = {
  color: '#333',
  fontSize: '16px',
  lineHeight: '1.6',
  margin: '24px 0 0',
  fontWeight: '500',
};
