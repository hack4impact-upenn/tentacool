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

1. Build out the basic communication with the database, and ways to insert elements into the database or read elements into the database  
2. Build out system to send a query to each of the API providers  
3. Build out an asynch system to send out a lot of API responses at the same time and intelligently/concurrently get back their responses  
4. Build out a way to test with a single LLM (4.1 nano) if a large batch of responses has been jailbroken or not (returning a JSON of yes or no)  
5. Build out a way to accept and add a batch of responses to the database

**Frontend Development Steps**

1. Create a file directory with images, components, data and pages. Create a global API variable that is set and can be edited for where the server is hosted  
2. In our data, define a json file which has the relevant models grouped by API Provider  
3. Develop a header (3 tabs: home, analysis, top statistics)  
4. Develop the home tab which looks like a chat box landing page with a checkbox list of models we can use underneath to select which ones to run it on; default should be all selected  
5. Develop the other views of the home tab   
   1. First view: described above  
   2. Second view: LLM responses received, users should be unable to interact with the responses, and their status should say (“Checking jailbroken” \+ turning settings wheel)  
   3. Third view: after we’ve done our initial scan with 4.1 nano, with a Yes/No toggle for each replacing “Checking jailbroken” with the LLM’s response set, as well as a way to add notes both to the prompt at the top and to each individual response. There should be a button at the bottom to log to the database, after which we should give a confirmation message, wait 2 seconds, and refresh back to the first view  
6. Develop the analysis tab, which should let you query the database by any of the columns  
7. Develop the statistics tab, which should display some of the key insights (i.e. prompts which worked the best and worst, LLMs which worked the best and worst, anything else you think is relevant)

**Frontend Considerations**

1. We want this website to be heavily influenced by the aesthetics of Notion. Our team colors are sky blue, moss green, and gray. We should use matte colors, radial box shadows, and minimalistic aesthetics.

**Necessary Keys**
RDS_LOGIN=postgresql... (set on HuggingFace)
OPENAI_KEY=sk.... (set on HuggingFace)
