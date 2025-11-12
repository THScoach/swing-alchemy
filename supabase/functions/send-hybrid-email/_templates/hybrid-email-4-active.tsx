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

interface ProgressData {
  firstName: string;
  uploadsCount: number;
  tempoLabel: string;
  overall: { latest: number; direction: string };
  brain: { latest: number; direction: string };
  body: { latest: number; direction: string };
  bat: { latest: number; direction: string };
  ball: { latest: number; direction: string };
  comPct?: number;
  headMovement?: number;
  sequence?: string;
  dashboardUrl: string;
}

export const HybridEmail4Active = ({ 
  firstName, 
  uploadsCount, 
  tempoLabel,
  overall,
  brain,
  body,
  bat,
  ball,
  comPct,
  headMovement,
  sequence,
  dashboardUrl
}: ProgressData) => (
  <Html>
    <Head />
    <Preview>Your First Week Results Are In ✅</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>Your First Week Results Are In ✅</Heading>
        
        <Text style={text}>
          Hey {firstName},
        </Text>
        
        <Text style={text}>
          Great work getting through your first week of Hybrid Training.
        </Text>
        
        <Text style={text}>
          Here's a quick snapshot of your progress:
        </Text>
        
        <div style={metricsBox}>
          <Text style={metricLine}>
            <strong>Swings analyzed this week:</strong> {uploadsCount}
          </Text>
          <Text style={metricLine}>
            <strong>Latest Tempo:</strong> {tempoLabel}
          </Text>
          
          <Text style={sectionHeader}>4B Snapshot:</Text>
          <Text style={metricLine}>• Overall: {overall.latest.toFixed(1)} ({overall.direction})</Text>
          <Text style={metricLine}>• Brain: {brain.latest.toFixed(1)} ({brain.direction})</Text>
          <Text style={metricLine}>• Body: {body.latest.toFixed(1)} ({body.direction})</Text>
          <Text style={metricLine}>• Bat: {bat.latest.toFixed(1)} ({bat.direction})</Text>
          <Text style={metricLine}>• Ball: {ball.latest.toFixed(1)} ({ball.direction})</Text>
          
          {(comPct || headMovement || sequence) && (
            <>
              <Text style={sectionHeader}>Movement Metrics:</Text>
              {comPct && <Text style={metricLine}>• COM%: {comPct.toFixed(1)}%</Text>}
              {headMovement && <Text style={metricLine}>• Head Movement: {headMovement.toFixed(1)}"</Text>}
              {sequence && <Text style={metricLine}>• Sequence: {sequence}</Text>}
            </>
          )}
        </div>
        
        <Text style={text}>
          <strong>What this means:</strong>
        </Text>
        
        <Text style={text}>
          I'm looking for:<br />
          - Are you uploading?<br />
          - Are your movement patterns getting cleaner?<br />
          - Are your drills matching how your body actually moves?
        </Text>
        
        <Text style={text}>
          If you stay consistent with:<br />
          - Weekly uploads<br />
          - Assigned drills<br />
          - Our Monday night Hybrid calls
        </Text>
        
        <Text style={text}>
          …this is where the swing starts to feel easier, not forced.
        </Text>
        
        <Link href={dashboardUrl} style={button}>
          View My Progress →
        </Link>
        
        <Text style={text}>
          Proud of the work you've put in already.
        </Text>
        
        <Text style={signature}>
          — Coach Rick<br />
          <em>"The feel makes the data make sense."</em>
        </Text>
        
        <Text style={footer}>
          The Hitting Skool | Hybrid Coaching Program
        </Text>
      </Container>
    </Body>
  </Html>
)

export default HybridEmail4Active

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

const metricsBox = {
  backgroundColor: '#f9f9f9',
  border: '1px solid #e0e0e0',
  borderRadius: '8px',
  padding: '20px',
  margin: '20px 0',
}

const sectionHeader = {
  color: '#1a1a1a',
  fontSize: '16px',
  fontWeight: 'bold',
  margin: '12px 0 8px 0',
  lineHeight: '1.4',
}

const metricLine = {
  color: '#333',
  fontSize: '15px',
  lineHeight: '24px',
  margin: '4px 0',
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
