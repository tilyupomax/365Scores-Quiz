import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const questionSeeds = [
  {
    order: 1,
    text: 'Which country hosted the 2024 Summer Olympics?',
    options: [
      { text: 'France', isCorrect: true },
      { text: 'United States', isCorrect: false },
      { text: 'Japan', isCorrect: false },
      { text: 'Brazil', isCorrect: false },
    ],
  },
  {
    order: 2,
    text: 'How many minutes make up a standard half in association football?',
    options: [
      { text: '40 minutes', isCorrect: false },
      { text: '45 minutes', isCorrect: true },
      { text: '50 minutes', isCorrect: false },
      { text: '60 minutes', isCorrect: false },
    ],
  },
  {
    order: 3,
    text: 'Which club lifted the 2023-24 UEFA Champions League trophy?',
    options: [
      { text: 'Borussia Dortmund', isCorrect: false },
      { text: 'Manchester City', isCorrect: false },
      { text: 'Real Madrid', isCorrect: true },
      { text: 'Paris Saint-Germain', isCorrect: false },
    ],
  },
  {
    order: 4,
    text: 'Which franchise won the 2024 NBA Finals?',
    options: [
      { text: 'Denver Nuggets', isCorrect: false },
      { text: 'Boston Celtics', isCorrect: true },
      { text: 'Dallas Mavericks', isCorrect: false },
      { text: 'Golden State Warriors', isCorrect: false },
    ],
  },
  {
    order: 5,
    text: "Who holds the women's 100m world record as of 2025?",
    options: [
      { text: 'Shelly-Ann Fraser-Pryce', isCorrect: false },
      { text: 'Elaine Thompson-Herah', isCorrect: false },
      { text: 'Florence Griffith-Joyner', isCorrect: true },
      { text: 'Shericka Jackson', isCorrect: false },
    ],
  },
  {
    order: 6,
    text: "Which driver won the 2024 Formula 1 Drivers' Championship?",
    options: [
      { text: 'Lewis Hamilton', isCorrect: false },
      { text: 'Lando Norris', isCorrect: false },
      { text: 'Charles Leclerc', isCorrect: false },
      { text: 'Max Verstappen', isCorrect: true },
    ],
  },
  {
    order: 7,
    text: 'How many points is a try worth in rugby union?',
    options: [
      { text: '3 points', isCorrect: false },
      { text: '4 points', isCorrect: false },
      { text: '5 points', isCorrect: true },
      { text: '6 points', isCorrect: false },
    ],
  },
  {
    order: 8,
    text: 'Which Grand Slam tennis tournament is played on clay courts?',
    options: [
      { text: 'Australian Open', isCorrect: false },
      { text: 'Roland Garros', isCorrect: true },
      { text: 'Wimbledon', isCorrect: false },
      { text: 'US Open', isCorrect: false },
    ],
  },
  {
    order: 9,
    text: 'What is the regulation height of a basketball hoop?',
    options: [
      { text: '9 feet', isCorrect: false },
      { text: '9.5 feet', isCorrect: false },
      { text: '10 feet', isCorrect: true },
      { text: '10.5 feet', isCorrect: false },
    ],
  },
  {
    order: 10,
    text: 'How many defensive players take the field for a baseball team?',
    options: [
      { text: '7', isCorrect: false },
      { text: '8', isCorrect: false },
      { text: '9', isCorrect: true },
      { text: '10', isCorrect: false },
    ],
  },
];

async function main(): Promise<void> {
  await prisma.quizSession.updateMany({ data: { currentQuestionId: null } });

  await prisma.$transaction([
    prisma.response.deleteMany(),
    prisma.answerOption.deleteMany(),
    prisma.question.deleteMany(),
  ]);

  for (const { order, text, options } of questionSeeds) {
    await prisma.question.create({
      data: {
        order,
        text,
        answerOptions: {
          create: options,
        },
      },
    });
  }
}

main()
  .then(() => {
    console.log(`Seeded ${questionSeeds.length} questions`);
  })
  .catch((error) => {
    console.error('Failed to seed quiz questions', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
