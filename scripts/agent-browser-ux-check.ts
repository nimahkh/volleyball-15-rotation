import { execFile, spawn, type ExecFileOptions } from "node:child_process";
import { mkdir } from "node:fs/promises";

type JsonRecord = Record<string, unknown>;
type CourtBox = {
  left: number;
  top: number;
  width: number;
  height: number;
};

const port = process.env.PORT ?? "4177";
const host = "127.0.0.1";
const baseUrl = process.env.AGENT_BROWSER_BASE_URL ?? `http://${host}:${port}`;
const screenshotDir = "artifacts/agent-browser";

async function run(
  command: string,
  args: string[],
  options: ExecFileOptions = {},
) {
  return new Promise<string>((resolve, reject) => {
    execFile(
      command,
      args,
      {
        maxBuffer: 1024 * 1024 * 8,
        ...options,
      },
      (error, stdout, stderr) => {
        const stdoutText = stdout.toString();
        const stderrText = stderr.toString();

        if (stderrText.trim()) {
          process.stderr.write(stderrText);
        }

        if (error) {
          reject(error);
          return;
        }

        resolve(stdoutText.trim());
      },
    );
  });
}

async function agent(args: string[]) {
  const output = await run("npx", ["agent-browser", ...args]);
  if (output) {
    console.log(output);
    console.log("");
  }
  return output;
}

function parseJsonFromOutput<T extends JsonRecord>(output: string): T {
  const start = output.indexOf("{");
  const end = output.lastIndexOf("}");
  if (start === -1 || end === -1) {
    throw new Error(`No JSON object found in output: ${output}`);
  }

  return JSON.parse(output.slice(start, end + 1)) as T;
}

async function expectPage(description: string, script: string) {
  const result = parseJsonFromOutput<{ pass: boolean; details?: string }>(
    await agent([
      "eval",
      `(() => {
        ${script}
      })()`,
    ]),
  );

  if (!result.pass) {
    throw new Error(`${description} failed: ${result.details ?? "no details"}`);
  }

  console.log(`PASS: ${description}`);
  console.log("");
}

async function waitForServer(url: string, timeoutMs = 20_000) {
  const startedAt = Date.now();

  while (Date.now() - startedAt < timeoutMs) {
    try {
      const response = await fetch(url);
      if (response.ok) return;
    } catch {
      // Vite is still starting.
    }

    await new Promise((resolve) => setTimeout(resolve, 250));
  }

  throw new Error(`Timed out waiting for ${url}`);
}

async function drawTeamSideLine() {
  const getCourtBoxScript = `
    (() => {
      const court = document.querySelector('[aria-label="Coach strategy volleyball court"]');
      if (!court) throw new Error('Coach court not found');
      const rect = court.getBoundingClientRect();
      return {
        left: Math.round(rect.left),
        top: Math.round(rect.top),
        width: Math.round(rect.width),
        height: Math.round(rect.height),
      };
    })()
  `;

  const courtBox = parseJsonFromOutput<CourtBox>(
    await agent(["eval", getCourtBoxScript]),
  );
  const x1 = Math.round(courtBox.left + courtBox.width * 0.22);
  const y1 = Math.round(courtBox.top + courtBox.height * 0.72);
  const x2 = Math.round(courtBox.left + courtBox.width * 0.48);
  const y2 = Math.round(courtBox.top + courtBox.height * 0.8);
  const x3 = Math.round(courtBox.left + courtBox.width * 0.72);
  const y3 = Math.round(courtBox.top + courtBox.height * 0.86);

  await agent(["mouse", "move", String(x1), String(y1)]);
  await agent(["mouse", "down"]);
  await agent(["mouse", "move", String(x2), String(y2)]);
  await agent(["mouse", "move", String(x3), String(y3)]);
  await agent(["mouse", "up"]);
  await agent(["wait", "150"]);
}

