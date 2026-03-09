import { NextResponse } from "next/server";

// PLACEHOLDER: Replace this with real AI model call
// Your friend can replace the mock logic below with their trained model API
export async function POST(request: Request) {
  try {
    const { epicId, epicTitle, epicDescription } = await request.json();

    if (!epicId || !epicTitle) {
      return NextResponse.json(
        { error: "Epic ID and title are required" },
        { status: 400 }
      );
    }

    // Simulate AI processing delay
    await new Promise((resolve) => setTimeout(resolve, 1500));

    const stories = generateMockStories(epicId, epicTitle, epicDescription);
    return NextResponse.json({ stories });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Story generation failed" },
      { status: 500 }
    );
  }
}

function generateMockStories(
  epicId: string,
  epicTitle: string,
  _epicDescription: string
) {
  const storyTemplates: Record<
    string,
    { title: string; description: string; ac: string }[]
  > = {
    "User Authentication & Access Control": [
      {
        title: "User Registration",
        description:
          "As a new user, I want to register an account with my email and password, so that I can access the system.",
        ac: "Given I am on the registration page, When I enter a valid email, password (min 8 chars), and click Register, Then my account is created and I receive a confirmation email.",
      },
      {
        title: "User Login",
        description:
          "As a registered user, I want to log in with my credentials, so that I can access my personalized dashboard.",
        ac: "Given I am on the login page, When I enter valid credentials and click Login, Then I am redirected to my dashboard. When I enter invalid credentials, Then I see an error message.",
      },
      {
        title: "Password Reset",
        description:
          "As a user who forgot my password, I want to reset it via email, so that I can regain access to my account.",
        ac: "Given I click 'Forgot Password', When I enter my registered email and submit, Then I receive a password reset link valid for 24 hours.",
      },
      {
        title: "Role-Based Access Control",
        description:
          "As an admin, I want to assign roles to users, so that I can control access to different features based on user permissions.",
        ac: "Given I am an admin on the user management page, When I assign a role to a user, Then their access permissions are updated immediately.",
      },
    ],
    "Core Feature Development": [
      {
        title: "Create New Item",
        description:
          "As a user, I want to create new items in the system, so that I can input and track my data.",
        ac: "Given I am on the main page, When I click 'Create New' and fill in the required fields, Then the item is saved and appears in my list.",
      },
      {
        title: "Search & Filter",
        description:
          "As a user, I want to search and filter items, so that I can quickly find what I need.",
        ac: "Given I am viewing a list of items, When I type in the search bar or apply filters, Then the list updates in real-time to show matching results.",
      },
      {
        title: "Edit & Update Items",
        description:
          "As a user, I want to edit existing items, so that I can keep my data accurate and up-to-date.",
        ac: "Given I am viewing an item, When I click Edit, modify fields, and save, Then the changes are persisted and reflected immediately.",
      },
    ],
    "Data Management & Reporting": [
      {
        title: "Dashboard Analytics",
        description:
          "As a manager, I want to see key metrics on a dashboard, so that I can monitor performance at a glance.",
        ac: "Given I navigate to the analytics dashboard, When the page loads, Then I see charts and KPIs reflecting the latest data.",
      },
      {
        title: "Export Reports",
        description:
          "As a stakeholder, I want to export reports in PDF and CSV formats, so that I can share them with others.",
        ac: "Given I am on the reports page, When I select a date range and click Export, Then a report file is downloaded in the chosen format.",
      },
      {
        title: "Data Import",
        description:
          "As an admin, I want to bulk import data from CSV files, so that I can migrate existing data efficiently.",
        ac: "Given I am on the import page, When I upload a valid CSV file, Then the data is validated, imported, and a summary of results is shown.",
      },
    ],
    "User Interface & Experience": [
      {
        title: "Responsive Design",
        description:
          "As a mobile user, I want the application to be fully responsive, so that I can use it on any device.",
        ac: "Given I access the application on a mobile device, When I navigate through pages, Then all content is properly formatted and interactive elements are usable.",
      },
      {
        title: "Dark Mode Support",
        description:
          "As a user, I want to toggle between light and dark mode, so that I can use the app comfortably in different lighting conditions.",
        ac: "Given I am logged in, When I toggle the theme switch, Then the entire UI switches between light and dark themes without page reload.",
      },
      {
        title: "Notification System",
        description:
          "As a user, I want to receive in-app notifications for important events, so that I stay informed without checking manually.",
        ac: "Given an important event occurs, When I am logged in, Then a notification badge appears and I can view details in the notification panel.",
      },
    ],
    "Integration & API Layer": [
      {
        title: "RESTful API Endpoints",
        description:
          "As a developer, I want RESTful API endpoints for all core operations, so that I can integrate with external systems.",
        ac: "Given I send a valid API request with authentication, When the server processes it, Then I receive a properly formatted JSON response with appropriate status codes.",
      },
      {
        title: "Webhook Notifications",
        description:
          "As a system integrator, I want to configure webhooks for key events, so that external systems are notified in real-time.",
        ac: "Given I have configured a webhook URL, When a specified event occurs, Then an HTTP POST is sent to the URL with event details within 5 seconds.",
      },
      {
        title: "Third-Party SSO Integration",
        description:
          "As an enterprise user, I want to sign in using my company SSO (Google/Microsoft), so that I don't need to manage another set of credentials.",
        ac: "Given I am on the login page, When I click 'Sign in with Google/Microsoft', Then I am authenticated via OAuth and redirected to my dashboard.",
      },
    ],
  };

  // Find matching stories or use default
  const stories = storyTemplates[epicTitle] || [
    {
      title: "Implement Core Logic",
      description: `As a developer, I want to implement the core logic for ${epicTitle}, so that the feature works as expected.`,
      ac: "Given the feature is implemented, When a user interacts with it, Then it behaves according to the specifications.",
    },
    {
      title: "Add User Interface",
      description: `As a user, I want a clean interface for ${epicTitle}, so that I can interact with the feature easily.`,
      ac: "Given I navigate to the feature page, When I see the interface, Then all elements are properly laid out and functional.",
    },
    {
      title: "Write Tests & Documentation",
      description: `As a developer, I want comprehensive tests and documentation for ${epicTitle}, so that the feature is maintainable.`,
      ac: "Given the feature is complete, When I run the test suite, Then all tests pass with >80% coverage.",
    },
  ];

  return stories.map((story, index) => ({
    id: `story-${Date.now()}-${index}`,
    epicId,
    title: story.title,
    description: story.description,
    acceptanceCriteria: story.ac,
    status: "pending" as const,
  }));
}
