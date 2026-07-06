/** The user's reference bookshelf: digital copies on Google Drive, mapped to
 * VLSI textbook chapters. Only titles/TOC metadata live here — never book
 * text. The PDFs themselves are local-only under docs/references/ (gitignored).
 *
 * Chapter lists were extracted from the actual PDFs where a text layer
 * existed (Hayt, Sedra, H&P, Mano via Doc export). The K.N. King PDF is a
 * page-image scan, so its list is the published 2nd-edition TOC. */

export type ReferenceBookId =
  | "mano"
  | "hayt"
  | "king"
  | "sedra-smith"
  | "hennessy-patterson"
  | "vlsi-curriculum"
  | "core-electronics-guide";

export interface ReferenceBook {
  id: ReferenceBookId;
  title: string;
  author: string;
  /** Edition or document type, shown as a badge. */
  edition: string;
  kind: "textbook" | "guide";
  /** Link to the user's Google Drive copy. */
  driveUrl: string;
  /** One-line role of this book in the track. */
  description: string;
  /** Top-level chapter/section titles (TOC only, no book content). */
  chapters: string[];
}

export const REFERENCE_BOOKS: ReferenceBook[] = [
  {
    id: "mano",
    title: "Digital Design",
    author: "M. Morris Mano & Michael D. Ciletti",
    edition: "4th edition",
    kind: "textbook",
    driveUrl:
      "https://docs.google.com/document/d/1OoWOm1zWFTS3c_9NzPzOq4UpPzayx8viRfI0IJqDAXk/edit?usp=drive_link",
    description:
      "The standard digital-logic text: number systems through RTL design, with Verilog woven into every chapter.",
    chapters: [
      "1. Digital Systems and Binary Numbers",
      "2. Boolean Algebra and Logic Gates",
      "3. Gate-Level Minimization",
      "4. Combinational Logic",
      "5. Synchronous Sequential Logic",
      "6. Registers and Counters",
      "7. Memory and Programmable Logic",
      "8. Design at the Register Transfer Level",
      "9. Asynchronous Sequential Logic",
      "10. Digital Integrated Circuits",
      "11. Laboratory Experiments with Standard ICs and FPGAs",
      "12. Standard Graphic Symbols",
    ],
  },
  {
    id: "hayt",
    title: "Engineering Circuit Analysis",
    author: "William H. Hayt, Jack E. Kemmerly & Steven M. Durbin",
    edition: "9th edition",
    kind: "textbook",
    driveUrl:
      "https://drive.google.com/file/d/1bScB-9YpvUsUWTWURVxF4cgTqr4D85sN/view?usp=sharing",
    description:
      "Circuit-analysis foundations: KCL/KVL, RC/RL transients, and s-domain analysis behind every delay and power model.",
    chapters: [
      "1. Introduction",
      "2. Basic Components and Electric Circuits",
      "3. Voltage and Current Laws",
      "4. Basic Nodal and Mesh Analysis",
      "5. Handy Circuit Analysis Techniques",
      "6. The Operational Amplifier",
      "7. Capacitors and Inductors",
      "8. Basic RC and RL Circuits",
      "9. The RLC Circuit",
      "10. Sinusoidal Steady-State Analysis",
      "11. AC Circuit Power Analysis",
      "12. Polyphase Circuits",
      "13. Magnetically Coupled Circuits",
      "14. Circuit Analysis in the s-Domain",
      "15. Frequency Response",
      "16. Two-Port Networks",
      "17. Fourier Circuit Analysis",
    ],
  },
  {
    id: "king",
    title: "C Programming: A Modern Approach",
    author: "K. N. King",
    edition: "2nd edition",
    kind: "textbook",
    driveUrl:
      "https://drive.google.com/file/d/1aBjawc8y3SoqLK6fysqP-W17M09Uph2j/view?usp=sharing",
    description:
      "The C reference for EDA tooling and embedded work; Verilog's operators and expressions borrow directly from C.",
    chapters: [
      "1. Introducing C",
      "2. C Fundamentals",
      "3. Formatted Input/Output",
      "4. Expressions",
      "5. Selection Statements",
      "6. Loops",
      "7. Basic Types",
      "8. Arrays",
      "9. Functions",
      "10. Program Organization",
      "11. Pointers",
      "12. Pointers and Arrays",
      "13. Strings",
      "14. The Preprocessor",
      "15. Writing Large Programs",
      "16. Structures, Unions, and Enumerations",
      "17. Advanced Uses of Pointers",
      "18. Declarations",
      "19. Program Design",
      "20. Low-Level Programming",
      "21. The Standard Library",
      "22. Input/Output",
      "23. Library Support for Numbers and Character Data",
      "24. Error Handling",
      "25. International Features",
      "26. Miscellaneous Library Functions",
      "27. Additional C99 Library Functions",
    ],
  },
  {
    id: "sedra-smith",
    title: "Microelectronic Circuits",
    author: "Adel S. Sedra & Kenneth C. Smith",
    edition: "7th edition",
    kind: "textbook",
    driveUrl:
      "https://drive.google.com/file/d/1fRfwCBnnv-dcqPJnI_yC45bAi711-tF1/view?usp=drive_link",
    description:
      "Device physics and circuits: semiconductors, MOSFETs, CMOS logic, and memory circuits at transistor level.",
    chapters: [
      "1. Signals and Amplifiers",
      "2. Operational Amplifiers",
      "3. Semiconductors",
      "4. Diodes",
      "5. MOS Field-Effect Transistors (MOSFETs)",
      "6. Bipolar Junction Transistors (BJTs)",
      "7. Transistor Amplifiers",
      "8. Building Blocks of Integrated-Circuit Amplifiers",
      "9. Differential and Multistage Amplifiers",
      "10. Frequency Response",
      "11. Feedback",
      "12. Output Stages and Power Amplifiers",
      "13. Operational Amplifier Circuits",
      "14. CMOS Digital Logic Circuits",
      "15. Advanced Topics in Digital Integrated-Circuit Design",
      "16. Memory Circuits",
      "17. Filters and Tuned Amplifiers",
      "18. Signal Generators and Waveform-Shaping Circuits",
      "Appendix A. VLSI Fabrication Technology",
    ],
  },
  {
    id: "hennessy-patterson",
    title: "Computer Architecture: A Quantitative Approach",
    author: "John L. Hennessy & David A. Patterson",
    edition: "5th edition",
    kind: "textbook",
    driveUrl:
      "https://drive.google.com/file/d/1n8efCyeV30TIq93cPrXuOeYv7IPoxPzz/view?usp=sharing",
    description:
      "Architecture above the gates: memory hierarchies, ILP, and the GPU/SIMD chapter that AI accelerators build on.",
    chapters: [
      "1. Fundamentals of Quantitative Design and Analysis",
      "2. Memory Hierarchy Design",
      "3. Instruction-Level Parallelism and Its Exploitation",
      "4. Data-Level Parallelism in Vector, SIMD, and GPU Architectures",
      "5. Thread-Level Parallelism",
      "6. Warehouse-Scale Computers",
      "Appendix A. Instruction Set Principles",
      "Appendix B. Review of Memory Hierarchy",
      "Appendix C. Pipelining: Basic and Intermediate Concepts",
    ],
  },
  {
    id: "vlsi-curriculum",
    title: "Essential VLSI Course Curriculum",
    author: "Curated lecture-series index",
    edition: "Course guide",
    kind: "guide",
    driveUrl:
      "https://drive.google.com/file/d/1bFyhgzCWwt8QhH3tHWrP8LRzQutt3RGU/view",
    description:
      "Linked video-lecture curriculum: Neso Academy (digital, C), Sengupta (Verilog, physical design), Sarangi (architecture), Das Gupta (CMOS VLSI), Krishnapura and Razavi (analog).",
    chapters: [
      "1. Foundations: Digital Electronics, C Programming",
      "2. VLSI Core Design: Hardware Modeling (Verilog), Computer Architecture, CMOS Digital VLSI, Digital IC Design",
      "3. Analog & Backend Specialization: Analog VLSI, Advanced Analog Design, Physical Design",
    ],
  },
  {
    id: "core-electronics-guide",
    title: "Ultimate Core Electronics",
    author: "Career and resources map",
    edition: "Reference guide",
    kind: "guide",
    driveUrl:
      "https://drive.google.com/file/d/1ggRoqI2sYUPU3oMReIO-MUsSbtsdI-6Z/view",
    description:
      "Clickable map of the core-electronics career space: VLSI vs embedded roles, frontend vs backend, companies, courses, projects, and fresher resume templates (RTL, PD, DV).",
    chapters: [
      "Domains: VLSI, Embedded, Communication, Robotics",
      "Frontend vs backend roles; product vs service companies",
      "Courses, projects, and resume templates (RTL / PD / DV fresher)",
    ],
  },
];

const BOOK_BY_ID = new Map<ReferenceBookId, ReferenceBook>(
  REFERENCE_BOOKS.map((b) => [b.id, b]),
);

export function getReferenceBook(id: ReferenceBookId): ReferenceBook {
  const book = BOOK_BY_ID.get(id);
  if (!book) throw new Error(`Unknown reference book: ${id}`);
  return book;
}
