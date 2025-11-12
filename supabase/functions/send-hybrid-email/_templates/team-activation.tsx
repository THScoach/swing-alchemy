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

interface TeamActivationProps {
  coachName: string;
  seats: number;
  teamRosterLink: string;
  teamUploadLink: string;
  teamDashboardLink: string;
  supportEmail: string;
}

export const TeamActivation = ({
  coachName,
  seats,
  teamRosterLink,
  teamUploadLink,
  teamDashboardLink,
  supportEmail,
}: TeamActivationProps) => (
  <Html>
    <Head />
    <Preview>Your Team plan is live — Get started now</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>Coach {coachName},</Heading>
        
        <Text style={text}>
          Your Team plan is live ({seats} seats).
        </Text>

        <Text style={text}>
          <strong>Do this now:</strong>
        </Text>

        <Text style={listItem}>
          1) Add roster (CSV or manual) →{' '}
          <Link href={teamRosterLink} style={link}>
            Team Roster
          </Link>
        </Text>
        <Text style={listItem}>
          2) Share player upload link →{' '}
          <Link href={teamUploadLink} style={link}>
            Upload Link
          </Link>
        </Text>
        <Text style={listItem}>
          3) See team dashboard →{' '}
          <Link href={teamDashboardLink} style={link}>
            Dashboard
          </Link>
        </Text>

        <Text style={text}>
          We'll auto-assign drills once first swings arrive.
        </Text>

        <Text style={signature}>
          — THS Support ({supportEmail})
        </Text>
      </Container>
    </Body>
  </Html>
);

export default TeamActivation;

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
