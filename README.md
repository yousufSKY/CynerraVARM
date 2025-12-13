# CYNERRA - Vulnerability Assessment & Risk Management Platform

## 📋 Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [Technology Stack](#technology-stack)
- [Project Architecture](#project-architecture)
- [Core Features](#core-features)
  - [Authentication System](#authentication-system)
  - [Dashboard](#dashboard)
  - [Scanning System](#scanning-system)
  - [AI Integration](#ai-integration)
  - [Reports System](#reports-system)
  - [AI Chatbot Assistant](#ai-chatbot-assistant)
  - [Risk Assessment](#risk-assessment)
  - [Asset Management](#asset-management)
- [Installation & Setup](#installation--setup)
- [Configuration](#configuration)
- [Development Guide](#development-guide)
- [API Integration](#api-integration)
- [Troubleshooting](#troubleshooting)
- [Known Issues](#known-issues)
- [Future Enhancements](#future-enhancements)

---

## Overview

**CYNERRA** is a next-generation, AI-powered vulnerability assessment and risk management platform designed to help security professionals and organizations identify, analyze, and remediate security vulnerabilities across their infrastructure.

The platform combines traditional security scanning tools (Nmap, OWASP ZAP, Nikto, SQLMap) with cutting-edge AI technology (powered by OpenAI's GPT-4o) to provide intelligent, context-aware security analysis and recommendations.

### Purpose

CYNERRA bridges the gap between raw security scan data and actionable intelligence by:
- Automating vulnerability detection across network and web assets
- Providing AI-powered analysis and prioritization of findings
- Offering personalized remediation guidance
- Maintaining comprehensive security posture tracking
- Delivering professional security reports

### Target Users

- Security Analysts & Penetration Testers
- DevSecOps Teams
- IT Security Managers
- Compliance Officers
- Small to Enterprise Organizations

---

## Key Features

### 🔐 Security Scanning
- **Network Scanning**: Comprehensive port scanning, service detection, and OS fingerprinting using Nmap
- **Web Application Scanning**: Automated vulnerability detection for web applications using OWASP ZAP
- **Web Server Scanning**: Server configuration and vulnerability analysis using Nikto
- **SQL Injection Testing**: Database security testing using SQLMap
- **AI-Enhanced Network Scans**: Real Nmap scans combined with AI vulnerability analysis
- **Multiple Scan Profiles**: Quick, Full, Service Detection, Vulnerability, UDP, and AI-enhanced variants

### 🤖 AI-Powered Analysis
- **Intelligent Vulnerability Analysis**: AI interprets scan results and identifies potential security issues
- **CVE Identification**: Automatic mapping of findings to known CVE vulnerabilities
- **Risk Scoring**: AI-enhanced risk assessment combining tool outputs with contextual analysis
- **Remediation Guidance**: Step-by-step fixing instructions tailored to specific vulnerabilities
- **Context-Aware Chatbot**: AI assistant with full access to your scan history and security posture

### 📊 Reporting & Analytics
- **Comprehensive Reports**: Professional PDF reports with executive summaries and technical details
- **Multiple Report Templates**: Modern, Executive, Minimal, Classic, and Technical templates
- **Vulnerability Breakdown**: Critical, High, Medium, Low severity categorization
- **Trend Analysis**: Security posture tracking over time
- **Custom Report Generation**: Template selection with preview functionality
- **Export Options**: PDF format with customizable branding

### 💬 AI Chatbot Assistant
- **Conversational AI**: Natural language interface for security questions
- **Context Awareness**: Full access to your scan data, vulnerabilities, and assets
- **Chat History**: Persistent conversation history with easy navigation
- **Security Expertise**: Trained on security concepts, CVEs, and best practices
- **Personalized Recommendations**: Advice based on your actual security findings

### 📈 Risk Management
- **Real-time Risk Scoring**: Dynamic risk assessment based on scan results
- **Risk Level Indicators**: Minimal, Low, Medium, High, Critical classifications
- **Vulnerability Prioritization**: AI-powered ranking of security issues
- **Compliance Tracking**: Security posture monitoring and compliance status
- **Trend Visualization**: Risk score evolution over time

### 🗂️ Asset Management
- **Asset Registry**: Centralized management of scanned assets
- **Asset Types**: IP addresses, domains, web applications, and APIs
- **Asset Grouping**: Organization by type, location, or custom tags
- **Scan History**: Complete scan history per asset
- **Risk Per Asset**: Individual risk scores and vulnerability counts

---

## Technology Stack

### Frontend Framework
- **Next.js 15.5.7**: React framework with App Router, Server Components, and API routes
- **React 18**: UI library with hooks and modern patterns
- **TypeScript**: Static type checking for enhanced code quality and IDE support

### Styling & UI
- **Tailwind CSS**: Utility-first CSS framework for rapid UI development
- **Shadcn UI**: High-quality, accessible component library
- **Lucide React**: Beautiful, consistent icon set
- **Custom Gradients**: Cyan-to-blue theme throughout the application

### Authentication
- **Clerk**: Complete authentication solution with:
  - Email/password authentication
  - Social login support
  - User management
  - Session handling
  - Protected routes

### Data Management
- **Local Storage**: Client-side persistence for:
  - Conversation history (chatbot)
  - Cached scan data
  - User preferences
  - Session state
- **React Context**: State management for global data
- **React Hooks**: Custom hooks for API interactions and state

### PDF Generation
- **jsPDF**: Client-side PDF document generation
- **jsPDF-AutoTable**: Table generation for structured data in PDFs

### Backend Integration
- **Fetch API**: RESTful API communication with the backend
- **Custom API Client**: Centralized API interaction layer with error handling

---

## Project Architecture

### Application Structure

The project follows Next.js App Router conventions with a modular, component-based architecture:

**Root Structure:**
- `/app`: Next.js app directory (pages, layouts, API routes)
- `/components`: Reusable React components
- `/hooks`: Custom React hooks for business logic
- `/lib`: Utility functions and helpers
- `/types`: TypeScript type definitions
- `/public`: Static assets (images, fonts)

### Routing Architecture

**Public Routes:**
- `/`: Landing page
- `/sign-in`: Authentication page
- `/sign-up`: Registration page

**Protected Routes (require authentication):**
- `/dashboard`: Main dashboard with overview statistics
- `/dashboard/scanning`: Scan creation and management
- `/dashboard/reports`: Scan reports and analytics
- `/dashboard/risk`: Risk assessment and trends
- `/dashboard/assets`: Asset management
- `/dashboard/chatbot`: AI assistant interface
- `/dashboard/profile`: User profile settings
- `/dashboard/settings`: Application settings

### Component Architecture

**Layout Components:**
- `DashboardLayout`: Main application shell with sidebar navigation
- Header with user menu and chatbot quick-access
- Responsive sidebar with route navigation
- Real-time status indicators

**Page Components:**
- Self-contained page logic with data fetching
- Integration with custom hooks for data management
- Error boundaries for graceful error handling

**UI Components:**
- Atomic design pattern (atoms, molecules, organisms)
- Fully typed with TypeScript interfaces
- Accessible and keyboard-navigable
- Responsive across all screen sizes

### Data Flow

**Scan Workflow:**
1. User selects scan type and profile
2. Frontend sends request to backend API
3. Backend queues scan and returns scan ID
4. Frontend polls for scan status
5. Results retrieved and displayed when complete
6. Results cached in local storage
7. AI analysis triggered (if AI-enhanced scan)

**AI Chatbot Workflow:**
1. User sends message to chatbot
2. Backend fetches user's scan context from database
3. Context included in prompt to OpenAI GPT-4o
4. AI generates contextual response
5. Conversation saved to local storage
6. History accessible across sessions

---

## Core Features

### Authentication System

**Technology:** Clerk Authentication

**Features:**
- Secure email/password authentication
- Social login support (Google, GitHub)
- Automatic session management
- JWT-based token system
- Protected route middleware
- Automatic token refresh
- User profile management

**Security Measures:**
- HTTPS-only in production
- Secure cookie storage
- CSRF protection
- XSS prevention
- Session timeout handling

**User Flow:**
1. New users register via sign-up page
2. Email verification (optional)
3. Automatic redirect to dashboard after authentication
4. Session persists across page refreshes
5. Automatic logout on session expiration

---

### Dashboard

**Overview Statistics:**
- Total scans performed
- Active scan count
- Completed scan count
- Critical vulnerabilities found
- High vulnerabilities found
- Overall risk score
- Recent scan activity

**Quick Actions:**
- Start new scan (quick access)
- View latest scan results
- Access AI chatbot
- Generate reports

**Recent Activity:**
- Latest 5 scans with status
- Quick view of scan details
- Direct access to full results

**Visualizations:**
- Risk score gauge
- Vulnerability distribution chart
- Scan activity timeline
- Scanner usage statistics

---

### Scanning System

#### Network Scanning (Nmap)

**Standard Network Scans:**

1. **Quick Scan**
   - Fast port scan of common ports
   - Basic service detection
   - Duration: 30 seconds - 2 minutes
   - Best for: Initial reconnaissance

2. **Full Scan**
   - All 65,535 ports
   - Comprehensive service detection
   - OS fingerprinting
   - Duration: 5-15 minutes
   - Best for: Complete network assessment

3. **Service Detection**
   - Service version identification
   - Banner grabbing
   - Application fingerprinting
   - Duration: 2-5 minutes
   - Best for: Service inventory

4. **Vulnerability Scan**
   - NSE vulnerability scripts
   - Known exploit detection
   - Configuration issues
   - Duration: 5-10 minutes
   - Best for: Finding known vulnerabilities

5. **UDP Scan**
   - UDP port scanning
   - UDP service detection
   - Duration: 10-20 minutes
   - Best for: Complete network coverage

**AI-Enhanced Network Scans:**

All standard scans available with AI analysis:
- `quick-ai`, `full-ai`, `service-detect-ai`, `vulnerability-ai`, `udp-ai`
- Real Nmap scan + AI vulnerability analysis
- CVE identification and mapping
- Service-specific vulnerability detection
- Contextual risk assessment
- Detailed remediation steps

**Features:**
- Real-time scan progress tracking
- Scan queue management
- Scan history with full details
- Result caching for efficiency
- Export to multiple formats

#### Web Application Scanning

**OWASP ZAP Scans (AI-Powered):**

1. **ZAP Baseline**
   - Quick passive scan
   - Common web vulnerabilities
   - Duration: 50 seconds - 5 minutes
   - Best for: Quick security check

2. **ZAP Full**
   - Comprehensive active scan
   - Deep vulnerability detection
   - Duration: 3-10 minutes
   - Best for: Complete web app assessment

3. **ZAP API**
   - API-specific testing
   - RESTful endpoint scanning
   - Duration: 2-7 minutes
   - Best for: API security

**Nikto Scans (AI-Powered):**

1. **Nikto Basic**
   - Server configuration scan
   - Common misconfigurations
   - Duration: 1-3 minutes
   - Best for: Server hardening check

2. **Nikto Full**
   - Comprehensive server scan
   - Plugin-based detection
   - Duration: 3-8 minutes
   - Best for: Complete server assessment

3. **Nikto Fast**
   - Rapid security check
   - Critical issues only
   - Duration: 30-90 seconds
   - Best for: Quick validation

**SQLMap Scans (AI-Powered):**

1. **SQLMap Basic**
   - Basic injection testing
   - Common injection points
   - Duration: 2-5 minutes
   - Best for: Initial SQL injection check

2. **SQLMap Thorough**
   - Comprehensive injection testing
   - All injection techniques
   - Duration: 5-10 minutes
   - Best for: Complete database security

3. **SQLMap Aggressive**
   - Maximum detection capability
   - All payloads and techniques
   - Duration: 8-15 minutes
   - Best for: Deep penetration testing

**Web Scan Features:**
- Simulated scan results (powered by AI)
- Domain-based caching (same domain = cached result)
- AI analysis of all findings
- Vulnerability categorization
- Remediation recommendations
- OWASP Top 10 mapping

---

### AI Integration

**Core AI Capabilities:**

1. **Vulnerability Analysis**
   - Interprets raw scan output
   - Identifies security implications
   - Maps to CVE database
   - Assesses exploitability
   - Prioritizes by risk

2. **Risk Assessment**
   - Combines multiple scan results
   - Contextual risk scoring
   - Considers service versions, exposed ports, and configurations
   - Provides overall security posture evaluation

3. **Remediation Generation**
   - Vulnerability-specific fix steps
   - Configuration recommendations
   - Patch guidance
   - Best practice suggestions
   - Priority ordering

4. **Chatbot Assistance**
   - Natural language security queries
   - Access to user's scan database
   - Personalized security advice
   - CVE explanations
   - Compliance guidance

**AI Model:**
- **Model**: OpenAI GPT-4o
- **Context Window**: Large context for comprehensive analysis
- **Training**: Security-focused prompts and instructions
- **Accuracy**: High confidence with source citation

**AI-Enhanced Features:**

1. **Network Scan Analysis**
   - Service vulnerability mapping
   - Version-based CVE identification
   - Configuration risk assessment
   - Attack surface analysis

2. **Web Scan Analysis**
   - OWASP Top 10 categorization
   - Exploit scenario generation
   - Impact assessment
   - Remediation prioritization

3. **Contextual Chatbot**
   - Knows your scan history
   - Refers to specific findings
   - Understands your assets
   - Provides tailored advice

---

### Reports System

**Report Generation:**

**Available Report Types:**

1. **Individual Scan Reports**
   - Complete scan details
   - Vulnerability breakdown
   - Finding details with CVEs
   - Remediation recommendations
   - Technical details

2. **Executive Summary Reports**
   - High-level overview
   - Risk score summary
   - Critical findings
   - Vulnerability distribution
   - Key recommendations

**Report Templates:**

1. **Modern Cyan** (Default)
   - Clean, professional design
   - Cyan gradient theme
   - Perfect for presentations

2. **Executive Blue**
   - Corporate, formal style
   - Blue color scheme
   - Best for management reports

3. **Minimal Dark**
   - Sleek, modern appearance
   - Dark theme with accents
   - Great for technical audiences

4. **Classic Security**
   - Traditional report style
   - Red accents for severity
   - Timeless professional look

5. **Technical Purple**
   - Developer-focused design
   - Purple gradient theme
   - Detailed technical information

**Template Features:**
- Visual preview before selection
- Color palette display
- Feature checklist
- "Use This Template" selection
- Persistent template choice

**Report Content:**

**Header:**
- Company name (CYNERRA)
- Report title
- Generation timestamp
- Confidential badge
- Selected template badge

**Executive Summary:**
- Scan overview
- Risk score with gauge
- Key statistics
- Critical findings highlight

**Vulnerability Summary:**
- Count by severity (Critical/High/Medium/Low)
- Percentage distribution
- Risk level indicator

**Detailed Findings:**
- Finding ID and title
- Severity badge with color coding
- Confidence level
- Description
- Affected component
- Evidence
- CVE references (clickable links)
- Potential impact
- Solution steps

**AI Analysis (if applicable):**
- AI vulnerability findings
- Security recommendations
- Analysis methodology notes
- Combined risk assessment

**Recommendations Section:**
- Prioritized action items
- Step-by-step guidance
- Best practices
- Additional resources

**Footer:**
- Company website
- Copyright notice
- Page numbers
- Professional branding

**Report Features:**
- Professional PDF generation
- Multi-page support with auto-pagination
- Color-coded severity indicators
- Clickable CVE links
- Logo and branding
- Timestamp and metadata
- Secure and confidential marking

---

### AI Chatbot Assistant

**Overview:**

The AI Chatbot Assistant is a GPT-4o-powered conversational interface that provides intelligent, context-aware security assistance based on your actual scan data.

**Key Features:**

1. **Context Awareness**
   - Full access to user's scan database
   - Knows all vulnerabilities found
   - Understands asset inventory
   - Aware of scan history
   - Tracks risk trends

2. **Conversational Interface**
   - Natural language queries
   - Follow-up questions
   - Context retention
   - Multi-turn conversations

3. **ChatGPT-Style UI**
   - Collapsible sidebar with conversation history
   - Clean message bubbles (user right, AI left)
   - Typing indicators
   - Message timestamps
   - Suggested prompts
   - Welcome screen with quick actions

4. **Conversation Management**
   - New conversation button
   - Conversation history in sidebar
   - Click to load previous conversations
   - Delete conversations
   - Persistent storage (localStorage)
   - Auto-save on every message

5. **Intelligent Responses**
   - Specific to your findings
   - References actual CVEs from your scans
   - Mentions your IP addresses and services
   - Prioritizes based on your risk scores
   - Provides actionable next steps

**Use Cases:**

**Vulnerability Questions:**
- "What are my most critical vulnerabilities?"
- "Tell me about CVE-2023-12345"
- "How serious is the SSH vulnerability on 192.168.1.100?"

**Remediation Guidance:**
- "How do I fix the SQL injection issue?"
- "What's the best way to secure Apache 2.4.6?"
- "Give me step-by-step instructions for patching OpenSSH"

**Risk Assessment:**
- "What's my overall security posture?"
- "Am I getting more secure over time?"
- "Which assets are most at risk?"

**Security Education:**
- "Explain cross-site scripting"
- "What is the OWASP Top 10?"
- "How does a port scan work?"

**Compliance & Best Practices:**
- "Am I compliant with PCI DSS?"
- "What are the security best practices for web servers?"
- "How should I prioritize fixing these vulnerabilities?"

**Chatbot Architecture:**

**Frontend:**
- React-based chat interface
- Custom `useChatbot` hook for state management
- Message persistence in localStorage
- Real-time message updates

**Backend Communication:**
- Test endpoints: `/api/test/chatbot/message`, `/api/test/chatbot/history`
- No authentication required (test mode)
- JSON request/response format
- Conversation ID tracking

**Data Flow:**
1. User types message
2. Frontend sends to backend with conversation ID
3. Backend fetches user's scan context from database
4. Context included in GPT-4o prompt
5. AI generates response based on user's actual data
6. Response returned and displayed
7. Conversation saved locally

**Sidebar Features:**
- Shows all past conversations
- Click to load any conversation
- Current conversation highlighted
- Hover to reveal delete button
- Conversation metadata (title, date, message count)
- Empty state when no conversations exist
- Toggle button to show/hide sidebar

---

### Risk Assessment

**Risk Scoring System:**

**Risk Levels:**
- **MINIMAL** (0-20): Very low risk, few findings
- **LOW** (21-40): Low risk, minor issues
- **MEDIUM** (41-60): Moderate risk, attention needed
- **HIGH** (61-80): High risk, immediate action required
- **CRITICAL** (81-100): Critical risk, urgent remediation

**Risk Calculation:**

**Standard Scans:**
- Based on number and severity of findings
- Weighted by vulnerability criticality
- Considers open ports and services
- Factors in service versions

**AI-Enhanced Scans:**
- Combines Nmap risk + AI risk assessment
- Contextual risk evaluation
- Service-specific vulnerability impact
- Overall security posture analysis

**Risk Components:**

1. **Vulnerability Severity**
   - Critical vulnerabilities: High impact on risk score
   - High vulnerabilities: Significant impact
   - Medium vulnerabilities: Moderate impact
   - Low vulnerabilities: Minor impact
   - Info findings: Minimal impact

2. **Exposure Level**
   - Number of open ports
   - Services exposed to internet
   - Unnecessary services running

3. **Service Versions**
   - Outdated software versions
   - Known vulnerable versions
   - Missing security patches

4. **Configuration Issues**
   - Misconfigurations detected
   - Weak security settings
   - Default credentials

**Risk Visualization:**
- Color-coded risk badges
- Risk score gauges
- Trend charts over time
- Risk distribution by asset
- Comparison charts

---

### Asset Management

**Asset Types:**
- IP Addresses (192.168.1.100)
- Domain Names (example.com)
- Web Applications (https://app.example.com)
- APIs (https://api.example.com/v1)

**Asset Information:**
- Asset name/identifier
- Asset type
- Description
- Tags/labels
- Owner/team
- Location
- Last scan date
- Risk score
- Vulnerability count
- Open ports (for network assets)

**Asset Organization:**
- Group by type
- Filter by risk level
- Search by name or IP
- Sort by various fields
- Tag-based organization

**Asset Operations:**
- Add new asset
- Edit asset details
- Delete asset
- View scan history
- Initiate new scan
- View vulnerabilities
- Generate asset report

**Scan History Per Asset:**
- All scans for specific asset
- Chronological order
- Scan type and profile
- Scan date and time
- Scan status
- Quick access to results

---

## Installation & Setup

### Prerequisites

**Required:**
- Node.js version 18.x or later
- npm version 9.x or later (or yarn/pnpm)
- Modern web browser (Chrome, Firefox, Safari, Edge)
- Backend API running on http://localhost:8000

**Recommended:**
- Git for version control
- VS Code or similar IDE
- TypeScript knowledge
- React experience

### Step-by-Step Installation

**1. Clone the Repository:**
Download or clone the project from your version control system.

**2. Install Dependencies:**
Navigate to the project directory and install all required npm packages. This will download and configure all libraries and frameworks needed for the project.

**3. Environment Configuration:**
Create a `.env.local` file in the project root with the following variables:

**Required Variables:**
- Clerk publishable key (for authentication)
- Clerk secret key (for server-side auth)
- Backend API URL (defaults to http://localhost:8000)

**Optional Variables:**
- Custom API timeout settings
- Feature flags
- Environment identifier (development/staging/production)

**4. Start Development Server:**
Run the development server. The application will be available at http://localhost:3000 by default.

**5. Verify Backend Connection:**
Ensure the backend API is running and accessible. The frontend will attempt to connect to the configured API URL.

**6. Access the Application:**
Open your browser and navigate to http://localhost:3000. You should see the landing page.

**7. Create Account:**
Click "Sign Up" and create a new account using Clerk authentication.

**8. Start Using:**
Once authenticated, you'll be redirected to the dashboard where you can start creating scans.

### Build for Production

**Production Build:**
Create an optimized production build. This compiles and optimizes all code for deployment.

**Production Server:**
Serve the production build. The application will run in production mode with optimizations enabled.

**Build Output:**
The build process creates a `.next` folder containing:
- Optimized JavaScript bundles
- Pre-rendered static pages
- Server-side rendering code
- API routes
- Assets and images

### Deployment Options

**Vercel (Recommended):**
- Native Next.js support
- Automatic deployments from Git
- Edge network for fast performance
- Serverless functions
- Environment variable management

**Docker:**
- Containerized deployment
- Consistent environments
- Easy scaling
- Container orchestration support

**Traditional Hosting:**
- Node.js server required
- Reverse proxy (nginx/Apache)
- PM2 or similar for process management
- Manual scaling

---

## Configuration

### Environment Variables

**Authentication:**
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`: Clerk public key for client-side auth
- `CLERK_SECRET_KEY`: Clerk secret key for server-side operations

**API Configuration:**
- `NEXT_PUBLIC_API_URL`: Backend API base URL (default: http://localhost:8000)
- `NEXT_PUBLIC_API_TIMEOUT`: API request timeout in milliseconds

**Application Settings:**
- `NODE_ENV`: Environment (development/production)
- `NEXT_PUBLIC_APP_URL`: Frontend URL for redirects

### Clerk Configuration

**Required Setup:**
1. Create a Clerk account at https://clerk.com
2. Create a new application
3. Configure authentication methods (email, social logins)
4. Copy API keys to `.env.local`
5. Configure redirect URLs
6. Set up webhook endpoints (if needed)

**Authentication Methods:**
- Email/password
- Google OAuth
- GitHub OAuth
- Custom OAuth providers

**User Management:**
- User profiles
- Session management
- Security settings
- Multi-factor authentication

### API Client Configuration

**Base Settings:**
- Base URL for all API requests
- Request timeout duration
- Retry logic for failed requests
- Error handling strategy

**Endpoints:**
- Test endpoints: `/api/test/*` (no auth required)
- Production endpoints: `/api/*` (auth required)

**Authentication:**
- Currently using test endpoints (no auth)
- Production will require Firebase or Clerk tokens
- Token exchange service planned

---

## Development Guide

### Project Structure Explained

**`/app` Directory:**
- Main application code
- Page components
- Layout components
- API routes (if any)
- Route groups

**`/components` Directory:**
- Reusable React components
- UI components (buttons, cards, inputs)
- Layout components (header, sidebar)
- Feature components (scan forms, result tables)

**`/hooks` Directory:**
- Custom React hooks
- `use-chatbot.ts`: Chatbot state and API
- `use-scans.ts`: Scan management
- Reusable business logic

**`/lib` Directory:**
- Utility functions
- Helper functions
- `api-client.ts`: API communication layer
- `pdf-generator.ts`: Report generation
- `pdf-templates.ts`: Report templates

**`/types` Directory:**
- TypeScript type definitions
- API response interfaces
- Component prop types
- Enums and constants

**`/public` Directory:**
- Static assets
- Images, icons, fonts
- Favicon and manifest

### Code Style Guidelines

**TypeScript:**
- Use explicit types for function parameters
- Define interfaces for component props
- Avoid `any` type when possible
- Use enums for fixed sets of values

**React:**
- Functional components with hooks
- Props destructuring
- Meaningful component names
- One component per file (generally)

**Styling:**
- Tailwind CSS utility classes
- Consistent spacing (4-unit grid)
- Responsive design (mobile-first)
- Dark theme throughout

**Naming Conventions:**
- Components: PascalCase (e.g., `ScanCard`)
- Functions: camelCase (e.g., `handleScanSubmit`)
- Constants: SCREAMING_SNAKE_CASE (e.g., `API_BASE_URL`)
- Files: kebab-case (e.g., `scan-details.tsx`)

### Adding New Features

**1. Create Types:**
Define TypeScript interfaces in `/types/api.ts` or create new type file.

**2. Create Hook (if needed):**
Add custom hook in `/hooks` for business logic and API calls.

**3. Create Components:**
Build UI components in `/components`, starting with smallest units.

**4. Create Page:**
Add page component in `/app/dashboard/[feature]` directory.

**5. Add Navigation:**
Update sidebar navigation in `DashboardLayout.tsx`.

**6. Test Integration:**
Test the feature with backend API and verify error handling.

**7. Update Documentation:**
Document the feature in this README.

### Testing Approach

**Manual Testing:**
- Test all user flows
- Verify API integration
- Check error handling
- Test on multiple browsers
- Verify responsive design

**Browser DevTools:**
- Console for errors
- Network tab for API calls
- Application tab for localStorage
- Performance profiling

**Error Handling:**
- All API calls wrapped in try-catch
- User-friendly error messages
- Graceful degradation
- Fallback UI states

---

## API Integration

### Backend Requirements

**Expected Backend:**
- RESTful API
- JSON request/response format
- CORS enabled for frontend domain
- WebSocket support (future)

**Authentication:**
- Test endpoints: No auth required
- Production endpoints: Firebase or Clerk tokens
- Token in Authorization header

### API Endpoints Used

**Scan Management:**
- `POST /api/test/scan/trigger`: Create new scan
- `GET /api/test/scan/{scan_id}`: Get scan status and results
- `GET /api/test/scan/{scan_id}/results`: Get detailed scan results
- `GET /api/scans`: List all scans (with filters)

**Chatbot:**
- `POST /api/test/chatbot/message`: Send message to AI
- `GET /api/test/chatbot/history`: Get conversation history
- `GET /api/test/chatbot/status`: Check chatbot availability

**Assets (planned):**
- `GET /api/assets`: List all assets
- `POST /api/assets`: Create new asset
- `GET /api/assets/{id}`: Get asset details
- `PUT /api/assets/{id}`: Update asset
- `DELETE /api/assets/{id}`: Delete asset

### Request/Response Format

**Scan Trigger Request:**
- `asset_id`: UUID or test ID
- `target`: IP address or domain
- `profile`: Scan profile enum value

**Scan Response:**
- `scan_id`: Unique scan identifier
- `status`: PENDING, IN_PROGRESS, COMPLETED, FAILED
- `progress`: Percentage (0-100)
- `summary`: Vulnerability counts, risk score
- `parsed_json`: Detailed results
- `created_at`: ISO timestamp
- `completed_at`: ISO timestamp (if done)

**Chatbot Request:**
- `message`: User's message text
- `conversation_id`: Conversation UUID (or null for new)
- `user_id`: User identifier

**Chatbot Response:**
- `response`: AI's response text
- `conversation_id`: Conversation UUID
- `timestamp`: ISO timestamp
- `metadata`: Model, tokens used, etc.

### Error Handling

**API Errors:**
- 400: Bad Request - Invalid input
- 401: Unauthorized - Authentication failed
- 404: Not Found - Resource doesn't exist
- 500: Internal Server Error - Backend issue
- 503: Service Unavailable - Service temporarily down

**Frontend Handling:**
- Display user-friendly error messages
- Retry failed requests (with exponential backoff)
- Fallback to cached data when possible
- Graceful degradation of features

---

## Troubleshooting

### Common Issues

**Issue: "Cannot connect to backend API"**
- **Solution**: Verify backend is running on http://localhost:8000
- Check CORS settings on backend
- Verify firewall/antivirus not blocking connection

**Issue: "Clerk authentication not working"**
- **Solution**: Verify Clerk API keys in `.env.local`
- Check Clerk dashboard for application status
- Clear browser cookies and try again

**Issue: "Scans not loading"**
- **Solution**: Check browser console for errors
- Verify backend API is responding
- Clear localStorage and refresh page

**Issue: "Chat history not loading"**
- **Solution**: Check localStorage for `chat_messages_*` keys
- Clear cache and restart dev server
- Verify `loadConversationFromStorage` function exists

**Issue: "PDF generation fails"**
- **Solution**: Check browser console for errors
- Verify jsPDF library is loaded
- Check for very large scan results (memory issue)

**Issue: "Build fails"**
- **Solution**: Delete `.next` and `node_modules/.cache` folders
- Run `npm install` again
- Check for TypeScript errors
- Verify all imports are correct

### Debug Mode

**Enable Verbose Logging:**
Add console.log statements in hooks and API client for debugging.

**Browser DevTools:**
- Console tab: JavaScript errors and logs
- Network tab: API requests and responses
- Application tab: localStorage, cookies, cache
- Performance tab: Rendering and memory issues

**Clear Caches:**
- Browser cache: Ctrl+Shift+Delete
- Next.js cache: Delete `.next` folder
- npm cache: Run `npm cache clean --force`

---

## Known Issues

### Current Limitations

**Authentication Mismatch:**
- Frontend uses Clerk authentication
- Backend expects Firebase tokens
- Currently using test endpoints (no auth)
- Production deployment requires token exchange service

**Scan Results Persistence:**
- Scan results stored in localStorage (client-side)
- Not synced across devices
- Limited by browser storage quota
- Plan: Move to backend database storage

**Chat History:**
- Conversations stored in localStorage
- Not accessible from other devices
- No cloud synchronization
- Plan: Backend conversation persistence

**Real-time Updates:**
- Scan progress requires manual refresh or polling
- No WebSocket integration yet
- Plan: Implement WebSocket for live updates

**Report Templates:**
- PDF generation is client-side only
- Large reports may cause browser memory issues
- No server-side PDF generation
- Plan: Backend PDF generation service

### Workarounds

**For Authentication:**
- Use test endpoints without authentication
- Development mode only
- Production requires auth implementation

**For Scan Storage:**
- Manual export/import of scan data
- Periodic backups recommended
- Clear old scans to free space

**For Chat History:**
- Export conversations before clearing browser data
- Use same browser/device for consistency

---

## Future Enhancements

### Planned Features

**Phase 1 (Q1 2025):**
- Production authentication implementation
- Backend scan results storage
- WebSocket for real-time updates
- Multi-user collaboration

**Phase 2 (Q2 2025):**
- Advanced filtering and search
- Custom scan profiles
- Scheduled scanning
- Email notifications

**Phase 3 (Q3 2025):**
- API management features
- Integration with SIEM systems
- Compliance report generation
- Mobile application

**Phase 4 (Q4 2025):**
- Machine learning for anomaly detection
- Automated remediation suggestions
- Red team/Blue team features
- Enterprise SSO integration

### Technology Upgrades

**Planned Upgrades:**
- React 19 when stable
- Next.js 16+ features
- Enhanced TypeScript support
- Performance optimizations

**New Integrations:**
- Additional security tools
- Third-party vulnerability databases
- Ticketing systems (Jira, ServiceNow)
- Slack/Teams notifications

---

## Project Status

**Current Version:** 2.0.0 (in development)

**Status:** Active Development

**Last Updated:** December 2024

**Maintainer:** Development Team

**License:** Proprietary

---

## Support & Contact

For issues, questions, or contributions, please contact the development team or open an issue in the project repository.

**Project Website:** https://cynerra.com (example)

**Documentation:** This README file

**API Documentation:** Provided by backend team

---

## Acknowledgments

**Technologies Used:**
- Next.js by Vercel
- React by Meta
- Tailwind CSS
- Shadcn UI
- Clerk Authentication
- OpenAI GPT-4o
- jsPDF

**Security Tools Integrated:**
- Nmap
- OWASP ZAP
- Nikto
- SQLMap

**Community:**
Special thanks to the open-source community and all contributors who make this project possible.

---

**End of README**

This README provides a comprehensive overview of the CYNERRA platform frontend. For specific code examples, API documentation, or contribution guidelines, please refer to the respective files in the repository or contact the development team.
