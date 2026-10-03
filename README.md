# Regex Equivalence Checker and Automata Visualizer

A Principles of Compiler Design course project.  Determines whether two regular expressions denote identical regular languages, with step-by-step automata visualization for each stage.

---

## Pipeline

```
Regex A / Regex B
  ↓  Phase 1 (complete)
Tokenizer → Validator → Explicit Concat → Shunting-Yard Postfix
  ↓  Phase 2 (complete)
Thompson's Construction → ε-NFA visualization
  ↓  Phase 3 (complete)
ε-Closure / Subset Construction → DFA visualization & transition table
  ↓  Phase 4 (complete)
Hopcroft / Partition Refinement → Minimized DFA visualization
  ↓  Phase 5 (complete)
Product Automaton + Symmetric Difference BFS → Language Equivalence + Shortest Counterexample
```

---

## Supported Grammar

| Precedence | Operator | Meaning | Example |
|:---:|:---:|:---|:---:|
| 3 (highest) | `*` | Kleene star (postfix unary) | `a*` |
| 2 | `.` | Concatenation (implicit; made explicit internally) | `ab` → `a.b` |
| 1 (lowest) | `\|` | Union / alternation | `a\|b` |
| — | `()` | Grouping | `(a\|b)*` |

Literals: `a–z`, `A–Z`, `0–9`, `ε`.

---

## Phase 1 — Regex Frontend

### Tokenizer (`src/automata/regex/tokenizer.ts`)
Scans the input character-by-character.  Each character produces a typed token (`LITERAL`, `UNION`, `STAR`, `LPAREN`, `RPAREN`) with its zero-based source position for accurate error messages.

### Validator (`src/automata/regex/validator.ts`)
Walks the token list to detect: empty expressions, unbalanced parentheses, leading/trailing/consecutive union, star without an operand, and empty sub-expressions `()`.

### Explicit Concatenation (`src/automata/regex/concatenation.ts`)
Inserts a synthetic `CONCAT` (`.`) token between any two adjacent tokens where the left token can end an expression (LITERAL, STAR, RPAREN) and the right token can start one (LITERAL, LPAREN).

```
(a|b)*abb  →  (a|b)*.a.b.b
```

### Postfix / Shunting-Yard (`src/automata/regex/postfix.ts`)
Converts the infix token stream to postfix (Reverse Polish Notation) using Dijkstra's Shunting-Yard algorithm.  Operator precedences: `*` > `.` > `|`.

```
(a|b)*abb  →  ab|*a.b.b.
```

---

## Phase 2 — Thompson's Construction (ε-NFA)

### Why postfix?
A postfix stream maps directly onto Thompson's "NFA fragment stack" pattern.  Each operand token pushes a new fragment; each operator pops fragments, composes them, and pushes the result.  No AST or recursion needed — single O(n) pass.

### Data structures (`src/automata/nfa/types.ts`)
```ts
type StateId = number;

interface Transition {
  from: StateId;
  to: StateId;
  symbol: string | null;   // null means ε-transition
}

interface NFA {
  states: StateId[];
  startState: StateId;
  acceptState: StateId;    // Thompson NFAs always have exactly one accept state
  transitions: Transition[];
  alphabet: string[];
}
```

State IDs are plain integers assigned monotonically starting from `q0` per NFA.  Each NFA is built with its own counter, so `q0` always refers to the NFA's own start state, making viva explanations straightforward.

### Thompson rules (`src/automata/nfa/thompson.ts`)

**Literal `a`**
```
q0 –a→ q1
```
Two states, one transition.

**Concatenation `AB`**
Pop fragment B, then A.  Connect A's accept to B's start via ε.
```
A.accept –ε→ B.start
result: start = A.start, accept = B.accept
```

**Union `A|B`**
Pop B, then A.  Create new start `qs` and accept `qa`.
```
qs –ε→ A.start      qs –ε→ B.start
A.accept –ε→ qa     B.accept –ε→ qa
```

