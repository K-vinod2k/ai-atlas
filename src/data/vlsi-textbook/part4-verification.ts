import type { TextbookChapter } from "./types";

export const PART4_CHAPTERS: TextbookChapter[] = [
  {
    slug: "verification-fundamentals",
    title: "Verification Fundamentals: Testbenches, Coverage, Assertions",
    part: "verification",
    order: 19,
    minutes: 22,
    summary:
      "Why verification consumes most of chip development: stimulus strategies, self-checking testbenches, coverage as the exit metric, and assertions as executable specs.",
    relatedNodeIds: ["compute"],
    body: `## The 70% problem

Industry surveys have said it for two decades: **verification consumes 60–70% of chip development effort.** The asymmetry is brutal — design must build the thing once; verification must establish that it behaves correctly in *every* state it can reach, and a modest design's state space exceeds the number of atoms in the universe. Post-silicon, a functional bug is a multi-million-dollar respin (recall signoff economics: DRC/LVS/STA proved the design was *built right*; only verification addresses whether the *right thing was built*).

So verification is not "running some tests" — it is an engineering discipline with its own architecture, metrics, and exit criteria. Three pillars: **stimulus** (what you drive in), **checking** (how you know the response is right), **coverage** (how you know you have done enough).

## Stimulus: from directed to constrained-random

- **Directed tests** — hand-written scenarios targeting specific features ("write then read back address 0"). Precise, readable, and hopeless at scale: you can only find bugs you thought to look for.
- **Constrained-random verification (CRV)** — describe the *space* of legal stimulus with constraints, let the solver generate thousands of varied legal scenarios:

\`\`\`systemverilog
class axi_txn;
  rand bit [31:0] addr;
  rand bit [7:0]  len;
  rand txn_kind_e kind;
  constraint legal_c {
    addr[1:0] == 2'b00;              // aligned
    len inside {[0:15]};
    kind dist {READ := 60, WRITE := 40};
  }
endclass
\`\`\`

  Randomness explores corners no human imagines — the cross of a burst at a 4 KB boundary *while* an interrupt lands. The craft is in the constraints: too tight and you test nothing new; too loose and you drown in illegal stimulus.

The pyramid in practice: smoke-level directed tests first (does anything work?), CRV for the broad middle (most bugs die here), directed tests again for the stubborn corners coverage says randomness never reached.

## Checking: the testbench must know the answer

Eyeballing waveforms does not scale past day one. Self-checking structure:

\`\`\`mermaid
flowchart LR
  GEN["Stimulus generator<br/>(constrained-random)"] --> DRV["Driver<br/>(wiggles DUT pins)"]
  DRV --> DUT["DUT (RTL)"]
  DUT --> MON["Monitor<br/>(observes pins → transactions)"]
  GEN --> REF["Reference model<br/>(predicts correct output)"]
  REF --> SB["Scoreboard<br/>(compare)"]
  MON --> SB
  SB --> VERDICT["Pass / Fail"]
\`\`\`

The **reference model** (often behavioral SystemVerilog, C++, or Python — e.g. your Phase 5 habit of checking against \`numpy.matmul\` is exactly this) predicts expected behavior; the **scoreboard** compares predictions against what the **monitor** actually observed. Note the separation: drivers *drive*, monitors *observe passively*, the scoreboard *judges*. That separation is what UVM (next chapter) formalizes.

## Assertions: the spec, executable, everywhere

**SystemVerilog Assertions (SVA)** embed properties directly in/alongside the RTL, checked continuously during every simulation:

\`\`\`systemverilog
// Immediate: a fact at a point in time
assert (state != ILLEGAL) else $error("FSM in illegal state");

// Concurrent: temporal behavior across cycles
property req_gets_grant;
  @(posedge clk) disable iff (!rst_n)
    req |-> ##[1:3] gnt;      // req implies grant within 1-3 cycles
endproperty
assert property (req_gets_grant);
\`\`\`

Why assertions punch far above their weight:

- **Bugs are caught at the point of cause**, not 40,000 cycles later when corruption reaches an output the scoreboard checks. Debug time collapses.
- They encode the *microarchitectural contract* (FIFO never overflows, one-hot stays one-hot, handshake never drops a beat) — things end-to-end checks see only indirectly.
- The same properties feed **formal verification** (chapter after next) unchanged — write once, verify twice.
- Interface assertions (on AXI, on your FIFO) act as protocol referees between blocks forever after.

> **Analogy: the crash-test lab.** A chip heading to tapeout is a car heading to production. Directed tests are the standard crash scenarios the engineers script deliberately — frontal impact at 40 mph. Constrained-random is the test track that generates endless *legal but wild* driving — potholes during hard braking in the rain — finding failure modes nobody scripted. The reference model + scoreboard is the instrumented crash dummy: it knows what forces *should* be survivable and objectively records what actually happened. Assertions are sensors bolted throughout the chassis that scream the instant any internal limit is exceeded — you learn the frame cracked at impact, not by discovering the doors won't open three tests later. And coverage is the lab's test matrix on the wall: which scenarios have actually been run — because "we drove it around a lot and nothing broke" convinces no regulator.

## Coverage: the only honest exit metric

"When are we done?" is *the* verification question, and the answer is measured, not felt:

- **Code coverage** — did simulation exercise the RTL text? Line, branch, condition, toggle, FSM-state/arc coverage. Collected automatically. **Necessary but weak**: 100% code coverage proves every line ran, not that any *interesting scenario* occurred, and never flags missing logic.
- **Functional coverage** — did we exercise the *specification*? You define what matters, the simulator counts it:

\`\`\`systemverilog
covergroup txn_cg @(posedge clk iff valid);
  cp_kind: coverpoint kind;
  cp_len:  coverpoint len { bins short = {[0:3]};
                            bins long  = {[12:15]}; }
  cross cp_kind, cp_len;     // every kind x every length class
endgroup
\`\`\`

  Crosses are where the value is — bugs live at feature *intersections*.
- **Assertion coverage** — did each property actually trigger (antecedent seen), or is it vacuously passing?

**Coverage closure** drives the endgame loop: run regressions → merge coverage → inspect holes → write directed tests (or steer constraints) at the holes → repeat until the plan is met. The **verification plan** ties it together: every spec feature mapped to its coverage points, checks, and tests — the document that turns "we feel good" into "we are done."

One more lever: **bug curves**. Teams track bugs-found-per-week; tapeout confidence comes from a curve that rose, peaked, and decayed toward zero *while coverage kept climbing*. Bugs found late and coverage still moving = you are not done, whatever the schedule says. This machinery — reusable, scalable, tool-enforced — is exactly what UVM industrializes next.`,
  },
  {
    slug: "uvm-basics",
    title: "UVM: The Universal Verification Methodology",
    part: "verification",
    order: 20,
    minutes: 22,
    summary:
      "The industry-standard testbench architecture: agents, sequences, scoreboards, the factory, and why all that machinery earns its complexity.",
    relatedNodeIds: ["compute"],
    body: `## Why a methodology at all

The fundamentals chapter's testbench works — for one block, one team, one project. Scale to an SoC with forty interfaces, verification IP purchased from three vendors, and a hundred engineers, and ad-hoc testbenches collapse: nothing is reusable, nothing is interchangeable, every block reinvents drivers and scoreboards. **UVM (Universal Verification Methodology)** is the industry's answer — an open SystemVerilog class library (IEEE 1800.2) plus architectural conventions, descended from OVM/eRM. Its promise: any UVM-literate engineer can open any UVM testbench and know where everything lives; any interface's verification components can be bought, sold, and reused.

The intellectual core is one separation: **transactions, not signals.** Tests reason about "send a burst write of length 8"; only the lowest layer knows which wires wiggle. Everything else follows.

## The architecture

\`\`\`mermaid
flowchart TB
  TEST["uvm_test<br/>(selects config + sequences)"] --> ENV["uvm_env<br/>(the testbench container)"]
  ENV --> AGT["uvm_agent (per interface)"]
  ENV --> SB["Scoreboard<br/>(checking)"]
  ENV --> COV["Coverage collector"]
  SEQ["Sequences<br/>(streams of transactions)"] --> SQR
  subgraph AGT ["uvm_agent"]
    SQR["Sequencer"] --> DRV["Driver<br/>(txn → pin wiggles)"]
    MON["Monitor<br/>(pins → txn, passive)"]
  end
  DRV --> DUT["DUT (RTL)"]
  DUT --> MON
  MON -->|"analysis port"| SB
  MON -->|"analysis port"| COV
\`\`\`

Component tour, bottom-up:

- **Transaction (\`uvm_sequence_item\`)** — a class modeling one operation (the \`axi_txn\` from last chapter), with random fields and constraints.
- **Driver** — pulls transactions from its sequencer, translates each into cycle-accurate pin activity on a **virtual interface**. The *only* place stimulus touches wires.
- **Monitor** — watches the same pins passively, reconstructs transactions, and **broadcasts** them on analysis ports. It must not trust the driver — independent observation is what makes checking honest.
- **Sequencer** — the pump between sequences and driver, arbitrating when several sequences want the same interface.
- **Agent** — the reusable bundle of driver + sequencer + monitor for one protocol. Set it **active** (drives) or **passive** (only observes — e.g., reused at SoC level where the real CPU now drives the bus). Buy a commercial AXI agent and this box is what arrives.
- **Environment** — instantiates the agents, scoreboard(s), coverage collectors; the per-DUT container.
- **Test** — the top-level configuration: which sequences run, which constraints tighten, which knobs turn. Many small test classes reuse one environment.

**Sequences** deserve their own headline: stimulus is written as \`uvm_sequence\` classes that generate/randomize transaction streams, and they **layer** — a "boot then stress" virtual sequence coordinates sub-sequences across several agents' sequencers at once (the DMA agent hammering memory *while* the config agent reprograms registers). Stimulus becomes a library of composable behaviors rather than a pile of tests.

## The machinery that makes it reusable

Two UVM mechanisms confuse everyone at first and turn out to be the whole point:

- **The factory.** Components and transactions are created via \`type_id::create()\` rather than \`new()\` — so a test can say "everywhere the env creates \`axi_txn\`, substitute my \`axi_txn_with_errors\`" *without touching the env's code*. Behavior injection by type override: this is how one environment serves a hundred tests.
- **The config DB** (\`uvm_config_db\`) — a hierarchical key-value store through which tests pass down virtual interfaces, agent modes (active/passive), and knobs. Ugly strings, powerful decoupling.

Plus the **phase system** — all components march through \`build_phase\` (top-down construction), \`connect_phase\` (port wiring), \`run_phase\` (time passes here), \`report_phase\` — and **objections**: the test ends when no component still objects to ending, replacing hard-coded \`#100000; $finish\` with actual completion semantics.

> **Analogy: the shipping industry, standardized.** Pre-UVM testbenches were the age of loose cargo — every port (project) hand-loaded goods (stimulus) its own way, and nothing transferred. UVM is containerization. The transaction is the shipping container: standardized boxes moving through cranes and ships that never look inside. Agents are the port terminals, one per shipping lane (interface), each with a loading crane (driver) and a customs inspector who logs every container passing regardless of who loaded it (monitor). Sequences are freight manifests — plans composable into larger logistics operations spanning many ports at once. And the factory is the fleet charter system: the operations office can say "all routes marked 'refrigerated' use the new container model this quarter" without rebuilding a single terminal. Any port worker can work any UVM port on Earth — that, not elegance, is what the standard is for.

## A test, end to end

1. \`run_test("stress_test")\` (from the command line) — the factory builds the test class.
2. Test's \`build_phase\` configures the env via config DB; env builds agents; factory overrides land.
3. \`connect_phase\` wires monitors' analysis ports to scoreboard and coverage.
4. \`run_phase\`: the test starts a virtual sequence; sequences generate randomized transactions; drivers wiggle pins; monitors reconstruct what actually happened; the scoreboard compares against the reference model, coverage accumulates; assertions (previous chapter) referee continuously.
5. Objections drain, \`report_phase\` prints the verdict; the regression system merges this run's coverage into the closure dashboard.

## Perspective

UVM is heavy — thousands of library classes, real learning curve, and genuinely poor fit for tiny projects (a solo FPGA design is better served by a plain SV testbench or cocotb/pyuvm in Python; your Phase 3 self-checking benches are the right tool at that scale). It also only structures *simulation*; it says nothing about proving absence of bugs. That is formal verification's job — next chapter. But for industrial-scale ASIC verification, UVM is simply the lingua franca: learn to read the architecture diagram above and every verification codebase you meet for the rest of your career will be navigable.`,
  },
  {
    slug: "formal-verification",
    title: "Formal Verification: Proofs Instead of Tests",
    part: "verification",
    order: 21,
    minutes: 20,
    summary:
      "Mathematical certainty in a probabilistic discipline: equivalence checking, model checking / property verification, and where proofs beat simulation.",
    relatedNodeIds: ["compute"],
    body: `## The other way to be sure

Simulation — however industrialized by UVM — samples the state space. Every passing regression says "no bug in the states we visited"; it can *never* say "no bug." **Formal verification** makes the stronger claim: using mathematical analysis of the design as a transition system, it proves a property holds in **every reachable state under every legal input sequence** — or produces a concrete counterexample trace showing exactly how it fails. No stimulus, no luck, no coverage holes. The catch, of course, is capacity: exhaustive proof fights state-space explosion, so formal is a scalpel, not a hammer.

Two industrial workhorses:

## Equivalence checking: the flow's safety net

**Logic equivalence checking (LEC)** answers: are two versions of the design functionally identical? Its daily job is guarding the implementation flow from Part 3 — after synthesis, after place-and-route restructuring, after every ECO and clock-gating insertion and scan stitching: *is the netlist still the RTL?*

Method: match **key points** (flip-flops, ports) between the two versions, then prove each corresponding combinational cone computes the same function — SAT solvers and BDDs under the hood, structural similarity making the problem tractable. Any mismatch comes with a counterexample input vector pointing at the offending logic cone.

- **Combinational EC** is mature, mandatory, and routine: every tapeout runs it. It is why synthesis is *trusted* — not because the tools are bug-free, but because an independent proof brackets every transformation.
- **Sequential EC** (designs whose state encodings differ — retimed pipelines, resource-shared datapaths, C-vs-RTL for HLS like your Phase 5 work) is far harder and an active tool frontier.

The quiet lesson: LEC is what makes aggressive automated optimization *safe to allow*. Proof enables audacity.

## Model checking: property verification

**Property checking** (formal property verification, FPV) takes the SVA assertions from the fundamentals chapter and, instead of monitoring them during simulation, **proves** them: the design is a finite state machine; the tool explores/abstracts its reachable state space and shows the property can never be violated.

For each assertion, one of three verdicts:

| Verdict | Meaning | Your move |
|---|---|---|
| **Proven** | Holds in all reachable states, period | Done — forever |
| **Falsified (CEX)** | A minimal concrete trace reaches violation | Debug the trace — it is a real bug (or a missing constraint) |
| **Inconclusive (bounded)** | Holds for all traces up to depth N; solver gave out | Engineering judgment: deepen, abstract, or accept bounded proof |

Under the hood, three engine families cooperate: **BDDs** (canonical function graphs — exact but memory-hungry), **bounded model checking** (unroll the design K cycles, hand SAT the question "can a violation occur within K?" — the great counterexample *finder*), and **induction / IC3-PDR** (the modern provers that get unbounded proofs without unrolling forever). Tools juggle all of them per property.

The user-side craft is **constraints and abstraction**: \`assume\` properties pin down legal inputs (an unconstrained formal tool immediately "finds" bugs by driving illegal stimulus — garbage counterexamples mean missing assumptions, not tool failure); over-constrain instead and real bugs hide behind your assumptions. Add abstractions (free up a counter, black-box a memory) to buy capacity at the price of possible spurious counterexamples. This is the same tighten-loosen dance as CRV constraints, played for keeps.

> **Analogy: testing the bridge vs proving the bridge.** Simulation is driving trucks over the bridge — thousands of trucks, clever weights, instrumented axles (UVM at full song). Every crossing that doesn't collapse is evidence, and after a hundred thousand crossings you are *confident*. Formal is the structural engineer's static analysis: from the geometry and material properties, a proof that **no loading pattern within spec** can exceed any member's capacity — including freak combinations no test schedule would ever try. When the analysis instead finds a failing load pattern, it hands you the exact truck arrangement (the counterexample trace). But the analysis only tractably covers the bridge, not the whole highway network — so you prove the bridge (the arbiter, the FIFO, the lock-step checker) and keep driving trucks over everything else.

## Where formal wins — and where it doesn't

Formal's sweet spots are **control-dominated, deep-corner, catastrophic-if-wrong** logic:

- Arbiters, credit/flow control, FIFOs (your async-FIFO Gray-pointer scheme is a classic formal target), cache-coherence and bus-protocol corners
- Clock-domain crossing correctness, X-propagation, unreachable-FSM-state proofs
- Security properties (no path from unprivileged register to secret), safety-critical logic (ISO 26262 loves proofs)
- "Automatic formal" apps: connectivity checking, register-map verification, deadlock/livelock hunting — push-button value with zero property-writing

It struggles where state is wide and arithmetic is deep: a whole out-of-order core, a floating-point multiplier's full datapath (dedicated arithmetic-equivalence tools exist), anything whose "spec" is a thousand pages of software behavior. Hence the real methodology is a **portfolio**: formal owns the blocks where proofs are feasible and stakes are total; UVM simulation owns system-level breadth; emulation/FPGA prototyping owns software-scale workloads. Verification, like the rest of this book keeps showing, is engineering under scarcity — spend each method where its leverage is highest.

With correctness machinery in hand, the book turns to its destination: the chips being built *for* AI, and the AI now being aimed back at building chips — Part 5.`,
  },
];
