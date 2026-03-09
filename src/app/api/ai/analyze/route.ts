import { NextResponse } from "next/server";

// PLACEHOLDER: Replace this with real AI model call
// Your friend can replace the mock logic below with their trained model API
export async function POST(request: Request) {
  try {
    const { text, projectName } = await request.json();

    if (!text || text.split(/\s+/).length < 200) {
      return NextResponse.json(
        { error: "Text must be at least 200 words" },
        { status: 400 }
      );
    }

    // Simulate AI processing delay
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Generate mock epics based on the input text
    const projectId = `proj-${Date.now()}`;
    const epics = generateMockEpics(text, projectName);

    return NextResponse.json({ projectId, epics });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Analysis failed" },
      { status: 500 }
    );
  }
}

function generateMockEpics(text: string, projectName: string) {
  // Extract some keywords from the text to make epics feel contextual
  const words = text.toLowerCase().split(/\s+/);
  const keywords = [...new Set(words.filter((w) => w.length > 5))].slice(0, 10);

  const epicTemplates = [
    {
      title: "User Authentication & Access Control",
      description: `As a system administrator, I want a secure authentication system for ${projectName}, so that only authorized users can access the platform and their data remains protected.`,
    },
    {
      title: "Core Feature Development",
      description: `As an end user, I want the core functionality of ${projectName} to be fully implemented, so that I can accomplish the primary tasks the system is designed for.`,
    },
    {
      title: "Data Management & Reporting",
      description: `As a product owner, I want comprehensive data management and reporting capabilities in ${projectName}, so that I can track metrics, generate reports, and make data-driven decisions.`,
    },
    {
      title: "User Interface & Experience",
      description: `As an end user, I want an intuitive and responsive user interface for ${projectName}, so that I can navigate the system efficiently and complete tasks with minimal friction.`,
    },
    {
      title: "Integration & API Layer",
      description: `As a developer, I want well-documented API endpoints and third-party integrations for ${projectName}, so that the system can communicate with external services and be extended easily.`,
    },
  ];

  // Return 3-5 epics
  const count = Math.min(3 + Math.floor(keywords.length / 3), 5);
  return epicTemplates.slice(0, count).map((template, index) => ({
    id: `epic-${Date.now()}-${index}`,
    title: template.title,
    description: template.description,
    status: "pending" as const,
    stories: [],
  }));
}
