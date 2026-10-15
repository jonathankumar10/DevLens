// ── AI Registry ───────────────────────────────────────────────────────────────
// All AI learning topics defined inline.
// Categories: history | ml | llms | workflows | agents | production | live-coding

import { PALETTE } from './palette'

export const LIVE_CODING_AI_GUIDE = {
  claudeMd: [
    'Create CLAUDE.md in the project root the moment you have a directory. It is a plain markdown file Claude reads as context on every prompt.',
    'Minimum contents: (1) tech stack + versions, (2) your full DB schema with column names and types, (3) key business rules or constraints, (4) what you want help with this session.',
    'Include the schema early even if it changes. Later you can say "Update CLAUDE.md: add a batch_id UUID column to the tasks table" and Claude will stay in sync.',
    'Keep it under ~150 lines — CLAUDE.md is injected into every request. A long file costs tokens and dilutes relevance. Omit comments, examples, and anything derivable from the code.',
    'Starter template: "# Project\\nFastAPI + Postgres. Python 3.12.\\n\\n## Schema\\ntable_a(id UUID PK, ...)\\ntable_b(id UUID PK, ...)\\n\\n## Rules\\n- Store money as integer cents\\n- All mutations must be atomic"',
  ],
  planMode: [
    'Trigger plan mode before writing any code: in Claude Code type /plan, or prompt "Think through this step by step and show me a plan before writing any code."',
    'Use plan mode for the first endpoint: "Plan POST /chat: what DB queries run, what the LLM call looks like, what gets persisted, and what is returned. Do not write code yet."',
    'Narrate the plan to your interviewer. Say which parts you agree with and which you would change. This shows you are directing Claude, not just accepting its output.',
    'Correct the plan before code lands: "The plan calls the LLM before inserting the user message — reverse those steps." Fixing a plan takes 5 seconds; fixing generated code takes 5 minutes.',
    'Re-invoke plan mode when scope changes: "We are adding streaming. Update the plan for POST /chat to use SSE instead of a single JSON response."',
  ],
  prompting: [
    'Be specific and supply context: include the relevant schema, the function signature you want, the library to use, and the exact constraint to enforce. Vague prompts produce generic code.',
    'One task per prompt: schema first → base CRUD → LLM integration → streaming. Asking Claude to write the whole app in one shot produces unreviewed, stitched-together code.',
    'Ask for trade-offs before making decisions: "Should I use a junction table or a Postgres TEXT[] array for tags? Two-sentence trade-off." Use Claude\'s answer as things to say to the interviewer.',
    'When Claude writes something you do not understand, ask immediately: "What does FOR UPDATE do here and when would I omit it?" Interviewers ask about any line you submit.',
    'Validate output before running: read each function Claude writes and confirm it matches your schema, uses the right library methods, and handles the edge case you just discussed.',
  ],
}

export const AI_CATEGORY_LABELS = {
  history:      'History & Foundations',
  ml:           'Core ML',
  llms:         'LLMs & Transformers',
  workflows:    'AI Workflows',
  agents:       'AI Agents',
  production:   'Production & Evaluation',
  'live-coding': 'Live Coding Interviews',
}

export const AI_COLORS = PALETTE