**Kleene Star `A*`**
Pop A.  Create new start `qs` and accept `qa`.
```
qs –ε→ qa            (bypass: zero repetitions)
qs –ε→ A.start       (enter loop)
A.accept –ε→ A.start (repeat)
A.accept –ε→ qa      (exit loop)
```

**Time complexity:** O(n) — each postfix token processed exactly once; each rule adds O(1) states and transitions.

### Construction steps
The builder records a `ThompsonStep` for every operator applied: the operator type, the subject token, a human-readable description, and which states/transitions were newly introduced.  The UI surfaces these in a collapsible **Construction Steps** panel per NFA.

---

## Phase 3 — Subset Construction (ε-NFA → DFA)

Converts the non-deterministic automaton into a Deterministic Finite Automaton (DFA) where each DFA state corresponds to a unique *subset* of NFA states.

### Core Primitives (`src/automata/dfa/`)

1. **`ε-closure(S)` (`src/automata/dfa/epsilonClosure.ts`)**
   Returns the set of all NFA states reachable from any state in $S$ following zero or more $\varepsilon$-transitions. Implemented using an iterative graph traversal (stack-based DFS) with cycle detection (`visited` set).
2. **`move(S, a)` (`src/automata/dfa/move.ts`)**
   Returns the set of all NFA states directly reachable from any state in $S$ on input symbol $a$. Ignores $\varepsilon$-transitions.
3. **Canonical Subset Identity (`src/automata/dfa/subset.ts`)**
   Subset sets are canonicalized by sorting state IDs numerically (e.g. `{3, 1, 4}` $\rightarrow$ `"1,3,4"`). This prevents duplicate DFA states representing the identical set of NFA states.
4. **State Naming (`src/automata/dfa/stateNaming.ts`)**
   DFA states are named using clean spreadsheet-style bijective base-26 letters: `A, B, ..., Z, AA, AB, ...`.
5. **Accepting State Rule**
   A DFA state is marked accepting if and only if its NFA subset contains the NFA's `acceptState`.
6. **Dead / Trap State Handling**
   Transitions into the empty subset $\emptyset$ route to an explicit `DEAD` state that loops to itself on every alphabet symbol ($\forall c \in \Sigma: \delta(\text{DEAD}, c) = \text{DEAD}$). A UI toggle allows users to show or hide the dead state to maintain graph clarity while preserving formal completeness.
7. **Why the resulting automaton is deterministic**
   - For every DFA state and every symbol $a \in \Sigma$, there is exactly one transition to another state (or `DEAD`).
   - No $\varepsilon$-transitions exist in the DFA.
   - Evaluated by our automated determinism validator (`src/automata/dfa/validator.ts`).

### Small Example: `(a|b)*abb`

```
1. Start state: A = ε-closure({q0}) = {q0, q1, q2, q4, q7}
2. move(A, 'a') = {q3, q8} → ε-closure = {q1, q2, q3, q4, q6, q7, q8} (State B)
3. move(A, 'b') = {q5}     → ε-closure = {q1, q2, q4, q5, q6, q7}     (State C)
...
DFA transitions:
  A --a--> B,   A --b--> C
  B --a--> B,   B --b--> D
  ...
```

---

## Phase 4 — DFA Minimization (Partition Refinement)

Reduces any valid DFA to its unique minimal canonical form by eliminating equivalent states and unreachable configurations.

### Minimization Pipeline (`src/automata/minimization/`)

1. **Unreachable-State Removal (`src/automata/minimization/reachable.ts`)**
   Performs BFS reachability traversal from `dfa.startState`. Prunes unreached states and any incident transitions prior to partitioning.
2. **Initial Partition ($P_0$)**
   Partitions reachable states into two fundamental equivalence classes:
   $$P_0 = \{ F, Q \setminus F \}$$
   Accepting states ($F$) and non-accepting states ($Q \setminus F$) are inherently distinguishable (by the empty string $\varepsilon$) and can never be merged.
