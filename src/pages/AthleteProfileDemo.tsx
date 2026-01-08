import { AthleteProfileCard } from "@/components/AthleteProfileCard";

const demoAthleteData = {
  playerId: "123",
  name: "John Doe",
  fourB: {
    catchBarrelScore: 62,
    brain: 58,
    body: 47,
    bat: 72,
    ball: 35
  },
  bodyDetails: {
    groundFlow: 52,
    coreFlow: 64
  },
  trainingPriorities: [
    { area: "Ground Flow", score: 52 },
    { area: "Ball Flight", score: 35 },
    { area: "Decision Speed", score: 58 }
  ]
};

export default function AthleteProfileDemo() {
  return (
    <div className="min-h-screen bg-background p-6 max-w-2xl mx-auto">
      <AthleteProfileCard data={demoAthleteData} />
    </div>
  );
}
