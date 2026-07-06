import type { WalkthroughStep } from "./types";

/** Step-by-step walkthroughs for process-like nodes, keyed by taxonomy node id. */
export const WALKTHROUGHS_BY_NODE_ID: Record<string, WalkthroughStep[]> = {
  training: [
    {
      step: 1,
      title: "Sample a batch",
      body: "Draw a mini-batch of examples from the training set. Batching amortizes GPU work and gives a less noisy gradient than single examples.",
    },
    {
      step: 2,
      title: "Forward pass",
      body: "Run the batch through the model to produce predictions using the current weights.",
    },
    {
      step: 3,
      title: "Compute the loss",
      body: "Compare predictions to targets with a loss function. This single scalar summarizes how wrong the model is on this batch.",
      formula: "L = \\frac{1}{B}\\sum_{i=1}^{B} \\ell(\\hat{y}_i, y_i)",
    },
    {
      step: 4,
      title: "Backward pass",
      body: "Backpropagation computes the gradient of the loss with respect to every weight in the network.",
    },
    {
      step: 5,
      title: "Optimizer step",
      body: "The optimizer (SGD, Adam) nudges each weight against its gradient. Repeat from step 1 for millions of batches until the loss plateaus.",
      formula: "w \\leftarrow w - \\eta \\nabla_w L",
    },
  ],
  backprop: [
    {
      step: 1,
      title: "Run the forward pass and cache",
      body: "Compute the output layer by layer, storing each intermediate activation. These cached values are needed to compute gradients later.",
    },
    {
      step: 2,
      title: "Compute the output gradient",
      body: "Differentiate the loss with respect to the model's output. For cross-entropy with softmax this is simply prediction minus target.",
    },
    {
      step: 3,
      title: "Apply the chain rule backward",
      body: "Move backward layer by layer, multiplying each layer's local derivative into the running gradient.",
      formula: "\\frac{\\partial L}{\\partial w} = \\frac{\\partial L}{\\partial a} \\cdot \\frac{\\partial a}{\\partial z} \\cdot \\frac{\\partial z}{\\partial w}",
    },
    {
      step: 4,
      title: "Accumulate weight gradients",
      body: "At each layer, combine the incoming gradient with the cached activations to get the gradient for that layer's weights and biases.",
    },
    {
      step: 5,
      title: "Hand off to the optimizer",
      body: "Backprop only computes gradients; the optimizer decides how to turn them into weight updates.",
    },
  ],
  rlhf: [
    {
      step: 1,
      title: "Supervised fine-tune a base model",
      body: "Start from a pretrained model and fine-tune it on high-quality instruction/response demonstrations so it can follow instructions at all.",
    },
    {
      step: 2,
      title: "Collect human preference data",
      body: "Sample two or more responses per prompt and have human raters pick which is better. This is far cheaper than writing perfect answers.",
    },
    {
      step: 3,
      title: "Train a reward model",
      body: "Fit a model that scores any response, trained so preferred responses score higher than rejected ones.",
      formula: "L_{RM} = -\\log \\sigma\\big(r(x, y_w) - r(x, y_l)\\big)",
    },
    {
      step: 4,
      title: "Optimize the policy with RL",
      body: "Use PPO to maximize the reward model's score, with a KL penalty against the reference model so the policy does not drift into reward hacking.",
    },
    {
      step: 5,
      title: "Evaluate and iterate",
      body: "Check for regressions and over-optimization, gather fresh preferences on the new model's outputs, and repeat.",
    },
  ],
  dpo: [
    {
      step: 1,
      title: "Collect preference pairs",
      body: "As in RLHF, gather (prompt, chosen response, rejected response) triples from human or AI feedback.",
    },
    {
      step: 2,
      title: "Keep a frozen reference model",
      body: "Snapshot the SFT model. DPO measures how much the policy's preferences shift relative to this reference.",
    },
    {
      step: 3,
      title: "Optimize the contrastive loss directly",
      body: "A single supervised-style loss raises the likelihood of chosen responses and lowers rejected ones, weighted by the reference model. No reward model, no RL loop.",
      formula: "L = -\\log \\sigma\\left(\\beta \\log \\tfrac{\\pi_\\theta(y_w|x)}{\\pi_{ref}(y_w|x)} - \\beta \\log \\tfrac{\\pi_\\theta(y_l|x)}{\\pi_{ref}(y_l|x)}\\right)",
    },
    {
      step: 4,
      title: "Tune beta and evaluate",
      body: "Beta controls how far the policy may drift from the reference. Too low and nothing changes; too high and the model degrades on general tasks.",
    },
  ],
  quant: [
    {
      step: 1,
      title: "Pick a precision and scheme",
      body: "Choose the target bit width (8-bit, 4-bit) and whether to quantize weights only or weights plus activations.",
    },
    {
      step: 2,
      title: "Calibrate scale factors",
      body: "Run a small calibration set through the model to find the value range of each weight group, then compute a scale that maps floats onto the integer grid.",
      formula: "w_q = \\text{round}\\left(\\frac{w - z}{s}\\right)",
    },
    {
      step: 3,
      title: "Quantize and pack",
      body: "Convert weights to integers and pack them into a compact format such as GGUF or GPTQ. A 4-bit model is roughly one quarter the size of float16.",
    },
    {
      step: 4,
      title: "Verify quality",
      body: "Measure perplexity or task accuracy against the full-precision model. Sensitive layers can be kept at higher precision if quality drops.",
    },
  ],
  distill: [
    {
      step: 1,
      title: "Pick teacher and student",
      body: "The teacher is a large accurate model; the student is the small model you actually want to deploy.",
    },
    {
      step: 2,
      title: "Generate soft targets",
      body: "Run training inputs through the teacher and record its full probability distribution, softened with a temperature so near-miss classes carry signal.",
    },
    {
      step: 3,
      title: "Train the student on both signals",
      body: "The student minimizes a blend of the normal hard-label loss and a KL term pulling its distribution toward the teacher's.",
      formula: "L = \\alpha L_{hard} + (1-\\alpha) T^2 \\, \\text{KL}(p_s \\| p_t)",
    },
    {
      step: 4,
      title: "Evaluate the trade-off",
      body: "Compare the student's accuracy and latency to the teacher. Well-distilled students often keep most of the quality at a fraction of the cost.",
    },
  ],
  "react-loop": [
    {
      step: 1,
      title: "Reason about the goal",
      body: "The model writes an explicit thought: what is known, what is missing, what to do next.",
    },
    {
      step: 2,
      title: "Act",
      body: "Based on the thought, it emits a structured action: a tool call such as a web search, code execution, or file read.",
    },
    {
      step: 3,
      title: "Observe",
      body: "The tool's output is appended to the context as an observation the model can read on the next turn.",
    },
    {
      step: 4,
      title: "Loop or finish",
      body: "The model reasons again with the new evidence. The cycle repeats until it decides the goal is met and emits a final answer.",
    },
  ],
  kmeans: [
    {
      step: 1,
      title: "Initialize k centroids",
      body: "Pick k starting centers, ideally spread out with k-means++ to avoid poor local optima.",
    },
    {
      step: 2,
      title: "Assign points",
      body: "Assign every point to its nearest centroid, carving the space into k clusters.",
    },
    {
      step: 3,
      title: "Update centroids",
      body: "Move each centroid to the mean of the points assigned to it.",
      formula: "\\boldsymbol{\\mu}_j = \\frac{1}{|C_j|} \\sum_{\\mathbf{x} \\in C_j} \\mathbf{x}",
    },
    {
      step: 4,
      title: "Repeat until stable",
      body: "Alternate assignment and update until assignments stop changing. Each iteration is guaranteed to lower the total squared distance.",
    },
  ],
  trees: [
    {
      step: 1,
      title: "Score all candidate splits",
      body: "At the root, evaluate every feature and threshold, measuring how much each split would reduce impurity (Gini or entropy).",
    },
    {
      step: 2,
      title: "Take the best split",
      body: "Partition the data on the winning feature/threshold, creating two child nodes.",
    },
    {
      step: 3,
      title: "Recurse on each child",
      body: "Repeat the search inside each child on its subset of the data, growing the tree deeper.",
    },
    {
      step: 4,
      title: "Stop and assign leaves",
      body: "Stop when nodes are pure, too small, or at max depth. Each leaf predicts its majority class or mean value. Prune afterwards to fight overfitting.",
    },
  ],
  gbm: [
    {
      step: 1,
      title: "Start with a trivial prediction",
      body: "Initialize the ensemble with a constant, such as the mean target value or log-odds.",
    },
    {
      step: 2,
      title: "Compute residuals",
      body: "For every training example, compute the negative gradient of the loss at the current prediction. For squared error this is just the residual.",
    },
    {
      step: 3,
      title: "Fit a small tree to the residuals",
      body: "Train a shallow tree (often 4-8 levels) that predicts the errors the ensemble is still making.",
    },
    {
      step: 4,
      title: "Add it with shrinkage",
      body: "Add the new tree scaled by a small learning rate, so each round fixes only part of the error.",
      formula: "F_m(x) = F_{m-1}(x) + \\nu\\, h_m(x)",
    },
    {
      step: 5,
      title: "Repeat for hundreds of rounds",
      body: "Iterate until validation error stops improving. Early stopping and the learning rate are the main defenses against overfitting.",
    },
  ],
  evolutionary: [
    {
      step: 1,
      title: "Initialize a population",
      body: "Create a set of random candidate solutions encoded as genomes (bit strings, parameter vectors, or network topologies).",
    },
    {
      step: 2,
      title: "Evaluate fitness",
      body: "Score every candidate on the objective, such as game score, error rate, or profit.",
    },
    {
      step: 3,
      title: "Select parents",
      body: "Choose candidates to reproduce, favoring higher fitness, via roulette-wheel or tournament selection.",
      formula: "P(\\text{select } i) = \\frac{f(i)}{\\sum_j f(j)}",
    },
    {
      step: 4,
      title: "Crossover and mutate",
      body: "Combine pairs of parents and apply random mutations to produce a new generation of candidates.",
    },
    {
      step: 5,
      title: "Repeat for many generations",
      body: "Loop from step 2. Average fitness climbs over generations without ever computing a gradient, which is why this works on non-differentiable problems.",
    },
  ],
  sft: [
    {
      step: 1,
      title: "Curate instruction data",
      body: "Assemble prompt/response pairs demonstrating the target behavior. Quality matters far more than quantity; a few thousand excellent examples beat millions of noisy ones.",
    },
    {
      step: 2,
      title: "Format into a chat template",
      body: "Wrap each example in the model's role markers (system, user, assistant) so it learns turn structure.",
    },
    {
      step: 3,
      title: "Train on completions only",
      body: "Run standard next-token training, but mask the loss on prompt tokens so the model only learns to produce responses, not to imitate prompts.",
    },
    {
      step: 4,
      title: "Evaluate on held-out prompts",
      body: "Check instruction-following, formatting, and regressions on general benchmarks before moving to preference tuning.",
    },
  ],
  pruning: [
    {
      step: 1,
      title: "Rank weight importance",
      body: "Score parameters by magnitude, activation impact, or gradient-based saliency. Small weights usually contribute little to outputs.",
    },
    {
      step: 2,
      title: "Remove the lowest-ranked weights",
      body: "Zero out individual weights (unstructured) or entire neurons, heads, or layers (structured). Structured pruning is coarser but yields real speedups on standard hardware.",
    },
    {
      step: 3,
      title: "Fine-tune to recover",
      body: "Briefly retrain the pruned network so the remaining weights compensate for what was removed.",
    },
    {
      step: 4,
      title: "Iterate to the target sparsity",
      body: "Prune-retrain cycles can remove a large fraction of parameters with minimal accuracy loss, though returns diminish at extreme sparsity.",
    },
  ],
  "spec-decode": [
    {
      step: 1,
      title: "Draft with a small model",
      body: "A fast draft model proposes the next several tokens cheaply.",
    },
    {
      step: 2,
      title: "Verify with the big model",
      body: "The large model scores all drafted tokens in a single parallel forward pass instead of one pass per token.",
    },
    {
      step: 3,
      title: "Accept or reject",
      body: "Tokens the large model agrees with are kept; at the first disagreement, the large model's own token replaces the draft and drafting resumes from there.",
    },
    {
      step: 4,
      title: "Net effect",
      body: "Output is provably identical in distribution to the large model alone, but generation is often 2-3x faster because most drafts are accepted.",
    },
  ],
};
