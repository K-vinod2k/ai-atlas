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
  svm: {
    title: "Maximum-Margin Objective",
    formula: "\\min_{\\mathbf{w},b} \\frac{1}{2}\\|\\mathbf{w}\\|^2 \\quad \\text{s.t.} \\quad y_i(\\mathbf{w}^T\\mathbf{x}_i + b) \\geq 1",
    summary:
      "Finds the separating hyperplane that maximizes the distance (margin) to the closest points of each class; the margin width is 2/||w||.",
    symbols: [
      { symbol: "\\mathbf{w}", meaning: "Normal vector defining the separating hyperplane" },
      { symbol: "b", meaning: "Offset of the hyperplane from the origin" },
      { symbol: "y_i", meaning: "Class label of example i, either +1 or -1" },
      { symbol: "\\mathbf{x}_i", meaning: "Feature vector of example i; those on the margin are support vectors" },
    ],
  },
  kmeans: {
    title: "k-Means Objective",
    formula: "J = \\sum_{j=1}^{k} \\sum_{\\mathbf{x} \\in C_j} \\|\\mathbf{x} - \\boldsymbol{\\mu}_j\\|^2",
    summary:
      "Minimizes the total squared distance between each point and the centroid of its assigned cluster, alternating assignment and centroid-update steps.",
    symbols: [
      { symbol: "k", meaning: "Number of clusters, chosen in advance" },
      { symbol: "C_j", meaning: "Set of points currently assigned to cluster j" },
      { symbol: "\\boldsymbol{\\mu}_j", meaning: "Centroid (mean) of cluster j" },
      { symbol: "J", meaning: "Within-cluster sum of squares being minimized" },
    ],
  },
  nb: {
    title: "Naive Bayes Classifier",
    formula: "P(y \\mid \\mathbf{x}) \\propto P(y) \\prod_{i=1}^{n} P(x_i \\mid y)",
    summary:
      "Applies Bayes' rule with the simplifying assumption that features are conditionally independent given the class, making the joint probability a simple product.",
    symbols: [
      { symbol: "P(y)", meaning: "Prior probability of class y from training frequencies" },
      { symbol: "P(x_i \\mid y)", meaning: "Likelihood of feature i's value given the class" },
      { symbol: "\\propto", meaning: "Proportional to — the evidence term P(x) is the same for all classes" },
      { symbol: "n", meaning: "Number of features, each treated as independent" },
    ],
  },
  bayesian: {
    title: "Bayes' Theorem",
    formula: "P(H \\mid D) = \\frac{P(D \\mid H)\\, P(H)}{P(D)}",
    summary:
      "Updates belief in a hypothesis after seeing data: posterior equals likelihood times prior, normalized by the evidence.",
    symbols: [
      { symbol: "P(H \\mid D)", meaning: "Posterior — belief in hypothesis H after observing data D" },
      { symbol: "P(D \\mid H)", meaning: "Likelihood — how probable the data is if H were true" },
      { symbol: "P(H)", meaning: "Prior — belief in H before seeing the data" },
      { symbol: "P(D)", meaning: "Evidence — total probability of the data under all hypotheses" },
    ],
  },
  gan: {
    title: "GAN Minimax Objective",
    formula: "\\min_G \\max_D \\; \\mathbb{E}_{x}[\\log D(x)] + \\mathbb{E}_{z}[\\log(1 - D(G(z)))]",
    summary:
      "The discriminator learns to tell real data from fakes while the generator learns to fool it — a two-player game whose equilibrium is realistic generation.",
    symbols: [
      { symbol: "G", meaning: "Generator mapping random noise z to synthetic samples" },
      { symbol: "D", meaning: "Discriminator outputting the probability a sample is real" },
      { symbol: "x", meaning: "Real sample drawn from the training data" },
      { symbol: "z", meaning: "Random noise vector the generator transforms" },
    ],
  },
  autoencoder: {
    title: "VAE Evidence Lower Bound (ELBO)",
    formula: "\\mathcal{L} = \\mathbb{E}_{q(z|x)}[\\log p(x \\mid z)] - \\text{KL}\\big(q(z \\mid x) \\,\\|\\, p(z)\\big)",
    summary:
      "A VAE maximizes reconstruction quality while keeping the learned latent distribution close to a simple prior, so the latent space is smooth and sampleable.",
    symbols: [
      { symbol: "q(z \\mid x)", meaning: "Encoder — approximate posterior over latents given input x" },
      { symbol: "p(x \\mid z)", meaning: "Decoder — reconstructs the input from latent z" },
      { symbol: "p(z)", meaning: "Prior over latents, usually a standard Gaussian" },
      { symbol: "KL", meaning: "Divergence pulling the encoder toward the prior (regularizer)" },
    ],
  },
  evolutionary: {
    title: "Fitness-Proportional Selection",
    formula: "P(\\text{select } i) = \\frac{f(i)}{\\sum_{j=1}^{N} f(j)}",
    summary:
      "Each generation, candidates are selected to reproduce with probability proportional to their fitness; mutation and crossover then create the next population.",
    symbols: [
      { symbol: "f(i)", meaning: "Fitness score of candidate i on the objective" },
      { symbol: "N", meaning: "Population size" },
      { symbol: "P(\\text{select } i)", meaning: "Chance candidate i becomes a parent for the next generation" },
    ],
  },
  "cross-attn": {
    title: "Cross-Attention",
    formula: "Q = X_{\\text{dec}} W_Q, \\quad K = X_{\\text{enc}} W_K, \\quad V = X_{\\text{enc}} W_V",
    summary:
      "Queries come from one sequence (the decoder) while keys and values come from another (the encoder), letting the output attend to the input.",
    symbols: [
      { symbol: "X_{\\text{dec}}", meaning: "Decoder-side token representations asking the questions" },
      { symbol: "X_{\\text{enc}}", meaning: "Encoder-side representations being attended to" },
      { symbol: "W_Q, W_K, W_V", meaning: "Learned projection matrices, as in self-attention" },
    ],
  },
  rl: {
    title: "Expected Return",
    formula: "J(\\pi) = \\mathbb{E}_{\\pi}\\left[\\sum_{t=0}^{\\infty} \\gamma^t \\, r_t\\right]",
    summary:
      "Reinforcement learning seeks the policy that maximizes the discounted sum of future rewards collected while interacting with an environment.",
    symbols: [
      { symbol: "\\pi", meaning: "Policy — the agent's rule for choosing actions in states" },
      { symbol: "r_t", meaning: "Reward received at timestep t" },
      { symbol: "\\gamma", meaning: "Discount factor in [0,1) weighting near rewards over far ones" },
      { symbol: "J(\\pi)", meaning: "Expected cumulative discounted reward under policy pi" },
    ],
  },
  gbm: {
    title: "Gradient Boosting Update",
    formula: "F_m(x) = F_{m-1}(x) + \\nu \\, h_m(x)",
    summary:
      "Each round fits a small tree h_m to the residual errors (negative gradient) of the current ensemble, then adds it with a small learning rate.",
    symbols: [
      { symbol: "F_m", meaning: "Ensemble prediction after m boosting rounds" },
      { symbol: "h_m", meaning: "New weak learner fit to the current residuals" },
      { symbol: "\\nu", meaning: "Learning rate (shrinkage), typically 0.01-0.3" },
    ],
  },
  trees: {
    title: "Information Gain",
    formula: "IG = H(S) - \\sum_{v} \\frac{|S_v|}{|S|} H(S_v)",
    summary:
      "A split is chosen to maximize the reduction in impurity (entropy) between the parent node and the weighted average of its children.",
    symbols: [
      { symbol: "H(S)", meaning: "Entropy (impurity) of the label distribution in node S" },
      { symbol: "S_v", meaning: "Subset of samples going to child v after the split" },
      { symbol: "IG", meaning: "Information gain — impurity removed by this split" },
    ],
  },
  knn: {
    title: "k-NN Prediction",
    formula: "\\hat{y} = \\text{mode}\\big(\\{ y_i : \\mathbf{x}_i \\in N_k(\\mathbf{x}) \\}\\big)",
    summary:
      "Classifies a query point by majority vote among its k closest training examples under a chosen distance metric; no training phase at all.",
    symbols: [
      { symbol: "N_k(\\mathbf{x})", meaning: "The k nearest training points to query x" },
      { symbol: "y_i", meaning: "Label of neighbor i" },
      { symbol: "k", meaning: "Number of neighbors; small k is flexible, large k is smooth" },
    ],
  },
  rf: {
    title: "Bagged Ensemble Prediction",
    formula: "\\hat{y} = \\frac{1}{B} \\sum_{b=1}^{B} T_b(\\mathbf{x})",
    summary:
      "Averages (or majority-votes) many trees, each trained on a bootstrap sample with a random subset of features per split, which cancels individual trees' variance.",
    symbols: [
      { symbol: "B", meaning: "Number of trees in the forest" },
      { symbol: "T_b", meaning: "Prediction of tree b, trained on a bootstrap resample" },
      { symbol: "\\hat{y}", meaning: "Ensemble output — average for regression, vote for classification" },
    ],
  },
  rlhf: {
    title: "RLHF Objective with KL Penalty",
    formula: "\\max_{\\pi_\\theta} \\; \\mathbb{E}\\big[ r_\\phi(x, y) \\big] - \\beta \\, \\text{KL}\\big(\\pi_\\theta \\,\\|\\, \\pi_{\\text{ref}}\\big)",
    summary:
      "The policy is tuned to maximize a learned reward model's score while a KL penalty keeps it from drifting too far from the reference model.",
    symbols: [
      { symbol: "r_\\phi(x, y)", meaning: "Reward model score for response y to prompt x" },
      { symbol: "\\pi_\\theta", meaning: "Policy being fine-tuned" },
      { symbol: "\\pi_{\\text{ref}}", meaning: "Frozen reference (SFT) model" },
      { symbol: "\\beta", meaning: "Strength of the KL penalty against drift" },
    ],
  },
  retrieval: {
    title: "BM25 Ranking",
    formula: "\\text{score}(D, Q) = \\sum_{t \\in Q} \\text{IDF}(t) \\cdot \\frac{f(t, D)(k_1 + 1)}{f(t, D) + k_1(1 - b + b \\frac{|D|}{\\text{avgdl}})}",
    summary:
      "The classic lexical relevance score: rare query terms count more, repeated terms saturate, and long documents are penalized. Often combined with vector search in hybrid retrieval.",
    symbols: [
      { symbol: "f(t, D)", meaning: "Frequency of term t in document D" },
      { symbol: "\\text{IDF}(t)", meaning: "Inverse document frequency — rarity bonus for term t" },
      { symbol: "k_1, b", meaning: "Tuning constants for saturation and length normalization" },
      { symbol: "\\text{avgdl}", meaning: "Average document length in the corpus" },
    ],
  },
  rnn: {
    title: "Recurrent Update",
    formula: "h_t = \\tanh(W_h h_{t-1} + W_x x_t + b)",
    summary:
      "At each timestep the hidden state combines the previous state with the new input, carrying memory forward through the sequence one step at a time.",
    symbols: [
      { symbol: "h_t", meaning: "Hidden state (memory) at timestep t" },
      { symbol: "x_t", meaning: "Input at timestep t" },
      { symbol: "W_h, W_x", meaning: "Recurrent and input weight matrices, shared across timesteps" },
      { symbol: "\\tanh", meaning: "Squashing non-linearity keeping the state bounded" },
    ],
  },
  mlp: {
    title: "MLP Forward Pass",
    formula: "\\mathbf{h}^{(l+1)} = \\sigma\\big(W^{(l)} \\mathbf{h}^{(l)} + \\mathbf{b}^{(l)}\\big)",
    summary:
      "Each layer applies a linear transformation followed by a non-linearity; stacking layers lets the network approximate arbitrarily complex functions.",
    symbols: [
      { symbol: "\\mathbf{h}^{(l)}", meaning: "Activations at layer l (layer 0 is the input)" },
      { symbol: "W^{(l)}, \\mathbf{b}^{(l)}", meaning: "Weight matrix and bias vector of layer l" },
      { symbol: "\\sigma", meaning: "Element-wise activation such as ReLU or GELU" },
    ],
  },
  bandit: {
    title: "UCB Action Selection",
    formula: "a_t = \\arg\\max_a \\left[ \\hat{\\mu}_a + c \\sqrt{\\frac{\\ln t}{n_a}} \\right]",
    summary:
      "Upper Confidence Bound picks the arm with the best optimistic estimate: high observed reward, or high uncertainty because it was tried rarely.",
    symbols: [
      { symbol: "\\hat{\\mu}_a", meaning: "Average reward observed so far for arm a" },
      { symbol: "n_a", meaning: "Number of times arm a has been pulled" },
      { symbol: "t", meaning: "Total number of pulls so far" },
      { symbol: "c", meaning: "Exploration strength — how much uncertainty is rewarded" },
    ],
  },
  selfsup: {
    title: "Next-Token Objective",
    formula: "L = -\\sum_{t=1}^{T} \\log p_\\theta(x_t \\mid x_{<t})",
    summary:
      "Self-supervised language modeling turns raw text into labels: predict each token given everything before it, so no human annotation is needed.",
    symbols: [
      { symbol: "x_t", meaning: "Token at position t — the free label" },
      { symbol: "x_{<t}", meaning: "All tokens before position t (the context)" },
      { symbol: "p_\\theta", meaning: "Model's predicted distribution over the vocabulary" },
    ],
  },
  "kg-embed": {
    title: "TransE Scoring",
    formula: "d(h, r, t) = \\|\\mathbf{h} + \\mathbf{r} - \\mathbf{t}\\|",
    summary:
      "Embeds entities and relations as vectors so that a true triple's head plus relation lands near its tail; small distance means a plausible fact.",
    symbols: [
      { symbol: "\\mathbf{h}, \\mathbf{t}", meaning: "Embeddings of the head and tail entities" },
      { symbol: "\\mathbf{r}", meaning: "Embedding of the relation, acting as a translation" },
      { symbol: "d", meaning: "Distance — low for true triples, high for corrupted ones" },
    ],
  },
};
