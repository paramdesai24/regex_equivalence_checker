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
  ↓  Phase 3 (next)
ε-Closure / Subset Construction → DFA
  ↓  Phase 4
Hopcroft / Table-Filling → Minimized DFA
  ↓  Phase 5
Product Automaton + BFS → Language Equivalence + Shortest Counterexample
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
│   └── nfa/
│       ├── types.ts            # NFA, Transition, ThompsonStep, StateId
│       ├── thompson.ts         # Thompson's Construction algorithm
│       ├── index.ts
│       └── __tests__/thompson.test.ts
├── components/
│   ├── automata/
│   │   ├── AutomatonGraph.tsx  # React Flow graph renderer
│   │   ├── NFAPanel.tsx        # Graph + table + steps for one NFA
│   │   ├── TransitionTable.tsx # Collapsible transition table
│   │   └── ConstructionSteps.tsx # Collapsible step inspector
│   ├── Header.tsx
│   ├── TabNavigation.tsx
│   ├── RegexInputRow.tsx       # Flat regex input with error display
│   ├── LexerInspector.tsx      # Collapsible lexer debug view
├── pages/
│   ├── InputTab.tsx            # Input workspace with presets
│   ├── NFATab.tsx              # ε-NFA visualization page
│   └── PlaceholderTab.tsx      # DFA / Min-DFA / Equivalence stubs
├── utils/
│   └── nfaToGraph.ts           # NFA → React Flow nodes/edges (data only)
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
npm test         # 71 tests (41 Phase 1 + 30 Phase 2)
npm run build    # production bundle
```

---

## Stage 3 — Next Steps

Implement **ε-NFA → DFA via subset construction**:
1. Compute `ε-closure(state)` for every reachable state set.
2. Build the powerset DFA: each DFA state is a *set* of NFA states.
3. Mark a DFA state as accepting if it contains the NFA's accept state.
4. Visualize the resulting DFA using the same `AutomatonGraph` component.
