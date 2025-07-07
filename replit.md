# Factory Inspection Management System

## Overview

This is a full-stack web application for managing factory inspections, built with React frontend and Express backend. The system allows inspectors to create, manage, and track factory inspections with support for Hebrew document processing, photo uploads, and PDF report generation.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **UI Library**: Shadcn/UI components built on Radix UI primitives
- **Styling**: Tailwind CSS with custom design system
- **State Management**: TanStack Query for server state management
- **Routing**: Wouter for lightweight client-side routing
- **Form Handling**: React Hook Form with Zod validation
- **Build Tool**: Vite for fast development and optimized builds

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript with ES modules
- **Database**: PostgreSQL with Drizzle ORM
- **Database Provider**: Neon Database (serverless PostgreSQL)
- **File Uploads**: Multer for handling photo uploads
- **API Design**: RESTful API with JSON responses

## Key Components

### Data Models
The system centers around an `inspections` table with comprehensive fields:
- Basic factory information (name, address, inspector)
- Contact person details
- Production background (products, employees, shifts)
- Document checklist (ingredient lists, blueprints, flowcharts)
- Factory categorization (treif, issur, g6, kosher)
- Jewish dietary law compliance flags (bishul yisrael, chalav yisrael, etc.)
- Photos and additional documentation

### Frontend Pages
1. **Dashboard**: Overview of inspection statistics and recent inspections
2. **Inspection Form**: Multi-step form for creating/editing inspections
3. **Reports**: Search and filter existing inspections with PDF export capabilities

### Backend Routes
- `GET /api/inspections` - List all inspections
- `GET /api/inspections/:id` - Get specific inspection
- `GET /api/inspections/search` - Search inspections
- `POST /api/inspections` - Create new inspection
- `PUT /api/inspections/:id` - Update inspection
- `DELETE /api/inspections/:id` - Delete inspection
- `POST /api/upload/photos` - Upload inspection photos

## Data Flow

1. **Inspection Creation**: Multi-step form captures all required data, validates using Zod schemas, and stores in PostgreSQL
2. **Photo Management**: Files uploaded via Multer, stored on server, paths saved to database
3. **Search & Filter**: Real-time search across factory names and inspectors with status/date filtering
4. **Report Generation**: PDF generation from inspection data matching Hebrew template format

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: Serverless PostgreSQL connection
- **drizzle-orm**: Type-safe database queries
- **@tanstack/react-query**: Server state management
- **@radix-ui/***: Accessible UI components
- **react-hook-form**: Form management
- **zod**: Schema validation
- **multer**: File upload handling

### Development Tools
- **Vite**: Build tool and dev server
- **TypeScript**: Type safety
- **Tailwind CSS**: Utility-first styling
- **ESLint/Prettier**: Code quality (implied)

## Deployment Strategy

The application is designed for deployment on Replit with:
- **Development**: `npm run dev` - runs Express server with Vite integration
- **Production Build**: `npm run build` - builds React app and bundles server
- **Production**: `npm start` - runs optimized Express server serving static files
- **Database**: Uses Neon Database with connection pooling for serverless environments

The build process:
1. Vite builds the React frontend to `dist/public`
2. ESBuild bundles the Express server to `dist/index.js`
3. Production server serves static files and API routes

## User Preferences

Preferred communication style: Simple, everyday language.

## Changelog

Changelog:
- July 07, 2025. Initial setup with in-memory storage
- July 07, 2025. Added PostgreSQL database integration with Drizzle ORM
  - Created database connection with Neon serverless PostgreSQL
  - Replaced MemStorage with DatabaseStorage for persistent data
  - Added comprehensive database queries for inspections CRUD operations
  - Implemented database schema push with document file support
- July 07, 2025. Enhanced date handling and PDF generation
  - Installed @hebcal/core for Hebrew date conversion
  - Switched Gregorian/Hebrew date field order with auto-population
  - Implemented comprehensive PDF generator matching English template format
  - Added jsPDF library for proper PDF generation with English layout
  - Added PDF viewer component for preview functionality
  - Removed Setup page as it's no longer needed
- July 07, 2025. Implemented factory management system
  - Created factories database table with comprehensive factory information
  - Added factory CRUD API endpoints and database storage operations
  - Built factory management page with search, create, edit, and delete functionality
  - Implemented factory selector component for inspection form auto-population
  - Added factory data pre-filling to inspection forms via URL parameters
  - Enhanced inspection workflow to include optional factory selection step