3. **Partition Refinement Iteration (`src/automata/minimization/minimize.ts`)**
   For each block $B \in P$ and each symbol $a \in \Sigma$, evaluates target partition blocks for all states $s \in B$:
   $$\text{targetBlockIdx}(s) = \text{blockIndex}(\delta(s, a))$$
   If states in $B$ transition into different partition blocks, $B$ is split into separate sub-blocks. This process repeats until no further splits occur (convergence / fixed point).
4. **State Merging & Reconstitution**
   - Each final partition block forms a single state in the Minimized DFA.
   - States are named deterministically (`A, B, C, ...`) with the block containing the original start state placed first (`A`).
   - A minimized state is accepting iff its block contains original accepting states.
   - Transitions are reconstructed using any representative state from each block.
5. **DEAD State Handling**
   An explicit `DEAD` trap state is treated mathematically rather than specially preserved:
   - If `DEAD` is distinguishable from all states, it remains its own minimized state.
   - If another non-accepting sink state is behaviorally equivalent to `DEAD`, they naturally merge.
6. **Language Preservation**
   Because equivalent states have identical future acceptance behavior on all suffix strings, the minimized DFA accepts exactly the same language:
   $$\mathcal{L}(\text{DFA}) = \mathcal{L}(\text{Minimized DFA})$$
   Verified across extensive string simulation test suites.

### Small Example: `(a|b)*abb`

```
Original DFA: 5 states (A, B, C, D, DEAD)
P0 = { {D}, {A, B, C, DEAD} }
Refinement on 'a' and 'b':
  {A, B, C, DEAD} splits into {A}, {B}, {C}, {DEAD}
Final blocks: {A}, {B}, {C}, {D}, {DEAD} (already minimal, 0% reduction)

Redundant expression: (a|b)*
Original DFA: 3 states
Minimized DFA: 1 state (67% reduction)
```

---

## Phase 5 — Language Equivalence & Counterexample Generation

Determines language equivalence between two regular expressions by constructing the **Product Automaton** for their symmetric difference and performing **Breadth-First Search (BFS)** reachability.

### 1. Combined Alphabet Normalization (`src/automata/equivalence/normalize.ts`)
Two regular expressions may have different alphabets (e.g. $\Sigma_A = \{a, b\}$ and $\Sigma_B = \{a\}$).
- Combined alphabet: $\Sigma = \Sigma_A \cup \Sigma_B$.
- Symbols are sorted lexicographically to guarantee deterministic exploration order.
- Both DFAs are completed over $\Sigma$ using an explicit `DEAD` trap state (transitions on missing symbols route to `DEAD`, which loops to itself on all $c \in \Sigma$).

### 2. Product Automaton Formulation (`src/automata/equivalence/product.ts`, `equivalence.ts`)
Given complete DFAs $M_A = (Q_A, \Sigma, \delta_A, q_{0A}, F_A)$ and $M_B = (Q_B, \Sigma, \delta_B, q_{0B}, F_B)$:
- **State representation:** Ordered pairs $(s_A, s_B) \in Q_A \times Q_B$.
- **Start state:** $(q_{0A}, q_{0B})$, representing the empty input prefix $\varepsilon$.
- **Transition function:**
  $$\delta_{\times}((s_A, s_B), c) = (\delta_A(s_A, c), \delta_B(s_B, c))$$
- **Symmetric Difference Acceptance (Distinguishing Condition):**
  A product state $(s_A, s_B)$ is distinguishing if and only if exactly one automaton accepts:
  $$(s_A \in F_A \land s_B \notin F_B) \lor (s_A \notin F_A \land s_B \in F_B) \iff (s_A \in F_A) \oplus (s_B \in F_B)$$

