**SquidLLM Technical Description**  
---

Dhruv Gupta 							      	        		   

**Project Proposal**

We would like to develop infrastructure to assist with research into LLMs. We are working on jail-breaking LLMs and would like to be able to take a prompt and easily test it on 40 LLMs, get back the responses, and then run one quick round of evaluation on them. We want to also be able to annotate prompts, add notes to responses, and log all annotated prompts onto a database.

We would also like to build out a dashboard that makes it easy to search for prompts and responses, or also to search/see stats by LLM.

**Proposed Technical Stack**

* **HuggingFace Backend**: We will intend to build a Python backend deployed through a HuggingFace project  
* **Vercel:** The frontend will be deployed on Vercel  
* **Supabase:** An RDS built off of Supabase  
* **React:** The frontend will be all react. The app has been created using npx create-react-app to begin with.  
* **LLM APIs**   
  * OpenAI  

**Backend Setup**

We have begun by creating a new react project. In the root of that, we have created a huggingface space intialized as a blank Docker setup.

**RDS Model**  
   
Prompt Table: ID, Text, Note (Nullable)  
Response Table: ID, Prompt ID, LLM, Response, Jailbroken (Boolean), Note (Nullable)

**Backend Development Steps**

These steps are to be followed by Cursor Agent running Claude 4 Sonnet. Each step should only be completed one at a time, and after each step is completed, the readme file should be updated accordingly. Do NOT go ahead at all and do not set up extra steps in advance

1. ✅ Build out the basic communication with the database, and ways to insert elements into the database or read elements into the database  
   * **Completed**: Created `database.py` module with full CRUD operations for Prompts and Responses tables. Created Flask API (`app.py`) with REST endpoints for all database operations. Database tables are auto-created on connection. Dockerfile and requirements.txt set up for HuggingFace deployment.
2. ✅ Build out system to send a query to each of the API providers  
   * **Completed**: Created `llm_client.py` module with `LLMProviderManager` and `OpenAIClient` classes. Added Flask endpoints: `POST /api/llm/query` to send queries to LLM providers, `GET /api/llm/providers` to list available providers, and `GET /api/llm/providers/<provider>/models` to get available models. System is extensible for adding more providers. Added `openai` package to requirements.
3. ✅ Build out an asynch system to send out a lot of API responses at the same time and intelligently/concurrently get back their responses  
   * **Completed**: Added `query_batch()` method to `LLMProviderManager` that processes multiple queries sequentially. Created `POST /api/llm/query/batch` endpoint that accepts an array of queries (each with provider, model, prompt, and optional parameters) and returns all responses with status information (success/error) and summary statistics. Queries are processed one by one and results include error handling for individual failures.
4. ✅ Build out a way to test with a single LLM (4.1 nano) if a large batch of responses has been jailbroken or not (returning a JSON of yes or no)  
   * **Completed**: Created `jailbreak_evaluator.py` module with `JailbreakEvaluator` class that uses gpt-4o-mini (the "4.1 nano") as the evaluator LLM. Added `POST /api/evaluate/jailbreak` endpoint that accepts a batch of responses (each with prompt and response text) and returns JSON with yes/no (true/false) jailbreak status for each response. The evaluator uses a structured prompt to determine if responses indicate successful jailbreaks, and includes summary statistics (total, jailbroken count, evaluation success/failure rates).
5. ✅ Build out a way to accept and add a batch of responses to the database
   * **Completed**: Created `POST /api/prompts/batch` endpoint that accepts a prompt (with optional note) and a batch of responses (each with llm, response, jailbroken status, and optional note). The endpoint inserts the prompt first to get a prompt_id, then inserts all responses in a batch operation linked to that prompt. Returns confirmation with the created prompt and all response IDs. Uses the existing `insert_batch_responses()` method for efficient batch insertion.

**Frontend Development Steps**

