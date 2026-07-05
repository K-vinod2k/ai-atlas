import type { NodeMath } from "./types";

/** Math overlays keyed by taxonomy node id (~25 math-bearing nodes). */
export const MATH_BY_NODE_ID: Record<string, NodeMath> = {
  attention: {
    title: "Scaled Dot-Product Attention",
    formula: "\\text{Attention}(Q,K,V) = \\text{softmax}\\left(\\frac{QK^T}{\\sqrt{d_k}}\\right)V",
    summary:
      "Each token builds a weighted mix of value vectors from other tokens, where weights come from query-key similarity.",
    symbols: [
      { symbol: "Q", meaning: "Query matrix — what each token is looking for" },
      { symbol: "K", meaning: "Key matrix — what each token advertises about itself" },
      { symbol: "V", meaning: "Value matrix — the content each token contributes" },
      { symbol: "d_k", meaning: "Key dimension; scaling prevents softmax saturation" },
    ],
  },
  "self-attn": {
    title: "Self-Attention",
    formula: "Q = XW_Q,\\; K = XW_K,\\; V = XW_V",
    summary: "Q, K, and V are all derived from the same input sequence X via learned projections.",
    symbols: [
      { symbol: "X", meaning: "Input token embeddings for the sequence" },
      { symbol: "W_Q, W_K, W_V", meaning: "Learned weight matrices that project X into query, key, value spaces" },
    ],
  },
  mha: {
    title: "Multi-Head Attention",
    formula: "\\text{MHA}(X) = \\text{Concat}(\\text{head}_1,\\ldots,\\text{head}_h)W_O",
    summary: "Several attention heads run in parallel, each learning a different relationship pattern.",
    symbols: [
      { symbol: "h", meaning: "Number of attention heads" },
      { symbol: "head_i", meaning: "Attention output for head i" },
      { symbol: "W_O", meaning: "Output projection that mixes head results" },
    ],
  },
  "activation-fn": {
    title: "Softmax",
    formula: "\\text{softmax}(z_i) = \\frac{e^{z_i}}{\\sum_j e^{z_j}}",
    summary: "Converts raw scores into a probability distribution that sums to 1.",
    symbols: [
      { symbol: "z_i", meaning: "Raw score (logit) for class or token i" },
      { symbol: "e^{z_i}", meaning: "Exponentiated score — larger values dominate" },
      { symbol: "\\sum_j", meaning: "Normalization over all classes/tokens j" },
    ],
  },
  perceptron: {
    title: "Perceptron",
    formula: "y = \\sigma\\left(\\sum_{i=1}^{n} w_i x_i + b\\right)",
    summary: "A single neuron computes a weighted sum of inputs plus bias, then applies an activation.",
    symbols: [
      { symbol: "w_i", meaning: "Weight for input feature i" },
      { symbol: "x_i", meaning: "Input feature i" },
      { symbol: "b", meaning: "Bias term shifting the decision boundary" },
      { symbol: "\\sigma", meaning: "Activation function (e.g. ReLU, sigmoid)" },
    ],
  },
  neuron: {
    title: "Neuron Output",
    formula: "a = f\\left(\\mathbf{w}^T \\mathbf{x} + b\\right)",
    summary: "The activation value is the activation function applied to the weighted input sum.",
    symbols: [
      { symbol: "\\mathbf{w}", meaning: "Weight vector" },
      { symbol: "\\mathbf{x}", meaning: "Input vector" },
      { symbol: "f", meaning: "Non-linear activation function" },
      { symbol: "a", meaning: "Output activation value" },
    ],
  },
  embedding: {
    title: "Token Embedding",
    formula: "\\mathbf{e}_t = E[t] \\in \\mathbb{R}^d",
    summary: "Each token ID maps to a learned d-dimensional vector via an embedding lookup table E.",
    symbols: [
      { symbol: "t", meaning: "Token index in vocabulary" },
      { symbol: "E", meaning: "Embedding matrix of shape |V| x d" },
      { symbol: "d", meaning: "Embedding dimension" },
    ],
  },
  embeddings: {
    title: "Embedding Similarity",
    formula: "\\text{sim}(\\mathbf{a}, \\mathbf{b}) = \\frac{\\mathbf{a} \\cdot \\mathbf{b}}{\\|\\mathbf{a}\\|\\|\\mathbf{b}\\|}",
    summary: "Cosine similarity measures how aligned two embedding vectors are.",
    symbols: [
      { symbol: "\\mathbf{a}, \\mathbf{b}", meaning: "Embedding vectors for two pieces of text" },
      { symbol: "\\cdot", meaning: "Dot product — measures alignment" },
      { symbol: "\\|\\mathbf{a}\\|", meaning: "L2 norm (vector length)" },
    ],
  },
  loss: {
    title: "Cross-Entropy Loss",
    formula: "L = -\\sum_{i=1}^{C} y_i \\log(\\hat{y}_i)",
    summary: "Penalizes the model when predicted probability mass is far from the true label.",
    symbols: [
      { symbol: "y_i", meaning: "True label (one-hot: 1 for correct class, 0 otherwise)" },
      { symbol: "\\hat{y}_i", meaning: "Model's predicted probability for class i" },
      { symbol: "C", meaning: "Number of classes" },
    ],
  },
  backprop: {
    title: "Chain Rule (Backprop)",
    formula: "\\frac{\\partial L}{\\partial w} = \\frac{\\partial L}{\\partial a} \\cdot \\frac{\\partial a}{\\partial z} \\cdot \\frac{\\partial z}{\\partial w}",
    summary: "Gradients flow backward through the network by multiplying local derivatives at each layer.",
    symbols: [
      { symbol: "L", meaning: "Loss value" },
      { symbol: "w", meaning: "Weight parameter being updated" },
      { symbol: "a", meaning: "Activation at a neuron" },
      { symbol: "z", meaning: "Pre-activation (weighted sum)" },
    ],
  },
  optimizers: {
    title: "Adam Update",
    formula: "w_{t+1} = w_t - \\eta \\frac{\\hat{m}_t}{\\sqrt{\\hat{v}_t} + \\epsilon}",
    summary: "Adam adapts the learning rate per parameter using running estimates of gradient mean and variance.",
    symbols: [
      { symbol: "w_t", meaning: "Weight at step t" },
      { symbol: "\\eta", meaning: "Learning rate" },
      { symbol: "\\hat{m}_t", meaning: "Bias-corrected first moment (mean gradient)" },
      { symbol: "\\hat{v}_t", meaning: "Bias-corrected second moment (gradient variance)" },
      { symbol: "\\epsilon", meaning: "Small constant for numerical stability" },
    ],
  },
  linreg: {
    title: "Linear Regression",
    formula: "\\hat{y} = \\mathbf{w}^T \\mathbf{x} + b",
    summary: "Predicts a continuous target as a weighted combination of input features.",
    symbols: [
      { symbol: "\\hat{y}", meaning: "Predicted output" },
      { symbol: "\\mathbf{w}", meaning: "Learned weight vector" },
      { symbol: "\\mathbf{x}", meaning: "Input feature vector" },
      { symbol: "b", meaning: "Intercept (bias)" },
    ],
  },
  pca: {
    title: "Principal Component Analysis",
    formula: "\\mathbf{z} = W^T \\mathbf{x}, \\quad W = \\text{top-}k \\text{ eigenvectors of } \\Sigma",
    summary: "Projects data onto directions of maximum variance to reduce dimensionality.",
    symbols: [
      { symbol: "\\mathbf{z}", meaning: "Reduced-dimension representation" },
      { symbol: "W", meaning: "Projection matrix of principal components" },
      { symbol: "\\Sigma", meaning: "Covariance matrix of the data" },
      { symbol: "k", meaning: "Number of components to keep" },
    ],
  },
  qlearning: {
    title: "Q-Learning Update",
    formula: "Q(s,a) \\leftarrow Q(s,a) + \\alpha\\left[r + \\gamma \\max_{a'} Q(s',a') - Q(s,a)\\right]",
    summary: "Updates the value of taking action a in state s toward the observed reward plus future value.",
    symbols: [
      { symbol: "Q(s,a)", meaning: "Estimated value of action a in state s" },
      { symbol: "\\alpha", meaning: "Learning rate" },
      { symbol: "r", meaning: "Immediate reward received" },
      { symbol: "\\gamma", meaning: "Discount factor for future rewards" },
      { symbol: "s'", meaning: "Next state after taking action a" },
    ],
  },
  "policy-grad": {
    title: "Policy Gradient",
    formula: "\\nabla_\\theta J(\\theta) = \\mathbb{E}_{\\pi_\\theta}\\left[\\nabla_\\theta \\log \\pi_\\theta(a|s) \\cdot A(s,a)\\right]",
    summary: "Increases probability of actions that led to better-than-expected outcomes.",
    symbols: [
      { symbol: "\\pi_\\theta", meaning: "Policy (action distribution) parameterized by theta" },
      { symbol: "A(s,a)", meaning: "Advantage — how much better action a was than average" },
      { symbol: "J(\\theta)", meaning: "Expected cumulative reward objective" },
    ],
  },
  diffusion: {
    title: "Diffusion Forward Process",
    formula: "q(x_t | x_{t-1}) = \\mathcal{N}(x_t; \\sqrt{1-\\beta_t}\\, x_{t-1}, \\beta_t I)",
    summary: "Gradually adds Gaussian noise to data over T timesteps until it becomes pure noise.",
    symbols: [
      { symbol: "x_t", meaning: "Data at noise step t" },
      { symbol: "\\beta_t", meaning: "Noise schedule at step t" },
      { symbol: "\\mathcal{N}", meaning: "Gaussian (normal) distribution" },
      { symbol: "I", meaning: "Identity covariance matrix" },
    ],
  },
  peft: {
    title: "LoRA Low-Rank Update",
    formula: "W' = W + BA, \\quad B \\in \\mathbb{R}^{d \\times r},\\; A \\in \\mathbb{R}^{r \\times k}",
    summary: "Instead of updating full weight matrix W, train small low-rank matrices B and A.",
    symbols: [
      { symbol: "W", meaning: "Frozen pretrained weight matrix" },
      { symbol: "B, A", meaning: "Trainable low-rank adapter matrices" },
      { symbol: "r", meaning: "Rank — controls adapter size (typically 4-64)" },
      { symbol: "d, k", meaning: "Output and input dimensions of the layer" },
    ],
  },
  dpo: {
    title: "DPO Loss",
    formula: "L_{\\text{DPO}} = -\\log \\sigma\\left(\\beta \\log \\frac{\\pi_\\theta(y_w|x)}{\\pi_{\\text{ref}}(y_w|x)} - \\beta \\log \\frac{\\pi_\\theta(y_l|x)}{\\pi_{\\text{ref}}(y_l|x)}\\right)",
    summary: "Directly optimizes the policy to prefer chosen responses over rejected ones.",
    symbols: [
      { symbol: "y_w, y_l", meaning: "Chosen (winning) and rejected (losing) responses" },
      { symbol: "\\pi_\\theta", meaning: "Policy being trained" },
      { symbol: "\\pi_{\\text{ref}}", meaning: "Frozen reference policy" },
      { symbol: "\\beta", meaning: "Temperature controlling deviation from reference" },
      { symbol: "\\sigma", meaning: "Sigmoid function" },
    ],
  },
  norm: {
    title: "Layer Normalization",
    formula: "\\text{LN}(x) = \\gamma \\odot \\frac{x - \\mu}{\\sqrt{\\sigma^2 + \\epsilon}} + \\beta",
    summary: "Normalizes activations across features within a single token/layer to stabilize training.",
    symbols: [
      { symbol: "\\mu", meaning: "Mean of activations" },
      { symbol: "\\sigma^2", meaning: "Variance of activations" },
      { symbol: "\\gamma, \\beta", meaning: "Learnable scale and shift parameters" },
      { symbol: "\\epsilon", meaning: "Small constant for numerical stability" },
    ],
  },
  residual: {
    title: "Residual Connection",
    formula: "y = x + F(x)",
    summary: "Adds the layer input directly to its output so gradients can flow around the transformation.",
    symbols: [
      { symbol: "x", meaning: "Input to the sub-layer" },
      { symbol: "F(x)", meaning: "Transformation applied by the sub-layer (attention, FFN, etc.)" },
      { symbol: "y", meaning: "Output passed to the next sub-layer" },
    ],
  },
  ffn: {
    title: "Feed-Forward Network",
    formula: "\\text{FFN}(x) = W_2 \\cdot \\text{GELU}(W_1 x + b_1) + b_2",
    summary: "A two-layer MLP applied independently to each token position.",
    symbols: [
      { symbol: "W_1, W_2", meaning: "Up-projection and down-projection weight matrices" },
      { symbol: "GELU", meaning: "Gaussian Error Linear Unit activation" },
      { symbol: "x", meaning: "Input token representation" },
    ],
  },
  posenc: {
    title: "Sinusoidal Positional Encoding",
    formula: "PE_{(pos,2i)} = \\sin\\left(\\frac{pos}{10000^{2i/d}}\\right)",
    summary: "Adds position-dependent sine/cosine signals so the model knows token order.",
    symbols: [
      { symbol: "pos", meaning: "Position of the token in the sequence" },
      { symbol: "i", meaning: "Dimension index within the embedding" },
      { symbol: "d", meaning: "Embedding dimension" },
    ],
  },
  cnn: {
    title: "Convolution",
    formula: "(f * g)[n] = \\sum_{m} f[m] \\cdot g[n - m]",
    summary: "Slides a learned filter over local regions to detect spatial patterns.",
    symbols: [
      { symbol: "f", meaning: "Input feature map" },
      { symbol: "g", meaning: "Learned convolution kernel (filter)" },
      { symbol: "*", meaning: "Convolution operation" },
    ],
  },
  moe: {
    title: "Mixture of Experts Routing",
    formula: "y = \\sum_{i=1}^{N} G(x)_i \\cdot E_i(x)",
    summary: "A gating function selects a few expert networks to process each token.",
    symbols: [
      { symbol: "G(x)", meaning: "Gating/router output — sparse weights over experts" },
      { symbol: "E_i(x)", meaning: "Output of expert network i" },
      { symbol: "N", meaning: "Total number of expert networks" },
    ],
  },
  ssm: {
    title: "State Space Model",
    formula: "h_t = A h_{t-1} + B x_t, \\quad y_t = C h_t",
    summary: "Maintains a hidden state that evolves linearly, enabling O(L) sequence processing.",
    symbols: [
      { symbol: "h_t", meaning: "Hidden state at timestep t" },
      { symbol: "A, B, C", meaning: "State transition, input, and output matrices" },
      { symbol: "x_t", meaning: "Input at timestep t" },
    ],
  },
  quant: {
    title: "Quantization",
    formula: "w_q = \\text{round}\\left(\\frac{w - z}{s}\\right)",
    summary: "Maps floating-point weights to integers using a scale s and zero-point z.",
    symbols: [
      { symbol: "w", meaning: "Original float weight" },
      { symbol: "w_q", meaning: "Quantized integer weight" },
      { symbol: "s", meaning: "Scale factor" },
      { symbol: "z", meaning: "Zero-point offset" },
    ],
  },
  distill: {
    title: "Knowledge Distillation",
    formula: "L = \\alpha \\cdot L_{\\text{hard}} + (1-\\alpha) \\cdot T^2 \\cdot \\text{KL}\\left(\\frac{p_s}{T} \\Big\\| \\frac{p_t}{T}\\right)",
    summary: "Student model learns from both hard labels and softened teacher probabilities.",
    symbols: [
      { symbol: "p_s, p_t", meaning: "Student and teacher output distributions" },
      { symbol: "T", meaning: "Temperature — softens probability distributions" },
      { symbol: "\\alpha", meaning: "Balance between hard-label and distillation loss" },
      { symbol: "KL", meaning: "Kullback-Leibler divergence" },
    ],
  },
};