async function main() {
  await mkdir(screenshotDir, { recursive: true });

  const server = process.env.AGENT_BROWSER_BASE_URL
    ? null
    : spawn("npm", ["run", "dev", "--", "--host", host, "--port", port], {
        stdio: "ignore",
      });

  try {
    await waitForServer(baseUrl);

    await agent(["set", "viewport", "390", "844"]);
    await agent(["open", baseUrl]);
    await agent([
      "eval",
      `localStorage.setItem('vr15_onboarding_chip_click_v1', 'seen'); location.reload();`,
    ]);
    await agent(["wait", "--text", "Open Coach Board"]);

    await expectPage(
      "main route renders primary entry points",
      `
        const text = document.body.innerText;
        const hasHeading = text.includes('Volleyball 5-1 Rotation Helper');
        const hasCoach = !!document.querySelector('[aria-label="Open Coach Board"]');
        const hasStart = [...document.querySelectorAll('button')].some((button) => button.textContent?.trim() === 'Start');
        return {
          pass: hasHeading && hasCoach && hasStart,
          details: JSON.stringify({ hasHeading, hasCoach, hasStart }),
        };
      `,
    );
    await agent(["screenshot", `${screenshotDir}/home-mobile.png`]);

    const initialTheme = parseJsonFromOutput<{ theme: string }>(
      await agent([
        "eval",
        `({ theme: document.documentElement.dataset.theme ?? 'unset' })`,
      ]),
    ).theme;
    await agent(["click", "[aria-label^='Switch to']"]);
    await expectPage(
      "theme toggle changes the active theme",
      `
        return {
          pass: document.documentElement.dataset.theme !== '${initialTheme}',
          details: JSON.stringify({
            before: '${initialTheme}',
            after: document.documentElement.dataset.theme,
          }),
        };
      `,
    );
    await agent(["click", "[aria-label^='Switch to']"]);

    await agent(["find", "role", "button", "click", "--name", "Start"]);
    await agent(["wait", "--text", "Receive"]);
    await expectPage(
      "lineup flow shows rotation controls and styled court",
      `
        const text = document.body.innerText;
        const court = document.querySelector('[aria-label="Rotation volleyball court"]');
        const hasTacticalCourtStyle = court?.className.includes('bg-[linear-gradient');
        return {
          pass: text.includes('Rotation 1') && text.includes('Play') && text.includes('Reset') && Boolean(court) && Boolean(hasTacticalCourtStyle),
          details: JSON.stringify({ hasCourt: Boolean(court), hasTacticalCourtStyle, text: text.slice(0, 160) }),
        };
      `,
    );
    await agent(["screenshot", `${screenshotDir}/rotation-court-mobile.png`]);

    await agent(["find", "role", "button", "click", "--name", "Next"]);
    await expectPage(
      "rotation next button advances rotation",
      `
        return {
          pass: document.body.innerText.includes('Rotation 2'),
          details: document.body.innerText,
        };
      `,
    );

    await agent([
      "find",
      "role",
      "button",
      "click",
      "--name",
      "Open Coach Board",
    ]);
    await agent(["wait", "--text", "Strategy court"]);
    await expectPage(
      "coach board renders mobile strategy court and tools",
      `
        const text = document.body.innerText;
        return {
          pass: text.includes('Strategy court') && text.includes('Draw Lines') && text.includes('Hide Opponent') && !!document.querySelector('[aria-label="Coach strategy volleyball court"]'),
          details: text,
        };
      `,
    );
    await agent(["screenshot", `${screenshotDir}/coach-board-mobile.png`]);

    await agent(["find", "role", "button", "click", "--name", "Draw Lines"]);
    await agent(["wait", "150"]);
    await drawTeamSideLine();
    await expectPage(
      "coach board draws a blue team-side line",
      `
        const line = document.querySelector('polyline');
        return {
          pass: document.querySelectorAll('polyline').length === 1 && line?.getAttribute('stroke') === '#2563eb',
          details: JSON.stringify({
            count: document.querySelectorAll('polyline').length,
            stroke: line?.getAttribute('stroke'),
            points: line?.getAttribute('points'),
          }),
        };
      `,
    );
    await agent(["screenshot", `${screenshotDir}/coach-board-drawing.png`]);
    await agent(["errors"]);
    await agent(["close"]);

    console.log("");
    console.log("Agent Browser UX check complete.");
    console.log(`Screenshots saved in ${screenshotDir}/`);
  } finally {
    await run("npx", ["agent-browser", "close"]).catch(() => "");
    if (server) {
      server.kill("SIGTERM");
    }
  }
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
