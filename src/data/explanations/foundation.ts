import type { RichContent } from "../types";

/** Authored explanations for foundation-model nodes, keyed by taxonomy node id. */
export const FOUNDATION_EXPLANATIONS: Record<string, RichContent> = {
  foundation: {
    explanation: `A **foundation model** is a single large neural network trained once on an enormous, broad dataset, then reused as the starting point for many different tasks. Instead of building a separate model for translation, summarization, coding, and question answering, you train one general model and adapt it with prompting, fine-tuning, or retrieval. The term covers large language models, vision-language models, embedding models, and their smaller edge-sized relatives.

Mechanically, most foundation models are Transformers trained with self-supervised learning: the training data provides its own labels, such as predicting the next token in a sentence or matching an image to its caption. Because no human labeling is required, training can consume trillions of tokens scraped from the web, books, and code. During this pretraining phase the model is forced to compress patterns of language, facts, and reasoning into its weights. A second, much cheaper phase (instruction tuning, RLHF, or similar) then shapes the raw predictor into a usable assistant.

The idea matters because it changed the economics of AI. Before foundation models, every application needed its own labeled dataset and its own training run. Now one expensive pretraining run is amortized across thousands of downstream uses, and most application work happens above the model: writing prompts, adding retrieval, or attaching tools. The trade-off is concentration of capability in a handful of large models, which makes questions of access (open weights versus API-only) and adaptation cost central to choosing one.`,
    analogy:
      "A foundation model is like a broadly educated new hire: years of general schooling happen once, and then a short onboarding adapts that general knowledge to whatever specific job needs doing.",
    visualExample:
      "Picture a funnel: trillions of web pages, books, and code files pour in at the top, get compressed into one set of weights in the middle, and fan out at the bottom into chatbots, coding assistants, search engines, and translation tools.",
  },

  llms: {
    explanation: `**Large language models (LLMs)** are foundation models specialized in text. They take a sequence of tokens (word pieces) as input and repeatedly predict the most likely next token, generating text one token at a time. Everything an LLM does, from answering questions to writing code, is expressed through this single next-token interface.

Almost all modern LLMs are decoder-only Transformers. Input text is split into tokens, each token becomes a vector via an embedding layer, and dozens of stacked Transformer blocks let every token attend to every earlier token. The final layer produces a probability distribution over the vocabulary, and a sampling rule picks the next token. Scale is the defining ingredient: models with tens or hundreds of billions of parameters, trained on trillions of tokens, develop abilities like multi-step reasoning and in-context learning that smaller models mostly lack.

A raw pretrained LLM only continues text; it does not naturally follow instructions. Post-training turns it into an assistant: supervised fine-tuning on instruction and response pairs, then preference tuning (RLHF or DPO) to make outputs helpful and safe. When choosing among LLMs, the practical axes are capability, cost per token, context window length, latency, and whether the weights are open (self-hostable) or closed (API-only).`,
    analogy:
      "An LLM is like an extremely well-read autocomplete: it has seen so much text that completing 'the next word' correctly forces it to internalize grammar, facts, and even reasoning patterns.",
    visualExample:
      "Type 'The capital of France is' and watch the model assign high probability to the token 'Paris'; chain thousands of such predictions together and you get an essay, a program, or a conversation.",
  },

  gpt: {
    explanation: `The **GPT family** is OpenAI's line of frontier language models, available only through OpenAI's API and products rather than as downloadable weights. The family popularized decoder-only Transformers at scale and the chat interface most people now associate with AI. Current versions handle text, images, and audio, support long contexts, and offer tiers that trade capability against cost and speed (for example larger flagship variants alongside cheaper, faster ones). Choose GPT when you want broad, well-rounded capability, mature tooling and function calling, and a large ecosystem of integrations, and when API-only access and usage-based pricing fit your constraints.`,
    visualExample:
      "A developer sends a JSON request with a conversation history to the OpenAI API and receives the assistant's next message, paying per input and output token.",
  },

  claude: {
    explanation: `The **Claude family** is Anthropic's line of frontier closed models, accessed via API and products like Claude Code. Anthropic emphasizes careful post-training for helpfulness and safety, and recent generations are tuned heavily for agentic work: long multi-step tasks, tool use, and software engineering, where the model plans, calls tools, checks results, and keeps going. The family spans larger flagship models and faster mid-sized ones. Choose Claude when your workload is agentic or coding-centric, when you want long documents handled in one context window, or when careful instruction-following on nuanced tasks matters more than raw price.`,
    visualExample:
      "An engineer points Claude at a failing test suite; the model reads the code, edits three files, reruns the tests, and reports the fix, all in one continuous session.",
  },

  gemini: {
    explanation: `The **Gemini family** is Google's line of frontier models, built multimodal from the start: text, images, audio, and video are handled natively rather than bolted on. Gemini models are known for very long context windows, which lets them ingest entire codebases, hours of video, or large document collections in a single request. They ship in tiers (Pro for capability, Flash for speed and cost) and integrate tightly with Google Cloud and Google's consumer products. Choose Gemini when your task involves mixed media, when extreme context length removes the need for retrieval pipelines, or when you are already building on Google's stack.`,
    visualExample:
      "A user uploads a one-hour lecture video and asks for a timestamped summary; the model processes the full video and transcript in one context window without chunking.",
  },

  llama: {
    explanation: `The **Llama family** is Meta's line of open-weight language models, the most widely adopted Western alternative to closed frontier APIs. The weights are downloadable under a permissive license, which means you can run them on your own hardware, fine-tune them on private data, and ship them without per-token fees. Llama's popularity created a large ecosystem: most local runtimes, quantization formats, and fine-tuning tutorials target it first. Choose Llama when you need data to stay on your infrastructure, want full control over fine-tuning, or want to build on the largest open-model community, accepting somewhat lower peak capability than the best closed models.`,
    visualExample:
      "A hospital downloads Llama weights, fine-tunes on internal clinical notes, and serves the model entirely inside its own network so patient data never leaves the building.",
  },

  mistral: {
    explanation: `**Mistral** is a French AI lab that publishes both open-weight models and closed commercial ones, making it Europe's most prominent frontier-model company. Its early open releases were notable for strong capability at small parameter counts, and it helped popularize the mixture-of-experts architecture in open models with Mixtral. The commercial tier (such as Mistral Large) competes with other closed APIs. Choose Mistral when you want efficient open weights for self-hosting, a European vendor for data-residency or regulatory reasons, or a middle path between fully open and fully closed ecosystems.`,
    visualExample:
      "A European fintech picks Mistral's hosted API specifically so its contracts, data processing, and model provider all stay under EU jurisdiction.",
  },

  "open-frontier": {
    explanation: `**Open and Chinese frontier models** are open-weight releases, largely from Chinese labs such as Alibaba (Qwen), DeepSeek, and Zhipu (GLM), that compete directly with Western closed flagships rather than trailing them. Several of these models match or approach top closed models on reasoning and coding benchmarks while publishing their weights, and often their training techniques, openly. This category matters because it broke the assumption that frontier capability requires a closed API: you can now self-host near-frontier models. Choose them when you want maximum capability per dollar under your own control, and weigh that against licensing terms, hardware requirements, and any organizational policies about model provenance.`,
    visualExample:
      "A startup benchmarks a closed API against a self-hosted open frontier model on its own tasks and finds comparable quality at a fraction of the per-token cost.",
  },

  "deepseek-models": {
    explanation: `The **DeepSeek family** consists of open-weight models from the Chinese lab DeepSeek, best known for strong reasoning and coding ability delivered at unusually low training and inference cost. DeepSeek V3 is a large mixture-of-experts general model, and DeepSeek R1 is a reasoning model trained with reinforcement learning to produce explicit chain-of-thought before answering; R1's openly published training recipe influenced reasoning work across the field. Choose DeepSeek when you want open weights with frontier-level reasoning or coding performance, particularly for math, logic, and software tasks, and self-hosting or low-cost API access matters.`,
    visualExample:
      "Given a competition math problem, DeepSeek R1 emits a long visible chain of intermediate reasoning steps before committing to the final boxed answer.",
  },

  "qwen-models": {
    explanation: `The **Qwen family** is Alibaba's line of open-weight models, notable for its breadth: general chat models, coding specialists (Qwen3-Coder), vision-language models (Qwen3-VL), and translation models (Qwen3-MT), released across a wide range of sizes from sub-billion to very large. Qwen models consistently rank among the strongest open weights, with particular strength in multilingual and Chinese-language tasks. Choose Qwen when you need a full lineup of open models under one architecture family, want strong multilingual coverage, or need a specific size point (edge to server) without switching vendors.`,
    visualExample:
      "A team standardizes on Qwen, running a 4B variant on mobile devices and a large variant on servers, sharing one tokenizer and prompt format across both.",
  },

  "cohere-models": {
    explanation: `The **Cohere Command family** is a line of closed LLMs aimed squarely at enterprise use rather than consumer chat. Command R models are optimized for retrieval-augmented generation, with built-in citation of source documents, and Cohere pairs them with first-party embedding and reranking models so the whole RAG pipeline comes from one vendor. Deployment options include private clouds and on-premises installs. Choose Cohere when you are building enterprise search or RAG over internal documents, need grounded answers with citations, and prefer a single accountable vendor for generation, embedding, and reranking.`,
    visualExample:
      "An employee asks an internal assistant about vacation policy; Command R retrieves the HR handbook, answers, and cites the exact paragraph it drew from.",
  },

  "falcon-models": {
    explanation: `The **Falcon family** comes from the Technology Innovation Institute (TII) in Abu Dhabi and was among the first open-weight model lines to compete seriously with Western releases, demonstrating that frontier-adjacent AI development is not limited to the US and China. The lineup includes text models like Falcon 2 11B and a vision-language variant, released under permissive licenses. Choose Falcon when you want truly permissive open weights at moderate sizes, or when working in regions and organizations aligned with its ecosystem; for peak open-model capability, newer families often lead, so benchmark on your own task first.`,
    visualExample:
      "A researcher downloads Falcon 2 11B from Hugging Face and fine-tunes it on Arabic-language documents under its permissive license without negotiating terms.",
  },

  "granite-models": {
    explanation: `The **Granite family** is IBM's line of open LLMs, built for enterprise deployment through the watsonx platform. IBM's differentiator is provenance and governance: training data is documented and filtered for legal risk, and IBM offers indemnification for enterprise customers, which matters to legal and compliance teams more than leaderboard scores do. The models are modest in size and tuned for business tasks like summarization, classification, and code. Choose Granite when auditability of training data, vendor indemnification, and integration with existing IBM infrastructure outweigh the need for maximum raw capability.`,
    visualExample:
      "A bank's compliance team approves Granite for production because IBM documents the training data sources and contractually indemnifies the bank against IP claims.",
  },

  "phi-models": {
    explanation: `The **Phi family** is Microsoft's line of small language models built on a data-quality thesis: instead of scaling parameters, train compact models on carefully curated and synthetic "textbook-like" data. The result is models in the roughly 1B to 14B range that reason far better than their size suggests, with Phi-3-mini able to run on a phone. Choose Phi when you need real reasoning ability under tight compute, memory, or latency budgets, such as on-device assistants or high-volume cheap inference, and your task does not demand the breadth of knowledge that only larger models hold.`,
    visualExample:
      "Phi-3-mini runs locally on a laptop with no internet connection and still walks through a multi-step word problem correctly.",
  },

  "yi-models": {
    explanation: `The **Yi family** is a line of open-weight LLMs from 01.AI, the company founded by Kai-Fu Lee. Yi models are bilingual by design, trained deeply on both English and Chinese rather than treating one as an afterthought, and early releases ranked among the strongest open weights at their sizes with long-context variants available. Choose Yi when your application must perform well in both English and Chinese, or when you want capable open weights with strong multilingual grounding; as with all fast-moving open families, compare against current Qwen and DeepSeek releases for your specific task.`,
    visualExample:
      "A customer-support bot built on Yi handles a conversation that switches mid-thread from English to Chinese without losing context or quality.",
  },

  "grok-models": {
    explanation: `The **Grok family** is xAI's line of frontier models, distinguished mainly by its integration with X (formerly Twitter): Grok can draw on the live stream of posts, giving it access to breaking news and current discussion that models with fixed training cutoffs lack. The models are closed and served through X's products and an API, with a personality intentionally tuned to be less filtered than most assistants. Choose Grok when real-time awareness of current events and social conversation is central to your use case, or when you are building within the X ecosystem.`,
    visualExample:
      "Minutes after a product launch, a user asks Grok what people think of it, and the model summarizes reactions pulled from live X posts.",
  },

  "solar-models": {
    explanation: `The **Solar family** comes from the Korean company Upstage and targets a specific engineering constraint: strong performance on a single GPU. Upstage introduced depth up-scaling, a technique that grows a smaller pretrained model into a larger one without training from scratch, and Solar Pro is marketed explicitly as a single-GPU frontier-class model. Choose Solar when your deployment budget is one GPU per instance, when you need capable Korean and English performance, or when serving cost and simplicity of infrastructure matter more than absolute peak capability.`,
    visualExample:
      "A company serves Solar Pro on one 80GB GPU per node, avoiding the multi-GPU tensor-parallel setup that larger frontier models would require.",
  },

  "ai21-models": {
    explanation: `**AI21 Labs** is an Israeli lab whose current flagship, **Jamba**, is notable architecturally: it is a production-scale hybrid of Transformer attention layers and Mamba state-space layers, plus mixture-of-experts, giving it very long context windows with lower memory cost than pure attention. The earlier Jurassic-2 line was a conventional closed LLM family. Choose Jamba when you need to process very long inputs efficiently, such as entire contracts or books, and want to see the state-space approach in a supported commercial model; choose AI21 generally for its enterprise task-specific APIs around summarization and grounded answering.`,
    visualExample:
      "Jamba ingests a 200,000-token legal contract in one pass, its Mamba layers keeping memory use manageable where a pure Transformer's KV cache would balloon.",
  },

  vlm: {
    explanation: `**Multimodal models**, often called vision-language models (VLMs), extend the language-model interface to more than text: they accept images, audio, or video alongside words and reason over all of it in one pass. Ask one to describe a chart, read a handwritten note, or explain what is happening in a video clip, and it answers in text just as an LLM would.

The core mechanism is shared representation. A vision encoder (typically a Vision Transformer) slices an image into patches and turns each patch into a vector; a projection layer maps those vectors into the same embedding space the language model uses for word tokens. From the Transformer's point of view, image patches are just more tokens in the sequence, so the same attention machinery that relates words to words now relates words to image regions. Training aligns the two modalities using huge sets of paired data such as captioned images. Some models (like Gemini) are trained multimodal from the start; others (like LLaVA) graft a vision encoder onto an existing LLM.

VLMs matter because most real-world information is not clean text: screenshots, documents with layout, photos, diagrams, and video dominate practical workflows. They power document extraction, accessibility tools that describe images, UI-operating agents that read the screen, and visual question answering. Their common weak spots are fine-grained counting, precise spatial reasoning, and reading small dense text, so verify on your task before trusting them there.`,
    analogy:
      "A VLM is like a bilingual interpreter between sight and speech: it converts pictures into the same internal language as words, so the model can 'discuss' an image the way it discusses a sentence.",
    visualExample:
      "You paste a screenshot of a spreadsheet and ask which quarter had the highest revenue; the model reads the cells from pixels and answers in a sentence.",
  },

  "embed-models": {
    explanation: `**Embedding models** do not generate text at all. Their sole job is to convert an input, such as a sentence, document, image, or code snippet, into a fixed-length vector of numbers (often 384 to 3072 dimensions) positioned so that semantically similar inputs land close together. "How do I reset my password?" and "I forgot my login credentials" produce nearby vectors even though they share almost no words.

Most text embedding models are encoder-style Transformers: the input is tokenized, processed through attention layers, and the token representations are pooled into one vector. Training uses contrastive learning, where the model sees pairs that belong together (a question and its answer, a query and a clicked document) and pairs that do not, and learns to pull the first kind together and push the second apart in vector space. Similarity between two texts then reduces to a cheap mathematical operation, usually cosine similarity, between their vectors.

Embeddings are the connective tissue of modern AI systems. Semantic search, retrieval-augmented generation, recommendation, deduplication, clustering, and classification all reduce to "embed everything, then compare vectors," with vector databases handling the comparison at scale. Practical choices include vector dimensionality (bigger is more expressive but costlier to store and search), the model's domain fit (code versus prose versus multilingual), and the rule that documents and queries must be embedded by the same model to be comparable.`,
    analogy:
      "An embedding model is like assigning every piece of text GPS coordinates in a map of meaning: once everything has coordinates, finding related content is just finding the nearest points.",
    visualExample:
      "A support site embeds 10,000 help articles; when a user types a question, the system embeds it, finds the 5 nearest article vectors, and hands those articles to an LLM to compose the answer.",
  },

  slm: {
    explanation: `**Small language models (SLMs)** are compact LLMs, roughly 1B to 7B parameters, built to run where big models cannot: phones, laptops, browsers, and embedded devices. Architecturally they are ordinary decoder-only Transformers; what distinguishes them is deliberate engineering for a small footprint, since a 3B model quantized to 4 bits needs only about 2GB of memory and can generate tokens in real time on consumer hardware.

Three techniques do most of the work. Careful data curation lets a small model punch above its weight, on the evidence that a few billion parameters trained on high-quality filtered data beat much larger models trained carelessly. Knowledge distillation trains the small model to imitate a large teacher model's outputs. Quantization compresses the trained weights from 16-bit floats to 4-bit or 8-bit integers, shrinking memory several-fold with modest quality loss. Runtimes like llama.cpp and Ollama then execute these compressed models on CPUs, laptop GPUs, and phone accelerators.

SLMs matter wherever privacy, latency, cost, or connectivity rule out a cloud API: on-device assistants that never upload user data, offline field tools, and high-volume pipelines where per-token API fees would be prohibitive. The trade-off is real: less world knowledge, weaker multi-step reasoning, and more hallucination than frontier models. A common pattern is hybrid routing, where the local SLM handles routine requests and hard ones escalate to a large cloud model.`,
    analogy:
      "An SLM is like a pocket field guide versus a full library: it cannot cover everything, but it answers most everyday questions instantly, anywhere, with no connection required.",
    visualExample:
      "A phone keyboard suggests a reply to a text message using a 3B model running entirely on the device, with airplane mode on.",
  },

  gemma: {
    explanation: `**Gemma** is Google DeepMind's open-weight small model family, built with technology from the Gemini program and released in sizes from under 1B to about 27B parameters. Gemma models consistently rank among the strongest open weights at their size, and the family includes multimodal and multilingual variants along with strong integration into both Google's tooling and the broader open ecosystem. Choose Gemma when you want near-frontier quality per parameter in a self-hostable small model, whether for on-device use at the small end or a capable single-GPU server model at the large end.`,
    visualExample:
      "A developer pulls Gemma with a single Ollama command and gets a capable local chat model running on a laptop in under a minute.",
  },

  openelm: {
    explanation: `**OpenELM** is Apple's family of open Transformer language models, released in sizes from 270M to 3B parameters and aimed at on-device inference. Its distinguishing technique is layer-wise scaling, which allocates more parameters to later Transformer layers instead of sizing every layer identically, improving accuracy per parameter. Apple published not just weights but the full training recipe and framework, making it unusually reproducible, and provided code for running on Apple silicon. Choose OpenELM for research into efficient small models or for experimentation on Apple hardware; for production assistants, larger or more heavily tuned small models usually perform better.`,
    visualExample:
      "A researcher reruns OpenELM's published training recipe end to end to study how layer-wise scaling changes accuracy at a fixed parameter budget.",
  },

  tinyllama: {
    explanation: `**TinyLlama** is a community open-source project that trained a 1.1B-parameter model using the Llama 2 architecture and tokenizer on roughly 3 trillion tokens, far more data per parameter than scaling heuristics suggest. The result is one of the most capable models at the 1B scale, and because it shares Llama's architecture, the entire Llama tool ecosystem works with it unchanged. Choose TinyLlama when hardware is severely constrained (older phones, single-board computers, browser deployment), when you need a cheap draft model for speculative decoding, or as a fast base for fine-tuning experiments.`,
    visualExample:
      "TinyLlama runs as the small draft model in a speculative decoding setup, proposing tokens that a much larger Llama model verifies in batches to speed up generation.",
  },

  stablelm: {
    explanation: `**StableLM** is Stability AI's family of compact open language models, from the company best known for Stable Diffusion. The line spans roughly 1.6B to 12B parameters, with the Zephyr variants chat-tuned using direct preference optimization, and it extends Stability's open-release approach from images to text. Choose StableLM when you want a permissively usable small model for on-device or hobbyist projects, or when already working within Stability's model ecosystem; for the strongest current small-model performance, compare it against Gemma, Phi, and Qwen at the same size before committing.`,
    visualExample:
      "A hobbyist runs the 1.6B StableLM Zephyr chat model on a Raspberry Pi-class device to power a small offline voice assistant.",
  },
};
