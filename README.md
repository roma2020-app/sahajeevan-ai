# 🌿 Sahajeevan

### AI-Powered Family & Nature Companion

> **Small Moments. Strong Families. A Greener Future.**

**🚀 Live Demo:** https://sahajeevan-61315710877.asia-southeast1.run.app

Sahajeevan is an AI-powered family and nature companion designed especially for busy working parents.

The idea is simple:

**A parent may not have an entire afternoon, but they may have 10–15 meaningful minutes with their child.**

Sahajeevan uses Gemini to transform that small amount of available time into a personalized family activity that encourages:

- 👩‍👧 Parent-child bonding
- 🌱 Connection with nature
- 🌍 Environmental awareness
- 💚 Meaningful family memories
- 🧠 Age-appropriate learning

---

## 🎯 Problem

Modern working parents often have very limited time with their children.

Even when families want to spend meaningful time together, deciding:

- What should we do?
- Is it suitable for my child's age?
- Do we need preparation?
- Can we do it in 10–15 minutes?
- Can we make it educational?
- Can we connect it with nature?

can become another task for already busy parents.

### Sahajeevan's approach

Instead of asking parents to plan another activity, Sahajeevan asks:

> **"How much time do you have with your child today?"**

Gemini then creates a personalized activity based on the family's available time and context.

---

# 🌱 Core Feature — Sahajeevan Moment

The main feature of Sahajeevan is the **Sahajeevan Moment**.

A parent provides:

- Available time — 10, 15 or 30 minutes
- Child's age
- Indoor or outdoor preference
- Optional interests/context

Gemini generates a personalized activity.

### Example

**Input**

```text
Available time: 15 minutes
Child age: 8
Setting: Outdoor
```

**AI-generated result**

```text
🌱 YOUR SAHAJEEVAN MOMENT

🌳 Tree Detective

15 minutes • Parent + Child

1. Find a tree near your home.
2. Look at three different leaves.
3. Look for one bird or insect.
4. Ask your child what they noticed.

🌍 Nature Lesson

Trees provide shelter and food for many living things.
```

The activity can then be completed and saved as a family memory.

---

# ❤️ Family Memories

Completed Sahajeevan Moments are saved as personal family memories.

Each authenticated user has their own private collection of memories.

Example:

```text
❤️ Family Memories

Morning Cloud Gazing
15 minutes
Outdoor
Child: 11 years

Completed: August 29, 2026
```

Users can browse and search their previous memories.

---

# 🔐 Security & Privacy

Security is a core part of Sahajeevan rather than an afterthought.

The application uses Firebase Authentication and Cloud Firestore with authenticated user boundaries.

## User data isolation

User data follows the structure:

```text
/users/{userId}/moments/{momentId}
```

Firestore security rules verify that the authenticated user's UID matches the requested user ID.

Conceptually:

```text
request.auth.uid == userId
```

This prevents one authenticated user from reading or modifying another user's family memories.

### Example

```text
User A
  │
  └── /users/A/moments/*
        ✓ Can access

User B
  │
  └── /users/B/moments/*
        ✓ Can access

User A
  │
  └── /users/B/moments/*
        ✗ Access denied
```

This was tested using separate user accounts to verify that one user's memories are not visible to another user.

---

# 🔑 Gemini API Key Security

The Gemini API key is not hardcoded into the client application.

Gemini requests are routed through the server-side application.

The server initializes Gemini using an environment variable:

```javascript
process.env.GEMINI_API_KEY
```

The API key is therefore not placed directly in browser/client code.

For production deployment, the Gemini credential should be provided through **Google Cloud Secret Manager** and exposed to the Cloud Run runtime as a secret.

### Never commit secrets

Do not commit:

```text
.env
.env.local
API keys
service-account private keys
Firebase private credentials
```

The repository should contain only configuration references, never secret values.

---

# 🤖 Gemini Integration

Sahajeevan uses Gemini for personalized family activity generation.

The frontend communicates with the application's server-side endpoint:

```text
POST /api/generate-moment
```

The server then communicates with Gemini.

Architecture:

```text
Parent
   │
   ▼
Sahajeevan UI
   │
   ▼
Server API
   │
   ▼
Gemini
   │
   ▼
Personalized Sahajeevan Moment
```

The application uses structured Gemini responses so that generated activities can be consistently displayed by the user interface.

The response structure includes concepts such as:

```text
title
steps
natureLesson
parentPrompt
```

---

# 🔄 Multi-Turn AI Interaction