### 3. Reachable BFS & Shortest Counterexample
- Only the **reachable** portion of the product automaton is generated during BFS, avoiding eager $|Q_A| \times |Q_B|$ Cartesian space explosion.
- **Shortest Distinguishing String:** Because BFS explores words in order of non-decreasing length, the first distinguishing product state discovered yields a shortest counterexample.
- **Empty-string Counterexample ($\varepsilon$):** If the start state $(q_{0A}, q_{0B})$ itself is distinguishing (e.g. $L(A)$ accepts $\varepsilon$ while $L(B)$ does not), BFS terminates immediately with counterexample `""` (displayed as `'ε'`).
- **Deterministic Tie-Breaking:** Exploring $\Sigma$ in lexicographical order ensures that among multiple distinguishing strings of identical minimum length, the lexicographically earliest is deterministically selected.
- **Counterexample Backtrace:** BFS maintains `parent` pointers storing `(previousProductStateId, symbol)`. When a distinguishing state is reached, the path is backtraced, reversed, and verified.
- **Dual Simulation Verification:** The counterexample string is simulated against both DFA A and DFA B to guarantee differential acceptance ($L_A(w) \neq L_B(w)$).

### 4. Complexity Analysis (Viva Note)
Let:
- $|Q_A|$ = number of states in DFA A
- $|Q_B|$ = number of states in DFA B
- $|\Sigma|$ = size of combined alphabet $\Sigma_A \cup \Sigma_B$

| Metric | Complexity | Explanation |
|:---|:---:|:---|
| **Max Reachable Product States** | $O(|Q_A| \times |Q_B|)$ | Worst-case Cartesian product size |
| **Product BFS Traversal** | $O(|Q_A| \times |Q_B| \times |\Sigma|)$ | Each state visited once; $|\Sigma|$ transitions checked per state |
| **Counterexample Path Backtrace** | $O(L)$ | Where $L$ is the length of the shortest distinguishing string |
| **Simulation Verification** | $O(L)$ | Step-by-step evaluation on DFA A and DFA B |

---

## Project Structure

```
src/
├── automata/
│   ├── regex/
│   │   ├── types.ts            # Token types, ProcessedRegexResult
│   │   ├── tokenizer.ts        # Lexical analysis
│   │   ├── validator.ts        # Syntax validation
│   │   ├── concatenation.ts    # Implicit → explicit concatenation
│   │   ├── postfix.ts          # Shunting-Yard postfix conversion
│   │   ├── index.ts            # processRegex() facade
│   │   └── __tests__/regex.test.ts
│   ├── nfa/
│   │   ├── types.ts            # NFA, Transition, ThompsonStep, StateId
│   │   ├── thompson.ts         # Thompson's Construction algorithm
│   │   ├── index.ts
│   │   └── __tests__/thompson.test.ts
│   ├── dfa/
│   │   ├── types.ts            # DFA, DFAState, DFATransition, SubsetConstructionStep
│   │   ├── stateNaming.ts      # Bijective base-26 naming (A..Z, AA..)
│   │   ├── epsilonClosure.ts   # Iterative ε-closure(S)
│   │   ├── move.ts             # move(S, symbol)
│   │   ├── subset.ts           # Subset / powerset construction
│   │   ├── validator.ts        # DFA determinism validator
│   │   ├── simulation.ts       # NFA & DFA string simulators
│   │   ├── index.ts
│   │   └── __tests__/subset.test.ts
│   ├── minimization/
│   │   ├── types.ts            # MinimizedDFAState, MinimizationStep, MinimizationResult
│   │   ├── reachable.ts        # findReachableStates, pruneUnreachableStates
│   │   ├── minimize.ts         # Partition refinement minimization
│   │   ├── validator.ts        # Minimized DFA integrity and consistency validator
│   │   ├── index.ts
│   │   └── __tests__/minimize.test.ts
│   └── equivalence/
│       ├── types.ts            # ProductState, ProductAutomaton, EquivalenceResult
│       ├── normalize.ts        # Alphabet union & DFA trap state completion
│       ├── equivalence.ts      # Symmetric difference BFS & counterexample generator
│       ├── validator.ts        # Product automaton integrity validator
│       ├── index.ts
│       └── __tests__/equivalence.test.ts
├── components/
│   ├── automata/
│   │   ├── AutomatonGraph.tsx          # React Flow graph renderer (NFA & DFA)
│   │   ├── ProductAutomatonGraph.tsx   # React Flow product automaton visualizer
│   │   ├── NFAPanel.tsx                # ε-NFA inspector panel
│   │   ├── DFAPanel.tsx                # DFA inspector panel
│   │   ├── MinimizedDFAPanel.tsx       # Minimized DFA panel with comparison stats
│   │   ├── ProductGraphPanel.tsx       # Collapsible product automaton panel
│   │   ├── CounterexampleInspector.tsx # Step-by-step derivation walkthrough
│   │   ├── EquivalenceSteps.tsx        # Collapsible BFS step inspector
│   │   ├── TransitionTable.tsx         # NFA transition table
│   │   ├── DFATransitionTable.tsx      # DFA matrix transition table (State x Symbol)
│   │   ├── StateMappingTable.tsx       # DFA state ↔ NFA subset mapping table
│   │   ├── StateMergeMappingTable.tsx  # Minimized state ↔ Original DFA states table
│   │   ├── ConstructionSteps.tsx       # Thompson step inspector
│   │   ├── SubsetSteps.tsx             # Subset construction step inspector
│   │   └── MinimizationSteps.tsx       # Partition refinement step inspector
│   ├── Header.tsx
│   ├── TabNavigation.tsx
│   ├── RegexInputRow.tsx
│   ├── LexerInspector.tsx
├── pages/
│   ├── InputTab.tsx            # Input workspace with presets
│   ├── NFATab.tsx              # ε-NFA visualization page
│   ├── DFATab.tsx              # DFA visualization page
│   ├── MinimizedDFATab.tsx     # Minimized DFA visualization page
│   └── EquivalenceTab.tsx      # Language Equivalence & Counterexample workbench
├── utils/
│   ├── nfaToGraph.ts           # NFA → React Flow nodes/edges
│   ├── dfaToGraph.ts           # DFA → React Flow nodes/edges
│   └── productToGraph.ts       # Product Automaton → React Flow nodes/edges
├── types/
│   └── pipeline.ts
├── App.tsx
└── index.css
```

