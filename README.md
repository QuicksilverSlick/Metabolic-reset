# 28 Day Reset (Metabolic Edition)

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/QuicksilverSlick/Metabolic-reset)

A comprehensive, science-backed metabolic health challenge platform designed specifically for the 50-70 age demographic. This application facilitates a 28-day "study" where users track daily habits and submit weekly biometric data to reverse metabolic age.

## Overview

The **28 Day Reset** is a full-stack web application built on the Cloudflare ecosystem. It distinguishes between "Challengers" (participants) and "Coaches" (team leaders), featuring a sophisticated genealogy system for referral tracking, dynamic point scoring, and strict timezone-aware daily resets.

The platform is engineered for high performance, accessibility, and scalability, leveraging Cloudflare Workers for serverless compute, D1 for relational data, and R2 for secure image storage.

## Key Features

- **Role-Based System**: Distinct workflows and pricing for Challengers ($28) and Coaches ($49).
- **Biometric Tracking**: Weekly submission of key health markers (Weight, Body Fat, Visceral Fat, Lean Mass, Metabolic Age) with smart scale screenshot validation.
- **Daily Habit Loops**: Interactive tracking for Water, Steps, Sleep, and Educational Lessons.
- **Genealogy & Referrals**: Advanced lineage tracking for team assignments and referral bonuses.
- **Timezone Awareness**: Daily resets occur strictly at midnight local time for every user globally.
- **Accessibility First**: High-contrast UI with large touch targets designed for the 50+ demographic.
- **Secure Storage**: Direct-to-R2 image uploads for sensitive biometric data.

## Technology Stack

### Frontend
- **Framework**: React 18 (Vite)
- **Styling**: Tailwind CSS, Shadcn UI
- **State Management**: Zustand
- **Data Fetching**: TanStack Query (React Query)
- **Forms**: React Hook Form + Zod
- **Animations**: Framer Motion

### Backend & Infrastructure
- **Runtime**: Cloudflare Workers
- **Framework**: Hono
- **Database**: Cloudflare D1 (SQLite)
- **Storage**: Cloudflare R2 (Object Storage)
- **State/Consistency**: Cloudflare Durable Objects
- **Language**: TypeScript

## Prerequisites

- **Bun**: This project uses [Bun](https://bun.sh) as the package manager and runtime.
- **Cloudflare Account**: Required for deploying Workers, D1, and R2.
- **Wrangler**: The Cloudflare CLI tool (installed automatically via dev dependencies).

## Getting Started

1. **Clone the repository**

2. **Install dependencies**
   ```bash
   bun install
   ```

3. **Start the development server**
   ```bash
   bun run dev
   ```
   This command starts the Vite frontend server and the Wrangler proxy for the backend worker simultaneously.

## Project Structure

- `src/`: Frontend React application
  - `components/`: Reusable UI components (Shadcn)
  - `pages/`: Application views (Dashboard, Registration, etc.)
  - `hooks/`: Custom React hooks
  - `lib/`: Utilities and API clients
- `worker/`: Cloudflare Worker backend
  - `index.ts`: Entry point and Hono app setup
  - `user-routes.ts`: API route definitions
  - `entities.ts`: Business logic and data models
  - `core-utils.ts`: **(Do Not Modify)** Core Durable Object utilities
- `shared/`: Shared TypeScript types between frontend and backend

## Development Guidelines

### Backend Development
- **Routes**: Add new API endpoints in `worker/user-routes.ts`.
- **Entities**: Define data models and business logic in `worker/entities.ts`.
- **State**: This project uses a `GlobalDurableObject` pattern. Do not modify `worker/core-utils.ts` or `wrangler.jsonc`.

### Frontend Development
- **Components**: Use the pre-installed Shadcn UI components in `src/components/ui`.
- **API Calls**: Use the `api` utility in `src/lib/api-client.ts` for type-safe communication with the worker.

## Deployment

This project is configured for seamless deployment to Cloudflare Workers.

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/QuicksilverSlick/Metabolic-reset)

### Manual Deployment

To deploy the application manually via the CLI:

1. **Build and Deploy**
   ```bash
   bun run deploy
   ```
   This command builds the frontend assets and deploys the Worker with the static assets.

2. **Database Setup**
   Ensure your D1 database and R2 buckets are created and bound correctly in the Cloudflare dashboard if not using the automatic setup.

## License

This project is proprietary software. All rights reserved.