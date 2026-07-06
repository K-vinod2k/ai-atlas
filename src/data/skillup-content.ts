import type { SkillupItem } from "./types";

/**
 * Skillup source material, imported from /Skillup:
 * - "VLSI AI Engineer Learning Plan.docx" (7-phase roadmap)
 * - "_kpop/exp_log_plan_quality.md" (plan quality audit)
 * - "setMismatch.py" (LeetCode 645 solution)
 */
export const SKILLUP_ITEMS: SkillupItem[] = [
  {
    slug: "phase-1-digital-logic",
    title: "Phase 1: Digital Logic",
    kind: "phase",
    topic: "VLSI AI Roadmap",
    weeks: "Weeks 1-2",
    order: 1,
    summary:
      "Boolean algebra, combinational and sequential circuits, FSMs, and timing fundamentals.",
    relatedNodeIds: ["bit", "compute"],
    body: `## Skills

- Boolean algebra, truth tables, K-map minimization
- Combinational circuits: adder, MUX, comparator
- Sequential circuits: D flip-flop, counter, FSM (Moore and Mealy)
- Timing: setup time, hold time, clock domains

## Problems to solve

1. Simplify F = A·B + A·B'·C using Boolean algebra and K-map
2. Build a 4-bit ripple carry adder. Trace 0110 + 0011 step by step
3. Design an FSM that detects the bit sequence \`1011\` in a serial stream
4. Vending machine FSM: accepts $0.25/$0.50, dispenses at $1.00
5. Prove De Morgan's theorem with a truth table: (A·B)' = A' + B'

## Build

Implement the \`1011\` sequence detector FSM in Digital simulator (free). GitHub commit with screenshot of correct waveform.

## DSA (parallel)

Bit Manipulation: LeetCode 191, 136, 268, 371, 67, 338, 260, 190

## Resource

Nand2Tetris Part 1, Weeks 1-3 (free at nand2tetris.org)`,
  },
  {
    slug: "phase-2-computer-architecture",
    title: "Phase 2: Computer Architecture",
    kind: "phase",
    topic: "VLSI AI Roadmap",
    weeks: "Weeks 3-4",
    order: 2,
    summary:
      "RISC pipeline, hazards, memory hierarchy, and the roofline model for compute vs memory bounds.",
    relatedNodeIds: ["compute", "gpu"],
    body: `## Skills

- 5-stage RISC pipeline: IF, ID, EX, MEM, WB
- Hazards: data, control, structural; forwarding paths and stalls
- Memory hierarchy: registers, L1/L2/L3 cache, DRAM, access times
- Roofline model: arithmetic intensity, compute-bound vs memory-bound

## Problems to solve

1. Trace ADD/SUB/AND sequence: find all data hazards, count stalls with and without forwarding
2. Calculate arithmetic intensity for 1024x1024 FP32 matrix multiply (FLOPs / bytes)
3. Given 10 TFLOPS compute, 500 GB/s bandwidth: is that matmul compute or memory bound?
4. INT8 quantization cuts weight size 4x. How does arithmetic intensity shift?
5. Why does batch size increase arithmetic intensity? Show with formula.

## Build

Python script: input (FLOPs, bytes, peak TFLOPS, peak bandwidth) → outputs roofline chart with the workload plotted. Reuse every phase.

## DSA (parallel)

Arrays, Sliding Window: LeetCode 239, 42, 11, 76, 283, 75, 53

## Resource

MIT OCW 6.004 Lectures 1-20 (free, YouTube)`,
  },
  {
    slug: "phase-3-verilog-systemverilog",
    title: "Phase 3: Verilog / SystemVerilog",
    kind: "phase",
    topic: "VLSI AI Roadmap",
    weeks: "Weeks 5-10",
    order: 3,
    summary:
      "RTL design: modules, blocking vs non-blocking, FSMs, testbenches, FIFOs, and a pipelined dot product capstone.",
    relatedNodeIds: ["compute", "alt-chips"],
    body: `## Skills

- Module structure, ports, wire vs reg, assign vs always
- Blocking (\`=\`) vs non-blocking (\`<=\`) — critical rule: always use \`<=\` in clocked always blocks
- Combinational: \`always @(*)\` with case/if-else; Sequential: \`always @(posedge clk)\`
- FSMs in 3-block style: state register + next-state logic + output logic
- Testbenches: clock gen, stimulus, self-checking with \`$display\`
- RTL patterns: FIFO, shift register, parameterized modules, pipelined dot product

## Problems to solve

1. 1-bit full adder module with testbench verifying all 8 input combos
2. 4-bit ripple carry adder using structural instantiation of full adder
3. 8-to-1 MUX with 3-bit select using case statement
4. 4-bit up counter with synchronous reset. Self-checking testbench.
5. Sequence detector \`1011\` in Verilog using 3-block FSM style
6. AXI-Lite handshake FSM: IDLE, WRITE_ADDR, WRITE_DATA, WRITE_RESP
7. 4-stage pipelined adder with registered intermediate results
8. Synchronous FIFO: 8 entries, 8-bit data, full and empty flags
9. Parameterized multiplier: parameter WIDTH = 8. Instantiate for 4/8/16-bit.
10. Pipelined dot product of two 4-element INT8 vectors (Phase 3 capstone)

## Build

Pipelined dot product: two 4-element INT8 vectors, fully pipelined, verified with self-checking testbench. GitHub repo with all 10 modules.

## DSA (parallel)

Stacks, Queues, Linked Lists, Recursion: LeetCode 20, 155, 739, 206, 141, 21, 23, 50, 215, 53

## Resource

HDLBits (hdlbits.01xz.net) — complete all Verilog Language and Sequential Logic sections. EDA Playground for simulation.`,
  },
  {
    slug: "phase-4-fpga-implementation",
    title: "Phase 4: FPGA Implementation",
    kind: "phase",
    topic: "VLSI AI Roadmap",
    weeks: "Weeks 11-14",
    order: 4,
    summary:
      "Vivado flow, timing and resource reports, AXI-Lite, and a 4x4 INT8 matrix multiply on real hardware.",
    relatedNodeIds: ["alt-chips", "compute"],
    body: `## Skills

- FPGA internals: LUTs, DSP48 slices, BRAM, I/O blocks
- Vivado flow: RTL → synthesis → implementation → bitstream
- Timing reports: critical path, setup slack, max clock frequency
- Resource reports: LUT%, DSP%, BRAM% utilization
- AXI-Lite slave interface: connect accelerator to CPU register space

## Problems to solve

1. 4-bit counter on FPGA: output on LEDs. Post-synthesis: what is max clock frequency?
2. UART transmitter: send "Hello" at 115200 baud. Verify on laptop terminal.
3. Write C <= A * B + C_in. Confirm Vivado infers DSP48 (check schematic view).
4. Initialize BRAM from hex file (\`$readmemh\`). Read back serially. Verify contents.
5. 4x4 INT8 matrix multiply using DSP slices and BRAM. Measure throughput at 100 MHz.
6. AXI-Lite slave: 4 registers at 0x00/0x04/0x08/0x0C. Write from CPU, read back.
7. Connect matrix multiply to AXI-Lite: write inputs via AXI, read result via AXI.

## Build

4x4 INT8 matrix multiply on FPGA hardware. AXI-Lite connected. Measured throughput documented in GitHub README.

## DSA (parallel)

Trees, Binary Search: LeetCode 102, 104, 704, 33, 74, 230, 162

## Resource

Xilinx Vivado WebPACK (free). Digilent Basys 3 or Arty A7 board (~$99-$129).`,
  },
  {
    slug: "phase-5-hw-sw-co-design-hls",
    title: "Phase 5: HW-SW Co-Design (HLS)",
    kind: "phase",
    topic: "VLSI AI Roadmap",
    weeks: "Weeks 15-18",
    order: 5,
    summary:
      "High-Level Synthesis: C-to-RTL with pragmas, AXI DMA, and a 2-layer MNIST MLP on FPGA.",
    relatedNodeIds: ["compute", "mlp"],
    body: `## Skills

- HLS: C/C++ to RTL using Vitis HLS
- Pragmas: PIPELINE II=1, UNROLL factor=N, ARRAY_PARTITION
- Initiation Interval (II): what it means, how to achieve II=1
- AXI DMA: CPU sends data to FPGA, FPGA computes, CPU reads result
- End-to-end latency profiling: DMA time vs compute time

## Problems to solve

1. Vector dot product in HLS. Check synthesis report: latency and resource usage.
2. Add \`#pragma HLS PIPELINE II=1\`. What changes in throughput vs area?
3. Add \`#pragma HLS UNROLL factor=4\`. Measure DSP count vs throughput tradeoff.
4. 16x16 INT8 matrix multiply in HLS. Target: II=1 on inner loop.
5. Compare HLS vs hand-written Verilog from Phase 4: DSP count, frequency, throughput.
6. Write C driver: allocate matrices, write via DMA, trigger compute, read result.
7. Verify result matches \`numpy.matmul\` on same inputs.
8. 2-layer MLP (784-256-10) on FPGA. Measure latency vs CPU baseline.

## Build

2-layer MNIST MLP running on FPGA via HLS and DMA. Latency measured and documented. Phase 5 capstone.

## DSA (parallel)

Graphs, Topological Sort: LeetCode 207, 210, 329, 743, 200, 127

## Resource

Vitis HLS User Guide UG1399 (free PDF, xilinx.com)`,
  },
  {
    slug: "phase-6-ml-model-optimization",
    title: "Phase 6: ML Model Optimization",
    kind: "phase",
    topic: "VLSI AI Roadmap",
    weeks: "Weeks 19-22",
    order: 6,
    summary:
      "Quantization (PTQ/QAT), pruning, ONNX export, and TensorRT benchmarking of INT8 MobileNetV2.",
    relatedNodeIds: ["quant", "pruning", "compression", "distill"],
    body: `## Skills

- Post-training quantization (PTQ): INT8, INT4, FP16
- Quantization-aware training (QAT): simulate quantization during training
- Structured pruning: remove channels by L2 norm, fine-tune
- ONNX export and graph optimization: operator fusion
- TensorRT: FP32 vs FP16 vs INT8 benchmarking, latency and throughput

## Problems to solve

1. Implement quantize/dequantize for a 1D float tensor. Verify round-trip error.
2. Export MobileNetV2 from PyTorch. Apply dynamic INT8 PTQ. Measure size and latency.
3. Static INT8 PTQ: calibrate on 100 images. Compare accuracy vs FP32 on ImageNet val.
4. QAT on MNIST CNN: train 5 epochs. Compare accuracy to PTQ.
5. Export to ONNX. Run inference in ONNX Runtime. Verify outputs match PyTorch.
6. L1 unstructured pruning at 30% sparsity. Measure accuracy delta.
7. Structured channel pruning: remove lowest L2-norm channels. Fine-tune 2 epochs.
8. TensorRT: compare FP32/FP16/INT8 latency. Roofline at batch=1/8/32/128.

## Build

INT8 MobileNetV2 in TensorRT with <1% accuracy drop vs FP32. Roofline chart for all batch sizes. GitHub benchmark report.

## DSA (parallel)

Dynamic Programming: LeetCode 70, 198, 300, 322, 416, 1143, 72

## Resource

PyTorch Quantization docs. TensorRT Developer Guide (NVIDIA docs, free).`,
  },
  {
    slug: "phase-7-ai-accelerator-architecture",
    title: "Phase 7: AI Accelerator Architecture",
    kind: "phase",
    topic: "VLSI AI Roadmap",
    weeks: "Weeks 23-30",
    order: 7,
    summary:
      "Systolic arrays, dataflow taxonomies, TPU/Tensor Core/NPU tradeoffs, and a full MNIST accelerator capstone.",
    relatedNodeIds: ["tpu", "gpu", "alt-chips", "tensor"],
    body: `## Skills

- Processing Element (PE) design: MAC unit with pipelined registers
- Systolic array: 2D PE grid, data skewing, weight-stationary dataflow
- Dataflow taxonomy: weight-stationary vs output-stationary vs row-stationary
- On-chip SRAM scratchpad vs cache: why scratchpad wins for AI workloads
- Roofline analysis of custom hardware: compute vs memory bound
- TPU v1, NVIDIA Tensor Core, Qualcomm Hexagon NPU architecture tradeoffs

## Problems to solve

1. Single PE in Verilog: A_in, B_in, psum_in → psum_out = psum_in + A*B, pass A and B through
2. 4x4 systolic array from 16 PEs. Correct interconnect and data skewing.
3. Trace two 4x4 INT8 matmul: verify first 3 cycles manually with data skewing.
4. Weight-stationary modification: preload weights into PE registers before compute.
5. TPU v1: 256 cycles fill time on 256x256 array. What % of total cycles is fill latency?
6. NVIDIA 2:4 sparsity: what minimum weight sparsity is needed to see throughput gain?
7. Hexagon NPU: 45 TOPS at 1W. A100: 312 TFLOPS at 400W. Calculate TOPS/W each.
8. CAPSTONE: Full MNIST accelerator (784-256-10, INT8, systolic+SRAM+ReLU+AXI on FPGA)

## Build

MNIST inference accelerator on Artix-7: systolic array + SRAM controller + ReLU + AXI. Quantized PyTorch weights loaded. Inference verified. Roofline analysis. This is your fellowship portfolio piece.

## DSA (parallel)

Hashmaps, Matrix, Intervals, Heaps: LeetCode 146, 460, 48, 54, 289, 56, 435, 253, 23, 621

## Resource

MIT 6.5930 Hardware Architecture for Deep Learning (slides free). TPU v1 paper: Jouppi et al. 2017 ("In-Datacenter Performance Analysis of a Tensor Processing Unit").`,
  },
  {
    slug: "convergence-track-embedded-x-vlsi",
    title: "Convergence Track: Embedded Systems x VLSI AI",
    kind: "note",
    topic: "VLSI AI Roadmap",
    order: 8,
    summary:
      "12 bridge problems where existing STM32/Qualcomm embedded experience counts toward both career tracks.",
    relatedNodeIds: ["alt-chips", "quant"],
    body: `## Why this track exists

Your STM32 / Qualcomm MPU experience is not wasted on the VLSI AI path — it accelerates it. The convergence is deep:

- **HLS is C** — Vitis HLS compiles C/C++ to hardware. Embedded firmware skills transfer directly.
- **AXI-Lite** — AXI-Lite is the FPGA equivalent of memory-mapped peripheral registers.
- **TinyML** — TinyML (TF Lite Micro, CMSIS-NN, X-CUBE-AI) sits exactly between the two tracks.
- **Co-design capstone** — Phase 7 capstone becomes MCU + FPGA co-design: STM32 as host, FPGA as INT8 accelerator.

## When to do these problems

These are not extra work. They replace or augment existing phase problems.

## Overlapping skills — effort counts for both tracks

| Skill | Embedded track | VLSI AI track |
|---|---|---|
| C/C++ | Embedded firmware | Vitis HLS synthesis input |
| Digital logic / timing | Interrupt latency | RTL setup/hold |
| Memory-mapped I/O | STM32 peripheral registers | AXI-Lite slave |
| DMA | STM32 HAL DMA | FPGA AXI DMA controller |
| SPI / I2C / UART | Sensor comms | FPGA peripheral RTL |
| INT8 inference | CMSIS-NN on Cortex-M | Custom FPGA systolic array |
| Python (numpy) | Quick prototyping | Roofline + quantization analysis |
| Power budgeting | MCU sleep modes | FPGA dynamic power estimation |

## Fellowship deadline alignment (5 hrs/day pace)

- **NVIDIA — Sep 1**: Phase 5 ends Sep 1. Submit with Phase 4 complete + HLS portfolio.
- **Meta — Sep 20**: Phase 6 ends Sep 15. Full ML Opt + TinyML portfolio ready.
- **NSF GRFP — Oct 15**: Phase 7 ends Oct 6. Complete co-design capstone in submission.
- **Qualcomm — Dec 1**: Phase 7 complete 2 months early. Polish and extend the capstone.

Sunday: rest. No VLSI, no DSA. Recovery is required at this pace.`,
  },
  {
    slug: "plan-quality-audit",
    title: "Plan Quality Audit (KPOP Experiment Log)",
    kind: "note",
    topic: "Audits & Retrospectives",
    order: 9,
    summary:
      "Falsification audit of the VLSI AI Learning Tracker: 8 hypotheses tested, 5 real problems found.",
    body: `**Goal:** Falsify the claim "The VLSI AI Learning Tracker is a good plan."
**Budget:** 8 hypotheses. **Date:** Jul 1, 2026.

## Baseline

- Sheets audited: Dashboard, Weekly Tracker, DSA Tracker, VLSI Problems, Daily Log, Daily Plan
- Plan: 7 phases, 14 weeks, Jul 1–Oct 6, 2026. 5 hrs/day, 6 days/week (Sundays off).
- Stated study days: 84. Measured study days in Daily Plan: 96.

## What survived (real problems found)

| Finding | Severity | Fix required |
|---|---|---|
| H1: Daily Plan has 14 Sundays + missing Jul 07 & Aug 31 | HIGH | Rebuild Daily Plan with correct date set |
| H2: DSA Tracker ≠ Daily Plan (65 extra in plan, 25 missing) | HIGH | Sync one to the other |
| H3: 12 Convergence problems absent from VLSI Problems sheet | MEDIUM | Add convergence section to VLSI sheet |
| H5: NVIDIA buffer = 0 days (submit on last study day) | MEDIUM | Move portfolio doc to Aug 30 |
| H4: Phase 1 has 2 extra DSA problems | LOW | Mark overflow as Phase 2 extras |

## What is solid (falsified "it's broken")

| Finding | Verdict |
|---|---|
| H6: Dashboard ↔ Weekly Tracker capstones align | CONSISTENT |
| H7: Phase 3 Verilog pacing (1 concept/day, 21 days) | ACHIEVABLE |
| H8: NSF (9 days) + Qualcomm (56 days) fellowship buffers | SAFE |

## Key evidence

- **H1**: Plan row count 96 (not 84). 14 Sundays incorrectly assigned study tasks. Study days Jul 07 and Aug 31 missing entirely. Root cause: the Daily Plan was written as a flat calendar, not a study-day schedule.
- **H2**: DSA Tracker has 54 unique LeetCode problems, Daily Plan has 94; only partial overlap. If both are used, different problems get marked done in each place. Most impactful finding.
- **H5**: Phase 5 ends exactly on the NVIDIA deadline (Sep 1) with the portfolio write-up assigned to that same last day — zero recovery time.

## Recommended next steps (priority order)

1. Fix Daily Plan dates — remove 14 Sundays, add Jul 07 and Aug 31
2. Sync DSA Tracker to Daily Plan (Daily Plan is more contextually correct)
3. Add Convergence block to VLSI Problems sheet (12 rows)
4. Move NVIDIA portfolio doc from Sep 1 → Aug 30`,
  },
  {
    slug: "leetcode-645-set-mismatch",
    title: "LeetCode 645: Set Mismatch",
    kind: "snippet",
    topic: "LeetCode",
    order: 10,
    summary:
      "Find the duplicated and missing number in a 1..n array using a seen-set. O(n) time, O(n) space.",
    body: `Part of the DSA track (Phase 1 assigns LeetCode 268 — Missing Number; this is the companion problem).

**Approach:** one pass to find the duplicate via a seen-set, one range scan to find the missing value.

\`\`\`python
class Solution:
    def findErrorNums(self, nums: list[int]) -> list[int]:
        seen = set()
        n = len(nums)
        for num in nums:
            if num in seen:
                duplicate = num
            else:
                seen.add(num)
        for i in range(1, n + 1):
            if i not in seen:
                missing = i
        return [duplicate, missing]
\`\`\`

**Complexity:** O(n) time, O(n) space.

**Follow-up:** the O(1)-space variant uses sign-marking on the array itself, or XOR of indices and values — worth revisiting during the Phase 1 bit-manipulation block (LC 191, 136, 268, 371).`,
  },
];
