import type { TextbookChapter } from "./types";

export const PART1_CHAPTERS: TextbookChapter[] = [
  {
    slug: "semiconductors-doping-pn-junction",
    title: "Semiconductors, Doping, and the PN Junction",
    part: "devices",
    order: 1,
    minutes: 18,
    summary:
      "Why silicon conducts on command: band gaps, donor and acceptor doping, and the diode behavior that emerges when P meets N.",
    relatedNodeIds: ["bit"],
    body: `## Why silicon?

Every chip you will ever design is built on a material that is deliberately mediocre at conducting electricity. Metals conduct too well to be controlled; insulators refuse to conduct at all. Silicon sits in between: a **semiconductor** whose conductivity can be tuned over many orders of magnitude by adding trace impurities and applying voltages. That tunability is the entire foundation of electronics.

The physics reason lives in energy bands. Electrons in a crystal cannot take arbitrary energies; they occupy bands separated by gaps. Three cases matter:

- **Conductor** — the valence band and conduction band overlap. Electrons move freely; you cannot turn conduction off.
- **Insulator** — the band gap is huge (about 9 eV for SiO2). No electron can jump it at ordinary temperatures.
- **Semiconductor** — the gap is small (1.12 eV for silicon). At room temperature a few electrons make the jump, and we can engineer many more.

> **Analogy: the parking garage.** Picture a two-story parking garage. The ground floor (valence band) is completely full of cars — nobody can move because there is no empty space. The upper floor (conduction band) is empty. In an insulator, the ramp between floors is a ten-story climb: no car ever gets up there, so no car ever moves. In a metal, the two floors are merged into one half-full deck, so traffic flows constantly. Silicon has a short ramp: a few energetic cars make it upstairs (and can then drive around freely), and each car that leaves the ground floor opens a gap that lets ground-floor cars shuffle too. Both the car upstairs (a free **electron**) and the moving gap downstairs (a **hole**) carry current.

A pure silicon crystal at room temperature has only about $10^{10}$ free carriers per cm³ — versus $5 \\times 10^{22}$ atoms per cm³. That is one free electron per five trillion atoms: essentially an insulator. To make it useful we dope it.

## Doping: engineering carriers

Silicon has 4 valence electrons and forms 4 covalent bonds with its neighbors. Doping swaps a tiny fraction of silicon atoms for elements with 5 or 3 valence electrons:

| Dopant type | Element examples | Valence e⁻ | Effect | Resulting material |
|---|---|---|---|---|
| Donor | Phosphorus, Arsenic | 5 | Donates one free electron | **N-type** (majority: electrons) |
| Acceptor | Boron | 3 | Leaves one bond unfilled (a hole) | **P-type** (majority: holes) |

Typical doping levels are $10^{15}$ to $10^{18}$ atoms/cm³ — one dopant per ten million silicon atoms is already a strong effect. Crucially, both materials remain electrically **neutral**; doping changes which carrier is abundant, not the net charge.

Two transport mechanisms move these carriers:

- **Drift** — carriers pushed by an electric field. Drift current density: $J_{drift} = q n \\mu E$, where $\\mu$ is mobility (electrons in silicon are roughly 2-3x more mobile than holes — remember this; it is why NMOS beats PMOS and why CMOS gates size PMOS wider).
- **Diffusion** — carriers spreading from high concentration to low, like ink in water: $J_{diff} = q D \\frac{dn}{dx}$.

## The PN junction

Now the magic step: put P-type and N-type silicon in contact.

\`\`\`mermaid
flowchart LR
  subgraph P ["P-type region"]
    H["Holes (majority)"]
  end
  subgraph D ["Depletion region"]
    NI["Fixed ions only<br/>no mobile carriers<br/>built-in field E"]
  end
  subgraph N ["N-type region"]
    E2["Electrons (majority)"]
  end
  H -->|"holes diffuse right"| NI
  E2 -->|"electrons diffuse left"| NI
\`\`\`

The instant the two regions touch:

1. Electrons near the junction **diffuse** into the P side; holes diffuse into the N side (huge concentration gradients).
2. Each carrier that crosses leaves behind a **fixed, charged dopant ion** — positive donors on the N side, negative acceptors on the P side. A region empty of mobile carriers forms: the **depletion region**.
3. Those fixed charges create an electric field pointing from N to P, which **opposes** further diffusion.
4. Equilibrium: diffusion outflow exactly balances field-driven drift back. A **built-in potential** stands across the junction:

$$V_{bi} = \\frac{kT}{q} \\ln\\!\\left(\\frac{N_A N_D}{n_i^2}\\right) \\approx 0.6\\text{–}0.8\\ \\text{V for silicon}$$

where $N_A$, $N_D$ are acceptor/donor concentrations and $n_i$ is the intrinsic carrier concentration ($\\approx 10^{10}\\,\\text{cm}^{-3}$ at 300 K).

In band-diagram terms: the P side's bands sit higher in energy than the N side's, and they bend smoothly through the depletion region. The bending height is $qV_{bi}$ — an energy hill that majority carriers must climb to cross.

> **Analogy: the hillside border.** Think of the junction as a border between a crowded valley (majority carriers) and an empty plateau, connected by a hill whose height is the built-in potential. At equilibrium, only the most energetic few climb over, exactly balanced by the trickle sliding down the other way. **Forward bias lowers the hill** — traffic floods across, growing exponentially with every 26 mV (at room temperature) of lowering. **Reverse bias raises the hill** — traffic essentially stops. The junction is a one-way valve for current.

## The diode equation

The result is the most fundamental nonlinear device in electronics:

$$I = I_S \\left( e^{V/nV_T} - 1 \\right), \\qquad V_T = \\frac{kT}{q} \\approx 26\\ \\text{mV at } 300\\,\\text{K}$$

- Forward bias ($V > 0$): current grows exponentially — roughly 10x per 60 mV.
- Reverse bias ($V < 0$): current saturates at the tiny leakage $-I_S$.
- $n$ is the ideality factor, between 1 and 2.

Reverse bias also **widens** the depletion region, which matters enormously for MOSFETs: the depletion width follows

$$W_{dep} \\propto \\sqrt{V_{bi} + V_R}$$

## Why this chapter matters for VLSI

You will rarely design with discrete diodes, but PN junctions are everywhere inside a chip:

- Every MOSFET source and drain forms a PN junction with the body — these must stay **reverse biased** (that is what well/substrate ties are for).
- Junction capacitance is a major component of gate load and wire load in timing analysis.
- ESD protection structures, latch-up hazards, and leakage paths are all junction phenomena.

Hold on to three numbers: silicon band gap **1.12 eV**, thermal voltage **26 mV**, built-in potential **~0.7 V**. They reappear in every device equation from here on.`,
  },
  {
    slug: "mosfet-structure-operation",
    title: "The MOSFET: Structure and Operation",
    part: "devices",
    order: 2,
    minutes: 22,
    summary:
      "The four-terminal switch behind everything: NMOS and PMOS structure, threshold voltage, and the cutoff / triode / saturation I-V equations.",
    relatedNodeIds: ["compute", "bit"],
    body: `## The device that ate the world

The Metal-Oxide-Semiconductor Field-Effect Transistor is the most manufactured object in human history — a modern chip carries tens of billions. Conceptually it is just a **voltage-controlled switch**: a voltage on one terminal (the gate) decides whether current can flow between two others (source and drain).

## Structure

An NMOS transistor is built on P-type substrate: two heavily doped N+ regions (source and drain) separated by a P-type channel region, with a thin insulating oxide and a conductive gate stacked on top.

\`\`\`mermaid
flowchart TB
  G["Gate (polysilicon / metal)"]
  OX["Gate oxide — SiO2 or high-k, 1–2 nm"]
  subgraph SUB ["P-type substrate (body)"]
    S["N+ source"]
    CH["Channel region (P-type)"]
    D["N+ drain"]
  end
  G --- OX
  OX --- CH
  S -.- CH
  CH -.- D
\`\`\`

Four terminals: **gate (G)**, **source (S)**, **drain (D)**, **body (B)**. The gate is insulated from the channel by the oxide — no DC current flows into it. The two designer-controlled dimensions are the channel **width $W$** and **length $L$**; the "5 nm" in a process name loosely tracks the minimum $L$.

A PMOS transistor is the mirror image: P+ source/drain in an N-well, turned on by a **low** gate voltage. CMOS ("complementary MOS") uses both types on one die.

> **Analogy: the drawbridge.** The source and drain are two banks of a river, and electrons are traffic that wants to cross. The channel is a drawbridge that is normally raised (no path). The gate voltage is the bridge operator: raise the gate voltage on an NMOS and the electric field pulls electrons up under the oxide, lowering a bridge of mobile charge between the banks. The bridge operator never touches the traffic — only the field acts, through the insulating oxide. That is why the input of a MOS gate draws (almost) no steady current, and why one gate output can drive many gate inputs.

## Threshold voltage: forming the channel

With $V_{GS} = 0$, source-channel-drain is N-P-N: two back-to-back junctions, one always reverse biased. No current.

Raise the gate voltage and three regimes follow:

1. **Accumulation** ($V_{GS} < 0$ for NMOS): holes pile up under the gate. Off.
2. **Depletion** ($0 < V_{GS} < V_T$): holes are pushed away, leaving fixed negative ions. Still no mobile carriers. Off.
3. **Inversion** ($V_{GS} \\ge V_T$): the field is strong enough to attract minority electrons to the surface, forming a thin N-type layer — the surface "inverts" from P to N. A conducting channel now connects source and drain.

The gate voltage at which strong inversion begins is the **threshold voltage** $V_T$ (typically 0.2–0.5 V in modern processes). It is set by oxide thickness, channel doping, and gate material — and fabs offer multiple flavors (multi-$V_t$ libraries: low-$V_t$ fast but leaky, high-$V_t$ slow but low-leakage; you will meet these again in low-power design).

## The three regions of operation

With a channel formed, drain current $I_D$ depends on both $V_{GS}$ and $V_{DS}$. Define the **overdrive voltage** $V_{ov} = V_{GS} - V_T$.

**1. Cutoff** ($V_{GS} < V_T$): ideally $I_D = 0$. (Reality: subthreshold leakage, an exponential tail — the price of Moore's law, covered in the scaling chapter.)

**2. Triode / linear** ($V_{DS} < V_{ov}$): the channel exists along the whole length and behaves like a voltage-controlled resistor:

$$I_D = \\mu_n C_{ox} \\frac{W}{L} \\left[ (V_{GS} - V_T)V_{DS} - \\frac{V_{DS}^2}{2} \\right]$$

For small $V_{DS}$ this is nearly linear — a resistor whose value the gate controls. Digital designers care because a turned-on transistor pulling an output to a rail operates here, with effective resistance

$$R_{on} \\approx \\frac{1}{\\mu_n C_{ox} \\frac{W}{L} (V_{GS}-V_T)}$$

**3. Saturation** ($V_{DS} \\ge V_{ov}$): near the drain, the local gate-to-channel voltage drops below $V_T$ and the channel **pinches off**. Current no longer rises with $V_{DS}$ (to first order):

$$I_D = \\frac{1}{2} \\mu_n C_{ox} \\frac{W}{L} (V_{GS} - V_T)^2 \\,(1 + \\lambda V_{DS})$$

The $(1+\\lambda V_{DS})$ term is **channel-length modulation** — the mild slope real devices show in saturation.

| Region | Condition | $I_D$ behavior | Digital role |
|---|---|---|---|
| Cutoff | $V_{GS} < V_T$ | ~0 (leakage) | Switch OFF |
| Triode | $V_{DS} < V_{ov}$ | Resistor-like | Switch ON, output near rail |
| Saturation | $V_{DS} \\ge V_{ov}$ | Current source-like | Mid-transition, drives switching |

> **Analogy: the garden hose.** $V_{GS}$ is how far the tap is open; $V_{DS}$ is how hard gravity pulls water through the hose. Barely open the tap (below threshold): nothing flows. Open it and tilt the hose slightly (triode): flow rises with tilt — resistor behavior. But past a point, tilting more does nothing: the tap opening itself limits the flow (saturation). The pinched region near the drain is literally the tap's constriction — flow through it is fixed by upstream conditions, not by how hard you pull downstream.

## Key parameters designers actually use

- $\\mu_n C_{ox} \\frac{W}{L}$ — the device's strength. Everything scales with $W/L$; sizing transistors is setting this ratio.
- **Electron vs hole mobility**: $\\mu_n \\approx 2\\text{–}3\\,\\mu_p$. A PMOS must be ~2x wider than an NMOS for equal drive strength — this asymmetry shapes every CMOS gate layout.
- **Gate capacitance** $C_G = C_{ox} W L$ — the load a driving gate must charge. Delay in digital circuits is fundamentally "current available / capacitance to charge."
- **Body effect**: raising source-to-body voltage increases $V_T$ ($V_T = V_{T0} + \\gamma(\\sqrt{2\\phi_F + V_{SB}} - \\sqrt{2\\phi_F})$) — matters in stacked transistors (NAND pull-down stacks) and is exploited deliberately in body biasing.

## PMOS: the mirror

Every statement above flips sign for PMOS: the channel is holes, $V_T$ is negative, the device turns on when the gate is pulled **low**, and it lives in an N-well tied to $V_{DD}$. The deep complementarity — NMOS passes a strong 0, PMOS passes a strong 1 — is exactly what the next chapter exploits to build the perfect logic gate.`,
  },
  {
    slug: "cmos-inverter",
    title: "The CMOS Inverter: VTC, Noise Margins, and Switching",
    part: "devices",
    order: 3,
    minutes: 20,
    summary:
      "The atom of digital logic: how one NMOS and one PMOS make a near-ideal inverter, with the math for the VTC, switching threshold, and noise margins.",
    relatedNodeIds: ["bit", "compute"],
    body: `## One circuit to rule them all

The CMOS inverter is two transistors: a PMOS on top connecting the output to $V_{DD}$, an NMOS below connecting it to ground, both gates tied to the input.

\`\`\`mermaid
flowchart TB
  VDD["VDD"] --- P["PMOS<br/>(on when IN = 0)"]
  P --- OUT(("OUT"))
  OUT --- N["NMOS<br/>(on when IN = 1)"]
  N --- GND["GND"]
  IN(("IN")) -.->|gate| P
  IN -.->|gate| N
\`\`\`

- Input **low**: PMOS on, NMOS off → output pulled to $V_{DD}$ (logic 1).
- Input **high**: NMOS on, PMOS off → output pulled to ground (logic 0).

Two properties make this circuit the foundation of essentially all digital logic:

1. **Rail-to-rail output.** The output is connected to a supply rail through an ON transistor and disconnected from the other. Output levels are a full $V_{DD}$ and a true 0 — no degraded levels.
2. **Zero static power (ideally).** In either stable state, one transistor is off, so no current path exists from $V_{DD}$ to ground. Power is consumed only while switching. This single property is why CMOS displaced every earlier logic family (NMOS-only logic burned static power in every gate holding a 0).

> **Analogy: the seesaw with two hands.** Imagine holding a seesaw with two hands — one hand can only push the left seat down (NMOS pulling output to ground), the other can only push the right seat down (PMOS pulling output up to $V_{DD}$). The input signal guarantees exactly one hand pushes at a time. The seesaw always ends up firmly at one extreme, never balanced ambiguously in the middle, and once it is there, holding it costs no effort. The only work happens during the flip — which is precisely CMOS's dynamic-power-only profile.

## The voltage transfer characteristic (VTC)

Sweep the input slowly from 0 to $V_{DD}$ and plot the output: you get the famous S-curve. Five operating segments, defined by which region each transistor is in:

| Segment | $V_{in}$ | NMOS | PMOS | $V_{out}$ |
|---|---|---|---|---|
| A | $< V_{Tn}$ | cutoff | triode | $V_{DD}$ |
| B | rising | saturation | triode | falling slowly |
| C | $\\approx V_M$ | saturation | saturation | falling steeply (high gain) |
| D | rising more | triode | saturation | approaching 0 |
| E | $> V_{DD}-|V_{Tp}|$ | triode | cutoff | 0 |

Segment C is the interesting one: both transistors saturated, tiny input changes produce huge output swings. The inverter is briefly a high-gain **analog amplifier** — and that gain is exactly what squares up sloppy input edges into clean output edges. Digital logic's noise immunity is analog gain in disguise.

## Switching threshold

The **switching threshold** $V_M$ is where $V_{in} = V_{out}$ (the VTC crosses the 45° line). Setting NMOS and PMOS saturation currents equal and solving:

$$V_M = \\frac{V_{Tn} + \\sqrt{r}\\,(V_{DD} - |V_{Tp}|)}{1 + \\sqrt{r}}, \\qquad r = \\frac{\\mu_p C_{ox} (W/L)_p}{\\mu_n C_{ox} (W/L)_n}$$

For a symmetric $V_M = V_{DD}/2$ you need $r = 1$: the PMOS must be sized roughly $2\\text{–}3\\times$ wider than the NMOS to compensate for lower hole mobility. This is the sizing rule you will apply in every standard cell.

Skewing $V_M$ is a real design tool: a "high-skew" inverter (stronger PMOS) switches earlier on rising inputs — used deliberately in clock networks and pulse circuits.

## Noise margins

Digital abstraction survives because gates **reject noise**. Define the points on the VTC where the slope equals $-1$:

- $V_{IL}$ — highest input reliably read as 0
- $V_{IH}$ — lowest input reliably read as 1
- $V_{OL}, V_{OH}$ — worst-case output low/high levels (≈ 0 and $V_{DD}$ for CMOS)

The margins:

$$NM_L = V_{IL} - V_{OL}, \\qquad NM_H = V_{OH} - V_{IH}$$

A well-designed CMOS inverter achieves $NM_L \\approx NM_H \\approx 0.4\\,V_{DD}$ — nearly the theoretical ideal. Any noise blip smaller than the margin gets absorbed; the regenerative gain of segment C actively restores the signal at every gate. This is why a signal can pass through millions of gates and emerge perfect.

> **Analogy: the ball in twin valleys.** A logic value is a ball resting in one of two valleys separated by a hill (the high-gain region at $V_M$). Noise can jostle the ball partway up the hill, but as long as it does not crest, the ball rolls back to the valley floor — the gate output snaps back to a clean rail. The noise margin is the height of the valley wall. Every gate in a chain re-drops the ball to the bottom, so errors do not accumulate. Compare analog signals, where every stage's noise adds up forever.

## Switching speed and power (preview)

Dynamics come from charging the load capacitance $C_L$ (next gates' input capacitance + wiring):

$$t_{pHL} \\approx 0.69\\, R_{on,n} C_L, \\qquad t_{pLH} \\approx 0.69\\, R_{on,p} C_L$$

and each full switching cycle moves charge $Q = C_L V_{DD}$ through the supply, giving the dynamic energy per transition and the canonical power equation

$$E = C_L V_{DD}^2 \\ \\text{per cycle}, \\qquad P_{dyn} = \\alpha\\, C_L V_{DD}^2 f$$

where $\\alpha$ is the activity factor. That $V_{DD}^2$ dependence is the single most important fact in low-power design — halving the supply quarters dynamic power — and it drives everything from DVFS to near-threshold computing. We will use it repeatedly in Part 3.

Also note the **short-circuit current**: during a slow input transition, both devices conduct briefly (segments B–D). Fast edges keep this small — one more reason edge rates are controlled in real design flows.

## From inverter to any gate

Generalize the pull-up/pull-down idea and you get all of static CMOS logic: a **pull-down network** of NMOS (series = AND-ish, parallel = OR-ish) mirrored by a **complementary pull-up network** of PMOS. That is the subject of the Boolean algebra and logic gates chapter in Part 2 — the inverter's guarantees (rail-to-rail, no static power, noise rejection) carry over to every gate built this way.`,
  },
  {
    slug: "fabrication-process",
    title: "How Chips Are Made: The Fabrication Process",
    part: "devices",
    order: 4,
    minutes: 20,
    summary:
      "From sand to silicon city: wafers, photolithography, etching, deposition, implantation, and the layer-by-layer construction of a modern IC.",
    relatedNodeIds: ["compute"],
    body: `## The most precise manufacturing on Earth

A modern fab turns a slice of purified sand into structures 20 silicon atoms wide, repeated trillions of times, with a defect rate that would make any other industry weep. Understanding the process — even at a high level — changes how you design: every DRC rule, every layout constraint, every "why can't I just..." traces back to a fabrication reality.

## Starting material: the wafer

1. Quartz sand is refined to **99.9999999% pure** polysilicon ("nine nines").
2. The **Czochralski process** melts it at 1414 °C and slowly pulls a rotating seed crystal upward, growing a single-crystal ingot up to 300 mm in diameter.
3. Diamond saws slice the ingot into ~0.7 mm wafers, polished to atomic flatness.

One 300 mm wafer yields hundreds of chips; all are processed simultaneously — the economics of the whole industry rest on this parallelism.

## The core loop: pattern, modify, repeat

Chip fabrication is one idea repeated 50–100 times: **cover the wafer with something, then selectively remove or modify it where a pattern says so.** Each pass is a "mask layer."

\`\`\`mermaid
flowchart LR
  A["Deposit / grow<br/>a film"] --> B["Coat with<br/>photoresist"]
  B --> C["Expose through mask<br/>(photolithography)"]
  C --> D["Develop resist<br/>(pattern appears)"]
  D --> E["Etch / implant<br/>through openings"]
  E --> F["Strip resist"]
  F --> A
\`\`\`

### Photolithography: the pattern projector

The heart of the loop. The wafer is coated with light-sensitive **photoresist**, then a **mask** (the layout you drew, at 4x scale) is projected onto it with ultraviolet light. Exposed resist changes solubility; developing washes away the soluble part, leaving a stencil.

The resolution limit is set by optics:

$$\\text{minimum feature} = k_1 \\frac{\\lambda}{NA}$$

where $\\lambda$ is the light wavelength, $NA$ the lens numerical aperture, and $k_1$ a process factor (~0.25 at best). The industry's wavelength march: 436 nm → 365 nm → 248 nm → **193 nm** (used for two decades with immersion and multi-patterning tricks) → **13.5 nm EUV** today. An EUV scanner costs about $200M, uses mirrors instead of lenses (nothing transmits 13.5 nm light), and generates its light by vaporizing tin droplets with a laser 50,000 times per second.

> **Analogy: spray-painting through stencils, 80 layers deep.** Building a chip is like painting an impossibly detailed mural by only ever spray-painting through stencils. You cannot touch the wall directly — every feature on every layer comes from: tape up a stencil (resist + mask), spray (etch/implant/deposit), peel. Now imagine the mural is a 3D city where each stencil layer must align to the ones below within a few nanometers — that alignment ("overlay") is itself one of the hardest problems in the fab.

### Etching: sculpting

With the resist stencil in place, **etching** removes exposed material:

- **Wet etch** — chemical bath. Cheap, but isotropic (undercuts the mask).
- **Dry / plasma etch (RIE)** — ions bombard vertically, giving the anisotropic, straight-walled trenches modern geometries demand.

### Deposition: adding layers

- **Thermal oxidation** — grow SiO2 by baking the wafer in oxygen; how classic gate oxides were made.
- **CVD** (chemical vapor deposition) — gases react at the surface to deposit films (poly, nitride, oxides).
- **ALD** (atomic layer deposition) — one atomic layer per gas pulse; how 1–2 nm high-k gate dielectrics are deposited with atomic precision.
- **PVD / sputtering & electroplating** — metals for interconnect.

### Ion implantation: doping on demand

Dopant ions are accelerated to high energy and shot into exposed silicon; dose and energy control concentration and depth. A subsequent **anneal** heals lattice damage and activates dopants. This is how sources, drains, wells, and threshold adjustments are all made.

### CMP: flattening

**Chemical-mechanical polishing** grinds each finished layer flat — indispensable, because lithography's depth of focus is tiny; you cannot project sharp patterns onto a bumpy surface. CMP is also why layouts have **density rules** (dummy metal fill): polish rates depend on pattern density.

## Building a transistor, start to finish

The FEOL ("front end of line") sequence for a planar CMOS transistor, simplified:

1. **Isolation** — etch shallow trenches around each transistor site, fill with oxide (STI).
2. **Wells** — implant N-wells (for PMOS) and P-wells (for NMOS).
3. **Gate stack** — deposit high-k dielectric + metal gate (or historically, grow oxide + deposit poly). Pattern it: this is the critical layer, the one that defines $L$.
4. **Source/drain** — implant N+ (or P+) regions, self-aligned to the gate: the gate itself masks the channel, so source/drain always land exactly at its edges. Self-alignment is one of the great tricks of the industry.
5. **Silicide** — form low-resistance contacts on source/drain/gate.

Then BEOL ("back end of line"): 10–15 layers of copper interconnect, each a repeat of deposit-pattern-etch-fill-polish, connecting billions of transistors into your netlist. Lower metal layers are thin and dense (local wiring); upper layers are thick and fast (power, clocks, long routes) — which is why your router treats them differently.

Modern devices are no longer planar: **FinFETs** (the channel is a 3D fin the gate wraps on three sides, ~2011 onward) and now **gate-all-around nanosheets** (the gate fully surrounds stacked horizontal sheets) — each generation wrapping the gate more completely around the channel to keep electrostatic control as $L$ shrinks.

## Yield: the economics of defects

A single dust particle can kill a die. Fabs run cleanrooms thousands of times cleaner than an operating theater, yet defects still land randomly. A useful first-order yield model:

$$Y = e^{-A \\cdot D_0}$$

where $A$ is die area and $D_0$ defect density. The exponential is brutal: **doubling die area more than doubles the fraction of dead chips.** This single equation explains why huge AI accelerators are so expensive, why chiplets exist (split one big die into several small ones and yield goes up dramatically), and why memory arrays ship with spare rows/columns and repair logic.

## What this means for you as a designer

- **Design rules are physics contracts.** Minimum widths, spacings, and density rules encode lithography and CMP limits.
- **Regularity wins.** Modern layers effectively require gates on a fixed pitch/orientation grid — the fab prints gratings and cuts them.
- **Variation is unavoidable.** Two "identical" transistors differ (dopant count fluctuation, line-edge roughness). This is why timing analysis runs at multiple process corners (SS/TT/FF) — a thread we pick up in Part 3.`,
  },
  {
    slug: "scaling-moores-law",
    title: "Scaling, Moore's Law, and the End of Dennard",
    part: "devices",
    order: 5,
    minutes: 18,
    summary:
      "The scaling rules that made computing exponential, why Dennard scaling broke around 2005, and how the power wall created multicore and AI accelerators.",
    relatedNodeIds: ["compute", "gpu", "alt-chips"],
    body: `## The observation that became a law, then an industry roadmap

In 1965 Gordon Moore observed that the number of transistors on a chip doubled roughly every year (later revised to every two years) at constant cost. **Moore's law was never physics — it was economics plus engineering will**, a self-fulfilling prophecy the industry planned around for six decades. From 2,300 transistors (Intel 4004, 1971) to over 100 billion on today's largest dies.

The engine underneath it had a name: **Dennard scaling**.

## Dennard scaling: the free lunch

Robert Dennard's 1974 paper showed that if you shrink every dimension of a MOSFET by factor $k$ (say $k = 0.7$ per generation) *and* scale voltage down by the same factor, everything improves simultaneously:

| Quantity | Scaling | Result per generation ($k=0.7$) |
|---|---|---|
| Dimensions $L, W, t_{ox}$ | $\\times k$ | 0.7x |
| Voltage $V_{DD}$ | $\\times k$ | 0.7x |
| Area per transistor | $\\times k^2$ | 0.5x → **2x transistors per area** |
| Gate delay | $\\times k$ | 0.7x → **~1.4x faster clocks** |
| Power per transistor | $\\times k^2$ | 0.5x |
| **Power density** | $\\times 1$ | **constant!** |

Check the power-density claim with the dynamic power equation:

$$P_{dyn} = \\alpha C V_{DD}^2 f \\;\\Rightarrow\\; \\frac{P}{A} \\propto \\frac{(kC)(kV)^2(f/k)}{k^2 A} = \\frac{P}{A}$$

Capacitance scales down by $k$, voltage-squared by $k^2$, frequency up by $1/k$, area down by $k^2$ — and power density comes out exactly constant. Twice the transistors, 40% faster, **same heat per square millimeter**. For thirty years (roughly 1975–2005), every chip generation was faster, denser, and no hotter. Software got faster for free.

> **Analogy: shrinking the city.** Imagine a city where, every two years, you shrink every building, car, and road to 70% size. Twice as many buildings fit in the same land. Cars travel shorter distances, so every trip is faster. Each car is smaller and burns less fuel — and the total traffic exhaust per square mile stays exactly constant. Nobody has to redesign anything; the shrink itself is the improvement. That was Dennard's world. Then one day the cars' engines stopped shrinking — leaving ever more traffic packed into the same streets, all still idling.

## Why it ended: the leakage floor

Dennard scaling required $V_{DD}$ to keep falling — and $V_T$ (threshold voltage) must fall with it to keep transistors fast (drive current depends on $V_{DD} - V_T$). But subthreshold leakage grows **exponentially** as $V_T$ drops:

$$I_{leak} \\propto e^{-V_T / (n V_T^{th})}, \\qquad nV_T^{th} \\approx 60\\text{–}100\\ \\text{mV per decade}$$

The subthreshold slope has a hard thermodynamic floor: at room temperature, a conventional MOSFET cannot turn off faster than **60 mV of gate voltage per 10x current reduction** ($\\ln(10) \\cdot kT/q$). Every 60–100 mV shaved off $V_T$ meant 10x more leakage current from *every one* of billions of transistors — even the "off" ones.

Around 2005, at ~90 nm and $V_{DD} \\approx 1$ V:

- Voltage scaling stalled ($V_{DD}$ has crept from ~1.2 V to ~0.7 V in twenty years, not the ~0.15 V Dennard would predict).
- Leakage power grew to rival dynamic power.
- Power density began climbing every generation — the **power wall**. Gate oxide had also reached ~1.2 nm (five atoms), where quantum tunneling through the gate itself became a major leak (fixed partly by high-k metal gates in 2007).

Clock frequencies froze near 3–5 GHz, where they remain today.

## Living after Dennard

Transistor counts kept growing (Moore continued, slower), but you could no longer afford to switch them all at once. Consequences, in order:

1. **Multicore (2005–)** — stop chasing frequency; spend transistors on parallel cores at fixed clocks. This traded the hardware problem for a software one (parallel programming).
2. **Dark silicon** — at constant power budget with rising density, a growing fraction of the chip must sit powered off at any moment. Utilization, not transistor count, became the scarce resource.
3. **Specialization** — if you cannot light up everything, make what you light up count. An accelerator tuned to one workload (a GPU tensor core, a TPU's systolic array, a video codec block) delivers 10–1000x better performance-per-watt than a general-purpose core on that workload. **The entire AI-hardware industry is the direct consequence of the end of Dennard scaling.**
4. **Device gymnastics** — FinFETs (2011) and gate-all-around nanosheets exist to hold the electrostatic line: wrapping the gate around the channel steepens control and holds leakage back for a few more nodes. Node names ("5 nm", "3 nm", "18A") are now marketing labels, not physical gate lengths.
5. **Going vertical and modular** — 3D stacking (HBM DRAM stacks, foundry die-on-die), chiplets, and advanced packaging move scaling from the transistor to the system. Wire delay, not gate delay, dominates — a theme that returns in Part 3 (interconnect) and Part 5 (memory hierarchies for AI chips).

## The numbers that define the present

- Transistor density still improves ~1.6–2x per node, but **cost per transistor is no longer reliably falling** — a leading-edge wafer costs ~$20k+, and design costs run hundreds of millions.
- Energy per operation improves slowly; **data movement now costs far more energy than arithmetic.** Moving 64 bits from off-chip DRAM costs ~1000x the energy of a 64-bit add. Rule of thumb worth memorizing: *compute is cheap, memory access is expensive.*
- Single-thread performance grows a few percent per year; essentially all real gains come from parallelism and specialization.

## Why this chapter matters for your roadmap

Every phase of the VLSI-AI track is downstream of this story:

- **Why AI accelerators exist at all** — dark silicon forced specialization (Part 5, systolic arrays).
- **Why low-power design is a discipline** — the $\\alpha C V_{DD}^2 f$ equation and leakage management are Part 3's low-power chapter.
- **Why quantization matters** — fewer bits per operation attacks the energy problem where it lives: data movement (your Phase 6).
- **Why the roofline model is drawn the way it is** — flat compute ceilings and steep memory slopes are Dennard's ghost (your Phase 2).

The free lunch ended in 2005. Everything since — multicore, GPUs, TPUs, your career plan — is the bill.`,
  },
];
