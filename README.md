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


 Tech Stack Used

    AI & LLM:

        Google Gemini API (@google/genai TypeScript SDK)

        Models: gemini-2.5-flash

        Capabilities: Structured JSON schema output, system instructions, real-time multi-turn conversational chat sessions (ai.chats.create) with context and history preservation.

    Cloud & Infrastructure:

        Google Cloud Run: Serverless container execution with auto-scaling and HTTPS ingress.

        Google AI Studio: Cloud deployment pipeline and rapid prototyping.

        Google Cloud Secret Manager (@google-cloud/secret-manager): Production API key and credential resolution with zero client-side exposure.

    Authentication & Database:

        Firebase Authentication: Google Sign-In with OAuth token validation and session lifecycle management.

        Cloud Firestore: Real-time NoSQL cloud document database.

        Firestore Security Rules: Strict UID-scoped data isolation (/users/{userId}/moments/{momentId}).

    Frontend:

        React 19 & TypeScript: Component-based reactive UI architecture.

        Vite: High-performance module bundling and development server.

        Tailwind CSS 4: Responsive styling and botanical theme design system.

        Lucide React & Motion: Fluid micro-interactions and accessible icons.

    Backend:

        Node.js & Express: Secure server-side API proxying, serving client builds, and mediating Gemini / Secret Manager requests.

    Maps & Geospatial:

        Google Maps Platform (@vis.gl/react-google-maps): Maps JavaScript API with Advanced Markers and custom botanical pins.

        HTML5 Geolocation API: Coordinate tagging for family nature spots.

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

## 🗺️ Interactive Nature Memory Map

Sahajeevan brings family memories to life geographically through the **Nature Memory Map**.

Parents can switch seamlessly between the chronological **Timeline View** and the spatial **Interactive Map View**:

- 📍 **Geotagged Moments**: When saving a completed moment, parents can optionally attach their GPS location with one tap or specify a custom neighborhood green spot (e.g., *"Botanical Garden"*, *"Neighborhood Park"*, *"Balcony Plant Corner"*).
- 🌿 **Google Maps Platform Integration**: Built using `@vis.gl/react-google-maps` and the Google Maps JavaScript API with high-performance **Advanced Markers**.
- 🎨 **Botanical Custom Pins**: Map markers are color-coded and themed based on the environment (emerald green for outdoor nature expeditions, soft sage for indoor plant and nature crafts).
- 💬 **Interactive Memory Cards**: Clicking any map pin reveals an interactive overlay displaying the activity title, duration, child age, memorable quote or reflection, nature lesson takeaway, and attached photo.
- 🎯 **Privacy & User Isolation**: Coordinates and location details are saved strictly within the authenticated user's private path (`/users/{userId}/moments/{momentId}`). Other users cannot see or access your family's locations or pins.
- 🔑 **Cloud Secret Manager Security**: The Google Maps API key is securely managed through **Google Cloud Secret Manager** on Cloud Run, fetched in-memory on demand without client-side persistence, and restricted via HTTP referrers and API scopes.
- 🛡️ **Zero-Failure Error Handling & Explorer Fallback**: If a Google Cloud project has not yet activated billing or the Maps JavaScript API (reporting an `ApiProjectMapError`), the application gracefully transitions to the **Geotagged Nature Memories Explorer**, displaying all saved coordinates, reflections, and dates with direct one-click links to enable billing or API access in Google Cloud Console.

### Google Maps Platform Setup & Free Tier

