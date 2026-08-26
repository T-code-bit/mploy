#!/usr/bin/env node
/**
 * Deploy every checked-in Supabase Edge Function.
 *
 * Usage:
 *   SUPABASE_ACCESS_TOKEN=... node deploy-edge-functions.js
 *
 * The deployment token and all runtime secrets stay outside this repository.
 * Set SUPABASE_CLI to a Supabase CLI binary to bypass npx when needed.
 */
import { spawnSync } from "node:child_process";
import { readdirSync } from "node:fs";
import { join } from "node:path";

const projectRef = "nlfokrpapmzgazcwfgcp";
const functionsDirectory = join(process.cwd(), "supabase", "functions");

if (!process.env.SUPABASE_ACCESS_TOKEN) {
  console.error("SUPABASE_ACCESS_TOKEN is required.");
  process.exit(1);
}

const functionNames = readdirSync(functionsDirectory, { withFileTypes: true })
  .filter((entry) => entry.isDirectory() && !entry.name.startsWith("_"))
  .map((entry) => entry.name)
  .sort();

const cli = process.env.SUPABASE_CLI ?? "npx";
for (const functionName of functionNames) {
  console.log(`Deploying ${functionName}…`);
  const args = process.env.SUPABASE_CLI
    ? ["functions", "deploy", functionName, "--project-ref", projectRef, "--use-api"]
    : ["--yes", "supabase", "functions", "deploy", functionName, "--project-ref", projectRef, "--use-api"];
  const result = spawnSync(cli, args, { stdio: "inherit", env: process.env });
  if (result.status !== 0) process.exit(result.status ?? 1);
}

console.log(`Deployed ${functionNames.length} Supabase Edge Functions.`);