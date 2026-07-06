import type { ChapterReference } from "./types";

/** Further-reading map: app chapter slug → chapters in the user's reference
 * bookshelf (src/data/reference-books.ts). Merged onto chapters in index.ts. */
export const CHAPTER_REFERENCES: Record<string, ChapterReference[]> = {
  // ---- Part 1: Semiconductor & Device Basics ----
  "semiconductors-doping-pn-junction": [
    {
      bookId: "sedra-smith",
      chapters: "Ch. 3–4",
      note: "Intrinsic/doped silicon, carrier transport, and the pn junction with diode circuits built on it.",
    },
    {
      bookId: "hayt",
      chapters: "Ch. 2–3",
      note: "Charge, current, voltage, and Kirchhoff's laws — the circuit vocabulary this chapter assumes.",
    },
  ],
  "mosfet-structure-operation": [
    {
      bookId: "sedra-smith",
      chapters: "Ch. 5",
      note: "The definitive MOSFET treatment: structure, i-v characteristics, and all operating regions.",
    },
    {
      bookId: "vlsi-curriculum",
      chapters: "Section 3 (Analog VLSI)",
      note: "Razavi's Electronics lectures start from charge carriers and doping — a good video companion.",
    },
  ],
  "cmos-inverter": [
    {
      bookId: "sedra-smith",
      chapters: "Ch. 14",
      note: "CMOS digital logic circuits: the inverter VTC, noise margins, and dynamic operation, worked in full.",
    },
    {
      bookId: "mano",
      chapters: "Ch. 10",
      note: "Digital IC families — where CMOS sits versus TTL and ECL, plus transmission gates.",
    },
  ],
  "fabrication-process": [
    {
      bookId: "sedra-smith",
      chapters: "Appendix A",
      note: "VLSI fabrication technology: oxidation, diffusion, lithography, and layout ground rules.",
    },
    {
      bookId: "vlsi-curriculum",
      chapters: "Section 2 (CMOS Digital VLSI)",
      note: "Das Gupta's CMOS VLSI lecture series covers process flow alongside device design.",
    },
  ],
  "scaling-moores-law": [
    {
      bookId: "hennessy-patterson",
      chapters: "Ch. 1",
      note: "Technology and energy trends, the end of Dennard scaling, and the shift to parallelism — quantified.",
    },
    {
      bookId: "sedra-smith",
      chapters: "Ch. 14–15",
      note: "How device scaling changes digital circuit design at the transistor level.",
    },
  ],

  // ---- Part 2: Digital Design ----
  "boolean-algebra-logic-gates": [
    {
      bookId: "mano",
      chapters: "Ch. 2–3",
      note: "Boolean algebra, canonical forms, and Karnaugh-map minimization — the classic treatment.",
    },
    {
      bookId: "sedra-smith",
      chapters: "Ch. 14",
      note: "How the abstract gates are actually built from CMOS transistor pairs.",
    },
  ],
  "combinational-logic": [
    {
      bookId: "mano",
      chapters: "Ch. 4",
      note: "Adders, comparators, decoders, encoders, and multiplexers, each with analysis and design procedures.",
    },
  ],
  "sequential-logic": [
    {
      bookId: "mano",
      chapters: "Ch. 5–6",
      note: "Latches, flip-flops, clocked sequential analysis, then registers and counters built from them.",
    },
    {
      bookId: "hayt",
      chapters: "Ch. 8",
      note: "RC transients explain physically why flip-flops need setup and hold time.",
    },
  ],
  "fsm-design": [
    {
      bookId: "mano",
      chapters: "Ch. 5, 8",
      note: "State reduction and assignment in Ch. 5; algorithmic state machines and control logic in Ch. 8.",
    },
  ],
  "timing-analysis": [
    {
      bookId: "mano",
      chapters: "Ch. 5",
      note: "Setup, hold, and propagation-delay definitions for the flip-flops STA reasons about.",
    },
    {
      bookId: "hayt",
      chapters: "Ch. 7–8",
      note: "Capacitance and RC circuits — the physics behind every gate and wire delay number.",
    },
    {
      bookId: "vlsi-curriculum",
      chapters: "Section 3 (Physical Design)",
      note: "Sengupta's physical-design lectures cover timing closure in the P&R context.",
    },
  ],
  "verilog-fundamentals": [
    {
      bookId: "mano",
      chapters: "HDL sections, Ch. 3–8",
      note: "Verilog is introduced incrementally: gate-level, combinational, sequential, and RTL modeling.",
    },
    {
      bookId: "king",
      chapters: "Ch. 4–7",
      note: "Verilog's expressions, operators, and control flow are borrowed from C — learn them at the source.",
    },
    {
      bookId: "vlsi-curriculum",
      chapters: "Section 2 (Hardware Modeling)",
      note: "Sengupta's hardware-modeling course is a full Verilog lecture series.",
    },
  ],
  "memory-sram-dram-flash": [
    {
      bookId: "sedra-smith",
      chapters: "Ch. 16",
      note: "Memory circuits at transistor level: the 6T SRAM cell, sense amplifiers, and row/column decoders.",
    },
    {
      bookId: "mano",
      chapters: "Ch. 7",
      note: "RAM organization, memory decoding, error correction, and programmable logic.",
    },
    {
      bookId: "hennessy-patterson",
      chapters: "Ch. 2",
      note: "How SRAM and DRAM assemble into the cache and memory hierarchy of a real machine.",
    },
  ],

  // ---- Part 3: Physical Design & EDA Flow ----
  "rtl-to-gdsii-flow": [
    {
      bookId: "mano",
      chapters: "Ch. 8",
      note: "Register-transfer-level design — the abstraction the whole flow starts from.",
    },
    {
      bookId: "vlsi-curriculum",
      chapters: "Sections 2–3",
      note: "The curriculum's digital IC design and physical design tracks mirror this flow end to end.",
    },
    {
      bookId: "core-electronics-guide",
      chapters: "Frontend vs backend roles",
      note: "Maps each flow stage to actual job roles (RTL, PD, DV) and the companies hiring for them.",
    },
  ],
  synthesis: [
    {
      bookId: "mano",
      chapters: "Ch. 3–4",
      note: "K-map and two-level minimization — the hand version of what synthesis tools automate.",
    },
    {
      bookId: "vlsi-curriculum",
      chapters: "Section 2 (Digital IC Design)",
      note: "Janakiraman's digital IC design lectures cover synthesis in the tool context.",
    },
  ],
  "floorplanning-placement": [
    {
      bookId: "vlsi-curriculum",
      chapters: "Section 3 (Physical Design)",
      note: "Sengupta's physical-design course covers floorplanning and placement algorithms in depth.",
    },
  ],
  "cts-routing": [
    {
      bookId: "hayt",
      chapters: "Ch. 7",
      note: "Interconnect is an RC network: capacitor and inductor fundamentals behind wire parasitics.",
    },
    {
      bookId: "vlsi-curriculum",
      chapters: "Section 3 (Physical Design)",
      note: "Clock-tree synthesis and routing are the back half of the physical-design lecture track.",
    },
  ],
  "signoff-drc-lvs-power": [
    {
      bookId: "sedra-smith",
      chapters: "Ch. 15",
      note: "Advanced digital IC topics — the circuit-level effects signoff checks are guarding against.",
    },
    {
      bookId: "hayt",
      chapters: "Ch. 11",
      note: "Power-analysis fundamentals: average, apparent, and complex power.",
    },
  ],
  "low-power-design": [
    {
      bookId: "sedra-smith",
      chapters: "Ch. 14–15",
      note: "Dynamic and static power dissipation in CMOS, derived at the transistor level.",
    },
    {
      bookId: "hennessy-patterson",
      chapters: "Ch. 1",
      note: "Energy and power formulas plus DVFS, framed as an architecture-level budget.",
    },
  ],

  // ---- Part 4: Verification ----
  "verification-fundamentals": [
    {
      bookId: "mano",
      chapters: "HDL sections, Ch. 4–8",
      note: "Mano's HDL examples include test benches — the simplest form of the stimulus/check pattern.",
    },
    {
      bookId: "core-electronics-guide",
      chapters: "DV fresher resume",
      note: "What design-verification roles expect from a fresher, with a resume template.",
    },
  ],
  "uvm-basics": [
    {
      bookId: "king",
      chapters: "Ch. 16, 19",
      note: "Structures and program design — the modular-programming maturity UVM's class library assumes.",
    },
    {
      bookId: "vlsi-curriculum",
      chapters: "Section 2 (Digital IC Design)",
      note: "The core-design lecture track is the nearest coverage of verification methodology in the shelf.",
    },
  ],
  "formal-verification": [
    {
      bookId: "mano",
      chapters: "Ch. 2",
      note: "Boolean algebra and its theorems — the math formal engines manipulate to prove equivalence.",
    },
  ],

  // ---- Part 5: AI for VLSI / VLSI for AI ----
  "ml-for-eda": [
    {
      bookId: "hennessy-patterson",
      chapters: "Ch. 1",
      note: "The quantitative method — measuring, modeling, and predicting — is exactly what ML-for-EDA automates.",
    },
    {
      bookId: "vlsi-curriculum",
      chapters: "Section 3 (Physical Design)",
      note: "The P&R problems (placement, CTS, routing) that ML-for-EDA papers target.",
    },
  ],
  "ai-accelerator-architectures": [
    {
      bookId: "hennessy-patterson",
      chapters: "Ch. 3–4",
      note: "ILP limits motivate accelerators; Ch. 4's vector/SIMD/GPU treatment is the systolic array's family tree.",
    },
  ],
  "memory-hierarchies-ai-chips": [
    {
      bookId: "hennessy-patterson",
      chapters: "Ch. 2, App. B",
      note: "Memory hierarchy design and its review appendix: caches, bandwidth, and the optimizations HBM extends.",
    },
    {
      bookId: "sedra-smith",
      chapters: "Ch. 16",
      note: "The SRAM and DRAM cells these hierarchies are physically made of.",
    },
  ],
};
