# AGENTS.md

## Overview

The repository contains a Weather CLI application built with Bun.js and the OpenMeteo API. It allows users to interact via a command-line interface to fetch and manage weather information for various cities.

## Key Commands

- **Initialize Project:**
  ```bash
  bun init
  ```

- **Type Checking:**
  ```bash
  bun check
  ```

## Stack

- **Runtime:** Bun.js
- **APIs:** OpenMeteo

## Project Structure and Configuration

- **Entry Point:** `src/index.ts` (as specified in `package.json`).
- **TypeScript Configuration:** 
  - `tsconfig.json` uses `ESNext` for `lib` and `target`.
  - Module resolution is in `bundler` mode.
  - Type definitions for Bun.js specified in `@types/bun`.

## Usage

### Features

- **Interactive Menu:**
  The CLI provides options to fetch weather data for a default city, all saved cities, add or remove cities, and configure preferences such as temperature units.

### HTTP Requests

- **Geocoding API Example:**
  ```
  https://geocoding-api.open-meteo.com/v1/search?name=Ottawa&count=1
  ```

- **Weather Data API Example:**
  ```
  https://api.open-meteo.com/v1/forecast?latitude=45.41117&longitude=-75.69812&current=temperature_2m
  ```

## Important Notes

- Ensure Bun.js environment is properly set up.
- Keep TypeScript version compatible with specified peer dependency (`typescript` version 7).