export const AI_ITEMS = [
  // ── History & Foundations ────────────────────────────────────────────────────
  {
    id:       'ai-history',
    category: 'history',
    title:    'The History of AI',
    color:    'amber',
    tagline:  'From Turing\'s vision to the deep learning revolution',
    description:
      'AI has a history spanning over 70 years — punctuated by periods of explosive optimism, brutal funding winters, and unexpected breakthroughs. Understanding this arc gives context to why modern deep learning emerged when it did and why past failures happened.',
    howItWorks: [
      '1950 — Alan Turing publishes "Computing Machinery and Intelligence", proposing the Imitation Game as a test for machine intelligence.',
      '1956 — The Dartmouth Conference coins the term "Artificial Intelligence". Researchers predict human-level AI within 20 years.',
      '1970s–80s — First AI winter: results fell far short of promises, leading to massive funding cuts from governments and industry.',
      '1980s — Expert systems briefly revive AI interest, encoding human knowledge as hand-crafted rules. The second winter follows when they prove too brittle.',
      '2012 — AlexNet wins the ImageNet challenge by a huge margin using deep convolutional networks on GPUs, igniting the modern deep learning era.',
      '2017 — "Attention Is All You Need" introduces the Transformer architecture, which becomes the foundation of every major LLM — GPT, BERT, Gemini, and beyond.',
    ],
    keyPoints: [
      'AI has gone through at least two "winters" where funding dried up after overpromised results — hype cycles are a recurring pattern.',
      'Deep learning\'s 2012 breakthrough required three things aligning: large datasets (ImageNet), powerful GPUs, and improved training techniques.',
      'The Transformer (2017) is arguably the most influential ML paper of the decade — nearly all frontier AI today builds on it.',
      'Modern AI is powerful pattern matching at massive scale — it does not reason the way humans do.',
      'The distinction: AI is the broad field; ML is learning from data; deep learning is ML using deep neural networks.',
    ],
    interviewAngles: [
      'What is the difference between AI, machine learning, and deep learning?',
      'Why did deep learning succeed in the 2010s when earlier neural networks had failed?',
      'What is the Turing test, and why do modern researchers largely move past it?',
      'What caused the AI winters, and could another one happen?',
    ],
  },

  // ── Core ML ──────────────────────────────────────────────────────────────────
  {
    id:       'neural-networks',
    category: 'ml',
    title:    'Neural Networks',
    color:    'blue',
    tagline:  'Layers of weighted connections that learn by example',
    description:
      'A neural network is a stack of layers, each transforming its input into a richer representation. By repeatedly adjusting connection weights to reduce prediction error, the network learns to recognise patterns — without being explicitly programmed with rules.',
    howItWorks: [
      'The input layer receives raw features: pixel values, word embeddings, or sensor readings.',
      'Each neuron in a hidden layer computes a weighted sum of its inputs, adds a bias term, then passes the result through a nonlinear activation function (e.g. ReLU).',
      'Multiple hidden layers progressively extract higher-level features — early layers detect edges, later layers detect shapes, the final layers detect objects.',
      'The output layer produces predictions: class probabilities (softmax) for classification, or a continuous value for regression.',
      'A loss function measures how wrong the predictions are — cross-entropy for classification, MSE for regression.',
      'Backpropagation uses the chain rule to compute gradients; gradient descent updates every weight in the direction that reduces loss.',
    ],
    keyPoints: [
      'Depth (more layers) allows hierarchical feature learning — each layer builds on the previous one.',
      'Activation functions (ReLU, sigmoid, tanh) give networks the ability to model non-linear relationships; without them, stacking layers is mathematically identical to one layer.',
      'Overfitting means the network memorised training data instead of generalising — addressed with dropout, regularisation, and more data.',
      'Vanishing gradients in deep networks make training hard; ReLU activations and residual connections (skip connections) are the standard fix.',
    ],
    interviewAngles: [
      'What is the role of the activation function? Why is ReLU preferred over sigmoid in hidden layers?',
      'What is the vanishing gradient problem, and how do residual connections address it?',
      'Walk me through a complete forward pass and backward pass for a simple network.',
      'What is the difference between batch, mini-batch, and stochastic gradient descent?',
    ],
  },
  {
    id:       'training-and-loss',
    category: 'ml',
    title:    'Training & Loss',
    color:    'emerald',
    tagline:  'How a model learns by measuring and shrinking its mistakes',
    description:
      'Training is the iterative process of adjusting a model\'s parameters so its predictions get closer to the correct answers. The loss function quantifies how wrong the model is; gradient descent is the algorithm that moves parameters in the direction that reduces loss.',
    howItWorks: [
      'Initialise all weights randomly (or with a smart scheme like Xavier/He initialisation).',
      'Forward pass: feed a batch of training examples through the network and compute predictions.',
      'Compute the loss: compare predictions to true labels using a loss function (cross-entropy or MSE).',
      'Backward pass: apply the chain rule to compute the gradient of the loss with respect to every weight.',
      'Weight update: move each weight a small step opposite to its gradient — the step size is the learning rate.',
      'Repeat for many batches across many epochs; monitor validation loss to detect overfitting and stop early if needed.',
    ],
    keyPoints: [
      'The learning rate is the most critical hyperparameter — too high causes divergence, too low means training never converges.',
      'Mini-batch gradient descent (16–512 samples per batch) balances computational efficiency with gradient quality.',
      'Regularisation techniques (dropout, L2 weight decay, early stopping) combat overfitting.',
      'The train/validation/test split is essential: train on one set, tune hyperparameters on another, report final metrics on the held-out test set.',
      'Adam optimiser combines adaptive learning rates with momentum — it is the default starting point for most modern training runs.',
    ],
    interviewAngles: [
      'What is the difference between gradient descent, SGD, and Adam?',
      'Why do we need a validation set in addition to a test set?',
      'What is overfitting and what are three techniques to prevent it?',
      'What happens if the learning rate is too large? Too small?',
    ],
  },

  // ── LLMs & Transformers ───────────────────────────────────────────────────────
  {
    id:       'transformer-architecture',
    category: 'llms',
    title:    'The Transformer',
    color:    'violet',
    tagline:  'The architecture behind every modern LLM',
    description:
      'The Transformer replaced recurrent networks for sequence modelling by processing all tokens in parallel using self-attention. Introduced in "Attention Is All You Need" (Vaswani et al., 2017), it became the foundation of BERT, GPT, and every major language model today.',
    howItWorks: [
      'Input text is split into tokens and each token is converted to a dense embedding vector.',
      'Positional encodings are added to the embeddings to give the model a sense of token order — since attention itself is permutation-invariant.',
      'Each Transformer block runs multi-head self-attention: every token simultaneously attends to every other token to gather context.',
      'A position-wise feed-forward network then processes each token\'s attended representation independently.',
      'Residual connections (skip connections) and layer normalisation wrap each sub-layer, enabling stable training of very deep stacks.',
      'Encoder-only models (BERT) process the full sequence bidirectionally; decoder-only models (GPT) generate token-by-token with causal masking.',
    ],
    keyPoints: [
      'Self-attention has O(n²) computational complexity with sequence length — a key scalability challenge for very long contexts.',
      '"Multi-head" means running attention in parallel with different learned projections, each capturing different linguistic relationships.',
      'Pre-training on a massive text corpus followed by fine-tuning (or prompting) on a specific task is the standard recipe.',
      'The Transformer parallelises perfectly across GPU cores — this is the key reason scale works so well.',
    ],
    interviewAngles: [
      'What is the difference between encoder-only, decoder-only, and encoder-decoder Transformers? Give an example of each.',
      'Why can\'t Transformers handle infinitely long sequences without modification?',
      'How does positional encoding convey order when attention itself is permutation-invariant?',
      'What is the computational bottleneck of the Transformer at long contexts?',
    ],
  },
  {
    id:       'attention-mechanism',
    category: 'llms',
    title:    'The Attention Mechanism',
    color:    'indigo',
    tagline:  'Every token learns which other tokens matter for understanding it',
    description:
      'Attention lets each position in a sequence look at all other positions and decide how much to "attend" to each one. It is the core innovation that makes Transformers powerful — instead of compressing context into a fixed vector, attention directly weights every relevant piece.',
    howItWorks: [
      'For each token, three vectors are computed via learned linear projections: Query (Q), Key (K), and Value (V).',
      'The Query represents "what am I looking for?" and each Key represents "what information do I contain?"',
      'Dot products between the Query and all Keys produce raw attention scores — a high score means high relevance.',
      'Scores are scaled by dividing by √d_k (the key dimension) to prevent softmax saturation in high dimensions, then passed through softmax to produce weights.',
      'The final output is a weighted sum of all Value vectors, using the softmax weights — semantically: borrow information proportionally from relevant tokens.',
      'Multi-head attention runs this entire process in parallel H times with different learned projections, then concatenates the results.',
    ],
    keyPoints: [
      'The formula: Attention(Q, K, V) = softmax(QK^T / √d_k) × V',
      'Long-range dependencies are captured trivially — unlike RNNs, there is no distance-based vanishing gradient.',
      'Masked (causal) attention prevents tokens from attending to future positions during autoregressive generation.',
      'Cross-attention (used in encoder-decoder models) lets one sequence attend to a different sequence — e.g., a translation query attending to the source sentence.',
    ],
    interviewAngles: [
      'Why do we scale by √d_k before the softmax?',
      'What is the difference between self-attention and cross-attention?',
      'What is the computational complexity of self-attention? How does it scale with sequence length?',
      'What does "multi-head" add over single-head attention?',
    ],
  },

  // ── LLMs & Transformers (continued) ─────────────────────────────────────────
  {
    id:       'tokenization',
    category: 'llms',
    title:    'Tokenization',
    color:    'amber',
    tagline:  'How raw text becomes the units an LLM actually reads',
    description:
      'LLMs do not operate on characters or words — they operate on tokens, subword units produced by a tokenizer trained alongside the model. Understanding tokenization explains why LLMs struggle with character counting, fail on unusual words, and cost money proportional to token count rather than word count.',
    howItWorks: [
      'The tokenizer scans the training corpus and learns a vocabulary of 50k–130k subword pieces using Byte-Pair Encoding (BPE) or Unigram LM. BPE starts with individual bytes, then repeatedly merges the most frequent adjacent pair into a new token until the target vocabulary size is reached.',
      'At inference time, raw text is split into the longest matching tokens from the vocabulary — producing a sequence of integer IDs that the model\'s embedding layer looks up to get dense vectors.',
      'Common English words typically map to a single token; rare words, misspellings, and non-English text split into many tokens. "Unforgettable" → 1 token; "Ünforgêttable" → 8+ tokens.',
      'Special tokens frame the conversation: <|system|>, <|user|>, <|assistant|>, <|endoftext|> signal role boundaries and sequence termination. These are injected by the model\'s chat template, not by your prompt.',
      'The model generates one token at a time — sampling from the probability distribution over the entire vocabulary until it produces an end-of-sequence token or hits max_tokens.',
      'Different models use different tokenizers with different vocabulary boundaries — a prompt that fits in GPT-4\'s 128k context may not fit Claude\'s due to different tokenization of the same text.',
    ],
    keyPoints: [
      'Token count ≠ word count — expect roughly 1.3–1.5 tokens per English word, more for code, JSON, and non-Latin scripts',
      'Tokenization explains LLM "blindspots": counting characters, reversing strings, and spotting rhymes all require character-level access that tokenization obscures',
      'API pricing is per token (input + output) — tokenization directly drives your bill. OpenAI\'s tokenizer playground lets you estimate costs before building',
      'GPT-4 uses the cl100k_base tokenizer (~100k vocab); Llama 3 uses ~128k; different boundaries mean the same text produces different token counts across models',
    ],
    interviewAngles: [
      'Why can\'t LLMs easily count the number of "r"s in "strawberry"?',
      'What is BPE and why is it used instead of splitting on whitespace?',
      'How does tokenization affect cost estimation for an LLM application?',
      'What are special tokens and why do they matter for chat models?',
    ],
  },
  {
    id:       'context-windows',
    category: 'llms',
    title:    'Context Windows',
    color:    'sky',
    tagline:  'The model\'s working memory — everything it can see at once',
    description:
      'A context window is the total number of tokens a model can process in a single forward pass — its entire input (system prompt, history, retrieved docs, tool outputs) combined. Text beyond the limit is simply not seen. Context window management is one of the most practical engineering challenges when building LLM-powered applications.',
    howItWorks: [
      'Every LLM call receives the full context — system prompt, conversation history, retrieved documents, tool outputs — all concatenated into one token sequence before the model processes any of it.',
      'The attention mechanism computes relationships between every token pair: this is why context limits exist. Attention is O(n²) in sequence length, so doubling context quadruples compute.',
      'Modern models have pushed limits from 4k tokens (GPT-3) to 128k (GPT-4 Turbo) and beyond (Gemini 1.5 Pro at 1M tokens). The KV-cache stores attention keys/values for already-processed tokens, making subsequent generation cheaper but still charging for full input tokens on every call.',
      '"Lost in the middle" — research shows model attention degrades for information in the middle of very long contexts. Models attend strongest to the beginning (system prompt) and end (most recent message). Put critical instructions at the start and repeat them before the final user turn.',
      'Strategies for long content: chunking (split docs into segments for RAG), sliding window (drop oldest turns as conversation grows), summarization (compress old turns into a running summary), and hierarchical RAG (retrieve only relevant chunks rather than injecting full documents).',
      'Context matters for cost: most providers charge per input token on every call. A 100k-token context window costs 25× more per call than 4k — even when only a handful of new tokens were added in the latest turn.',
    ],
    keyPoints: [
      'The context window is not memory — the model has no state between API calls. Every call starts fresh; all context must be re-sent every time',
      '"Lost in the middle" is a real reliability issue — place the most important instructions in the system prompt and repeat critical constraints immediately before the final user message',
      'KV-cache makes sequential token generation fast, but prompt caching (Anthropic, OpenAI) is a separate feature that lets providers re-use cached prefix tokens, reducing both latency and cost for repeated system prompts',
      'Larger context windows increase cost and latency proportionally — do not default to maximum context. Use RAG to retrieve only what is relevant rather than injecting entire knowledge bases',
    ],
    interviewAngles: [
      'What happens when a conversation exceeds the context window?',
      'How would you handle a 50-page document that needs to be processed by an LLM?',
      'What is the "lost in the middle" problem and how do you mitigate it in production?',
      'Why does a larger context window make each API call more expensive even for short new messages?',
    ],
  },
  {
    id:       'llm-inference',
    category: 'llms',
    title:    'LLM Inference & Sampling',
    color:    'emerald',
    tagline:  'How temperature, top-p, and top-k control what the model says next',
    description:
      'LLMs generate text by predicting one token at a time, sampling from a probability distribution over the entire vocabulary. The sampling strategy dramatically affects output quality: temperature controls randomness, top-p and top-k limit the candidate pool, and greedy decoding picks the single most likely token. Understanding these parameters lets you tune models for deterministic reliability or creative diversity.',
    howItWorks: [
      'At each generation step, the model\'s final layer produces logits — raw unnormalized scores over every token in the vocabulary (50k–130k values). Higher logits mean higher predicted probability for that token.',
      'Temperature scales the logits before softmax: T=1.0 gives the model\'s raw distribution; T<1 (e.g., 0.2) sharpens it, making the most likely token overwhelmingly dominant; T>1 flattens it, increasing randomness and creativity.',
      'Top-k sampling restricts sampling to the k most probable tokens (e.g., k=40). All tokens outside the top-k are zeroed before sampling, preventing very unlikely tokens from ever being chosen regardless of temperature.',
      'Top-p (nucleus) sampling is adaptive: include the smallest set of tokens whose cumulative probability exceeds p (e.g., 0.9). When one token dominates, the candidate pool shrinks; when probabilities are spread out, it expands. More robust than top-k across diverse prompts.',
      'Greedy decoding always picks the single highest-probability token. Fast and deterministic but often produces repetitive, locally-optimal text that loops or plateau-states on complex tasks. Setting temperature near 0 approximates greedy.',
      'Max tokens (max_completion_tokens) sets a hard output length cap — the model stops at this limit even mid-sentence. Never use it as a safety valve for cost; cost is in the input. Use it to enforce conciseness in structured output tasks.',
    ],
    keyPoints: [
      'Temperature=0 for factual, deterministic tasks (code generation, structured extraction); temperature 0.7–1.0 for creative writing and brainstorming',
      'Top-p=0.9 and top-k=40 are common production defaults — they prevent nonsensical tokens while preserving meaningful variety',
      'Setting temperature > 0 makes responses non-deterministic — identical prompts produce different outputs. Use temperature=0 in eval pipelines to get reproducible results',
      'Time-to-first-token (TTFT) is the latency users feel most acutely. Streaming responses (server-sent events) lets you display tokens as they are generated rather than waiting for the full completion',
    ],
    interviewAngles: [
      'What does temperature do to LLM output? When would you use low vs. high temperature?',
      'What is the difference between top-k and top-p sampling? Which is more robust?',
      'Why is greedy decoding often a poor choice for long-form generation?',
      'What is time-to-first-token and why does it matter for user experience?',
    ],
  },
  {
    id:       'multimodal-models',
    category: 'llms',
    title:    'Multimodal Models',
    color:    'indigo',
    tagline:  'Models that see, hear, and generate across text, images, and audio',
    description:
      'Multimodal AI models process and generate content across multiple data types — text, images, audio, and video — within a unified architecture. Vision-language models like GPT-4o, Claude 3, and Gemini answer questions about images, extract structured data from documents, and describe visual content. Separate generative models produce images, speech, and video from text prompts.',
    howItWorks: [
      'Vision-language models add an image encoder (typically a Vision Transformer — ViT) to the standard LLM. The image is split into fixed-size patches, each patch encoded into an embedding vector, and these image embeddings are concatenated with text token embeddings before the transformer processes them together.',
      'For document understanding, the model receives an image of a scanned page and outputs structured text — useful for invoices, contracts, and forms that cannot be reliably parsed with traditional OCR alone, since the model understands layout and context.',
      'Text-to-image models (DALL-E 3, Stable Diffusion, Midjourney) use diffusion — starting from random noise and iteratively denoising toward an image that matches the text prompt. CLIP aligns text and image embeddings in a shared vector space, letting the denoising process steer toward semantically matching images.',
      'Speech-to-text models (Whisper) convert audio waveforms to spectrograms, encode them as sequence embeddings, then autoregressively decode the transcript. Text-to-speech models reverse this: predict mel-spectrogram frames from text, then convert to audio with a neural vocoder.',
      'Native multimodality vs. pipeline: early systems chained separate models (OCR → text → LLM). Native multimodal models (GPT-4o, Gemini) process raw pixels and audio end-to-end, enabling richer cross-modal reasoning rather than cascading errors from one model to the next.',
      'Current limitations: vision models hallucinate image content — they describe objects not present. They struggle with precise spatial reasoning ("is the red box left or right of the blue circle?"). Image generation cannot reliably render text within images.',
    ],
    keyPoints: [
      'Vision-language models unlock document AI at scale: extract structured fields from invoices, PDFs, and screenshots without custom OCR + rule-based parsing pipelines',
      'CLIP embeddings make images and text comparable in the same vector space — used in semantic image search ("find photos of rainy city streets") without requiring keyword metadata on every image',
      'GPT-4o is natively multimodal — it processes tokens from all modalities in a single model rather than routing through separate specialized models stitched together',
      'For image generation, descriptive prompts outperform short ones. Negative prompts tell diffusion models what to exclude — "no text overlay, no watermarks" improves output quality significantly',
    ],
    interviewAngles: [
      'How does a vision-language model combine image understanding with text generation?',
      'What is CLIP and what made it foundational for multimodal AI?',
      'When would you use a vision model instead of a traditional OCR pipeline?',
      'What are the current limitations of multimodal models for production document processing?',
    ],
  },

  // ── AI Workflows ─────────────────────────────────────────────────────────────
  {
    id:       'prompt-engineering',
    category: 'workflows',
    title:    'Prompt Engineering',
    color:    'sky',
    tagline:  'Craft inputs that reliably produce the outputs you need',
    description:
      'Prompt engineering is the practice of designing inputs to an LLM to reliably elicit high-quality, correct outputs. Because LLMs are highly sensitive to phrasing, context, and structure, well-crafted prompts can dramatically outperform naive ones — often closing the gap between a fine-tuned model and a general one.',
    howItWorks: [
      'Zero-shot: simply describe the task in plain language and let the model infer the format and approach from its training.',
      'Few-shot: provide 2–5 worked examples in the prompt; the model continues the pattern with impressive accuracy on structured tasks.',
      'Chain-of-thought (CoT): add "think step by step" or show step-by-step reasoning examples; forces explicit intermediate steps and significantly improves accuracy on reasoning tasks.',
      'System / user / assistant roles: separate long-term instructions (system), the user\'s request, and the model\'s previous turn — keeping context clean and consistent.',
      'Structured output: use JSON mode, tool calling, or XML tags to constrain the model to machine-readable formats.',
      'Temperature and top-p: lower temperature (0.1–0.3) for deterministic factual answers; higher (0.7–1.0) for creative generation.',
    ],
    keyPoints: [
      'Models are stateless between API calls — all context must be re-supplied in every request.',
      'Chain-of-thought prompting can turn a wrong answer into a correct one on math, logic, and multi-step reasoning tasks.',
      'Telling the model "say I don\'t know if you\'re uncertain" measurably reduces hallucinations.',
      'Token limits are hard constraints — very long prompts can silently truncate important context (or fail entirely).',
      'Prompt injection: malicious input that hijacks the model\'s instructions is a real security concern in user-facing apps.',
    ],
    interviewAngles: [
      'What is the difference between zero-shot, few-shot, and chain-of-thought prompting?',
      'How would you reduce hallucinations in an LLM-powered product?',
      'What is a system prompt and why does it matter for production AI apps?',
      'How would you evaluate whether one prompt is better than another?',
    ],
  },
  {
    id:       'rag',
    category: 'workflows',
    title:    'Retrieval-Augmented Generation',
    color:    'teal',
    tagline:  'Ground LLM answers in retrieved, up-to-date documents',
    description:
      'RAG solves two fundamental LLM limitations — hallucination and knowledge cutoffs — by fetching relevant documents at query time and injecting them into the prompt. The model answers based on retrieved facts rather than relying solely on memorised training data.',
    howItWorks: [
      'Offline: a document corpus is chunked (split into ~300–500 token segments), each chunk is encoded by an embedding model into a dense vector.',
      'Vectors are stored in a vector database (Pinecone, pgvector, Weaviate, Chroma) indexed for fast approximate nearest-neighbour search.',
      'At query time, the user\'s question is embedded with the same model to produce a query vector.',
      'The vector DB retrieves the top-k chunks whose embeddings are most similar (cosine similarity) to the query vector.',
      'Retrieved chunks are prepended to the user\'s question in the LLM prompt as grounding context.',
      'The LLM generates an answer based on the retrieved facts — with citations if prompted to do so.',
    ],
    keyPoints: [
      'RAG decouples retrieval from generation — you can swap either component independently.',
      'Chunking strategy (size, overlap) and embedding model quality are the biggest determinants of retrieval accuracy.',
      'Reranking (a second, more accurate model that re-orders the top-k) can significantly improve precision at the cost of latency.',
      'RAG does not eliminate hallucination — the LLM can still misread or "extend" retrieved docs beyond what they say.',
      'RAG vs. fine-tuning: RAG for fresh or proprietary data; fine-tuning for style, tone, or task-specific behaviour the model needs to exhibit consistently.',
    ],
    interviewAngles: [
      'When would you use RAG versus fine-tuning? What are the trade-offs?',
      'How would you evaluate the quality of a RAG pipeline end to end?',
      'What is a vector database and how does approximate nearest-neighbour search work?',
      'What are common failure modes in RAG systems?',
    ],
  },
  {
    id:       'embeddings',
    category: 'workflows',
    title:    'Embeddings & Vector Search',
    color:    'rose',
    tagline:  'Represent meaning as a point in high-dimensional space',
    description:
      'An embedding is a dense vector that captures the semantic meaning of text (or images, audio, code, etc.). Similar concepts cluster together in embedding space — "king" and "queen" are nearby; "dog" and "cat" are closer to each other than to "car". Embeddings power semantic search, RAG, recommendation, and classification.',
    howItWorks: [
      'A trained encoder model (e.g. text-embedding-ada-002, BGE, E5) takes raw text as input.',
      'The text is tokenised and run through the encoder\'s attention layers.',
      'The encoder\'s final hidden state (or a mean-pooled version across all tokens) is the embedding — a fixed-length vector of 768, 1536, or 3072 floats.',
      'Semantically similar texts produce vectors that point in similar directions in this high-dimensional space.',
      'Embedding models are trained with contrastive learning: positive pairs (similar texts) are pulled together; negative pairs (dissimilar) are pushed apart.',
      'At search time, the query is embedded; approximate nearest-neighbour (ANN) algorithms (HNSW, IVF) find the closest stored vectors in milliseconds.',
    ],
    keyPoints: [
      'Cosine similarity (dot product of unit-normalised vectors) is the standard metric — it measures the angle between vectors, not their magnitude.',
      'Embeddings capture semantic meaning, not string similarity — "happy" and "joyful" have very high cosine similarity even though they share no characters.',
      'Embedding dimension affects quality vs. storage cost — larger dims encode more nuance but need more memory and are slower to search.',
      'Domain shift matters: embeddings trained on general web text may perform poorly on code, medical text, or legal language — use domain-specific models.',
    ],
    interviewAngles: [
      'How are text embeddings generated? What is the difference between a sentence transformer and a word embedding (Word2Vec)?',
      'What is the difference between cosine similarity and Euclidean distance for comparing embeddings?',
      'How would you build a semantic search system from scratch? Walk me through each component.',
      'What is approximate nearest-neighbour search and why is it used instead of exact search?',
    ],
  },
  {
    id:       'function-calling',
    category: 'workflows',
    title:    'Function Calling & Tool Use',
    color:    'teal',
    tagline:  'Give LLMs the ability to take actions, not just answer questions',
    description:
      'Function calling (tool use) allows LLMs to request the execution of predefined functions — web search, database queries, API calls, code execution — during generation. The model decides which tool to invoke and with what arguments; your application executes it and returns the result. This transforms an LLM from a text predictor into an agent that can interact with live systems.',
    howItWorks: [
      'The developer defines tools as JSON schemas — each specifies a function name, description, and parameter types. These schemas are passed to the model alongside the conversation (via a structured tools parameter, not embedded in the prompt).',
      'When generating a response, the model can emit a tool_call instead of prose — specifying which function to invoke and what arguments to pass, structured as JSON matching the schema.',
      'The application intercepts the tool_call, executes the actual function (querying a database, calling a weather API, running code), and appends the result as a tool_result message in the conversation.',
      'The model resumes generation with the tool output in context, producing a final user-facing response that incorporates the retrieved or computed data. Multiple round-trips are possible for multi-step tasks.',
      'Parallel tool calling: models can emit multiple tool_calls in a single turn when tools can run simultaneously. The application executes them in parallel and returns all results, reducing latency compared to sequential calls.',
      'Structured outputs (JSON mode): instead of tool calling, constrain the model to emit valid JSON matching a specified schema on every response. Used for data extraction, classification, and any pipeline that needs machine-parseable output rather than prose.',
    ],
    keyPoints: [
      'Tool descriptions are prompt-engineering — the model decides which tool to call based on your description. Vague or overlapping descriptions cause wrong tool selection. Write them as if documenting an API for a senior colleague',
      'Function calling is the mechanism behind AI assistants that browse the web, run code, and call APIs — the model orchestrates; your application executes. All security controls (auth, rate limiting, input sanitization) live on the execution side',
      'Structured outputs via JSON mode are more reliable than asking the model to "output JSON" in a regular prompt — they constrain token generation to only valid JSON, preventing malformed output that breaks downstream parsing',
      'Tool schemas define what the model can request, not what it can access — never trust model-generated arguments without validation. An adversarial prompt can craft tool arguments designed to exploit your function',
    ],
    interviewAngles: [
      'How does function calling work at the API level? What does the conversation look like before and after a tool call?',
      'What is the difference between function calling and structured output (JSON mode)?',
      'How would you design the tool schemas for a customer support agent that can look up orders, issue refunds, and escalate tickets?',
      'What security considerations arise when an LLM can invoke external functions?',
    ],
  },
  {
    id:       'fine-tuning',
    category: 'workflows',
    title:    'Fine-Tuning',
    color:    'violet',
    tagline:  'Adapt a pre-trained model to your specific task or style',
    description:
      'Fine-tuning updates a pre-trained model\'s weights on a curated task-specific dataset, improving performance on narrow domains without training from scratch. Modern parameter-efficient methods (LoRA, QLoRA) make fine-tuning feasible on a single GPU, while instruction fine-tuning teaches models to follow specific formats and communication styles consistently across all interactions.',
    howItWorks: [
      'Start with a pre-trained base model (Llama 3, Mistral, Gemma) or an instruction-tuned variant. Fine-tuning inherits all capabilities of the base model — you are adjusting weights, not replacing the model.',
      'Prepare a dataset of (instruction, response) pairs representing the exact behaviour you want. Data quality dominates quantity — 1,000 curated, high-quality examples routinely outperform 100,000 noisy ones scraped from the web.',
      'Full fine-tuning updates every weight in the model — maximally flexible but requires multi-GPU clusters for 7B+ models and risks catastrophic forgetting, where the model loses general capabilities while over-specializing.',
      'LoRA (Low-Rank Adaptation): inject small trainable rank-r matrices alongside the frozen original weights. Only ~0.1–1% of parameters are trained, stored as a separate adapter that can be loaded on top of any compatible base model and swapped without reloading the base.',
      'QLoRA combines 4-bit quantization with LoRA: the base model loads in reduced precision (cutting GPU memory 4×), while the LoRA adapters train in full precision. A 70B model fine-tuned on a single A100 80GB GPU is practical with QLoRA.',
      'Evaluate improvement on a held-out task-specific test set while monitoring regression on general benchmarks (MMLU, HellaSwag). If general performance degrades, reduce training epochs or add general-domain data to the fine-tuning mix.',
    ],
    keyPoints: [
      'Fine-tune for style and format consistency (always respond in JSON, adopt a specific persona, follow a strict output structure) — RAG is better for injecting fresh or proprietary factual knowledge that changes over time',
      'LoRA/QLoRA is the practical default: 10–100× fewer trainable parameters than full fine-tuning, runs on a single GPU, produces versioned adapters that can be swapped per request',
      'Catastrophic forgetting is a real risk — always evaluate on general benchmarks after fine-tuning to ensure capabilities you rely on have not degraded',
      'RLHF (Reinforcement Learning from Human Feedback) is the technique that turned base LLMs into ChatGPT-style assistants: human raters compare model outputs, and the model is trained to prefer highly-rated responses using PPO',
    ],
    interviewAngles: [
      'When would you fine-tune a model rather than using RAG or prompt engineering?',
      'What is LoRA and how does it reduce the cost and memory footprint of fine-tuning?',
      'What is catastrophic forgetting and how do you detect it after fine-tuning?',
      'What is the difference between instruction fine-tuning and RLHF?',
    ],
  },
  {
    id:       'guardrails',
    category: 'workflows',
    title:    'Hallucinations & Guardrails',
    color:    'rose',
    tagline:  'Why LLMs confabulate and how to build reliable, safe applications',
    description:
      'LLMs hallucinate — they generate plausible-sounding but factually incorrect statements — because they are trained to produce likely token continuations, not to verify truth. Guardrails are the engineering controls (prompt-level and architectural) that constrain model behaviour, validate outputs, and catch harmful or unreliable responses before they reach users.',
    howItWorks: [
      'Why hallucinations occur: the model predicts the next token based on pattern similarity to training data. For rare or out-of-distribution facts, it generates a plausible-sounding continuation even when no correct answer exists in its training distribution — it has no mechanism to say "I don\'t know" without explicit training for that.',
      'RAG as a grounding strategy: providing retrieved documents reduces hallucination by giving the model explicit facts to cite rather than relying on memorized training data. The model can still misread or extend beyond what the documents say, but the rate drops measurably.',
      'Input guardrails: validate user input before it reaches the model. Detect prompt injection ("ignore your previous instructions and..."), jailbreak patterns, PII in inputs that should not be sent to external APIs, and off-topic requests that should be refused at the application layer.',
      'Output guardrails: validate model output before returning it to users. Check for: format validity (is the JSON parseable?), content policy violations (toxicity classifiers), factual claims contradicting source documents, and sensitive data that should not appear in responses.',
      'Self-consistency checking: generate the same response multiple times (with temperature > 0) and compare answers. Divergent answers to the same factual question signal low confidence — surface uncertainty to users rather than presenting one potentially wrong answer with false confidence.',
      'Uncertainty acknowledgement: prompt the model to say "I\'m not certain" or "the documents don\'t address this" when confidence is low. Citation-backed answers — requiring the model to quote source passages — let users verify claims themselves rather than trusting the model blindly.',
    ],
    keyPoints: [
      'Hallucination is a fundamental property of current LLMs, not a fixable bug — design applications assuming some percentage of outputs will be wrong and build validation layers accordingly',
      'Prompt injection is the LLM equivalent of SQL injection — user input can override your system prompt if the model treats it as instructions rather than data. Never render untrusted user input in privileged positions',
      'Content moderation layers (OpenAI Moderation API, Perspective API, custom classifiers) should wrap both input and output in any user-facing application to catch policy violations before they surface',
      'Showing citations alongside answers shifts verification responsibility appropriately: the model answers, users confirm against sources. This is more honest than presenting AI-generated facts as ground truth',
    ],
    interviewAngles: [
      'Why do LLMs hallucinate? What fundamentally causes this behaviour?',
      'What is prompt injection and how would you defend against it in a customer-facing chatbot?',
      'How would you reduce hallucination in a medical information application?',
      'What are the layers of a production guardrail system for a user-facing LLM product?',
    ],
  },

  // ── AI Agents ─────────────────────────────────────────────────────────────────
  {
    id:       'ai-agents',
    category: 'agents',
    title:    'AI Agents',
    color:    'blue',
    tagline:  'LLMs that plan, use tools, and act in a loop to complete tasks',
    description:
      'An AI agent is an LLM operating in an action-observation loop: it receives a goal, decides on a sequence of actions (tool calls, searches, code execution), observes the results, and iterates until the task is complete. Agents handle complex multi-step tasks that require gathering information, making decisions, and adapting based on what they find — going far beyond single-turn question answering.',
    howItWorks: [
      'The ReAct (Reasoning + Acting) pattern structures the agent loop: the model alternates between Thought (reasoning about what to do next), Action (selecting a tool and its arguments), and Observation (the tool\'s output). This loop repeats until the model emits a final answer or a stopping condition is met.',
      'Tools are the agent\'s interface to the outside world: web search, code execution, database lookup, API calls, file operations. The model picks tools from the available set based on the task — its reasoning is explicit in Thought steps and fully auditable.',
      'Memory types: working memory is the current context window (everything so far); external memory stores past tool outputs, conversation history, and retrieved knowledge in a database and selectively retrieves relevant pieces into the context as needed. Without memory management, long-running agents exhaust the context window.',
      'Planning and decomposition: for complex goals, agents decompose tasks into subtasks ("to answer this research question I need to: 1. search for papers, 2. read relevant ones, 3. synthesize findings"). Hierarchical planning assigns subtasks to specialized sub-agents.',
      'Error recovery: agents must handle tool failures gracefully — retrying with different arguments, selecting alternative tools, or concluding they cannot complete the task rather than looping indefinitely. Without explicit error handling, agents get stuck in infinite loops burning tokens and money.',
      'Frameworks: LangChain, LlamaIndex, and Anthropic\'s Claude Agent SDK provide pre-built agent loops, tool integrations, and memory management — handling the plumbing of parsing model output, executing tools, and maintaining conversation history across turns.',
    ],
    keyPoints: [
      'Agents are powerful for tasks requiring dynamic information gathering but dangerous without guardrails — a poorly constrained agent can take costly, irreversible real-world actions (sending emails, making purchases, modifying databases)',
      'The ReAct loop is the foundational agent pattern — every major agent framework implements a variation of Thought/Action/Observation',
      'Context window management is the primary engineering challenge in long-running agents: summarize completed sub-tasks, retrieve relevant memory selectively, prune stale observations',
      'Human-in-the-loop checkpoints are essential for high-stakes actions — the agent proposes, a human confirms, then execution proceeds. Never let agents take irreversible actions autonomously without explicit approval',
    ],
    interviewAngles: [
      'Describe the ReAct pattern. What is a Thought, an Action, and an Observation?',
      'How would you prevent an agent from running in an infinite loop?',
      'What is the difference between an AI agent and a RAG pipeline?',
      'When would you use an agent versus a standard LLM call with function calling?',
    ],
  },
  {
    id:       'multi-agent-systems',
    category: 'agents',
    title:    'Multi-Agent Systems',
    color:    'amber',
    tagline:  'Orchestrate networks of specialized agents to tackle complex tasks',
    description:
      'Multi-agent systems decompose complex workflows across multiple AI agents, each specializing in a subtask. An orchestrator routes tasks to sub-agents (researcher, coder, reviewer), collects their outputs, and synthesizes a final result. This architecture enables parallelism, specialization, and fault isolation — at the cost of coordination complexity and harder debugging.',
    howItWorks: [
      'Orchestrator-subagent pattern: a root orchestrator receives the top-level goal, decomposes it into subtasks, and delegates each to a specialized subagent. The orchestrator synthesizes subagent outputs into a final result. Subagents can be simple LLM calls with focused prompts or full agents with their own tool access.',
      'Parallel execution: independent subtasks run simultaneously. A research agent searches the web while a data agent queries a database; the orchestrator waits for both and merges results. Properly parallelized multi-agent pipelines are significantly faster than sequential single-agent runs for the same task.',
      'Specialization and cost optimization: different agents can use different models appropriate to their task — a large, expensive model for high-stakes reasoning; a smaller, cheaper model for simple extraction or formatting. This optimizes cost while maintaining quality where it matters.',
      'Agent-to-agent communication: agents share context by passing structured messages, writing to a shared memory store, or using message queues. OpenAI\'s Swarm protocol and Anthropic\'s Agent SDK define how agents hand off control and share state in standardized ways.',
      'Critic pattern: one agent generates a response; a second agent critiques it; a third decides which position is correct. This multi-agent debate reduces hallucination and reasoning errors on complex tasks by treating accuracy as a consensus problem.',
      'Failure propagation: multi-agent systems amplify errors — a wrong output from one agent cascades into all downstream agents. Add explicit output validation at each agent boundary. A single misclassified document early in a pipeline can corrupt every subsequent step.',
    ],
    keyPoints: [
      'Multi-agent systems shine for tasks with clearly decomposable subtasks (research + write + review) where stages can run independently — don\'t add agents for tasks a single well-prompted LLM can handle',
      'Each agent call adds latency and cost — the overhead is only justified when parallelism or specialization provides measurable benefit',
      'Debugging multi-agent systems requires tracing the full execution graph: which agent made which decision, with what context, producing what output. Distributed tracing (as in microservices) is the right mental model',
      'Frameworks: CrewAI, AutoGen, LangGraph, and Anthropic\'s Claude Agent SDK. LangGraph expresses agent flow as a directed graph — powerful for complex conditional workflows with loops, branches, and error recovery paths',
    ],
    interviewAngles: [
      'What is the orchestrator-subagent pattern? When is it better than a single agent?',
      'How do you prevent error propagation in a multi-agent pipeline?',
      'How would you design a multi-agent system to write a technical report on a given topic?',
      'What are the cost and latency implications of multiple specialized agents versus one general agent?',
    ],
  },

  // ── Production & Evaluation ───────────────────────────────────────────────────
  {
    id:       'ai-engineer',
    category: 'production',
    title:    'The AI Engineer',
    color:    'indigo',
    tagline:  'The engineer who builds reliable products on top of foundation models',
    description:
      'The AI Engineer is a software engineer who specialises in building applications, pipelines, and systems that productively consume foundation models — rather than training them. The role has emerged rapidly because deploying LLMs reliably is its own discipline: prompt design, retrieval systems, evaluation frameworks, cost management, and production observability are engineering problems that exist independently of any ML background.',
    howItWorks: [
      'The AI Engineer\'s primary tool is the API — they integrate foundation models (GPT-4, Claude, Gemini) as components in a larger software system. The model is a black-box service with a pricing model, a rate limit, and an SLA; engineering around those constraints is the core job.',
      'Core workflow: define the desired product behaviour → design and version prompts → choose a knowledge strategy (RAG, fine-tuning, or direct context injection) → build an evaluation dataset → ship → monitor, measure, and iterate.',
      'Prompt design and management is a first-class engineering concern. Prompts are versioned in source control, tested against an eval suite, and reviewed in pull requests. A prompt change can degrade downstream quality as silently as a broken dependency.',
      'RAG pipelines are the most common AI Engineer deliverable: chunk and embed a document corpus, build a retrieval layer over a vector database, wire it to an LLM, and expose a reliable question-answering or generation endpoint.',
      'Evaluation is the AI Engineer\'s test suite. They write LLM-as-judge rubrics, curate domain-specific benchmark datasets, and run regression checks on every deployment to detect quality drops before users do.',
      'Production concerns dominate: per-request token cost budgets, latency SLAs (especially time-to-first-token), graceful rate-limit handling, model fallback strategies, and semantic caching. These are infrastructure problems, not ML problems.',
    ],
    keyPoints: [
      'AI Engineer ≠ ML Engineer. The AI Engineer rarely trains models — they build on top of pre-trained ones. Deep ML knowledge helps but is not a prerequisite; strong software engineering and systems thinking are essential',
      'The standard stack: foundation model API + orchestration layer (LangChain, LlamaIndex, or custom code) + retrieval system (vector DB) + evaluation framework + observability tooling',
      'Prompt engineering is the AI Engineer\'s highest-leverage skill — a carefully crafted system prompt with good few-shot examples often closes the quality gap between an expensive frontier model and a much cheaper one',
      'The role demands end-to-end ownership: AI Engineers trace failures across the full pipeline — retrieval quality, context window usage, sampling parameters, output parsing, and downstream business logic — not just the model call itself',
    ],
    interviewAngles: [
      'What is the difference between an AI Engineer, an ML Engineer, and a Data Scientist?',
      'Walk me through how you would build a RAG chatbot from scratch — what are the components and the key decisions at each step?',
      'How would you evaluate and measure the quality of an LLM feature before shipping it to production?',
      'A customer support bot you built sometimes gives wrong answers. How do you diagnose whether the problem is retrieval, context, prompting, or the model itself?',
    ],
  },
  {
    id:       'llm-evaluation',
    category: 'production',
    title:    'LLM Evaluation',
    color:    'emerald',
    tagline:  'How to measure whether your AI application actually works',
    description:
      'Evaluating LLM applications is fundamentally different from traditional software testing — there are no exact right answers, and metrics like accuracy require defining what "correct" means for open-ended generation. A robust eval framework combines automated metrics, LLM-as-judge scoring, human review, and regression testing to give continuous confidence that your application is improving, not regressing.',
    howItWorks: [
      'Benchmark datasets: curate a representative set of (input, expected_output) pairs from your specific domain. Unlike generic benchmarks (MMLU, HumanEval), domain-specific evals catch the failure modes that actually matter for your use case. Aim for 100–500 examples that deliberately cover edge cases.',
      'LLM-as-judge: use a stronger model (GPT-4, Claude Opus) to score responses on dimensions like correctness, helpfulness, conciseness, and citation accuracy. Provide explicit scoring rubrics in the judge prompt. Validated against human ratings, LLM-as-judge achieves 70–85% agreement — scalable and cheap compared to human eval at volume.',
      'RAG-specific metrics (RAGAS framework): Context Recall (did retrieval fetch the relevant chunks?), Context Precision (were fetched chunks actually relevant?), Answer Faithfulness (does the answer stay within retrieved docs?), Answer Relevance (does the answer address the question?). These four metrics pinpoint whether a RAG pipeline fails at retrieval or generation.',
      'Regression testing: track eval scores across every code change. A prompt edit that improves one task may silently degrade another. Treat LLM evals like a CI/CD test suite — alert or block deployments when core metrics drop below a defined threshold.',
      'A/B testing: deploy two prompt versions or model configurations to different user segments and measure downstream outcomes (task completion rate, user satisfaction, support escalation rate). Ground truth from actual user behaviour is more reliable than synthetic benchmarks.',
      'Human eval for calibration: periodically have domain experts rate a sample of model outputs. Use this to calibrate automated metrics — if your LLM judge systematically misrates a class of examples, update its rubric or scoring criteria before trusting it at scale.',
    ],
    keyPoints: [
      '"Vibe testing" (manually checking a few responses) does not scale — build an automated eval suite before shipping to production, not after the first incident',
      'RAGAS is the standard framework for evaluating RAG pipelines — run it on every pipeline change to catch retrieval regressions before they reach users',
      'LLM-as-judge is the practical default for subjective evaluation at scale; always calibrate it against human ratings on a representative sample before treating its scores as ground truth',
      'Eval is a product decision, not just an engineering one: what "correct" means must be defined by the business. Make the rubric explicit, versioned, and reviewed alongside the code it evaluates',
    ],
    interviewAngles: [
      'How would you evaluate a customer support chatbot? What metrics would you track?',
      'What is RAGAS and what does each of its four metrics measure?',
      'What is LLM-as-judge? What are its strengths and failure modes?',
      'How do you prevent prompt or model changes from silently regressing quality in production?',
    ],
  },
  {
    id:       'ai-observability',
    category: 'production',
    title:    'AI Observability',
    color:    'sky',
    tagline:  'Monitor, trace, and optimize LLM applications in production',
    description:
      'AI observability extends traditional application monitoring to the unique challenges of LLM systems: non-deterministic outputs, high per-request cost, and quality that drifts as usage patterns change. It combines prompt/response logging, distributed tracing of multi-step LLM calls, cost tracking, latency profiling, and quality monitoring to give engineers visibility into what the model is actually doing — and costing — in production.',
    howItWorks: [
      'Prompt and response logging: every LLM call should log the exact prompt (system prompt + full conversation history), model response, latency, token counts (input + output), cost estimate, model version, and a request ID. This is the foundation for debugging, auditing, and quality review.',
      'Distributed tracing for LLM calls: for multi-step applications (RAG, agents), trace the full request path — which retrieval was triggered, what was fetched, what the model received, what it returned, and how long each step took. LLM-specific tools (LangSmith, Langfuse, Helicone, Phoenix) visualize this as a call tree, unlike generic APM tools that only see HTTP calls.',
      'Cost monitoring: track input and output token counts per request, per user, per feature, and per model version. Token costs vary widely — switching from GPT-4 to GPT-4o-mini may reduce cost 10× with acceptable quality loss. Set budget alerts and per-user quotas to prevent runaway costs from retry storms or long context abuse.',
      'Latency profiling: decompose total latency into components — retrieval time (vector DB query), LLM time-to-first-token (TTFT), LLM generation time, and postprocessing. TTFT is the latency users feel most acutely. Streaming responses (server-sent events) starts displaying output before generation completes, dramatically improving perceived responsiveness.',
      'Quality drift detection: compare rolling averages of eval scores (LLM-as-judge ratings, user feedback signals, task completion rates) over time. Drift occurs due to model updates (providers sometimes silently update the underlying model), prompt changes, or shifting user query distributions. Alert when quality drops below threshold.',
      'Semantic caching: cache model responses for semantically similar queries using embedding similarity (not exact string match). On a cache hit, return the stored response instantly at zero model cost. Most effective for high-traffic FAQ bots and documentation assistants where users repeatedly ask variations of the same questions.',
    ],
    keyPoints: [
      'Token-level cost tracking is non-negotiable at scale — LLM costs are usage-based and can spike unexpectedly from long contexts, retry storms, or a single misconfigured endpoint',
      'Streaming responses (server-sent events) dramatically improve perceived latency — users see the first token in under a second even when full generation takes 10 seconds. Implement streaming from day one; retrofitting it into a non-streaming architecture is painful',
      'Semantic caching can reduce LLM API costs by 30–60% for FAQ-style applications — use cosine similarity on query embeddings with a high threshold (0.95+) to avoid cache collisions on semantically similar but meaningfully different questions',
      'LLM observability tools (LangSmith, Langfuse, Helicone) are purpose-built for the prompt/response/trace model — generic APM tools miss LLM-specific dimensions like token budgets, prompt template versions, and retrieval quality',
    ],
    interviewAngles: [
      'What would you monitor in a production RAG chatbot? What metrics matter most?',
      'How would you track and control the cost of an LLM application at scale?',
      'What is semantic caching and how does it differ from traditional HTTP response caching?',
      'How do you detect quality drift in a deployed LLM application?',
    ],
  },

  // ── Live Coding Interviews ───────────────────────────────────────────────────
  {
    id:       'ai-chat-app',
    category: 'live-coding',
    title:    'AI Chat App',
    color:    'blue',
    tagline:  'Stateful chat backed by an LLM — history, persistence, and UX under the clock',
    duration: '60 min',
    description:
      'The AI chat app is the canonical full-stack AI interview. It looks simple — call an LLM, show the response — but strong candidates immediately ask about conversation history (how do you send prior turns?), persistence (how do you resume?), and streaming (how do you avoid a frozen UI?). Every decision here maps directly to real production architecture.',
    core: [
      'POST /chat — accept a user message and session ID, send full history to the LLM, return the reply',
      'GET /sessions — list all prior chat sessions with title and timestamp',
      'GET /sessions/:id/messages — retrieve full message history for a session',
      'Persist messages and sessions to a database so previous chats can be resumed',
    ],
    bonus: [
      'Streaming responses via SSE so the UI renders tokens as they arrive',
      'Multiple named tabs or sessions in the frontend, each with independent history',
      'Expose an MCP tool or SQL query tool the LLM can invoke during the conversation',
    ],
    skillsTested: [
      'LLM API integration and conversation history management',
      'Session and message persistence (schema design)',
      'Streaming architecture (SSE / chunked transfer)',
      'State management for multi-session UX',
    ],
    interviewAngles: [
      'How do you manage conversation history as it grows past the context window?',
      'What does the message table schema look like — what fields are required?',
      'Why does streaming matter UX-wise and how does SSE work at the HTTP level?',
      'How would you add tool use so the LLM can query a database mid-conversation?',
    ],
    interviewApproach: [
      'Map the domain before touching the keyboard: two entities (Session, Message), three endpoints, one LLM call per POST /chat.',
      'Announce your schema out loud: "sessions(id, created_at) and messages(id, session_id, role, content, created_at) — that gives me everything for history replay."',
      'Build CRUD first: create session, persist messages, verify retrieval works before adding any LLM code.',
      'Add the LLM call last: pull all messages for the session ordered by created_at, format as [{role, content}], call the model, insert the assistant reply.',
      'Explain your history strategy: "I\'ll send the last N turns to stay within the context window — I\'d make N configurable."',
      'Leave streaming as the final layer — prove the synchronous path works, then swap to SSE.',
    ],
    clarifyingQuestions: [
      '"Any preference on stack, or am I free to choose?"',
      '"Should sessions be anonymous or tied to a user ID?"',
      '"Is there a message count or token limit I should enforce on history, or let it grow unbounded?"',
      '"Does the response need to stream, or is a complete JSON response acceptable for the core?"',
      '"Should I generate a session title from the first message, or is that out of scope?"',
    ],
    claudeWorkflow: [
      'CLAUDE.md seed: tech stack, then "sessions(id UUID PK, created_at TIMESTAMPTZ) messages(id UUID PK, session_id UUID FK, role TEXT, content TEXT, created_at TIMESTAMPTZ)"',
      'Plan prompt: "Plan POST /chat: load session history ordered by created_at, call Claude with the messages array, insert assistant reply, return it. Show function signatures and DB queries — no code yet."',
      'Code prompt: "Write FastAPI POST /chat — async SQLAlchemy, pull messages for session_id, format as Anthropic messages array, call claude-haiku-4-5-20251001 max_tokens=1024, insert reply, return it."',
      'Streaming upgrade: "Refactor POST /chat to stream tokens using FastAPI StreamingResponse + Anthropic stream() context manager. Persist the full reply to DB after the stream completes."',
    ],
    claudeMdContent:
`# AI Chat App
  Stateful LLM chat — session persistence, full history replay, optional streaming.

─────────────────────────────────────────────────────
 ENVIRONMENT
─────────────────────────────────────────────────────
  Python 3.12 · FastAPI (async) · async SQLAlchemy · asyncpg · Uvicorn

  from anthropic import AsyncAnthropic
  client    = AsyncAnthropic()          # reads ANTHROPIC_API_KEY from env
  MODEL     = "claude-haiku-4-5-20251001"
  MAX_TOKENS = 1024

─────────────────────────────────────────────────────
 SCHEMA
─────────────────────────────────────────────────────
  sessions
    id           UUID         PRIMARY KEY  DEFAULT gen_random_uuid()
    created_at   TIMESTAMPTZ  NOT NULL     DEFAULT now()

  messages
    id           UUID         PRIMARY KEY  DEFAULT gen_random_uuid()
    session_id   UUID         NOT NULL     REFERENCES sessions(id) ON DELETE CASCADE
    role         TEXT         NOT NULL     CHECK (role IN ('user', 'assistant'))
    content      TEXT         NOT NULL
    created_at   TIMESTAMPTZ  NOT NULL     DEFAULT now()
    ── index: (session_id, created_at ASC)

─────────────────────────────────────────────────────
 ENDPOINTS
─────────────────────────────────────────────────────
  POST   /sessions               {}                   →  { id }
  POST   /sessions/:id/chat      { message: str }     →  { reply: str }
  GET    /sessions               ─                    →  [{ id, created_at }]
  GET    /sessions/:id/messages  ─                    →  [{ id, role, content, created_at }]

─────────────────────────────────────────────────────
 LLM CALL PATTERN  (POST /sessions/:id/chat)
─────────────────────────────────────────────────────
  # 1. Fetch history and append new turn
  rows    = SELECT * FROM messages WHERE session_id=$1 ORDER BY created_at ASC
  history = [{"role": r.role, "content": r.content} for r in rows]
  history.append({"role": "user", "content": request.message})

  # 2. Call the model
  resp  = await client.messages.create(
      model=MODEL, max_tokens=MAX_TOKENS, messages=history
  )
  reply = resp.content[0].text

  # 3. Persist both turns
  INSERT INTO messages (session_id, role, content)
  VALUES ($session_id, 'user', $message),
         ($session_id, 'assistant', $reply)

─────────────────────────────────────────────────────
 RULES
─────────────────────────────────────────────────────
  • Insert user message BEFORE calling the LLM (persists even if the call fails)
  • Insert assistant reply AFTER the LLM returns
  • Truncate to last 20 messages if history grows large — announce this strategy
  • Return 404 if session_id does not exist

─────────────────────────────────────────────────────
 BUILD ORDER
─────────────────────────────────────────────────────
  1  sessions table  →  POST /sessions  →  GET /sessions
  2  messages table  →  GET /sessions/:id/messages
  3  Wire POST /sessions/:id/chat (verify persistence before adding LLM)
  4  Add LLM call with full history fetch + insert reply
  5  (Bonus) Swap to SSE streaming via FastAPI StreamingResponse`,
  },
  {
    id:       'knowledge-base-qa',
    category: 'live-coding',
    title:    'Knowledge Base Q&A',
    color:    'teal',
    tagline:  'Add docs, ask questions — a miniature RAG pipeline from scratch',
    duration: '60 min',
    description:
      'Knowledge base Q&A is a focused RAG implementation interview. Candidates must ingest documents, retrieve relevant chunks at query time, inject them into the LLM prompt, and return a grounded answer — all within an hour. The retrieval step separates strong candidates: keyword search is the floor, embedding-based retrieval is the ceiling.',
    core: [
      'POST /documents — accept a document title and body, store it for retrieval',
      'POST /ask — accept a question, retrieve relevant document chunks, send context + question to the LLM, return the answer',
      'GET /sessions — list previous question/answer pairs with the document context used',
      'Persist documents, questions, answers, and session history to a database',
    ],
    bonus: [
      'Citation support: return which document(s) the answer was grounded in',
      'Streaming answer tokens as they arrive from the LLM',
      'Embedding-based retrieval using cosine similarity instead of keyword matching',
    ],
    skillsTested: [
      'RAG pipeline design (ingest → chunk → retrieve → generate)',
      'Retrieval strategy selection (keyword vs embedding-based)',
      'Prompt construction with injected document context',
      'Session and document persistence schema design',
    ],
    interviewAngles: [
      'How do you decide what to include in the LLM context — full document or chunks?',
      'What is the difference between keyword retrieval and embedding similarity for this use case?',
      'How would you prevent the LLM from answering questions the documents do not cover?',
      'How would you evaluate whether the retrieval step is returning the right chunks?',
    ],
    interviewApproach: [
      'Name the two phases before coding: ingest (POST /documents — store and index) and query (POST /ask — retrieve then generate). They are independent; design them separately.',
      'Start retrieval with keyword/full-text search — fast to implement, immediately testable, and a valid solution. Frame embeddings as the upgrade path.',
      'Store documents and chunks in separate tables; chunk at ingest so POST /ask is read-only retrieval.',
      'Prompt the LLM to answer only from the provided context and say "I don\'t know" if no relevant chunk is found — this is an explicit guardrail the interviewer expects you to mention.',
      'Track Q&A sessions: link each question and answer to the chunks that were actually used — this is both the history requirement and implicit citation.',
    ],
    clarifyingQuestions: [
      '"Keyword search or embedding-based retrieval — which should I prioritize for the core?"',
      '"How large are documents expected to be? Should I chunk at ingest or treat each document as one context block?"',
      '"Should the answer cite which document it came from?"',
      '"What is the maximum number of documents to include in a single LLM context — top 3, top 5?"',
      '"Should the LLM refuse to answer if none of the documents are relevant?"',
    ],
    claudeWorkflow: [
      'CLAUDE.md seed: "documents(id, title, body, created_at), chunks(id, doc_id, content, chunk_index), sessions(id, created_at), session_docs(session_id, doc_id, relevance_rank)"',
      'Plan prompt: "Plan POST /ask: keyword search documents for relevance, pick top 3, build LLM prompt with their content as numbered context blocks, call model, store Q&A + which docs were used, return answer."',
      'Retrieval prompt: "Write a Postgres full-text search query using tsvector + plainto_tsquery that searches the chunks table and ranks by ts_rank. Return top-3 chunks."',
      'Guardrail prompt: "Write the system prompt for the LLM call. Instruct the model to answer using only the provided documents, cite the document title, and say \'The documents do not cover this\' if the answer is not present."',
    ],
    claudeMdContent:
`# Knowledge Base Q&A
  Retrieval-augmented generation — ingest docs, retrieve top-3 by FTS, answer grounded in content.

─────────────────────────────────────────────────────
 ENVIRONMENT
─────────────────────────────────────────────────────
  Python 3.12 · FastAPI (async) · async SQLAlchemy · asyncpg · Uvicorn

  from anthropic import AsyncAnthropic
  client     = AsyncAnthropic()
  MODEL      = "claude-haiku-4-5-20251001"
  MAX_TOKENS = 2048

─────────────────────────────────────────────────────
 SCHEMA
─────────────────────────────────────────────────────
  documents
    id           UUID         PRIMARY KEY  DEFAULT gen_random_uuid()
    title        TEXT         NOT NULL
    body         TEXT         NOT NULL
    created_at   TIMESTAMPTZ  NOT NULL     DEFAULT now()
    ── index: GIN(to_tsvector('english', title || ' ' || body))

  sessions
    id           UUID         PRIMARY KEY  DEFAULT gen_random_uuid()
    question     TEXT         NOT NULL
    answer       TEXT         NOT NULL
    created_at   TIMESTAMPTZ  NOT NULL     DEFAULT now()

  session_docs                              -- which docs sourced each answer
    session_id   UUID         NOT NULL     REFERENCES sessions(id)
    doc_id       UUID         NOT NULL     REFERENCES documents(id)
    relevance_rank INT        NOT NULL
    PRIMARY KEY (session_id, doc_id)

─────────────────────────────────────────────────────
 ENDPOINTS
─────────────────────────────────────────────────────
  POST   /documents  { title: str, body: str }   →  { id, created_at }
  POST   /ask        { question: str }            →  { answer, sources: [{ id, title }] }
  GET    /sessions   ─                            →  [{ id, question, answer, created_at }]

─────────────────────────────────────────────────────
 RETRIEVAL QUERY  (POST /ask — step 1)
─────────────────────────────────────────────────────
  SELECT id, title, body,
         ts_rank(to_tsvector('english', title || ' ' || body),
                 plainto_tsquery('english', $1)) AS rank
  FROM   documents
  WHERE  to_tsvector('english', title || ' ' || body)
           @@ plainto_tsquery('english', $1)
  ORDER  BY rank DESC
  LIMIT  3

─────────────────────────────────────────────────────
 LLM CALL PATTERN  (POST /ask — step 2)
─────────────────────────────────────────────────────
  context = "\n\n".join(
      f"[{i+1}] {d.title}:\n{d.body}" for i, d in enumerate(docs)
  )
  system = (
      "Answer using ONLY the documents below. "
      "Cite sources as [1], [2], etc. "
      "If the answer is not covered, say 'The documents do not address this.'"
  )
  resp = await client.messages.create(
      model=MODEL, max_tokens=MAX_TOKENS, system=system,
      messages=[{"role": "user",
                 "content": f"{context}\n\nQuestion: {question}"}]
  )

─────────────────────────────────────────────────────
 RULES
─────────────────────────────────────────────────────
  • Never call the LLM with zero retrieved documents — return a clear error
  • Store session + session_docs so history shows which docs sourced each answer
  • Keyword FTS is the core requirement; embeddings are the bonus upgrade path

─────────────────────────────────────────────────────
 BUILD ORDER
─────────────────────────────────────────────────────
  1  documents table  →  POST /documents
  2  FTS retrieval query — test it independently before wiring the LLM
  3  POST /ask: retrieve → inject context → call LLM → store session + session_docs
  4  GET /sessions with doc references
  5  (Bonus) Embedding-based retrieval  •  Citation display in response`,
  },
  {
    id:       'document-search-app',
    category: 'live-coding',
    title:    'Document Search App',
    color:    'violet',
    tagline:  'Upload, index, search documents — with an AI summary layer on top',
    duration: '60 min',
    description:
      'Document search starts as a storage and indexing problem and ends as an AI integration problem. Candidates must design a pipeline that ingests documents, builds a searchable index, returns results, and optionally summarizes them using an LLM. The interview probes the full spectrum from SQL LIKE to vector search, and from synchronous responses to async AI summaries.',
    core: [
      'POST /documents — upload or paste a document, store and index it',
      'GET /search?q=keyword — search across document titles and bodies, return ranked results',
      'GET /search/history — list previous search queries with their result counts',
      'GET /documents/:id — retrieve a single document by ID',
    ],
    bonus: [
      'AI summary: call the LLM to summarize the top search results into a single paragraph',
      'Relevance ranking using TF-IDF or BM25 instead of simple keyword matching',
      'Semantic search using embeddings for concept-level matching beyond exact keywords',
    ],
    skillsTested: [
      'Text indexing and keyword search implementation',
      'Search result ranking fundamentals (TF-IDF, BM25)',
      'LLM integration for post-retrieval summarization',
      'Async pipeline design (search fast, summarize in background)',
    ],
    interviewAngles: [
      'How would you implement ranking without a dedicated search engine?',
      'Should the AI summary block the search response or arrive separately — what drives that choice?',
      'At what scale does SQL full-text search break down, and what replaces it?',
      'What are the latency tradeoffs of adding embedding-based search to an existing keyword pipeline?',
    ],
    interviewApproach: [
      'Split the problem into indexing (POST /documents) and querying (GET /search) — they are independent concerns, design them separately.',
      'Implement keyword / full-text search first; ranking (TF-IDF, BM25) and embeddings are bonus. Don\'t over-engineer the retrieval layer before the core works.',
      'The AI summary layer runs after retrieval — it is a post-processing step on the results, not part of retrieval. Never conflate them.',
      'Design search_history alongside the documents table from day one — retrofitting audit/history tables is painful and interviewers notice the afterthought.',
      'Have an opinion on async vs sync for AI summary: "I\'d make GET /search return results instantly and POST /search/summarize be a separate on-demand call so search latency isn\'t held hostage to the LLM."',
    ],
    clarifyingQuestions: [
      '"Is full-text search across the document body required, or just title matching?"',
      '"Should the AI summary block the search response, or be a separate on-demand endpoint?"',
      '"What is the expected document length — a paragraph, an article, a multi-page PDF?"',
      '"Is relevance ranking (TF-IDF, BM25) in scope, or is keyword match sufficient for the core?"',
      '"Should search history be per-user or global?"',
    ],
    claudeWorkflow: [
      'CLAUDE.md seed: "documents(id, title, body, created_at), search_history(id, query, result_count, created_at). No updates to documents after creation."',
      'Plan prompt: "Plan GET /search?q=: FTS query on title + body, return ranked results, log query to search_history. Then plan POST /search/summarize: take result titles + snippets, call LLM, return a synthesis paragraph."',
      'FTS prompt: "Write a Postgres query using to_tsvector(\'english\', title || \' \' || body) + plainto_tsquery(query) that returns documents ranked by ts_rank."',
      'Summary prompt: "Write the LLM call for summarization. Input: [{title, snippet}]. System prompt: \'Write a 3-sentence synthesis of the following search results. Do not add information not present in the results.\'"',
    ],
    claudeMdContent:
`# Document Search App
  Full-text document search with relevance ranking; optional AI synthesis of top results.

─────────────────────────────────────────────────────
 ENVIRONMENT
─────────────────────────────────────────────────────
  Python 3.12 · FastAPI (async) · async SQLAlchemy · asyncpg · Uvicorn

  from anthropic import AsyncAnthropic
  client     = AsyncAnthropic()
  MODEL      = "claude-haiku-4-5-20251001"
  MAX_TOKENS = 512

─────────────────────────────────────────────────────
 SCHEMA
─────────────────────────────────────────────────────
  documents
    id           UUID         PRIMARY KEY  DEFAULT gen_random_uuid()
    title        TEXT         NOT NULL
    body         TEXT         NOT NULL
    created_at   TIMESTAMPTZ  NOT NULL     DEFAULT now()
    ── index: GIN(to_tsvector('english', title || ' ' || body))

  search_history
    id           UUID         PRIMARY KEY  DEFAULT gen_random_uuid()
    query        TEXT         NOT NULL
    result_count INT          NOT NULL
    searched_at  TIMESTAMPTZ  NOT NULL     DEFAULT now()

─────────────────────────────────────────────────────
 ENDPOINTS
─────────────────────────────────────────────────────
  POST   /documents           { title, body }                         →  { id, created_at }
  GET    /search?q=           ─                                       →  [{ id, title, snippet, rank }]
  GET    /search/history      ─                                       →  [{ query, result_count, searched_at }]
  POST   /search/summarize    { results: [{ title, snippet }] }       →  { summary: str }
  GET    /documents/:id       ─                                       →  { id, title, body, created_at }

─────────────────────────────────────────────────────
 SEARCH QUERY  (GET /search?q=)
─────────────────────────────────────────────────────
  SELECT id, title,
         ts_headline('english', body, q, 'MaxWords=30') AS snippet,
         ts_rank(vec, q)                                AS rank
  FROM   documents,
         to_tsvector('english', title || ' ' || body)  vec,
         plainto_tsquery('english', $1)                q
  WHERE  vec @@ q
  ORDER  BY rank DESC
  LIMIT  20

─────────────────────────────────────────────────────
 LLM CALL PATTERN  (POST /search/summarize)
─────────────────────────────────────────────────────
  context = "\n".join(
      f"{i+1}. {r['title']}: {r['snippet']}"
      for i, r in enumerate(results)
  )
  resp = await client.messages.create(
      model=MODEL, max_tokens=MAX_TOKENS,
      messages=[{"role": "user",
                 "content": f"Summarize these search results in 3 sentences. "
                            f"Use only information present in the results.\n\n{context}"}]
  )

─────────────────────────────────────────────────────
 RULES
─────────────────────────────────────────────────────
  • Log every GET /search to search_history (query + result_count)
  • AI summary is a SEPARATE endpoint — GET /search must never block on an LLM call
  • Summary prompt must instruct the model not to add facts beyond the search results

─────────────────────────────────────────────────────
 BUILD ORDER
─────────────────────────────────────────────────────
  1  documents table  →  POST /documents  →  GET /documents/:id
  2  FTS search query  →  GET /search with history logging
  3  GET /search/history
  4  POST /search/summarize (LLM call)
  5  (Bonus) TF-IDF or BM25 reranking  •  Semantic search via embeddings`,
  },
  {
    id:       'support-ticket-assistant',
    category: 'live-coding',
    title:    'Support Ticket Assistant',
    color:    'rose',
    tagline:  'Create tickets, chat with an AI about each one — workflow meets LLM context',
    duration: '60 min',
    description:
      'A support ticket assistant combines workflow state management with per-ticket AI chat. Each ticket is its own conversation thread with an AI that has access to the ticket\'s full history. This tests whether the candidate can model ticket state as a state machine, maintain per-ticket LLM context, and structure the API to decouple ticket CRUD from AI interactions.',
    core: [
      'POST /tickets — create a ticket with title, description, and status (open)',
      'POST /tickets/:id/chat — send a message to the AI about this ticket; AI has full ticket history as context',
      'GET /tickets/:id/timeline — retrieve all events: status changes, user messages, and AI responses in order',
      'PATCH /tickets/:id — update status (open → in-progress → resolved)',
    ],
    bonus: [
      'AI auto-classification: when a ticket is created, call the LLM to suggest a priority level and category',
      'Escalation trigger: if the AI detects a critical issue, flag the ticket for human review',
      'Ticket summary: call the LLM to generate a one-paragraph summary of the full ticket timeline',
    ],
    skillsTested: [
      'State machine design for ticket status transitions',
      'Per-resource LLM context management (ticket-scoped conversation history)',
      'Timeline modeling — interleaved user, AI, and system events',
      'LLM integration for classification and summarization',
    ],
    interviewAngles: [
      'How do you keep the LLM context scoped to a single ticket and not bleed across tickets?',
      'What does the timeline table look like — how do you store heterogeneous event types?',
      'How would you auto-classify ticket priority without introducing bias from the LLM?',
      'What happens to the AI context when a ticket is resolved and then reopened?',
    ],
    interviewApproach: [
      'Model the ticket as a state machine first: draw the valid transitions (open → in_progress → resolved) and enforce invalid ones at the API layer.',
      'The timeline is the architectural challenge — it must store heterogeneous events (status_change, user_message, ai_reply) in one ordered table. Design it before writing any endpoint.',
      'Separate ticket CRUD from AI chat strictly: POST /tickets/:id/chat scopes the LLM context to that ticket\'s events only — the model never sees other tickets.',
      'Auto-classification is bonus: implement as a fire-and-forget background task on ticket creation, not blocking the 201 response. Return the ticket immediately.',
      'When building LLM context for POST /tickets/:id/chat, always prepend the original ticket description before the event history — the model needs to know what the ticket is about.',
    ],
    clarifyingQuestions: [
      '"Are status transitions strictly linear, or can tickets be reopened after resolution?"',
      '"Should the AI respond synchronously (blocking) or be queued for async processing?"',
      '"Does the AI need the full ticket metadata (priority, category) or just the conversation history?"',
      '"Should auto-classification block ticket creation or run in the background?"',
      '"Is there a maximum timeline length — should old AI responses be summarized?"',
    ],
    claudeWorkflow: [
      'CLAUDE.md seed: "tickets(id, title, description, status TEXT CHECK IN (\'open\',\'in_progress\',\'resolved\'), created_at), events(id, ticket_id, type TEXT, actor TEXT, content TEXT, created_at). type: status_change | user_message | ai_reply"',
      'Plan prompt: "Plan POST /tickets/:id/chat: build LLM message array from ticket description + ordered events, call model, insert ai_reply event, return the reply. Show the context-building logic."',
      'Context builder prompt: "Write the function that builds the messages array for a ticket: system message explaining the AI\'s support role, then all events mapped to alternating user/assistant turns in chronological order."',
      'Classification prompt: "Write the background task for ticket auto-classification: call LLM with the ticket description, use tool calling to extract {priority: low|medium|high|critical, category: string}, update the ticket row."',
    ],
    claudeMdContent:
`# Support Ticket Assistant
  Ticket state machine + per-ticket AI chat scoped to that ticket's full event history.

─────────────────────────────────────────────────────
 ENVIRONMENT
─────────────────────────────────────────────────────
  Python 3.12 · FastAPI (async) · async SQLAlchemy · asyncpg · Uvicorn

  from anthropic import AsyncAnthropic
  import asyncio                         # for background classification task
  client     = AsyncAnthropic()
  MODEL      = "claude-haiku-4-5-20251001"
  MAX_TOKENS = 1024

─────────────────────────────────────────────────────
 SCHEMA
─────────────────────────────────────────────────────
  tickets
    id           UUID         PRIMARY KEY  DEFAULT gen_random_uuid()
    title        TEXT         NOT NULL
    description  TEXT         NOT NULL
    status       TEXT         NOT NULL     DEFAULT 'open'
                                           CHECK (status IN ('open','in_progress','resolved'))
    priority     TEXT                      -- set by background AI classification
    category     TEXT                      -- set by background AI classification
    created_at   TIMESTAMPTZ  NOT NULL     DEFAULT now()

  events                                   -- append-only; never UPDATE or DELETE rows
    id           UUID         PRIMARY KEY  DEFAULT gen_random_uuid()
    ticket_id    UUID         NOT NULL     REFERENCES tickets(id) ON DELETE CASCADE
    type         TEXT         NOT NULL     CHECK (type IN ('status_change','user_message','ai_reply'))
    actor        TEXT         NOT NULL     -- 'user', 'system', or 'ai'
    content      TEXT         NOT NULL
    created_at   TIMESTAMPTZ  NOT NULL     DEFAULT now()
    ── index: (ticket_id, created_at ASC)

─────────────────────────────────────────────────────
 ENDPOINTS
─────────────────────────────────────────────────────
  POST   /tickets              { title, description }          →  { id, status: 'open' }
  GET    /tickets              ?status=open|in_progress|...    →  [{ id, title, status, priority }]
  PATCH  /tickets/:id          { status: str }                 →  { id, status }
  POST   /tickets/:id/chat     { message: str }                →  { reply: str }
  GET    /tickets/:id/timeline ─                               →  [{ type, actor, content, created_at }]

─────────────────────────────────────────────────────
 LLM CONTEXT BUILDER  (POST /tickets/:id/chat)
─────────────────────────────────────────────────────
  ticket = SELECT * FROM tickets WHERE id=$1
  events = SELECT * FROM events WHERE ticket_id=$1 ORDER BY created_at ASC

  # Map event types to LLM role format
  ROLE_MAP = {"user_message": "user", "ai_reply": "assistant"}
  messages = [
      {"role": ROLE_MAP[e.type], "content": e.content}
      for e in events if e.type in ROLE_MAP
  ]
  messages.append({"role": "user", "content": user_message})

  system = f"""You are a support agent helping resolve a ticket.
Title: {ticket.title}
Description: {ticket.description}
Current status: {ticket.status}"""

  resp = await client.messages.create(
      model=MODEL, max_tokens=MAX_TOKENS, system=system, messages=messages
  )
  # After call: INSERT events row (type='ai_reply', actor='ai', content=reply)

─────────────────────────────────────────────────────
 RULES
─────────────────────────────────────────────────────
  • Valid transitions: open→in_progress, in_progress→resolved, resolved→open (reopen allowed)
  • Every status change inserts an event row of type 'status_change'
  • AI classification fires as asyncio.create_task() after ticket creation — never blocks 201
  • LLM context is scoped to ONE ticket only — never load events from other tickets

─────────────────────────────────────────────────────
 BUILD ORDER
─────────────────────────────────────────────────────
  1  tickets table  →  POST /tickets  →  GET /tickets  →  PATCH /tickets/:id
  2  events table  →  GET /tickets/:id/timeline
  3  Wire POST /tickets/:id/chat with context builder + LLM call + ai_reply event
  4  Background auto-classification task (tool calling for priority + category)
  5  (Bonus) Ticket summary endpoint  •  Escalation trigger`,
  },
  {
    id:       'task-manager-ai',
    category: 'live-coding',
    title:    'Task Manager with AI Planning',
    color:    'emerald',
    tagline:  'CRUD tasks and let the LLM decompose goals into actionable steps',
    duration: '60 min',
    description:
      'A task manager with AI planning extends the classic CRUD interview with a generative layer: the user describes a goal, the LLM breaks it into concrete tasks, and those tasks are persisted to the database. The core engineering challenge is bridging the unstructured LLM output (a list of tasks) into the structured data model that the rest of the API consumes.',
    core: [
      'POST /tasks — create a task with title, description, status, and optional due date',
      'GET /tasks — list all tasks with optional status filter',
      'PATCH /tasks/:id — update title, description, status, or due date',
      'POST /tasks/generate — accept a goal description, call the LLM to decompose it into tasks, persist and return them',
    ],
    bonus: [
      'AI due-date suggestions: when generating tasks, ask the LLM to estimate a realistic due date for each',
      'Goal history: store each generation request and its output so the user can review past planning sessions',
      'Status filtering: GET /tasks?status=todo,in-progress with compound filter support',
    ],
    skillsTested: [
      'CRUD API design with state machine status transitions',
      'LLM output parsing — extracting structured task objects from free-form model text',
      'Prompt engineering for structured JSON generation',
      'Idempotency and error handling for AI generation endpoints',
    ],
    interviewAngles: [
      'How do you parse the LLM\'s task list output into database rows reliably?',
      'What prompt structure forces the model to return valid, parseable JSON?',
      'How do you handle the case where the LLM returns fewer or more tasks than expected?',
      'What is your retry strategy if the LLM call fails mid-generation?',
    ],
    interviewApproach: [
      'Task is the single entity. Nail the schema and status enum (todo | in_progress | done) before touching the generate endpoint.',
      'Implement GET/POST/PATCH for individual tasks first — verify the data model is correct before using it as a bulk-insert target for AI output.',
      'POST /tasks/generate is a parsing problem as much as an LLM problem: use tool calling or JSON mode to force structured output, never rely on freeform prose.',
      'Wrap the bulk insert in a transaction — all generated tasks commit together or none do.',
      'Validate each task object before inserting: check for required fields, trim whitespace, reject empty titles. Mention this explicitly to show you don\'t blindly trust LLM output.',
    ],
    clarifyingQuestions: [
      '"Should tasks have subtasks, or is a flat list sufficient?"',
      '"Is status a fixed enum (todo/in_progress/done) or configurable by the user?"',
      '"Should generated due dates be actual ISO dates relative to today, or left null?"',
      '"Does goal history — which goals generated which tasks — need to be stored?"',
      '"If the LLM returns malformed tasks, should I reject the whole batch or salvage the valid ones?"',
    ],
    claudeWorkflow: [
      'CLAUDE.md seed: "tasks(id UUID PK, title TEXT NOT NULL, description TEXT, status TEXT DEFAULT \'todo\', due_date DATE, goal_prompt TEXT, batch_id UUID, created_at TIMESTAMPTZ)"',
      'Plan prompt: "Plan POST /tasks/generate: call LLM with tool use to return a task array, validate each object, bulk insert with a shared batch_id, return all inserted tasks."',
      'Tool schema prompt: "Define an Anthropic tool \'create_tasks\' that accepts {tasks: [{title: string (required), description: string (optional), due_date: string ISO (optional)}]}."',
      'Parsing prompt: "Write the code that calls the LLM with the create_tasks tool, extracts the tool_use block, validates that each task has a non-empty title, and bulk inserts with a single INSERT ... VALUES."',
    ],
    claudeMdContent:
`# Task Manager with AI Planning
  CRUD task management + AI goal decomposition via tool calling into structured task rows.

─────────────────────────────────────────────────────
 ENVIRONMENT
─────────────────────────────────────────────────────
  Python 3.12 · FastAPI (async) · async SQLAlchemy · asyncpg · Uvicorn

  from anthropic import AsyncAnthropic
  from uuid import uuid4
  client     = AsyncAnthropic()
  MODEL      = "claude-haiku-4-5-20251001"
  MAX_TOKENS = 2048

─────────────────────────────────────────────────────
 SCHEMA
─────────────────────────────────────────────────────
  tasks
    id           UUID  PRIMARY KEY  DEFAULT gen_random_uuid()
    title        TEXT  NOT NULL
    description  TEXT
    status       TEXT  NOT NULL     DEFAULT 'todo'
                                    CHECK (status IN ('todo','in_progress','done'))
    due_date     DATE
    goal_prompt  TEXT               -- original goal string (AI-generated tasks only)
    batch_id     UUID               -- groups all tasks from one generation call
    created_at   TIMESTAMPTZ  NOT NULL  DEFAULT now()
    ── index: (status) for filter queries

─────────────────────────────────────────────────────
 ENDPOINTS
─────────────────────────────────────────────────────
  POST   /tasks           { title, description?, due_date? }              →  task object
  GET    /tasks           ?status=todo|in_progress|done                   →  [task]
  PATCH  /tasks/:id       { title?, description?, status?, due_date? }    →  task object
  DELETE /tasks/:id       ─                                               →  204
  POST   /tasks/generate  { goal: str }                                   →  [task]

─────────────────────────────────────────────────────
 TOOL DEFINITION  (POST /tasks/generate)
─────────────────────────────────────────────────────
  CREATE_TASKS_TOOL = {
    "name": "create_tasks",
    "description": "Create a list of actionable tasks to achieve the given goal",
    "input_schema": {
      "type": "object",
      "properties": {
        "tasks": {
          "type": "array",
          "items": {
            "type": "object",
            "properties": {
              "title":       {"type": "string"},
              "description": {"type": "string"},
              "due_date":    {"type": "string"}   # ISO date YYYY-MM-DD
            },
            "required": ["title"]
          }
        }
      },
      "required": ["tasks"]
    }
  }

─────────────────────────────────────────────────────
 GENERATION PATTERN  (POST /tasks/generate)
─────────────────────────────────────────────────────
  resp = await client.messages.create(
      model=MODEL, max_tokens=MAX_TOKENS,
      tools=[CREATE_TASKS_TOOL],
      messages=[{"role": "user",
                 "content": f"Break this goal into 3-7 actionable tasks: {goal}"}]
  )
  tool_block = next(b for b in resp.content if b.type == "tool_use")
  raw_tasks  = tool_block.input["tasks"]

  # Validate + bulk insert in one transaction
  batch_id  = uuid4()
  validated = [t for t in raw_tasks if t.get("title", "").strip()]
  # INSERT all rows with same batch_id and goal_prompt

─────────────────────────────────────────────────────
 RULES
─────────────────────────────────────────────────────
  • Use tool calling — never parse free-text from the model
  • Validate every task: non-empty title required; due_date must be a valid ISO date
  • Bulk insert all tasks in ONE transaction with a shared batch_id
  • Return 422 if PATCH attempts an invalid status transition

─────────────────────────────────────────────────────
 BUILD ORDER
─────────────────────────────────────────────────────
  1  tasks table  →  POST /tasks  →  GET /tasks  →  PATCH /tasks/:id  →  DELETE /tasks/:id
  2  Define CREATE_TASKS_TOOL  →  wire POST /tasks/generate
  3  Extract tool_use block  →  validate  →  bulk insert with batch_id
  4  (Bonus) Due date suggestions from LLM  •  Goal history endpoint`,
  },
  {
    id:       'kanban-board-ai',
    category: 'live-coding',
    title:    'Kanban Board with AI Triage',
    color:    'amber',
    tagline:  'Move cards across columns and let the LLM suggest where they belong',
    duration: '60 min',
    description:
      'A Kanban board interview tests state management, ordered list persistence, and the transition from drag-drop UI to API semantics. The AI triage layer adds an LLM classification call: when a card is created, the model reads the description and suggests a column and priority. Candidates must design the API so AI suggestions are advisory — not authoritative — and can be overridden.',
    core: [
      'POST /cards — create a card with title, description, and column (todo | in_progress | done)',
      'PATCH /cards/:id — move a card to a different column or update its title/description',
      'GET /board — return all cards grouped by column in order',
      'Persist board state so it survives restarts',
    ],
    bonus: [
      'AI triage: on card creation, call the LLM with the card description and return a suggested column and priority',
      'Card ordering within columns — support explicit reordering via position field',
      'Bulk move: move all done cards to an archive endpoint',
    ],
    skillsTested: [
      'Grouped data modeling (cards per column with ordering)',
      'State transition design for column moves',
      'LLM classification integration with graceful fallback',
      'Advisory AI patterns — suggestions vs. enforced decisions',
    ],
    interviewAngles: [
      'How do you persist card order within a column — position integer, linked list, or fractional indexing?',
      'Should AI triage block card creation or happen asynchronously — what are the tradeoffs?',
      'What column assignment strategy do you prompt the LLM with, and how do you validate its output?',
      'How would you handle an AI suggestion the user disagrees with — how is that stored?',
    ],
    interviewApproach: [
      'Design the column enum and card schema before anything else: cards(id, title, description, column, position, created_at). Columns are a fixed enum — no dynamic columns for this interview.',
      'GET /board should return cards grouped by column ({todo: [...], in_progress: [...], done: [...]}) ordered by position — not a flat list.',
      'PATCH /cards/:id handles both column moves and content edits in one endpoint — use PATCH semantics (update only fields present in the body).',
      'AI triage is intentionally async: return 201 immediately on card creation, fire the LLM call in a background task, and expose the suggestion via GET /board without blocking the user.',
      'Always validate LLM triage output: if the model returns an invalid column name, default to \'todo\'. Mention this boundary check explicitly.',
    ],
    clarifyingQuestions: [
      '"Are there exactly three columns (todo/in_progress/done), or are columns configurable by the user?"',
      '"Should card ordering within a column be explicit (draggable) or just insertion order?"',
      '"Should AI triage block card creation or run asynchronously in the background?"',
      '"Can cards be deleted, or only moved to done?"',
      '"Should the AI suggestion be stored and visible, or just silently applied?"',
    ],
    claudeWorkflow: [
      'CLAUDE.md seed: "cards(id UUID PK, title TEXT, description TEXT, column TEXT CHECK IN (\'todo\',\'in_progress\',\'done\'), position INT, ai_suggested_column TEXT, ai_suggested_priority TEXT, created_at TIMESTAMPTZ)"',
      'Plan prompt: "Plan the board API: POST /cards, PATCH /cards/:id (column move + content update), GET /board (cards grouped by column ordered by position). Then plan the async triage background task."',
      'Grouping query prompt: "Write the FastAPI GET /board handler: fetch all cards ordered by column, position; group into a dict {todo: [...], in_progress: [...], done: [...]} in Python."',
      'Triage prompt: "Write the background triage task: call LLM with card title+description, use tool calling to return {column: \'todo\'|\'in_progress\'|\'done\', priority: \'low\'|\'medium\'|\'high\'}, validate, UPDATE card row."',
    ],
    claudeMdContent:
`# Kanban Board with AI Triage
  Card management across 3 columns with position ordering; async AI suggestion on card creation.

─────────────────────────────────────────────────────
 ENVIRONMENT
─────────────────────────────────────────────────────
  Python 3.12 · FastAPI (async) · async SQLAlchemy · asyncpg · Uvicorn

  from anthropic import AsyncAnthropic
  import asyncio
  client     = AsyncAnthropic()
  MODEL      = "claude-haiku-4-5-20251001"
  MAX_TOKENS = 256

─────────────────────────────────────────────────────
 SCHEMA
─────────────────────────────────────────────────────
  cards
    id                    UUID  PRIMARY KEY  DEFAULT gen_random_uuid()
    title                 TEXT  NOT NULL
    description           TEXT
    column                TEXT  NOT NULL     DEFAULT 'todo'
                                             CHECK (column IN ('todo','in_progress','done'))
    position              INT   NOT NULL     DEFAULT 0
    ai_suggested_column   TEXT               -- populated by background triage
    ai_suggested_priority TEXT               -- 'low' | 'medium' | 'high'
    created_at            TIMESTAMPTZ  NOT NULL  DEFAULT now()
    ── index: (column, position ASC)

─────────────────────────────────────────────────────
 ENDPOINTS
─────────────────────────────────────────────────────
  POST   /cards        { title, description?, column? }              →  card object
  GET    /board        ─                                             →  { todo:[...], in_progress:[...], done:[...] }
  PATCH  /cards/:id    { title?, description?, column?, position? }  →  card object
  DELETE /cards/:id    ─                                             →  204

─────────────────────────────────────────────────────
 BOARD QUERY + GROUPING  (GET /board)
─────────────────────────────────────────────────────
  rows  = SELECT * FROM cards ORDER BY column, position ASC
  board = {"todo": [], "in_progress": [], "done": []}
  for card in rows:
      board[card.column].append(card.to_dict())

─────────────────────────────────────────────────────
 TRIAGE TASK  (background, fires after POST /cards)
─────────────────────────────────────────────────────
  CLASSIFY_TOOL = {
    "name": "classify_card",
    "input_schema": {
      "type": "object",
      "properties": {
        "column":   {"type": "string", "enum": ["todo","in_progress","done"]},
        "priority": {"type": "string", "enum": ["low","medium","high"]}
      },
      "required": ["column", "priority"]
    }
  }

  async def triage_card(card_id, title, description):
      resp   = await client.messages.create(
          model=MODEL, max_tokens=MAX_TOKENS, tools=[CLASSIFY_TOOL],
          messages=[{"role": "user",
                     "content": f"Classify:\nTitle: {title}\nDesc: {description}"}]
      )
      result = next(b for b in resp.content if b.type == "tool_use").input
      col    = result["column"] if result["column"] in ("todo","in_progress","done") else "todo"
      await db.execute(
          "UPDATE cards SET ai_suggested_column=$1, ai_suggested_priority=$2 WHERE id=$3",
          col, result["priority"], card_id
      )

  # In POST /cards handler — fire and forget:
  asyncio.create_task(triage_card(new_card.id, body.title, body.description))

─────────────────────────────────────────────────────
 RULES
─────────────────────────────────────────────────────
  • POST /cards returns 201 immediately — triage updates the row in the background
  • Always validate triage output: default to 'todo' if column value is not in the enum
  • position on creation: (SELECT COALESCE(MAX(position), -1) FROM cards WHERE column=$col) + 1
  • Reordering: UPDATE all affected cards' positions in a single transaction

─────────────────────────────────────────────────────
 BUILD ORDER
─────────────────────────────────────────────────────
  1  cards table  →  POST /cards (with position logic)  →  GET /board (grouped)
  2  PATCH /cards/:id (column move + content update)  →  DELETE /cards/:id
  3  Background triage task with CLASSIFY_TOOL
  4  (Bonus) Explicit reordering  •  Bulk archive of done cards`,
  },
  {
    id:       'meeting-notes-summarizer',
    category: 'live-coding',
    title:    'Meeting Notes Summarizer',
    color:    'sky',
    tagline:  'Paste transcripts, get summaries and action items — LLM extraction in practice',
    duration: '60 min',
    description:
      'Meeting notes summarization is a high-signal AI engineering interview: the candidate must ingest unstructured text, prompt an LLM to extract structured output (summary, action items, decisions), persist the result, and allow the user to resume past meetings. The LLM extraction step is the crux — candidates who use structured output constraints or few-shot examples outperform those who rely on freeform prose.',
    core: [
      'POST /meetings — accept a meeting title and raw transcript or notes, persist the raw input',
      'POST /meetings/:id/summarize — call the LLM to generate a summary and extract action items, store results',
      'GET /meetings — list all meetings with title, date, and summary preview',
      'GET /meetings/:id — retrieve the full meeting including raw notes, summary, and action items',
    ],
    bonus: [
      'Task extraction: parse action items from the LLM response and create tasks in a linked task list',
      'Re-summarize: allow the user to re-run summarization with a different prompt or model',
      'Speaker attribution: if the transcript has speaker labels, extract who is responsible for each action item',
    ],
    skillsTested: [
      'LLM prompt design for structured extraction (JSON output with schema)',
      'Storing and retrieving long unstructured text alongside structured summaries',
      'Separation of concerns: raw input vs processed output in the data model',
      'Error handling for LLM calls that return malformed structured output',
    ],
    interviewAngles: [
      'How do you prompt the LLM to return action items as a structured list rather than free prose?',
      'What do you do if the transcript is longer than the LLM context window?',
      'How would you detect that a summary is low quality and needs to be re-generated?',
      'How do you store the relationship between a meeting and the tasks extracted from it?',
    ],
    interviewApproach: [
      'Two lifecycles, never mixed: POST /meetings stores raw notes — no LLM call. POST /meetings/:id/summarize calls the LLM and stores results. Raw notes are never overwritten.',
      'Structured output is the key signal: use tool calling or JSON mode to force the model to return {summary, actionItems, decisions} — not freeform prose that requires downstream parsing.',
      'Schema: store raw_notes, summary, action_items as a JSON array, and summarized_at timestamp on the meetings row. Do not create a separate summaries table for a 60-minute interview.',
      'For long transcripts: mention hierarchical summarization — chunk by paragraph boundary, summarize each chunk, then merge the chunk summaries into a final summary. You don\'t need to implement it, just describe it.',
      'Re-summarize is a natural bonus: "I\'d allow POST /meetings/:id/summarize to overwrite the existing summary — just update the row and reset summarized_at."',
    ],
    clarifyingQuestions: [
      '"Should summarization happen automatically on upload or manually on demand?"',
      '"What structured fields are required in the output — summary + action items, or also decisions, owners, due dates?"',
      '"Is speaker attribution required, or is the transcript unspeakered?"',
      '"Can the user re-summarize with a different prompt or model?"',
      '"What is the expected transcript length — a few paragraphs, or hours of content?"',
    ],
    claudeWorkflow: [
      'CLAUDE.md seed: "meetings(id UUID PK, title TEXT, raw_notes TEXT, summary TEXT, action_items JSONB, decisions JSONB, summarized_at TIMESTAMPTZ, created_at TIMESTAMPTZ)"',
      'Plan prompt: "Plan POST /meetings/:id/summarize: fetch raw_notes, estimate token count, call LLM with tool use to extract {summary, actionItems, decisions}, store results, return structured output."',
      'Tool schema prompt: "Define an Anthropic tool \'structure_meeting\' with output {summary: string, actionItems: [{owner: string, task: string, dueDate: string|null}], decisions: string[]}."',
      'Chunking prompt: "Write the chunking logic: split raw_notes into chunks of max 3000 tokens by paragraph boundary, summarize each chunk individually, then call the LLM once more to merge chunk summaries."',
    ],
    claudeMdContent:
`# Meeting Notes Summarizer
  Ingest raw transcripts; on-demand structured extraction — summary, action items, decisions.

─────────────────────────────────────────────────────
 ENVIRONMENT
─────────────────────────────────────────────────────
  Python 3.12 · FastAPI (async) · async SQLAlchemy · asyncpg · Uvicorn

  from anthropic import AsyncAnthropic
  client     = AsyncAnthropic()
  MODEL      = "claude-haiku-4-5-20251001"
  MAX_TOKENS = 2048

─────────────────────────────────────────────────────
 SCHEMA
─────────────────────────────────────────────────────
  meetings
    id            UUID         PRIMARY KEY  DEFAULT gen_random_uuid()
    title         TEXT         NOT NULL
    raw_notes     TEXT         NOT NULL     -- NEVER overwrite; source of truth
    summary       TEXT                      -- populated by /summarize
    action_items  JSONB                     -- [{owner, task, dueDate}]
    decisions     JSONB                     -- [string]
    summarized_at TIMESTAMPTZ               -- null until first summarization
    created_at    TIMESTAMPTZ  NOT NULL     DEFAULT now()

─────────────────────────────────────────────────────
 ENDPOINTS
─────────────────────────────────────────────────────
  POST   /meetings               { title, raw_notes }   →  { id, created_at }
  POST   /meetings/:id/summarize ─                      →  { summary, action_items, decisions }
  GET    /meetings               ─                      →  [{ id, title, summarized_at, summary_preview }]
  GET    /meetings/:id           ─                      →  full meeting object

─────────────────────────────────────────────────────
 TOOL DEFINITION  (POST /meetings/:id/summarize)
─────────────────────────────────────────────────────
  STRUCTURE_TOOL = {
    "name": "structure_meeting",
    "description": "Extract structured output from meeting notes",
    "input_schema": {
      "type": "object",
      "properties": {
        "summary": {"type": "string"},
        "actionItems": {
          "type": "array",
          "items": {
            "type": "object",
            "properties": {
              "owner":   {"type": "string"},
              "task":    {"type": "string"},
              "dueDate": {"type": "string", "nullable": True}
            },
            "required": ["owner", "task"]
          }
        },
        "decisions": {"type": "array", "items": {"type": "string"}}
      },
      "required": ["summary", "actionItems", "decisions"]
    }
  }

─────────────────────────────────────────────────────
 SUMMARIZATION PATTERN
─────────────────────────────────────────────────────
  resp   = await client.messages.create(
      model=MODEL, max_tokens=MAX_TOKENS,
      tools=[STRUCTURE_TOOL],
      messages=[{"role": "user",
                 "content": f"Extract a structured summary, action items, "
                            f"and decisions from these notes:\n\n{raw_notes}"}]
  )
  result = next(b for b in resp.content if b.type == "tool_use").input
  # UPDATE meetings SET summary=$, action_items=$, decisions=$, summarized_at=now()
  # WHERE id=$id

─────────────────────────────────────────────────────
 RULES
─────────────────────────────────────────────────────
  • POST /meetings stores ONLY raw_notes — zero LLM calls at creation time
  • POST /meetings/:id/summarize is idempotent — re-running overwrites previous output
  • Never discard raw_notes — it is the source of truth even after summarization
  • Long transcripts (> 8k tokens): chunk by paragraph, summarize each, merge summaries

─────────────────────────────────────────────────────
 BUILD ORDER
─────────────────────────────────────────────────────
  1  meetings table  →  POST /meetings  →  GET /meetings/:id  →  GET /meetings
  2  Define STRUCTURE_TOOL  →  wire POST /meetings/:id/summarize
  3  Store structured results, verify JSONB fields are queryable
  4  (Bonus) Task extraction from action_items  •  Re-summarize with different prompt`,
  },
  {
    id:       'bookmark-research-assistant',
    category: 'live-coding',
    title:    'Bookmark Research Assistant',
    color:    'indigo',
    tagline:  'Save links and notes, then ask the AI to synthesize your research',
    duration: '60 min',
    description:
      'A bookmark research assistant combines a simple CRUD note-taking system with an LLM synthesis layer. Users save URLs with notes and tags; the AI reads those notes and synthesizes an answer or summary across all of them. The interview probes tagging data models, keyword search, and how candidates inject user-selected notes as context into the LLM prompt.',
    core: [
      'POST /bookmarks — save a URL with a title, notes, and one or more tags',
      'GET /bookmarks — list all bookmarks with optional tag filter and keyword search',
      'POST /research — accept a question, retrieve relevant bookmarks by keyword/tag, send their notes to the LLM, return a synthesized answer',
      'GET /research/history — list previous research questions with the bookmarks used as context',
    ],
    bonus: [
      'AI topic grouping: call the LLM to cluster saved bookmarks into themes and suggest new tags',
      'Relevance scoring: rank bookmarks by how relevant their notes are to the research question',
      'Auto-tagging: on bookmark creation, call the LLM to suggest tags from the URL and notes',
    ],
    skillsTested: [
      'Many-to-many data modeling (bookmarks ↔ tags)',
      'Keyword search and relevance filtering',
      'LLM context construction from multiple source documents',
      'Research session persistence and replay',
    ],
    interviewAngles: [
      'How do you decide which bookmarks to include in the LLM context for a given question?',
      'How do you model the many-to-many relationship between bookmarks and tags?',
      'What is the maximum number of bookmarks you can inject before hitting the context limit?',
      'How would you rank bookmark relevance without using embeddings?',
    ],
    interviewApproach: [
      'Name the many-to-many relationship immediately: bookmarks ↔ tags via a bookmark_tags junction table. Announce this before writing any query.',
      'GET /bookmarks filtering combines two independent conditions: tag match (JOIN through bookmark_tags) and keyword search (LIKE or FTS on title + notes). Combine with AND.',
      'POST /research is a mini-RAG: retrieve relevant bookmarks by keyword/tag, inject their notes as numbered context blocks, call the LLM to synthesize, store session + which bookmarks were used.',
      'Track the research session\'s source bookmarks — this is both the history requirement and the citation layer. Design the join table (session_bookmarks) alongside the main tables.',
      'Auto-tagging is a clean bonus: fire it asynchronously on bookmark creation. It should suggest tags, not force them — the user should confirm or reject.',
    ],
    clarifyingQuestions: [
      '"Should the research endpoint accept a tag filter alongside the question, or retrieve by relevance only?"',
      '"How many bookmarks should be injected as context — top 5, all matches, or user-configurable?"',
      '"Does research history need to show which specific bookmarks were used for each question?"',
      '"Should auto-tagging block bookmark creation or run asynchronously?"',
      '"Is there a URL uniqueness constraint — can the same URL be bookmarked multiple times?"',
    ],
    claudeWorkflow: [
      'CLAUDE.md seed: "bookmarks(id, url, title, notes, created_at), tags(id, name UNIQUE), bookmark_tags(bookmark_id, tag_id PK), sessions(id, question, answer, created_at), session_bookmarks(session_id, bookmark_id, rank)"',
      'Plan prompt: "Plan POST /research: keyword search bookmarks by title+notes match, rank by relevance, take top 5, build LLM prompt with their notes as numbered context, call model, store session + source bookmarks."',
      'Context builder prompt: "Write the function that formats top-N bookmark notes for the LLM: numbered list where each entry is \'[N] {title}: {notes}\'. System prompt: answer using only these sources, cite by number."',
      'Auto-tag prompt: "Write the background auto-tag task: call LLM with bookmark title+notes, use tool calling to return {suggestedTags: string[]}, upsert each tag, insert into bookmark_tags."',
    ],
    claudeMdContent:
`# Bookmark Research Assistant
  Save bookmarks with tags; keyword search; AI synthesizes answers from selected notes.

─────────────────────────────────────────────────────
 ENVIRONMENT
─────────────────────────────────────────────────────
  Python 3.12 · FastAPI (async) · async SQLAlchemy · asyncpg · Uvicorn

  from anthropic import AsyncAnthropic
  client     = AsyncAnthropic()
  MODEL      = "claude-haiku-4-5-20251001"
  MAX_TOKENS = 1024

─────────────────────────────────────────────────────
 SCHEMA
─────────────────────────────────────────────────────
  bookmarks
    id           UUID  PRIMARY KEY  DEFAULT gen_random_uuid()
    url          TEXT  NOT NULL
    title        TEXT  NOT NULL
    notes        TEXT
    created_at   TIMESTAMPTZ  NOT NULL  DEFAULT now()

  tags
    id           UUID  PRIMARY KEY  DEFAULT gen_random_uuid()
    name         TEXT  UNIQUE NOT NULL

  bookmark_tags                            -- many-to-many junction
    bookmark_id  UUID  NOT NULL     REFERENCES bookmarks(id) ON DELETE CASCADE
    tag_id       UUID  NOT NULL     REFERENCES tags(id) ON DELETE CASCADE
    PRIMARY KEY (bookmark_id, tag_id)

  sessions                                 -- research history
    id           UUID  PRIMARY KEY  DEFAULT gen_random_uuid()
    question     TEXT  NOT NULL
    answer       TEXT  NOT NULL
    created_at   TIMESTAMPTZ  NOT NULL  DEFAULT now()

  session_bookmarks                        -- which bookmarks sourced each answer
    session_id   UUID  NOT NULL     REFERENCES sessions(id)
    bookmark_id  UUID  NOT NULL     REFERENCES bookmarks(id)
    rank         INT   NOT NULL
    PRIMARY KEY (session_id, bookmark_id)

─────────────────────────────────────────────────────
 ENDPOINTS
─────────────────────────────────────────────────────
  POST   /bookmarks         { url, title, notes?, tags?: [str] }  →  bookmark + tags
  GET    /bookmarks         ?q=keyword&tag=name                   →  [bookmark + tags]
  POST   /research          { question, tag?: str }               →  { answer, sources }
  GET    /research/history  ─                                     →  [session + bookmark refs]

─────────────────────────────────────────────────────
 RESEARCH PATTERN  (POST /research)
─────────────────────────────────────────────────────
  # Step 1 — retrieve relevant bookmarks
  SELECT b.* FROM bookmarks b
  [JOIN bookmark_tags bt ON bt.bookmark_id=b.id
   JOIN tags t ON t.id=bt.tag_id WHERE t.name=$tag]
  WHERE (b.title ILIKE $q OR b.notes ILIKE $q)
  LIMIT 5

  # Step 2 — build numbered context
  context = "\n\n".join(
      f"[{i+1}] {b.title}\n{b.notes}" for i, b in enumerate(results)
  )

  # Step 3 — call LLM
  resp = await client.messages.create(
      model=MODEL, max_tokens=MAX_TOKENS,
      system="Answer using only the provided sources. Cite by number [1], [2]...",
      messages=[{"role": "user",
                 "content": f"{context}\n\nQuestion: {question}"}]
  )
  # Store session + session_bookmarks rows

─────────────────────────────────────────────────────
 RULES
─────────────────────────────────────────────────────
  • Announce the many-to-many schema (bookmark_tags) before writing any tag query
  • Store session + session_bookmarks on every /research call (citation + history)
  • Auto-tagging fires async after POST /bookmarks — does not block the 201 response

─────────────────────────────────────────────────────
 BUILD ORDER
─────────────────────────────────────────────────────
  1  bookmarks + tags + bookmark_tags tables  →  POST /bookmarks  →  GET /bookmarks
  2  sessions + session_bookmarks tables
  3  POST /research (retrieve → inject context → call LLM → store session)
  4  GET /research/history with source bookmarks
  5  (Bonus) Auto-tag on creation  •  Embedding-based relevance ranking`,
  },
  {
    id:       'expense-insight-app',
    category: 'live-coding',
    title:    'Expense Insight App',
    color:    'emerald',
    tagline:  'Log expenses, compute totals, and get AI-generated spending analysis',
    duration: '60 min',
    description:
      'An expense insight app extends the classic aggregation interview with an AI analysis layer. Candidates must model financial data cleanly, compute category and monthly totals correctly, and then call an LLM with a structured summary of the user\'s spending to generate natural language insights. The prompt construction step is the AI engineering challenge: how do you represent tabular data to an LLM efficiently?',
    core: [
      'POST /expenses — log an expense with amount, category, date, and optional note',
      'GET /expenses — list all expenses, newest first',
      'GET /expenses/summary — return totals per category and per month',
      'POST /expenses/insights — send the spending summary to the LLM and return plain-language analysis',
    ],
    bonus: [
      'Budget warnings: define a monthly cap per category; flag over-budget in the summary and in the AI prompt',
      'Monthly trend: include month-over-month delta in the summary passed to the LLM',
      'Natural language query: accept "how much did I spend on food in March?" and answer it via LLM',
    ],
    skillsTested: [
      'Aggregation queries (GROUP BY category, year-month)',
      'Monetary precision (integer cents vs decimal)',
      'LLM prompt construction from structured tabular data',
      'Separation of data computation from AI narration',
    ],
    interviewAngles: [
      'How do you represent a spending summary table in the LLM prompt — JSON, markdown, or CSV?',
      'How do you store monetary amounts to avoid floating point precision errors?',
      'Should the AI insights endpoint re-compute the summary or accept it as input — what are the tradeoffs?',
      'How would you cache the insights response to avoid re-calling the LLM on every page load?',
    ],
    interviewApproach: [
      'State the money precision decision immediately: "I\'ll store amounts as integer cents — no floating point. A $9.99 expense is 999 in the DB."',
      'GET /expenses/summary is pure SQL: GROUP BY category (and by year-month for trends). Do not aggregate in Python — let the DB do it.',
      'POST /expenses/insights takes the pre-computed summary as context, not raw expenses. The LLM never touches the raw data.',
      'Represent the spending summary to the LLM as a markdown table (Category | Total | % of spend) — models parse tabular markdown reliably.',
      'Mention caching upfront: "I\'d cache insights keyed on the last expense created_at — if no new expense since the last call, return the cached response."',
    ],
    clarifyingQuestions: [
      '"Should amounts be stored as cents (integer) or as a decimal with a specified precision?"',
      '"Is the insights endpoint synchronous or async — does it block until the LLM responds?"',
      '"What time range should insights cover — all-time, last 30 days, or current month?"',
      '"Are budget limits per category in scope for the core, or bonus?"',
      '"Should insights be cached, or freshly generated on every call?"',
    ],
    claudeWorkflow: [
      'CLAUDE.md seed: "expenses(id UUID PK, amount_cents INT NOT NULL, category TEXT, expense_date DATE, note TEXT, created_at TIMESTAMPTZ). All monetary values in integer cents."',
      'Plan prompt: "Plan POST /expenses/insights: run GROUP BY category SQL to get totals, compute % of total in Python, format as markdown table, call LLM asking for spending analysis + 3 actionable suggestions."',
      'SQL prompt: "Write the SQL for GET /expenses/summary: SELECT category, SUM(amount_cents), COUNT(*), TO_CHAR(expense_date, \'YYYY-MM\') as month GROUP BY category, month ORDER BY SUM(amount_cents) DESC."',
      'Insights prompt: "Write the system + user turn for the LLM insights call. Include the markdown table. Ask: (1) identify the top category, (2) flag anything unusual, (3) give 2 actionable reduction suggestions."',
    ],
    claudeMdContent:
`# Expense Insight App
  Log expenses as integer cents; SQL aggregation by category + month; AI narrates patterns.

─────────────────────────────────────────────────────
 ENVIRONMENT
─────────────────────────────────────────────────────
  Python 3.12 · FastAPI (async) · async SQLAlchemy · asyncpg · Uvicorn

  from anthropic import AsyncAnthropic
  client     = AsyncAnthropic()
  MODEL      = "claude-haiku-4-5-20251001"
  MAX_TOKENS = 512

─────────────────────────────────────────────────────
 SCHEMA
─────────────────────────────────────────────────────
  expenses
    id            UUID  PRIMARY KEY  DEFAULT gen_random_uuid()
    amount_cents  INT   NOT NULL     CHECK (amount_cents > 0)  -- $9.99 → 999, NEVER float
    category      TEXT  NOT NULL
    expense_date  DATE  NOT NULL
    note          TEXT
    created_at    TIMESTAMPTZ  NOT NULL  DEFAULT now()
    ── index: (category, expense_date) for summary GROUP BY

─────────────────────────────────────────────────────
 ENDPOINTS
─────────────────────────────────────────────────────
  POST   /expenses          { amount_cents, category, expense_date, note? }  →  expense object
  GET    /expenses          ─                                                →  [expense] newest first
  GET    /expenses/summary  ─                                                →  [{ category, month, total_cents, count }]
  POST   /expenses/insights ─                                                →  { insights: str }

─────────────────────────────────────────────────────
 SUMMARY QUERY  (GET /expenses/summary)
─────────────────────────────────────────────────────
  SELECT   category,
           TO_CHAR(expense_date, 'YYYY-MM')  AS month,
           SUM(amount_cents)                 AS total_cents,
           COUNT(*)                          AS transaction_count
  FROM     expenses
  GROUP BY category, TO_CHAR(expense_date, 'YYYY-MM')
  ORDER BY month DESC, total_cents DESC

─────────────────────────────────────────────────────
 INSIGHTS PATTERN  (POST /expenses/insights)
─────────────────────────────────────────────────────
  # 1. Compute summary in SQL (same query as above)
  # 2. Format as markdown table for the LLM
  table  = "| Category | Month | Total | Count |\n|---|---|---|---|\n"
  table += "\n".join(
      f"| {r.category} | {r.month} | \${r.total_cents/100:.2f} | {r.transaction_count} |"
      for r in summary_rows
  )
  # 3. Call LLM
  resp = await client.messages.create(
      model=MODEL, max_tokens=MAX_TOKENS,
      messages=[{"role": "user",
                 "content": f"Analyze my spending:\n\n{table}\n\n"
                            f"1. What is my top spending category?\n"
                            f"2. Flag anything unusual.\n"
                            f"3. Give 2 actionable suggestions to reduce spending."}]
  )

─────────────────────────────────────────────────────
 RULES
─────────────────────────────────────────────────────
  • Store amounts as integer cents — NEVER use FLOAT or DECIMAL for money
  • Summary runs in SQL (GROUP BY), not Python loops
  • Insights endpoint takes the pre-computed summary — never re-queries raw expense rows
  • Format summary as markdown table — models parse tabular markdown reliably

─────────────────────────────────────────────────────
 BUILD ORDER
─────────────────────────────────────────────────────
  1  expenses table  →  POST /expenses  →  GET /expenses
  2  GET /expenses/summary (GROUP BY query)
  3  POST /expenses/insights (format table → call LLM)
  4  (Bonus) Budget warnings per category  •  Month-over-month trend`,
  },
  {
    id:       'inventory-assistant',
    category: 'live-coding',
    title:    'Inventory Assistant',
    color:    'amber',
    tagline:  'Track stock levels and let the LLM generate reorder suggestions',
    duration: '60 min',
    description:
      'Inventory management is an interview that tests atomic stock mutations and then extends naturally into AI: once the data is clean, the LLM can read low-stock products and generate reorder recommendations, supplier notes, or purchase orders. The AI step probes whether the candidate can pass structured inventory data to a model and parse its recommendations back into actionable records.',
    core: [
      'POST /products — add a product with name, SKU, price, and initial quantity',
      'PATCH /products/:id/stock — atomically increment or decrement stock by a delta',
      'GET /products — list all products with current stock and low-stock flag',
      'POST /products/reorder-suggestions — send low-stock products to the LLM, return plain-language reorder recommendations',
    ],
    bonus: [
      'CSV import: bulk-create or update products from an uploaded CSV file',
      'Reorder history: store each AI-generated suggestion with the low-stock snapshot that triggered it',
      'Auto-alert threshold: configurable per-product minimum before the low-stock flag activates',
    ],
    skillsTested: [
      'Atomic database updates (preventing negative stock under concurrency)',
      'LLM prompt construction from structured product data',
      'Bulk data ingestion (CSV parsing and upsert logic)',
      'Advisory AI output storage (suggestions vs authoritative records)',
    ],
    interviewAngles: [
      'How do you prevent a stock decrement from going negative under concurrent requests?',
      'What format do you use to present product data to the LLM — and why?',
      'How would you store the AI\'s reorder suggestion so a human can approve or reject it later?',
      'What is your validation strategy for CSV import — what do you do with malformed rows?',
    ],
    interviewApproach: [
      'Atomic stock mutation is the core interview signal: UPDATE products SET quantity = quantity + $delta WHERE id = $id — never read the quantity, modify it in Python, then write it back.',
      'Add a CHECK constraint at the DB level: quantity >= 0. This prevents negative stock even under concurrent requests without application-level locking.',
      'GET /products computes the low_stock flag in SQL (quantity < reorder_threshold) rather than in Python — cleaner and faster.',
      'The reorder endpoint is advisory: store suggestions as a separate table with a product snapshot. The AI\'s output is never an authoritative stock record.',
      'Mention CSV import edge cases proactively: "I\'d validate each row individually — malformed rows get logged to an errors list and returned with the import summary, not silently dropped."',
    ],
    clarifyingQuestions: [
      '"Is the low-stock threshold configurable per product, or a single global value?"',
      '"Should stock decrements be rejected when they would produce negative quantity, or allowed as backorders?"',
      '"Should reorder suggestions be stored for history, or generated on-demand without persistence?"',
      '"Is CSV import in scope for the core, or is it a bonus feature?"',
      '"Does stock mutation need an audit log — who changed what and when?"',
    ],
    claudeWorkflow: [
      'CLAUDE.md seed: "products(id UUID PK, name TEXT, sku TEXT UNIQUE, price_cents INT, quantity INT CHECK (quantity >= 0), reorder_threshold INT DEFAULT 10, created_at TIMESTAMPTZ), reorder_suggestions(id UUID PK, product_snapshot JSONB, suggestion_text TEXT, created_at TIMESTAMPTZ)"',
      'Plan prompt: "Plan PATCH /products/:id/stock: accept a delta (positive or negative), run atomic UPDATE quantity = quantity + delta, check resulting quantity against threshold, return updated product."',
      'Atomic update prompt: "Write the SQL and FastAPI handler for stock mutation. Use UPDATE products SET quantity = quantity + $1 WHERE id = $2 AND quantity + $1 >= 0 RETURNING * — reject if the check fails."',
      'Reorder prompt: "Write POST /products/reorder-suggestions: query products WHERE quantity < reorder_threshold, format as markdown table (SKU | name | current_qty | threshold), call LLM for reorder quantities and notes, insert and return."',
    ],
    claudeMdContent:
`# Inventory Assistant
  Atomic stock mutations with DB-level CHECK constraint; AI reorder suggestions for low-stock items.

─────────────────────────────────────────────────────
 ENVIRONMENT
─────────────────────────────────────────────────────
  Python 3.12 · FastAPI (async) · async SQLAlchemy · asyncpg · Uvicorn

  from anthropic import AsyncAnthropic
  client     = AsyncAnthropic()
  MODEL      = "claude-haiku-4-5-20251001"
  MAX_TOKENS = 1024

─────────────────────────────────────────────────────
 SCHEMA
─────────────────────────────────────────────────────
  products
    id                UUID  PRIMARY KEY  DEFAULT gen_random_uuid()
    name              TEXT  NOT NULL
    sku               TEXT  UNIQUE NOT NULL
    price_cents       INT   NOT NULL     CHECK (price_cents > 0)
    quantity          INT   NOT NULL     DEFAULT 0
                                         CHECK (quantity >= 0)  -- DB-level safety net
    reorder_threshold INT   NOT NULL     DEFAULT 10
    created_at        TIMESTAMPTZ  NOT NULL  DEFAULT now()

  reorder_suggestions
    id               UUID   PRIMARY KEY  DEFAULT gen_random_uuid()
    product_snapshot JSONB  NOT NULL     -- snapshot of low-stock products at call time
    suggestion_text  TEXT   NOT NULL
    created_at       TIMESTAMPTZ  NOT NULL  DEFAULT now()

─────────────────────────────────────────────────────
 ENDPOINTS
─────────────────────────────────────────────────────
  POST   /products                      { name, sku, price_cents, quantity?, reorder_threshold? }
  GET    /products                      ─                    →  [product + low_stock: bool]
  PATCH  /products/:id/stock            { delta: int }       →  { id, quantity, low_stock }
  POST   /products/reorder-suggestions  ─                    →  { suggestion_text, products: [...] }

─────────────────────────────────────────────────────
 ATOMIC STOCK MUTATION  (PATCH /products/:id/stock)
─────────────────────────────────────────────────────
  -- One atomic UPDATE — NEVER read quantity first, modify in Python, then write back
  UPDATE products
  SET    quantity = quantity + $delta
  WHERE  id = $id
    AND  quantity + $delta >= 0           -- extra guard; CHECK constraint is the real net
  RETURNING id, quantity, (quantity < reorder_threshold) AS low_stock

  -- If 0 rows returned → delta would produce negative stock → return HTTP 422

─────────────────────────────────────────────────────
 REORDER PATTERN  (POST /products/reorder-suggestions)
─────────────────────────────────────────────────────
  low_stock = SELECT * FROM products WHERE quantity < reorder_threshold ORDER BY quantity ASC

  table  = "| SKU | Name | Current Qty | Threshold |\n|---|---|---|---|\n"
  table += "\n".join(
      f"| {p.sku} | {p.name} | {p.quantity} | {p.reorder_threshold} |"
      for p in low_stock
  )
  resp = await client.messages.create(
      model=MODEL, max_tokens=MAX_TOKENS,
      messages=[{"role": "user",
                 "content": f"Generate reorder recommendations "
                            f"for these low-stock items:\n\n{table}\n\n"
                            f"For each SKU suggest a reorder quantity and any notes."}]
  )
  # INSERT reorder_suggestions row with product_snapshot + suggestion_text

─────────────────────────────────────────────────────
 RULES
─────────────────────────────────────────────────────
  • NEVER read-then-write stock: use UPDATE quantity = quantity + delta atomically
  • CHECK (quantity >= 0) is the DB safety net — it rejects invalid mutations at the DB level
  • low_stock flag = (quantity < reorder_threshold) computed in SQL, not Python
  • Reorder suggestions are advisory — stored separately, never mutate the products table

─────────────────────────────────────────────────────
 BUILD ORDER
─────────────────────────────────────────────────────
  1  products table  →  POST /products  →  GET /products (with low_stock flag in SQL)
  2  PATCH /products/:id/stock (atomic UPDATE + 422 on negative)
  3  POST /products/reorder-suggestions (query → format table → call LLM → store)
  4  (Bonus) CSV import with per-row validation  •  Stock audit log`,
  },
  {
    id:       'api-usage-dashboard',
    category: 'live-coding',
    title:    'API Usage Dashboard',
    color:    'violet',
    tagline:  'Log API events, visualize metrics, and let the LLM explain anomalies',
    duration: '60 min',
    description:
      'An API usage dashboard tests event ingestion, time-series aggregation, and observability data modeling — then adds an LLM anomaly explanation layer. The candidate must ingest raw API events, compute endpoint-level and time-bucket metrics, expose a filterable dashboard endpoint, and optionally call the LLM to explain unusual patterns in plain language.',
    core: [
      'POST /events — log an API event with endpoint, method, status code, latency, and timestamp',
      'GET /metrics — return aggregated counts, error rates, and average latency grouped by endpoint',
      'GET /events — list raw events with filters for endpoint, date range, and status code',
      'Persist all events durably so the dashboard reflects historical data across restarts',
    ],
    bonus: [
      'AI anomaly explanation: detect endpoints with error rate spikes, send the metric summary to the LLM, return a plain-language diagnosis',
      'Time-bucket grouping: return metrics broken down by hour or day for trend charts',
      'Top-N endpoints: rank by request volume, error count, or p95 latency',
    ],
    skillsTested: [
      'Time-series data modeling and aggregation queries',
      'Filter and pagination API design for event logs',
      'LLM prompt construction from metric data for anomaly narration',
      'Observability patterns: error rate, latency percentiles, throughput',
    ],
    interviewAngles: [
      'How do you compute p95 latency efficiently without storing a full latency distribution?',
      'What does the events table index look like for fast filtering by endpoint and date?',
      'How would you define an "anomaly" programmatically before handing it to the LLM to explain?',
      'Should metrics be pre-aggregated in a summary table or computed on the fly — what drives that choice?',
    ],
    interviewApproach: [
      'Events are append-only: model the table that way from the start — no updates, only inserts. Announce the composite index (endpoint, timestamp) immediately.',
      'GET /metrics is a GROUP BY problem: request_count, error_count, error_rate, avg_latency per endpoint. Implement this in SQL, not in Python loops.',
      'p95 latency cannot come from a simple GROUP BY — mention percentile_cont(0.95) WITHIN GROUP (ORDER BY latency_ms) in Postgres, or acknowledge the trade-off of approximate methods.',
      'Define "anomaly" programmatically before handing anything to the LLM: error_rate > 5% OR avg_latency > 2× global average. The LLM explains — it does not detect.',
      'Time-bucket grouping (date_trunc(\'hour\', timestamp)) is a natural bonus that demonstrates time-series thinking — mention it even if you don\'t implement it.',
    ],
    clarifyingQuestions: [
      '"Is the dashboard global or per-user/per-API-key?"',
      '"Is p95/p99 latency required, or is average sufficient for the core?"',
      '"Should AI anomaly detection run on-demand or on a schedule?"',
      '"What is the expected event volume — hundreds per day or millions?"',
      '"Should raw events be purgeable after a configurable retention window?"',
    ],
    claudeWorkflow: [
      'CLAUDE.md seed: "events(id UUID PK, endpoint TEXT, method TEXT, status_code INT, latency_ms INT, timestamp TIMESTAMPTZ). Index: (endpoint, timestamp). Append-only — no UPDATE or DELETE."',
      'Plan prompt: "Plan GET /metrics: GROUP BY endpoint, compute request_count, error_count, error_rate, avg_latency_ms, p95_latency_ms via percentile_cont. Return as array of endpoint metric objects."',
      'Metrics SQL prompt: "Write the Postgres query for GET /metrics: SELECT endpoint, COUNT(*) as requests, COUNT(*) FILTER (WHERE status_code >= 400) as errors, ROUND(AVG(latency_ms)) as avg_latency, percentile_cont(0.95) WITHIN GROUP (ORDER BY latency_ms) as p95_latency FROM events GROUP BY endpoint ORDER BY requests DESC."',
      'Anomaly prompt: "Write the AI anomaly endpoint: first query endpoints WHERE error_rate > 0.05 OR avg_latency > 2 * (SELECT AVG(latency_ms) FROM events). Format as markdown table, call LLM: \'Explain the likely causes and fixes for these anomalies.\'"',
    ],
    claudeMdContent:
`# API Usage Dashboard
  Append-only event log; per-endpoint aggregation with p95 latency; AI explains anomalies.

─────────────────────────────────────────────────────
 ENVIRONMENT
─────────────────────────────────────────────────────
  Python 3.12 · FastAPI (async) · async SQLAlchemy · asyncpg · Uvicorn

  from anthropic import AsyncAnthropic
  client     = AsyncAnthropic()
  MODEL      = "claude-haiku-4-5-20251001"
  MAX_TOKENS = 512

─────────────────────────────────────────────────────
 SCHEMA
─────────────────────────────────────────────────────
  events                                   -- append-only; NO UPDATE, NO DELETE
    id           UUID         PRIMARY KEY  DEFAULT gen_random_uuid()
    endpoint     TEXT         NOT NULL
    method       TEXT         NOT NULL
    status_code  INT          NOT NULL
    latency_ms   INT          NOT NULL
    timestamp    TIMESTAMPTZ  NOT NULL     DEFAULT now()
    ── index: (endpoint, timestamp DESC)   -- covers metric GROUP BY + time-range filters

─────────────────────────────────────────────────────
 ENDPOINTS
─────────────────────────────────────────────────────
  POST   /events            { endpoint, method, status_code, latency_ms, timestamp? }  →  { id }
  GET    /metrics           ─                 →  [{ endpoint, requests, error_rate, avg_latency, p95_latency }]
  GET    /events            ?endpoint=&from=  →  [event] paginated
  POST   /anomalies/explain ─                 →  { anomalies: [...], analysis: str }

─────────────────────────────────────────────────────
 METRICS QUERY  (GET /metrics)
─────────────────────────────────────────────────────
  SELECT
    endpoint,
    COUNT(*)                                                               AS requests,
    ROUND(
      COUNT(*) FILTER (WHERE status_code >= 400)::NUMERIC
      / NULLIF(COUNT(*), 0) * 100, 1
    )                                                                      AS error_rate_pct,
    ROUND(AVG(latency_ms))                                                 AS avg_latency_ms,
    ROUND(percentile_cont(0.95) WITHIN GROUP (ORDER BY latency_ms))        AS p95_latency_ms
  FROM   events
  GROUP  BY endpoint
  ORDER  BY requests DESC

─────────────────────────────────────────────────────
 ANOMALY DETECT + EXPLAIN  (POST /anomalies/explain)
─────────────────────────────────────────────────────
  # Step 1 — detect in SQL first (never ask the LLM to find anomalies)
  global_avg = SELECT AVG(latency_ms) FROM events
  anomalies  = [r for r in metrics
                if r.error_rate_pct > 5 or r.avg_latency_ms > 2 * global_avg]

  # Step 2 — format and explain
  table  = "| Endpoint | Requests | Error Rate | Avg ms | P95 ms |\n|---|---|---|---|---|\n"
  table += "\n".join(
      f"| {a.endpoint} | {a.requests} | {a.error_rate_pct}% | {a.avg_latency_ms} | {a.p95_latency_ms} |"
      for a in anomalies
  )
  resp = await client.messages.create(
      model=MODEL, max_tokens=MAX_TOKENS,
      messages=[{"role": "user",
                 "content": f"These endpoints have anomalous metrics:\n\n{table}\n\n"
                            f"For each endpoint explain the likely cause and suggest a fix."}]
  )

─────────────────────────────────────────────────────
 RULES
─────────────────────────────────────────────────────
  • events is append-only — say this immediately and announce the composite index
  • p95 latency requires percentile_cont — simple AVG is not acceptable
  • Detect anomalies in SQL first; LLM explains, it does NOT detect
  • Anomaly thresholds: error_rate > 5% OR avg_latency > 2× global average

─────────────────────────────────────────────────────
 BUILD ORDER
─────────────────────────────────────────────────────
  1  events table (with index)  →  POST /events  →  GET /events (with filters)
  2  GET /metrics (GROUP BY + percentile_cont)
  3  POST /anomalies/explain (SQL detection → format table → call LLM)
  4  (Bonus) Time-bucket grouping by hour/day  •  Retention purge endpoint`,
  },
  {
    id:       'notification-center',
    category: 'live-coding',
    title:    'Notification Center',
    color:    'sky',
    tagline:  'Create and manage notifications — with AI grouping and summarization',
    duration: '60 min',
    description:
      'A notification center interview covers read-state management, filter API design, and bulk operations. The AI layer adds a summarization and grouping call: the LLM reads a user\'s recent notifications and generates a digest, or groups similar notifications by topic. The challenge is designing the prompt to work with potentially many short notification strings while staying within context limits.',
    core: [
      'POST /notifications — create a notification with user ID, type, title, and body',
      'PATCH /notifications/:id/read — mark a single notification as read',
      'GET /notifications/:userId — list notifications with optional filter by status (read | unread) and type',
      'Persist notification history and read state durably',
    ],
    bonus: [
      'AI digest: send the user\'s recent unread notifications to the LLM and return a grouped summary (e.g., "3 security alerts, 2 billing updates")',
      'Bulk read: PATCH /notifications/read-all to mark all of a user\'s notifications as read in one operation',
      'TTL expiry: auto-delete notifications older than a configurable number of days',
    ],
    skillsTested: [
      'Read-state modeling and efficient bulk updates',
      'Filter and sort API patterns for notification feeds',
      'LLM summarization of many short text items',
      'TTL and expiry patterns in relational databases',
    ],
    interviewAngles: [
      'How do you implement bulk mark-as-read without locking the entire notifications table?',
      'How do you group many short notification strings into a meaningful LLM prompt without hitting the context limit?',
      'What index makes GET /notifications/:userId?status=unread fast at 10 million rows?',
      'Should notification expiry be a background job or a lazy delete on read — what are the tradeoffs?',
    ],
    interviewApproach: [
      'Design the index before writing the first query: (user_id, is_read) and (user_id, type) cover the two most common filter patterns. Say this out loud.',
      'Bulk mark-as-read is a single UPDATE statement: UPDATE notifications SET is_read=true, read_at=now() WHERE user_id=$id AND is_read=false. Never loop individual IDs.',
      'The AI digest receives notifications as a flat numbered list — the LLM groups by theme and returns a summary sentence. Keep the prompt compact: title + type per item.',
      'TTL expiry: background job running DELETE WHERE created_at < NOW() - interval is the production pattern. Lazy delete on read avoids a scheduled job but leaves stale rows in queries.',
      'Mention the unread count as a natural extension: SELECT COUNT(*) WHERE user_id=$id AND is_read=false should be a separate fast endpoint with its own index, not derived from the full list.',
    ],
    clarifyingQuestions: [
      '"Are notification types a fixed enum or freeform strings?"',
      '"Should the AI digest group by type, priority, or LLM-inferred topic?"',
      '"Is bulk mark-as-read user-scoped only, or can admins operate across users?"',
      '"What is the TTL — is retention configurable per type or global?"',
      '"Should unread count be returned inline with GET /notifications or as a separate endpoint?"',
    ],
    claudeWorkflow: [
      'CLAUDE.md seed: "notifications(id UUID PK, user_id UUID, type TEXT, title TEXT, body TEXT, is_read BOOL DEFAULT false, read_at TIMESTAMPTZ, created_at TIMESTAMPTZ). Index: (user_id, is_read), (user_id, type)."',
      'Plan prompt: "Plan the full notification API: POST create, PATCH /:id/read, PATCH /read-all (bulk), GET /:userId (with status + type filters). Then plan POST /:userId/digest (AI grouping)."',
      'Bulk read prompt: "Write PATCH /notifications/read-all: UPDATE notifications SET is_read=true, read_at=now() WHERE user_id=$1 AND is_read=false RETURNING COUNT(*). Return {updated: count}."',
      'Digest prompt: "Write POST /notifications/:userId/digest: fetch last 50 unread, format as numbered list \'[N] [{type}] {title}\', call LLM: \'Group these notifications by theme and write a 2-sentence plain-English digest.\'"',
    ],
    claudeMdContent:
`# Notification Center
  Per-user notification inbox; bulk read operations; AI digest groups by theme.

─────────────────────────────────────────────────────
 ENVIRONMENT
─────────────────────────────────────────────────────
  Python 3.12 · FastAPI (async) · async SQLAlchemy · asyncpg · Uvicorn

  from anthropic import AsyncAnthropic
  client     = AsyncAnthropic()
  MODEL      = "claude-haiku-4-5-20251001"
  MAX_TOKENS = 512

─────────────────────────────────────────────────────
 SCHEMA
─────────────────────────────────────────────────────
  notifications
    id          UUID         PRIMARY KEY  DEFAULT gen_random_uuid()
    user_id     UUID         NOT NULL
    type        TEXT         NOT NULL
    title       TEXT         NOT NULL
    body        TEXT         NOT NULL
    is_read     BOOL         NOT NULL     DEFAULT false
    read_at     TIMESTAMPTZ
    created_at  TIMESTAMPTZ               DEFAULT now()
    ── index: (user_id, is_read) WHERE is_read = false  -- partial; unread-only queries
    ── index: (user_id, type)                           -- type filter

─────────────────────────────────────────────────────
 ENDPOINTS
─────────────────────────────────────────────────────
  POST   /notifications                    { user_id, type, title, body }  →  { id }
  PATCH  /notifications/:id/read           ─                               →  { ok }
  PATCH  /notifications/:userId/read-all   ─                               →  { updated: N }
  GET    /notifications/:userId            ?status=read|unread&type=       →  [notification]
  POST   /notifications/:userId/digest     ─                               →  { digest: str }

─────────────────────────────────────────────────────
 BULK MARK-AS-READ  (PATCH /notifications/:userId/read-all)
─────────────────────────────────────────────────────
  -- Single UPDATE — NEVER loop individual rows
  UPDATE notifications
  SET    is_read = true,
         read_at = now()
  WHERE  user_id = :user_id
  AND    is_read = false
  RETURNING id

─────────────────────────────────────────────────────
 AI DIGEST  (POST /notifications/:userId/digest)
─────────────────────────────────────────────────────
  # Fetch the 50 most recent unread notifications
  rows    = SELECT type, title FROM notifications
            WHERE user_id = :user_id AND is_read = false
            ORDER BY created_at DESC LIMIT 50

  # Format as a numbered list — one line per notification
  listing = "\n".join(f"{i+1}. [{r.type}] {r.title}" for i, r in enumerate(rows))

  resp = await client.messages.create(
      model=MODEL, max_tokens=MAX_TOKENS,
      messages=[{"role": "user",
                 "content": f"Group these notifications by theme and summarize each group "
                            f"in one sentence:\n\n{listing}"}]
  )

─────────────────────────────────────────────────────
 RULES
─────────────────────────────────────────────────────
  • Bulk read: one UPDATE statement — never fetch then loop-update
  • Announce the partial index on (user_id, is_read WHERE false) before writing unread queries
  • Digest: LLM groups and summarizes — it does NOT filter; filtering happens in SQL first
  • TTL: DELETE WHERE created_at < NOW() - INTERVAL '90 days' (background task)

─────────────────────────────────────────────────────
 BUILD ORDER
─────────────────────────────────────────────────────
  1  notifications table (with indexes)  →  POST /notifications
  2  PATCH /:id/read  →  PATCH /:userId/read-all (single UPDATE)
  3  GET /:userId with ?status and ?type filters
  4  POST /:userId/digest (fetch unread → format list → call LLM)
  5  (Bonus) TTL purge background task  •  unread-count summary endpoint`,
  },
  {
    id:       'habit-coach',
    category: 'live-coding',
    title:    'Habit Coach',
    color:    'teal',
    tagline:  'Track habits and streaks, then ask the AI for a weekly improvement plan',
    duration: '60 min',
    description:
      'A habit coaching app tests streak computation logic, time-series completion tracking, and LLM coaching integration. Candidates must model habits and daily completions, compute current streaks correctly (a streak breaks on any missed day, not just consecutive absences), and call the LLM with the user\'s completion history to generate actionable weekly suggestions.',
    core: [
      'POST /habits — create a habit with a name and target frequency (daily)',
      'POST /habits/:id/complete — log a completion for today',
      'GET /habits — list all habits with current streak and last-completed date',
      'POST /habits/coaching — send the user\'s habit completion history to the LLM and return weekly improvement suggestions',
    ],
    bonus: [
      'Calendar view data: GET /habits/:id/completions?month=YYYY-MM — return a day-by-day completion map for rendering a heatmap',
      'Longest streak: track and return the all-time best streak per habit alongside the current one',
      'Streak freeze: allow the user to protect one missed day per week without breaking their streak',
    ],
    skillsTested: [
      'Streak computation from a completion log (date arithmetic)',
      'Time-series data modeling for habit completions',
      'LLM prompt construction from behavioral history data',
      'Idempotency for completion logging (one per day per habit)',
    ],
    interviewAngles: [
      'How do you compute a streak from a table of completion timestamps — walk through the SQL or code?',
      'How do you prevent a user from logging multiple completions for the same habit on the same day?',
      'What format makes habit history most useful to the LLM — weekly summary, raw dates, or completion percentages?',
      'How would you handle the streak freeze feature without mutating past completion records?',
    ],
    interviewApproach: [
      'Model completions as an append-only log, not a mutable field on the habit: habits(id, name) and completions(id, habit_id, completed_date). Keep them separate.',
      'Idempotency for completion logging: use a UNIQUE constraint on (habit_id, completed_date). INSERT ... ON CONFLICT DO NOTHING — or return 409 Conflict if already logged today.',
      'Streak computation: sort completions DESC by date, walk backward from today, count consecutive days without a gap > 1. Explain this logic to the interviewer before reaching for SQL.',
      'For the coaching endpoint, represent each habit as a 30-day boolean mask (e.g. "1110111011101") — compact, model-friendly, and easy to explain.',
      'Streak freeze is a soft constraint: store a freeze_used_this_week boolean on the habit row. When computing streak, treat one frozen missed day as a completion without mutating the completions log.',
    ],
    clarifyingQuestions: [
      '"Is daily the only frequency, or should habits support weekly/custom targets?"',
      '"Can a user log completions for past dates, or only for today?"',
      '"Should streak freeze (protect one missed day per week) be in scope for the core?"',
      '"Should the coaching endpoint advise per-habit or generate a holistic weekly plan?"',
      '"What timezone should date comparisons use — UTC or user\'s local timezone?"',
    ],
    claudeWorkflow: [
      'CLAUDE.md seed: "habits(id UUID PK, name TEXT, user_id UUID, created_at TIMESTAMPTZ), completions(id UUID PK, habit_id UUID, completed_date DATE, UNIQUE(habit_id, completed_date)). Streak = consecutive days back from today with no gap > 1."',
      'Plan prompt: "Plan GET /habits: for each habit compute current_streak (consecutive days from today with no gap) and last_completed_date. Show the SQL or Python approach."',
      'Streak SQL prompt: "Write a Postgres CTE for streak computation: ORDER completions DESC, use LAG(completed_date) to compute gaps, find the first row where gap > 1 day, count rows before that point."',
      'Coaching prompt: "Write POST /habits/coaching: for each habit build a 30-day boolean mask (1=completed, 0=missed). Format as a table: habit name | current streak | 30-day rate | last-30-days mask. Call LLM: \'Identify patterns and give 3 specific improvement suggestions.\'"',
    ],
    claudeMdContent:
`# Habit Coach
  Track daily habits and streaks; LLM coaches the user on their weekly completion patterns.

─────────────────────────────────────────────────────
 ENVIRONMENT
─────────────────────────────────────────────────────
  Python 3.12 · FastAPI (async) · async SQLAlchemy · asyncpg · Uvicorn

  from anthropic import AsyncAnthropic
  from datetime import date, timedelta
  client     = AsyncAnthropic()
  MODEL      = "claude-haiku-4-5-20251001"
  MAX_TOKENS = 768

─────────────────────────────────────────────────────
 SCHEMA
─────────────────────────────────────────────────────
  habits
    id                    UUID   PRIMARY KEY  DEFAULT gen_random_uuid()
    user_id               UUID   NOT NULL
    name                  TEXT   NOT NULL
    freeze_used_this_week BOOL   NOT NULL     DEFAULT false
    created_at            TIMESTAMPTZ          DEFAULT now()

  completions                                  -- append-only; one row per day per habit
    id              UUID   PRIMARY KEY  DEFAULT gen_random_uuid()
    habit_id        UUID   NOT NULL     REFERENCES habits(id)
    completed_date  DATE   NOT NULL
    created_at      TIMESTAMPTZ         DEFAULT now()
    ── UNIQUE (habit_id, completed_date)        -- idempotency constraint

─────────────────────────────────────────────────────
 ENDPOINTS
─────────────────────────────────────────────────────
  POST  /habits                      { user_id, name }               →  { id }
  POST  /habits/:id/complete         { date? }                       →  { ok, already_logged }
  GET   /habits                      ?user_id=                       →  [{ habit, current_streak, last_completed }]
  POST  /habits/coaching             { user_id }                     →  { suggestions: str }
  GET   /habits/:id/completions      ?month=YYYY-MM                  →  { days: { "YYYY-MM-DD": bool } }

─────────────────────────────────────────────────────
 STREAK CTE  (current streak per habit)
─────────────────────────────────────────────────────
  WITH ordered AS (
    SELECT completed_date,
           LAG(completed_date) OVER (ORDER BY completed_date DESC) AS prev_date
    FROM   completions
    WHERE  habit_id = :habit_id
  ),
  gaps AS (
    SELECT completed_date,
           CASE WHEN prev_date IS NULL
                  OR completed_date - prev_date > 1 THEN 1 ELSE 0
           END AS is_gap
    FROM   ordered
  ),
  streak_groups AS (
    SELECT completed_date,
           SUM(is_gap) OVER (ORDER BY completed_date DESC) AS grp
    FROM   gaps
  )
  SELECT COUNT(*) AS current_streak
  FROM   streak_groups
  WHERE  grp = 0

─────────────────────────────────────────────────────
 COACHING LLM CALL  (POST /habits/coaching)
─────────────────────────────────────────────────────
  # Build a 30-day boolean mask per habit
  today  = date.today()
  days   = [(today - timedelta(days=i)) for i in range(29, -1, -1)]

  table  = "| Habit | Last 30 Days (oldest→newest) |\n|---|---|\n"
  for h in habits:
      done = {c.completed_date for c in h.completions}
      mask = "".join("1" if d in done else "0" for d in days)
      table += f"| {h.name} | {mask} |\n"

  resp = await client.messages.create(
      model=MODEL, max_tokens=MAX_TOKENS,
      messages=[{"role": "user",
                 "content": f"Based on these 30-day habit completion patterns (1=done, 0=missed), "
                            f"give 3 specific weekly improvement suggestions:\n\n{table}"}]
  )

─────────────────────────────────────────────────────
 RULES
─────────────────────────────────────────────────────
  • Streak breaks on any gap > 1 day — use LAG() in a CTE, not Python loops
  • Completion is idempotent: INSERT ... ON CONFLICT (habit_id, completed_date) DO NOTHING
  • Streak freeze: set freeze_used_this_week=true; treat one frozen gap as a completion
  • Coaching: build 30-day mask in Python, pass as a markdown table to the LLM

─────────────────────────────────────────────────────
 BUILD ORDER
─────────────────────────────────────────────────────
  1  habits + completions tables  →  POST /habits  →  POST /habits/:id/complete
  2  GET /habits (list with streak — LAG CTE query)
  3  POST /habits/coaching (30-day mask → call LLM)
  4  (Bonus) GET /:id/completions?month= for calendar heatmap  •  streak freeze logic`,
  },
  {
    id:       'url-monitor-shortener',
    category: 'live-coding',
    title:    'URL Monitor / Shortener',
    color:    'rose',
    tagline:  'Short links with click tracking — AI reads the stats and spots trends',
    duration: '60 min',
    description:
      'A URL shortener / monitor combines unique ID generation, redirect semantics, and click analytics into one compact problem. The AI layer adds a traffic analysis call: the LLM reads aggregated click data and generates a plain-language trend summary. Candidates who reach the bonus features reveal instincts about abuse prevention and caching — both signal production readiness.',
    core: [
      'POST /shorten — accept a long URL, return a unique short code, persist the mapping',
      'GET /:code — redirect to the original URL, record a click event with timestamp',
      'GET /links/:code/stats — return click count, click history by day, and the original URL',
      'GET /links — list all shortened URLs with their click totals',
    ],
    bonus: [
      'AI traffic summary: send the click-by-day stats to the LLM and return a plain-language trend analysis',
      'Link expiry: auto-deactivate links after a configurable number of days',
      'Custom aliases: let callers provide the short code instead of generating one',
    ],
    skillsTested: [
      'Unique ID generation (random, hash-based, or counter + base62)',
      'HTTP redirect semantics (301 cached vs 302 trackable)',
      'Click event ingestion and time-series aggregation',
      'LLM summarization of time-series metric data',
    ],
    interviewAngles: [
      'Why does 301 vs 302 matter for click tracking — which do you use and why?',
      'How do you generate short codes that are unique at scale without a centralized counter?',
      'How do you pass click-by-day stats to the LLM — raw numbers, a chart description, or a markdown table?',
      'What index makes the click history query fast when a single link has millions of clicks?',
    ],
    interviewApproach: [
      'Short code generation is the first decision: random 6-char base62 (62^6 = 56B combinations) is the practical default. Handle collisions with retry-on-unique-constraint-violation up to 5 attempts.',
      'GET /:code must fire the click event asynchronously — return 302 immediately, record the click in a background task. Never block the redirect on a DB write.',
      'State the 301 vs 302 decision explicitly: 302 (temporary redirect) is correct for click tracking — browsers cache 301 permanently and bypass the server on future visits, losing all analytics.',
      'Click stats are a time-series aggregate: store one row per click with timestamp, then GROUP BY date in the stats endpoint. Do not pre-aggregate.',
      'For the AI summary, format click-by-day as a markdown table (Date | Clicks) and ask the LLM to identify trends and likely causes of any spikes.',
    ],
    clarifyingQuestions: [
      '"Should short codes be randomly generated, or can callers provide a custom alias?"',
      '"Is there a link expiry requirement — deactivate after N days or N clicks?"',
      '"Do redirects need to be sub-millisecond (cache-first), or is a DB lookup per redirect acceptable?"',
      '"Should inactive or expired links return 404, 410, or redirect to an error page?"',
      '"Is click deduplication required — should two clicks from the same IP in 30 seconds count as one?"',
    ],
    claudeWorkflow: [
      'CLAUDE.md seed: "links(id UUID PK, original_url TEXT NOT NULL, short_code VARCHAR(12) UNIQUE NOT NULL, created_at TIMESTAMPTZ, expires_at TIMESTAMPTZ, is_active BOOL DEFAULT true), clicks(id UUID PK, link_id UUID FK, clicked_at TIMESTAMPTZ). Index: short_code."',
      'Plan prompt: "Plan the shortener: POST /shorten (generate unique code, persist), GET /:code (fetch URL, fire async click, return 302), GET /links/:code/stats (aggregate clicks by date, return array + total)."',
      'Short code prompt: "Write the short code generator: random.choices over base62 chars for 6 characters, attempt INSERT, catch UniqueViolation, retry up to 5 times, raise HTTPException(500) if all fail."',
      'AI summary prompt: "Write POST /links/:code/ai-summary: GROUP BY DATE(clicked_at) to get [{date, count}], format as markdown table, call LLM: \'Identify the traffic trend and suggest what may have caused any spikes.\'"',
    ],
    claudeMdContent:
`# URL Monitor / Shortener
  Base62 short codes; 302 redirect with async click tracking; LLM traffic trend analysis.

─────────────────────────────────────────────────────
 ENVIRONMENT
─────────────────────────────────────────────────────
  Python 3.12 · FastAPI (async) · async SQLAlchemy · asyncpg · BackgroundTasks · Uvicorn

  import random, string
  from anthropic import AsyncAnthropic
  client     = AsyncAnthropic()
  MODEL      = "claude-haiku-4-5-20251001"
  MAX_TOKENS = 512
  ALPHABET   = string.ascii_letters + string.digits  # 62 chars

─────────────────────────────────────────────────────
 SCHEMA
─────────────────────────────────────────────────────
  links
    id            UUID          PRIMARY KEY  DEFAULT gen_random_uuid()
    original_url  TEXT          NOT NULL
    short_code    VARCHAR(12)   NOT NULL
    created_at    TIMESTAMPTZ                DEFAULT now()
    expires_at    TIMESTAMPTZ                          -- nullable; NULL = never expires
    is_active     BOOL          NOT NULL     DEFAULT true
    ── UNIQUE index on short_code

  clicks                                     -- append-only; one row per visit
    id          UUID         PRIMARY KEY  DEFAULT gen_random_uuid()
    link_id     UUID         NOT NULL     REFERENCES links(id)
    clicked_at  TIMESTAMPTZ  NOT NULL     DEFAULT now()
    ── index: (link_id, clicked_at DESC)   -- covers stats aggregation

─────────────────────────────────────────────────────
 ENDPOINTS
─────────────────────────────────────────────────────
  POST  /shorten               { original_url, expires_in_days? }  →  { short_code, short_url }
  GET   /:code                 ─                                   →  HTTP 302  (async click write)
  GET   /links/:code/stats     ─                                   →  { total_clicks, by_day: [...] }
  GET   /links                 ─                                   →  [{ short_code, url, clicks }]
  POST  /links/:code/ai-summary ─                                  →  { summary: str }

─────────────────────────────────────────────────────
 SHORT CODE GENERATION  (POST /shorten)
─────────────────────────────────────────────────────
  async def generate_unique_code(db, length=6, max_attempts=5) -> str:
      for _ in range(max_attempts):
          code = "".join(random.choices(ALPHABET, k=length))
          try:
              await db.execute(insert(Link).values(short_code=code, ...))
              return code
          except UniqueViolationError:
              continue
      raise HTTPException(status_code=500, detail="Could not generate unique code")

─────────────────────────────────────────────────────
 REDIRECT + ASYNC CLICK  (GET /:code)
─────────────────────────────────────────────────────
  @router.get("/{code}")
  async def redirect(code: str, bg: BackgroundTasks, db: AsyncSession = Depends(get_db)):
      link = await db.scalar(select(Link).where(Link.short_code == code, Link.is_active == True))
      if not link:
          raise HTTPException(404)
      bg.add_task(record_click, link.id)   # non-blocking — 302 returns immediately
      return RedirectResponse(url=link.original_url, status_code=302)

─────────────────────────────────────────────────────
 AI TRAFFIC SUMMARY  (POST /links/:code/ai-summary)
─────────────────────────────────────────────────────
  # Aggregate in SQL; format as markdown table; call LLM
  rows  = SELECT DATE(clicked_at) AS day, COUNT(*) AS clicks
          FROM clicks WHERE link_id = :id
          GROUP BY day ORDER BY day DESC LIMIT 30

  table = "| Date | Clicks |\n|---|---|\n"
  table += "\n".join(f"| {r.day} | {r.clicks} |" for r in rows)

  resp = await client.messages.create(
      model=MODEL, max_tokens=MAX_TOKENS,
      messages=[{"role": "user",
                 "content": f"Analyze this click traffic for a short link and summarize "
                            f"any trends, spikes, or patterns in 2–3 sentences:\n\n{table}"}]
  )

─────────────────────────────────────────────────────
 RULES
─────────────────────────────────────────────────────
  • 302 NOT 301 — browsers permanently cache 301; all future visits skip the server
  • Click recording is always a background task — redirect never waits on the DB write
  • Short code: random base62, retry on UniqueViolationError (max 5 attempts)
  • AI summary: aggregate in SQL first, send a markdown table — never raw click rows

─────────────────────────────────────────────────────
 BUILD ORDER
─────────────────────────────────────────────────────
  1  links table (unique index on short_code)  →  POST /shorten (generate + insert)
  2  clicks table  →  GET /:code (302 + BackgroundTask click write)
  3  GET /links/:code/stats (GROUP BY day)  →  GET /links (totals)
  4  POST /links/:code/ai-summary (aggregate → table → LLM)
  5  (Bonus) Link expiry check on redirect  •  custom alias support`,
  },
  {
    id:       'file-metadata-explorer',
    category: 'live-coding',
    title:    'File Metadata Explorer',
    color:    'indigo',
    tagline:  'Register file records, search and filter them, get AI-generated descriptions',
    duration: '60 min',
    description:
      'A file metadata explorer separates storage from metadata management — the core pattern inside S3, Google Drive, and every object store. Candidates model file records, implement search and filter across metadata fields, and optionally call an LLM to generate a plain-language description from a file\'s name, MIME type, and size. The bonus probes whether candidates understand the upload lifecycle and metadata orphan prevention.',
    core: [
      'POST /files — register a file record with name, size, MIME type, storage URL, and optional tags',
      'GET /files — list all files with search by name and filter by MIME type or tag',
      'GET /files/:id — retrieve full metadata for a single file',
      'GET /search/history — list previous search queries with their result counts',
    ],
    bonus: [
      'AI descriptions: call the LLM with the file name, MIME type, and size to generate a plain-language description of what the file likely contains',
      'File versioning: allow registering a new version of an existing logical file, return the latest by default',
      'TTL expiry: auto-remove metadata records for files older than a configurable number of days',
    ],
    skillsTested: [
      'Data modeling for file system metadata (name, MIME, size, tags, storage URL)',
      'Search and filter API design across heterogeneous metadata fields',
      'LLM prompt construction from structured metadata for content description',
      'Versioning patterns (append-only records vs mutable latest pointer)',
    ],
    interviewAngles: [
      'How do you generate a meaningful AI description from only the filename, MIME type, and size — what goes in the prompt?',
      'How would you implement file versioning — a version column, a separate versions table, or append-only rows?',
      'What is the correct behavior when a file record is deleted but other records reference its storage URL?',
      'How do you prevent metadata orphans when an upload fails after the metadata record is created but before the file is stored?',
    ],
    interviewApproach: [
      'Separate concerns immediately: the API manages metadata only — name, MIME type, size, storage URL. Real file bytes go directly to object storage (S3 or equivalent); the API never touches them.',
      'Tag filtering and name search are independent query paths: filter by exact tag (JOIN through a tags table) and search by name LIKE or FTS. Combine with AND in the WHERE clause.',
      'Versioning: append-only rows with a version integer is simpler than a mutable row + history table. GET /files/:id returns the row with MAX(version) by default.',
      'AI descriptions are generated from metadata alone — the model never sees file content. Prompt: "Given a file named {name} with MIME type {mime} and size {size_mb}MB, describe in 1–2 sentences what it likely contains."',
      'Mention the orphan prevention problem: "I\'d only create the metadata record after confirming the file upload to object storage succeeded — or use a two-phase approach with a pending status."',
    ],
    clarifyingQuestions: [
      '"Should storage URLs point to a real object store, or is a placeholder string acceptable for the interview?"',
      '"Is tag matching exact (case-sensitive) or case-insensitive?"',
      '"Should versioning be append-only (new row per version) or mutable (update the existing row)?"',
      '"Should AI descriptions be generated automatically on upload or on demand via a separate endpoint?"',
      '"Is there a file size or MIME type allowlist I should enforce at the API level?"',
    ],
    claudeWorkflow: [
      'CLAUDE.md seed: "files(id UUID PK, name TEXT, size_bytes BIGINT, mime_type TEXT, storage_url TEXT, version INT DEFAULT 1, is_latest BOOL DEFAULT true, created_at TIMESTAMPTZ), file_tags(file_id UUID, tag TEXT, PRIMARY KEY(file_id, tag)), search_history(id UUID PK, query TEXT, mime_filter TEXT, tag_filter TEXT, result_count INT, created_at TIMESTAMPTZ)"',
      'Plan prompt: "Plan the metadata API: POST /files (insert with version=1, is_latest=true), GET /files (name search + MIME/tag filters), GET /files/:id (latest version), POST /files/:id/describe (AI description)."',
      'Search prompt: "Write GET /files: combine name LIKE filter + optional mime_type = ? + optional tag JOIN through file_tags. Log to search_history with result_count. Return files with their tags as an array."',
      'AI description prompt: "Write POST /files/:id/describe: fetch metadata, compute size_mb = size_bytes / 1e6, call LLM: \'File name: {name}. MIME: {mime}. Size: {size_mb}MB. In 1-2 sentences, what does this file likely contain and how would it typically be used?\'"',
    ],
    claudeMdContent:
`# File Metadata Explorer
  Register file metadata, search by name/MIME/tag, LLM-generated descriptions; versioning.

─────────────────────────────────────────────────────
 ENVIRONMENT
─────────────────────────────────────────────────────
  Python 3.12 · FastAPI (async) · async SQLAlchemy · asyncpg · Uvicorn

  from anthropic import AsyncAnthropic
  client     = AsyncAnthropic()
  MODEL      = "claude-haiku-4-5-20251001"
  MAX_TOKENS = 256

─────────────────────────────────────────────────────
 SCHEMA
─────────────────────────────────────────────────────
  files                                      -- append-only versioned rows
    id           UUID    PRIMARY KEY  DEFAULT gen_random_uuid()
    logical_id   UUID    NOT NULL              -- shared across all versions of a file
    name         TEXT    NOT NULL
    size_bytes   BIGINT  NOT NULL
    mime_type    TEXT    NOT NULL
    storage_url  TEXT    NOT NULL
    version      INT     NOT NULL     DEFAULT 1
    is_latest    BOOL    NOT NULL     DEFAULT true
    created_at   TIMESTAMPTZ          DEFAULT now()
    ── index: (logical_id, version DESC)      -- version lookup
    ── index: (name)  or  tsvector for FTS    -- name search

  file_tags
    file_id  UUID  NOT NULL  REFERENCES files(id)
    tag      TEXT  NOT NULL
    ── PRIMARY KEY (file_id, tag)

  search_history
    id            UUID  PRIMARY KEY  DEFAULT gen_random_uuid()
    query         TEXT
    mime_filter   TEXT
    tag_filter    TEXT
    result_count  INT
    searched_at   TIMESTAMPTZ  DEFAULT now()

─────────────────────────────────────────────────────
 ENDPOINTS
─────────────────────────────────────────────────────
  POST  /files                { name, size_bytes, mime_type, storage_url, tags? }  →  { id, logical_id }
  GET   /files                ?q=&mime=&tag=   →  [file]  (logs search)
  GET   /files/:id            ─                →  latest version of that logical_id
  POST  /files/:id/versions   { storage_url }  →  { id, version }
  POST  /files/:id/describe   ─                →  { description: str }
  GET   /search/history       ─                →  [{ query, mime_filter, tag_filter, result_count }]

─────────────────────────────────────────────────────
 VERSIONING  (POST /files/:id/versions)
─────────────────────────────────────────────────────
  -- Step 1: atomically mark old version as no longer latest
  UPDATE files SET is_latest = false WHERE logical_id = :logical_id AND is_latest = true

  -- Step 2: insert new row with version + 1
  INSERT INTO files (logical_id, name, size_bytes, mime_type, storage_url, version, is_latest)
  SELECT logical_id, name, size_bytes, mime_type, :new_url, MAX(version) + 1, true
  FROM   files WHERE logical_id = :logical_id

─────────────────────────────────────────────────────
 COMBINED SEARCH QUERY  (GET /files)
─────────────────────────────────────────────────────
  SELECT f.*
  FROM   files f
  JOIN   file_tags ft ON ft.file_id = f.id  -- only if tag_filter supplied
  WHERE  f.is_latest = true
  AND    (:q       IS NULL OR f.name ILIKE '%' || :q || '%')
  AND    (:mime    IS NULL OR f.mime_type = :mime)
  AND    (:tag     IS NULL OR ft.tag = :tag)
  ORDER  BY f.created_at DESC

─────────────────────────────────────────────────────
 AI DESCRIPTION  (POST /files/:id/describe)
─────────────────────────────────────────────────────
  size_mb = round(file.size_bytes / 1_048_576, 2)
  resp = await client.messages.create(
      model=MODEL, max_tokens=MAX_TOKENS,
      messages=[{"role": "user",
                 "content": f"Given a file named '{file.name}', MIME type '{file.mime_type}', "
                            f"and size {size_mb}MB, describe in 1–2 sentences what it likely contains."}]
  )

─────────────────────────────────────────────────────
 RULES
─────────────────────────────────────────────────────
  • Versioning: append new row + flip old is_latest in a single transaction
  • GET /files/:id always returns WHERE logical_id = X AND is_latest = true
  • AI description uses only name, mime_type, size_bytes — model never sees file content
  • Log every GET /files call to search_history (include filters + result_count)
  • Tag filter is an exact JOIN — not a LIKE; announce this distinction

─────────────────────────────────────────────────────
 BUILD ORDER
─────────────────────────────────────────────────────
  1  files + file_tags tables  →  POST /files  →  GET /files/:id
  2  GET /files (combined search with ILIKE + tag JOIN + log to search_history)
  3  GET /search/history
  4  POST /files/:id/versions (UPDATE is_latest + INSERT new version)
  5  POST /files/:id/describe (LLM description from metadata only)`,
  },
]
