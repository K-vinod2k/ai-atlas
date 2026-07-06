import type { RichContent } from "../types";

/** Authored explanations for knowledge, modalities, and governance nodes, keyed by taxonomy node id. */
export const DOMAIN_EXPLANATIONS: Record<string, RichContent> = {
  knowledge: {
    explanation: `**Knowledge and symbolic AI** is the branch of the field that represents facts and meaning explicitly, as structures a human can read and a program can query. Instead of storing what a system knows inside millions of learned weights, this branch writes knowledge down as symbols: named concepts, typed relationships, and logical rules. Ontologies, knowledge graphs, and semantic web standards all belong here.

Mechanically, these systems work by defining a vocabulary of entities and relations, asserting facts using that vocabulary, and then running query or inference engines over the assertions. Because every fact is an explicit record, you can ask precise questions, trace exactly why an answer was produced, and update a single fact without retraining anything.

This branch matters again because it complements neural models where they are weakest. Language models diffuse knowledge across weights, which makes their facts hard to verify, update, or audit. Pairing them with symbolic stores, as in GraphRAG or knowledge graph retrieval, gives you neural flexibility with symbolic precision. When correctness, provenance, or easy updates matter, the symbolic branch is the tool.`,
    analogy: "A neural network's knowledge is like a chef's intuition, absorbed through years of practice and impossible to point to. Symbolic knowledge is the written recipe book: every fact is on a page you can read, cite, and correct.",
    visualExample: "A customer-support system answers 'What warranty covers model X-200?' by looking up the exact product-to-warranty edge in a knowledge graph, then citing that record, rather than hoping an LLM memorized the policy correctly.",
  },

  ontology: {
    explanation: `An **ontology** is a formal schema that defines the concepts in a domain, the properties those concepts can have, and the relationships allowed between them. Where a knowledge graph holds the facts themselves, the ontology is the rulebook that says what kinds of facts are even possible: a Person can have a birthDate, a Company can employ a Person, a birthDate must be a date.

Ontologies are written in formal languages such as OWL (Web Ontology Language), which lets a reasoner check consistency and derive new facts automatically. If the ontology says every Employee is a Person, and the data says Ada is an Employee, a reasoner concludes Ada is a Person without anyone stating it. Class hierarchies, property constraints, and cardinality rules (a person has exactly one birth date) all live in the ontology.

Ontologies matter whenever multiple systems or teams must agree on what data means. Schema.org, an ontology used across the web, lets search engines interpret pages from millions of unrelated sites because everyone shares the same definitions of Recipe, Event, and Product. In enterprise data integration, medicine (SNOMED CT), and knowledge graph construction, the ontology is what keeps independently produced data mutually intelligible.`,
    analogy: "An ontology is like the rulebook and piece definitions of chess: it does not record any particular game, but it defines what pieces exist and which moves are legal, so every game played anywhere is interpretable by anyone who knows the rules.",
    visualExample: "In a hospital ontology, the concept Diagnosis is defined to link exactly one Patient to one Condition with a date; any record violating that shape is flagged as invalid before it ever enters the database.",
  },

  semweb: {
    explanation: `The **Semantic Web** is a set of W3C standards for publishing data on the web in a form machines can interpret, not just display. The core idea: give every entity a global identifier (a URI), express facts as standardized triples, and link datasets to each other the same way web pages link, producing one interconnected web of data.

The main building blocks are **RDF** (Resource Description Framework), which encodes facts as subject-predicate-object triples; **SPARQL**, a query language for asking questions across RDF data; and OWL for defining ontologies. Because identifiers are global URIs, a triple published by Wikipedia and a triple published by a government agency can refer to the same entity and be joined automatically.

The grand vision of a fully linked web never fully arrived, but the standards succeeded in narrower forms. Wikidata, schema.org markup that powers search-result rich snippets, and government open-data portals all run on Semantic Web technology. It matters when you need data from independent publishers to interoperate without a central coordinator.`,
    analogy: "The ordinary web links documents for humans to read; the Semantic Web links individual facts for machines to combine, like upgrading a library of books into a single shared database where every claim has a stable address.",
    visualExample: "When a recipe page includes schema.org markup, a search engine reads the structured triples (cook time: 30 minutes, rating: 4.5) and renders them directly in search results without parsing the prose.",
  },

  kg: {
    explanation: `A **knowledge graph** stores facts as a network: entities are nodes, and typed, directed relationships are edges. 'Marie Curie won Nobel Prize in Physics' becomes a node for Marie Curie, a node for the prize, and a 'won' edge between them. Wikidata and the Google Knowledge Graph each hold billions of such connections.

Mechanically, a knowledge graph is a large collection of triples (subject, predicate, object), usually governed by an ontology that constrains which relationships are valid. Query languages such as SPARQL or Cypher let you traverse the structure: find all physicists who won a Nobel Prize and studied in Paris is a graph pattern match, answered exactly, with each hop inspectable.

The key contrast with a neural network is that facts are **explicit and editable** rather than diffused across weights. You can add, correct, or delete a single fact instantly, and every answer comes with a traceable path of edges as its justification. This makes knowledge graphs the natural partner for LLMs in retrieval systems like GraphRAG: the graph supplies verified, current, connected facts, and the model supplies language understanding. They shine for multi-hop questions, entity disambiguation, and any domain where wrong answers are expensive.`,
    analogy: "A knowledge graph is like a detective's evidence board: photos (entities) connected by labeled strings (relationships), where you can follow the strings to answer questions and point to exactly which connections justify a conclusion.",
    visualExample: "Searching 'Einstein' on Google shows a side panel with his birth date, spouse, and institutions; each field is an edge in the Google Knowledge Graph radiating out from the Einstein node.",
  },

  triple: {
    explanation: `A **triple** is the atomic unit of a knowledge graph: a single fact written as subject, predicate, object. 'Paris (subject) is capital of (predicate) France (object)' is one triple. Every knowledge graph, however large, is ultimately a set of these three-part statements.

The power of the format is uniformity. Because every fact has the same shape, triples from different sources can be merged into one graph, queried with one pattern language, and processed by generic tools. Complex knowledge decomposes cleanly: a person's biography becomes dozens of triples sharing the same subject.`,
    analogy: "A triple is a minimal complete sentence: someone, did something, to something. Knowledge graphs are built from these sentences the way walls are built from identical bricks.",
    visualExample: "The fact 'Whisper was created by OpenAI' stored as the triple (Whisper, createdBy, OpenAI): two nodes and one labeled arrow between them.",
  },

  entity: {
    explanation: `**Entities and relations** are the two ingredients of a knowledge graph. An entity is a node representing a distinct thing: a person, place, company, product, or abstract concept, each with a unique identifier so 'Apple the company' and 'apple the fruit' never collide. A relation is a typed, directed edge connecting two entities, such as foundedBy, locatedIn, or treats.

The typing is what makes the graph useful. Because edges carry meaning, queries can be precise: follow only 'acquiredBy' edges, or find every entity connected to a disease by a 'treats' relation. Extracting entities and relations from raw text (named entity recognition and relation extraction) is how most knowledge graphs get built from documents.`,
    analogy: "Entities are the nouns of a knowledge graph and relations are the verbs; together they turn a pile of disconnected records into sentences a machine can follow.",
    visualExample: "From the sentence 'Satya Nadella is the CEO of Microsoft, headquartered in Redmond', an extraction pipeline produces two relations: (Satya Nadella, ceoOf, Microsoft) and (Microsoft, headquarteredIn, Redmond).",
  },

  "kg-tools": {
    explanation: `**Knowledge graph tools** are the databases and services built to store graphs and answer graph-shaped queries efficiently. They come in two main families. Property graph databases such as Neo4j store nodes and edges with attached key-value properties and are queried with languages like Cypher. RDF triple stores such as GraphDB store standard triples and are queried with SPARQL, aligning with Semantic Web standards.

The reason dedicated tools exist is performance on traversal. A question like 'find friends of friends who work at companies my company partners with' requires hopping across many relationships. In a relational database each hop is a join, and chains of joins get slow; graph databases store adjacency directly, so following an edge is a cheap pointer lookup regardless of total graph size.

Choosing between the families is mostly a question of ecosystem. Property graphs are pragmatic and developer-friendly, common in fraud detection, recommendations, and network analysis. Triple stores fit when you need standards compliance, formal ontologies, or interoperability with published linked data. A newer wave of tools also connects graphs to LLM agents as structured memory.`,
    analogy: "Using a relational database for graph queries is like finding a route between cities by scanning a table of every road in the country; a graph database is like standing at an intersection where each signpost points directly to the next city.",
    visualExample: "A bank runs a fraud query in Neo4j: starting from a flagged account, it traverses shared-device and shared-address edges three hops out and uncovers a ring of twelve linked accounts in milliseconds.",
  },

  cognee: {
    explanation: `**Cognee** is an open-source memory engine for AI agents that converts documents, conversations, and other raw data into a queryable knowledge graph combined with vector embeddings. Instead of stuffing an agent's memory into flat text chunks, Cognee runs pipelines that extract entities and relationships, links them into a graph, and lets the agent retrieve context through both semantic similarity and graph traversal. Choose it when plain vector-store RAG keeps missing answers that require connecting facts across documents, or when an agent needs persistent, structured memory across sessions.`,
    visualExample: "An agent ingests a company's meeting notes through Cognee and can later answer 'which projects has the person who leads billing worked on?' by walking person-to-project edges the pipeline extracted.",
  },

  "kg-embed": {
    explanation: `**Knowledge graph embeddings** translate the symbolic world of graphs into the numeric world of neural networks. Each entity and relation is assigned a vector, learned so that the geometry of the vectors reflects the structure of the graph: entities that play similar roles end up near each other, and relations become consistent transformations between entity vectors.

Methods like **TransE** make this concrete: it learns vectors so that for a true triple (head, relation, tail), head vector plus relation vector lands close to the tail vector. Training pushes true triples to satisfy this equation and corrupted ones to violate it. Random-walk methods like node2vec instead treat walks through the graph as sentences and learn embeddings the way word2vec learns word vectors.

The payoff is that graphs become usable by anything that consumes vectors. The most common application is **link prediction**: scoring plausible missing edges, such as suggesting that a drug may treat a disease because the geometry says the triple almost holds. Embeddings also feed graph context into recommenders, classifiers, and LLM retrieval pipelines. The trade-off is the inverse of the graph's virtue: embeddings are approximate and unexplainable where the graph is exact and auditable, so systems often keep both.`,
    analogy: "A knowledge graph embedding is like plotting every person in a company on a map by their working relationships: the map loses the exact org chart, but now you can measure who is close to whom and spot pairs that probably should be collaborating.",
    visualExample: "After training TransE on a movie graph, the vector for 'Christopher Nolan' plus the vector for 'directed' lands near 'Inception', and the same arithmetic applied to an unseen pair suggests a missing directed edge.",
  },

  modalities: {
    explanation: `**Modalities and domains** describe the kinds of data AI systems consume and the problem areas they are applied to. A modality is a data type: text, images, audio, video, sensor streams. A domain is an application area: recommendation, forecasting, robotics. The same core learning machinery gets specialized for each.

The distinction matters because each modality has its own structure that shapes the methods. Images are spatial grids, which is why convolutions and vision transformers dominate computer vision. Text is discrete sequences, which is why tokenization and attention define NLP. Audio is a continuous waveform usually converted to spectrograms. Time series carry trend and seasonality. Historically each modality had entirely separate architectures and research communities.

The modern trend is convergence. Transformers now serve as a shared backbone across text, vision, and audio, and multimodal models handle several modalities in one network. But the domains still matter for practitioners: the datasets, evaluation metrics, failure modes, and deployment constraints of speech recognition are nothing like those of recommender systems, even when both use attention under the hood.`,
    analogy: "Modalities are like the senses of an AI system: vision, hearing, and reading each need different front-end processing, even if the same brain integrates what they perceive.",
    visualExample: "A single product like a smart assistant chains modalities: speech recognition converts your voice to text, NLP interprets the request, a recommender picks a song, and speech synthesis replies aloud.",
  },

  nlp: {
    explanation: `**Natural language processing (NLP)** is the field of making computers understand and generate human language. Its classic tasks include translation, summarization, sentiment analysis, question answering, and named entity recognition (finding people, places, and organizations in text).

Modern NLP works by converting text into numbers and modeling the statistics of language. Text is split into **tokens** (words or sub-word pieces), each token is mapped to a vector, and a neural network, almost always a Transformer, processes the vectors with attention so every token can incorporate context from the rest of the sequence. Models are pretrained on enormous corpora with self-supervised objectives, chiefly predicting the next token or filling in masked ones, which forces them to internalize grammar, facts, and style without labeled data.

NLP matters because language is how humans encode most knowledge and most requests. It went from a collection of task-specific pipelines to the center of AI when large language models showed that one pretrained model could handle translation, summarization, coding, and reasoning through plain-text prompting. Most of the current application layer, from chatbots to agents, is applied NLP.`,
    analogy: "Pretraining an NLP model is like learning a language purely by reading millions of books with words occasionally covered up and guessing what belongs there; guess enough times and you absorb grammar, facts, and style without a single lesson.",
    visualExample: "A support ticket reading 'the app crashes every time I upload a photo' is automatically tagged bug, routed to the mobile team, and summarized into one line, three NLP tasks running on one incoming email.",
  },

  cv: {
    explanation: `**Computer vision (CV)** is the field of interpreting images and video. Its core tasks form a ladder of increasing detail: classification (what is in this image), object detection (what is where, as bounding boxes), and segmentation (which exact pixels belong to which object), plus tracking, pose estimation, and 3D reconstruction.

An image reaches a model as a grid of pixel numbers. Convolutional neural networks process this grid with small learned filters that detect edges and textures in early layers and compose them into parts and whole objects in deeper layers. Vision Transformers take a different route, cutting the image into patches and letting attention relate every patch to every other. Both learn their visual features from data rather than hand-coded rules, which is what separates modern CV from its pre-2012 ancestor.

Vision matters because cameras are the cheapest, densest sensor of the physical world. Medical imaging, autonomous driving, factory quality inspection, satellite analysis, and photo search all run on CV. It is also the perception layer for robotics and one half of every vision-language model.`,
    analogy: "A CNN understands an image the way you might assemble meaning from a mosaic: first noticing individual tiles (edges and colors), then local patterns (an eye, a wheel), then stepping back to see the whole picture (a face, a car).",
    visualExample: "A self-driving car's vision stack draws boxes around every pedestrian and vehicle in the camera frame, colors the exact pixels of the drivable road surface, and updates thirty times per second.",
  },

  speech: {
    explanation: `**Speech and audio AI** covers recognizing sound and generating it. The two anchor tasks are automatic speech recognition (**ASR**), which converts spoken audio into text, and text-to-speech (**TTS**), which converts text into natural-sounding audio. Around them sit speaker identification, diarization (who spoke when), translation of speech, and music or sound-effect generation.

Audio arrives as a waveform, tens of thousands of amplitude samples per second. Models typically convert it into a **spectrogram**, an image-like map of which frequencies are present over time, and then process that with the same neural machinery used elsewhere: convolutions and Transformers for recognition, and for synthesis, generative models that produce spectrograms or raw audio conditioned on text. Modern systems like Whisper are trained end to end on hundreds of thousands of hours of audio, replacing the older pipeline of separate acoustic, pronunciation, and language models.

Speech is the most natural human interface, which makes this domain the front door for voice assistants, call-center automation, meeting transcription, dubbing, and accessibility tools like live captioning. Quality is now high enough that the hard problems have shifted to accents, noisy environments, low-resource languages, and real-time latency.`,
    analogy: "A spectrogram turns sound into a picture, like sheet music written automatically from a performance: time runs left to right, pitch runs bottom to top, and the model reads the picture instead of the raw vibration.",
    visualExample: "In a video call, live captions appear under each speaker with roughly a one-second delay: the audio stream is sliced into chunks, each chunk becomes a spectrogram, and an ASR model emits words as it goes.",
  },

  whisper: {
    explanation: `**Whisper** is OpenAI's open-source speech recognition model, trained on 680,000 hours of multilingual audio from the web. It transcribes speech in dozens of languages, translates non-English speech directly into English text, and handles accents and background noise more robustly than most systems because of its diverse training data. It is an encoder-decoder Transformer operating on audio spectrograms, released in sizes from tiny (runs on a laptop CPU) to large. Choose Whisper when you want free, self-hosted, offline-capable transcription with strong multilingual accuracy; choose a commercial API instead when you need real-time streaming or word-level timestamps out of the box.`,
    analogy: "Whisper is a transcriptionist who has listened to the entire internet: rarely fazed by accents, noise, or language switching, because it has heard it all before.",
    visualExample: "A podcaster drags a one-hour MP3 into a Whisper-based tool and gets a full transcript with sentence timestamps a few minutes later, running entirely on their own machine.",
  },

  chirp: {
    explanation: `**Chirp** is Google's foundation model for speech-to-text, offered through Google Cloud's Speech-to-Text API and covering more than 100 languages. It was trained with self-supervised learning on millions of hours of audio, which lets a single model serve many languages, including lower-resource ones, rather than requiring one model per language. Choose Chirp when you are already on Google Cloud and need managed, scalable transcription with broad language coverage and no infrastructure to run yourself.`,
    visualExample: "A global video platform sends uploads in Hindi, Swahili, and Portuguese to the same Chirp-backed API endpoint and receives transcripts for all three without configuring separate models.",
  },

  "seamless-m4t": {
    explanation: `**SeamlessM4T** is Meta's massively multilingual, multimodal translation model. One model handles four directions: speech-to-text, speech-to-speech, text-to-speech, and text-to-text translation, across roughly 100 languages. Its distinguishing capability is direct speech-to-speech translation without chaining separate recognition, translation, and synthesis systems, which reduces compounding errors between stages. Choose it when you need open-weight, many-to-many speech translation, such as building a voice translation feature that hears one language and speaks another.`,
    visualExample: "A traveler speaks a question in English into a SeamlessM4T demo and the model plays back the same question spoken in Japanese, one model performing the whole conversion.",
  },

  audiocraft: {
    explanation: `**AudioCraft** is Meta's open-source library for generative audio, bundling three models: MusicGen for text-to-music, AudioGen for text-to-sound-effects, and EnCodec, a neural codec that compresses audio into discrete tokens the generators work with. You describe audio in text ('upbeat acoustic folk with hand claps') and the model generates a matching clip. Choose AudioCraft when you want free, self-hosted, research-friendly music or sound generation you can fine-tune; choose a commercial service when you need longer, production-polished tracks with licensing handled.`,
    visualExample: "A game developer types 'wind howling through a stone corridor' into AudioGen and gets several seconds of usable ambient sound without recording anything.",
  },

  elevenlabs: {
    explanation: `**ElevenLabs** is a commercial platform for neural text-to-speech and voice cloning. Its models produce speech with natural intonation and emotional range across dozens of languages, and can clone a specific voice from a short sample of recorded audio. The product is API-first, with tooling for audiobook narration, video dubbing that preserves the original speaker's voice across languages, and low-latency conversational voice agents. Choose ElevenLabs when voice quality is the priority and a paid hosted API is acceptable; choose an open-source TTS model when you need self-hosting or zero per-character costs.`,
    visualExample: "An author uploads ten minutes of their own narration, and ElevenLabs generates the remaining twelve hours of their audiobook in a voice listeners cannot distinguish from the sample.",
  },

  speechmatics: {
    explanation: `**Speechmatics** is a UK-based speech technology company offering ASR across 55+ languages, in both real-time streaming and batch modes, plus APIs for building voice agents. Its emphasis is accuracy across accents and dialects: models are trained with self-supervised learning on large amounts of unlabeled audio, which the company positions as reducing accent and demographic bias in transcription. Choose Speechmatics when you need enterprise ASR that performs consistently across diverse speakers, or low-latency streaming transcription with speaker diarization for live captioning and contact centers.`,
    visualExample: "A contact center streams live calls to Speechmatics and sees each conversation transcribed in real time with 'Agent' and 'Customer' labels attached to every line.",
  },

  multimodal: {
    explanation: `**Multimodal AI** builds single models that handle several data types together: text, images, audio, and video. Instead of one model per modality with glue code between them, a multimodal model can look at a chart and answer questions about it, watch a video and summarize it, or hear a voice note and draft a reply.

The core mechanism is a **shared representation space**. Each modality gets an encoder that converts its raw form into token-like vectors: image patches, audio frames, and text tokens all become sequences the same Transformer can attend over. Training on paired data, such as images with captions, teaches the model to align modalities, so the vector for a photo of a dog lands near the vector for the words describing it. CLIP pioneered this alignment for image-text pairs; modern frontier models like GPT-4V and Gemini extend it to interleaved text, images, audio, and video in one context window.

Multimodality matters because real tasks rarely arrive as pure text. Reading a screenshot of an error, interpreting a medical scan alongside patient notes, or following a spoken instruction while watching a camera feed all require crossing modalities. It is also the prerequisite for capable robots and assistants that perceive the world rather than just its textual descriptions.`,
    analogy: "A text-only model is like a brilliant correspondent you can only reach by letter; a multimodal model is like meeting them in person, where you can also show them a photo, play them a recording, and point at things.",
    visualExample: "You photograph a rental car's dashboard warning light and ask 'can I keep driving?'; the model reads the icon from the image, identifies it as low tire pressure, and answers in text.",
  },

  genai: {
    explanation: `**Generative AI** refers to models that create new content, such as text, images, audio, video, or code, rather than assigning labels to existing content. A classifier looks at an email and outputs 'spam'; a generative model writes the email. The category spans large language models, diffusion image generators, music models, and video models.

Under the hood, generative models learn the **probability distribution** of their training data and then sample from it. Language models factor this as next-token prediction: generate one token, append it, predict the next, thousands of times. Diffusion models take a different route for images, learning to reverse a gradual noising process so that generation starts from pure random noise and denoises step by step into a coherent picture. In both cases the model is not retrieving stored examples; it is composing new samples that follow the statistical patterns it learned.

The distinction from discriminative AI matters practically. Generation unlocks drafting, coding, design, and synthesis use cases that classification never could, which is why it triggered the current wave of AI adoption. It also introduces new failure modes: outputs can be fluent but wrong (hallucination), training-data provenance becomes a legal question, and evaluating open-ended quality is far harder than measuring classification accuracy.`,
    analogy: "A discriminative model is an art critic who can tell a Monet from a forgery; a generative model is a painter who studied thousands of Monets and can now produce new scenes in that style, sometimes convincingly and sometimes with a bridge floating in the sky.",
    visualExample: "Given the prompt 'a watercolor of a lighthouse in fog', a diffusion model starts from a canvas of static and, over a few dozen denoising steps, an image of a lighthouse gradually emerges.",
  },

  recsys: {
    explanation: `**Recommender systems** predict what a user will want next: which video to watch, product to buy, song to play, or post to read. They power the feeds and suggestion shelves of nearly every large consumer platform, and for companies like Netflix, YouTube, and Amazon they drive a substantial share of all engagement and revenue.

The classic technique is **collaborative filtering**: users who behaved similarly in the past will like similar things in the future. Matrix factorization implements this by learning an embedding vector for every user and every item, such that their dot product predicts the interaction; recommendation becomes finding items whose vectors are closest to yours. Content-based methods instead match item attributes to a user profile, and modern production systems are hybrids, typically a fast candidate-retrieval stage that narrows millions of items to hundreds, followed by a neural ranking model that scores each candidate with rich features.

Recommenders matter as the most economically consequential deployed ML, and as a case study in feedback loops. The system's own suggestions shape the future behavior it trains on, which can narrow what users see (filter bubbles) and amplify popularity biases. Cold-start users and items, offline metrics that disagree with online outcomes, and balancing engagement against long-term satisfaction are the enduring hard problems.`,
    analogy: "Collaborative filtering works like a record-store clerk who never listens to music but has watched every purchase for years: they recommend by noticing that people who bought what you bought almost always come back for one particular album.",
    visualExample: "Netflix's row 'Because you watched Dark' is a candidate-retrieval query: shows whose learned embedding vectors sit closest to Dark's in the model's space, re-ranked by your personal watch history.",
  },

  timeseries: {
    explanation: `**Time series and forecasting** is the modeling of measurements ordered in time: sales per day, server load per minute, temperatures per hour, heartbeats per second. The two core tasks are forecasting (predicting future values) and anomaly detection (flagging when the present deviates from expected patterns).

What makes time series distinct is their internal structure: **trend** (long-term drift), **seasonality** (repeating cycles, like weekly shopping patterns), and autocorrelation (each value depends on recent ones). Classical statistical methods like ARIMA and exponential smoothing model these components explicitly and remain strong baselines, especially with limited data. Machine learning approaches, from gradient boosting on lag features to recurrent networks and Transformers, can learn richer nonlinear patterns and share learning across thousands of related series, and pretrained time-series foundation models now offer zero-shot forecasting.

Forecasting matters because nearly every operational decision leans on a guess about the future: how much inventory to stock, how many servers to provision, how much energy the grid will need. A distinctive discipline of the field is honest evaluation: models must be validated on time-ordered splits (train on the past, test on the future), because random shuffling leaks future information and produces accuracy that evaporates in production.`,
    analogy: "Forecasting a time series is like predicting tomorrow's tide: you decompose what you see into a slow drift, a reliable daily rhythm, and short-lived ripples, then project each component forward with appropriate confidence.",
    visualExample: "A retailer's demand chart shows a rising baseline, sharp spikes every December, and a weekly weekend bump; the forecast extends all three patterns and widens its uncertainty band the further into the future it reaches.",
  },

  robotics: {
    explanation: `**Robotics and control** is AI applied to perception and action in the physical world: robot arms assembling products, warehouse robots navigating aisles, drones, and autonomous vehicles. It closes the loop that purely digital AI leaves open, since the system's outputs are physical motions with real consequences.

A robot runs a continuous **sense-plan-act loop**. Sensors (cameras, lidar, joint encoders) feed a perception system that estimates the state of the world; a planner or learned policy decides what to do; controllers translate the decision into motor commands, many times per second. Learning enters in several ways: reinforcement learning trains policies through trial and error, usually in simulation first because real-world failures break hardware; imitation learning trains from human demonstrations; and recent vision-language-action models bring foundation-model generality to manipulation, letting robots follow natural-language instructions.

Robotics is hard in ways that distinguish it from the rest of AI. The **sim-to-real gap** means policies trained in simulation degrade on physical hardware where friction, latency, and lighting differ. Data is expensive because every trial takes real time on a real machine. And safety is unforgiving: a hallucinating chatbot produces a bad paragraph, while a hallucinating robot arm can break things or hurt people. This is why robotics progress trails language-model progress despite using much of the same machinery.`,
    analogy: "Training a robot only in simulation is like learning to drive exclusively in a video game: the rules transfer, but the first time real rain, worn tires, and glare show up, the learned reflexes need recalibrating.",
    visualExample: "A warehouse picking robot looks into a cluttered bin, its vision model outlines each item, a grasp planner selects a gripper pose for the top object, and the arm executes the pick, repeating the loop for every order.",
  },

  governance: {
    explanation: `**Alignment, safety, and governance** is the umbrella for making AI systems behave as intended: pursuing the goals we mean (alignment), avoiding harm (safety), being understandable (interpretability), treating people equitably (fairness), respecting data rights (privacy), and complying with law and policy (regulation).

These concerns operate at different layers. Technical work happens inside the model: preference training like RLHF, red-teaming to find failure modes, interpretability research to explain decisions, and privacy-preserving training methods. Procedural work happens around the model: evaluations before release, documentation like model cards, incident monitoring, and access controls. Legal work happens above both: regulations such as the EU AI Act impose binding requirements based on how risky an application is.

This area matters more as capability grows, because the cost of misbehavior scales with what systems are trusted to do. A model that only autocompletes text can fail cheaply; a model approving loans, advising doctors, or acting autonomously as an agent cannot. Every serious deployment now involves this branch, and it is where AI research meets ethics, law, and public policy most directly.`,
    analogy: "Governance for AI is like the full safety system around aviation: engineering the plane to be airworthy (alignment and safety), instrumenting it so failures can be diagnosed (interpretability), and regulating who may fly what, where (policy). No single layer suffices alone.",
    visualExample: "Before a bank deploys a credit model, it runs fairness audits across demographic groups, documents the model in a model card, has a red team probe for failure modes, and files the system under the EU AI Act's high-risk requirements.",
  },

  alignment: {
    explanation: `**Alignment** is the problem of getting AI systems to pursue the goals humans actually intend, rather than a literal, exploitable version of what we asked for. A model trained purely to predict the next token has no built-in preference for being honest, harmless, or helpful; alignment techniques add that preference after the fact.

The standard pipeline has stages. Supervised fine-tuning first teaches the model the format of helpful responses from curated examples. Then preference optimization, via **RLHF** (reinforcement learning from human feedback) or the simpler DPO, trains the model on human judgments of which of two responses is better, shifting its outputs toward what people prefer. Constitutional AI extends this by having the model critique its own outputs against written principles, reducing dependence on human labelers.

The hard part is that these methods optimize proxies. Human raters can be fooled by confident-sounding answers, so a model can learn to seem helpful rather than be helpful, a failure called reward hacking; models may also become sycophantic, telling users what they want to hear. Alignment matters today because it is the difference between a raw text predictor and a usable assistant, and it matters for the future because the more autonomy we grant AI systems, the more costly any gap between what they optimize and what we intend.`,
    analogy: "Alignment is like the genie problem: the danger is not that the genie disobeys, but that it obeys the exact words of the wish instead of its spirit. Alignment work tries to make the system want the spirit.",
    visualExample: "During RLHF, a labeler sees two model answers to 'my medication makes me dizzy, should I stop taking it?': one gives blunt instructions, one urges consulting the prescribing doctor while explaining the risk. The labeler picks the second, and thousands of such choices shape the model's behavior.",
  },

  interp: {
    explanation: `**Interpretability** is the effort to understand why a model produced a given output. Deep networks are functions with billions of parameters and no human-readable structure, so their reasoning is opaque by default; interpretability builds tools to open the box.

The field splits into two approaches. **Attribution methods** like SHAP and LIME explain individual predictions from the outside: they measure how much each input feature contributed to the output, for instance showing that a loan denial was driven mostly by debt-to-income ratio. **Mechanistic interpretability** works from the inside, reverse-engineering the network itself: identifying circuits of neurons that implement specific behaviors and using tools like sparse autoencoders to decompose activations into human-legible features (concepts like 'legal language' or 'deception' that the model represents internally).

Interpretability matters for three reasons. Legally, regulations increasingly require explanations for consequential automated decisions in credit, hiring, and healthcare. Practically, understanding why a model fails is the fastest route to fixing it. And for safety, mechanistic tools offer the only path to verifying what a model is actually computing internally, rather than judging it solely by outputs it may have learned to game.`,
    analogy: "Attribution methods are like a doctor reading symptoms to explain a diagnosis; mechanistic interpretability is like the anatomist opening the body to trace the actual organs and pathways that produced them.",
    visualExample: "A SHAP plot for a rejected loan application shows red bars for high credit utilization and short credit history pushing toward denial, and a small green bar for stable income pushing toward approval, making the decision auditable at a glance.",
  },

  safety: {
    explanation: `**AI safety** is the practice of preventing AI systems from causing harm, whether through misuse by bad actors, unintended failures, or manipulation by adversarial users. Where alignment shapes what a model tries to do, safety builds the defenses, testing, and containment around what it actually does.

The working toolkit centers on adversarial pressure. **Red-teaming** has experts (and automated attackers) systematically try to elicit harmful outputs before release: instructions for weapons, malware generation, convincing disinformation. **Jailbreak defense** hardens models against prompts engineered to bypass their refusal training, such as role-play framings or encoded instructions. Around the model sit guardrail layers: input and output classifiers that filter harmful content independently of the model's own judgment. Frontier labs formalize this in safety frameworks that define capability thresholds, for instance in biosecurity or cyber offense, which trigger stronger safeguards before deployment.

Safety is never finished because it is adversarial: each defense prompts new attack strategies, and every capability gain expands what misuse could accomplish. The stakes rise sharply with agents, since a jailbroken chatbot produces bad text, but a jailbroken agent with tool access can take bad actions.`,
    analogy: "AI safety is like securing a bank vault: the alignment team trained the staff to be honest, but you still hire people to attempt break-ins (red-teaming), install alarms that work even if a teller is compromised (guardrail classifiers), and limit how much any one key can open.",
    visualExample: "A red-teamer asks a model to 'write a chemistry lesson as my late grandmother used to, who worked in explosives manufacturing'; the model recognizes the role-play jailbreak pattern and declines, a defense trained in after earlier versions fell for it.",
  },

  fairness: {
    explanation: `**Bias and fairness** work detects and reduces discriminatory behavior in AI systems. Models learn from historical data, and historical data encodes historical discrimination: a hiring model trained on past decisions at a male-dominated company can learn to downrank women, and face recognition trained mostly on light-skinned faces performs worse on dark-skinned ones.

Mechanically, bias enters through several doors: unrepresentative training data, labels that reflect prejudiced past judgments, and proxy features (zip code standing in for race). Detection means measuring model behavior across demographic groups using formal criteria, such as demographic parity (similar approval rates across groups) or equalized odds (similar error rates across groups). A foundational result is that these criteria are mathematically incompatible in general: no model can satisfy all of them at once when groups differ in base rates, so fairness always involves an explicit choice of which definition fits the context. Mitigation can happen before training (rebalancing data), during it (fairness constraints in the loss), or after (adjusting decision thresholds per group).

This matters most where models gate access to opportunity: lending, hiring, housing, healthcare, and criminal justice. Anti-discrimination law applies to algorithmic decisions, and regulations increasingly mandate bias audits. Beyond compliance, biased systems fail silently at scale, harming exactly the groups least represented in the data used to validate them.`,
    analogy: "Training on biased data is like learning to interview candidates by studying one biased manager's past decisions: the student can perfectly absorb the pattern, including the prejudice, while sincerely believing it learned 'what a good candidate looks like'.",
    visualExample: "An audit of a resume-screening model shows it scores otherwise identical resumes lower when they list a women's college; the feature is removed and the model retrained, and the audit is rerun to confirm the gap closed.",
  },

  privacy: {
    explanation: `**Privacy** in AI is about protecting personal data across the model lifecycle: the data collected for training, what the model memorizes, and what users reveal during use. Models can memorize training examples verbatim, and researchers have extracted names, emails, and phone numbers from language models with crafted prompts, so training on personal data creates leakage risk even after the data itself is deleted.

Two techniques anchor the technical toolkit. **Differential privacy** adds calibrated noise during training so that the trained model is provably almost identical whether or not any single person's data was included, capping what an attacker can infer about any individual; the privacy budget (epsilon) quantifies the guarantee and trades off against accuracy. **Federated learning** keeps raw data on user devices: each phone computes model updates locally and only the updates, not the data, are aggregated centrally. It is how mobile keyboards improve suggestions without uploading what anyone typed. The two combine, since model updates can themselves leak and can be noised.

Privacy matters because regulation demands it (GDPR and similar laws grant deletion and consent rights that memorizing models complicate) and because entire domains, such as healthcare and finance, cannot use AI at all without credible privacy guarantees. Attacks like membership inference, determining whether a specific person's record was in the training set, are the benchmark these defenses are measured against.`,
    analogy: "Differential privacy is like publishing survey results after every respondent secretly flips a coin and sometimes lies: the aggregate statistics stay accurate, but no one can ever prove what any individual actually answered.",
    visualExample: "Your phone's keyboard learns that you often type a niche technical term and starts suggesting it, yet the term never leaves your device: federated learning sent only an abstract weight update to the server.",
  },

  hallucination: {
    explanation: `**Hallucination** is when a model produces confident but false output: a fabricated citation, a nonexistent API function, a wrong date delivered in perfect prose. The defining danger is the mismatch between fluency and truth, since the output reads exactly as authoritative as a correct answer.

Hallucination is a structural consequence of how language models work. A model is trained to produce plausible continuations of text, not verified facts; when the needed fact is missing, rare, or blurred across its weights, the statistically plausible completion is still generated. Training and evaluation historically rewarded answering over abstaining, teaching models to guess rather than say 'I don't know'. Hallucinations concentrate at the edges of the model's knowledge: obscure entities, events after the training cutoff, precise numbers, and citations.

Mitigation is layered, not solved. **RAG** grounds answers in retrieved documents so the model works from provided text instead of memory. Instructing models to cite sources makes claims checkable. Confidence calibration and abstention training teach models to decline when unsure, and separate verifier models or self-consistency checks catch some errors. Understanding hallucination matters for anyone deploying LLMs: it defines which tasks are safe for automation and which require retrieval grounding or human review.`,
    analogy: "A hallucinating model is like a student who never says 'I don't know' on an exam: trained by years of grading that rewards attempts over blanks, they write a fluent, confident, wrong answer instead.",
    visualExample: "A lawyer asks a chatbot for supporting precedents and receives six case citations with realistic names, dates, and docket numbers; two of the cases do not exist, which a judge discovers when the brief is filed.",
  },

  regulation: {
    explanation: `**Governance and regulation** covers the policies, laws, and documentation practices that make AI development accountable. It spans binding law, voluntary standards, and internal artifacts that record what a model is and how it should be used.

The landmark law is the **EU AI Act**, the first comprehensive AI statute, which sorts systems by risk tier: unacceptable-risk uses (like social scoring) are banned, high-risk uses (hiring, credit, medical devices) face requirements for risk management, data quality, human oversight, and documentation, and general-purpose models above a compute threshold carry transparency and safety obligations. Around such laws sit softer instruments: the NIST AI Risk Management Framework, ISO standards, and sector rules applied by existing agencies.

The documentation layer is where governance meets engineering. **Model cards** record a model's intended use, training data, evaluation results, and known limitations; datasheets do the same for datasets; audit trails record how a deployed system behaves over time. This matters practically because obligations increasingly bind anyone deploying AI in consequential domains, with real penalties, and because documentation is what makes every other governance goal (fairness audits, incident response, liability) actually executable.`,
    analogy: "AI regulation works like pharmaceutical regulation: risky products require trials and evidence before release, every product carries a label stating what it is for and its side effects (the model card), and problems after release must be tracked and reported.",
    visualExample: "A model card for a speech recognition system states it was evaluated on adult speech in ten languages, reports lower accuracy on children's voices, and warns against use in emergency dispatch, letting a would-be deployer see the mismatch before shipping.",
  },
};