Sahajeevan supports conversational AI interaction rather than treating every interaction as an isolated question.

The AI can use the user's context such as:

- Child age
- Available time
- Indoor/outdoor preference
- Family activity context
- Previous interaction context

This allows the parent to refine an activity through conversation.

For example:

```text
Parent:
"I have only 10 minutes."

Gemini:
"Here's a quick nature activity..."

Parent:
"My child doesn't want to go outside."

Gemini:
"Let's adapt it for indoors..."

Parent:
"She likes drawing."

Gemini:
"Try an indoor nature sketching activity..."
```

---

# 🔥 Family Progress

Sahajeevan provides a lightweight progress view showing family engagement.

Example:

```text
Family Moments       1
Nature Activities    1
Current Streak       1 day
```

The goal is not competitive gamification.

Instead, progress is designed to encourage families to maintain small, meaningful habits.

---

# 👩‍💻 Designed for Working Parents

Sahajeevan is intentionally designed around **limited time**.

Instead of asking:

> "What activity should I plan for my child this weekend?"

the experience starts with:

> **"How much time do you have today?"**

This makes the application practical for parents balancing:

- Work
- Family
- Household responsibilities
- Children's needs
- Personal time

---

# 🌍 Why Nature?

Children can learn environmental responsibility through small everyday experiences.

Sahajeevan encourages activities such as:

- 🌳 Observing trees
- 🐦 Watching birds
- 🦋 Observing insects and butterflies
- 💧 Learning about water conservation
- ♻️ Exploring recycling and reuse
- 🌱 Caring for plants
- ☁️ Observing clouds and weather
- 🍃 Discovering leaves and plants

The objective is not to lecture children about the environment.

It is to help families **experience nature together**.

---

# 🏆 Original Feature

## Sahajeevan Moment

The original feature of this project is the ability to transform a parent's limited available time into a personalized family-and-nature experience.

The AI considers:

```text
Available time
       +
Child age
       +
Indoor / Outdoor
       +
Optional interest
       ↓
     Gemini
       ↓
Personalized family activity
```

This goes beyond a basic Gemini journal or generic chatbot.

---

# 🏗️ Technology Stack

### Frontend

- React
- TypeScript
- Responsive web UI

### AI

- Google Gemini API
- Structured AI responses
- Multi-turn interaction

### Authentication

- Firebase Authentication
- Google Sign-In

### Database

- Cloud Firestore
- User-scoped document structure
- Firestore Security Rules

### Backend

- Node.js
- Express
- Server-side Gemini API integration

### Security

- Firebase Authentication
- Firestore Security Rules
- Server-side API credentials
- Secret Manager is the recommended production hardening path

### Deployment

- Google AI Studio
- Google Cloud Run
- Cloud Run auto-scaling (min instances 0, max instances 1 in the prototype)

---

# 🏛️ Architecture

```text
                         ┌──────────────────────┐
                         │       USER           │
                         │   Working Parent     │
                         └──────────┬───────────┘
                                    │
                                    ▼
                         ┌──────────────────────┐
                         │   Sahajeevan UI      │
                         │      React/TS        │
                         └──────────┬───────────┘
                                    │
                           Firebase Auth
                                    │
                                    ▼
                         ┌──────────────────────┐
                         │     Server API       │
                         │   Node.js / Express  │
                         └───────┬───────┬──────┘
                                 │       │
                         Gemini  │       │ Firestore
                                 │       │
                                 ▼       ▼
                       ┌────────────┐  ┌─────────────┐
                       │   Gemini   │  │  Firestore  │
                       │    AI      │  │ User Data   │
                       └────────────┘  └─────────────┘

                         Production deployment
                                  │
                                  ▼
                         ┌──────────────────┐
                         │    Cloud Run     │
                         └──────────────────┘
                                  │
                                  ▼
                         ┌──────────────────┐
                         │ Secret Manager  │
                         │ Gemini Secret   │
                         └──────────────────┘
```

---

# 🔒 Firestore Security Rules

Sahajeevan uses authenticated user boundaries.

The important data path is:

```text
/users/{userId}/moments/{momentId}
```

The security model follows:

```text
allow read, write:
if request.auth != null
&& request.auth.uid == userId;
```

This ensures that:

- Unauthenticated users cannot access private family data.
- Authenticated users can access only their own data.
- One user's memories cannot be accessed by another user.

The complete rules are available in:

```text
firestore.rules
```

---

# 🧪 Security Testing

