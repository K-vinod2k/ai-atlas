import type { TextbookChapter } from "./types";

export const PART2_CHAPTERS: TextbookChapter[] = [
  {
    slug: "boolean-algebra-logic-gates",
    title: "Boolean Algebra and CMOS Logic Gates",
    part: "digital-design",
    order: 6,
    minutes: 20,
    summary:
      "From truth tables to transistors: Boolean identities, De Morgan's laws, and how any logic function becomes a static CMOS gate.",
    relatedNodeIds: ["bit", "compute"],
    body: `## The algebra of two values

George Boole built an algebra where variables take only the values 0 and 1, and three operations exist: AND ($\\cdot$), OR ($+$), NOT ($\\overline{x}$). Eighty years later Claude Shannon noticed (in the most influential master's thesis ever written) that this algebra exactly describes switching circuits. Every processor is applied Boole.

The identities you will actually use daily:

| Law | AND form | OR form |
|---|---|---|
| Identity | $A \\cdot 1 = A$ | $A + 0 = A$ |
| Null | $A \\cdot 0 = 0$ | $A + 1 = 1$ |
| Idempotent | $A \\cdot A = A$ | $A + A = A$ |
| Complement | $A \\cdot \\overline{A} = 0$ | $A + \\overline{A} = 1$ |
| Distributive | $A(B + C) = AB + AC$ | $A + BC = (A+B)(A+C)$ |
| Absorption | $A(A + B) = A$ | $A + AB = A$ |

And the two that matter more than all the rest — **De Morgan's laws**:

$$\\overline{A \\cdot B} = \\overline{A} + \\overline{B}, \\qquad \\overline{A + B} = \\overline{A} \\cdot \\overline{B}$$

"NOT of AND is OR of NOTs." Break the bar, change the operator. De Morgan is not a trivia item: it is the reason NAND-only and NOR-only logic works, the tool synthesis uses to push inversions around a netlist, and the trick you will use to convert any circuit to the gates your library actually has.

> **Analogy: two ways to fail a checklist.** "You didn't complete *both* tasks" means "you missed task A *or* you missed task B (or both)." "You didn't complete *either* task" means "you missed A *and* you missed B." That is De Morgan in plain English — negating a conjunction turns it into a disjunction of negations. Once you hear it as language, you stop having to memorize it.

## Canonical forms and minimization

Any truth table can be written mechanically as a **sum of products** (OR of minterms — one AND term per row that outputs 1) or a **product of sums**. These canonical forms are correct but bloated; minimization removes redundancy:

- **Boolean algebra manipulation** — apply identities by hand.
- **Karnaugh maps** — arrange the truth table on a grid where adjacent cells differ by one bit (Gray-code ordering); rectangular groups of 1s of size $2^k$ collapse into single product terms. Practical to 4–5 variables; excellent for building intuition about *why* adjacent minterms merge: $AB + A\\overline{B} = A$.
- **Espresso / synthesis tools** — what real flows use beyond toy sizes. Modern logic synthesis (Part 3) minimizes across multi-level networks, not just two-level forms.

Also know the **XOR** ($A \\oplus B$ — true when inputs differ). It is not fundamental (it expands to $A\\overline{B} + \\overline{A}B$) but it is everywhere: adders, parity, comparators, CRC.

## From Boolean expression to transistors

Here is the central recipe of static CMOS (generalizing the inverter from Part 1):

1. **Pull-down network (PDN)** of NMOS between output and ground: implements when the output should be **0**. Series NMOS = AND of conditions; parallel NMOS = OR.
2. **Pull-up network (PUN)** of PMOS between output and $V_{DD}$: the exact **dual** (series ↔ parallel swapped), guaranteed by De Morgan.

Because NMOS pulls down and PMOS pulls up, every static CMOS gate is **naturally inverting** — you get NAND, NOR, AOI (AND-OR-invert), never a bare AND. An AND gate is physically a NAND followed by an inverter.

**NAND example** ($\\overline{AB}$): two NMOS in series to ground (output low only when A AND B high), two PMOS in parallel to $V_{DD}$ (output high when A OR B low — De Morgan again). Transistor count: 4, versus 6 for AND. This is why synthesized netlists are full of NANDs.

\`\`\`mermaid
flowchart TB
  VDD["VDD"] --- PA["PMOS A"]
  VDD --- PB["PMOS B"]
  PA --- OUT(("OUT = NOT(A AND B)"))
  PB --- OUT
  OUT --- NA["NMOS A"]
  NA --- NB["NMOS B"]
  NB --- GND["GND"]
\`\`\`

**Why NAND is the workhorse (and NOR is not):** series transistor stacks add resistance. A NAND stacks NMOS (fast electrons) in series and puts slow PMOS in parallel; a NOR does the opposite, stacking the weak PMOS. For equal performance a NOR needs much wider PMOS devices. Practical consequence: libraries are NAND-rich, and both NAND and NOR are **universal** — either alone can build any function (NAND(A,A) = NOT A, and so on). Flash memory's two big families are literally named for these structures.

## Gate delay depends on what you build

Two facts to carry into the combinational-logic chapter:

- **Fan-in cost:** an $n$-input gate has $n$ transistors in a series stack; resistance grows linearly and worst-case delay roughly quadratically with stack height. Real libraries top out around 3–4 inputs; wide functions become trees of small gates.
- **Fan-out cost:** each driven input adds gate capacitance to the load; delay grows linearly with fan-out. The theory of sizing gate chains for minimum delay (**logical effort**) says the optimal chain gives each stage a fan-out of about 4 — a number you will see hard-coded into buffer trees everywhere.

> **Analogy: plumbing in series and parallel.** A series transistor stack is several garden hoses screwed end to end — same water must fight through every constriction, so flow drops with each added section. Parallel transistors are hoses side by side — more paths, more flow. CMOS gate design is choosing which conditions get the series plumbing (the AND-like behavior) and which get parallel (OR-like), separately for the pull-up and pull-down halves — with the guarantee that exactly one half conducts at a time.

## What synthesis will do with all this

When you write \`assign y = (a & b) | c;\` in Verilog, the synthesis tool: converts it to an internal Boolean network, minimizes it (identities, De Morgan, factoring, sharing), then **maps** it onto the specific NAND/NOR/AOI cells of the target library, choosing drive strengths per the loads. Chapters ahead cover both halves — combinational building blocks next, synthesis itself in Part 3. The algebra in this chapter is the common language of the entire flow.`,
  },
  {
    slug: "combinational-logic",
    title: "Combinational Building Blocks: Mux, Decoder, Adders",
    part: "digital-design",
    order: 7,
    minutes: 22,
    summary:
      "The standard parts catalog: multiplexers, decoders, and the adder story from ripple-carry to carry-lookahead, with the delay math that motivates it.",
    relatedNodeIds: ["compute", "bit"],
    body: `## Circuits without memory

A **combinational** circuit's outputs depend only on its current inputs — no state, no clock, no history. Feed it inputs, wait for signals to propagate, read outputs. Everything in this chapter is a pure Boolean function made physical; the delay through it will set your clock speed (next chapters).

## The multiplexer: hardware's if-statement

A 2:1 **mux** selects one of two inputs: $Y = \\overline{S}\\,A + S\\,B$. Larger muxes are trees of 2:1s; an $N$:1 mux needs $\\log_2 N$ select bits.

The mux is arguably the most important combinational element because it is **choice made physical**:

- Every \`if/else\` and \`case\` in RTL synthesizes to muxes.
- A register file read port is a giant mux.
- CPU forwarding/bypass paths are muxes.
- An FPGA's LUT is a $2^k$:1 mux with the truth table in its inputs — meaning *every* logic function on an FPGA is secretly a mux.

The mux is also universal: with constants on its data inputs, a mux implements any truth table of its select lines.

**Decoder** — the opposite direction: $n$ inputs, $2^n$ outputs, exactly one output high (the one whose index matches the input). Output $i$ is the minterm $m_i$. Uses: address decoding (every memory row select — see the SRAM chapter), instruction decode, one-hot conversions. The **encoder** and its practical cousin the **priority encoder** (first 1 wins — interrupt controllers, leading-zero counters) go the other way.

## The adder: where delay math gets real

Addition is *the* fundamental datapath operation — also the core of multiplication, subtraction (two's complement: $A - B = A + \\overline{B} + 1$), comparison, and address arithmetic. Adder design is the classic case study in trading area for speed.

**Full adder** (one bit position): inputs $A, B, C_{in}$; outputs

$$S = A \\oplus B \\oplus C_{in}, \\qquad C_{out} = AB + C_{in}(A \\oplus B)$$

### Ripple-carry adder (RCA)

Chain $N$ full adders, carry-out to carry-in. Simple, small — and slow, because the carry must **ripple** through every stage. If one full adder's carry path takes $t_c$:

$$t_{RCA} \\approx N \\cdot t_c \\;=\\; O(N)$$

A 64-bit RCA is ~64 carry delays. At ~20 ps per stage that is 1.3 ns — capping the clock near 780 MHz before you have done anything else in the cycle.

> **Analogy: the whispered rumor.** A ripple-carry adder computes like a rumor passed down a line of 64 people, each whispering to the next only after hearing from the previous. Even though all 64 people are standing there ready (all input bits arrive at once), the answer at the far end takes 64 whisper-delays. Carry-lookahead is reorganizing the line into a hierarchy: group leaders summarize "my group will pass the rumor along" or "my group starts a new rumor," leaders report upward in parallel, and the summary comes back down — turning a linear chain into a logarithmic tree of announcements.

### Carry-lookahead: computing the future

The fix: compute carries *directly* instead of waiting. Define per bit:

- **Generate** $G_i = A_i B_i$ — this position creates a carry regardless of carry-in.
- **Propagate** $P_i = A_i \\oplus B_i$ — this position passes an incoming carry along.

Then each carry unrolls into two-level logic:

$$C_{i+1} = G_i + P_i C_i = G_i + P_i G_{i-1} + P_i P_{i-1} G_{i-2} + \\cdots + P_i \\cdots P_0 C_0$$

In principle every carry is now a flat AND-OR — constant delay! In practice the terms grow too wide (fan-in limits from last chapter), so lookahead is built **hierarchically**: 4-bit blocks compute group generate/propagate $G^* , P^*$, a second level looks ahead across blocks, and so on:

$$t_{CLA} = O(\\log N)$$

A 64-bit CLA: roughly 3 tree levels of lookahead, ~6–8 gate delays versus 64. That logarithmic-versus-linear gap is the whole story.

The modern family tree of **parallel-prefix adders** (Kogge-Stone, Brent-Kung, Sklansky, Han-Carlson) are all systematic ways to build that $O(\\log N)$ prefix tree, trading wiring density against depth and fan-out. Synthesis tools pick one for you based on your timing constraints — but *you* set those constraints, so know the menu:

| Adder | Delay | Area | Notes |
|---|---|---|---|
| Ripple-carry | $O(N)$ | $O(N)$, smallest | Fine for slow/narrow datapaths |
| Carry-select | $O(\\sqrt{N})$ | ~2x RCA | Compute both carry cases, mux the right one |
| Carry-lookahead (hier.) | $O(\\log N)$ | moderate | The classic |
| Kogge-Stone (prefix) | $O(\\log N)$, min depth | large, wire-heavy | The speed demon |

## Critical path thinking

The lesson generalizes beyond adders. For any combinational block, the **critical path** is the slowest input-to-output route, and it — not the average — determines when outputs are trustworthy:

$$t_{block} = \\max_{\\text{paths } p} \\sum_{\\text{gates } g \\in p} t_g$$

Design instincts that follow:

- **Balance trees.** An 8-input AND as a binary tree is 3 levels; as a linear chain, 7.
- **Late signals enter late.** If one input arrives last, restructure so it hits the shallowest logic (e.g., feed the late carry into the final mux of a carry-select stage).
- **Wide OR/AND of comparisons** (address match logic, tag compares) wants tree structure and possibly domino-style techniques in extreme cases.

These same ideas — generate/propagate abstraction, prefix trees, critical-path balancing — reappear scaled up in Part 5: a systolic array's accumulation chain and a GEMM datapath's reduction tree are the adder story at matrix scale.`,
  },
  {
    slug: "sequential-logic",
    title: "Sequential Logic: Latches, Flip-Flops, and Timing",
    part: "digital-design",
    order: 8,
    minutes: 22,
    summary:
      "How circuits remember: bistability, latch vs flip-flop, and the setup/hold constraints that govern every synchronous design.",
    relatedNodeIds: ["bit", "compute"],
    body: `## Memory from feedback

Combinational circuits forget their inputs instantly. To build anything with state — counters, processors, your entire register file — you need circuits that **hold** a value. The trick is feedback: route a gate's output back toward its input and the loop can sustain itself.

Two inverters in a loop have exactly two stable states (0→1→0 or 1→0→1): a **bistable** element, one bit of memory. Every static storage element on a chip — latches, flip-flops, the SRAM cell — is a decorated inverter loop. The decoration is a mechanism to *force* the loop to a new value on command.

> **Analogy: the light switch.** A toggle switch rests happily in either of two positions; the spring mechanism actively resists staying in between. Push it past the halfway point and it snaps the rest of the way itself. The inverter loop is the same: regenerative feedback amplifies any lean toward 0 or 1 into a full rail value, and holding a state costs nothing. Metastability — which we meet at the end — is the switch balanced *exactly* on the ridge, taking an unpredictable time to fall.

## Latch vs flip-flop: the crucial distinction

Both store one bit; they differ in **when they listen**.

- A **D latch** is *level-sensitive*: while enable is high the latch is **transparent** (output follows input); when enable drops, it holds the last value.
- A **D flip-flop** is *edge-triggered*: it samples D at the instant of the clock edge, holds it for the entire cycle, and ignores D at all other times.

The standard flip-flop construction is two latches back to back — a **master** transparent while the clock is low and a **slave** transparent while it is high. At the rising edge, the master closes (trapping the value) and the slave opens (revealing it). At no instant is there a transparent path straight through: that is exactly the property that makes edge-triggering safe.

\`\`\`mermaid
flowchart LR
  D["D input"] --> M["Master latch<br/>(open while CLK = 0)"]
  M --> S["Slave latch<br/>(open while CLK = 1)"]
  S --> Q["Q output"]
  CLK["CLK"] -.-> M
  CLK -.-> S
\`\`\`

> **Analogy: the canal lock.** A ship (data) never sees both gates of a canal lock open at once. The outer gate opens, the ship enters the chamber, the outer gate closes — only then does the inner gate open. Data crosses a flip-flop the same way: into the master while the clock is low, handed to the slave at the edge. The two-gate discipline is what stops data from racing through multiple stages in one clock cycle — the fundamental hazard of transparent latches.

Why edge-triggering won: with transparent latches, a fast combinational path can shoot through an open latch and corrupt the *next* stage in the same cycle. Flip-flops make timing analysis tractable — data moves exactly one stage per clock edge. (Latches survive in expert niches: latch-based time borrowing, clock-gating cells, and inside the FF itself.)

## The synchronous contract: setup and hold

A real flip-flop cannot sample an instantaneously changing signal. It demands a stability window around the clock edge:

- **Setup time** $t_{su}$ — D must be stable *before* the edge.
- **Hold time** $t_h$ — D must stay stable *after* the edge.
- **Clock-to-Q delay** $t_{cq}$ — after the edge, Q takes this long to show the new value.

Consider two flip-flops with combinational logic between them — the universal template of synchronous design (launch FF → logic cloud → capture FF).

**Setup constraint (max-delay).** Data launched at edge $N$ must arrive before edge $N+1$, minus setup:

$$t_{cq} + t_{comb,max} + t_{su} \\;\\le\\; T_{clk}$$

Equivalently, the fastest clock your design supports is set by the **slowest path**:

$$f_{max} = \\frac{1}{t_{cq} + t_{comb,max} + t_{su}}$$

This one inequality is the entire reason "critical path" is the obsession of digital design. Speed up the slowest path and the whole chip clocks faster; nothing else matters until you do.

**Hold constraint (min-delay).** The *new* data racing out of the launch FF at the same edge must not arrive at the capture FF before its hold window closes:

$$t_{cq} + t_{comb,min} \\;\\ge\\; t_h$$

Note what is absent: the clock period. **Hold violations cannot be fixed by slowing the clock** — they are a race between two events triggered by the same edge. A hold-violating chip is dead silicon at any frequency. Fixes: insert delay buffers on the too-fast path (done automatically late in physical design). This asymmetry — setup bugs are frequency bugs, hold bugs are fatal — is why signoff sweats min-delay corners so hard.

Add clock skew $t_{skew}$ (capture clock arriving later than launch clock) and the two constraints become:

$$t_{cq} + t_{comb,max} + t_{su} \\le T_{clk} + t_{skew}, \\qquad t_{cq} + t_{comb,min} \\ge t_h + t_{skew}$$

Skew *helps* setup and *hurts* hold — a lever the clock-tree chapter (Part 3) returns to.

## Registers, counters, and pipelines

- **Register**: $N$ flip-flops sharing a clock — one architectural value.
- **Shift register**: FFs in a chain; serial-parallel conversion, delay lines.
- **Counter**: register + incrementer feedback; the adder chapter's delay math decides how fast it can count.
- **Pipeline**: cut a long combinational computation with register stages. Each stage now needs only its own slice of logic to fit in a cycle, so $f_{max}$ rises roughly with stage count — at the price of latency in cycles and area for the registers. Your Phase 3 pipelined dot product and every systolic array in Part 5 are this idea, industrialized.

## Metastability: when the contract breaks

Violate setup/hold — unavoidable when a signal crosses from another clock domain or from an asynchronous input — and the FF may land **between** valid logic levels, teetering on the bistable ridge for an unbounded (probabilistically decaying) time before resolving randomly.

You cannot prevent metastability at a clock-domain crossing; you can only make failure astronomically unlikely. The standard tool is the **two-FF synchronizer**: the first FF may go metastable, but it gets a full clock period to resolve before the second samples it. Mean time between failures:

$$MTBF = \\frac{e^{t_r/\\tau}}{f_{clk} \\, f_{data} \\, T_w}$$

where $t_r$ is resolution time given and $\\tau$ the FF's resolution constant — the exponential means one extra cycle of settling buys orders of magnitude. Multi-bit crossings need more (handshakes, async FIFOs with Gray-coded pointers — the FIFO in your Phase 3 problem set is the canonical exercise).`,
  },
  {
    slug: "fsm-design",
    title: "Finite State Machines: Mealy, Moore, and Encoding",
    part: "digital-design",
    order: 9,
    minutes: 18,
    summary:
      "Designing circuits that follow a plan: FSM structure, Mealy vs Moore tradeoffs, state encoding choices, and the standard RTL pattern.",
    relatedNodeIds: ["compute"],
    body: `## Sequential circuits with intent

A counter just counts. Real control logic — a bus protocol handler, a memory controller, a cache coherence engine, the control unit of a CPU — must react *differently* to the same input depending on what has happened before. The formal tool is the **finite state machine**: a finite set of states, transitions triggered by inputs, and outputs.

Every FSM in hardware is the same three-piece structure:

\`\`\`mermaid
flowchart LR
  IN["Inputs"] --> NSL["Next-state logic<br/>(combinational)"]
  SR["State register<br/>(flip-flops)"] --> NSL
  NSL --> SR
  SR --> OL["Output logic<br/>(combinational)"]
  IN -.->|"Mealy only"| OL
  OL --> OUT["Outputs"]
  CLK["CLK"] -.-> SR
\`\`\`

State lives in flip-flops; two clouds of combinational logic compute where to go next and what to emit. The previous chapter's setup/hold constraints apply to the loop: next-state logic depth limits the FSM's clock frequency.

## Mealy vs Moore

The one structural decision with real consequences — where outputs come from:

- **Moore machine**: outputs depend on **state only**. Outputs change only at clock edges, are glitch-clean, and are stable for a full cycle.
- **Mealy machine**: outputs depend on **state and current inputs**. Outputs can react in the *same* cycle as an input — often saving a state — but they can glitch when inputs glitch and they create combinational paths from input straight to output.

| Property | Moore | Mealy |
|---|---|---|
| Output timing | Registered, changes on edge | Combinational, reacts mid-cycle |
| Latency to react | One cycle more | Immediate |
| State count | Sometimes one more | Often fewer |
| Glitch risk on outputs | None | Yes (inherits input glitches) |
| Timing paths | State → output | Input → output (crosses the module!) |

Practical guidance: **default to Moore**, especially for outputs leaving your module (an output that feeds another block's logic mid-cycle is a timing-analysis headache). Use Mealy where the one-cycle reaction genuinely matters — handshake protocols (ready/valid) are the classic case. A common hybrid: Mealy internally, with a register on the output (a "registered Mealy") giving Moore-like cleanliness with Mealy's state economy.

> **Analogy: the vending machine attendant.** A Moore attendant decides what to do at each tick purely from the sign on the wall behind them ("state: 75¢ collected") — anyone watching knows the output just from the sign. A Mealy attendant also glances at the coin *currently in your hand* and can hand you the snack the instant the last quarter appears, one beat sooner — but if you fumble the coin (input glitch), their hand twitches too. Same machine, same job; the difference is whether reactions wait for the tick.

## The sequence detector, concretely

The classic exercise (your Phase 1 problem set: detect \`1011\` in a serial stream) shows the method:

1. **States = progress**: S0 (nothing), S1 (seen \`1\`), S2 (seen \`10\`), S3 (seen \`101\`).
2. On each bit, move forward on a match. On a mismatch, do **not** naively reset to S0 — fall back to the longest prefix still alive. From S3 (\`101\`) seeing \`1\` completes \`1011\`; the trailing \`11\` means the machine goes to S1, not S0 (overlapping matches). Getting fallback states right is where everyone's first FSM is wrong; it is a hand-computed version of the KMP string-matching failure function.
3. Output: Moore version adds an S4 "detected" state (flag one cycle late); Mealy asserts on the S3-and-input-1 transition (immediate).

## State encoding

States are abstract; flip-flops are real. The mapping matters:

| Encoding | Bits for $N$ states | Next-state logic | Best for |
|---|---|---|---|
| **Binary** | $\\lceil \\log_2 N \\rceil$ | densest, deepest | Large-N FSMs, area-constrained |
| **One-hot** | $N$ (one FF per state) | shallowest — each state bit's logic looks only at a few predecessor bits | FPGAs (FFs are abundant), speed |
| **Gray** | $\\lceil \\log_2 N \\rceil$ | adjacent transitions flip one bit | Outputs crossing clock domains, low-power sequencing |

FPGA synthesis defaults to one-hot for good reason: flip-flops are nearly free and shallow logic wins timing. ASIC flows lean binary/auto. Two more encodings worth knowing: **output-encoded** (state bits *are* the outputs — zero output logic, zero output glitches) and safe-state handling (what happens if a radiation flip lands you in an unused encoding? Add a default transition to reset — required thinking in automotive/space).

## The RTL pattern

The three-block style (from your Phase 3 plan) maps one-to-one onto the block diagram:

\`\`\`systemverilog
typedef enum logic [1:0] {S0, S1, S2, S3} state_t;
state_t state, next;

// 1. State register — the only sequential block
always_ff @(posedge clk or posedge rst)
  if (rst) state <= S0;
  else     state <= next;

// 2. Next-state logic — pure combinational
always_comb begin
  next = state;            // default: hold (prevents latches)
  unique case (state)
    S0: if (in)  next = S1;
    S1: if (!in) next = S2;
    S2: if (in)  next = S3;
    S3: next = in ? S1 : S2;
  endcase
end

// 3. Output logic (Moore)
assign detected = (state == S3) && in;   // Mealy variant
\`\`\`

Discipline points the tools will punish you for skipping: assign a default to \`next\` (missing assignments in a combinational block infer latches); use \`always_comb\`/\`always_ff\` so the tool checks your intent; reset every state register.

FSMs scale by **decomposition, not state explosion**: a memory controller is not one 200-state machine but several small FSMs (command sequencing, refresh timing, arbitration) exchanging handshakes — plus datapath counters doing the counting that states shouldn't. When an FSM's state count starts encoding *data* (a count, an address), move that data into a register and keep the FSM for *control*. That control/datapath split is the core idiom of RTL design, and it is exactly how the accelerators in Part 5 are organized.`,
  },
  {
    slug: "timing-analysis",
    title: "Static Timing Analysis: Paths, Slack, and Skew",
    part: "digital-design",
    order: 10,
    minutes: 22,
    summary:
      "How chips are proven fast: the STA graph model, setup and hold checks with clock skew, slack computation, and multi-corner signoff.",
    relatedNodeIds: ["compute"],
    body: `## Proving timing without simulation

You cannot simulate your way to timing correctness: a billion-gate chip has astronomically many input combinations, and the slowest path might wake up only on one of them. **Static timing analysis (STA)** takes a different tack: ignore logic values entirely, model the design as a graph of delays, and compute worst-case arrival times for *every* path simultaneously. Conservative, exhaustive, fast — STA is the tool that ultimately says "this chip runs at 2 GHz."

The mental model:

- Nodes: cell pins.
- Edges: cell delays (from library lookup: a function of input slew and output load) and wire delays (from parasitics).
- **Startpoints**: input ports and flip-flop clock pins (launch). **Endpoints**: output ports and flip-flop data pins (capture).
- A **timing path** is any startpoint-to-endpoint route through combinational logic. Four families: FF→FF (register to register — the bulk), input→FF, FF→output, input→output.

STA propagates two numbers to every node: the latest possible **arrival time** (AAT, pushed forward from startpoints) and the latest permissible **required time** (RAT, pulled backward from endpoint constraints). The verdict at every node:

$$\\text{slack} = RAT - AAT$$

Positive slack: margin to spare. **Negative slack: violation** — the path is too slow (or too fast, for hold). Two summary metrics run every physical-design tool's life: **WNS** (worst negative slack — the single worst path) and **TNS** (total negative slack — the sum over all violating endpoints, a measure of how *broadly* broken timing is).

## The two checks, now with skew

From the sequential-logic chapter, extended with real clock-network effects. Let launch clock arrive at $t_{launch}$ and capture clock at $t_{capture}$; skew $t_{skew} = t_{capture} - t_{launch}$.

**Setup (max-delay) check** — slow data must beat the *next* capture edge:

$$t_{launch} + t_{cq} + t_{comb,max} + t_{su} \\;\\le\\; t_{capture} + T_{clk}$$

$$\\text{slack}_{setup} = T_{clk} + t_{skew} - (t_{cq} + t_{comb,max} + t_{su})$$

**Hold (min-delay) check** — fast data must not overrun the *same* capture edge:

$$t_{cq} + t_{comb,min} \\;\\ge\\; t_h + t_{skew}$$

$$\\text{slack}_{hold} = t_{cq} + t_{comb,min} - t_h - t_{skew}$$

Read the skew signs carefully — they are the most-tested intuition in VLSI interviews: **positive skew (capture clock late) relaxes setup but tightens hold.** Skew is a budget you can spend on one check only. And since hold failures are unfixable in the field (frequency-independent), tools treat hold with paranoia: extra **uncertainty** margins, pessimistic corners, and automatic hold-buffer insertion late in the flow.

Real clock trees add two more terms: **jitter** (cycle-to-cycle wobble of the clock source — eats into every setup budget) and modeled **clock uncertainty** applied before clock-tree synthesis exists. Part 3's CTS chapter covers how the tree is actually built.

> **Analogy: the relay race with imperfect stopwatches.** Every FF-to-FF path is a relay leg: the baton (data) leaves runner A when A's stopwatch fires, and must be in runner B's hand before B's stopwatch fires *next* — minus the fumble time B needs to grip it (setup). If B's watch runs a bit late (positive skew), the runner gets bonus time — but now a *fast* baton thrown at B arrives while B is still holding the previous baton (hold violation). The race is won or lost by the slowest leg (WNS), and the coach's report listing every late leg, sorted worst-first, is exactly an STA timing report.

## Reading a timing report

The daily artifact of a physical design engineer:

\`\`\`text
Startpoint: u_ctrl/state_reg[2]  (rising edge-triggered by clk)
Endpoint:   u_dp/acc_reg[17]    (rising edge-triggered by clk)
Path Group: clk    Path Type: max

  clock network delay (propagated)      0.312
  u_ctrl/state_reg[2]/CK -> Q  (DFF)    0.084   0.396
  U1041/A -> Y (NAND2X2)                0.031   0.427
  U1187/B -> Y (AOI22X1)                0.058   0.485
  ...  (14 more cells) ...
  u_dp/acc_reg[17]/D (setup)            ----    1.892
  data required time                            1.845
  ------------------------------------------------------
  slack (VIOLATED)                             -0.047
\`\`\`

Diagnosis skills: is the path deep (too many levels → restructure logic / retime)? Is one cell slow (weak drive on a big load → upsize)? Is wire delay dominating (placement problem)? Is clock network delay asymmetric (skew problem)? The fix menu differs completely per cause — which is why "just add pipeline stages" is not the first answer.

## Constraints: telling the tool what "correct" means

STA is only as truthful as its constraints (SDC format):

- \`create_clock -period 1.0\` — the contract everything is measured against.
- \`set_input_delay\` / \`set_output_delay\` — how much of the cycle the outside world consumes at chip boundaries.
- **False paths** — physically present but logically impossible paths (e.g., between mutually exclusive modes); excluded so they don't distort optimization.
- **Multicycle paths** — data legitimately allowed $N$ cycles (a slow divider). Both are power tools and chief sources of silicon-killing mistakes: a wrong false-path declaration silently un-checks a real path.

## Corners, OCV, and signoff

Silicon varies. Delay depends on **P**rocess (fast/slow transistors), **V**oltage, **T**emperature — so STA runs at multiple **PVT corners**: setup checked where everything is slow (SS, low V, high T), hold where everything is fast (FF, high V, low T... and, counterintuitively, hold can also be worst at low V with temperature inversion in modern nodes). On top: **OCV/AOCV/POCV derates** model *on-die* variation — launch path slow while capture path fast on the same die. Signoff means: all corners, all modes (functional, scan/test), setup and hold, WNS ≥ 0 and TNS = 0.

Where the numbers come from full-circle: cell delays from **Liberty** (.lib) tables characterized at each corner (delay vs input slew × output load), wire parasitics extracted from layout (Part 3's signoff chapter). Before layout exists, wire delays are *estimates* — which is why timing "closes" and reopens repeatedly through the physical flow, and why the whole of Part 3 is organized around keeping STA happy at every step.`,
  },
  {
    slug: "verilog-fundamentals",
    title: "Verilog and SystemVerilog Fundamentals",
    part: "digital-design",
    order: 11,
    minutes: 24,
    summary:
      "Describing hardware, not writing software: modules, always blocks, blocking vs non-blocking, and the coding patterns that synthesize cleanly.",
    relatedNodeIds: ["compute", "alt-chips"],
    body: `## A description, not a program

The single most important mental shift: Verilog is not executed top-to-bottom on your chip. It **describes hardware** — a structure of gates and registers that all exist and operate *simultaneously*, forever. The simulator gives an illusion of sequential execution; the synthesizer reads your text and infers physical structure. Write with the structure in mind and the language is simple; write it like C and you will fight ghosts.

> **Analogy: blueprint vs recipe.** A C program is a recipe — steps done in order by one cook. A Verilog module is a *blueprint of a factory*: every machine drawn on it is built, powered on, and runs concurrently, all the time. "Calling" a module doesn't execute it — *instantiating* it builds another copy of the machine. When you read RTL, ask "what does this build?", never "what does this do first?"

## Structure: modules, ports, signals

\`\`\`systemverilog
module counter #(
  parameter int WIDTH = 8
)(
  input  logic             clk,
  input  logic             rst_n,
  input  logic             en,
  output logic [WIDTH-1:0] count
);
  always_ff @(posedge clk or negedge rst_n)
    if (!rst_n)   count <= '0;
    else if (en)  count <= count + 1'b1;
endmodule
\`\`\`

- **Modules** are the unit of hierarchy; parameters make them reusable (your Phase 3 parameterized multiplier).
- Classic Verilog splits signals into \`wire\` (driven continuously) and \`reg\` (assigned in procedural blocks — badly named: it does **not** imply a register!). SystemVerilog's \`logic\` replaces both in nearly all cases; use it.
- Values are 4-state: 0, 1, **X** (unknown), **Z** (high-impedance). X-propagation in simulation is how uninitialized state reveals itself; Z is for tri-state buses (rare on-chip today).

## The three ways logic gets described

**1. Continuous assignment** — pure combinational wiring:

\`\`\`systemverilog
assign y = (a & b) | c;
\`\`\`

**2. Combinational always block** — for logic needing if/case:

\`\`\`systemverilog
always_comb begin
  y = '0;                 // default first: no latches
  unique case (sel)
    2'd0: y = a;
    2'd1: y = b;
    2'd2: y = c;
  endcase
end
\`\`\`

**3. Sequential always block** — infers flip-flops:

\`\`\`systemverilog
always_ff @(posedge clk) q <= d;
\`\`\`

Use the SystemVerilog flavors (\`always_comb\`, \`always_ff\`, \`always_latch\`) instead of bare \`always\`: they declare intent and the tools *verify* it — an \`always_comb\` that accidentally infers a latch is a compile error instead of a silent bug.

**The latch-inference trap:** in a combinational block, any path through your if/case that fails to assign an output means "hold the old value" — which requires memory — which infers a **latch** you did not want. Cures: assign defaults at the top, complete every case, or use \`unique case\`.

## Blocking vs non-blocking: the rule and the reason

The most notorious pitfall in the language:

- \`=\` **blocking**: assignment happens immediately, in statement order — like C.
- \`<=\` **non-blocking**: right-hand sides are all sampled first; assignments land together at the end of the time step.

**The rule: \`<=\` in \`always_ff\`, \`=\` in \`always_comb\`. No exceptions worth learning early.**

Why: real flip-flops all sample their D inputs at the *same clock edge*, then update together. Non-blocking models exactly that. Use blocking in a clocked block and this two-stage shift register:

\`\`\`systemverilog
always_ff @(posedge clk) begin
  q1 = d;    // WRONG: q2 sees the NEW q1
  q2 = q1;   // simulates as ONE register, synthesizes as TWO
end
\`\`\`

collapses in simulation (q2 gets d in one cycle) while synthesis builds the two registers you wrote — a **simulation/synthesis mismatch**, the worst class of bug: your testbench passes and your silicon fails. With \`<=\`, both simulation and synthesis agree on two registers.

## What synthesizes to what

| You write | Synthesis builds |
|---|---|
| \`assign\` / \`always_comb\` | Gates (muxes for if/case, adders for +) |
| \`always_ff @(posedge clk)\` | D flip-flops + input logic |
| Incomplete combinational assignment | **Latch** (usually a bug) |
| \`case\` with all branches | Balanced mux tree |
| Priority \`if/else if\` chain | Priority (unbalanced) mux chain — longer critical path for late conditions |
| \`*\` on \`logic [7:0]\` | A real multiplier (big!) — know you asked for it |
| \`initial\` blocks, delays \`#10\`, \`$display\` | **Nothing** — simulation only |

That last row is the synthesizable-subset boundary: testbench constructs (delays, \`initial\`, file I/O, classes) describe *stimulus*, not hardware.

## Testbenches: the other half

Verification code is allowed the full language. The minimal self-checking pattern (your Phase 3 bread and butter):

\`\`\`systemverilog
module counter_tb;
  logic clk = 0, rst_n, en;
  logic [7:0] count;

  counter dut (.*);              // instantiate device under test

  always #5 clk = ~clk;          // 100 MHz clock

  initial begin
    rst_n = 0; en = 0;
    repeat (2) @(posedge clk);
    rst_n = 1; en = 1;
    repeat (10) @(posedge clk);
    assert (count == 8'd10)
      else $fatal(1, "count=%0d, expected 10", count);
    $display("PASS");
    $finish;
  end
endmodule
\`\`\`

Self-checking (asserts, not eyeballing waveforms) is the habit that separates professionals; Part 4 builds this into full verification methodology — constrained-random stimulus, coverage, UVM.

## SystemVerilog upgrades worth using from day one

- **Types**: \`logic\`, \`enum\` (FSM states with names in waveforms!), \`typedef\`, packed \`struct\` (bundle a bus's fields).
- **\`interface\`** — group related signals (e.g., all of an AXI channel) into one connectable object; tames port-list explosions.
- **Assertions** (\`assert property\`) — executable specifications checked continuously; the gateway to formal verification (Part 4).
- \`$clog2(N)\` — the idiomatic way to size address widths from parameters.

Style rules that prevent 90% of beginner pain: one clock edge per \`always_ff\`; no signal assigned from two blocks; separate combinational from sequential blocks; name registers \`_q\` or \`_reg\` if it helps you see the hardware; and run lint (Verilator \`--lint-only\` is free) before any simulation.`,
  },
  {
    slug: "memory-sram-dram-flash",
    title: "Memory: SRAM, DRAM, and Flash",
    part: "digital-design",
    order: 12,
    minutes: 22,
    summary:
      "How bits are stored at scale: the 6T SRAM cell, the 1T1C DRAM cell and refresh, floating-gate flash, and the array structures around them.",
    relatedNodeIds: ["memory", "compute"],
    body: `## Storage is structure

Registers (flip-flop based) cost ~20 transistors per bit — fine for a few thousand bits of state, absurd for megabytes. Memory arrays get the per-bit cost down by sharing everything *around* the bit: one bit becomes a tiny cell, and vast peripheral machinery (decoders, sense amps) is amortized over millions of cells.

Every memory in this chapter shares one skeleton:

\`\`\`mermaid
flowchart TB
  ADDR["Address"] --> RD["Row decoder"]
  RD -->|"activates one wordline"| ARR["Cell array<br/>(rows x columns)"]
  ARR -->|"bitlines"| SA["Sense amplifiers"]
  SA --> CM["Column mux"]
  CM --> DOUT["Data out"]
\`\`\`

The row decoder (Part 2's decoder, at industrial scale) raises exactly one **wordline**; every cell on that row connects to its column's **bitline**; sense amplifiers turn faint bitline signals into digital values. The differences between SRAM, DRAM, and flash are entirely in the **cell**.

## SRAM: the 6T cell

The workhorse of on-chip memory — caches, register files, scratchpads, FPGA configuration.

The cell is the bistable inverter loop from the sequential-logic chapter, plus two access switches: **two cross-coupled inverters (4 transistors) + 2 NMOS access transistors = 6T**. The access transistors connect the loop's two internal nodes to a complementary bitline pair (BL, BLB) when the wordline rises.

- **Read**: precharge both bitlines high; raise the wordline. The cell's 0-side pulls its bitline down slightly; the sense amp detects the ~100 mV **differential** and snaps to a full logic value. Differential sensing is what makes reads fast and noise-immune.
- **Write**: drive the bitline pair hard to the new value; the write drivers overpower the small cell inverters and flip the loop.
- The cell holds its state as long as power is on (**static**) — no refresh, no clocking; the feedback loop maintains itself.

The silent art is transistor ratioing: access transistors must be strong enough to write the cell but weak enough that a read doesn't accidentally flip it (**read stability** vs **writability** — quantified by the *static noise margin*, the classic butterfly-curve analysis). This tension is why SRAM cells are designed by fabs as pre-qualified layout macros, why they get their own lower-voltage limits ($V_{min}$), and why 8T/10T cells (separate read port) appear when margins get thin.

Rules of thumb: ~6 devices/bit means SRAM is **fast (sub-ns), power-hungry, and big** (~100–200 F² per bit). It scales with logic (same process), which is exactly why it is the on-chip memory — and why AI chips (Part 5) budget it in megabytes, not gigabytes.

## DRAM: the 1T1C cell

One access transistor + one capacitor. The bit is **charge on the capacitor** (~20–30 fF). That is the whole cell — 6x fewer devices than SRAM, and the capacitor is dug *vertically* (deep trench or stacked) so the footprint stays tiny.

The price of minimalism, item by item:

- **Leakage → refresh.** The capacitor leaks; every cell must be read and rewritten every **64 ms** (the JEDEC standard). Refresh consumes bandwidth and power, and worsens as densities rise ("**dynamic**" RAM).
- **Destructive reads.** Sharing charge with the (much larger) bitline destroys the stored value; every read must be followed by a write-back — handled by the sense amp, which latches the value and restores the row (this is why an "open row" acts as a fast row buffer).
- **Tiny signal.** Charge sharing yields:

$$\\Delta V = \\frac{C_{cell}}{C_{cell} + C_{bitline}} \\cdot \\frac{V_{DD}}{2} \\;\\approx\\; \\text{50–100 mV}$$

  Detecting that reliably is a sense-amplifier art form.
- **Different process.** DRAM's capacitor structures don't co-exist cheaply with logic transistors — the deep reason DRAM is (almost always) a *separate chip*, and thus the deep reason **off-chip memory bandwidth is the wall AI architectures fight** (Part 5's HBM chapter: stacking DRAM dies next to the processor to shorten the trip).

> **Analogy: whiteboard vs sandcastle.** SRAM is writing on a whiteboard: effortful to write (flip the whole latch) but it stays exactly as written for as long as the room has lights on. DRAM is sculpting a sandcastle below the tide line: quick and cheap to shape, but it erodes continuously — someone must walk the beach every 64 ms re-patting every castle (refresh), and *inspecting* a castle knocks it down, so you must rebuild it right after looking (destructive read + write-back). Flash, coming next, is carving into stone: writing takes real effort and each carve wears the stone, but the message survives with no power at all.

Timing vocabulary you will meet in every datasheet: **row activate** (open a row into the sense amps), **CAS latency** (column read from open row), **precharge** (close the row). Bank parallelism hides these latencies; access *patterns* (row hits vs conflicts) swing effective bandwidth by an order of magnitude — the origin of memory-coalescing rules in GPU programming.

## Flash: the floating gate

Non-volatile storage — data with the power off — comes from a transistor with a secret: a **floating gate** (or charge-trap layer) buried in the oxide between channel and control gate. Electrons forced onto that island (by Fowler-Nordheim tunneling or hot-electron injection, at ~20 V programming voltages) shift the transistor's threshold voltage $V_T$. Reading = applying an intermediate gate voltage and seeing whether the device conducts. The charge sits on an insulated island; it stays for **years** unpowered.

- **Program** = add electrons (raise $V_T$); can only move bits one way (1→0).
- **Erase** = remove electrons — only in bulk, a whole **block** at a time (hence "flash"). Writing requires erase-then-program at block granularity: the reason SSDs need flash-translation layers, garbage collection, and wear leveling.
- **Endurance**: each program/erase cycle damages the tunnel oxide — ~1k–100k cycles per cell depending on generation.
- **Bits per cell**: storing 2–4 bits means resolving 4–16 distinct $V_T$ levels (MLC/TLC/QLC) — density up, speed/endurance down.
- **NAND vs NOR**: NAND strings cells in series (minimal area, page access — mass storage); NOR wires them in parallel (random access, code execution). The names are literally the gate-structure topologies from the Boolean chapter.

Modern **3D NAND** stopped shrinking cells laterally and went vertical: 200+ stacked layers with vertical channel strings — the memory industry's own escape from planar scaling limits.

## The hierarchy, by the numbers

| | Cell | Latency | Density | Volatile? | Lives |
|---|---|---|---|---|---|
| SRAM | 6T latch | ~0.5–2 ns | 1x | Yes | On-chip (caches, scratchpads) |
| DRAM | 1T1C | ~30–50 ns | ~20x | Yes (refresh) | Off-chip DIMMs / HBM stacks |
| Flash | Floating gate | ~25 µs read | ~200x | **No** | SSDs |

Each level trades a ~10–100x latency penalty for a ~10–20x density gain — the physical basis of the entire memory-hierarchy concept (your Phase 2 roadmap), of caching, and of the AI-chip design space in Part 5, where choosing *which* level holds weights and activations (SRAM scratchpad vs HBM) defines the architecture.`,
  },
];
