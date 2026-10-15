// ── OOD Registry ─────────────────────────────────────────────────────────────
// Two item types:
//   type: 'pattern'  — GoF design pattern
//   type: 'question' — classic OOD interview question

import { PALETTE } from './palette'

export const OOD_CATEGORY_LABELS = {
  creational: 'Creational',
  structural:  'Structural',
  behavioral:  'Behavioral',
  question:    'Interview Question',
}

export const OOD_COLORS = PALETTE

// ── Design Patterns ───────────────────────────────────────────────────────────

export const OOD_PATTERNS = [
  // ── Creational ──────────────────────────────────────────────────────────────
  {
    id: 'singleton',
    type: 'pattern',
    category: 'creational',
    title: 'Singleton',
    color: 'violet',
    tagline: 'One instance, global access point',
    description: 'Singleton ensures a class has exactly one instance and provides a global point of access to it. The class controls its own instantiation — the constructor is private, and a static method returns the single shared instance.',
    howItWorks: [
      'Make the constructor private so nothing outside the class can call new.',
      'Store the single instance in a private static field on the class itself.',
      'Expose a static getInstance() method that creates the instance on first call and returns the cached instance on every subsequent call.',
      'All code that needs the object calls getInstance() instead of new.',
    ],
    whenToUse: [
      'You need exactly one shared resource: a config loader, a connection pool, a logger, or a thread pool.',
      'The instance is expensive to create and safe to reuse across the whole application.',
      'You want a single coordination point (e.g. an event bus or scheduler).',
    ],
    participants: [
      { role: 'Singleton', desc: 'The class with a private constructor, a static instance field, and a static getInstance() method.' },
    ],
    realWorldExamples: [
      'A printer spooler — only one process should manage the print queue at a time.',
      'A database connection pool shared by all threads in a web server.',
      'The Runtime object in Java — Runtime.getRuntime() always returns the same JVM instance.',
    ],
    leetcodeProblems: [
      { id: '1603', title: 'Design Parking System', difficulty: 'Easy', path: '/algorithms' },
    ],
  },
  {
    id: 'factory-method',
    type: 'pattern',
    category: 'creational',
    title: 'Factory Method',
    color: 'sky',
    tagline: 'Delegate object creation to subclasses',
    description: 'Factory Method defines an interface for creating an object but lets subclasses decide which class to instantiate. The creator class calls its own factory method rather than calling new directly — subclasses override the method to change what gets created.',
    howItWorks: [
      'Define a Creator class (or interface) with an abstract factory method that returns a Product type.',
      'Concrete subclasses of Creator override the factory method to return their specific Product.',
      'Client code calls the factory method through the Creator interface — it never calls new on a concrete product.',
      'Adding a new product means adding a new Creator subclass, not changing existing code.',
    ],
    whenToUse: [
      'You want to decouple the code that uses an object from the code that creates it.',
      'Subclasses should control which concrete class gets instantiated.',
      'The exact type of object to create is determined at runtime (e.g. based on config or user input).',
    ],
    participants: [
      { role: 'Creator', desc: 'Declares the factory method. May provide a default implementation.' },
      { role: 'ConcreteCreator', desc: 'Overrides the factory method to return a specific ConcreteProduct.' },
      { role: 'Product', desc: 'The interface for objects the factory method creates.' },
      { role: 'ConcreteProduct', desc: 'A specific implementation of the Product interface.' },
    ],
    realWorldExamples: [
      'A logistics app: RoadLogistics.createTransport() returns a Truck; SeaLogistics.createTransport() returns a Ship — both implement Transport.',
      'UI frameworks: a Dialog class has a createButton() factory method. WindowsDialog returns a WindowsButton; WebDialog returns an HtmlButton.',
    ],
    leetcodeProblems: [],
  },
  {
    id: 'builder',
    type: 'pattern',
    category: 'creational',
    title: 'Builder',
    color: 'amber',
    tagline: 'Construct complex objects step by step',
    description: 'Builder separates the construction of a complex object from its representation. A Director orchestrates a step-by-step build process using a Builder interface, and different concrete builders produce different representations of the same process.',
    howItWorks: [
      'Define a Builder interface with a method for each construction step (setWalls(), setRoof(), etc.).',
      'Implement concrete builders that carry out each step differently.',
      'A Director class knows the order of steps and calls them on a builder.',
      'The client creates a concrete builder, passes it to the Director, and calls getResult() to retrieve the finished object.',
    ],
    whenToUse: [
      'Creating an object requires many steps or parameters, and not all are always needed.',
      'The same construction process should produce different representations (e.g. PDF vs HTML report).',
      "You want to avoid a 'telescoping constructor' with many optional parameters.",
    ],
    participants: [
      { role: 'Builder', desc: 'Interface declaring all construction steps.' },
      { role: 'ConcreteBuilder', desc: 'Implements each step and holds the product being assembled.' },
      { role: 'Director', desc: 'Orchestrates the order of construction steps.' },
      { role: 'Product', desc: 'The complex object being constructed.' },
    ],
    realWorldExamples: [
      'Building a house: same steps (foundation, walls, roof) produce a wooden cabin or a stone mansion.',
      "Java's StringBuilder — chain .append() calls to build a string piece by piece.",
    ],
    leetcodeProblems: [],
  },

  // ── Structural ──────────────────────────────────────────────────────────────
  {
    id: 'adapter',
    type: 'pattern',
    category: 'structural',
    title: 'Adapter',
    color: 'teal',
    tagline: 'Make incompatible interfaces work together',
    description: "Adapter converts the interface of a class into another interface that clients expect. It's a wrapper that translates calls from the client's interface to the incompatible class's interface — like a power socket adapter.",
    howItWorks: [
      'Identify the Target interface the client expects and the Adaptee class whose interface is incompatible.',
      'Create an Adapter class that implements the Target interface.',
      'The Adapter holds a reference to the Adaptee and forwards calls, translating between interfaces.',
      'The client uses the Adapter through the Target interface, unaware of the Adaptee.',
    ],
    whenToUse: [
      'You want to use an existing class but its interface does not match what you need.',
      'You are integrating third-party code or a legacy system.',
      'Several existing subclasses lack common functionality, but subclassing all of them to add it is impractical.',
    ],
    participants: [
      { role: 'Target', desc: 'The interface the client expects.' },
      { role: 'Client', desc: 'Collaborates with objects through the Target interface.' },
      { role: 'Adaptee', desc: 'An existing class with an incompatible interface.' },
      { role: 'Adapter', desc: 'Implements Target and wraps the Adaptee, translating calls.' },
    ],
    realWorldExamples: [
      'A power plug adapter — converts a US plug (Adaptee) to work in a European socket (Target).',
      'A payment gateway wrapper that adapts three different payment APIs (PayPal, Stripe, Square) into a single unified interface.',
    ],
    leetcodeProblems: [],
  },
  {
    id: 'decorator',
    type: 'pattern',
    category: 'structural',
    title: 'Decorator',
    color: 'emerald',
    tagline: 'Attach new behaviours to objects dynamically',
    description: 'Decorator wraps an object in another object with the same interface, adding behaviour before or after delegating to the wrapped object. Multiple decorators can be stacked — each adds a thin layer of responsibility.',
    howItWorks: [
      'Define a Component interface that both the base object and decorators implement.',
      'Create a ConcreteComponent — the base object that does the actual work.',
      'Create a base Decorator class that holds a reference to a Component and delegates all calls to it.',
      'Create ConcreteDecorators that extend the base Decorator, adding behaviour before or after the delegation.',
      'Wrap the base component with one or more decorators at runtime.',
    ],
    whenToUse: [
      'You want to add responsibilities to individual objects without affecting others of the same class.',
      'Extending by subclassing is impractical because it would produce an explosion of subclasses.',
      'Behaviour needs to be combined freely at runtime.',
    ],
    participants: [
      { role: 'Component', desc: 'Interface for objects that can have responsibilities added dynamically.' },
      { role: 'ConcreteComponent', desc: 'The base object that defines the core behaviour.' },
      { role: 'Decorator', desc: 'Wraps a Component and conforms to the same interface.' },
      { role: 'ConcreteDecorator', desc: 'Adds behaviour before/after delegating to the wrapped Component.' },
    ],
    realWorldExamples: [
      'Coffee shop: a plain Coffee is decorated with Milk, then Sugar, then Vanilla — each adds cost and description.',
      "Java I/O streams: new BufferedReader(new FileReader(file)) — BufferedReader decorates FileReader.",
    ],
    leetcodeProblems: [],
  },
  {
    id: 'facade',
    type: 'pattern',
    category: 'structural',
    title: 'Facade',
    color: 'blue',
    tagline: 'Provide a simple interface to a complex subsystem',
    description: 'Facade provides a simplified interface to a complex body of code — a library, framework, or set of classes. Clients talk to the Facade instead of the subsystem directly. The subsystem is still there; it just gets accessed through a cleaner front door.',
    howItWorks: [
      'Identify a set of complex subsystem classes that clients must use together.',
      'Create a Facade class that exposes simple high-level methods.',
      'The Facade methods call the appropriate subsystem methods in the correct order.',
      'Clients use the Facade instead of working with the subsystem directly.',
      'The subsystem classes are still available for clients that need fine-grained access.',
    ],
    whenToUse: [
      'You want to provide a simple interface to a complex subsystem.',
      'You want to layer your system: a Facade defines the entry point to each layer.',
      'Clients only need a fraction of the subsystem\'s capabilities.',
    ],
    participants: [
      { role: 'Facade', desc: 'Provides convenient high-level methods. Delegates to subsystem objects.' },
      { role: 'Subsystem classes', desc: 'Implement subsystem functionality. Handle work assigned by Facade.' },
      { role: 'Client', desc: 'Uses the Facade instead of calling subsystem classes directly.' },
    ],
    realWorldExamples: [
      'A home theatre facade: watchMovie() turns on projector, dims lights, starts speakers, and plays the film — hiding six subsystem calls behind one method.',
      'A web framework\'s request/response cycle: one handle(request) call orchestrates routing, auth, middleware, and serialisation.',
    ],
    leetcodeProblems: [],
  },

  // ── Behavioral ──────────────────────────────────────────────────────────────
  {
    id: 'strategy',
    type: 'pattern',
    category: 'behavioral',
    title: 'Strategy',
    color: 'rose',
    tagline: 'Define a family of interchangeable algorithms',
    description: 'Strategy defines a family of algorithms, encapsulates each one, and makes them interchangeable. The context holds a reference to a strategy and delegates the algorithm to it — you can swap strategies at runtime without touching the context.',
    howItWorks: [
      'Identify the part of the code that varies (the algorithm) and isolate it.',
      'Define a Strategy interface with a single execute() method (or similar).',
      'Create ConcreteStrategy classes — one per algorithm variant.',
      'The Context class holds a Strategy reference and delegates the algorithm call to it.',
      'At runtime, inject the desired strategy into the Context.',
    ],
    whenToUse: [
      'You have multiple variants of an algorithm and want to switch between them at runtime.',
      'You want to eliminate conditionals that select different algorithm variants.',
      'A class has a behaviour that its subclasses should be able to override.',
    ],
    participants: [
      { role: 'Strategy', desc: 'Interface common to all supported algorithms.' },
      { role: 'ConcreteStrategy', desc: 'Implements the algorithm using the Strategy interface.' },
      { role: 'Context', desc: 'Maintains a reference to a Strategy and delegates to it.' },
    ],
    realWorldExamples: [
      'A sort widget: the same UI calls sort() — switching the strategy swaps between QuickSort, MergeSort, and BubbleSort.',
      'A payment system: the checkout Context delegates to a PayPalStrategy, CreditCardStrategy, or CryptoStrategy.',
    ],
    leetcodeProblems: [
      { id: '146', title: 'LRU Cache', difficulty: 'Medium', path: '/algorithms' },
    ],
  },
  {
    id: 'observer',
    type: 'pattern',
    category: 'behavioral',
    title: 'Observer',
    color: 'orange',
    tagline: 'One-to-many dependency — notify all watchers on change',
    description: "Observer defines a one-to-many dependency so that when one object (the Subject) changes state, all its dependents (Observers) are notified and updated automatically. It's the foundation of event systems and reactive programming.",
    howItWorks: [
      'The Subject maintains a list of observers and exposes subscribe() and unsubscribe() methods.',
      'When the Subject\'s state changes, it calls notify(), which iterates through observers and calls update() on each.',
      'Each Observer implements the Observer interface with an update() method.',
      'Observers pull the data they need from the Subject, or the Subject pushes it via the update() call.',
    ],
    whenToUse: [
      'A change in one object requires updating others, and you do not know how many objects need to change.',
      'Objects should be able to notify other objects without making assumptions about who they are.',
      'You are building an event system, pub/sub mechanism, or reactive data pipeline.',
    ],
    participants: [
      { role: 'Subject', desc: 'Maintains observer list. Calls notify() when state changes.' },
      { role: 'Observer', desc: 'Interface with an update() method.' },
      { role: 'ConcreteSubject', desc: 'Stores state of interest; sends notification when state changes.' },
      { role: 'ConcreteObserver', desc: 'Implements update() to keep state consistent with Subject.' },
    ],
    realWorldExamples: [
      'A news feed: subscribe to a topic, get notified when new articles are published.',
      'A spreadsheet: cells (observers) update automatically when a referenced cell (subject) changes value.',
    ],
    leetcodeProblems: [],
  },
  {
    id: 'state',
    type: 'pattern',
    category: 'behavioral',
    title: 'State',
    color: 'cyan',
    tagline: 'Change behaviour when internal state changes',
    description: 'State allows an object to alter its behaviour when its internal state changes. The object appears to change its class. Instead of large conditionals, each state is encapsulated in its own class — the Context simply delegates to its current state object.',
    howItWorks: [
      'Define a State interface with methods that vary by state.',
      'Create a ConcreteState class for each possible state — each implements the State interface.',
      'The Context holds a reference to the current state and delegates all state-dependent calls to it.',
      'State objects can transition the Context to a new state by calling context.setState().',
    ],
    whenToUse: [
      "An object's behaviour depends on its state and must change at runtime.",
      'You have large conditional statements that select behaviour based on state.',
      'State transitions are complex — each state has rules about which states it can move to.',
    ],
    participants: [
      { role: 'Context', desc: 'Maintains a reference to the current State. Delegates to it.' },
      { role: 'State', desc: 'Interface defining state-dependent behaviour.' },
      { role: 'ConcreteState', desc: 'Implements behaviour for a specific state. May trigger transitions.' },
    ],
    realWorldExamples: [
      'A vending machine: Idle → HasMoney → Dispensing → OutOfStock. Each state handles "insert coin" and "press button" differently.',
      'A traffic light: Red, Yellow, Green states each define how long to stay and what state comes next.',
    ],
    leetcodeProblems: [],
  },
  {
    id: 'command',
    type: 'pattern',
    category: 'behavioral',
    title: 'Command',
    color: 'indigo',
    tagline: 'Encapsulate a request as an object',
    description: 'Command encapsulates a request as an object, allowing you to parameterise clients with requests, queue or log them, and support undoable operations. The invoker fires commands without knowing their concrete class.',
    howItWorks: [
      'Define a Command interface with an execute() method (and optionally undo()).',
      'Create ConcreteCommand classes that hold a reference to a Receiver and implement execute() by calling receiver methods.',
      'The Invoker holds a Command and fires it at the right time — it never knows what the command does.',
      'The Receiver contains the actual business logic that the command triggers.',
      'To support undo, store a history stack of executed commands and call undo() in reverse.',
    ],
    whenToUse: [
      'You want to parameterise objects with operations.',
      'You need to queue operations, schedule their execution, or execute them remotely.',
      'You need reversible operations (undo/redo).',
    ],
    participants: [
      { role: 'Command', desc: 'Interface declaring execute() and optionally undo().' },
      { role: 'ConcreteCommand', desc: 'Implements Command; calls one or more Receiver methods.' },
      { role: 'Invoker', desc: 'Asks the command to execute. Does not know the concrete class.' },
      { role: 'Receiver', desc: 'Contains the real business logic triggered by execute().' },
    ],
    realWorldExamples: [
      'A text editor: each keystroke creates a Command (InsertCommand, DeleteCommand) pushed onto a history stack — Ctrl+Z pops and calls undo().',
      'A restaurant order: the waiter (Invoker) takes an order slip (Command) to the kitchen (Receiver) — the cook does the work.',
    ],
    leetcodeProblems: [
      { id: '1472', title: 'Design Browser History', difficulty: 'Medium', path: '/algorithms' },
    ],
  },
  {
    id: 'template-method',
    type: 'pattern',
    category: 'behavioral',
    title: 'Template Method',
    color: 'pink',
    tagline: 'Define a skeleton algorithm, defer steps to subclasses',
    description: 'Template Method defines the skeleton of an algorithm in a base class, deferring some steps to subclasses. Subclasses can override specific steps without changing the algorithm\'s overall structure.',
    howItWorks: [
      'Define the invariant algorithm steps as concrete methods in the base class.',
      'Declare the varying steps as abstract (or empty hook) methods.',
      'The template method calls all steps in order — concrete steps run directly; abstract steps are implemented by subclasses.',
      'Subclasses override only the steps they need to customise.',
    ],
    whenToUse: [
      'Multiple classes share the same algorithm structure but differ in specific steps.',
      "You want to enforce the algorithm's sequence while allowing subclasses to vary individual steps.",
      'You want to avoid code duplication by pulling shared behaviour into a base class.',
    ],
    participants: [
      { role: 'AbstractClass', desc: 'Defines the template method and declares abstract primitive operations.' },
      { role: 'ConcreteClass', desc: 'Implements the primitive operations to carry out subclass-specific steps.' },
    ],
    realWorldExamples: [
      'A data mining framework: the template method calls openFile(), extractData(), parseData(), and report() — subclasses override extractData() for CSV vs XML.',
      'A game: Game.play() calls initialize(), startPlay(), and endPlay(). Cricket and Football override each differently.',
    ],
    leetcodeProblems: [],
  },
]