The application was tested using separate authenticated user accounts.

### Test

```text
User 1
   ↓
Creates Family Memory
   ↓
Logout
   ↓
User 2
   ↓
Login
   ↓
User 2 Memories
```

### Expected result

User 2 cannot see User 1's Family Memories.

### Result

```text
User 1 data → User 1 only       ✓
User 2 data → User 2 only       ✓
Cross-user access               ✗ Denied
```

---

# 🛡️ Stability & Error Handling

The application is designed to handle common failure scenarios gracefully.

Examples include:

- Gemini API failures
- Network errors
- Firestore failures
- Authentication failures
- Empty user input
- Loading states

The UI should provide a meaningful error message rather than exposing internal errors or crashing the application.

---

# 🚀 Running Locally

## Prerequisites

Install:

- Node.js 18+
- npm
- A Firebase project
- Firebase Authentication enabled
- Cloud Firestore enabled
- Gemini API access

---

## 1. Clone the repository

```bash
git clone https://github.com/roma2020-app/sahajeevan-ai.git

cd sahajeevan-ai
```

---

## 2. Install dependencies

```bash
npm install
```

---

## 3. Configure environment variables

Create a local environment file according to the project's environment configuration.

Example:

```text
GEMINI_API_KEY=your_gemini_api_key
```

### Important

Never commit the actual API key.

Add local environment files to `.gitignore`.

---

## 4. Configure Firebase

Configure the Firebase project with:

- Firebase Authentication
- Google Sign-In
- Cloud Firestore

Use the Firebase configuration required by the application.

---

## 5. Configure Firestore

Deploy the Firestore security rules:

```bash
firebase deploy --only firestore:rules
```

Verify that the rules enforce authenticated UID-based access.

---

## 6. Run the application

```bash
npm run dev
```

Open the local URL shown by the development server.

---

# ☁️ Cloud Run Deployment

Sahajeevan is deployed as a web application on **Google Cloud Run**.

**Live URL:** https://sahajeevan-61315710877.asia-southeast1.run.app

The current challenge prototype uses the Google AI Studio / Cloud Run deployment flow. For a full production deployment, Secret Manager should be used for the Gemini credential.

A production deployment should use:

```text
GitHub
   ↓
Cloud Build / Docker
   ↓
Artifact Registry
   ↓
Cloud Run
```

For a full production deployment:

1. Create/select a Google Cloud project.
2. Enable Cloud Run.
3. Enable Artifact Registry.
4. Configure Secret Manager.
5. Store the Gemini API credential in Secret Manager.
6. Grant the Cloud Run runtime service account permission to access the secret.
7. Build the application container.
8. Deploy the container to Cloud Run.
9. Configure the required environment variables/secrets.
10. Verify Firebase Authentication and Firestore access.
11. Test user isolation after deployment.

The submitted prototype is already deployed and accessible at the live URL above.

### Example Cloud Run secret configuration

The Gemini credential should be injected as:

```text
GEMINI_API_KEY
```

and accessed by the server as:

```javascript
process.env.GEMINI_API_KEY
```

The actual secret value must never be committed to source control.

---

# 🔑 Secret Manager Production Pattern

Production architecture for credentials and API keys:

```text
                  Cloud Run (sahajeevan)
                     │
                     │ Secret Access (roles/secretmanager.secretAccessor)
                     ▼
              Secret Manager (peta-idea-jlcf1)
                     │
           ┌─────────┴──────────┐
           ▼                    ▼
     GEMINI_API_KEY     GOOGLE_MAPS_API_KEY
           │                    │
           ▼                    ▼
      Gemini API         Server Config Endpoint (/api/config/maps-key)
                                │ (no-store, in-memory)
                                ▼
                         Client MemoryMap Component
                         (Restricted by HTTP Referrer & Maps JS API only)
```

This keeps secrets outside the source repository, container image, and client-side persistence.

### Google Maps API Key Setup in Secret Manager

1. **Create restricted Maps API key** in Google Cloud Console (`peta-idea-jlcf1`):
   - **API Restrictions**: Restrict solely to **Maps JavaScript API**.
   - **Application Restrictions**: Set HTTP Referrers to your live Cloud Run domains:
     - `https://sahajeevan-61315710877.asia-southeast1.run.app/*`
     - `http://localhost:*` (for local development)

2. **Add key to Secret Manager**:
   ```bash
   echo -n "YOUR_RESTRICTED_MAPS_KEY" | gcloud secrets create GOOGLE_MAPS_API_KEY \
     --project=peta-idea-jlcf1 \
     --data-file=-
   ```

