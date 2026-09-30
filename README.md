# Regex Equivalence Checker and Automata Visualizer

A Principles of Compiler Design course project for determining whether two regular expressions denote identical regular languages, accompanied by step-by-step automata visualization.

---

## 🎯 Project Overview & Pipeline Roadmap

The eventual pipeline of the system converts two regular expressions into canonical automata to formally test language equivalence:

```
Regex A & Regex B
   │
   ▼
1. Lexical Analysis & Tokenization (Phase 1 - Complete)
   │
   ▼
2. Explicit Concatenation (a.b) & Shunting-Yard Postfix Conversion (Phase 1 - Complete)
   │
   ▼
3. Thompson's Construction (ε-NFA) (Stage 2 - Upcoming)
   │
   ▼
4. Subset Construction via ε-Closure (DFA) (Stage 3 - Upcoming)
   │
   ▼
5. Hopcroft / Table-Filling Minimization (Min-DFA) (Stage 4 - Upcoming)
   │
   ▼
6. Product Automaton & BFS Shortest Counterexample (Stage 5 - Upcoming)
```

---

## 📐 Supported Regular Expression Grammar

The Phase 1 frontend supports standard regular language operations with strict mathematical precedence:

| Precedence | Operator | Description | Associativity | Example |
| :---: | :---: | :---: | :---: | :---: |
| **3** (Highest) | `*` | Kleene Star (unary postfix) | Right/Postfix | `a*` |
| **2** | `.` | Concatenation (implicit or explicit) | Left-to-right | `ab` $\to$ `a.b` |
| **1** (Lowest) | `\|` | Alternation / Union | Left-to-right | `a\|b` |
| **Grouping** | `( )` | Parentheses for subexpression precedence | N/A | `(a\|b)*` |

### Supported Symbols
- **Literals**: Alphanumeric characters `[a-zA-Z0-9]`, and Greek epsilon `ε`.
- **Operators**: `(`, `)`, `|`, `*`.
- **Whitespace**: Skipped transparently while preserving precise source character offsets for diagnostics.

---

## ⚙️ Core Compiler Algorithms (Phase 1)

### 1. Tokenizer (`src/automata/regex/tokenizer.ts`)
Produces strongly typed tokens (`LITERAL`, `UNION`, `STAR`, `LPAREN`, `RPAREN`) while recording the zero-indexed offset of each character for syntax error reporting.

### 2. Syntactic Validator (`src/automata/regex/validator.ts`)
Performs static analysis on the token stream to detect:
- Empty expressions
- Unbalanced parentheses (`(`, `)`)
- Redundant empty subexpressions `()`
- Invalid operator placement (e.g. `|a`, `a|`, `a||b`, `*a`, `(*a)`)

### 3. Implicit Concatenation (`src/automata/regex/concatenation.ts`)
Inserts explicit `.` tokens between adjacent subexpressions where concatenation is implied:
- Token $T_1$ can end an operand: `LITERAL`, `STAR`, `RPAREN`
- Token $T_2$ can start an operand: `LITERAL`, `LPAREN`
- Example: `(a|b)*abb` $\to$ `(a|b)*.a.b.b`

### 4. Shunting-Yard Postfix Converter (`src/automata/regex/postfix.ts`)
Converts the infix token stream into Reverse Polish Notation (postfix) using Dijkstra's Shunting-Yard algorithm adapted for regular expressions:
- Literal operands are output immediately.
- `*` is a unary postfix operator that immediately attaches to the preceding subexpression on the output stack.
- Binary operators (`.` and `|`) maintain stack discipline based on precedence and left-associativity.
- Example: `(a|b)*abb` $\to$ `ab|*a.b.b.`

---

## 📁 Project Structure

```
src/
├── automata/
│   └── regex/
│       ├── types.ts          # Token and ProcessedRegexResult types
│       ├── tokenizer.ts      # Lexical analysis and position tracking
│       ├── validator.ts      # Syntax and operator validation
│       ├── concatenation.ts  # Explicit concatenation insertion
│       ├── postfix.ts        # Shunting-yard postfix conversion
│       ├── index.ts          # High-level compiler facade
│       └── __tests__/
│           └── regex.test.ts # Vitest suite (41 tests)
├── components/
│   ├── Header.tsx            # Academic navbar with course metadata
│   ├── TabNavigation.tsx     # Stage navigation tabs (Input, NFA, DFA, Min-DFA, Equivalence)
│   ├── RegexInputCard.tsx    # Dual regex inputs with syntax error pointers
│   ├── InputSection.tsx      # Main input workspace, presets & actions
│   ├── DebugSection.tsx      # Intermediate representations inspector
│   └── PlaceholderTab.tsx    # Upcoming stage descriptions & placeholders
├── types/
│   └── pipeline.ts           # Pipeline stage definitions
├── App.tsx                   # Top-level state and layout
├── index.css                 # Tailwind CSS v4 styling
└── main.tsx                  # Application entry point
```

---

## 🧪 Testing & Verification

Run the automated test suite:

```bash
npm test
```

41 unit tests test both valid expressions (`a`, `ab`, `a|b`, `a*`, `(a|b)*`, `(a|b)*abb`, `a(b|c)*`, numbers) and invalid expressions (`""`, `(`, `a|`, `|a`, `a||b`, `*a`, `(a|b`, `a(b))`, unsupported characters) with character-precise error positions.

To build the production bundle:

```bash
npm run build
```

To run the local development server:

```bash
npm run dev
```
