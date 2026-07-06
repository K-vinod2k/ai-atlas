import type { TextbookChapter } from "./types";

export const PART3_CHAPTERS: TextbookChapter[] = [
  {
    slug: "rtl-to-gdsii-flow",
    title: "The RTL-to-GDSII Flow",
    part: "physical-design",
    order: 13,
    minutes: 20,
    summary:
      "The industrial pipeline that turns Verilog into a manufacturable chip: every stage from synthesis to tapeout, and why the flow is a loop, not a line.",
    relatedNodeIds: ["compute", "alt-chips"],
    body: `## From text file to tapeout

Between your SystemVerilog and a working chip stands a months-long pipeline run by some of the most sophisticated software ever written (EDA tools from Synopsys, Cadence, Siemens). The endpoint is **GDSII** — a file of polygons, layer by layer, that the fab turns into masks. Everything in Part 3 is a stage of this pipeline; this chapter is the map.

\`\`\`mermaid
flowchart TB
  RTL["RTL (SystemVerilog)"] --> SYN["Synthesis<br/>RTL → gate netlist"]
  SYN --> FP["Floorplanning<br/>die size, macros, power grid"]
  FP --> PL["Placement<br/>every cell gets x,y"]
  PL --> CTS["Clock tree synthesis<br/>build the clock network"]
  CTS --> RT["Routing<br/>every net gets wires"]
  RT --> SO["Signoff<br/>DRC / LVS / STA / power / IR"]
  SO -->|"clean"| GDS["GDSII → tapeout"]
  SO -->|"violations"| ECO["ECO loop back"]
  ECO -.-> PL
  LIB["Liberty .lib + LEF<br/>(standard cell library)"] -.-> SYN
  LIB -.-> PL
  SDC["SDC constraints"] -.-> SYN
  SDC -.-> SO
\`\`\`

The stages in one breath:

1. **Synthesis** — Boolean-optimize the RTL and map it onto library gates; out comes a netlist that meets timing *on paper*.
2. **Floorplanning** — decide die size, place the big blocks (macros: SRAMs, PLLs), plan power delivery and pin locations.
3. **Placement** — assign each of millions of standard cells a legal (x, y).
4. **Clock tree synthesis (CTS)** — build the physical network delivering the clock to every flop with controlled skew.
5. **Routing** — connect every net with actual metal on 10–15 layers.
6. **Signoff** — prove the polygons are manufacturable (DRC), match the netlist (LVS), meet timing at every corner (STA), and stay within power/IR budgets.

Two supporting cast members appear at every stage: the **standard cell library** (Liberty timing/power models + LEF physical footprints — the vocabulary of gates the flow builds with) and the **SDC constraints** (Part 2's timing chapter — the contract being enforced).

## Why it is a loop

The flow diagram lies slightly: real projects iterate. Each stage makes decisions using *estimates* of information only known later:

- Synthesis estimates wire delay with crude models; placement makes wires real, and timing changes.
- Placement assumes an ideal clock; CTS builds the real one, and skew changes hold/setup budgets.
- Routing adds coupling capacitance nobody modeled; extraction reveals it; timing shifts again.

So the pipeline runs **estimate → commit → re-check**, with **ECO** (engineering change order) loops patching violations discovered late: resize a cell here, add a hold buffer there, reroute a net — surgical fixes that avoid re-running the whole flow. A design "converges" when an iteration introduces fewer problems than it fixes. Modern flows shrink the loop by making early stages "physically aware" (synthesis that does trial placement) — the industry's forty-year war against late surprises.

> **Analogy: building a city on a deadline.** Synthesis is drafting the list of every building the city needs. Floorplanning is zoning: where the stadium, the power plant, and the harbor go. Placement assigns every house a street address. CTS installs the church-bell network so every district hears noon at the same moment. Routing paves every road and lays every pipe. Signoff is the army of inspectors — building code (DRC), "does the city match the blueprints?" (LVS), rush-hour traffic simulations (STA), and the electric grid stress test (IR drop). And exactly like a real city: the road engineers keep discovering that a neighborhood was zoned somewhere unroutable, and the planners go back and move it. Nobody builds a city in one pass.

## The physical vocabulary

Concepts every later chapter assumes:

- **Standard cells** — pre-designed, pre-characterized gate layouts, all the *same height*, placed in rows like text lines. Uniformity is what makes million-cell automation tractable. Libraries offer each function in multiple drive strengths (X1, X2, X4...) and threshold flavors (multi-$V_t$: fast-leaky to slow-frugal).
- **Macros** — big pre-built blocks (SRAM arrays from a memory compiler, PLLs, SerDes). Placed by hand during floorplanning; the standard-cell sea flows around them.
- **Power delivery network (PDN)** — rings + straps + rails delivering $V_{DD}$/GND. Designed at floorplan time, because it consumes routing resources everything else must live with.
- **Utilization** — placed cell area / available area. Target ~60–75%; the "empty" space is not waste, it is routing headroom and ECO space. Push to 90% and the router will not converge — one of physical design's most reliable rookie lessons.
- **PPA** — power, performance, area: the three-way tradeoff every decision navigates. You can generally have two.

## What can go wrong (the debugging worldview)

Physical design is managed pessimism. The recurring failure modes — congestion (more wires want through a region than tracks exist), timing non-convergence (fixing setup breaks hold, fixing hold adds area, area worsens congestion...), IR drop hotspots, and late DRC storms — are all consequences of decisions made stages earlier. The craft is attributing each symptom to its true origin stage and fixing it *there*, not where it surfaced. Keep that loop-shaped mental model as the next five chapters go stage by stage.`,
  },
  {
    slug: "synthesis",
    title: "Logic Synthesis: From RTL to Gates",
    part: "physical-design",
    order: 14,
    minutes: 20,
    summary:
      "How a compiler for hardware works: elaboration, technology-independent optimization, technology mapping onto library cells, and timing-driven restructuring.",
    relatedNodeIds: ["compute"],
    body: `## The hardware compiler

Synthesis ingests three things — RTL, a **Liberty library** (every available cell with delay/power tables), and **SDC constraints** (clocks, I/O delays) — and emits a gate-level netlist that meets timing, in minimum area and power. It is a compiler whose "instruction set" is the standard cell library, and whose optimization target is a physics problem.

Three phases:

\`\`\`mermaid
flowchart LR
  A["Elaboration<br/>RTL → generic netlist"] --> B["Tech-independent<br/>Boolean optimization"]
  B --> C["Technology mapping<br/>+ timing-driven optimization"]
  C --> D["Gate netlist + reports"]
\`\`\`

## Phase 1: Elaboration

The RTL is parsed and every construct becomes generic hardware: \`always_ff\` → flip-flops, \`case\` → muxes, \`+\` → an abstract adder, FSM enums → state registers. Parameters resolve, generate loops unroll, hierarchy is built. Output: a technology-independent netlist of generic components (GTECH).

This is also where your coding choices from Part 2 get cashed in: the incomplete \`case\` becomes a latch *here*; the accidental \`*\` on 32-bit operands becomes a 32×32 multiplier *here*. Reading elaboration warnings is the cheapest debugging you will ever do.

Datapath operators get special treatment: the tool holds \`+\` abstract as long as possible, so it can later choose ripple-carry vs parallel-prefix (Part 2's adder menu) based on how much slack the path has — slow paths get small adders, critical paths get Kogge-Stone.

## Phase 2: Technology-independent optimization

Pure Boolean surgery on the network, no library yet:

- **Constant propagation & dead logic removal** — tied-off inputs collapse whole cones.
- **Common subexpression sharing** — one adder feeding two consumers instead of two adders.
- **Multi-level restructuring** — factoring ($ab + ac \\to a(b+c)$), decomposition, and the AIG (and-inverter graph) rewriting engines of modern tools.
- **Retiming** — slide registers across combinational logic to balance pipeline stages (the tool literally moves your flip-flops if you let it).
- **FSM re-encoding** — swap your binary encoding for one-hot if timing wants it.

The objective juggles literal count (area proxy) against network depth (delay proxy) — Part 2's Boolean identities, applied a billion times by machine.

## Phase 3: Technology mapping

Now the library enters. The optimized Boolean network must be **covered** by actual cells: this cluster of ANDs and inverters becomes a NAND3X2; that one, an AOI22X1. Classically formulated as DAG covering (tree-covering by dynamic programming gives optimal answers on trees), with cost = delay, area, or power per the constraint pressure.

After mapping comes the grind of **incremental timing-driven optimization** — the tool runs its internal STA (Part 2), finds negative-slack paths, and applies a repair menu:

| Move | What it does | Cost |
|---|---|---|
| Upsize cell (X1→X4) | More drive into big load | Area, power, upstream load grows |
| Insert buffers | Break long/high-fanout nets | Area, delay elsewhere |
| Logic restructuring | Rebalance trees; late signal → shallow logic | Churn |
| Swap to low-$V_t$ | Faster transistor flavor | **Leakage** (multi-$V_t$ budget) |
| Clone gates | Duplicate a driver, split fanout | Area |

Watch a synthesis log and you see WNS/TNS tick toward zero move by move.

> **Analogy: translating a novel under a deadline.** Elaboration is a literal word-for-word gloss of the novel — correct, clumsy, huge. Boolean optimization is editing the gloss in your own language: cutting redundancy, merging repeated phrases, restructuring sentences — no target vocabulary needed yet. Technology mapping is the final translation into the target language, where you may only use words from a specific dictionary (the cell library), each word tagged with a cost (syllables = delay, ink = area). And timing-driven optimization is the editor pass where every sentence the critic flagged as slow-to-read (negative slack) gets rewritten with punchier words from the dictionary — accepting that punchy words cost more ink.

## Reading the outputs

Synthesis emits the netlist plus three reports you must be able to read:

- **Timing report** — Part 2's STA report format. Post-synthesis timing uses *estimated* wires (wire-load models or physical-aware estimates), so treat "meets timing" as "plausibly meets timing."
- **Area report** — cell counts and µm² by hierarchy; where your silicon budget went. The perennial surprise: registers and clock infrastructure often dominate combinational logic.
- **Power report** — early $\\alpha C V^2 f$ estimates from switching-activity guesses; refined at signoff (chapter 17).

## What you control

Synthesis quality is 80% determined by inputs, not tool wizardry:

- **Constraints are the steering wheel.** Under-constrain and everything is "fast enough" (nothing optimized); over-constrain and the tool burns area/leakage chasing impossible goals, leaving you *worse* off. Realistic clocks + honest I/O budgets = good netlists.
- **RTL structure is destiny.** The tool will not pipeline your 60-level multiply-accumulate for you (retiming helps only locally). Deep logic must be re-architected in RTL — the reason Part 2's delay math is a designer's daily tool, not trivia.
- **\`dont_touch\`, boundaries, and hierarchy** — flatten for optimization freedom vs preserve for debuggability/ECO surgery.

Modern reality: **physical synthesis**. At advanced nodes, wire delay estimation without placement is fiction, so tools (Design Compiler Topographical / Fusion Compiler, Genus-iSpatial) run coarse placement *inside* synthesis. The line between this chapter and the next is intentionally blurring — same war on late surprises as the flow chapter described.`,
  },
  {
    slug: "floorplanning-placement",
    title: "Floorplanning and Placement",
    part: "physical-design",
    order: 15,
    minutes: 22,
    summary:
      "Deciding where everything lives: die planning, macro placement, power grids, and the analytic placement math (HPWL) that positions a million cells.",
    relatedNodeIds: ["compute", "alt-chips"],
    body: `## Geography is destiny

After synthesis you have a netlist — a graph with no geometry. Floorplanning and placement give it geometry, and geometry *is* performance: a wire's delay grows with its length (quadratically, unbuffered), so **where cells sit determines whether timing can close at all**. No routing or optimization heroics rescue a bad floorplan.

## Floorplanning: the big rocks first

Decisions made once, lived with forever:

- **Die size & aspect ratio** — total cell area / target utilization (~60–75%), shaped to fit the package and pin budget.
- **Macro placement** — SRAMs, PLLs, hard IP get placed by hand (or semi-automatically) first. Heuristics that survived decades: macros to the edges and corners, keep the core center open for standard cells; orient pins toward their consumers; leave routing channels between macro clusters; never strand a region of core behind a wall of macros (routing shadow).
- **Pin / bump assignment** — where signals enter and leave; misplaced I/O forces long cross-die routes forever after.
- **Power delivery network (PDN)** — rings around the core, straps across it, rails in every row. Sized for worst-case current *before* anyone knows the real currents: too weak → IR drop failures at signoff; too generous → routing tracks stolen from signals. (Signoff chapter returns to IR.)
- **Partitioning** — for large SoCs, split into physical blocks implemented in parallel by different engineers, with a top-level "chip assembly" plan and timing budgets at block boundaries.

> **Analogy: furnishing an apartment.** Floorplanning is moving day: the sofa, the bed, the wardrobe (macros) get positioned first, because they barely move once set down, and the electrical outlets and plumbing (PDN, pins) are decided with the walls. Placement is then arranging every book, plate, and utensil (standard cells) so that things used together sit together — coffee mug near the coffee machine. Wirelength is total steps-walked-per-day. A bad furniture layout (floorplan) makes some daily trips long no matter how cleverly you arrange the small items; and if you cram shelving to 95% of floor area (utilization), you cannot walk anywhere at all (congestion).

## Placement: a million cells, one objective

Now the automated part: assign every standard cell a position minimizing wirelength, subject to no-overlap and meeting timing. Exact optimization is hopeless (NP-hard, at 10⁶–10⁸ variables); the field's fifty-year arc — simulated annealing (1980s) → min-cut partitioning → today's **analytic placement** — is a case study in taming scale, and (Part 5 preview) the exact problem AlphaChip attacked with RL.

**The objective.** True wirelength is only known after routing, so placement optimizes a proxy: **half-perimeter wirelength (HPWL)**. For net $e$ connecting pins at coordinates $(x_i, y_i)$:

$$HPWL(e) = \\left( \\max_{i \\in e} x_i - \\min_{i \\in e} x_i \\right) + \\left( \\max_{i \\in e} y_i - \\min_{i \\in e} y_i \\right)$$

— the half-perimeter of the pins' bounding box, summed over all nets: $\\min \\sum_e w_e \\cdot HPWL(e)$. It is cheap, and exact for 2–3 pin nets (most nets); weights $w_e$ let timing-critical nets pull harder.

**The analytic trick.** HPWL's max/min is non-differentiable, so replace it with a smooth surrogate — e.g. the log-sum-exp / weighted-average approximation:

$$\\max_i x_i \\;\\approx\\; \\gamma \\ln \\sum_i e^{x_i / \\gamma}$$

Now the objective is differentiable and you can run **gradient-based optimization on cell coordinates**. Alone, this collapses every cell to one point, so a **density penalty** spreads them out. The celebrated ePlace/RePlAce formulation models cells as charged particles and density as an *electrostatic field* (solved with FFTs): wirelength pulls cells together, the field pushes them apart, and the optimizer — literally Nesterov's accelerated gradient descent — balances the two:

$$\\min_{x,y} \\; \\sum_e HPWL_{smooth}(e) + \\lambda \\cdot \\text{Density}(x, y)$$

If that looks like training a neural network — differentiable objective, gradient descent, a regularizer, even a $\\lambda$ schedule — it should. Modern placers *are* large-scale numerical optimizers, GPU-accelerated ones included (DREAMPlace runs placement with PyTorch kernels). Your ML mental models transfer directly.

**Three passes in practice:**

1. **Global placement** — the analytic optimization above; overlapping cells, ideal positions.
2. **Legalization** — snap every cell onto rows and sites, no overlaps, minimum displacement.
3. **Detailed placement** — local polish: swap neighbors, flip cells, shove within rows to recover wirelength lost in legalization.

## What placement must also worry about

- **Timing-driven placement** — pure wirelength is democratic; timing is not. Critical paths (from the integrated STA) get their nets up-weighted, physically shortening the paths that set $f_{max}$.
- **Congestion** — wirelength-minimal placements can demand more wires through a region than tracks exist. Placers estimate routing demand vs supply per region and *spread* cells in hotspots — deliberately trading wirelength for routability.
- **Cell density / pin density caps**, keep-out halos around macros, and **scan-chain reordering** (stitch test chains in placement order to reclaim wirelength).

Quality metrics on the way out: total HPWL, worst congestion overflow, estimated WNS/TNS. Then the design meets its clock — literally — in the next chapter, CTS.`,
  },
  {
    slug: "cts-routing",
    title: "Clock Tree Synthesis and Routing",
    part: "physical-design",
    order: 16,
    minutes: 22,
    summary:
      "Delivering the heartbeat and wiring the body: clock distribution structures, skew management, then global and detailed routing with design rules.",
    relatedNodeIds: ["compute"],
    body: `## Part one: the clock gets real

Until now the clock has been an idealization — every flop ticking at the same instant. **Clock tree synthesis (CTS)** builds the physical network, and physics extracts its price. The clock net is like no other: it touches *every* sequential cell (hundreds of thousands of sinks), switches *every* cycle (typically **30–40% of total chip dynamic power** by itself), and its imperfections — skew and jitter — tax every single timing path on the chip (recall from STA: skew tightens hold, jitter eats setup).

The goal is not zero delay — it is **equal delay**: insertion delay from clock source to every sink matched within a skew target (tens of ps).

**Structures**, in increasing cost and robustness:

- **Buffered tree** — recursive branching with balanced buffers; the workhorse. Classic geometric construction: **H-tree**, whose self-similar shape gives equal path lengths by symmetry.
- **Clock spine / fishbone** — a strong central trunk with matched ribs; common in datapath-heavy designs.
- **Clock mesh** — a shorted grid driven from many points: skew and variation-tolerance excellent (paths average out), power cost high. High-end CPUs use meshes or mesh-tree hybrids.

\`\`\`mermaid
flowchart TB
  SRC["Clock source (PLL)"] --> B1["Buffer"]
  B1 --> B2a["Buffer"] & B2b["Buffer"]
  B2a --> B3a["Buffer"] & B3b["Buffer"]
  B2b --> B3c["Buffer"] & B3d["Buffer"]
  B3a --> F1["FFs"] 
  B3b --> F2["FFs"]
  B3c --> F3["FFs"]
  B3d --> F4["FFs"]
\`\`\`

CTS mechanics: cluster sinks geographically, build the tree bottom-up, insert balanced buffers level by level, then fine-tune with wire-snaking/buffer sizing to equalize insertion delays. **Clock gates** (from the low-power chapter ahead) live inside the tree and must be balanced like everything else. **Useful skew** turns the enemy into a tool: deliberately deliver the clock *early* to paths that need setup help upstream and *late* to those needing it downstream — spending the skew budget where Part 2's equations say it pays.

After CTS, hold checks become real (the ideal-clock assumption hid them): the tool inserts **hold buffers** on too-fast paths — the min-delay fix STA promised.

> **Analogy: the orchestra with a distributed conductor.** A chip is an orchestra too large for one conductor everyone can see — so you build relay conductors (buffers) passing the beat outward. Skew is two relay conductors beating out of sync: musicians (flops) on the seam play to different beats, and ensemble passages between them (timing paths) smear. A tree gives everyone their own relay chain of equal length; a mesh is all relays joined hands, moving as one — steadier, but you pay every relay conductor full salary every beat (mesh power). "Useful skew" is the sly move: cue the brass a hair early because their passage (critical path) needs the head start.

## Part two: routing — every net gets metal

Placement fixed positions; routing must now realize every net as actual wire on 10–15 metal layers — lower layers thin/dense for local hops, upper layers thick/fast for long hauls and power (the fabrication chapter's BEOL stack). Alternating layers run orthogonally (M1 horizontal, M2 vertical, ...), with **vias** connecting between; **routing tracks** discretize each layer into legal wire positions.

Two phases, mirroring placement's global/detailed split:

**Global routing** — tile the die into a coarse grid (GCells), assign each net a tile-to-tile path, respecting per-tile capacity. This is where **congestion** becomes real: demand > supply in a tile means detours or failure. The congestion map is the single most-watched picture in physical design — and chronic hotspots are, as ever, a placement or floorplan problem being paid for late.

**Detailed routing** — within the global plan, assign exact tracks, layers, and via positions, obeying the full **design-rule** catalog (min width/spacing, via enclosure, and advanced-node exotica: double-patterning color conflicts, forbidden via patterns, end-of-line spacing...). The classic algorithmic core: maze routing (Lee's BFS guarantees a shortest path if one exists; A* accelerates it), line-probe methods, and rip-up-and-reroute negotiation — thousands of passes where nets are torn out and re-laid to resolve conflicts, DRC count trending (ideally) to zero.

Routing is also where **signal integrity** enters:

- **Crosstalk** — neighboring wires couple capacitively; an aggressor switching next to a victim injects glitches and shifts delay (both directions — hurting setup *and* hold). Fixes: spacing, shielding (ground wires beside sensitive nets — clocks are always shielded), layer moves, staggering.
- **Antenna rules** — during fabrication, a long unconnected wire charged by plasma etching can blow the thin gate oxide it connects to; fixed with jumper layer-hops or diode insertion. A pure manufacturing-physics rule that routing must honor.
- **Wire delay math** — a wire's own RC gives delay growing *quadratically* with length (Elmore: distributed RC ≈ $\\tfrac{1}{2}RCL^2$); **buffer insertion** every so often restores linearity. This is why long-haul nets get repeater chains and why upper thick metals (lower R) carry them.

Out the other end: a fully routed database, parasitics extracted (every wire's real R and C — SPEF), timing re-checked with truth instead of estimates. What remains is proving everything — signoff, next chapter.`,
  },
  {
    slug: "signoff-drc-lvs-power",
    title: "Signoff: DRC, LVS, Timing, and Power",
    part: "physical-design",
    order: 17,
    minutes: 22,
    summary:
      "The final exams before tapeout: physical verification (DRC/LVS), multi-corner timing closure, and power analysis with the dynamic and leakage equations.",
    relatedNodeIds: ["compute"],
    body: `## No partial credit

Signoff is the set of checks a design must pass before **tapeout** — sending GDSII to the fab. The stakes concentrate the mind: a mask set at an advanced node costs millions of dollars and a respin costs a quarter of schedule. Signoff tools are therefore *different, more accurate implementations* than the ones used during implementation (Calibre for physical, PrimeTime for timing are the classic golden tools) — you do not grade your own homework.

## Physical verification: DRC and LVS

**DRC — design rule checking.** Every polygon on every layer against the fab's rule deck (thousands of rules at advanced nodes): minimum widths, spacings, enclosures, density windows (CMP, from the fabrication chapter), antenna limits, double-patterning colorability. A clean DRC means *manufacturable* — nothing more. The end-of-project "DRC storm" is a rite of passage; the closer to tapeout, the more surgical the fixes must be.

**LVS — layout versus schematic.** Extract the transistor-level netlist implied by the polygons and prove it isomorphic to the intended netlist. LVS catches shorts (polygons touching that shouldn't), opens (missing connections), wrong device sizes, and mislabeled power hookups. DRC-clean and LVS-clean are independent: a beautiful, manufacturable layout of the *wrong circuit* passes DRC happily.

Plus the supporting cast: **ERC** (electrical rules: floating gates, well tie coverage), and **DFM** additions — dummy fill for density, redundant vias (single vias are a dominant yield/reliability failure mode; doubling them where space allows is free insurance).

> **Analogy: the three inspectors.** Before a skyscraper opens, three different inspectors walk it. The building-code inspector (DRC) checks every stairwell width and railing height against the code book — never asking what the building is *for*. The blueprint auditor (LVS) walks every room with the architect's drawings, verifying the built structure *is* the design — the right walls, pipes actually connected to fixtures. The stress engineers (STA, IR, power) simulate the building under load: rush hour in the elevators, every appliance on at once. Passing one inspection says nothing about the others — and the building opens only when all three sign.

## Timing signoff

Part 2's STA, at maximum paranoia: signoff-grade parasitics (extracted RC with coupling), signoff-grade STA engine, **all PVT corners × all modes** (functional, scan test, low-power modes), with OCV/POCV derates for on-die variation. Requirement: **WNS ≥ 0 and TNS = 0, setup and hold, every corner, every mode.** Also checked: max transition (slew) and max capacitance violations, and noise/glitch analysis (crosstalk-induced delay already folded into the timing).

Violations at this stage are fixed by **ECO** — minimal netlist/placement edits (resize, buffer, small reroutes) computed by the signoff tool itself and applied surgically, because a full re-run of the flow would both take weeks and *reshuffle the problem* rather than fix it.

## Power analysis: the two enemies

Where the chip's power budget is finally accounted for, using real parasitics and real (or representative) switching activity from simulation traces.

**Dynamic power** — the energy of switching. Charging a node capacitance $C$ to $V_{DD}$ and discharging it dissipates $C V_{DD}^2$ per full cycle; across the chip:

$$P_{dyn} = \\alpha \\, C_{sw} \\, V_{DD}^2 \\, f$$

with $\\alpha$ the activity factor (fraction of capacitance actually switching per cycle — data-dependent, hence the need for realistic simulation vectors: clocks have $\\alpha = 1$, datapaths often 0.1–0.2). Plus **short-circuit power** (both devices briefly on during each transition — small if slews are controlled) and — increasingly dominant at advanced nodes — **glitch power** (spurious transitions in deep combinational logic before settling; another reason to like shallow, balanced trees).

**Leakage (static) power** — paid every second, switching or not:

$$P_{leak} = V_{DD} \\sum_{cells} I_{leak} , \\qquad I_{leak} \\propto e^{-V_T / (n\\,kT/q)}$$

The exponential $V_T$ dependence is the scaling chapter's story come home to roost: it is why libraries offer multi-$V_t$ cells and why synthesis's low-$V_t$ swaps were a budgeted resource. Leakage also grows exponentially with *temperature* — the seed of thermal runaway concerns: hot chip → more leakage → hotter chip.

**IR drop and electromigration.** The PDN (floorplanning's early bet) now faces the verdict:

- **Static/dynamic IR** — current through grid resistance sags the local supply: $\\Delta V = I \\cdot R_{grid}$. A cell at $V_{DD} - 10\\%$ is a *slower* cell than STA assumed — IR and timing signoff are coupled. Dynamic IR adds the $L\\,di/dt$ story: simultaneous switching (every flop on a clock edge!) demands current spikes the grid plus decap network must supply.
- **Electromigration (EM)** — years of high current density physically transport metal atoms, voiding wires. Checked as current-density limits per wire/via; power straps and clock nets are the usual suspects.

| Check | Tool class | Question answered |
|---|---|---|
| DRC | Physical verification | Can the fab print it? |
| LVS | Physical verification | Is it the circuit we designed? |
| STA (all corners) | Signoff timing | Does it run at speed — always? |
| Power / IR / EM | Power integrity | Within budget, grid solid, wires durable? |

When every box is green: **tapeout**. Weeks later, wafers; then bring-up, where Part 4's verification effort determines whether the silicon actually works — because signoff proved the design was built *right*, never that the right design was built. That distinction is exactly where verification (Part 4) lives.`,
  },
  {
    slug: "low-power-design",
    title: "Low-Power Design: Gating, DVFS, and Multi-Vt",
    part: "physical-design",
    order: 18,
    minutes: 20,
    summary:
      "The techniques that keep chips inside their power budgets: clock gating, power gating, voltage/frequency scaling, and threshold-voltage portfolios.",
    relatedNodeIds: ["compute", "alt-chips"],
    body: `## Power is the budget everything else spends

Since Dennard scaling ended (Part 1), power — not area, not even raw speed — is the binding constraint: phones budget ~2–5 W, laptops ~15–45 W, a datacenter accelerator ~700 W+ with cooling to match, and *dark silicon* means you physically cannot switch everything at once. Low-power design is the discipline of spending the two power equations from signoff:

$$P = \\underbrace{\\alpha C V_{DD}^2 f}_{dynamic} + \\underbrace{V_{DD} I_{leak}(V_T, T)}_{leakage}$$

Each technique below attacks one variable. The master insight: **$V_{DD}$ appears squared in dynamic power** — voltage is the highest-leverage knob on the chip.

## Clock gating: stop the metronome

The clock network burns 30–40% of dynamic power (CTS chapter), toggling every cycle regardless of useful work. **Clock gating** shuts off the clock to registers that will not change this cycle:

- RTL pattern: \`if (en) q <= d;\` — synthesis tools *automatically* extract the enable and insert an **integrated clock-gating cell (ICG)**: a latch + AND structure (the latch prevents en-glitches from chopping the clock — never gate a clock with a bare AND).
- Gating a register bank's clock also kills the switching of all its downstream fanout logic — savings multiply.
- Hierarchical: gate a whole unit's clock subtree when the unit idles (e.g., the FPU during integer code).
- Cost: nearly none. Clock gating is the closest thing to free money in the field — typical designs gate 90%+ of flops.

Attack on: $\\alpha$ (clock's $\\alpha = 1$ → 0 where gated).

## Power gating: cut the supply

Idle blocks still **leak** even with clocks stopped. **Power gating** disconnects them from the supply entirely with big header (PMOS) or footer (NMOS) switch transistors — leakage falls essentially to zero.

The engineering bill, though, is substantial — this is *not* free money:

- **State is lost** — restore via retention flops (a small always-on shadow latch per flop), or save/restore to memory, or just re-initialize.
- **Isolation cells** must clamp the dead block's floating outputs (an X propagating into live logic is chaos).
- **Rush current** on wake must be staged (daisy-chained sleep transistor enables) to avoid collapsing the neighbors' supply.
- Wake-up takes microseconds — an **energy break-even time**: gate only if the idle period repays the save/restore energy.
- The whole scheme — power domains, isolation, retention, supply ordering — is specified in **UPF** (unified power format), which the entire flow (synthesis through signoff) must honor and *verify* (Part 4 includes power-aware verification for exactly this).

Attack on: $I_{leak}$ (to ~zero for gated blocks).

> **Analogy: the house at bedtime.** Clock gating is turning off lights in rooms nobody is in — instant, effortless, reversible; do it constantly and everywhere. Power gating is winterizing a wing of the house: drain the pipes, shut the breaker (state lost, isolation valves closed). Real savings while shut — but reopening takes real time and effort, so you only winterize the guest wing for the season, not for a lunch break. DVFS is the thermostat: on a mild day (light workload), run the furnace low (drop voltage and frequency together) — comfort delivered exactly matches demand, and the quadratic gas bill thanks you. Multi-$V_t$ is the light-bulb drawer: efficient-but-dim bulbs (high-$V_t$) in the closets, bright-but-hungry ones (low-$V_t$) only where you truly read.

## DVFS: ride the quadratic

**Dynamic voltage and frequency scaling** exploits the $V^2$ lever at runtime. Lower $f$ → less work per second needed → circuits have slack → lower $V_{DD}$ too (delay rises as roughly $\\propto V/(V-V_T)^{~1.3}$, so voltage and achievable frequency move together). Scale both and:

$$P \\propto V^2 f \\;\\Rightarrow\\; \\text{scaling } V, f \\text{ together} \\Rightarrow P \\propto f^3 \\text{ (roughly)}$$

Half the frequency at proportionally lowered voltage ≈ one-eighth the dynamic power — versus merely half from frequency alone. Every phone SoC and GPU runs a governor stepping through validated (V, f) operating points per domain: performance cores sprint at high V/f then drop; efficiency cores camp at the sweet spot. Related tricks: **AVS** (adaptive voltage scaling — on-die monitors let each *die* run at its own minimum viable voltage, clawing back the process-corner margin), race-to-idle vs pace-to-workload strategies, and near-threshold operation for extreme efficiency at painful speed cost.

Attack on: $V_{DD}^2 \\cdot f$ — the product, at its most leveraged.

## Multi-Vt: a portfolio of transistors

Fabs offer each cell in 2–4 threshold flavors (the leakage equation's exponential makes the differences dramatic):

| Flavor | Speed | Leakage | Use |
|---|---|---|---|
| Low-$V_t$ (LVT/ULVT) | Fastest | 10–50x worst | Critical paths only |
| Standard-$V_t$ (SVT) | Middle | Middle | Default |
| High-$V_t$ (HVT) | Slowest | Lowest | Everything with slack |

Same footprint, drop-in swappable — the implementation tools (synthesis, place-and-route) continuously trade cells between flavors: any path with slack gets downgraded toward HVT (free leakage savings), critical paths earn LVT. A healthy design tapes out majority-HVT with a jealously guarded LVT budget (typical target <10%). This is the leakage counterpart of drive-strength sizing, and the two run together in every optimization loop.

Attack on: $I_{leak}$, path by path.

## The stack, in practice

Real chips deploy all of these simultaneously, plus architectural moves that dwarf circuit tricks: dedicated accelerators (the specialization story — 10–100x efficiency for the target workload), memory-access minimization (data movement costs 100–1000x an ALU op — the Part 5 dataflow story), precision reduction (INT8 vs FP32 — your Phase 6 quantization work *is* a power technique), and simply doing less (algorithmic efficiency).

Reading the table top-down is reading a power-methodology maturity curve:

| Technique | Attacks | Savings scale | Cost |
|---|---|---|---|
| Clock gating | $\\alpha$ | 20–40% dynamic | ~Free |
| Multi-$V_t$ | $I_{leak}$ | 2–10x leakage | Optimization effort |
| DVFS | $V^2 f$ | Cubic w/ perf scaling | Design + validation of OPs |
| Power gating | $I_{leak}$ | ~All idle leakage | UPF complexity, wake latency |
| Specialization | everything | 10–100x | A whole new chip (see Part 5) |

That last row is the bridge: when circuit techniques are exhausted, you change the architecture — which is exactly where this book goes after verification.`,
  },
];
