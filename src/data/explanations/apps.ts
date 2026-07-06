import type { RichContent } from "../types";

/** Authored explanations for application & agent layer nodes, keyed by taxonomy node id. */
export const APPS_EXPLANATIONS: Record<string, RichContent> = {
  apps: {
    explanation: `The **application and agent layer** is everything built on top of a trained model. The model itself is just a function that maps input text (or images, audio) to output text. This layer wraps that function with the plumbing that turns it into a product: prompts that steer behavior, retrieval that supplies fresh knowledge, tools the model can call, memory that persists between requests, and guardrails that keep outputs valid and safe.

Mechanically, an application in this layer is a loop of API calls. Your code assembles a context window (system instructions, user input, retrieved documents, tool results), sends it to the model, inspects the response, and decides what to do next: show it to the user, call a tool, retrieve more data, or ask the model again. Frameworks in this layer exist to manage that loop, its state, and its failure modes.

This layer matters because most product differentiation now happens here rather than in the model weights. Two companies calling the same model API can ship wildly different products depending on how they retrieve context, orchestrate tools, and structure the interaction. It is also where most engineering effort goes: prompt design, evaluation, latency, cost, and reliability are all application-layer problems.`,
    analogy: "The model is an engine; this layer is the rest of the car. The engine produces raw power, but steering, brakes, fuel lines, and a dashboard are what make it something a person can actually drive.",
    visualExample: "A customer-support bot: user question comes in, the app retrieves relevant help articles, injects them into a prompt, calls the model, validates the answer against a schema, and only then shows it to the customer.",
  },

  prompting: {
    explanation: `**Prompt engineering** is the practice of designing the text you feed a model to reliably get the behavior you want. Because an LLM is trained to continue text, the prompt is your only steering wheel at inference time: instructions, examples, formatting, and constraints all change the distribution of likely outputs.

The core techniques are simple and composable. Zero-shot prompting just states the task. Few-shot prompting includes worked examples so the model imitates the pattern. Chain-of-Thought asks the model to reason step by step before answering, which measurably improves accuracy on math and logic tasks. ReAct-style prompts interleave reasoning with actions, forming the basis of agents. System prompts set persistent rules, while user prompts carry the specific request.

Prompting matters because it is the cheapest lever available. Before fine-tuning a model or building retrieval, a better prompt often closes most of the quality gap. It is also fragile: small wording changes can shift results, which is why serious teams version their prompts, test them against evaluation sets, and treat them as code.`,
    analogy: "Prompting is like briefing a talented new contractor. They have broad skills but no context about your job, so the quality of your brief, including examples of what good looks like, determines the quality of the work.",
    visualExample: "Changing 'Summarize this contract' to 'You are a paralegal. List the three clauses with the highest financial risk, quoting each one' turns a vague summary into a targeted, checkable output.",
  },

  rag: {
    explanation: `**Retrieval-Augmented Generation (RAG)** grounds a model's answers in documents fetched at query time. Instead of hoping the model memorized a fact during training, the application searches a knowledge base for relevant passages and pastes them into the prompt, so the model answers from evidence in front of it.

The standard pipeline has two phases. At indexing time, documents are split into chunks, each chunk is converted into an embedding vector, and the vectors are stored in a vector database. At query time, the user's question is embedded the same way, the database returns the most similar chunks, and those chunks plus the question go to the model with an instruction like 'answer using only the context provided'. Refinements include reranking retrieved chunks, hybrid keyword-plus-vector search, and citing sources in the output.

RAG matters because it solves three problems fine-tuning cannot: knowledge freshness (update the index, not the weights), attribution (you can show which document supported an answer), and access control (retrieve only what this user is allowed to see). It reduces hallucination but does not eliminate it, since the model can still misread or ignore the retrieved context.`,
    analogy: "RAG is an open-book exam instead of a closed-book one. The student (model) still does the reasoning, but answers from pages placed on the desk rather than from imperfect memory.",
    visualExample: "An employee asks 'What is our parental leave policy?' The system retrieves the two relevant paragraphs from the current HR handbook and the model answers from them, citing the document, instead of guessing from stale training data.",
  },

  graphrag: {
    explanation: `**GraphRAG** is retrieval-augmented generation where the knowledge base is a knowledge graph rather than a pile of text chunks. Instead of returning passages that are merely similar to the query, the system traverses entities and their typed relationships, so it can answer questions that require connecting facts scattered across many documents.

A typical implementation first uses an LLM to extract entities and relationships from source documents and assemble them into a graph, often with community summaries at multiple levels. At query time, retrieval can follow edges (find the supplier of the company mentioned in this contract), pull in a subgraph around the relevant entities, and hand the model structured facts plus supporting text.

GraphRAG earns its extra complexity on multi-hop questions and global questions. Vanilla RAG struggles with 'How are X and Y connected?' or 'What are the main themes across this whole corpus?' because no single chunk contains the answer. The tradeoff is a heavier pipeline: building and maintaining the graph costs LLM calls and engineering time, so plain RAG remains the right default for straightforward lookup.`,
    analogy: "Plain RAG is like searching a library by skimming for pages that mention your keywords. GraphRAG is like asking a librarian who has already mapped how every person, place, and event in the collection relates to the others.",
    visualExample: "Asked 'Which board members of our acquirer also sit on competitor boards?', GraphRAG hops from company to board members to their other directorships, a chain no single document chunk states outright.",
  },

  tooluse: {
    explanation: `**Function calling**, also called tool use, lets a model invoke external code instead of only producing prose. The developer describes available functions (name, purpose, parameter schema) in the request. When the model decides a function would help, it emits a structured JSON call rather than a plain answer. Your code executes the function, appends the result to the conversation, and the model continues with real data in hand.

Crucially, the model never runs anything itself. It only proposes calls; the application executes them and controls what is allowed. This makes the pattern safe to extend to databases, web searches, calculators, calendars, and internal APIs. Most providers train their models specifically to emit well-formed calls, and the same mechanism powers structured output extraction.

Tool use matters because it bounds what models are bad at. LLMs are unreliable at arithmetic, cannot see today's data, and cannot cause side effects. With tools, the model becomes a router of intent: it decides what to do, and deterministic code does it correctly. Every agent system is built on this primitive.`,
    analogy: "Function calling turns the model from a know-it-all into a competent dispatcher: instead of guessing your account balance, it fills out the correct request form and hands it to the bank's system.",
    visualExample: "A user asks 'What's the weather in Tokyo?' The model emits getWeather(city: Tokyo), the app calls a weather API, returns 18 degrees and rainy, and the model writes the final sentence using that value.",
  },

  mcp: {
    explanation: `The **Model Context Protocol (MCP)** is an open standard, introduced by Anthropic in late 2024, for connecting AI applications to external tools, data sources, and prompts. Before MCP, every framework and every integration spoke its own dialect, so connecting N assistants to M tools meant N times M custom adapters. MCP replaces that with one wire protocol both sides can implement once.

It works as a client-server architecture over JSON-RPC. An MCP server wraps some capability, such as a filesystem, a database, GitHub, or Slack, and advertises three kinds of primitives: tools the model can call, resources it can read, and prompt templates it can use. An MCP client (Claude Desktop, Cursor, an agent framework) discovers what a server offers at runtime and exposes it to the model. Servers can run locally over stdio or remotely over HTTP.

MCP matters because it is a protocol, not a framework, so adoption compounds: a server written once works with every MCP-capable client, and the major labs and IDE vendors adopted it quickly. If you are building an integration for AI agents in 2026, an MCP server is usually the highest-leverage packaging for it.`,
    analogy: "MCP is the USB-C of AI integrations: one standardized port, so any tool can plug into any assistant without a custom cable for every pairing.",
    visualExample: "You add a Postgres MCP server to your editor's config, and your coding agent can immediately list tables and run read-only queries against your database, with no plugin written for that specific editor.",
  },

  a2a: {
    explanation: `**A2A (Agent-to-Agent)** is an open protocol, announced by Google in 2025 and now governed under the Linux Foundation, for making independent agents interoperable. While MCP connects one agent to tools, A2A connects agents to each other, so an agent built on one framework and hosted by one vendor can delegate work to an agent built and hosted entirely differently.

The protocol defines a common vocabulary over HTTP and JSON-RPC. Each agent publishes an **Agent Card**, a machine-readable description of its identity, skills, and endpoint. A client agent discovers a remote agent via its card, then sends it a task. Tasks have a lifecycle (submitted, working, input required, completed), can run for a long time, and can stream progress updates. Agents exchange messages and artifacts without exposing their internal reasoning, memory, or tools to each other.

A2A matters when agent ecosystems cross organizational boundaries. Inside one codebase, a multi-agent framework is enough; but when your procurement agent needs to negotiate with a supplier's sales agent, both sides need a neutral contract for discovery, authentication, and task exchange. A2A and MCP are complementary layers, not competitors.`,
    analogy: "A2A is like standardized business correspondence between companies: each firm keeps its internal processes private, but letters, invoices, and contracts follow shared conventions everyone can process.",
    visualExample: "A travel-planning agent reads an airline agent's Agent Card, discovers a 'rebook flight' skill, submits the task, and polls the task state until it receives a confirmation artifact, all without knowing what model or framework the airline uses.",
  },

  "coral-protocol": {
    explanation: `**Coral Protocol** is infrastructure for decentralized multi-agent systems, built on top of MCP. Its goal is an 'internet of agents': a way for agents written by different teams, in different frameworks, to discover each other, hold structured conversations, and coordinate on tasks without a single vendor owning the network.

The core runtime is a **Coral Server** that manages threads, much like a messaging platform for agents. Agents register with the server, get added to shared threads, mention each other to route messages, and receive messages as MCP tool interactions. Around this, the project layers a registry where reusable 'Coralized' agents can be published and rented, with payments to agent authors settled in crypto.

Coral occupies a more experimental niche than MCP or A2A. It matters if you are interested in open agent economies, where discovery, communication, and payment for agent services are all decentralized rather than mediated by one platform. For a typical in-house multi-agent app, a conventional framework is the simpler choice.`,
    analogy: "If MCP gives one agent a toolbox, Coral is the group chat plus marketplace where many agents from different owners can meet, talk in threads, and get paid for their contributions.",
    visualExample: "A developer composes a research pipeline by renting three published Coral agents (a web searcher, a summarizer, a fact-checker); the Coral server threads their conversation and each author is paid per use.",
  },

  x402: {
    explanation: `**x402** is an open payment protocol, introduced by Coinbase in 2025, that revives the dormant HTTP status code 402 Payment Required to let clients, especially AI agents, pay for web resources per request. Instead of API keys, subscriptions, and invoices, a server can simply quote a price on any endpoint, and the caller pays inline as part of the HTTP exchange.

The flow is simple. A client requests a resource; the server responds with 402 and payment details (amount, asset, destination). The client signs a payment authorization, typically a stablecoin transfer on a low-fee chain, and retries the request with the signed payload in a header. A facilitator service verifies and settles the payment, and the server returns the resource. No account creation or human sign-off is required at any step.

x402 matters because agents break the assumptions of subscription billing. An autonomous agent cannot fill out a credit card form, but it can sign a micropayment for exactly one API call, one dataset download, or one inference. Combined with agent protocols like A2A, this enables machine-to-machine commerce at per-request granularity.`,
    analogy: "x402 is a coin-operated turnstile for the web: instead of holding a monthly membership card, anyone, human or robot, drops in exact change and walks through.",
    visualExample: "A research agent hits a paywalled market-data API, receives a 402 quoting $0.02, signs a USDC payment, retries with the payment header, and gets the data back in under a second.",
  },

  "erc-8004": {
    explanation: `**ERC-8004** is a proposed Ethereum standard for 'trustless agents': giving AI agents on-chain identity, reputation, and validation so that agents who have never interacted can decide whether to trust each other without a common platform vouching for both.

The standard defines three lightweight registries. The **Identity Registry** gives each agent a portable on-chain handle that links to its off-chain Agent Card (the same discovery document used by A2A). The **Reputation Registry** standardizes how feedback and ratings about an agent's past work are posted and read. The **Validation Registry** provides hooks for stronger checks, such as re-execution of work by validators or cryptographic attestations. Payments can then flow over crypto rails, with x402 as a natural companion.

ERC-8004 matters for the open-ended case where agent markets span organizations and jurisdictions: hiring an unknown agent to do paid work requires some substitute for institutional trust. It is early-stage and adjacent standards are still settling, but it marks where agent infrastructure meets public blockchains.`,
    analogy: "ERC-8004 is like a public business registry combined with a review site, except the entries are cryptographically verifiable and no single company controls who gets listed.",
    visualExample: "Before delegating a paid translation task, an agent looks up the counterparty in the identity registry, checks its accumulated on-chain feedback score, and only then opens an A2A task with escrowed payment.",
  },

  agents: {
    explanation: `An **agent** is an LLM given a goal, a set of tools, and permission to loop: it plans, acts, observes the results, and keeps going until the task is done. A plain chat model produces one response per prompt; an agent chains many model calls and tool executions together, deciding at each step what to do next.

The mechanics are a loop your code runs around the model. Each iteration, the model sees the goal, the history of previous actions and their results, and the available tools. It either emits a tool call (search this, edit that file, run this command) or declares the task complete. The application executes the call, appends the observation, and re-invokes the model. Everything else in agent engineering, including memory, planning, and multi-agent coordination, elaborates on this loop.

Agents matter because they extend AI from answering questions to completing work: fixing a bug across five files, researching and booking a trip, reconciling invoices. The cost is compounding error and expense: each step can go wrong, and a twenty-step task multiplies both risk and token spend. This is why agent design centers on tight feedback (tests, verification), scoped permissions, and knowing when to stop.`,
    analogy: "A chat model is a consultant who answers one question per meeting. An agent is an employee you can hand a project to: they break it down, use the office tools, check their own work, and come back when it is finished.",
    visualExample: "Told 'fix the failing test', a coding agent runs the test suite, reads the traceback, opens the offending file, edits two lines, reruns the tests, sees them pass, and reports done, six model calls stitched into one task.",
  },

  "react-loop": {
    explanation: `**ReAct** (Reasoning + Acting) is the prompting pattern underneath most agents: the model alternates between an explicit reasoning step, an action, and an observation of the action's result, repeating until it can answer. The name comes from the 2022 paper that showed interleaving thought and action beats either pure chain-of-thought reasoning or pure action-taking.

Each cycle has three parts. **Thought**: the model writes out what it knows and what to try next. **Action**: it emits a tool call, such as a search query or a calculator invocation. **Observation**: the application runs the tool and feeds the result back. The visible thought trace keeps the model anchored to the actual observations rather than to its assumptions, and gives developers a legible trail for debugging.

ReAct matters as the conceptual foundation even where the format has evolved. Modern function-calling APIs and reasoning models internalize parts of the pattern, but the essential structure, act on the world, look at what actually happened, and revise the plan, remains how every practical agent avoids confidently executing a wrong plan to completion.`,
    analogy: "ReAct is how a detective works a case: form a hypothesis, run down one lead, look hard at what the evidence actually says, and update the theory before chasing the next lead.",
    visualExample: "Q: 'Who is older, the CEOs of company A and B?' Thought: I need both birthdates. Action: search CEO of A. Observation: born 1965. Action: search CEO of B. Observation: born 1971. Thought: A's CEO is older. Answer given.",
  },

  "multi-agent": {
    explanation: `A **multi-agent system** decomposes a task across several LLM agents, each with its own role, instructions, and tools, instead of stuffing everything into one agent. A typical setup might have a planner that breaks work down, specialists that execute pieces, and a reviewer that checks results, coordinated by an orchestrator or by direct agent-to-agent messages.

Coordination follows a few recurring topologies. In **supervisor** patterns, a lead agent routes subtasks to workers and integrates their outputs. In **pipeline** patterns, output flows through stages like draft, critique, revise. In **debate or group-chat** patterns, agents argue toward consensus. The practical payoff is context isolation: each agent sees a short, focused prompt and a small toolset, which improves reliability compared with one agent juggling a bloated context and thirty tools.

The honest tradeoff is overhead. Multiple agents mean more tokens, more latency, and new failure modes such as agents miscommunicating or looping on each other. The working rule: start with a single agent, and split into multiple agents only when the task has genuinely separable roles or the context and tool count have outgrown one prompt.`,
    analogy: "It is the difference between one freelancer doing everything and a small firm with a project manager, specialists, and a QA reviewer. The firm handles bigger jobs, but only if the handoffs are crisp.",
    visualExample: "A report-writing system: a research agent gathers sources, a writer agent drafts each section, a critic agent flags unsupported claims, and a supervisor merges revisions into the final document.",
  },

  memory: {
    explanation: `**Agent memory** is how an agent retains information beyond a single model call, since the model itself is stateless and forgets everything the moment a request ends. Everything an agent 'remembers' must be deliberately stored by the application and re-injected into a future prompt.

Memory splits into layers. **Short-term memory** is the running conversation and action history inside the current context window; because windows are finite, long sessions require compaction, summarizing older turns to make room. **Long-term memory** lives outside the context in files, databases, or vector stores, and is retrieved when relevant: user preferences, facts learned in past sessions, summaries of prior work. Some systems distinguish episodic memory (what happened) from semantic memory (facts distilled from what happened).

Memory matters because it separates a tool from a colleague. Without it, an agent re-asks your preferences every session and repeats past mistakes. With it, agents improve over time and handle tasks spanning days. The hard problems are selection and hygiene: storing too much buries the useful signal, retrieving the wrong memory misleads the model, and stale memories must eventually be updated or forgotten.`,
    analogy: "An LLM has the memory of someone with severe amnesia who is brilliant in the moment. Agent memory is their notebook: nothing persists unless it is written down, and it only helps if the right page is open at the right time.",
    visualExample: "On Monday you tell a coding agent 'we use pnpm, never npm'. It writes that to a persistent notes file; on Thursday, in a fresh session, the note is loaded into context and the agent runs pnpm install unprompted.",
  },

  "frameworks-app": {
    explanation: `**Agent frameworks** are libraries that provide the recurring scaffolding of agentic applications so you do not rebuild it per project: the agent loop, tool registration and schema generation, conversation state, memory, streaming, retries, and observability hooks.

They differ mainly along two axes. **Control style**: graph-based frameworks like LangGraph have you define explicit nodes and edges for maximum control over flow, while role-based frameworks like CrewAI have you declare agents and goals and let the framework orchestrate. **Language and ecosystem**: Python dominates (LangGraph, PydanticAI, DSPy, AutoGen), with Mastra serving TypeScript teams, and vendor SDKs like the OpenAI Agents SDK staying deliberately minimal. Most now interoperate through shared standards, especially MCP for tools.

Choosing matters less than it appears: the concepts transfer, and the model quality usually dominates outcomes. The real decision is how much abstraction you want. Heavy frameworks speed up the start but can obscure what is in the prompt when you debug; many production teams use a thin framework, or none, and keep the loop in plain code they fully control.`,
    analogy: "Agent frameworks are like web frameworks. You could handle raw HTTP yourself, and sometimes should, but routing, sessions, and middleware are solved problems that a framework hands you on day one.",
    visualExample: "The same support-triage agent in raw API calls takes a few hundred lines of loop, state, and retry code; in a framework it is a dozen lines declaring tools, instructions, and a run call.",
  },

  langgraph: {
    explanation: `**LangGraph** is the agent-orchestration layer of the LangChain ecosystem. You model an application as a graph: nodes are steps (an LLM call, a tool, a router), edges define what runs next, and a shared state object flows through, giving you explicit control over cycles, branching, retries, and human-in-the-loop pauses, with built-in state persistence (checkpointing) so long-running agents can resume. Choose it when your workflow has real structural complexity, such as multiple agents, conditional paths, or approval gates, and you want that structure visible and debuggable rather than buried inside a framework's autonomous loop; the tradeoff is more upfront wiring than 'declare an agent and go' alternatives.`,
    analogy: "LangGraph is a flowchart you can execute: every box, arrow, and decision diamond in your agent's behavior is something you drew deliberately.",
    visualExample: "A loan-processing agent as a graph: extract-documents node, then a router edge sending clean cases to auto-approve and edge cases to a human-review node that pauses the graph until someone clicks approve.",
  },

  llamaindex: {
    explanation: `**LlamaIndex** is a framework centered on connecting LLMs to your data, strongest at retrieval-augmented generation. It ships hundreds of data connectors (PDFs, Notion, Slack, SQL, APIs) plus the full ingestion pipeline: parsing, chunking, embedding, indexing, and query engines with rerankers, and has grown agent and workflow layers on top. Its LlamaParse service is notably good at messy real-world documents like tables in PDFs. Choose LlamaIndex when the heart of your problem is getting knowledge out of documents and into answers; reach for a general agent framework first when your problem is orchestration with only incidental retrieval.`,
    analogy: "If agent frameworks are about giving the model hands, LlamaIndex is about giving it a well-organized library with a fast card catalog.",
    visualExample: "Point LlamaIndex at a folder of 500 vendor contracts and get a query engine that answers 'which contracts auto-renew in Q3?' with citations back to the source clauses.",
  },

  crewai: {
    explanation: `**CrewAI** is a Python framework for role-based multi-agent orchestration: you define agents by role, goal, and backstory (researcher, writer, reviewer), assign tasks, and group them into a 'crew' that executes sequentially or hierarchically with a manager agent delegating. Its independent, lean codebase (no LangChain dependency) and readable abstractions make multi-agent pipelines quick to stand up, and Flows adds finer event-driven control when you need it. Choose CrewAI when your task naturally decomposes into a team of specialists and you value fast assembly over step-level control; pick a graph framework when you need to dictate the exact execution path.`,
    analogy: "CrewAI is a staffing template for AI: you write the job descriptions and the project brief, and the framework runs the team meeting.",
    visualExample: "A three-agent content crew: a researcher agent compiles sources on a topic, a writer agent drafts the article from them, and an editor agent enforces style before the final output is returned.",
  },

  maf: {
    explanation: `The **Microsoft Agent Framework** is Microsoft's unified, enterprise-focused agent SDK for .NET and Python, the designated successor merging AutoGen's multi-agent research ideas with Semantic Kernel's production plumbing. It provides agents and graph-based workflows with typed messages, checkpointing, human-in-the-loop steps, and long-running durability, plus first-class support for open standards (MCP, A2A, OpenAPI) and deep Azure integration with OpenTelemetry observability and compliance tooling. Choose it if you are a .NET shop or building agents that must live inside the Azure and Microsoft 365 ecosystem; elsewhere, lighter Python or TypeScript frameworks usually get you moving faster.`,
    analogy: "It is the corporate-IT edition of an agent framework: fewer viral demos, more audit logs, service agreements, and identity integration.",
    visualExample: "An enterprise expense agent built on MAF runs as a durable Azure workflow: it parses receipts, pauses for a manager's approval in Teams, and resumes to file the reimbursement, with every step traced.",
  },

  pydanticai: {
    explanation: `**PydanticAI** is a Python agent framework from the team behind Pydantic, the validation library that underpins FastAPI and most LLM data plumbing. Its pitch is type safety end to end: agent outputs are Pydantic models, so responses are validated against your schema and automatically retried with the validation error when the model gets the shape wrong; dependency injection, plain-function tools, and tight IDE support make agents feel like normal typed Python code. Choose it when you want structured, validated outputs and an ergonomic, unmagical codebase; look elsewhere when you need heavy multi-agent orchestration or a large ecosystem of prebuilt integrations.`,
    analogy: "PydanticAI does for agents what FastAPI did for web APIs: the type hints you already write become the contract the system enforces.",
    visualExample: "You declare a result type of Invoice with vendor, total, and due date fields; when the model returns a malformed total, PydanticAI feeds the validation error back and the retry comes back clean.",
  },

  dspy: {
    explanation: `**DSPy** is a Stanford-born framework that treats prompts as compiled artifacts rather than hand-written strings. You declare signatures (question in, answer out), compose them into modules (chain-of-thought, ReAct), and then a DSPy optimizer tunes the actual prompts, and optionally few-shot examples or fine-tuned weights, against your metric on a small training set. The result is measurable: rather than eyeballing prompt tweaks, you rerun the optimizer when you switch models or data and it re-derives good prompts. Choose DSPy when you have a defined metric and evaluation data and want systematic quality gains; skip it for quick prototypes where hand prompting is faster than building an eval set.`,
    analogy: "Hand prompting is writing assembly by intuition; DSPy is the compiler that turns your high-level program into optimized low-level instructions for whichever model you target.",
    visualExample: "You give DSPy 50 labeled examples of support tickets and a routing accuracy metric; its optimizer explores instructions and few-shot combinations and lifts accuracy from 71% to 88% without you editing a prompt.",
  },

  mastra: {
    explanation: `**Mastra** is a TypeScript-native agent framework from the team that built the Gatsby web framework, aimed at JavaScript developers who do not want to switch to Python for AI work. It bundles agents, tool calling, durable graph-based workflows with suspend and resume, RAG, memory, evals, and MCP support, and it deploys naturally to serverless platforms like Vercel and Cloudflare, with a local playground for visually inspecting agent runs. Choose Mastra when your product is already a TypeScript codebase (Next.js apps especially) and you want the agent layer in the same language, types, and deploy pipeline as everything else.`,
    analogy: "Mastra is the home-team framework for web developers: instead of importing a Python culture into a JavaScript shop, the agent stack speaks the language the rest of the app already speaks.",
    visualExample: "In a Next.js support app, a Mastra agent defined alongside your API routes answers tickets using a RAG pipeline over your docs, and the whole thing ships in the same Vercel deploy as the frontend.",
  },

  "openai-sdk": {
    explanation: `The **OpenAI Agents SDK** is OpenAI's deliberately minimal framework for building agents in Python or TypeScript, built around a few primitives: an Agent (instructions plus tools), Handoffs (one agent delegating to another), Guardrails (validation running alongside the agent), Sessions (conversation state), and built-in tracing. The runner loop handles tool calls and turn-taking, and despite the name it works with non-OpenAI models too. Choose it when you want the thinnest possible production-ready layer over the model API, especially in an OpenAI-centric stack; choose a heavier framework when you need rich prebuilt integrations, complex graph workflows, or vendor neutrality as a hard requirement.`,
    analogy: "It is the manufacturer's own toolkit: few parts, well machined, guaranteed to fit the engine, but not trying to be a whole garage.",
    visualExample: "A triage agent answers billing questions itself but hands off to a refunds agent when it detects a refund request; the handoff, loop, and trace view all come from the SDK in about thirty lines.",
  },

  autogen: {
    explanation: `**AutoGen** is Microsoft Research's multi-agent conversation framework, one of the first to popularize agents that talk to each other: assistant agents, user-proxy agents that can execute code, and group chats where several agents collaborate on a problem. Its v0.4 rewrite introduced an asynchronous, event-driven core, and AutoGen Studio added a low-code interface for prototyping agent teams. Microsoft has since folded its ideas into the Microsoft Agent Framework, which is the recommended path for new production work, so choose AutoGen today mainly for research and experimentation on multi-agent dynamics or to maintain an existing deployment.`,
    analogy: "AutoGen is the research lab where multi-agent conversation patterns were worked out before being productized elsewhere.",
    visualExample: "A classic AutoGen setup: a coder agent writes a script, a user-proxy agent executes it in a sandbox and posts the traceback, and the pair iterate in conversation until the script runs clean.",
  },

  metagpt: {
    explanation: `**MetaGPT** is an open-source multi-agent framework that simulates a software company: agents play product manager, architect, engineer, and QA, and a one-line requirement flows through them to produce user stories, designs, code, and tests. Its core idea, 'SOP as code', encodes real standard operating procedures so agents pass structured documents rather than chatty freeform messages, which reduces compounding hallucination between roles. The team later built the Data Interpreter and the MGX platform on the same foundation. Choose MetaGPT to explore assembly-line agent workflows or generate scaffolded prototypes from a spec; for day-to-day coding, interactive coding agents are more practical.`,
    analogy: "MetaGPT runs a tiny fictional software firm on your laptop, where each employee is an LLM following the company handbook.",
    visualExample: "Given 'build a CLI todo app', MetaGPT's PM agent writes requirements, the architect agent produces a design doc, and the engineer agent emits the Python files, each artifact handed down the line.",
  },

  "camel-ai": {
    explanation: `**CAMEL-AI** is an open-source multi-agent research framework built around role-playing: two or more agents are assigned roles (a user agent that instructs, an assistant agent that executes) and converse autonomously to complete tasks, with inception prompting keeping them on-role. It began as a 2023 research paper on 'mind exploration' of agent societies and grew into a large community studying how agents cooperate at scale, including the OWL project for real-world task automation; a major practical use is generating synthetic conversational data for training. Choose CAMEL for research into agent interaction and scaling laws or for data generation; choose a production-oriented framework for shipping applications.`,
    analogy: "CAMEL is an improv theater for AI: hand two models their character cards and a scenario, then study the scene they play out.",
    visualExample: "A 'stock trader' user agent and a 'Python programmer' assistant agent converse turn by turn until they have specified and written a working trading-bot script, with no human in the loop.",
  },

  superagi: {
    explanation: `**SuperAGI** is a dev-first open-source platform for building, running, and managing autonomous agents, distinguished by shipping infrastructure alongside the framework: a graphical console for provisioning and monitoring agents, concurrent agent runs, a marketplace of toolkits, action consoles for human input, and performance telemetry. It targets teams that want agent operations, including deployment, scheduling, and monitoring, handled out of the box rather than assembled from parts. Choose SuperAGI when you want a self-hosted control plane for long-running autonomous agents; choose a lighter library when you are embedding one agent inside an existing application.`,
    analogy: "Where most frameworks give you an engine, SuperAGI tries to hand you the whole depot: garage, dashboard, fleet scheduling, and fuel monitoring included.",
    visualExample: "From SuperAGI's web console you spin up three concurrent research agents with different toolkits, watch their runs and token spend live, and pause one that is drifting off task.",
  },

  autogpt: {
    explanation: `**Auto-GPT** was the March 2023 experiment that made 'AI agents' a household term: give GPT-4 a goal, and it recursively generates its own tasks, executes them with tools like web search and file access, and keeps its own memory, chaining thoughts toward the goal without human turns. It briefly became one of the fastest-starred GitHub repositories ever. In practice it looped, forgot context, and burned tokens, and those failures taught the field why grounding, verification, and tighter loops matter; the project later evolved into a low-code agent-workflow platform. Study it for the history and the lessons; build on modern frameworks instead.`,
    analogy: "Auto-GPT was the Wright Flyer of autonomous agents: barely stayed airborne, changed what everyone believed was possible.",
    visualExample: "Given 'grow my newsletter', 2023-era Auto-GPT would spawn subtasks like research competitors and draft posts, execute a few searches and file writes, and often loop indefinitely refining its own task list.",
  },

  babyagi: {
    explanation: `**BabyAGI** is a deliberately minimal task-management agent loop, published in 2023 by Yohei Nakajima as roughly 140 lines of Python: an execution step performs the top task, an enrichment step turns the result into new tasks, and a prioritization step reorders the queue against the objective, with a vector store providing memory. Its value was pedagogical: it distilled the autonomous-agent idea to something you could read in ten minutes and understand completely, spawning countless variants and influencing later designs (a later rewrite explored self-building agents). Read it to understand agent loops at their barest; use a maintained framework for real work.`,
    analogy: "BabyAGI is the 'hello world' of autonomous agents: too simple to use in production, exactly simple enough to finally understand what an agent loop is.",
    visualExample: "Objective: 'plan a product launch'. The loop executes 'draft launch checklist', the enrichment step spawns 'write press release' and 'set launch date', the prioritizer reorders, and the cycle repeats task by task.",
  },

  "agent-runtime": {
    explanation: `**Agent runtime and tooling** is the operational layer around agents: the platforms and gateways that host them, connect them to the outside world, and keep them observable and affordable in production. A framework helps you write an agent; this layer answers what it runs on, how it reaches hundreds of external services, and how you monitor and control it.

The category spans several distinct jobs. **Workflow platforms** like n8n and visual builders like Langflow let you compose agentic pipelines graphically. **Tool aggregators** like Composio and Toolhouse solve the grind of integrations, offering hundreds of prebuilt, authenticated tools (Gmail, Slack, GitHub) so agents can act without you writing OAuth flows per service. **LLM gateways** like Portkey sit between your app and model providers, adding routing, failover, caching, cost tracking, and guardrails at a single choke point.

This layer matters because the gap between an agent demo and a production agent is mostly operational: credentials management, rate limits, retries, spend caps, audit logs. Teams either assemble these pieces or rediscover each problem the hard way once real users and real budgets arrive.`,
    analogy: "If the agent is a new employee, this layer is facilities and IT: the badge that opens doors, the accounts on every internal system, and the manager dashboard tracking what they did and what it cost.",
    visualExample: "An agent needs to read Gmail, post to Slack, and file Jira tickets: a tool aggregator provides all three integrations with managed OAuth, while an LLM gateway in front logs every model call and enforces a daily spend cap.",
  },

  n8n: {
    explanation: `**n8n** is a fair-code workflow automation platform with a visual node editor and 400+ integrations, which has become a popular substrate for agentic pipelines: alongside classic triggers and app nodes, it offers AI Agent nodes, LLM calls, memory, and tool wiring, so you can drop an agent into the middle of an ordinary business workflow. Because it is source-available and self-hostable, teams with data-residency requirements can run it on their own infrastructure, and technical users can inject JavaScript or Python where nodes fall short. Choose n8n when your problem is automation-first (webhooks, CRMs, schedules) with AI steps inside it, rather than a deeply custom agent codebase.`,
    analogy: "n8n is a conveyor belt system for data where one of the workstations can now think: most stations move and transform items mechanically, and an LLM sits at one bench making judgment calls.",
    visualExample: "A support workflow: new email triggers the flow, an AI Agent node classifies and drafts a reply using an internal knowledge-base tool, a human approves in Slack, and n8n sends the response and logs it to the CRM.",
  },

  composio: {
    explanation: `**Composio** is a tool-integration platform for agents: it maintains hundreds of prebuilt, schema-correct tool integrations (GitHub, Gmail, Slack, Jira, Notion, and many more) with managed authentication, so an agent gets working, authenticated actions in a few lines instead of you building OAuth flows and API wrappers per service. It plugs into all major frameworks and model providers, supports MCP, and handles per-user credential management so each end user's agent acts under that user's own accounts. Choose Composio when your agent needs to act across many third-party SaaS apps; skip it when your agent only touches your own internal APIs.`,
    analogy: "Composio is a universal adapter kit plus keychain for agents: every popular service already has a fitted plug, and the keys are stored and rotated for you.",
    visualExample: "Three lines of setup give your agent a working 'create GitHub issue' tool: Composio hosts the OAuth flow, stores the user's token, and exposes the action in the exact schema your framework expects.",
  },

  toolhouse: {
    explanation: `**Toolhouse** is a managed cloud of prebuilt tools for LLMs: instead of writing, hosting, and securing your own function-calling infrastructure, you connect to Toolhouse and your agent gets a curated store of production-ready capabilities such as web search, code execution, RAG over your data, email sending, and browser use, in the exact schema your model expects, plus a Toolhouse MCP server for MCP-native stacks. It positions itself as agent backend-as-a-service, handling execution, low latency, and tool analytics on its own infrastructure. Choose Toolhouse when you want capabilities without owning tool infrastructure; choose self-built or aggregator approaches when tools must run inside your own perimeter.`,
    analogy: "Toolhouse is an app store for your agent: instead of building each capability from parts, you install it, and it arrives already hosted, tested, and wired for function calling.",
    visualExample: "You attach Toolhouse to a chatbot and it can immediately execute Python for data questions and search the web for current facts, both running on Toolhouse's cloud with no servers on your side.",
  },

  portkey: {
    explanation: `**Portkey** is an LLM gateway and AI ops platform: your application sends model calls through it as a single unified API to 250+ providers, and in return you get observability (logs, traces, cost and latency analytics per request), reliability (automatic fallbacks between providers, load balancing, retries, semantic caching), governance (virtual keys, budgets, access control, guardrails), and a prompt-management layer. Its selling point is centralizing production concerns in one place instead of scattering retry and logging logic across services. Choose Portkey (or a similar gateway) once LLM calls are business-critical, multi-provider, or need cost accountability; a single low-stakes integration does not need one.`,
    analogy: "Portkey is air traffic control for model calls: every request checks in with one tower that routes it, reroutes around failures, and keeps a complete flight log.",
    visualExample: "When OpenAI returns errors during an outage, Portkey's fallback rule silently reroutes traffic to Anthropic, and the ops dashboard shows the failover, per-team spend, and cache hit rate in real time.",
  },

  langflow: {
    explanation: `**Langflow** is an open-source visual builder for LLM applications: you drag components (models, prompts, vector stores, tools, agents) onto a canvas, wire them into a flow, test interactively in a playground, and then serve the result as an API or export it, with MCP support on both ends (flows can consume MCP tools and be exposed as MCP servers). Originally a visual layer for LangChain-style pipelines and now stewarded within IBM after its DataStax acquisition, it excels at fast prototyping and at making pipelines legible to non-engineers. Choose Langflow to sketch and demo RAG or agent flows quickly; complex production systems usually graduate to code.`,
    analogy: "Langflow is a breadboard for LLM apps: you can assemble and test a working circuit visually before deciding what deserves a permanent soldered board.",
    visualExample: "In an afternoon, you drag together a file loader, splitter, embedder, vector search, and chat model into a working document Q&A bot, then hand teammates the flow's API endpoint to try.",
  },

  "coding-agents": {
    explanation: `**AI coding assistants** are agent products specialized for software work: they read a codebase, plan a change, edit files, run commands and tests, and iterate on failures. They span a spectrum of autonomy, from inline autocomplete (original Copilot, TabbyML), to IDE agents that edit multiple files while you watch (Cursor, Antigravity), to terminal agents (Claude Code) and cloud agents that take a ticket and return a pull request (Codex, Kiro).

Under the hood they share one architecture: an agent loop with code-specific tools (read and edit files, grep, run shell commands, execute tests) plus careful context engineering to fit a large repository into a finite context window. Their decisive advantage over general agents is verification: code compiles or it does not, tests pass or fail, so the agent gets crisp feedback every iteration and can genuinely self-correct.

They matter because coding became the first domain where agents produce large verified economic value, which is also why the space is crowded with the major labs competing directly. Practical skill with them is mostly about scoping: small verifiable tasks with clear success criteria succeed; vague sprawling requests produce plausible wrong code that still requires human review.`,
    analogy: "The evolution mirrors autonomy in driving: autocomplete was cruise control, IDE agents are highway assist with your hands near the wheel, and cloud agents are a robo-taxi you dispatch and inspect on arrival.",
    visualExample: "You type 'add rate limiting to the API' in your IDE's agent panel; it searches the codebase, edits the middleware and config, adds a test, runs the suite, fixes one failure, and presents the diff for review.",
  },

  cursor: {
    explanation: `**Cursor** is an AI-first IDE built as a VS Code fork by Anysphere, layering deep AI integration into a familiar editor: a Tab completion model trained in-house that predicts multi-line edits across files, inline chat, and an Agent mode that plans, edits multiple files, runs terminal commands, and iterates on test failures, with rules files and MCP support for customizing context and tools. Working in a VS Code fork means your extensions and keybindings carry over. Choose Cursor when you want the strongest agent experience inside a desktop IDE where you review changes as they happen; teams standardized on plain VS Code plus Copilot, or preferring terminal workflows, may choose otherwise.`,
    analogy: "Cursor is a familiar workshop rebuilt around a power assistant: same benches and tools, but a colleague who can finish edits you barely started and take on whole tasks while you watch.",
    visualExample: "You highlight a function, ask agent mode to 'extract this into a service with tests', and watch it create the new file, update imports across five call sites, and run the test suite before you accept the diff.",
  },

  "github-copilot": {
    explanation: `**GitHub Copilot** is GitHub's coding assistant and the most widely deployed one, spanning inline completions, editor chat, and an agent mode that plans multi-file changes and runs commands, plus a cloud coding agent you can assign a GitHub issue to and receive a pull request back. Its distinctive strengths are distribution and platform depth: it works across VS Code, JetBrains, and other major IDEs, is natively woven into GitHub (PR summaries, code review, Actions), offers a choice of underlying models, and comes with enterprise controls like policy management and IP indemnification. Choose Copilot when your team lives on GitHub or needs an enterprise-sanctioned assistant across mixed IDEs.`,
    analogy: "Copilot is the assistant that came with the building: maybe not the flashiest specialist, but it is on every floor, knows the whole facility, and management already approved it.",
    visualExample: "You label a GitHub issue for the Copilot coding agent; it works in an Actions-powered environment and opens a draft pull request with the fix, which you review like any teammate's PR.",
  },

  "claude-code": {
    explanation: `**Claude Code** is Anthropic's terminal-native coding agent: a CLI where Claude reads your repository, edits files, runs shell commands and tests, and commits, driven by conversation rather than a GUI. Living in the terminal makes it scriptable and composable: it works over SSH, in CI pipelines, and alongside any editor, and it is deeply extensible through CLAUDE.md project-instruction files, hooks, subagents, and MCP; an SDK lets developers build custom agents on the same harness. Choose Claude Code if you prefer terminal workflows, want maximum hackability, or want to delegate whole tasks rather than supervise edits line by line; IDE-centric developers may prefer Cursor or Copilot.`,
    analogy: "Claude Code is a pair programmer who lives in your shell: you describe the job, it navigates the repository and runs the commands itself, narrating as it goes.",
    visualExample: "In a repo you type 'claude' and ask it to migrate the test suite from unittest to pytest; it rewrites the files, runs pytest to verify, fixes stragglers, and proposes a commit, entirely within the terminal session.",
  },

  codex: {
    explanation: `**OpenAI Codex** is OpenAI's coding agent, centered on cloud delegation: from ChatGPT, a CLI, or an IDE extension, you hand it a task and it works in a sandboxed environment preloaded with your repository, writing code, running tests, and producing a diff or pull request, with multiple tasks runnable in parallel. It is powered by dedicated codex models tuned for software engineering, and its cloud-sandbox emphasis distinguishes it from IDE-first tools: you review outcomes rather than watch keystrokes. Choose Codex to parallelize well-scoped tasks like bug fixes and refactors in the background, especially if you already live in the ChatGPT ecosystem; for tight interactive iteration, an IDE agent fits better.`,
    analogy: "Codex is a team of contractors offsite: you write clear tickets, several get worked simultaneously in isolated workshops, and finished work arrives for your inspection.",
    visualExample: "You queue three Codex tasks before lunch (fix a flaky test, add pagination, update a dependency); each runs in its own cloud sandbox and you return to three pull requests awaiting review.",
  },

  kiro: {
    explanation: `**Kiro** is AWS's agentic IDE built around spec-driven development: instead of jumping from a chat prompt straight to code, Kiro first turns your intent into explicit artifacts (requirements written as user stories with acceptance criteria in EARS notation, a technical design, and a task list) and then implements the tasks, keeping the spec in sync with the code. Its other signature feature is hooks, event-driven automations that trigger agent actions on events like file saves, such as updating tests whenever a source file changes. Choose Kiro when you want more rigor and traceability than vibe-coding, especially on AWS-ecosystem teams; for quick exploratory changes its ceremony can feel heavy.`,
    analogy: "Kiro insists on blueprints before construction: rather than a builder improvising from a verbal sketch, you approve requirements and design documents, then watch the tasks get built to that plan.",
    visualExample: "You type 'add a review system for products'; Kiro generates user stories with acceptance criteria, a design with data models and API endpoints, and a sequenced task list, then executes the tasks one by one as you approve.",
  },

  antigravity: {
    explanation: `**Antigravity** is Google's agent-first IDE, launched alongside Gemini 3 in late 2025, built on the premise that developers are becoming managers of agents rather than sole authors of code. Its two surfaces reflect that: a familiar VS Code-style editor, and an Agent Manager, a mission-control view for spawning and supervising multiple agents working in parallel across workspaces. Agents operate across editor, terminal, and a controlled browser (so they can verify web apps end to end), and report progress through Artifacts, including task lists, plans, screenshots, and browser recordings, that are easier to audit than raw tool logs. Choose it to lean into multi-agent, delegation-heavy workflows with Gemini; it is newer and less battle-tested than incumbents.`,
    analogy: "Antigravity is less a workbench and more a control tower: instead of one assistant at your desk, you dispatch a small fleet and review the flight reports as they land.",
    visualExample: "From the Agent Manager you assign one agent a frontend fix and another an API refactor; the first returns a browser recording proving the button now works, the second a plan, diff, and passing test log.",
  },

  replit: {
    explanation: `**Replit** is a browser-based development platform that bundles editor, runtime, database, hosting, and deployment, with Replit Agent as its headline feature: describe an app in natural language and the agent scaffolds, builds, tests in a live preview, and deploys it, all within Replit's cloud. Nothing to install makes the full loop from idea to shared URL possible in minutes, which made it a favorite for prototyping and for non-engineers building real internal tools. Choose Replit when you want idea-to-deployed-app in one place, are learning, or lack a local dev setup; teams with established local toolchains and infrastructure usually prefer IDE or terminal agents inside their existing stack.`,
    analogy: "Replit is a fully equipped rental kitchen: ingredients, ovens, and a serving counter included, so you can go from recipe idea to feeding customers without building your own restaurant.",
    visualExample: "You type 'build me a team expense tracker with login'; Replit Agent scaffolds the app, provisions a database, shows a working preview, and one click later it is deployed on a public URL.",
  },

  tabbyml: {
    explanation: `**TabbyML (Tabby)** is an open-source, self-hosted AI coding assistant: you run the server on your own hardware or cloud, pick an open code model such as StarCoder, CodeLlama, or Qwen-Coder, and get code completion plus an answer engine that indexes your repositories for context-aware suggestions, consumed through IDE extensions. Because everything, including code, prompts, and model, stays inside your perimeter, no code ever reaches a third-party API. Choose Tabby when confidentiality, air-gapped environments, or compliance rule out cloud assistants, or when you want control over the model itself; accept that completion quality trails frontier cloud agents like Cursor or Copilot.`,
    analogy: "Tabby is brewing your own coffee instead of visiting the cafe: more setup and a simpler menu, but you control every ingredient and nothing leaves the house.",
    visualExample: "A fintech team runs Tabby on an internal GPU server with repository indexing enabled; developers get inline completions informed by their private codebase while the compliance team confirms zero external calls.",
  },

  guardrails: {
    explanation: `**Guardrails and structured output** are the techniques that make model output safe and machine-usable. LLMs emit free-form text by default; production systems need JSON that parses, values that satisfy business rules, and content that avoids policy violations. This layer enforces those properties rather than hoping the prompt is obeyed.

Structured output has two enforcement levels. **Validate and retry**: libraries like Instructor or PydanticAI check output against a schema and, on failure, re-prompt the model with the validation error until it conforms. **Constrained decoding**: tools like Outlines and provider-native structured output modes intervene during generation itself, masking any token that would violate the target grammar, making invalid JSON literally impossible to produce. Safety guardrails work differently: input rails screen prompts for injection and abuse, and output rails scan responses for toxicity, leaked PII, or off-topic content before delivery, using classifiers, rules, or a second model as judge.

This layer matters because it is the boundary between a demo and a system. Code that consumes model output will crash on malformed responses, and agents amplify the stakes since bad output can trigger a bad action. Well-designed guardrails let you treat a probabilistic model as a dependable software component.`,
    analogy: "Guardrails are the bumpers, inspection gates, and quality control on a factory line: the machine in the middle is powerful but imprecise, and the surrounding checks ensure only parts that meet spec ever leave the building.",
    visualExample: "An extraction service demands an order object with a positive integer quantity; the model returns quantity 'two', validation fails, the error is fed back, and the retry yields quantity: 2, which is what the database receives.",
  },
};