---

## Running the Project

```bash
npm install
npm run dev      # http://localhost:5173
npm test         # 217 tests (41 Phase 1 + 30 Phase 2 + 59 Phase 3 + 62 Phase 4 + 25 Phase 5)
npm run lint     # oxlint
npm run build    # production bundle
```

---

## Viva Quick Reference

- **Why postfix?**
  Postfix (Reverse Polish Notation) eliminates operator precedence and parentheses nesting, allowing Thompson's construction to be executed in a single $O(n)$ pass using an operand stack.

- **Why ε-NFA?**
  Thompson's syntax-directed construction composes sub-automata modularly by linking initial and accepting states through $\varepsilon$-transitions without requiring modifications to internal transitions.

- **What is ε-closure?**
  $\varepsilon$-closure of a state set $S$ is the set of all NFA states reachable from any state in $S$ by traversing zero or more $\varepsilon$-transitions.

- **Why subset construction?**
  It converts a non-deterministic finite automaton into an equivalent deterministic finite automaton where each DFA state corresponds to a unique subset of NFA states.

- **How is a DFA state accepting?**
  A DFA state is marked accepting if and only if its corresponding NFA-state subset contains the NFA's accept state.

- **Why minimize DFA?**
  DFA minimization merges behavioral equivalence classes (states that produce identical acceptance outcomes on all possible future suffix strings), obtaining the unique canonical minimum-state DFA.

- **How do we test regex equivalence?**
  We construct the product automaton for the symmetric difference $L(A) \triangle L(B) = (L(A) \cap \overline{L(B)}) \cup (\overline{L(A)} \cap L(B))$. The two languages are equivalent if and only if no distinguishing product state is reachable from the start state.

- **Why BFS?**
  Breadth-First Search visits states in order of non-decreasing word length. The first distinguishing state reached guarantees that the reconstructed string is a shortest distinguishing counterexample.

- **Why lexicographic sorting?**
  Sorting alphabet symbols lexicographically ensures that transition exploration during BFS is deterministic, consistently selecting the lexicographically earliest counterexample among equal-length ties.