3. **Mount secret to Cloud Run service**:
   ```bash
   gcloud run services update sahajeevan \
     --project=peta-idea-jlcf1 \
     --region=asia-southeast1 \
     --set-secrets="GOOGLE_MAPS_API_KEY=GOOGLE_MAPS_API_KEY:latest"
   ```

4. **Security Verification**:
   - The key is resolved server-side by `server/secrets.ts`.
   - The key is served via `/api/config/maps-key` with `Cache-Control: no-store, private`.
   - Never saved to `localStorage`, `sessionStorage`, cookies, or Firestore.
   - Never printed in logs or exception messages.

---

# 📁 Important Project Files

| File / Folder | Purpose |
|---|---|
| `src/` | Frontend application |
| `server.ts` | Server-side API and Gemini integration |
| `firestore.rules` | Firestore security rules |
| `firebase-blueprint.json` | Firebase data/security model |
| `package.json` | Dependencies and scripts |
| `README.md` | Project documentation |

---

# 🌐 Demo

### Live Application

Sahajeevan is deployed on Google Cloud Run and is publicly accessible at:

**https://sahajeevan-61315710877.asia-southeast1.run.app**

```text
https://sahajeevan-61315710877.asia-southeast1.run.app
```

### Google AI Studio

The application was developed and prototyped using Google AI Studio.

### Demo / Showcase

LinkedIn demo video:

https://lnkd.in/p/dwFA7NZr

### GitHub

https://github.com/roma2020-app/sahajeevan-ai

---

# 🎥 Demonstration

The demo demonstrates the following flow:

```text
Google Sign-In
      ↓
Family Dashboard
      ↓
Select available time
      ↓
Enter child age
      ↓
Select indoor/outdoor
      ↓
Generate Sahajeevan Moment
      ↓
Gemini generates personalized activity
      ↓
Complete activity
      ↓
Save Family Memory
      ↓
View Family Memories
      ↓
Verify user isolation
```

---

# 🏆 Challenge Alignment

Sahajeevan was designed around the four evaluation pillars.

## Authenticity

Sahajeevan goes beyond a generic AI journal by focusing on:

- Working parents
- Parent-child bonding
- Nature activities
- Personalized micro-activities
- Family memories

The **Sahajeevan Moment** is the central original feature.

---

## Usability

The application provides a simple workflow:

```text
How much time do you have?
        ↓
How old is your child?
        ↓
Indoor or Outdoor?
        ↓
Create Moment
```

The goal is to minimize planning effort for busy parents.

---

## Stability

The application includes:

- Loading states
- Error handling
- Authentication handling
- Firestore persistence
- Structured Gemini responses
- Graceful failure handling

---

## Security

Security measures include:

- Firebase Authentication
- UID-based Firestore isolation
- Firestore Security Rules
- Server-side Gemini API calls
- No Gemini API key exposed in the client bundle
- Server-side Gemini API credential configuration
- Authenticated access to personal data

---

# 🌿 Product Philosophy

Sahajeevan is based on a simple belief:

> **Technology should not always give families more things to do. Sometimes it should help them make the few moments they already have more meaningful.**

A 15-minute conversation.

A walk around a tree.

Watching clouds together.

Finding a butterfly.

Watering a plant.

These small moments can create:

**stronger families + curious children + greater connection with nature.**

---

# 🔮 Future Enhancements

Potential future improvements include:

- 🌳 Community tree observations
- 🐦 Local biodiversity journal
- 🌱 Family nature challenges
- 🌍 Environmental habit tracking
- 📷 Nature observation with image understanding
- 🌦️ Weather-aware activity recommendations
- 🏆 Family nature milestones
- 👨‍👩‍👧 Multiple family profiles
- 📊 Long-term family nature insights
- 🌐 Community biodiversity contributions

These features are intentionally outside the initial MVP to keep the core experience simple and reliable.

---

# 👨‍💻 Built With

**Google AI Studio • Gemini • Firebase Authentication • Cloud Firestore • Node.js • React • TypeScript • Google Cloud**

---

# 📜 License

This project is created as a prototype for the AI application challenge and educational/demo purposes.

---

# #AccelerateAIwithCloudRun

Built with the vision of creating technology that brings:

**Families closer. Children closer to nature. And small moments closer to meaningful change.**

🌿 **Sahajeevan**

> **Small Moments. Strong Families. A Greener Future.**