// ── Interview Questions ───────────────────────────────────────────────────────

export const OOD_QUESTIONS = [
  {
    id: 'design-parking-lot',
    type: 'question',
    category: 'question',
    title: 'Design a Parking Lot',
    color: 'sky',
    difficulty: 'Medium',
    tagline: 'Model spots, vehicles, and fees in a multi-level car park',
    description: 'Design an object-oriented system for a multi-level parking lot that can handle different vehicle types, track spot availability, process entry/exit, and calculate fees.',
    requirements: [
      'Support multiple parking levels, each with multiple spots.',
      'Handle different vehicle sizes: Motorcycle, Car, Bus.',
      'Track which spots are occupied and find an available spot for a given vehicle.',
      'On entry, issue a ticket with timestamp and spot assignment.',
      'On exit, calculate the fee based on duration and vehicle type.',
    ],
    keyClasses: [
      { name: 'ParkingLot', desc: 'Entry point. Manages levels, issues tickets, calculates fees.' },
      { name: 'ParkingLevel', desc: 'One floor. Contains a list of ParkingSpots.' },
      { name: 'ParkingSpot', desc: 'A single space. Knows its size and whether it is occupied.' },
      { name: 'Vehicle', desc: 'Abstract base. Subtypes: Motorcycle, Car, Bus.' },
      { name: 'Ticket', desc: 'Records vehicle, spot, entry time. Used to compute fee on exit.' },
      { name: 'FeeCalculator', desc: 'Strategy — different rates per vehicle type.' },
    ],
    patternsUsed: ['Singleton (ParkingLot)', 'Strategy (FeeCalculator)', 'Factory Method (Vehicle creation)'],
    hints: [
      'Use an enum for SpotSize (SMALL, MEDIUM, LARGE) and match it to VehicleSize.',
      'ParkingLot.findSpot(vehicle) scans levels top-to-bottom for the first available matching spot.',
      'The fee calculation is a Strategy — swap in HourlyFee or FlatFee without touching ParkingLot.',
    ],
  },
  {
    id: 'design-atm',
    type: 'question',
    category: 'question',
    title: 'Design an ATM',
    color: 'violet',
    difficulty: 'Medium',
    tagline: 'Model card authentication, cash dispensing, and transactions',
    description: 'Design an ATM system that authenticates users, supports balance enquiry, cash withdrawal, and deposit, and handles error cases like insufficient funds and invalid PIN.',
    requirements: [
      'Accept a card and validate PIN (max 3 attempts, then lock card).',
      'Support: check balance, withdraw cash, deposit cash.',
      'Withdrawal must verify sufficient funds and available cash in the machine.',
      'Print a receipt or display a transaction summary.',
      'Handle network failure (offline state) gracefully.',
    ],
    keyClasses: [
      { name: 'ATM', desc: 'Entry point. Orchestrates the session — delegates to CashDispenser, Bank.' },
      { name: 'Card / Account', desc: 'Represents the user\'s bank card and linked account.' },
      { name: 'CashDispenser', desc: 'Tracks notes available. Dispenses cash using a greedy algorithm.' },
      { name: 'Transaction', desc: 'Abstract base. Subtypes: Withdrawal, Deposit, BalanceEnquiry.' },
      { name: 'Bank', desc: 'External service — validates PIN and processes transactions.' },
      { name: 'ATMState', desc: 'State machine: Idle → HasCard → Authenticated → TransactionDone.' },
    ],
    patternsUsed: ['State (ATM session flow)', 'Command (Transaction types)', 'Singleton (ATM)'],
    hints: [
      'Model ATM as a State machine: each state only allows certain operations.',
      'CashDispenser counts notes greedily (100s first, then 50s, 20s, 10s).',
      'Transaction is a Command — execute(), and optionally reverse() for rollback.',
    ],
  },
  {
    id: 'design-library',
    type: 'question',
    category: 'question',
    title: 'Design a Library System',
    color: 'emerald',
    difficulty: 'Medium',
    tagline: 'Catalog books, manage members, and track borrowing',
    description: 'Design a library management system that maintains a catalog of books, manages member accounts, handles borrowing and returns, and enforces lending rules.',
    requirements: [
      'Store a catalog of books with title, author, ISBN, and copies available.',
      'Register members and track their borrowed books.',
      'Allow a member to borrow a book (if available and under their limit).',
      'Handle returns, compute and collect overdue fines.',
      'Search the catalog by title, author, or ISBN.',
    ],
    keyClasses: [
      { name: 'Library', desc: 'Facade — entry point for all operations.' },
      { name: 'BookItem', desc: 'A physical copy of a book. Tracks availability and due date.' },
      { name: 'Book', desc: 'Metadata: title, author, ISBN. May have many BookItems.' },
      { name: 'Member', desc: 'Registered user. Holds a list of active loans.' },
      { name: 'Loan', desc: 'Records which Member borrowed which BookItem and when.' },
      { name: 'FineCalculator', desc: 'Calculates overdue fee based on days late.' },
    ],
    patternsUsed: ['Facade (Library)', 'Strategy (FineCalculator)', 'Observer (notify member on availability)'],
    hints: [
      'Book (metadata) and BookItem (physical copy) are separate — one Book can have many BookItems.',
      'Use an Observer so members on a waitlist get notified when a copy is returned.',
      'FineCalculator is a Strategy — swap policies (flat rate vs. per-day) without changing Loan.',
    ],
  },
  {
    id: 'design-vending-machine',
    type: 'question',
    category: 'question',
    title: 'Design a Coffee Vending Machine',
    color: 'amber',
    difficulty: 'Easy',
    tagline: 'State machine for coin insertion, selection, and dispensing',
    description: 'Design a vending machine that accepts coins, allows selection of drinks, dispenses the product and change, and handles out-of-stock and insufficient-funds conditions.',
    requirements: [
      'Accept coins of different denominations.',
      'Display available products and their prices.',
      'Allow the user to select a product.',
      'Dispense the product and return change if overpaid.',
      'Handle: out-of-stock, insufficient funds, and cancel/refund.',
    ],
    keyClasses: [
      { name: 'VendingMachine', desc: 'Context for the State machine. Manages inventory and balance.' },
      { name: 'VendingState', desc: 'Interface: insertCoin(), selectProduct(), dispense(), cancel().' },
      { name: 'IdleState / HasMoneyState / DispensingState', desc: 'Concrete states — each handles requests differently.' },
      { name: 'Product', desc: 'Name, price, quantity.' },
      { name: 'CoinSlot', desc: 'Tracks inserted amount; returns change.' },
    ],
    patternsUsed: ['State (machine flow)', 'Singleton (VendingMachine)', 'Strategy (change-dispensing algorithm)'],
    hints: [
      'The State pattern eliminates the nested if/else that switches on the machine\'s current mode.',
      'InsertCoin is only valid in IdleState and HasMoneyState — all other states reject it.',
      'Change dispensing is a greedy algorithm — a great Strategy to swap.',
    ],
  },
  {
    id: 'design-bookstore',
    type: 'question',
    category: 'question',
    title: 'Design an Online Bookstore',
    color: 'teal',
    difficulty: 'Hard',
    tagline: 'Catalog, cart, checkout, and order management',
    description: 'Design the core classes for an online bookstore covering product catalog, shopping cart, checkout with multiple payment methods, and order tracking.',
    requirements: [
      'Maintain a catalog of books with search by title, author, genre, or ISBN.',
      'Allow users to add items to a cart, update quantities, and remove items.',
      'Support multiple payment methods: credit card, PayPal, gift card.',
      'Process checkout: validate cart, charge payment, reduce inventory.',
      'Track order status: Placed → Processing → Shipped → Delivered.',
    ],
    keyClasses: [
      { name: 'Catalog', desc: 'Manages the book inventory. Supports search and availability checks.' },
      { name: 'ShoppingCart', desc: 'Holds CartItems. Computes total. Associated with a User session.' },
      { name: 'Order', desc: 'Created from a Cart. Tracks status and payment.' },
      { name: 'PaymentProcessor', desc: 'Strategy interface. Concrete: CreditCardProcessor, PayPalProcessor.' },
      { name: 'Notification', desc: 'Observer — sends email/SMS when order status changes.' },
    ],
    patternsUsed: ['Strategy (PaymentProcessor)', 'Observer (order status notifications)', 'State (Order lifecycle)', 'Facade (Checkout)'],
    hints: [
      'Checkout is a Facade — it orchestrates cart validation, payment, inventory update, and order creation.',
      'Order status is a classic State machine — each status controls which transitions are allowed.',
      'PaymentProcessor is a Strategy — adding a new payment method adds one class without touching Checkout.',
    ],
  },
  {
    id: 'design-restaurant',
    type: 'question',
    category: 'question',
    title: 'Design a Restaurant Order System',
    color: 'rose',
    difficulty: 'Medium',
    tagline: 'Tables, menus, orders, and kitchen workflow',
    description: 'Design an OOD system for a restaurant that handles table management, menu browsing, order taking, kitchen queuing, billing, and payment.',
    requirements: [
      'Manage tables: assign to guests, track occupancy.',
      'Maintain a menu with categories, items, and pricing.',
      'Servers take orders for a table; orders can be modified before submission.',
      'Orders are sent to the kitchen queue; kitchen staff mark items as ready.',
      'Generate a bill for a table with itemised totals and tax.',
    ],
    keyClasses: [
      { name: 'Restaurant', desc: 'Facade. Entry point for seating, ordering, and billing.' },
      { name: 'Table', desc: 'Number of seats, current status, active Order.' },
      { name: 'MenuItem', desc: 'Name, price, category, availability.' },
      { name: 'Order', desc: 'Belongs to a Table. Contains OrderItems. Tracks status.' },
      { name: 'KitchenQueue', desc: 'Observer pattern — receives orders, notifies servers when ready.' },
      { name: 'Bill', desc: 'Aggregates Order items, applies tax, records payment.' },
    ],
    patternsUsed: ['Facade (Restaurant)', 'Observer (KitchenQueue → Server notification)', 'Command (Order modifications)', 'State (Order status)'],
    hints: [
      'Order status (Placed → InKitchen → Ready → Served → Billed) is a State machine.',
      'Observer: Kitchen notifies the server\'s display when an item is ready.',
      'Command: each modification to an order (add item, remove item) is a Command — supports undo before submission.',
    ],
  },
]

// ── Combined export ───────────────────────────────────────────────────────────

export const OOD_ITEMS = [...OOD_PATTERNS, ...OOD_QUESTIONS]
