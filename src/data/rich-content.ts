import type { RichContent } from "./types";

/** Rich learning content keyed by taxonomy node id (20+ key concepts). */
export const RICH_BY_NODE_ID: Record<string, RichContent> = {
  transformer: {
    analogy:
      "Think of a Transformer like a conference room where every participant can listen to everyone else at once, take notes on who matters most, and update their understanding in parallel — instead of passing a message down a single chain.",
    diagram: `flowchart LR
      IN[Input Tokens] --> EMB[Embeddings + Positional Encoding]
      EMB --> BLK[Transformer Blocks x N]
      BLK --> OUT[Output Predictions]
      subgraph block [One Block]
        ATTN[Multi-Head Attention]
        FFN[Feed-Forward Network]
        ATTN --> FFN
      end`,
    dataFlow: [
      { from: "Token IDs", to: "Embedding vectors", label: "lookup" },
      { from: "Embeddings", to: "Attention layers", label: "Q, K, V projections" },
      { from: "Attention output", to: "Feed-forward", label: "per-token MLP" },
      { from: "Final hidden state", to: "Vocabulary logits", label: "softmax" },
    ],
    walkthrough: [
      {
        step: 1,
        title: "Tokenize the input",
        body: "Raw text is split into subword tokens and mapped to integer IDs from a fixed vocabulary.",
      },
      {
        step: 2,
        title: "Embed and position",
        body: "Each token ID becomes a dense vector; positional encoding tells the model where each token sits in the sequence.",
      },
      {
        step: 3,
        title: "Stack attention blocks",
        body: "Repeated blocks apply self-attention (global context) then a feed-forward network (local computation) with residual connections.",
        formula: "x_{l+1} = x_l + \\text{FFN}(x_l + \\text{Attention}(x_l))",
      },
      {
        step: 4,
        title: "Predict the next token",
        body: "The final layer outputs a probability distribution over the vocabulary for autoregressive models like GPT.",
      },
    ],
    visualExample:
      "GPT-4 reading your prompt: every word attends to every other word in parallel, so \"bank\" disambiguates between river and finance based on distant context like \"deposit\" or \"river\".",
  },
  attention: {
    analogy:
      "Attention is like highlighting the most relevant sentences in a textbook before answering a question — each word asks \"who should I pay attention to?\" and weights the answer accordingly.",
    diagram: `flowchart TB
      Q[Query: what am I looking for?]
      K[Key: what do I offer?]
      V[Value: my content]
      Q --> SCORE[Similarity Q·K]
      K --> SCORE
      SCORE --> SOFT[Softmax weights]
      SOFT --> OUT[Weighted sum of V]
      V --> OUT`,
    dataFlow: [
      { from: "Input X", to: "Q, K, V matrices", label: "linear projections" },
      { from: "Q and K", to: "Attention scores", label: "dot product / sqrt(d_k)" },
      { from: "Scores", to: "Weights", label: "softmax" },
      { from: "Weights + V", to: "Output", label: "weighted sum" },
    ],
    walkthrough: [
      {
        step: 1,
        title: "Project into Q, K, V",
        body: "Each token's embedding is multiplied by three learned weight matrices to form query, key, and value representations.",
        formula: "Q = XW_Q,\\; K = XW_K,\\; V = XW_V",
      },
      {
        step: 2,
        title: "Score pairwise relevance",
        body: "Every query vector is compared to every key vector via dot product. Higher scores mean stronger relevance.",
      },
      {
        step: 3,
        title: "Normalize with softmax",
        body: "Scores become a probability distribution over positions — they sum to 1 for each query token.",
      },
      {
        step: 4,
        title: "Blend value vectors",
        body: "The output for each position is a weighted average of all value vectors, using the softmax weights.",
      },
    ],
    visualExample:
      "In \"The animal didn't cross the street because it was too tired\", attention lets \"it\" strongly connect to \"animal\" rather than \"street\".",
  },
  "self-attn": {
    analogy:
      "Self-attention is a group brainstorming session where every person simultaneously considers what everyone else said to refine their own contribution.",
    diagram: `flowchart LR
      SEQ[Same sequence X] --> QKV[Q, K, V from X]
      QKV --> ATTN[Attention matrix L x L]
      ATTN --> NEW[Updated representations]`,
    dataFlow: [
      { from: "Sequence embeddings", to: "Q, K, V", label: "same source X" },
      { from: "All positions", to: "Each position", label: "global context" },
    ],
    walkthrough: [
      {
        step: 1,
        title: "Single source sequence",
        body: "Unlike cross-attention, Q, K, and V all derive from the same input — tokens attend to other tokens in the same sentence.",
      },
      {
        step: 2,
        title: "Build L×L attention map",
        body: "For a sequence of length L, each token gets L relevance scores — one per position including itself.",
      },
    ],
    visualExample:
      "BERT encoding a sentence: every word's final representation encodes context from the entire sentence, enabling tasks like sentiment analysis.",
  },
  mha: {
    analogy:
      "Multi-head attention is like reading the same paragraph through several different colored highlighters — each head catches a different kind of relationship.",
    diagram: `flowchart TB
      X[Input] --> H1[Head 1]
      X --> H2[Head 2]
      X --> H3[Head N]
      H1 --> CAT[Concatenate]
      H2 --> CAT
      H3 --> CAT
      CAT --> WO[Output projection]`,
    dataFlow: [
      { from: "Input X", to: "h parallel heads", label: "split dimensions" },
      { from: "Head outputs", to: "Concat", label: "join" },
      { from: "Concat", to: "Output", label: "W_O projection" },
    ],
    visualExample:
      "In translation, one head might track subject-verb agreement while another tracks long-distance dependencies between clauses.",
  },
  rag: {
    analogy:
      "RAG is like an open-book exam: the model doesn't memorize every fact — it looks up relevant pages from a library (your documents) before writing the answer.",
    diagram: `flowchart LR
      Q[User query] --> EMB[Embed query]
      EMB --> VDB[(Vector DB)]
      VDB --> CTX[Top-k chunks]
      CTX --> LLM[LLM + context]
      Q --> LLM
      LLM --> ANS[Grounded answer]`,
    dataFlow: [
      { from: "User question", to: "Query embedding", label: "embedding model" },
      { from: "Query embedding", to: "Document chunks", label: "similarity search" },
      { from: "Retrieved chunks", to: "LLM prompt", label: "context injection" },
      { from: "LLM", to: "Answer", label: "generation" },
    ],
    walkthrough: [
      {
        step: 1,
        title: "Index your documents",
        body: "Split documents into chunks, embed each chunk, and store vectors in a vector database.",
      },
      {
        step: 2,
        title: "Retrieve on query",
        body: "Embed the user's question and find the k most similar chunks by cosine distance.",
      },
      {
        step: 3,
        title: "Augment the prompt",
        body: "Insert retrieved chunks into the LLM context window alongside the user question.",
      },
      {
        step: 4,
        title: "Generate grounded response",
        body: "The model answers using retrieved evidence, reducing hallucination on domain-specific facts.",
      },
    ],
    visualExample:
      "A company chatbot answering HR policy questions: it retrieves the exact handbook section about PTO before responding, instead of guessing from training data.",
  },
  kg: {
    analogy:
      "A knowledge graph is like a subway map for facts — stations are entities, lines are relationships, and you can trace explicit paths from any point to another.",
    diagram: `flowchart LR
      subgraph triple [Triple]
        S[Subject: Paris]
        P[Predicate: capital_of]
        O[Object: France]
      end
      S --> P --> O
      E1[Entity nodes] --- R1[Typed relations] --- E2[More entities]`,
    dataFlow: [
      { from: "Raw text / DB", to: "Entities & relations", label: "extraction" },
      { from: "Triples", to: "Graph store", label: "Neo4j / RDF" },
      { from: "Graph queries", to: "Structured facts", label: "SPARQL / Cypher" },
      { from: "Graph + embeddings", to: "Neural models", label: "GraphRAG / GNN" },
    ],
    walkthrough: [
      {
        step: 1,
        title: "Define schema",
        body: "Decide entity types (Person, Company) and relation types (works_at, founded).",
      },
      {
        step: 2,
        title: "Extract triples",
        body: "Each fact becomes subject → predicate → object, e.g. (Einstein, born_in, Ulm).",
      },
      {
        step: 3,
        title: "Query explicitly",
        body: "Unlike neural weights, facts are directly traversable — ask \"who founded X?\" and follow edges.",
      },
    ],
    visualExample:
      "Google Knowledge Panel for a celebrity: birth date, spouse, and filmography come from an explicit graph, not probabilistic text completion.",
  },
  embeddings: {
    analogy:
      "Embeddings are GPS coordinates for meaning — texts with similar meaning land close together in vector space, so \"king − man + woman ≈ queen\" becomes geometry.",
    diagram: `flowchart LR
      TXT[Text / token] --> ENC[Encoder model]
      ENC --> VEC["Vector (e.g. 1536-d)"]
      VEC --> SIM[Cosine similarity]
      SIM --> NEAR[Nearest neighbors]`,
    dataFlow: [
      { from: "Raw text", to: "Token IDs", label: "tokenizer" },
      { from: "Tokens", to: "Dense vector", label: "neural encoder" },
      { from: "Vectors", to: "Similar items", label: "ANN search" },
    ],
    walkthrough: [
      {
        step: 1,
        title: "Encode to fixed-size vector",
        body: "An embedding model maps variable-length text to a fixed-dimensional float array.",
        formula: "\\mathbf{e} = f_{\\text{embed}}(\\text{text}) \\in \\mathbb{R}^d",
      },
      {
        step: 2,
        title: "Measure similarity",
        body: "Cosine similarity or dot product quantifies how close two meanings are in space.",
      },
      {
        step: 3,
        title: "Enable retrieval",
        body: "Similarity search powers RAG, recommendation, and clustering without exact keyword match.",
      },
    ],
    visualExample:
      "Searching \"refund policy\" in a support docs vector DB returns \"return merchandise authorization\" even though the words differ.",
  },
  finetune: {
    analogy:
      "Fine-tuning is like hiring an expert who already speaks the language and teaching them your company's dialect — faster than training someone from scratch.",
    diagram: `flowchart LR
      BASE[Pretrained model] --> DATA[Task-specific data]
      DATA --> FT[Fine-tune weights]
      FT --> ADAPT[Specialized model]`,
    dataFlow: [
      { from: "Base checkpoint", to: "Training loop", label: "initialize weights" },
      { from: "Labeled examples", to: "Loss gradient", label: "backprop" },
      { from: "Updated weights", to: "Deployed model", label: "save checkpoint" },
    ],
    walkthrough: [
      {
        step: 1,
        title: "Start from pretrained weights",
        body: "Use a foundation model that already understands language, vision, or code.",
      },
      {
        step: 2,
        title: "Train on domain data",
        body: "Show curated examples of the target behavior — instructions, labels, or preferences.",
      },
      {
        step: 3,
        title: "Evaluate and deploy",
        body: "Test on held-out data; the adapted model encodes new knowledge in its weights.",
      },
    ],
    visualExample:
      "A medical LLM fine-tuned on clinical notes learns to use proper ICD codes and terminology that generic GPT never saw in pretraining.",
  },
  peft: {
    analogy:
      "LoRA is like adding a small sticky note layer on top of a textbook instead of rewriting every page — you change behavior with tiny extra matrices.",
    diagram: `flowchart LR
      W[Frozen W] --> OUT[Output]
      X[Input] --> W
      X --> A[LoRA A]
      A --> B[LoRA B]
      B --> OUT`,
    dataFlow: [
      { from: "Input x", to: "Frozen W·x", label: "base forward pass" },
      { from: "Input x", to: "B·A·x", label: "low-rank adapter" },
      { from: "Sum", to: "Output", label: "W·x + BA·x" },
    ],
    visualExample:
      "Fine-tuning Llama 7B on a laptop with QLoRA: train only ~0.1% of parameters while keeping 99.9% frozen.",
  },
  agents: {
    analogy:
      "An AI agent is like a research assistant with a to-do list, a phone to call experts (tools), and the ability to revise the plan when new information arrives.",
    diagram: `flowchart TB
      GOAL[Goal] --> PLAN[Plan]
      PLAN --> ACT[Action / tool call]
      ACT --> OBS[Observation]
      OBS --> PLAN
      OBS --> DONE{Done?}
      DONE -->|No| PLAN
      DONE -->|Yes| OUT[Final answer]`,
    dataFlow: [
      { from: "User goal", to: "Planner", label: "decompose task" },
      { from: "Planner", to: "Tools/APIs", label: "function calls" },
      { from: "Tool results", to: "Memory", label: "store context" },
      { from: "Memory", to: "Next action", label: "ReAct loop" },
    ],
    walkthrough: [
      {
        step: 1,
        title: "Receive a goal",
        body: "The agent gets a high-level objective: book a flight, debug code, or research a topic.",
      },
      {
        step: 2,
        title: "Plan and act",
        body: "It decides the next step — often calling external tools like search, calculators, or APIs.",
      },
      {
        step: 3,
        title: "Observe and iterate",
        body: "Tool outputs feed back into the loop until the agent judges the goal is satisfied.",
      },
    ],
    visualExample:
      "Cursor's coding agent: reads files, runs terminal commands, fixes errors, and commits — looping until tests pass.",
  },
  "nn-basics": {
    analogy:
      "Neural network basics are the LEGO bricks of AI — a perceptron is one brick, layers stack them, and activation functions snap on the color (non-linearity).",
    diagram: `flowchart LR
      IN[Inputs x1..xn] --> SUM[Weighted sum + bias]
      SUM --> ACT[Activation σ]
      ACT --> OUT[Output a]`,
    dataFlow: [
      { from: "Features", to: "Weighted sum", label: "w·x + b" },
      { from: "Linear output", to: "Activation", label: "ReLU / sigmoid" },
      { from: "Layer outputs", to: "Next layer", label: "stack depth" },
    ],
    visualExample:
      "MNIST digit classifier: 784 pixel inputs flow through hidden layers to 10 output neurons (digits 0–9).",
  },
  cnn: {
    analogy:
      "A CNN is like sliding a magnifying glass across an image — the same small filter detects edges or textures everywhere, sharing weights across the whole picture.",
    diagram: `flowchart LR
      IMG[Image grid] --> CONV[Convolution filters]
      CONV --> POOL[Pooling]
      POOL --> FC[Fully connected]
      FC --> CLS[Class scores]`,
    dataFlow: [
      { from: "Pixel grid", to: "Feature maps", label: "convolution" },
      { from: "Feature maps", to: "Downsampled maps", label: "max/avg pool" },
      { from: "Flat features", to: "Predictions", label: "classifier head" },
    ],
    walkthrough: [
      {
        step: 1,
        title: "Apply local filters",
        body: "Small kernels (e.g. 3×3) slide across the image, detecting edges, corners, or textures.",
      },
      {
        step: 2,
        title: "Build hierarchy",
        body: "Early layers see edges; deeper layers combine them into parts and whole objects.",
      },
      {
        step: 3,
        title: "Classify",
        body: "Pooled features feed a classifier head for detection or recognition.",
      },
    ],
    visualExample:
      "ResNet identifying a dog in a photo: early conv layers find fur edges; deeper layers assemble ear and snout patterns.",
  },
  diffusion: {
    analogy:
      "Diffusion models are like restoring a photo gradually erased by static — start with pure noise and repeatedly denoise until a clear image emerges.",
    diagram: `flowchart LR
      NOISE[Random noise x_T] --> UNET[U-Net denoiser]
      UNET --> X1[x_{T-1}]
      X1 --> UNET2[Repeat T steps]
      UNET2 --> IMG[Clean image x_0]`,
    dataFlow: [
      { from: "Gaussian noise", to: "Noisy sample", label: "forward process" },
      { from: "Noisy x_t", to: "Predicted noise", label: "U-Net" },
      { from: "Denoised x_{t-1}", to: "Final image", label: "iterative steps" },
    ],
    walkthrough: [
      {
        step: 1,
        title: "Forward: add noise",
        body: "Training corrupts real images with progressively more Gaussian noise over T timesteps.",
      },
      {
        step: 2,
        title: "Learn to denoise",
        body: "The network learns to predict and remove noise at each step.",
      },
      {
        step: 3,
        title: "Reverse: generate",
        body: "At inference, start from pure noise and iteratively denoise to synthesize new images.",
      },
    ],
    visualExample:
      "Stable Diffusion generating \"a cat wearing a space helmet\" from random noise in ~20–50 denoising steps.",
  },
  ml: {
    analogy:
      "Machine learning is teaching by example instead of by rulebook — show thousands of photos labeled \"cat\" or \"dog\" and let the computer infer the pattern.",
    diagram: `flowchart LR
      DATA[Training data] --> MODEL[Model]
      MODEL --> PRED[Predictions]
      PRED --> LOSS[Loss vs labels]
      LOSS --> UPDATE[Update weights]`,
    dataFlow: [
      { from: "Labeled examples", to: "Model", label: "forward pass" },
      { from: "Predictions", to: "Loss", label: "compare to labels" },
      { from: "Gradients", to: "Weights", label: "optimizer step" },
    ],
    visualExample:
      "Spam filter: trained on millions of emails marked spam/not-spam, it learns word patterns without explicit rules.",
  },
  dl: {
    analogy:
      "Deep learning stacks many layers of pattern detectors — like a factory assembly line where each station refines the product until the final station recognizes a face.",
    diagram: `flowchart TB
      RAW[Raw pixels / text] --> L1[Layer 1: edges]
      L1 --> L2[Layer 2: shapes]
      L2 --> L3[Layer 3: objects]
      L3 --> OUT[Task output]`,
    dataFlow: [
      { from: "Raw input", to: "Low-level features", label: "layer 1–2" },
      { from: "Mid-level features", to: "High-level concepts", label: "layer 3–N" },
      { from: "Representation", to: "Task head", label: "classify / generate" },
    ],
    visualExample:
      "GPT pretraining on internet text: billions of parameters across dozens of layers learn grammar, facts, and reasoning patterns.",
  },
  block: {
    analogy:
      "A Transformer block is one floor in a skyscraper — identical layout repeated many times, each floor refining the tenants' (tokens') understanding.",
    diagram: `flowchart TB
      X[Input x] --> N1[LayerNorm]
      N1 --> ATTN[Multi-Head Attention]
      ATTN --> ADD1[Add x]
      X --> ADD1
      ADD1 --> N2[LayerNorm]
      N2 --> FFN[Feed-Forward]
      FFN --> ADD2[Add]
      ADD1 --> ADD2`,
    dataFlow: [
      { from: "x", to: "Attention sub-layer", label: "residual path" },
      { from: "x + Attention(x)", to: "FFN sub-layer", label: "residual path" },
    ],
    visualExample:
      "GPT-3 has 96 identical blocks stacked — each adds another layer of contextual refinement.",
  },
  llms: {
    analogy:
      "An LLM is like a student who read the entire internet — it can discuss almost anything, but may confidently state things it never actually verified.",
    diagram: `flowchart LR
      CORPUS[Web-scale corpus] --> PRE[Pretrain]
      PRE --> BASE[Base LLM]
      BASE --> SFT[SFT / RLHF]
      SFT --> CHAT[Chat model]`,
    dataFlow: [
      { from: "Text corpus", to: "Token prediction", label: "next-token objective" },
      { from: "Base model", to: "Instruction tuning", label: "SFT" },
      { from: "Aligned model", to: "User chat", label: "inference" },
    ],
    visualExample:
      "Claude answering a coding question: autoregressively generates tokens one at a time, each conditioned on the full conversation history.",
  },
  pretraining: {
    analogy:
      "Pretraining is the broad liberal-arts education — the model learns language, world knowledge, and reasoning before specializing for any job.",
    diagram: `flowchart LR
      DATA[Massive unlabeled text] --> MASK[Next-token / masked LM]
      MASK --> GPU[Thousands of GPUs]
      GPU --> CKPT[Foundation checkpoint]`,
    dataFlow: [
      { from: "Raw documents", to: "Token sequences", label: "tokenize" },
      { from: "Sequences", to: "Loss signal", label: "predict next token" },
      { from: "Gradients", to: "Billions of weights", label: "weeks of training" },
    ],
    visualExample:
      "Llama 3 pretraining on 15T tokens: the model learns syntax, facts, and code patterns before any chat fine-tuning.",
  },
  vectordb: {
    analogy:
      "A vector database is a library catalog sorted by meaning instead of alphabet — ask a question and it finds the shelf with the most relevant books instantly.",
    diagram: `flowchart LR
      DOCS[Documents] --> EMB[Embed chunks]
      EMB --> INDEX[HNSW / IVF index]
      Q[Query vector] --> INDEX
      INDEX --> TOP[Top-k results]`,
    dataFlow: [
      { from: "Document chunks", to: "Vectors", label: "embedding model" },
      { from: "Vectors", to: "Index", label: "store + index" },
      { from: "Query vector", to: "Nearest chunks", label: "ANN search" },
    ],
    visualExample:
      "Pinecone serving RAG for a legal firm: 500K contract clauses searchable in milliseconds by semantic similarity.",
  },
  gnn: {
    analogy:
      "A GNN is like gossip spreading through a social network — each person updates their opinion based on neighbors, and information propagates along friend connections.",
    diagram: `flowchart TB
      N1[Node A] --- N2[Node B]
      N2 --- N3[Node C]
      N1 --> AGG[Aggregate neighbor features]
      AGG --> UPD[Update node embedding]`,
    dataFlow: [
      { from: "Node features", to: "Neighbor messages", label: "edge propagation" },
      { from: "Aggregated messages", to: "Updated embeddings", label: "message passing" },
      { from: "Graph embeddings", to: "Downstream task", label: "classify / link predict" },
    ],
    visualExample:
      "Pinterest using GraphSAGE to recommend pins: your taste updates based on pins from users with similar click graphs.",
  },
  backprop: {
    analogy:
      "Backpropagation is grading a test from the final answer backward — each layer learns how much it contributed to the mistake and adjusts accordingly.",
    diagram: `flowchart RL
      LOSS[Loss L] --> GRAD[∂L/∂output]
      GRAD --> CHAIN[Chain rule layer by layer]
      CHAIN --> WUPD[Update all weights]`,
    dataFlow: [
      { from: "Forward pass output", to: "Loss value", label: "compare to target" },
      { from: "Loss", to: "Gradients", label: "backward pass" },
      { from: "Gradients", to: "Weight updates", label: "optimizer" },
    ],
    visualExample:
      "Training a classifier: wrong prediction triggers gradients flowing from the loss function back through every layer to adjust weights.",
  },
  rlhf: {
    analogy:
      "RLHF is like training a customer service rep with human feedback cards — thumbs up/down on responses teaches the model what people actually prefer.",
    diagram: `flowchart LR
      SFT[SFT model] --> GEN[Generate responses]
      GEN --> RANK[Human ranking]
      RANK --> RM[Reward model]
      RM --> PPO[PPO fine-tune]`,
    dataFlow: [
      { from: "SFT checkpoint", to: "Candidate responses", label: "sample" },
      { from: "Human preferences", to: "Reward model", label: "train RM" },
      { from: "Reward signal", to: "Policy update", label: "PPO" },
    ],
    visualExample:
      "ChatGPT alignment: human raters compare two answers; the model learns to prefer helpful, harmless, honest responses.",
  },
  "decoder-only": {
    analogy:
      "Decoder-only models read left-to-right like writing a sentence one word at a time — each new word can see everything written before it but nothing after.",
    diagram: `flowchart LR
      T1[t1] --> T2[t2]
      T2 --> T3[t3]
      T3 --> TN[... predict t_next]`,
    dataFlow: [
      { from: "Previous tokens", to: "Causal attention", label: "mask future" },
      { from: "Context", to: "Next token logits", label: "autoregressive" },
    ],
    visualExample:
      "GPT completing \"The capital of France is ___\": generates \"Paris\" token by token using only prior context.",
  },
};
