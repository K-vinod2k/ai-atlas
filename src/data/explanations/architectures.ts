import type { RichContent } from "../types";

/** Authored explanations for architecture and anatomy nodes, keyed by taxonomy node id. */
export const ARCHITECTURE_EXPLANATIONS: Record<string, RichContent> = {
  arch: {
    explanation: `A model architecture is the wiring diagram of a neural network: how many layers it has, how those layers connect, and what computation happens inside each one. Before any training begins, the architecture fixes the shape of the function the model can learn. Training then fills in the numbers (the weights), but it cannot change the wiring. Choosing an architecture is therefore the single most consequential design decision in building a model.

Different architectures encode different assumptions about data. Convolutional networks assume nearby pixels matter more than distant ones. Recurrent networks assume information arrives in order. Transformers assume any part of the input might matter to any other part. These built-in assumptions are called inductive biases, and a good match between bias and data means the model needs less data and compute to learn well.

This branch of the atlas zooms from whole architecture families down through their components (attention, feed-forward layers, normalization) all the way to the atoms: individual neurons, weights, numbers, and finally bits. Every capability of a frontier model, from writing code to describing images, is ultimately built from these same simple parts repeated at enormous scale.`,
    analogy: "An architecture is a building's blueprint: it decides where the rooms, hallways, and load-bearing walls go before anyone moves furniture in. Training is the furnishing; the blueprint constrains everything that can happen inside.",
    visualExample: "When Meta releases Llama 4, the architecture is the published description (number of layers, attention type, hidden size), while the downloadable weights are what training produced within that blueprint.",
  },

  "nn-basics": {
    explanation: `Every deep learning model, no matter how exotic, is assembled from the same small set of primitives: neurons that compute weighted sums, activation functions that add non-linearity, and layers that group neurons so their outputs feed the next stage. Understanding these three ideas makes the rest of the field far less mysterious, because a transformer or a diffusion model is just these primitives arranged in a particular pattern.

The core loop is simple. Numbers flow in, get multiplied by learned weights, get summed, pass through a non-linear function, and flow out to the next layer. Stack enough of these steps and the network can approximate almost any function, a result known as the universal approximation property. The hard part is not expressiveness but learning: finding weight values that make the whole stack produce useful outputs, which is what backpropagation and gradient descent handle.`,
    analogy: "Neural network basics are like the alphabet of a language: only a handful of letters, but every book ever written is a combination of them. Transformers and CNNs are novels; neurons and activations are the letters.",
    visualExample: "A spam filter built as a small neural network takes word counts as input numbers, passes them through two layers of weighted sums and ReLU activations, and outputs a single probability that the email is spam.",
  },

  perceptron: {
    explanation: `The perceptron, introduced by Frank Rosenblatt in 1958, is the original artificial neuron. It takes several numeric inputs, multiplies each by a weight, adds them together with a bias term, and outputs 1 if the total crosses a threshold and 0 otherwise. Its learning rule is equally simple: when the output is wrong, nudge each weight in the direction that would have made it right.

A single perceptron can only draw a straight-line boundary between classes, which means it fails on problems as basic as XOR, a limitation famously highlighted by Minsky and Papert in 1969. That critique contributed to the first AI winter. The fix turned out to be stacking perceptrons into multiple layers and replacing the hard threshold with smooth activation functions, which is exactly what modern networks do.

The perceptron matters today mostly as a conceptual atom. Every neuron in a trillion-parameter model is still doing the perceptron's job: weighted sum, plus bias, through a non-linearity. Everything since has been about arranging billions of them and training them jointly.`,
    analogy: "A perceptron is a bouncer with a checklist: each item on the list has a point value, and if your total score clears the bar you get in, otherwise you don't. It can enforce any single straight-line rule, but nothing more nuanced.",
    visualExample: "A perceptron could decide whether to approve a small loan by weighting income, existing debt, and credit history into one score and comparing it against a fixed cutoff.",
  },

  mlp: {
    explanation: `A multilayer perceptron (MLP), also called a feedforward network, stacks layers of neurons where every neuron in one layer connects to every neuron in the next. Data flows strictly forward: input layer, one or more hidden layers, output layer, with no loops or shortcuts. Each layer applies a matrix multiplication followed by a non-linear activation, so the network as a whole is a chain of alternating linear and non-linear steps.

The hidden layers are what give the MLP its power. The first layer might learn simple feature combinations, the second layer combinations of those combinations, and so on. With enough hidden units, an MLP can approximate any continuous function, which is why it is the default answer when data has no special structure to exploit.

MLPs remain everywhere in modern AI even though they are rarely the headline architecture. The feed-forward block inside every transformer layer is an MLP, and it typically holds about two thirds of a language model's parameters. Standalone MLPs are also the standard choice for tabular data with learned embeddings and for the final prediction heads bolted onto larger models.`,
    analogy: "An MLP is an assembly line where every station receives the full output of the previous station and reworks all of it, rather than one part. Each station adds a layer of refinement until the final product emerges at the end.",
    visualExample: "A real-estate price estimator can be a three-layer MLP: house features go in, hidden layers learn interactions like 'large lot matters more in suburbs', and a single output neuron emits the predicted price.",
  },

  "activation-fn": {
    explanation: `An activation function is the non-linear step applied to each neuron's weighted sum before the result moves to the next layer. Without it, stacking layers would be pointless: a chain of purely linear operations collapses into one linear operation, so a hundred-layer network would be no more expressive than a single layer. The activation is the ingredient that lets depth create genuinely new capability.

Different activations have different characters. Sigmoid squashes values into the range 0 to 1 and was standard historically, but it flattens out at the extremes, which starves deep networks of gradient signal. ReLU (rectified linear unit) simply zeroes out negative values and passes positive ones through unchanged; it is cheap, keeps gradients healthy, and drove the deep learning boom of the 2010s. GELU, a smooth relative of ReLU, is the default in transformers. Softmax is a special case used at the output: it converts a vector of raw scores into a probability distribution, which is how a language model turns scores over its vocabulary into next-token probabilities.

The choice matters mostly for training stability and speed rather than final capability. Modern recipes pick a proven default (GELU or a gated variant like SwiGLU for transformers, ReLU for many vision models) and spend design effort elsewhere.`,
    analogy: "An activation function is like a valve on a pipe: without valves, water just flows proportionally everywhere and the plumbing can only do one thing. Valves that open, close, or restrict flow non-linearly let the same pipes implement complex behavior.",
    visualExample: "In GPT-style models, every feed-forward block applies a GELU activation between its two matrix multiplications, and the final layer applies softmax to turn 100,000-plus vocabulary scores into probabilities for the next token.",
  },

  "arch-families": {
    explanation: `Architecture families are the major blueprints for wiring neurons together, each shaped by the kind of data it was designed for. CNNs exploit the 2D structure of images. RNNs process sequences step by step. Transformers relate every element of a sequence to every other in parallel. GANs, autoencoders, and diffusion models are blueprints for generating data rather than just analyzing it. Each family embodies a bet about what structure in the data is worth building into the network itself.

The history of the field is largely the history of these families rising and being displaced. CNNs dominated vision from 2012, RNNs dominated language until 2017, and the transformer has since absorbed most of both territories because it scales better with data and compute. Newer families like mixture of experts and state space models are attempts to fix the transformer's main weakness, the quadratic cost of attention, rather than wholesale replacements.

Knowing the families matters because architecture choice is still a real engineering decision. A transformer is overkill for a small tabular problem, a CNN is still often the efficient choice for embedded vision, and sub-quadratic models matter when contexts run to millions of tokens.`,
    analogy: "Architecture families are like vehicle categories: trucks, sedans, motorcycles. All share engines and wheels (neurons and weights), but each body plan is optimized for different cargo, and picking the wrong one wastes fuel or fails outright.",
    visualExample: "A modern phone runs several families at once: a CNN in the camera pipeline for scene detection, a transformer for keyboard autocorrect and voice assistant, and a diffusion model in the photo editor for generative fill.",
  },

  cnn: {
    explanation: `A convolutional neural network (CNN) is built for grid-shaped data such as images. Instead of connecting every input pixel to every neuron, a CNN slides small filters (typically 3x3 patches of learned weights) across the image, computing the same local pattern detector at every position. Early layers learn to detect edges and textures, middle layers combine those into shapes and parts, and deep layers recognize whole objects. Pooling layers periodically shrink the spatial resolution so the network sees progressively larger regions.

Two design choices make this efficient. Weight sharing means one filter is reused across the whole image, so a cat detector learned in the top-left corner works in the bottom-right too, and the parameter count stays small. Locality means each neuron only looks at a small neighborhood, matching the fact that nearby pixels are far more correlated than distant ones. Together these give CNNs a strong spatial inductive bias: they need far less data than an unstructured network to learn vision tasks.

CNNs powered the deep learning breakthrough (AlexNet winning ImageNet in 2012) and architectures like ResNet, U-Net, and YOLO remain workhorses for classification, segmentation, and real-time detection. Vision transformers have overtaken CNNs at the largest scales, but CNNs still win when data or compute is limited, which keeps them dominant in embedded and edge vision.`,
    analogy: "A CNN inspects an image the way you would search a Where's Waldo page: sliding a small window across the scene looking for the same telltale pattern everywhere, rather than trying to memorize the entire page at once.",
    visualExample: "A car's driver-assist system runs a YOLO-style CNN on every camera frame, drawing boxes around pedestrians, vehicles, and traffic signs within a few milliseconds per frame.",
  },

  rnn: {
    explanation: `A recurrent neural network (RNN) processes a sequence one element at a time while carrying a hidden state, a vector that acts as a running summary of everything seen so far. At each step the network combines the new input with the previous hidden state to produce an updated state and an output. The same weights are reused at every step, so an RNN of fixed size can, in principle, handle sequences of any length.

Plain RNNs struggle in practice because gradients must flow backward through every time step during training, and they tend to shrink toward zero or blow up along the way. This vanishing gradient problem makes it hard to learn dependencies more than a few dozen steps apart. LSTM (long short-term memory) and GRU (gated recurrent unit) cells solve this with learned gates that explicitly decide what to keep in memory, what to forget, and what to output, letting useful information survive across hundreds of steps.

RNNs dominated language, speech, and translation until the transformer arrived in 2017. Their fatal weakness was not accuracy but throughput: each step depends on the previous one, so training cannot be parallelized across the sequence. They still appear where streaming, low latency, or tiny memory footprints matter, and their core idea of a compressed running state has returned in modern state space models.`,
    analogy: "An RNN reads like a person reading a novel with a single sticky note for memory: after each sentence it rewrites the note to summarize the story so far, then reads the next sentence in light of that note. LSTMs upgrade the note with rules about what is important enough to keep.",
    visualExample: "Before transformers, Google Translate ran on stacked LSTMs, and lightweight GRUs still power on-device wake-word detection that listens for phrases like 'Hey Siri' with minimal battery drain.",
  },

  transformer: {
    explanation: `The transformer, introduced in the 2017 paper 'Attention Is All You Need', is the architecture behind essentially every modern large language model. Its core move is to drop recurrence entirely and let every token in a sequence directly attend to every other token through the attention mechanism. Because no step waits on the previous one, the whole sequence is processed in parallel, which is exactly what GPUs are built for.

A transformer is a stack of identical blocks, each containing two sub-layers: multi-head self-attention, which moves information between token positions, and a feed-forward network, which transforms each token's representation independently. Residual connections and normalization around each sub-layer keep training stable even at depths of a hundred layers or more. Since attention itself is order-blind, positional information is injected separately so the model knows token order.

The transformer's real superpower is scaling. Its training cost grows predictably with model size and data, and quality improves along smooth scaling laws, which gave labs the confidence to invest billions in ever-larger runs. The same blueprint now handles text, images (vision transformers), audio, protein structure, and code. Its main cost is that attention compares every token pair, so compute grows quadratically with sequence length, motivating innovations like Flash Attention, KV caching, and sub-quadratic alternatives.`,
    analogy: "An RNN is a single reader passing a note along a line of people; a transformer is a conference room where everyone hears everyone else simultaneously and each person decides whom to listen to. Meetings are more expensive per minute, but vastly faster than relaying messages person by person.",
    visualExample: "GPT-5, Claude, Gemini, and Llama are all transformer stacks; when ChatGPT answers you, dozens of transformer blocks process your prompt in parallel and then generate the reply one token at a time.",
  },

  "encoder-only": {
    explanation: `An encoder-only transformer, exemplified by BERT, reads the entire input at once with bidirectional attention: every token can attend to tokens both before and after it. The output is not new text but a rich vector representation for each token and for the sequence as a whole. This makes encoder-only models machines for understanding rather than generating.

They are typically pretrained with masked language modeling: random words in a sentence are hidden and the model learns to reconstruct them from surrounding context on both sides. Because the model sees the full sentence, its representations capture meaning more symmetrically than a left-to-right model of the same size can.

Encoder-only models excel at classification, named entity recognition, semantic search, and reranking. Most embedding models that power vector databases and RAG pipelines are encoder-style: they compress a document or query into a single vector whose distances reflect meaning. When the task is 'understand and score this text' rather than 'write new text', an encoder is usually the cheaper and better tool.`,
    analogy: "An encoder-only model is a professional reader, like an editor who reads a whole manuscript before rendering judgment. It never writes the sequel; its product is a deep, structured understanding of what it read.",
    visualExample: "When you search a support site and it finds articles matching your question's meaning rather than its exact words, an encoder model has converted both your query and the articles into vectors and matched them by distance.",
  },

  "decoder-only": {
    explanation: `A decoder-only transformer, the GPT design, generates text left to right. Its defining feature is causal masking: when processing a token, attention is only allowed to look at earlier positions, never later ones. This matches the generation task exactly, since at inference time future tokens do not exist yet. Training is a single elegant objective: predict the next token at every position of a huge text corpus simultaneously.

Generation works by repeated sampling. The model computes a probability distribution over its vocabulary for the next token, one token is chosen, appended to the sequence, and the process repeats. The KV cache makes this efficient by reusing the attention computations from earlier steps instead of reprocessing the whole sequence each time.

Decoder-only has become the dominant LLM design because of its simplicity and generality. One architecture and one objective handle translation, summarization, question answering, and code by simply framing every task as text continuation. GPT, Claude, Llama, Gemini, and nearly every frontier model are decoder-only stacks, differing mainly in scale, data, and training refinements.`,
    analogy: "A decoder-only model is an improviser who can only build on what has already been said, never peeking ahead. Given any opening line, it continues one word at a time, each choice conditioned on everything spoken so far.",
    visualExample: "Every reply ChatGPT streams to you is a decoder-only transformer choosing one token at a time, which is why the text appears word by word rather than all at once.",
  },

  "enc-dec": {
    explanation: `An encoder-decoder transformer, the original 2017 design later refined by models like T5, splits the work between two stacks. The encoder reads the entire input with bidirectional attention and produces a set of contextual representations. The decoder then generates the output token by token, using self-attention over what it has written so far plus cross-attention to consult the encoder's representations at every step.

This separation fits sequence-to-sequence tasks where input and output are distinct texts: translation, summarization, and structured transformation. The encoder can fully digest the source with the benefit of seeing all of it at once, while the decoder focuses purely on producing fluent output, checking back against the source through cross-attention whenever it needs to.

Decoder-only models have largely displaced encoder-decoders for general-purpose LLMs, since a single stack is simpler to scale and can emulate the same behavior by concatenating input and output. But encoder-decoder designs persist where the input-output split is natural and efficiency matters, notably in machine translation systems and in speech models like Whisper, where an audio encoder feeds a text decoder.`,
    analogy: "An encoder-decoder works like a professional interpreter: first they listen to and fully comprehend the speaker's sentence (encode), then they produce it in the target language (decode), glancing back at their mental model of the original with every phrase.",
    visualExample: "OpenAI's Whisper transcribes speech with an encoder-decoder: the encoder digests a 30-second audio spectrogram, and the decoder writes out the transcript token by token while cross-attending to the audio representation.",
  },

  block: {
    explanation: `The transformer block is the repeated structural unit of the architecture. A model like Llama is not a hundred different layers doing a hundred different things; it is one block design stacked dozens of times. Each block contains two sub-layers executed in order: a multi-head attention sub-layer that lets tokens exchange information, and a feed-forward sub-layer that processes each token's representation independently and holds most of the parameters.

Around each sub-layer sit two pieces of essential plumbing: a residual connection that adds the sub-layer's input to its output, and a normalization step that keeps the numbers in a healthy range. This wrapper is what makes it possible to stack the block a hundred times without training collapsing. The information flow is easy to state: attention mixes across token positions, the feed-forward network transforms within each position, and this alternation repeats block after block.

The block's uniformity is a feature, not laziness. Scaling a model up mostly means stacking more copies of the same block and widening it, which keeps engineering simple and makes performance predictable. When you read that a model has 80 layers, that means 80 of these blocks in sequence, each refining the representation left by the one before.`,
    analogy: "A transformer block is one floor of a factory tower: material comes up the elevator, gets processed at two stations (a meeting where parts exchange information, then individual workbenches), and rides up to the identical floor above. The building is just that floor repeated eighty times.",
    visualExample: "Llama 3 70B stacks 80 identical transformer blocks; a token representing the word 'bank' enters ambiguous at block 1 and, by block 80, has been refined through repeated attention and feed-forward passes into a vector encoding riverbank versus financial institution from context.",
  },

  embedding: {
    explanation: `The embedding layer is the model's front door: it converts discrete tokens (word pieces, roughly) into continuous vectors that the network can do math on. Mechanically it is a lookup table, a large matrix with one row per vocabulary entry. Token 4321 in becomes row 4321 out, a vector of perhaps 4,096 numbers. Those numbers are learned parameters, trained along with everything else.

What makes embeddings remarkable is the geometry that training induces. Tokens used in similar contexts end up with nearby vectors, so the space itself encodes meaning: synonyms cluster, and directions in the space can correspond to relationships like singular-to-plural. The model's later layers rely on this geometry as their working material.

In most language models the same matrix (or a mirror of it) is reused at the output end to convert the final hidden vector back into scores over the vocabulary, a trick called weight tying. The embedding concept also extends far past the input layer: standalone embedding models produce vectors for whole sentences and documents, which is the foundation of semantic search and RAG.`,
    analogy: "An embedding layer is like assigning every word a location in a giant city where related words live in the same neighborhood: 'king' and 'queen' a street apart, 'carburetor' across town. Once words have coordinates, 'how related are these?' becomes a distance measurement.",
    visualExample: "When you type 'unbelievable' into an LLM, it is split into tokens like 'un', 'believ', 'able', and each is looked up in the embedding table to produce vectors of several thousand numbers before any other layer runs.",
  },

  posenc: {
    explanation: `Attention has a blind spot: it treats the input as an unordered set. Swap two words in a sentence and, without extra help, self-attention produces the same pairwise comparisons, yet 'dog bites man' and 'man bites dog' mean different things. Positional encoding fixes this by injecting each token's position into its representation so order becomes visible to the model.

The original transformer added fixed sinusoidal patterns to the embeddings, giving each position a unique fingerprint. Later models learned position vectors directly. Modern LLMs mostly use RoPE (rotary position embeddings), which rotates the query and key vectors by an angle proportional to position, so the attention score between two tokens depends naturally on their relative distance rather than absolute location. ALiBi takes an even simpler route, penalizing attention scores by distance.

The choice of positional scheme has a very practical consequence: context length. How gracefully a model handles sequences longer than it was trained on, and how cheaply its context window can be extended, depends heavily on this component. Techniques for stretching RoPE are behind many of the jumps from 4K-token to million-token context windows.`,
    analogy: "Positional encoding is like numbering the pages of a manuscript before handing it to a team who will read all pages simultaneously. Without page numbers the content is all there but the story's order is lost.",
    visualExample: "A model can distinguish 'the cat chased the mouse' from 'the mouse chased the cat' only because positional encoding tags each token with where it sits; RoPE in Llama and Qwen models is what makes their long context windows workable.",
  },

  attention: {
    explanation: `Attention is the mechanism that lets each token in a sequence gather information from other tokens, weighted by relevance. Every token produces three vectors from its representation: a query (what am I looking for?), a key (what do I contain?), and a value (what information do I carry?). A token's query is compared against every token's key by dot product; the resulting scores pass through a softmax to become weights that sum to one; and the token's new representation is the weighted average of all the value vectors.

The crucial property is that these relevance weights are computed on the fly from the actual content, not fixed by the architecture. The word 'it' in a sentence can attend strongly to whatever noun it refers to in this particular sentence. This dynamic, content-based routing is what fixed connectivity patterns like convolutions cannot do, and it is why attention displaced recurrence for language.

The cost is that every token attends to every other token, so compute and memory grow with the square of sequence length. Doubling the context quadruples attention cost. This quadratic bottleneck drives much of modern systems research: multi-head variants to enrich it, KV caching and Flash Attention to make it efficient, and state space models to replace it outright for extreme lengths.`,
    analogy: "Attention is a room of researchers where each person broadcasts a question (query) and wears a badge summarizing their expertise (key); everyone reads all the badges, decides whose expertise matches their question, and blends those people's notes (values) in proportion to relevance.",
    visualExample: "In 'The trophy did not fit in the suitcase because it was too big', attention lets the token 'it' place heavy weight on 'trophy' rather than 'suitcase', resolving the reference from meaning rather than proximity.",
  },

  "self-attn": {
    explanation: `Self-attention is attention applied within a single sequence: the queries, keys, and values all come from the same set of tokens. Each token looks at its own sequence to decide which other tokens matter to it, then updates its representation as a relevance-weighted blend of theirs. It is the mechanism by which a word's vector stops meaning the word in isolation and starts meaning the word in this context.

This contextualization is the heart of what transformers do. The token 'bank' begins with one embedding regardless of meaning; after self-attention layers where it attends to 'river' or to 'loan', its representation shifts decisively toward the correct sense. Stacked across many layers, self-attention builds up from local grammatical relationships to long-range document structure.

In decoder-only models, self-attention is causally masked: each token may only attend to earlier positions, preserving the left-to-right generation contract. In encoder models it is bidirectional, letting every token see the full sequence. The distinction between these two masking patterns is essentially the distinction between BERT-style understanding models and GPT-style generators.`,
    analogy: "Self-attention is a team meeting where every member updates their own understanding by listening selectively to colleagues in the same room. Nobody consults outsiders; all the context needed is assumed to be present within the group.",
    visualExample: "When an LLM processes 'the keys to the cabinet are on the table' and must continue with a verb, self-attention lets the position after 'are' attend back to 'keys' (not 'cabinet') to keep the grammar plural.",
  },

  "cross-attn": {
    explanation: `Cross-attention connects two different sequences: the queries come from one sequence while the keys and values come from another. In an encoder-decoder transformer, each token the decoder writes sends queries into the encoder's output, letting the generation process consult the source input at every step. Self-attention asks 'what else have I written?'; cross-attention asks 'what does the source say?'.

Mechanically it is the same dot-product machinery as self-attention with one substitution of inputs, but the substitution changes the role entirely. Cross-attention is a learned, dynamic bridge between two representations, and it generalizes beyond text pairs: the two sides can be different modalities altogether. Text queries attending to image features, or a text decoder attending to encoded audio, are cross-attention at work.

This makes cross-attention the standard glue of multimodal systems. Text-to-image diffusion models inject the prompt through cross-attention layers, which is why individual words in your prompt visibly shape specific regions of the generated image. Speech recognizers, image captioners, and many vision-language models rely on the same bridge.`,
    analogy: "Cross-attention is a translator at work: with every phrase they produce, they glance back at the original document, focusing on exactly the source words relevant to what they are writing right now.",
    visualExample: "In Stable Diffusion, when you prompt 'a red car on a beach', cross-attention layers let the image regions being denoised attend to the tokens 'red', 'car', and 'beach', steering pixels toward matching content.",
  },

  mha: {
    explanation: `Multi-head attention runs several attention operations in parallel instead of one. The model's representation is split into, say, 32 smaller subspaces, and each head computes its own queries, keys, and values within its subspace, producing its own attention pattern. The heads' outputs are concatenated and mixed back together by a final linear layer.

The motivation is that a single attention pattern is a bottleneck: one softmax must compromise between every kind of relationship a token might need. With multiple heads, different heads specialize. Interpretability research on trained models finds heads that track syntactic dependencies, heads that copy repeated names, heads that attend to the previous token, and heads that link closing brackets to opening ones, all operating simultaneously on the same input.

Because each head works in a reduced dimension, the total compute is about the same as one full-width attention, so the specialization comes nearly free. Modern efficiency variants trim the design: grouped-query attention (GQA) and multi-query attention share key and value projections across heads, shrinking the KV cache dramatically with little quality loss, which is why most recent LLMs ship with GQA.`,
    analogy: "Multi-head attention is reading a contract with a panel of specialists: one lawyer tracks defined terms, one checks cross-references, one watches dates. Each reads the same document with a different question, and their findings are merged into one assessment.",
    visualExample: "Llama 3 uses 64 query heads with grouped-query attention in its larger variants; visualization tools show individual heads lighting up for distinct jobs, such as one head consistently linking pronouns to their antecedents.",
  },

  kvcache: {
    explanation: `The KV cache is the optimization that makes LLM generation fast. When a decoder generates token by token, each new token's attention needs the key and value vectors of every earlier token. Recomputing those from scratch at every step would mean reprocessing the entire growing sequence per token, an enormous waste since earlier tokens' keys and values never change. The KV cache simply stores them after they are first computed, so each generation step only computes the new token's vectors and attends against the cache.

This converts each step's cost from reprocessing the whole sequence to processing one token, which is the difference between unusable and interactive latency. The tradeoff is memory: the cache holds two vectors per token, per layer, per head, and for long contexts it can consume many gigabytes, often rivaling the model weights themselves. Serving-engine capacity is frequently limited by KV cache memory rather than compute.

Because of this, the cache is a major optimization target. Grouped-query attention shrinks it by sharing keys and values across heads, quantization stores it in fewer bits, and serving systems like vLLM manage it in pages like virtual memory so thousands of concurrent conversations fit on one GPU. Prompt caching features in commercial APIs are the same idea applied across requests.`,
    analogy: "A KV cache is taking notes during a long meeting: instead of replaying the entire recording every time someone new speaks, you consult your running notes and only add a line for the newest remark.",
    visualExample: "When Claude streams a 2,000-token answer to a long prompt, the prompt is processed once and its keys and values are cached; each subsequent token is generated by attending against that cache instead of rereading the whole conversation 2,000 times.",
  },

  "flash-attn": {
    explanation: `Flash Attention is a GPU kernel that computes exact attention much faster and with far less memory, not by changing the math but by changing the memory choreography. Standard implementations materialize the full attention score matrix (sequence length squared) in the GPU's large-but-slow main memory, then read it back for the softmax and the value multiplication. For long sequences that matrix is enormous, and shuttling it back and forth dominates the runtime.

Flash Attention processes attention in tiles small enough to stay in the GPU's tiny-but-fast on-chip SRAM, computing the softmax incrementally with a running rescaling trick so the full matrix never needs to exist anywhere. The result is identical to standard attention, but memory use drops from quadratic to linear in sequence length and wall-clock speed improves severalfold, because the bottleneck was memory traffic all along.

Its practical impact is hard to overstate: it is a key enabler of the long context windows now taken for granted, and it has become the default attention implementation in PyTorch, vLLM, and virtually every serious training and serving stack. It is also a case study in a broader truth of modern AI: on current hardware, moving data costs more than computing on it, and algorithm design must respect the memory hierarchy.`,
    analogy: "Flash Attention is a chef who preps in small batches on the counter within arm's reach instead of walking to a warehouse for every ingredient and hauling every intermediate dish back. The recipe and final meal are identical; nearly all the walking disappears.",
    visualExample: "Enabling Flash Attention when fine-tuning a 7B model on consumer GPUs commonly doubles or triples training throughput at 8K context, and long-context serving in engines like vLLM depends on it to avoid running out of GPU memory.",
  },

  ffn: {
    explanation: `The feed-forward network (FFN) is the second sub-layer of every transformer block and the quiet majority of the model. It is a small MLP applied to each token position independently: expand the token's vector to roughly four times its width, apply a non-linearity like GELU or a gated variant like SwiGLU, and project back down. The same weights are used at every position, but there is no interaction between positions inside the FFN; all cross-token communication happens in attention.

Despite its simplicity, the FFN typically holds around two thirds of a transformer's parameters, and interpretability research suggests it functions as the model's factual memory. The expansion layer acts like a bank of learned pattern detectors keying on features in the token's representation, and the projection layer writes associated information back. Studies that locate and edit specific facts inside models consistently find them in FFN weights.

The division of labor in a transformer block is thus clean: attention routes information between tokens, and the FFN transforms and enriches each token using stored knowledge. The FFN's bulk also makes it the main target for efficiency work, most notably mixture of experts, which replaces one large FFN with many smaller ones and activates only a few per token.`,
    analogy: "If attention is the meeting where colleagues exchange information, the FFN is each person returning to their desk to actually process what they heard, consulting their own reference library before the next meeting.",
    visualExample: "When an LLM completes 'The Eiffel Tower is located in' with 'Paris', the association is retrieved largely by feed-forward layers; model-editing research has changed such stored facts by modifying specific FFN weights.",
  },

  norm: {
    explanation: `Normalization layers rescale the activations flowing through a network so they stay in a consistent numerical range. LayerNorm, the transformer standard, takes each token's vector, subtracts its mean, divides by its standard deviation, and applies a learned scale and shift. RMSNorm, used in Llama and most recent LLMs, simplifies this to dividing by the root-mean-square, which is cheaper and works just as well.

The problem being solved is drift. In a deep stack, each layer's output feeds the next, and small shifts in scale compound multiplicatively: by layer 40 the activations may have exploded or collapsed, producing gradients that are useless for learning. Normalization resets the scale at every block, keeping both the forward pass and the gradients in a healthy range regardless of depth.

Placement turns out to matter as much as the formula. Original transformers applied normalization after each sub-layer (post-norm), which required careful learning-rate warmup to avoid divergence. Modern models normalize before each sub-layer (pre-norm), which keeps the residual pathway clean and makes training stable enough to scale to hundreds of layers with little tuning. It is unglamorous plumbing, but without it, models at modern depth simply would not train.`,
    analogy: "Normalization is the sound engineer's compressor between stages of an amplifier chain: whatever wildness comes in, the signal leaves at a standard level, so no later stage is deafened or left straining to hear.",
    visualExample: "Llama models apply RMSNorm before every attention and feed-forward sub-layer, hundreds of normalization points in total, which is a key reason an 80-layer model trains stably instead of diverging in the first thousand steps.",
  },

  residual: {
    explanation: `A residual connection adds a layer's input directly to its output: the block computes output equals input plus f(input), rather than output equals f(input). Each layer therefore learns a correction to the running representation instead of a wholesale replacement of it. The idea, introduced by ResNet in 2015, is what unlocked genuinely deep networks, and every transformer uses it around both sub-layers of every block.

The mechanism matters most for gradient flow. During backpropagation, gradients passing through many layers get multiplied by each layer's local derivatives and can shrink exponentially, leaving early layers unable to learn. The addition operation provides an identity path where gradients flow backward unchanged, from the loss straight to the earliest layers, no matter how deep the network. Layers along the way contribute refinements without ever blocking the highway.

Residuals also change how we should picture a transformer: as a residual stream, a persistent vector per token flowing up through the model, which each attention and FFN block reads from and writes small updates into. This framing is central to interpretability work and explains the architecture's robustness: a layer that learns nothing useful simply writes nothing, leaving the stream intact rather than corrupting it.`,
    analogy: "A residual connection is editing a document with tracked changes rather than retyping it at every desk it visits: each editor adds deltas to the same living draft, and even if one editor contributes nothing, the draft passes through unharmed.",
    visualExample: "GPT-style models with around 100 blocks are trainable because each block only adds adjustments to the token's residual stream; remove the residual connections and the same network fails to train at even a fraction of that depth.",
  },

  layer: {
    explanation: `A layer, in the transformer context, is one full block in the stack, and a model's depth is its layer count: roughly 32 layers for a 7B model, 80 for a 70B model, more for frontier systems. Each layer receives every token's current vector, applies attention and a feed-forward pass, and hands the refined vectors upward. The layers are architecturally identical but learn different weights, and therefore different jobs.

Probing trained models shows a rough division of labor by depth: early layers resolve surface features like syntax and word identity, middle layers build semantic and factual structure, and late layers organize the representation toward the actual output. Depth is what allows multi-step composition, with each layer building on conclusions the previous ones reached, though in practice adjacent layers overlap heavily and the model distributes work redundantly across them.`,
    analogy: "Layers are floors of a refinement tower: raw material enters at the ground floor and each floor performs one pass of processing on the whole batch before sending it up. The finished product emerges at the top after dozens of passes.",
    visualExample: "In Llama 3 70B, every token's vector passes through exactly 80 layers between the embedding lookup and the output projection; interpretability tools can read off intermediate layers and watch a prediction gradually form as depth increases.",
  },

  neuron: {
    explanation: `A neuron, or unit, is the elementary computing element of a neural network. It receives a set of input numbers, multiplies each by its own weight, adds them up along with a bias term, and passes the total through an activation function to produce one output number. That is the entire computation: a weighted vote followed by a non-linear squash, repeated billions of times per forward pass across the network.

Individually a neuron is trivial; collectively, neurons become feature detectors. Training tunes each neuron's weights so it fires strongly for some pattern in its inputs, whether that is an edge orientation in an image or something abstract in a language model's representation. A caution from interpretability research: neurons are often polysemantic, responding to several unrelated patterns at once, so the clean picture of one neuron per concept rarely holds in practice.`,
    analogy: "A neuron is a committee member who listens to many advisors, trusts each to a personally calibrated degree, tallies a weighted opinion, and then speaks up only as strongly as the tally warrants. Intelligence emerges from wiring millions of such members into a hierarchy.",
    visualExample: "In a digit-recognition network, one hidden neuron might fire strongly when input pixels form a loop shape, giving later layers a useful signal for distinguishing an 8 from a 1.",
  },

  weight: {
    explanation: `Weights and biases are the learned parameters of a network, the numbers that training actually changes. A weight scales the strength of one connection between neurons; a bias shifts a neuron's firing threshold. When a model is described as having 70 billion parameters, that is the count of these individual numbers. The architecture is fixed scaffolding; the weights are everything the model knows.

Training discovers weight values by gradient descent: the loss function measures how wrong the model's outputs are, backpropagation computes how much each weight contributed to the error, and each weight is nudged a tiny amount in the direction that reduces it. Repeated across trillions of examples, this indirect pressure organizes billions of numbers into circuits encoding grammar, facts, and reasoning patterns, with no human ever setting a value by hand.

Practically, weights are the artifact. Downloading an open model means downloading its weight file; fine-tuning means adjusting weights; LoRA means training a small set of additional weights; quantization means storing each weight in fewer bits to fit smaller hardware. The distinction between an architecture and a trained model is precisely the distinction between an empty spreadsheet and one filled with hard-won numbers.`,
    analogy: "Weights are the tension settings on millions of guitar strings: the instrument's shape (architecture) is fixed, but whether it plays noise or music depends entirely on how each string is tuned, and training is the slow process of tuning them all by ear.",
    visualExample: "The Llama 3 70B download is essentially 70 billion learned weights, about 140 GB at 16 bits each; quantizing those same numbers to 4 bits shrinks the file to roughly 40 GB so it can run on a single high-end desktop GPU.",
  },

  "activation-val": {
    explanation: `An activation value is the output number a neuron produces for a specific input: the result of its weighted sum passed through its activation function. Weights are permanent and change only during training; activations are transient and recomputed on every forward pass. They are the live signal flowing through the frozen wiring, the model's working memory of the current input.

Activations matter operationally as well as conceptually. During training they must all be kept in memory for backpropagation, and for large models the activations often consume more GPU memory than the weights themselves, which is why tricks like activation checkpointing exist. During inference, reading activations is how interpretability researchers observe what a model is representing, and steering them is an emerging way to modify behavior without retraining.`,
    analogy: "If weights are the fixed resistances soldered into a circuit board, activation values are the voltages measured at each point while the circuit runs: change the input signal and every reading changes, while the board itself stays the same.",
    visualExample: "Anthropic's interpretability work found activation patterns corresponding to concepts like the Golden Gate Bridge; artificially amplifying those activations made the model obsessively steer conversations toward the bridge, demonstrating activations are where live meaning resides.",
  },

  tensor: {
    explanation: `A tensor is a multi-dimensional array of numbers, the universal data container of deep learning. A vector is a 1D tensor, a matrix is 2D, and higher dimensions follow: a batch of token sequences with an embedding per token is a 3D tensor of shape batch by sequence by hidden size. Weights, activations, gradients, and inputs are all tensors, and every operation in a network is a tensor operation, overwhelmingly matrix multiplication.

Tensors matter because they make computation regular. Instead of looping over neurons one at a time, an entire layer's work is expressed as one large matrix multiply, which is exactly the operation GPUs execute at staggering rates. The deep learning stack, from PyTorch down to CUDA kernels, exists to describe and accelerate tensor operations, and debugging a model is largely a matter of tracking tensor shapes through the pipeline.`,
    analogy: "A tensor is a spreadsheet generalized to any number of dimensions: a column is 1D, a sheet is 2D, a workbook of sheets is 3D. Framing all of AI's data this way lets one kind of machine (a GPU) process all of it with the same few bulk operations.",
    visualExample: "When an LLM processes a batch of 8 prompts of 1,024 tokens each with hidden size 4,096, the activations flow through the network as a tensor of shape 8 by 1,024 by 4,096, about 33 million floating-point numbers per layer.",
  },

  number: {
    explanation: `Every weight and activation is ultimately a single floating-point number stored in memory. Floating point represents values in scientific notation with a sign, an exponent, and a fraction, trading exactness for enormous range. The format's width is a real engineering choice: float32 uses 4 bytes with high precision, float16 and bfloat16 use 2 bytes, and modern inference formats push to 8 or even 4 bits per number.

Precision is a lever on cost. Halving the bits per number halves memory, memory bandwidth, and often doubles throughput on hardware with the right units. Neural networks tolerate this surprisingly well because their behavior is spread across billions of numbers, no single one of which needs to be exact. Most modern training runs in bfloat16 with float32 accumulations, and quantization for deployment continues the squeeze further, which is what lets large models run on laptops and phones.`,
    analogy: "Floating-point precision is like the number of decimal places on a measuring instrument: a chemist may need five, a carpenter one. Networks are forgiving carpenters, so storing measurements more coarsely saves enormous space at little cost to the final build.",
    visualExample: "A 7B-parameter model needs about 28 GB of memory in float32 but only about 4 GB when quantized to 4 bits, which is exactly why tools like Ollama can run capable models on an ordinary MacBook.",
  },

  bit: {
    explanation: `A bit is a single binary digit, 0 or 1, and it is the physical foundation of everything above it in this tree. In hardware a bit is a transistor state or a charge in a memory cell. Groups of bits encode numbers, numbers fill tensors, tensors hold weights and activations, and weights arranged by an architecture become a model. There is nothing else in the machine: every fact an LLM appears to know is, at bottom, a pattern across trillions of bits.

Bits also give AI its natural accounting unit. Model sizes, memory bandwidth, and quantization levels are all measured in bits, and the question 'how few bits per weight can we get away with?' drives an entire subfield, with useful models now running at 4 bits per weight and research probing lower still.`,
    analogy: "Bits are to AI what letters are to literature: a novel is nothing but letters, yet no single letter contains any of the story. Intelligence in a model lives entirely in the arrangement of its bits, not in any bit itself.",
    visualExample: "A 4-bit quantized 70B model is a specific pattern of roughly 280 billion bits on disk; flip enough of them at random and the same file degrades from fluent assistant to noise generator.",
  },

  moe: {
    explanation: `A mixture of experts (MoE) model replaces the single feed-forward network in each transformer block with many parallel FFNs called experts, plus a small learned router. For each token, the router scores all experts and sends the token to only the top few, typically 2 of 8 or 8 of 64 or more. The token is processed by just those experts and their outputs are combined; all other experts stay idle for that token.

The payoff is decoupling knowledge capacity from per-token compute. A model can hold hundreds of billions of parameters of stored knowledge while each token only touches a fraction of them, so it prices like a mid-size dense model at inference while knowing like a giant. Mixtral 8x7B holds 47B parameters but activates about 13B per token; DeepSeek's models push much further, and several frontier systems are widely understood to be MoE.

The costs are engineering complexity and memory. All experts must sit in GPU memory even though few fire per token, and training must balance load so the router does not collapse onto a few favorite experts, which requires auxiliary losses and careful tuning. A useful correction to the name: experts do not specialize by human topic like law or medicine; in practice they specialize in patterns that rarely map to clean human categories.`,
    analogy: "An MoE is a hospital rather than one general practitioner: a triage desk (the router) glances at each case and dispatches it to two relevant specialists. The hospital employs vast expertise, but each patient only consumes two doctors' time.",
    visualExample: "Mixtral 8x7B routes every token to 2 of 8 expert FFNs per layer, giving 47B-parameter quality at roughly the inference cost of a 13B dense model; DeepSeek-V3 scales the same idea to 671B total parameters with 37B active per token.",
  },

  ssm: {
    explanation: `State space models (SSMs) are sequence architectures that process tokens through a fixed-size recurrent state instead of attending to the full history. Conceptually descended from control theory, an SSM maintains a state vector that is updated as each token arrives, with the update rules learned. Mamba's key innovation is making those update rules depend on the current input (selectivity), so the model can decide on the fly what to write into memory and what to forget, recovering much of attention's content-aware routing.

The motivation is complexity. A transformer's attention compares all token pairs, so cost grows quadratically with length and its KV cache grows linearly forever. An SSM does constant work per token and carries constant memory regardless of context length, and during training it can still be computed in parallel across the sequence via convolutional or scan formulations. This makes million-token contexts and cheap streaming inference natural rather than heroic.

The tradeoff is that a fixed-size state is lossy: everything remembered must fit in one compressed vector, so exact recall of arbitrary details from far back is harder than for attention, which keeps everything. Current practice often lands on hybrids that interleave SSM layers with a few attention layers, as in Jamba, aiming for near-transformer quality at far lower long-context cost. SSMs are the strongest current challenger to attention's monopoly.`,
    analogy: "A transformer keeps a full transcript of the meeting and rereads it before every remark; an SSM keeps one continuously rewritten index card. The card never grows heavier no matter how long the meeting runs, but only what was deemed worth writing down survives.",
    visualExample: "AI21's Jamba interleaves Mamba layers with occasional attention layers to serve a 256K-token context on a single GPU, a workload where a pure transformer's KV cache would be prohibitively large.",
  },

  gnn: {
    explanation: `A graph neural network (GNN) operates on graph-structured data: entities as nodes, relationships as edges. Its core operation is message passing. In each round, every node gathers vectors from its neighbors, aggregates them with an order-insensitive operation like a sum or mean, and combines the result with its own vector through learned weights to produce an updated representation. After k rounds, each node's vector summarizes its k-hop neighborhood.

This generalizes the convolution idea to irregular structure. A CNN's neighborhoods are fixed by the pixel grid; a GNN's neighborhoods are defined by the actual edges of the data, which may connect any node to any other. Variants differ mainly in aggregation: GCN uses normalized averaging, GraphSAGE samples neighbors for scalability, and GAT applies attention so a node can weigh some neighbors more than others.

GNNs are the natural fit whenever relationships are the signal. Molecules are graphs of atoms and bonds, social and payment networks are graphs of accounts and transactions, and recommendation data is a graph of users and items. Fraud detection, drug property prediction, and large-scale recommenders are the flagship deployments, and AlphaFold's attention over residue pairs is closely related to graph-style reasoning.`,
    analogy: "A GNN works like rumors spreading through a town: in each round, every person updates their beliefs based on what their direct acquaintances tell them, and after several rounds, each person's view reflects their entire social neighborhood.",
    visualExample: "Payment companies run GNNs over transaction graphs to catch fraud: an account that looks innocent in isolation gets flagged when message passing reveals it sits two hops from a cluster of known mule accounts.",
  },

  autoencoder: {
    explanation: `An autoencoder learns compressed representations by being forced to reconstruct its own input. An encoder network squeezes the input down to a small latent vector (the bottleneck), and a decoder tries to rebuild the original from that vector alone. Since the bottleneck is too small to memorize everything, the network must learn to keep only the input's essential structure, and that learned compression is the point; the reconstruction is just the training signal.

The variational autoencoder (VAE) upgrades this into a proper generative model. Instead of a single point, the encoder outputs a probability distribution in latent space, and training adds a regularizer that keeps the whole latent space smooth and well-organized. The consequence is that any point sampled from the latent space decodes into a plausible output, and nearby points decode into similar outputs, so the latent space becomes navigable.

Autoencoders earn their keep in three ways: dimensionality reduction and denoising, anomaly detection (a model trained to reconstruct normal data reconstructs anomalies badly, and that error is the alarm), and as infrastructure for other models. Stable Diffusion's famous trick is running diffusion inside a VAE's compact latent space instead of raw pixels, cutting the cost of image generation by orders of magnitude.`,
    analogy: "An autoencoder is a game of telephone through a keyhole: one player must describe an image through a channel far too narrow for full detail, and the other must redraw it. To win consistently, the describer learns to transmit exactly what matters most.",
    visualExample: "Stable Diffusion uses a VAE to compress 512x512 images into a 64x64 latent grid, runs the entire denoising process in that small space, then decodes the result back to full-resolution pixels.",
  },

  gan: {
    explanation: `A generative adversarial network (GAN) trains two networks against each other. The generator turns random noise into synthetic samples; the discriminator receives a mix of real and generated samples and learns to tell them apart. The generator's training signal is the discriminator's judgment: it is updated to produce samples the discriminator misclassifies as real. As both improve, the generator is pushed toward the true data distribution, since only samples statistically indistinguishable from real data can fool a strong discriminator.

This adversarial setup was a breakthrough because it sidesteps writing an explicit measure of realism, which is nearly impossible for images. The discriminator is a learned, continuously improving loss function. GANs also generate in a single forward pass, making them extremely fast at inference.

The weakness is training instability. The two networks must stay balanced: if the discriminator gets too strong the generator's gradient vanishes, and generators often collapse to producing a few safe outputs (mode collapse) instead of the data's full diversity. Diffusion models, which trade a stable training objective for slower iterative sampling, displaced GANs at the frontier of image generation in the early 2020s. GANs persist where single-pass speed matters, notably super-resolution, face manipulation, and as adversarial components inside other systems.`,
    analogy: "A GAN is a counterfeiter and an art authenticator locked in an arms race: every fake the authenticator catches teaches the counterfeiter something, and every fake that slips through sharpens the authenticator, until the forgeries become nearly perfect.",
    visualExample: "The website This Person Does Not Exist served a fresh StyleGAN face on every reload, photorealistic people who never lived, and GAN-based upscalers still sharpen textures in video game graphics pipelines.",
  },

  diffusion: {
    explanation: `A diffusion model generates data by learning to reverse the destruction of it. The forward process is fixed and trivial: take a real image and add a little Gaussian noise over many steps until nothing but static remains. The model, typically a U-Net or transformer, is trained on a single stable task: given a noisy image and the noise level, predict the noise that was added. Generation then runs the process in reverse, starting from pure random static and applying the model over and over, subtracting a little predicted noise each step until a coherent image crystallizes.

Text conditioning is what makes this useful: the prompt, encoded by a text model, is injected into every denoising step through cross-attention, steering each round of refinement toward the description. Because generation happens gradually, structure emerges coarse to fine, with composition settling early and detail late. Latent diffusion, the design behind Stable Diffusion, runs all of this inside a VAE's compressed space rather than on raw pixels, making the whole process affordable.

Diffusion displaced GANs as the state of the art because its training objective is a stable, well-behaved regression with none of the adversarial balancing act, and it covers the data's full diversity rather than collapsing to safe modes. Its cost is iterative sampling, tens of model evaluations per image versus a GAN's one, though distillation methods now compress generation to a handful of steps. The paradigm powers DALL-E, Stable Diffusion, and Imagen, extends to video in Sora, and reaches into audio and molecular design.`,
    analogy: "Diffusion generation is like a sculptor who insists the figure is already inside the block of marble: starting from a shapeless mass of noise, each pass removes a little more of what does not belong, guided by the commission (the prompt), until the image is freed.",
    visualExample: "Type 'an astronaut riding a horse' into Stable Diffusion and it begins with pure random static, then over a few dozen denoising steps a rough silhouette appears, then limbs and a suit, then fabric texture and lighting, each step conditioned on your words.",
  },
};
