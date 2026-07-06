import type { TextbookChapter } from "./types";

export const PART5_CHAPTERS: TextbookChapter[] = [
  {
    slug: "ml-for-eda",
    title: "ML for EDA: When AI Designs Chips",
    part: "ai-vlsi",
    order: 22,
    minutes: 20,
    summary:
      "Machine learning aimed back at the design flow: learned predictors inside EDA tools, RL for floorplanning (AlphaChip), and what actually works today.",
    relatedNodeIds: ["compute", "transformer"],
    body: `## The loop closes

Part 3 showed a design flow full of NP-hard optimization (placement, routing, synthesis restructuring) navigated with decades-old heuristics, and full of *estimates* that get corrected only stages later. Both facts make EDA a natural target for machine learning: **learn better heuristics, and learn to predict downstream outcomes early**. The field's premise is that chip design is now the bottleneck of computing progress — and design *effort* (human-months per tapeout) is the bottleneck of chip design.

Three broad strategies, in ascending ambition:

## 1. Learned predictors: seeing the future earlier

The flow's core pain (recall the ECO loop): decisions at stage $k$ are graded at stage $k+2$. Supervised models compress that feedback loop by predicting late-stage truth from early-stage features:

- **Routability / DRC hotspot prediction** from placement snapshots — congestion maps treated as images, CNNs/U-Nets predicting where detailed routing will bleed, *before* spending hours routing. Placers use the prediction as an extra cost term.
- **Pre-route timing prediction** — estimate post-route parasitic delay from placement-stage features, tightening the "estimate → commit → re-check" spiral.
- **IR-drop and crosstalk hotspot models**, **lithography hotspot detection** (pattern classes that will fail DRC/OPC), **power prediction from RTL**.
- **Calibration models** — cheap tool in the loop, expensive signoff tool as ground truth; learn the delta.

This family is quietly the most deployed: it does not replace the optimizer, it **sharpens the cost function** the optimizer already trusts. Commercial reality check: Synopsys DSO.ai and Cadence Cerebrus wrap another learning layer *around* the flow — an agent tuning hundreds of tool knobs (efforts, densities, strategies) across runs, reported to recover single-digit-percent PPA and large engineer-time savings. Learned *parameter-space search*, not learned design.

## 2. RL for placement: the AlphaChip story

The most famous result: Google's RL floorplanner (Nature 2021, later "AlphaChip"), used for TPU generations. The formulation maps floorplanning onto the RL template:

- **State**: the chip canvas with macros placed so far (netlist encoded by a graph neural network — edge-based GNN embeddings of the hypergraph).
- **Action**: place the next macro onto a grid cell.
- **Reward** (only at episode end): a weighted proxy of quality —

$$R = -\\left( \\text{HPWL} + \\lambda_c \\cdot \\text{congestion} + \\lambda_d \\cdot \\text{density} \\right)$$

  — exactly the objectives from the placement chapter, now a reward signal instead of a gradient target.
- **Policy**: trained with PPO across many netlists, so the network *transfers*: pre-trained on past chips, it fine-tunes to a new netlist in hours — the claimed edge over from-scratch optimization.

Standard cells still get placed by classical analytic tools (force-directed/electrostatic — the ePlace math you already know); the RL agent handles the **macro** decisions humans used to sweat over for weeks. Honest ledger: the work drew real methodological controversy (baseline strength, reproducibility — the ISPD 2023 critique), *and* Google kept shipping TPUs designed with it. Both things are true; hold them together. The transferable lesson is the pattern: **GNN encoding of netlists + RL over sequential layout decisions + classical optimizer for the dense fine-grained remainder.**

> **Analogy: the apprentice who has seen a thousand kitchens.** A classical placer is a brilliant physicist who, given any new restaurant kitchen, derives the optimal equipment layout from first principles — but starts from zero every single time. The RL approach is a master architect's apprentice who has laid out a thousand kitchens: shown a new floor plan, they *recognize* it — "prep stations near the walk-in, this shape wants an island" — and produce a strong layout in an afternoon, then let the physicist micro-optimize the drawer placements (standard cells). The apprentice's knowledge is priors, not proofs — occasionally a weird kitchen fools them — which is why the physicist still checks everything (and why signoff never goes away).

## 3. Generative and assistive: the newest wave

- **LLMs for RTL and verification** — Verilog copilots, testbench/assertion generation, English-to-SVA, log triage, tool-script authoring. Benchmarks (VerilogEval and successors) improve fast; production reality is "assistant," not "designer" — Part 4's lesson that correctness is the hard part applies doubly to generated code.
- **Analog layout, OPC/lithography model learning, learned macro generation** — active research with early production toeholds.

## Why EDA is a hard ML domain (and a great one to work in)

- **Labels are expensive**: one training example can cost a full P&R run (hours–days). Data efficiency and transfer matter more than in vision/NLP.
- **Hard constraints**: a placement that is 99% legal is 100% useless — ML proposes, exact legalizers and checkers dispose. The winning architectures are always **hybrids** (learned guidance inside classical solvers with correctness guarantees).
- **Distribution shift is the business model**: every new node, library, and design style moves the data. Models must adapt or retrain per node/design family.
- **Verification of the optimizer**: Part 4's equivalence checking is what makes aggressive learned optimization *permissible* — proofs bracket the ML, exactly as they bracket classical synthesis.

For your roadmap, this chapter is the junction point: the placement math (HPWL, density fields), the RL formulation, and the GNN-on-netlist encoding are each individually standard — the career opportunity is being fluent on **both sides of the boundary**, which is precisely what a VLSI-AI engineer is.`,
  },
  {
    slug: "ai-accelerator-architectures",
    title: "AI Accelerator Architectures: Systolic Arrays and GEMM",
    part: "ai-vlsi",
    order: 23,
    minutes: 24,
    summary:
      "Why matrix multiply gets its own silicon: MAC arrays, the systolic array (TPU-style), GEMM tiling math, and the roofline logic behind every accelerator.",
    relatedNodeIds: ["tpu", "gpu", "tensor", "alt-chips", "transformer"],
    body: `## One kernel to rule them all

Profile any deep network — CNN, transformer, MLP — and the overwhelming bulk of compute is **GEMM** (general matrix multiply) or convolutions lowered to GEMM: $C = A \\times B$, with

$$C_{ij} = \\sum_{k=0}^{K-1} A_{ik} \\, B_{kj}$$

For $M \\times K$ times $K \\times N$: $2MNK$ FLOPs touching only $MK + KN + MN$ values. That ratio — many operations per byte, with massive **reuse** (every $A_{ik}$ participates in $N$ products, every $B_{kj}$ in $M$) — is the entire economic case for accelerators. Dennard's end (Part 1) said specialize; GEMM is *what* to specialize for; reuse is *why* specialization wins.

The unit of specialization is the **MAC** (multiply-accumulate): $acc \\leftarrow acc + a \\times b$ — your Phase 7 PE, one per silicon tile, thousands per chip. The architecture question is purely: *how do you feed them?*

## The energy hierarchy dictates everything

Approximate energy per operation (45 nm-era classic numbers; ratios persist):

| Operation | Energy | Relative |
|---|---|---|
| INT8 add | ~0.03 pJ | 1x |
| INT8 multiply | ~0.2 pJ | ~7x |
| 32-bit register/small SRAM read | ~1 pJ | ~30x |
| Large on-chip SRAM read | ~5–20 pJ | ~200x |
| **Off-chip DRAM read** | **~600–1300 pJ** | **~20,000x** |

**Arithmetic is nearly free; data movement is everything.** An architecture that recomputes a value can beat one that refetches it. Every design in this chapter is a scheme to keep operands in the cheap rows of this table — and quantization (your Phase 6) earns its keep here twice: smaller operands mean cheaper MACs *and* fewer bytes moved.

## The systolic array

The TPU's core (and Phase 7's capstone): a 2D grid of PEs where data **flows through** the array rhythmically, neighbor to neighbor, instead of each PE fetching from memory.

\`\`\`mermaid
flowchart TB
  subgraph SA ["Systolic array (weight-stationary)"]
    direction TB
    P11["PE w11"] --> P21["PE w21"]
    P12["PE w12"] --> P22["PE w22"]
    P11 --> P12
    P21 --> P22
  end
  ACT["Activations<br/>stream in from left,<br/>skewed by one cycle per row"] --> SA
  SA --> PSUM["Partial sums<br/>emerge below into accumulators"]
  W["Weights preloaded,<br/>held in PE registers"] -.-> SA
\`\`\`

Weight-stationary operation (TPU v1 style):

1. **Preload** a weight tile into the PE registers — each PE holds one $w$ and keeps it (weights are read from memory *once* per tile, then reused for every input).
2. **Stream** activations in from the left edge, each row delayed ("skewed") one cycle from the previous — the parallelogram wavefront from your Phase 7 trace exercise.
3. Each PE computes $psum_{out} = psum_{in} + w \\cdot a$ each cycle, passing $a$ rightward and $psum$ downward.
4. Column sums emerge at the bottom, one per cycle after the pipeline fills.

An $N \\times N$ array sustains $N^2$ MACs/cycle while the *memory* interface only feeds $N$ activations and drains $N$ partial sums per cycle: **compute scales as the square of bandwidth.** That is the trick. The costs: fill/drain latency ($\\approx 2N$ cycles — your TPU-v1 256-cycle fill problem), and **utilization collapse when matrices don't fit the grid** (a $256\\times256$ array running a $32\\times32$ GEMM idles 98% of PEs — why serving small batches is architecturally hard, and why later TPUs use multiple smaller arrays).

TPU v1's numbers make the argument concrete: 256×256 = 65,536 INT8 MACs, 92 TOPS peak, driven by a CISC instruction stream and a mere 24 MiB of on-chip buffer — a bet that GEMM reuse could carry an entire product. It could.

> **Analogy: the bucket brigade factory.** A GPU-style core is a workshop where every worker runs to the warehouse for each part (registers/cache fetches per operand — flexible, but the hallway is the bottleneck). A systolic array is a bucket-brigade assembly line: each worker (PE) bolted to one station with their one tool welded in hand (stationary weight), parts arriving from the left neighbor and passed to the right, exactly one step per drumbeat (clock). Nobody walks anywhere; the warehouse only stocks the line's *edges*. Throughput is astonishing — as long as the product matches the line. Ask the line to build something smaller than itself and most workers stand idle; retooling (loading new weights) stops the line. Flexibility is precisely what was traded for the efficiency.

**Tensor cores** (NVIDIA) are the same insight at different granularity: small matrix-MAC units ($4\\times4\\times4$-ish per instruction) embedded *inside* a general SIMT processor — less reuse captured per unit than a giant array, but composable with a full programmable machine. The design space runs from fully-fixed (TPU v1) through tensor-core hybrids to pure SIMT, trading efficiency against flexibility at every point.

## Tiling: fitting the mountain through the door

Real layers ($M, N, K$ in the thousands) dwarf any array and any SRAM. **Tiling** decomposes the loop nest so a working set fits each level of the memory hierarchy:

\`\`\`text
for m0, n0, k0 in tiles:          # outer: DRAM <-> SRAM
  load A[m0][k0], B[k0][n0] to SRAM
  for m1, n1, k1 in subtiles:     # inner: SRAM <-> array
    C_tile += A_sub @ B_sub       # systolic array executes
\`\`\`

The math that governs tile choice: with tiles $T_m \\times T_k$ and $T_k \\times T_n$ in a scratchpad of size $S$ (constraint $T_m T_k + T_k T_n + T_m T_n \\le S$), the compute-to-traffic ratio for the tile is

$$I_{tile} = \\frac{2\\,T_m T_n T_k}{T_m T_k + T_k T_n + T_m T_n} \\;\\xrightarrow{\\;T_m = T_n = T_k = T\\;}\\; \\frac{2T^3}{3T^2} = \\frac{2T}{3}$$

**Arithmetic intensity grows linearly with tile size** — quadrupling scratchpad area doubles the achievable FLOPs-per-byte. This single equation justifies the megabytes of SRAM on every accelerator die, connects directly to your Phase 2 roofline model ($I$ is the x-axis; the tile must land right of the ridge point $I^* = \\text{peak FLOPs}/\\text{peak BW}$ to be compute-bound), and is the objective that scheduling compilers (XLA, TVM, and Part 5's dataflow mappers) search over.

## The rest of the chip

The MAC array is maybe a third of the die. Around it: **vector/SIMD units** (activations, softmax, normalization — the non-GEMM 5% that would otherwise Amdahl you), on-chip **scratchpads and NoC** (next chapter), quantization/dequantization datapaths, DMA engines that double-buffer tiles (load tile $i{+}1$ while computing tile $i$ — your Phase 5 DMA profiling made visible), and the host interface. The compiler orchestrates all of it statically — accelerators trade dynamic hardware scheduling (caches, out-of-order) for software-known schedules, which is why the compiler *is* part of the architecture.

Your Phase 7 capstone is this chapter in miniature: PE → array → skewing → SRAM buffering → AXI/DMA → utilization and roofline measurement. The next chapter zooms into the piece that actually determines performance: the memory system.`,
  },
  {
    slug: "memory-hierarchies-ai-chips",
    title: "Memory Hierarchies for AI Chips: HBM, Scratchpads, Dataflows",
    part: "ai-vlsi",
    order: 24,
    minutes: 22,
    summary:
      "The real battlefield of accelerator design: HBM and the bandwidth wall, scratchpads vs caches, and the stationary-dataflow taxonomy (weight / output / row).",
    relatedNodeIds: ["memory", "tpu", "gpu", "attention", "transformer"],
    body: `## Compute is a solved problem; feeding it is not

Take stock of the last chapter's numbers: a modern accelerator wields hundreds of TFLOPs, but DRAM access costs ~20,000x an INT8 add, and pin bandwidth grows far slower than MAC counts. For LLM inference the situation is stark: generating one token requires streaming essentially **all model weights** through the compute — at batch 1, arithmetic intensity is ~2 FLOPs per weight byte, hopelessly memory-bound (recall the roofline ridge). **The memory system is the architecture.** This chapter is the design space.

## HBM: brute-force bandwidth

**High Bandwidth Memory** attacks the bandwidth wall with geometry: stack 8–12 DRAM dies vertically (TSVs — through-silicon vias — running thousands of connections *through* the dies), park the stack millimeters from the processor on a silicon **interposer**, and connect with a ludicrously wide interface (1024+ bits per stack versus 64 for a DIMM):

$$BW = \\frac{\\text{interface width} \\times \\text{data rate}}{8} \\;\\Rightarrow\\; \\text{HBM3e: } \\sim 1.2\\ \\text{TB/s per stack}$$

Six stacks beside a GPU die ≈ 5–8 TB/s. The wins compound: shorter traces mean lower energy per bit (~3–5 pJ/bit vs ~15–20 for DDR on a motherboard), and width at moderate clock beats narrow-and-fast on power. The costs: heat trapped in the stack (DRAM refresh-vs-temperature, from Part 2's memory chapter, gets worse), interposer packaging expense, capacity ceilings (~24–36 GB per stack) — and the packaging plant becomes the supply-chain bottleneck of the entire AI industry, which is where 2.5D/3D advanced packaging (CoWoS et al.) enters the news cycle. HBM is Part 1's "scaling went vertical and modular" thesis, productized.

Still: 8 TB/s against 1000+ TFLOPs leaves the ridge point at $I^* \\approx 150{+}$ FLOPs/byte. Everything below it lives or dies by **on-chip** reuse.

## Scratchpads vs caches: choosing to know

General-purpose CPUs use **caches** — hardware-managed, reactive, guessing locality from access history, paying tags/associativity/coherence in area and energy. Accelerators overwhelmingly choose **scratchpads**: raw SRAM, explicitly addressed, with DMA engines moving tiles under **compiler** control.

The reason is Part 5's recurring theme: *GEMM's access pattern is perfectly known at compile time.* When you know the future, hardware speculation is pure overhead:

| | Cache | Scratchpad |
|---|---|---|
| Managed by | Hardware, reactive | Compiler/DMA, planned |
| Area/energy per byte | Tags + logic overhead | ~SRAM only (30–40% denser) |
| Timing | Statistical (misses) | Deterministic — schedulable |
| Best when | Irregular, unknown access | Known, tiled loop nests |

Determinism is the underrated win: the double-buffering pipeline (DMA fills buffer B while compute drains buffer A) only composes into a tight static schedule because *every* latency is known. Your Phase 5 DMA-vs-compute profiling is exactly this discipline; GPUs, tellingly, sit in the middle (shared memory = a scratchpad *inside* a cached machine).

## The dataflow taxonomy: what stays put

Given a MAC array + scratchpad hierarchy, the defining question (Eyeriss taxonomy, Sze/Chen et al.): **which operand stays stationary** in the PE while the loop nest turns? "Stationary" = held in the cheapest memory (PE register), maximally reused; the other operands stream.

For $C_{ij} = \\sum_k A_{ik} B_{kj}$ — three choices of what to pin:

- **Weight-stationary (WS)** — weights live in PE registers (TPU v1, last chapter). Weight reuse is maximal (each weight read once per tile, reused across the whole batch/spatial dimension); partial sums move every cycle. Wins when weights dominate traffic and batching is healthy — classic datacenter inference.
- **Output-stationary (OS)** — each PE owns one (or a few) $C_{ij}$ accumulator; $A$ and $B$ stream past. Partial sums *never move* until final — accumulation stays in the register, inputs pay the traffic. Wins when the $K$ (reduction) dimension is deep: psum traffic would otherwise dominate. Your Phase 7 "output-stationary modification" exercise is this swap.
- **Row-stationary (RS)** — Eyeriss's finesse for convolutions: pin a filter *row* against an input-activation *row* per PE, so 1D convolution primitives complete locally; orchestrate 2D reuse across the PE grid diagonals. Balances reuse of *all three* operand types rather than maximizing one — measurably better energy on conv workloads than any single-operand loyalty.

(Plus the degenerate **no-local-reuse** point — all operands in shared buffers, maximum flexibility, maximum traffic — useful mostly as the baseline that makes the others look good.)

Formally: a dataflow is a choice of loop order + partitioning of the 6-deep GEMM/conv loop nest across space (PEs) and time, and the taxonomy names *which loop index each PE holds fixed*. Mapper/scheduler tools (Timeloop, MAESTRO) search this space per layer against an energy model — compiler infrastructure as architecture, again.

> **Analogy: three kitchens for the same thousand-dish banquet.** Weight-stationary is the taco line: each station's cook is permanently equipped with one topping (weight bolted in place); dishes ride the conveyor collecting toppings — toppings never travel, dishes do (psums move). Output-stationary is plated service: each cook owns one *plate* (accumulator) that never leaves their station; runners bring ingredients past and each cook adds to their own plate until it is complete — plates never travel, ingredients do. Row-stationary is the brigade of sous-chefs each assigned one *recipe line* (filter row × input row): every ingredient delivered to a station gets used several ways before leaving, so no single thing races around the kitchen. None is "best" — it depends whether toppings, plates, or ingredients are the expensive thing to move tonight. That is dataflow selection, and the head chef doing the assignment per course is the mapping compiler.

## Putting the hierarchy together

A representative modern inference chip, level by level (sizes indicative):

\`\`\`mermaid
flowchart TB
  DRAM["HBM stacks — 10s of GB, ~TB/s<br/>weights, KV-cache, activations spill"] --> GLB["Global SRAM buffer — 10s of MB<br/>current layer tiles, double-buffered via DMA"]
  GLB --> NOC["Network-on-chip"]
  NOC --> L1a["PE-cluster scratchpads — 100s of KB"]
  NOC --> L1b["PE-cluster scratchpads"]
  L1a --> R1["PE register files — KBs<br/>the stationary operand lives here"]
  L1b --> R2["PE register files"]
\`\`\`

Each level trades ~10x capacity for ~10x bandwidth/energy (Part 2's hierarchy table, rebuilt on purpose-chosen ratios). The design method is quantitative end-to-end: workload's loop nest → tiling per level (last chapter's $I \\propto T$ math) → dataflow per layer → check every level against the roofline → iterate. Tools like Timeloop automate the arithmetic; the architect chooses the search space.

Two frontier notes to file: **transformer serving stresses the hierarchy uniquely** (the KV-cache grows with context length and gets *re-read every token* — a memory-capacity-and-bandwidth problem masquerading as attention math, driving batch-scheduling tricks and near-memory experiments), and **compute-in/near-memory** research attacks the hierarchy's premise itself — do the MAC where the bits already are (analog crossbars, DRAM-adjacent compute), trading the taxonomy of *moving* data for the harder problem of computing without moving it.

This closes the book's arc: doped silicon → transistor → gate → RTL → placed-and-routed, verified silicon → architectures where the memory system, not the arithmetic, is the design — and where your two skill trees, VLSI and AI, are one job.`,
  },
];
