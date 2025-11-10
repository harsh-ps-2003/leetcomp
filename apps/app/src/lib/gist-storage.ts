// Simple storage using GitHub Gist
// Requires GITHUB_TOKEN and GIST_ID environment variables

const GIST_ID = process.env.GIST_ID;
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

export async function readFromGist(): Promise<any[]> {
  if (!GIST_ID || !GITHUB_TOKEN) {
    console.warn("GIST_ID or GITHUB_TOKEN not set, returning empty array");
    return [];
  }

  try {
    const response = await fetch(
      `https://api.github.com/gists/${GIST_ID}`,
      {
        headers: {
          Authorization: `token ${GITHUB_TOKEN}`,
          Accept: "application/vnd.github.v3+json",
        },
      },
    );

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status}`);
    }

    const gist = await response.json();
    const file = gist.files["parsed_comps.json"];

    if (!file) {
      return [];
    }

    return JSON.parse(file.content);
  } catch (error) {
    console.error("Error reading from Gist:", error);
    return [];
  }
}

export async function writeToGist(data: any[]): Promise<void> {
  if (!GIST_ID || !GITHUB_TOKEN) {
    throw new Error("GIST_ID and GITHUB_TOKEN must be set");
  }

  const response = await fetch(`https://api.github.com/gists/${GIST_ID}`, {
    method: "PATCH",
    headers: {
      Authorization: `token ${GITHUB_TOKEN}`,
      Accept: "application/vnd.github.v3+json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      files: {
        "parsed_comps.json": {
          content: JSON.stringify(data, null, 2),
        },
      },
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to write to Gist: ${response.status} - ${error}`);
  }
}