Google Maps Platform provides a generous **$200 monthly free credit** (equivalent to up to **28,500 dynamic map loads every month for free**). To enable live map tiles on a Google Cloud project:
1. **Link Billing**: Google Cloud requires an active billing account linked to the project (e.g., `peta-idea-jlcf1`) at [Google Cloud Console Billing](https://console.cloud.google.com/billing) to activate the free tier quota.
2. **Enable Maps JavaScript API**: Enable the [Maps JavaScript API](https://console.cloud.google.com/apis/library/maps-backend.googleapis.com) in the Cloud Console.
3. **Key Restrictions**: Restrict the key to the *Maps JavaScript API* and add your app's Cloud Run domain (`https://*.run.app/*`) and local development URLs.

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

Sahajeevan features full **multi-turn conversational refinement** powered by Gemini, allowing parents to converse naturally with the AI to adapt, modify, and fine-tune their generated nature moment in real time.

Rather than one-shot generation, the conversation preserves the full dialogue history across turns, enabling iterative problem-solving tailored to real-life parenting realities.

### Technical Implementation

- **Server-Side Chat Sessions**: The server endpoint `POST /api/refine-moment` utilizes the `@google/genai` TypeScript SDK chat session interface:
  ```typescript
  const chat = ai.chats.create({
    model: "gemini-2.5-flash",
    config: { systemInstruction, temperature: 0.7 },
    history: formattedHistory // [{ role: "user" | "model", parts: [...] }]
  });
  const chatResponse = await chat.sendMessage({ message });
  ```
- **Context Preservation**: Every turn transmits the full conversation history alongside the current activity details, duration, child age, and location type.
- **Dynamic Activity Adaptation & One-Click Apply**: When a parent asks for changes (e.g., *"What if it starts raining?"* or *"Shorten to 5 minutes"*), Gemini returns both conversational encouragement and an updated JSON activity payload. The parent can simply click **"Apply to Card"** in the UI to replace the active activity steps on their screen in real time.
- **Multi-Turn Chat Component (`src/components/MomentRefinementChat.tsx`)**: Integrated directly beneath the active moment card, complete with message bubbles, timestamps, status indicators, and one-tap suggestion chips:
  - 🌧️ *Adapt for indoor / rainy weather*
  - ⚡ *Make it more active & energetic*
  - ⏳ *Shorten this to 5 minutes*
  - 👶 *Adapt for a younger toddler sibling*
  - 🎨 *What if we don't have paper or crayons?*

### Real-World Multi-Turn Test Example

```text
Turn 1:
Parent: "What if it starts raining?"
Gemini: "You can turn this into 'Rainy Tree Detective'! Put on rain boots, head outside for 3 minutes to touch wet bark, and notice the earthy petrichor scent."
[Gemini provides adapted steps with an "Apply to Card" action]

Turn 2:
Parent: "Could we shorten it to just 3 minutes because my toddler is getting sleepy?"
Gemini: "Understood! Since your toddler is winding down in the rain, here is a 3-minute sensory window observation..."
[Gemini seamlessly preserves the rainy context from Turn 1 while applying the toddler/sleepy adaptation from Turn 2]
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

### Maps & Geolocation

- Google Maps Platform (Maps JavaScript API)
- `@vis.gl/react-google-maps`
- Google Maps Advanced Markers & Custom Pin Styling
- Browser Geolocation API

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
| `src/components/MomentRefinementChat.tsx` | Multi-turn Gemini chat refinement component with real-time activity adaptation |
| `src/components/ActiveMomentCard.tsx` | Active nature moment interface with step-by-step progress & reflections |
| `src/components/MemoryMap.tsx` | Interactive Google Maps nature memory explorer with Advanced Markers & fallback |
| `src/components/MemoriesSection.tsx` | Timeline and map view switcher for saved family memories |
| `server.ts` | Server-side Express backend, multi-turn chat endpoint, and Gemini integration |
| `server/secrets.ts` | Google Cloud Secret Manager secure credential resolver |
| `firestore.rules` | Firestore security rules with UID-based isolation |
| `firebase-blueprint.json` | Firebase data/security model schema |
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
Complete activity (with optional GPS / neighborhood green spot)
      ↓
Save Family Memory
      ↓
View Family Memories (Timeline & Interactive Nature Map)
      ↓
Verify user isolation
```

---

# 🏆 Challenge Alignment & Submission Checklist

Sahajeevan was designed around the four core evaluation criteria and satisfies all technical submission requirements:

### ✅ Submission Verification Checklist

| Requirement | Implementation Detail | Status |
|---|---|:---:|
| **User authentication via Firebase** | Google Sign-In and email authentication with session state, clean sign-out, and reactive UI gating | ✅ Verified |
| **Multi-turn interaction with Gemini API** | Server-side `@google/genai` chat sessions (`POST /api/refine-moment`), conversational history preservation, and dynamic activity adaptations | ✅ Verified |
| **User-isolated Firestore document storage** | Private `/users/{userId}/moments/{momentId}` subcollection enforced via verified `firestore.rules` (`request.auth.uid == userId`) | ✅ Verified |
| **Secure API key retrieval via Secret Manager** | Production integration via Google Cloud Secret Manager (`server/secrets.ts`), runtime caching, zero client exposure | ✅ Verified |

---

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
