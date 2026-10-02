import { LearningModule } from '../types';

export const LEARNING_MODULES: LearningModule[] = [
  // 1. MATHS
  {
    id: 'maths-quadratic-equations',
    subject: 'maths',
    title: 'Quadratic Equations & Roots',
    hindiTitle: 'द्विघात समीकरण और मूल',
    overview:
      'Master the standard form ax² + bx + c = 0, discriminant analysis, factoring, and the quadratic formula to solve algebraic equations step by step.',
    keyConcepts: [
      {
        title: 'Standard Form & Coefficients',
        description: 'Every quadratic equation can be written as ax² + bx + c = 0, where a ≠ 0.',
        formulaOrRule: 'ax² + bx + c = 0',
      },
      {
        title: 'Discriminant (D) Analysis',
        description:
          'Determines the nature of roots: D > 0 gives two distinct real roots; D = 0 gives two equal real roots; D < 0 gives complex roots.',
        formulaOrRule: 'D = b² - 4ac',
      },
      {
        title: 'Quadratic Formula',
        description: 'Universal formula to calculate the roots x₁ and x₂ for any quadratic equation.',
        formulaOrRule: 'x = (-b ± √(b² - 4ac)) / (2a)',
      },
      {
        title: 'Vieta’s Formulas (Sum & Product of Roots)',
        description: 'Sum of roots α + β = -b/a, Product of roots α · β = c/a.',
        formulaOrRule: 'α + β = -b/a,  αβ = c/a',
      },
    ],
    practiceQuestions: [
      {
        id: 'mq-1',
        question: 'Solve for x: 2x² - 7x + 3 = 0 using the quadratic formula.',
        difficulty: 'Easy',
        hint: 'Identify a=2, b=-7, c=3, then calculate D = b² - 4ac.',
        stepByStepSolution:
          'Step 1: Identify coefficients: a = 2, b = -7, c = 3.\n' +
          'Step 2: Calculate Discriminant D:\n' +
          '   D = (-7)² - 4(2)(3) = 49 - 24 = 25.\n' +
          'Step 3: Apply the Quadratic Formula:\n' +
          '   x = (-(-7) ± √25) / (2 × 2) = (7 ± 5) / 4.\n' +
          'Step 4: Solve for both roots:\n' +
          '   x₁ = (7 + 5) / 4 = 12 / 4 = 3.\n' +
          '   x₂ = (7 - 5) / 4 = 2 / 4 = 1/2.',
        finalAnswer: 'x = 3 or x = 1/2',
      },
      {
        id: 'mq-2',
        question: 'Find the value of k for which the equation x² + 6x + k = 0 has equal real roots.',
        difficulty: 'Medium',
        hint: 'For equal roots, the discriminant must be zero: D = 0.',
        stepByStepSolution:
          'Step 1: Here a = 1, b = 6, c = k.\n' +
          'Step 2: For equal roots, D = 0.\n' +
          '   D = b² - 4ac = 6² - 4(1)(k) = 0.\n' +
          'Step 3: 36 - 4k = 0.\n' +
          '   4k = 36  =>  k = 9.',
        finalAnswer: 'k = 9',
      },
    ],
  },

  // 2. PHYSICS
  {
    id: 'physics-newtons-laws',
    subject: 'physics',
    title: "Newton's Laws of Motion & Momentum",
    hindiTitle: 'न्यूटन के गति के नियम और संवेग',
    overview:
      "Understand inertia, net force, acceleration, and conservation of linear momentum with step-by-step vector calculations and real-world intuition.",
    keyConcepts: [
      {
        title: 'First Law (Law of Inertia)',
        description: 'An object remains at rest or in uniform motion unless acted upon by a non-zero net external force.',
        formulaOrRule: 'ΣF = 0 ⟹ a = 0 (v = constant)',
      },
      {
        title: 'Second Law (Fundamental Equation)',
        description: 'Rate of change of momentum is directly proportional to applied force, leading to F = ma for constant mass.',
        formulaOrRule: 'F_net = m · a  (in Newtons, N = kg·m/s²)',
      },
      {
        title: 'Third Law (Action-Reaction)',
        description: 'For every action force, there is an equal and opposite reaction force acting on different bodies.',
        formulaOrRule: 'F_AB = - F_BA',
      },
      {
        title: 'Conservation of Linear Momentum',
        description: 'In an isolated system with no external net force, total initial momentum equals total final momentum.',
        formulaOrRule: 'm₁u₁ + m₂u₂ = m₁v₁ + m₂v₂',
      },
    ],
    practiceQuestions: [
      {
        id: 'pq-1',
        question: 'A net force of 15 N is applied to a box of mass 3 kg on a frictionless surface. What is its acceleration?',
        difficulty: 'Easy',
        hint: 'Use Newton’s Second Law: a = F / m.',
        stepByStepSolution:
          'Step 1: Given: Mass m = 3 kg, Net Force F = 15 N.\n' +
          'Step 2: Use Newton’s Second Law formula: F = m · a.\n' +
          'Step 3: Rearrange for acceleration: a = F / m.\n' +
          'Step 4: Substitute the values: a = 15 N / 3 kg = 5 m/s².\n' +
          'Step 5: Direction of acceleration is in the direction of the applied net force.',
        finalAnswer: 'a = 5 m/s²',
      },
      {
        id: 'pq-2',
        question: 'A 2 kg ball moving at 4 m/s collides with a stationary 1 kg ball. If they stick together after collision, find their common velocity.',
        difficulty: 'Medium',
        hint: 'Use Conservation of Momentum: m₁u₁ + m₂u₂ = (m₁ + m₂)v.',
        stepByStepSolution:
          'Step 1: Identify given variables:\n' +
          '   m₁ = 2 kg, u₁ = 4 m/s (ball 1)\n' +
          '   m₂ = 1 kg, u₂ = 0 m/s (ball 2)\n' +
          'Step 2: Write Conservation of Linear Momentum:\n' +
          '   Total Initial Momentum = m₁u₁ + m₂u₂ = (2)(4) + (1)(0) = 8 kg·m/s.\n' +
          'Step 3: After collision, both masses stick together: total mass = m₁ + m₂ = 2 + 1 = 3 kg.\n' +
          'Step 4: Total Final Momentum = (m₁ + m₂) · v = 3 · v.\n' +
          'Step 5: Equate: 3v = 8  =>  v = 8/3 ≈ 2.67 m/s.',
        finalAnswer: 'v = 8/3 m/s (≈ 2.67 m/s)',
      },
    ],
  },

  // 3. CHEMISTRY
  {
    id: 'chemistry-chemical-reactions',
    subject: 'chemistry',
    title: 'Chemical Reactions & Balancing Equations',
    hindiTitle: 'रासायनिक अभिक्रियाएं और समीकरण संतुलन',
    overview:
      'Learn how to write, classify (Combination, Decomposition, Displacement, Redox), and systematically balance chemical equations using the Law of Conservation of Mass.',
    keyConcepts: [
      {
        title: 'Conservation of Mass',
        description: 'Total number of atoms of each element must remain constant before and after a chemical reaction.',
        formulaOrRule: 'Total Mass of Reactants = Total Mass of Products',
      },
      {
        title: 'Types of Reactions',
        description: 'Combination (A+B→AB), Decomposition (AB→A+B), Single Displacement (A+BC→AC+B), Double Displacement (AB+CD→AD+CB).',
      },
      {
        title: 'Redox Reactions (Oxidation & Reduction)',
        description: 'Oxidation is loss of electrons (or addition of oxygen); Reduction is gain of electrons (or removal of oxygen).',
        formulaOrRule: 'OIL RIG: Oxidation Is Loss, Reduction Is Gain',
      },
    ],
    practiceQuestions: [
      {
        id: 'cq-1',
        question: 'Balance the following chemical equation step by step: Fe + H₂O → Fe₃O₄ + H₂',
        difficulty: 'Medium',
        hint: 'Start with Oxygen (4 atoms on product side), then Iron, then Hydrogen.',
        stepByStepSolution:
          'Step 1: Write unbalanced equation: Fe + H₂O → Fe₃O₄ + H₂.\n' +
          'Step 2: Balance Oxygen first:\n' +
          '   Product has 4 Oxygen in Fe₃O₄, so place coefficient 4 before H₂O:\n' +
          '   Fe + 4H₂O → Fe₃O₄ + H₂.\n' +
          'Step 3: Balance Hydrogen:\n' +
          '   Reactants now have 4 × 2 = 8 Hydrogens. Place coefficient 4 before H₂:\n' +
          '   Fe + 4H₂O → Fe₃O₄ + 4H₂.\n' +
          'Step 4: Balance Iron (Fe):\n' +
          '   Product has 3 Iron in Fe₃O₄. Place coefficient 3 before Fe:\n' +
          '   3Fe + 4H₂O → Fe₃O₄ + 4H₂.\n' +
          'Step 5: Verify all atom counts on both sides:\n' +
          '   Fe: 3 = 3 | H: 8 = 8 | O: 4 = 4. Equation is balanced!',
        finalAnswer: '3Fe(s) + 4H₂O(g) → Fe₃O₄(s) + 4H₂(g)',
      },
    ],
  },

  // 4. BIOLOGY
  {
    id: 'biology-life-processes',
    subject: 'biology',
    title: 'Life Processes: Nutrition & Cellular Respiration',
    hindiTitle: 'जैव प्रक्रम: पोषण और कोशिकीय श्वसन',
    overview:
      'Explore autotrophic and heterotrophic nutrition, photosynthesis light/dark reactions, and aerobic vs anaerobic cellular respiration producing ATP.',
    keyConcepts: [
      {
        title: 'Photosynthesis Overall Reaction',
        description: 'Chlorophyll inside chloroplasts absorbs solar light energy to convert carbon dioxide and water into glucose and oxygen.',
        formulaOrRule: '6CO₂ + 6H₂O + Sunlight → C₆H₁₂O₆ + 6O₂',
      },
      {
        title: 'Aerobic vs Anaerobic Respiration',
        description: 'Aerobic respiration in mitochondria yields 36-38 ATP per glucose; Anaerobic (fermentation/lactic acid) yields only 2 ATP.',
        formulaOrRule: 'Glucose → Pyruvate (in cytoplasm) → CO₂ + H₂O + 38 ATP (in mitochondria)',
      },
      {
        title: 'Stomata & Gas Exchange',
        description: 'Guard cells swell when water enters, opening stomatal pores for CO₂ intake and transpiration water loss.',
      },
    ],
    practiceQuestions: [
      {
        id: 'bq-1',
        question: 'Why do human muscles develop cramps during vigorous exercise? Explain the biochemical reason.',
        difficulty: 'Easy',
        hint: 'Think about what happens when oxygen supply is insufficient in muscle tissue.',
        stepByStepSolution:
          'Step 1: Under normal conditions, muscle cells undergo aerobic respiration with plenty of oxygen.\n' +
          'Step 2: During vigorous exercise, oxygen is consumed faster than the bloodstream can supply it.\n' +
          'Step 3: Muscle cells switch to anaerobic pathway where glucose is broken down to pyruvate and then converted into Lactic Acid (3-carbon molecule).\n' +
          'Step 4: The rapid accumulation of Lactic Acid inside muscle fibers causes muscle fatigue and painful cramps.',
        finalAnswer: 'Accumulation of Lactic Acid due to anaerobic respiration under low oxygen.',
      },
    ],
  },

  // 5. ENGLISH
  {
    id: 'english-grammar-and-formats',
    subject: 'english',
    title: 'Formal Letter Writing & Active/Passive Voice',
    hindiTitle: 'औपचारिक पत्र लेखन और Active/Passive Voice',
    overview:
      'Master formal letter and application writing formats, plus the 5 essential transformation rules for converting Active into Passive Voice.',
    keyConcepts: [
      {
        title: 'Standard Formal Letter Structure',
        description: 'Sender Address → Date → Receiver Designation & Address → Subject Line (Concise) → Salutation → Body (3 paragraphs) → Complimentary Close → Signature.',
      },
      {
        title: 'Active to Passive Conversion Rule',
        description: 'Object becomes Subject; Subject moves to end with "by"; Main verb changes to Past Participle (V3); Auxiliary verb matches tense.',
        formulaOrRule: 'Subject + Verb + Object  ⟹  Object + [be/aux] + V3 + by + Subject',
      },
      {
        title: 'Tense Alignment in Passive Voice',
        description: 'Present Simple: is/am/are + V3 | Past Simple: was/were + V3 | Present Continuous: is/am/are + being + V3 | Perfect: has/have + been + V3.',
      },
    ],
    practiceQuestions: [
      {
        id: 'eq-1',
        question: 'Convert to Passive Voice: "The student solved the difficult math problem."',
        difficulty: 'Easy',
        hint: 'Identify Subject (The student), Verb (solved - past simple), and Object (the difficult math problem).',
        stepByStepSolution:
          'Step 1: Identify components:\n' +
          '   Subject: The student\n' +
          '   Verb: solved (Past Simple)\n' +
          '   Object: the difficult math problem.\n' +
          'Step 2: Move the object to subject position: "The difficult math problem".\n' +
          'Step 3: Past simple passive requires was/were + V3: "was solved".\n' +
          'Step 4: Append the agent with "by": "by the student".',
        finalAnswer: '"The difficult math problem was solved by the student."',
      },
    ],
  },

  // 6. COMPUTER SCIENCE
  {
    id: 'cs-binary-search-big-o',
    subject: 'computerscience',
    title: 'Binary Search Algorithm & Big-O Complexity',
    hindiTitle: 'बाइनरी सर्च एल्गोरिदम और Big-O कॉम्प्लेक्सिटी',
    overview:
      'Learn the divide-and-conquer paradigm of Binary Search on sorted arrays, trace pointer updates, and evaluate time and space complexity in Big-O notation.',
    keyConcepts: [
      {
        title: 'Prerequisite for Binary Search',
        description: 'The input collection or array MUST already be sorted in ascending (or descending) order.',
      },
      {
        title: 'Divide and Conquer Logic',
        description: 'Compare target with middle element mid = low + (high - low)/2. If target < mid, search left; if target > mid, search right.',
        formulaOrRule: 'mid = low + ⌊(high - low) / 2⌋',
      },
      {
        title: 'Time & Space Complexity',
        description: 'Each step halves the remaining search space, giving logarithmic time complexity O(log n) compared to linear search O(n).',
        formulaOrRule: 'Time: O(log n), Space: O(1) iterative',
      },
    ],
    practiceQuestions: [
      {
        id: 'csq-1',
        question: 'Trace Binary Search for target = 23 in sorted array: [2, 5, 8, 12, 16, 23, 38, 56, 72, 91]. How many comparisons are made?',
        difficulty: 'Medium',
        hint: 'Array has 10 elements (indices 0 to 9). Trace low, high, and mid index.',
        stepByStepSolution:
          'Step 1: Initial state: low = 0, high = 9.\n' +
          '   Comparison 1: mid = (0 + 9)//2 = 4. arr[4] = 16.\n' +
          '   Since 23 > 16, search right half: low = mid + 1 = 5.\n' +
          'Step 2: Next iteration: low = 5, high = 9.\n' +
          '   Comparison 2: mid = (5 + 9)//2 = 7. arr[7] = 56.\n' +
          '   Since 23 < 56, search left half: high = mid - 1 = 6.\n' +
          'Step 3: Next iteration: low = 5, high = 6.\n' +
          '   Comparison 3: mid = (5 + 6)//2 = 5. arr[5] = 23.\n' +
          '   Target matched at index 5!',
        finalAnswer: 'Target found at index 5 in exactly 3 comparisons.',
      },
    ],
  },
];
