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

interface WinterActivationProps {
  firstName: string;
  profileLink: string;
  uploadLink: string;
  scheduleLink: string;
}

export const WinterActivation = ({
  firstName,
  profileLink,
  uploadLink,
  scheduleLink,
}: WinterActivationProps) => (
  <Html>
    <Head />
    <Preview>Winter Program confirmed — Let's build this</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>Hi {firstName},</Heading>
        
        <Text style={text}>
          ❄️ <strong>Winter Program confirmed — $997 one-time.</strong>
        </Text>

        <Text style={text}>
          <strong>What's included:</strong>
        </Text>
        <Text style={listItem}>• Full winter access to THS Analyzer + evolving drill plan</Text>
        <Text style={listItem}>• Weekly live group session + office hours</Text>
        <Text style={listItem}>• Benchmarks: Tempo ratio, 4B scores, and model comparisons</Text>

        <Text style={{ ...text, marginTop: '24px' }}>
          <strong>Kickoff checklist (10 mins):</strong>
        </Text>
        <Text style={listItem}>
          1) Complete player bio (level, handedness, height/weight) →{' '}
          <Link href={profileLink} style={link}>
            Profile
          </Link>
        </Text>
        <Text style={listItem}>
          2) Upload 3–5 swings (≥120–240fps preferred) →{' '}
          <Link href={uploadLink} style={link}>
            Upload
          </Link>
        </Text>
        <Text style={listItem}>
          3) Pick your weekly session time →{' '}
          <Link href={scheduleLink} style={link}>
            Schedule
          </Link>
        </Text>

        <Text style={text}>
          We'll post your first winter report within 72 hours of uploads. If you want to keep access 
          year-round after winter, the $99/mo Hybrid is the move—we'll remind you later.
        </Text>

        <Text style={signature}>
          Let's build this.
          <br />
          — Coach Rick
        </Text>
      </Container>
    </Body>
  </Html>
);

export default WinterActivation;

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

const listItem = {
  color: '#333',
  fontSize: '16px',
  lineHeight: '1.6',
  margin: '0 0 8px',
  paddingLeft: '8px',
};

const link = {
  color: '#2754C5',
  textDecoration: 'underline',
};

const signature = {
  color: '#333',
  fontSize: '16px',
  lineHeight: '1.6',
  margin: '24px 0 0',
  fontWeight: '500',
};
