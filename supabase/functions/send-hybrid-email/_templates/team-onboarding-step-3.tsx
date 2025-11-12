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

interface TeamOnboardingStep3Props {
  coachName: string;
  uploadUrl: string;
}

export const TeamOnboardingStep3 = ({ coachName, uploadUrl }: TeamOnboardingStep3Props) => (
  <Html>
    <Head />
    <Preview>Keep Your Players Uploading — AI Can't Coach What It Can't See</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>Keep Your Players Uploading</Heading>
        
        <Text style={text}>
          Hey Coach {coachName},
        </Text>
        
        <Text style={text}>
          Teams that upload at least once per week improve <strong>3–5x faster</strong> than those that don't.
        </Text>
        
        <Heading style={h2}>To help:</Heading>
        
        <Text style={text}>
          ✅ Each player can upload from their phone<br />
          ✅ All videos sync to your Team Dashboard automatically<br />
          ✅ You'll get weekly progress summaries — no manual work
        </Text>
        
        <Text style={text}>
          Here's your upload link again:
        </Text>
        
        <Link href={uploadUrl} style={button}>
          Upload Swings →
        </Link>
        
        <Text style={text}>
          Keep the reps coming — your players are building patterns the pros use.
        </Text>
        
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

export default TeamOnboardingStep3

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