1. ✅ Create a file directory with images, components, data and pages. Create a global API variable that is set and can be edited for where the server is hosted  
   * **Completed**: Created directory structure with `images/`, `components/`, `data/`, and `pages/` folders in `src/`. Created `src/data/apiConfig.js` with global API configuration. The base URL is set to `https://pennh4i-tentacool.hf.space` (derived from HuggingFace Space URL: https://huggingface.co/spaces/pennh4i/tentacool). The config file includes all API endpoints as helper functions and provides a `setBaseUrl()` method to easily change the server URL for development/testing.
2. ✅ In our data, define a json file which has the relevant models grouped by API Provider  
   * **Completed**: Created `src/data/modelsService.js` that dynamically fetches models from the API using the `/api/llm/providers/<provider>/models/fetch` endpoint instead of a static JSON file. The service provides functions to get models grouped by provider, get all models, and get models for a specific provider. All functions fetch data from the API in real-time.
3. ✅ Develop a header (3 tabs: home, analysis, top statistics)  
   * **Completed**: Created `src/components/Header.js` with a navigation header featuring 3 tabs: Home, Analysis, and Top Statistics. The header uses Notion-inspired styling with sky blue accent color, matte design, and smooth transitions. Created placeholder pages for each tab (`Home.js`, `Analysis.js`, `Statistics.js`). Updated `App.js` to integrate the header with tab switching functionality.
4. ✅ Develop the home tab which looks like a chat box landing page with a checkbox list of models we can use underneath to select which ones to run it on; default should be all selected  
   * **Completed**: Created comprehensive Home component (`src/pages/Home.js`) with View 1 featuring a chat box textarea for prompt input and a model selection section with checkboxes grouped by provider. All models are selected by default with a "Select All/Deselect All" toggle button. Models are fetched dynamically from the API and displayed in a grid layout. Styled with Notion-inspired design.
5. ✅ Develop the other views of the home tab   
   * **Completed**: Implemented all three views of the home tab:
   1. ✅ **First view**: Chat box with prompt input + model selection with checkboxes (all selected by default)
   2. ✅ **Second view**: Displays LLM responses as they are received. Users cannot interact with responses. Each response shows "Checking jailbroken" status with a spinning loading indicator while the jailbreak evaluation is in progress.
   3. ✅ **Third view**: After jailbreak evaluation completes, displays Yes/No toggles for each response (replacing "Checking jailbroken"). Shows the full LLM response text. Includes note input fields for both the prompt (at the top) and each individual response. Features a "Log to Database" button at the bottom that saves all data, shows a confirmation message, waits 2 seconds, then automatically refreshes back to the first view. All views use Notion-inspired styling with sky blue, moss green, and gray color scheme.  
6. ✅ Develop the analysis tab, which should let you query the database by any of the columns  
   * **Completed**: Created comprehensive Analysis page (`src/pages/Analysis.js`) with full database query functionality. Users can query either Prompts or Responses with filters for any column. For Prompts: search by text content or notes. For Responses: filter by Prompt ID, LLM name, and Jailbroken status (Yes/No/All). Results are displayed in a clean table format with proper formatting. Includes pagination support with limit/offset controls. Styled with Notion-inspired design.
7. ✅ Develop the statistics tab, which should display some of the key insights (i.e. prompts which worked the best and worst, LLMs which worked the best and worst, anything else you think is relevant)  
   * **Completed**: Created comprehensive Statistics page (`src/pages/Statistics.js`) with key insights and visualizations. Displays overview cards showing: Total Prompts, Total Responses, Jailbroken Count, and Overall Jailbreak Rate. Shows "Best Prompts" (highest jailbreak rate) and "Worst Prompts" (lowest jailbreak rate) with rankings and percentages. Shows "Most Vulnerable LLMs" (highest jailbreak rate) and "Most Secure LLMs" (lowest jailbreak rate) with detailed statistics. All statistics are calculated dynamically from the database. Includes a refresh button to update statistics. Styled with Notion-inspired design using cards and clean layouts.

**Frontend Considerations**

1. We want this website to be heavily influenced by the aesthetics of Notion. Our team colors are sky blue, moss green, and gray. We should use matte colors, radial box shadows, and minimalistic aesthetics.

**Necessary Keys**
RDS_LOGIN=postgresql... (set on HuggingFace)
OPENAI_KEY=sk.... (set on HuggingFace)
