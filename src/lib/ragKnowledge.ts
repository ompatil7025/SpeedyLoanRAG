/**
 * RAG Knowledge Base — Speedy Loan Finance Services
 * Each chunk has a topic (used for retrieval scoring) and content text.
 */

export interface KnowledgeChunk {
  id: string;
  topics: string[];          // keywords for retrieval matching
  content: string;
}

export const KNOWLEDGE_BASE: KnowledgeChunk[] = [
  // ─── Company Info ────────────────────────────────────────────────────────────
  {
    id: "company_overview",
    topics: ["company", "speedy", "loan", "finance", "services", "about", "who", "founded", "owner", "andromeda", "dsa", "partner", "pune", "maharashtra"],
    content: `Speedy Loan Finance Services is a trusted loan DSA (Direct Selling Agent) firm based in Pune, Maharashtra, India.
Founded: 2020
Owner/Agent: Shashikant Anil Shelke
Office: Office No. P-227, 2nd Floor, Mayur Trade Center, CTS 4533/4, Near Chinchwad Railway Station, Chinchwad, Pimpri-Chinchwad, Pune - 411019
Phone: 73500 05590
Email: loanspeedy@gmail.com
Office Hours: Monday–Saturday, 9:00 AM – 7:00 PM
We are an authorized Andromeda Sales & Distribution partner giving access to 200+ banks and NBFCs across India.
We have helped 1.5M+ customers and facilitate ₹75,000+ Cr in annual disbursals.`,
  },

  // ─── Contact ─────────────────────────────────────────────────────────────────
  {
    id: "contact_details",
    topics: ["contact", "call", "phone", "email", "office", "address", "visit", "location", "reach", "hours", "timing", "where", "number", "whatsapp"],
    content: `Contact Speedy Loan Finance Services:
Phone: 73500 05590 (also WhatsApp)
Email: loanspeedy@gmail.com
Office Hours: Monday–Saturday, 9:00 AM – 7:00 PM (closed Sunday)
Address: Office No. P-227, 2nd Floor, Mayur Trade Center, CTS 4533/4, Near Chinchwad Railway Station, Chinchwad, Pimpri-Chinchwad, Pune - 411019, Maharashtra
Services: Walk-in consultations (free), Phone consultation, Doorstep service (Pune region), WhatsApp support`,
  },

  // ─── Personal Loan ───────────────────────────────────────────────────────────
  {
    id: "personal_loan_details",
    topics: ["personal", "loan", "pl", "instant", "quick", "salary", "consumer", "unsecured", "individual", "amount", "interest", "rate", "tenure", "personal loan"],
    content: `Personal Loan — Speedy Loan Finance Services:
Amount: ₹50,000 – ₹40 Lakhs
Interest Rate: 10.5% – 24% p.a.
Tenure: 12 – 60 months
Processing Time: Same day to 72 hours
Purpose: Medical emergencies, travel, wedding, education, debt consolidation, any personal need
Available for: Salaried & self-employed individuals
Eligibility:
- Age: 21–60 years
- Minimum Income: ₹15,000/month (salaried)
- CIBIL Score: 700+ (650+ considered for some lenders)
- Employment: 2+ years, minimum 1 year with current employer
Documents Required:
- Aadhaar Card & PAN Card (mandatory)
- Last 3 months salary slips
- 6 months bank statement
- Form 16 / ITR
- Address proof
EMI Example: ₹10 Lakh @ 12% for 5 years = approximately ₹22,244/month
Banks: HDFC, ICICI, Axis, Bajaj Finance, Tata Capital, Kotak, SBI, Federal Bank, Yes Bank and 200+ more`,
  },

  // ─── Home Loan ───────────────────────────────────────────────────────────────
  {
    id: "home_loan_details",
    topics: ["home", "house", "housing", "property", "mortgage", "flat", "apartment", "construction", "renovation", "purchase", "home loan", "housing loan"],
    content: `Home Loan — Speedy Loan Finance Services:
Amount: Up to ₹5 Crore (salaried) / Up to ₹50 Crore (for corporates)
Interest Rate: 8.40% – 12% p.a.
Tenure: Up to 30 years
Purpose: New home purchase, plot + construction, home renovation, balance transfer + top-up
Eligibility:
- Age: 21–65 years
- CIBIL Score: 700+
- Stable income (salaried or self-employed)
- Clear repayment track record
Property Types Accepted: Builder purchase, resale property, plot construction, residential, commercial
Documents Required:
- KYC (Aadhaar + PAN + Passport/Voter ID)
- Income proof (salary slips 3 months / ITR 2 years)
- 12 months bank statement
- Property documents & title deed
- Approved building plan / occupancy certificate
- Sale agreement / allotment letter
- Passport-size photographs
EMI Example: ₹50 Lakh @ 8.5% for 20 years = approximately ₹43,391/month
Banks: HDFC, SBI, ICICI, Axis, Kotak Mahindra, Bank of Baroda, PNB, LIC Housing and 200+ more`,
  },

  // ─── Business Loan ───────────────────────────────────────────────────────────
  {
    id: "business_loan_details",
    topics: ["business", "bl", "expansion", "startup", "enterprise", "commercial", "trade", "shop", "firm", "company", "business loan", "small business", "merchant"],
    content: `Business Loan — Speedy Loan Finance Services:
Amount: ₹2 Lakhs – ₹2 Crore (unsecured) / Up to ₹50 Crore (secured)
Interest Rate: 12% – 26% p.a.
Tenure: 12 – 48 months
Purpose: Business expansion, working capital, equipment purchase, inventory, new branch, technology upgrade
Eligibility:
- Business vintage: Minimum 2 years
- Annual turnover: ₹10 Lakhs+
- CIBIL Score: 700+ (or business CIBIL healthy)
- GST-registered business preferred
Documents Required:
- KYC of owner (Aadhaar + PAN)
- GST registration certificate + 12 months GST returns
- ITR with computation (last 2–3 years)
- 12 months current account bank statement
- Business address proof (electricity bill / rent agreement)
- Partnership deed / MOA & AOA (if applicable)
- Audited balance sheet & profit & loss statement
EMI Example: ₹25 Lakh @ 15% for 3 years = approximately ₹86,667/month
Partners: Bajaj Finance, HDFC, ICICI, Tata Capital, Axis, IDFC First, AU Small Finance and 200+ lenders`,
  },

  // ─── Working Capital ─────────────────────────────────────────────────────────
  {
    id: "working_capital_details",
    topics: ["working capital", "cash credit", "overdraft", "cc", "od", "daily operations", "business operations", "inventory", "debtors", "stock", "current assets", "working capital loan"],
    content: `Working Capital Loan — Speedy Loan Finance Services:
Facility Types: Cash Credit (CC), Overdraft (OD), Invoice Discounting
Amount: Based on business turnover (typically 20–25% of annual sales). Up to ₹100 Crore for corporates
Interest Rate: 9% – 16% p.a. (charged only on the amount actually used)
Tenure: Renewed annually after bank review
Purpose: Managing daily business operations, purchasing raw materials, paying salaries, maintaining inventory
Security: Stock, debtors, property pledge
Eligibility:
- Business vintage: 2+ years
- Healthy bank statement with regular credits
- GST-registered business
- CIBIL: 700+
Documents Required:
- GST returns (last 12 months)
- 12 months bank statement
- ITR with audited financials (balance sheet + P&L)
- KYC & business proof
- Stock statement
- List of debtors/creditors
Banks: SBI, HDFC, ICICI, Axis, Kotak, Bank of Baroda and 200+ lenders`,
  },

  // ─── Loan Against Property ───────────────────────────────────────────────────
  {
    id: "lap_details",
    topics: ["loan against property", "lap", "property loan", "mortgage loan", "property", "against property", "collateral", "secured", "lap loan"],
    content: `Loan Against Property (LAP) — Speedy Loan Finance Services:
Amount: Up to 65% of property market value (up to ₹100 Crore)
Interest Rate: 9% – 14% p.a.
Tenure: Up to 20 years
Property Types Accepted: Residential, commercial, industrial property
Purpose: Business expansion, medical emergency, child education, debt consolidation, any high-value need
Advantage: Lower interest rate than personal loan, higher amount, longer tenure
Eligibility:
- Property in your name with clear title
- CIBIL Score: 650+
- Regular income source (salaried or self-employed)
- Age: 21–65 years
Documents Required:
- KYC documents (Aadhaar + PAN)
- Income proof (salary slips / ITR)
- Property title deed (original)
- Property tax receipts (last 3 years)
- Valuation report from approved valuer
- 12 months bank statement
- Legal opinion report on property
Banks: HDFC, SBI, ICICI, Axis, Bajaj Finance, Tata Capital, LIC Housing and 200+ more`,
  },

  // ─── Balance Transfer ─────────────────────────────────────────────────────────
  {
    id: "balance_transfer_details",
    topics: ["balance transfer", "bt", "transfer loan", "switch bank", "refinance", "lower rate", "reduce emi", "top up", "existing loan"],
    content: `Balance Transfer — Speedy Loan Finance Services:
How it works: Transfer your existing high-interest loan to a lender offering lower interest rates
Top-up option: Get additional funds alongside the transfer
Suitable for: Home loans with high interest rates, personal loans from NBFCs at 18%+, business loans with rigid terms
Benefits:
- Save ₹500–₹5,000+ per month on EMI
- Improved loan terms & flexibility
- Top-up facility available simultaneously
- Minimal paperwork
Works for: Home Loans, Personal Loans, Business Loans
Documents Required:
- Existing loan statement (12 months)
- NOC from current lender
- KYC & income proof
- Foreclosure letter from current bank
- New bank application + documents
Processing: Usually 7–15 working days
We compare 200+ banks to get you the best rate available`,
  },

  // ─── Education Loan ──────────────────────────────────────────────────────────
  {
    id: "education_loan_details",
    topics: ["education", "study", "college", "student", "abroad", "university", "school", "course", "education loan", "study loan", "student loan"],
    content: `Education Loan — Speedy Loan Finance Services:
Amount: Up to ₹50 Lakhs (India studies) / Up to ₹1.5 Crore (abroad studies)
Interest Rate: 8.5% – 13% p.a.
Moratorium Period: Course duration + 6 months (no EMI during study)
Eligible Courses: Engineering, Medicine, Law, MBA, MBBS, CA, Architecture, Undergraduate, Postgraduate, Technical courses
Countries: India and all major study abroad destinations (USA, UK, Canada, Australia, Germany, etc.)
Tax Benefit: Interest is 100% tax-deductible under Section 80E of Income Tax Act (no upper limit)
Eligibility:
- Indian student with valid admission to recognized institution
- Age: 18–35 years (student); co-applicant (parent/guardian) required
Documents Required:
- Admission letter from institution
- Fee structure document from college
- KYC of student & parent/guardian (Aadhaar + PAN)
- Parent/guardian income proof (salary slips / ITR)
- Academic mark sheets (10th, 12th, graduation)
- Scholarship letter (if applicable)
- GRE/GMAT/IELTS scores (for abroad)
Banks: SBI, Bank of Baroda, HDFC Credila, Axis, ICICI and specialized education loan NBFCs`,
  },

  // ─── Insurance & Investment ──────────────────────────────────────────────────
  {
    id: "insurance_investment_details",
    topics: ["insurance", "investment", "mutual fund", "sip", "term plan", "life insurance", "health insurance", "wealth", "ulip", "nps", "fd", "equity", "bonds", "portfolio"],
    content: `Insurance & Investment Services — Speedy Loan Finance Services:
Insurance Products:
- Term Life Insurance: Pure protection from ₹25 Lakh to ₹10 Crore+, low premium
- Health Insurance: Individual & family floater, cashless at 10,000+ hospitals
- Critical Illness Cover: Lump sum payout on diagnosis
- Family Floater Plans: Cover entire family under one policy
- Loan Protection Insurance: Covers EMI in case of job loss or disability
- Business Insurance: Fire, liability, keyman insurance

Investment Products:
- Mutual Funds: SIP starting from ₹500/month, diversified equity & debt
- Fixed Deposits: Guaranteed returns through partner banks & NBFCs
- NPS (National Pension System): Long-term retirement planning
- Equity & Bonds: Market-linked growth opportunities
- ULIP Plans: Insurance + investment combination products

Why choose us:
- Free financial planning consultation
- Unbiased product recommendations from 50+ insurers
- Tax planning guidance (80C, 80D, 80E deductions)
- Regular portfolio review
Tax Benefits: Up to ₹1.5L under 80C (ELSS, PPF, LIC), ₹25K–₹75K under 80D (health insurance)`,
  },

  // ─── Eligibility ─────────────────────────────────────────────────────────────
  {
    id: "eligibility_criteria",
    topics: ["eligible", "eligibility", "qualify", "cibil", "credit score", "can i get", "am i eligible", "approval", "criteria", "requirement", "income", "age", "employment"],
    content: `Loan Eligibility Criteria — Speedy Loan Finance Services:
For Salaried Individuals:
- Age: 21–60 years
- Minimum Income: ₹15,000/month net salary
- Employment: 2+ years total, minimum 1 year with current employer
- CIBIL Score: 700+ (650+ considered for some products)
- Existing EMIs: Should not exceed 40–50% of monthly income

For Self-Employed / Business Owners:
- Age: 21–65 years
- Business Vintage: Minimum 2–3 years of continuous operation
- ITR Filed: Last 2–3 years mandatory
- CIBIL Score: 700+ (650+ for secured loans)
- Turnover: Minimum ₹10 Lakhs/year (business loans)

CIBIL Score Impact:
- 750 and above: Best rates, fastest approval, all banks available
- 700–749: Good rates, most banks available, quick approval
- 650–699: Higher interest rates, fewer banks, some products only
- Below 650: Difficult approval, very few options, work on improving score first

Factors affecting approval: CIBIL score, income stability, existing loan obligations, employer/business reputation, property location (for secured loans)
Tip: Check your free CIBIL score at Equifax or CIBIL official website before applying`,
  },

  // ─── EMI Calculator ──────────────────────────────────────────────────────────
  {
    id: "emi_calculator",
    topics: ["emi", "monthly payment", "instalment", "installment", "calculate", "repayment", "how much", "calculator", "formula", "payment"],
    content: `EMI Calculator & Reference Guide — Speedy Loan Finance Services:
EMI Formula: EMI = P × r × (1+r)^n ÷ [(1+r)^n - 1]
Where: P = Principal amount, r = Monthly interest rate (annual rate ÷ 12 ÷ 100), n = Tenure in months

Sample EMI Table:
- ₹5 Lakh @ 12% for 3 years = EMI approximately ₹16,607/month
- ₹10 Lakh @ 12% for 5 years = EMI approximately ₹22,244/month
- ₹20 Lakh @ 10.5% for 5 years = EMI approximately ₹43,041/month
- ₹30 Lakh @ 9% for 10 years = EMI approximately ₹37,996/month
- ₹50 Lakh @ 8.5% for 20 years = EMI approximately ₹43,391/month
- ₹1 Crore @ 9% for 20 years = EMI approximately ₹89,973/month
- ₹25 Lakh @ 15% for 3 years = EMI approximately ₹86,667/month
- ₹2 Lakh @ 18% for 2 years = EMI approximately ₹9,978/month

Tip: To calculate your exact EMI, share: loan amount, interest rate, and preferred tenure. A higher CIBIL score gets you a lower rate which means lower EMI.`,
  },

  // ─── Interest Rates ──────────────────────────────────────────────────────────
  {
    id: "interest_rates",
    topics: ["interest rate", "rate", "roi", "lowest rate", "best rate", "interest", "percentage", "pa", "per annum", "how much interest", "rate of interest"],
    content: `Current Interest Rates — Speedy Loan Finance Services:
Home Loan: 8.40% – 12% p.a.
Education Loan: 8.5% – 13% p.a.
Loan Against Property (LAP): 9% – 14% p.a.
Working Capital Loan: 9% – 16% p.a.
Business Loan: 12% – 26% p.a.
Personal Loan: 10.5% – 24% p.a.
Balance Transfer: Depends on new lender (typically 0.5%–2% lower than current rate)
Insurance & Investment: Not applicable (product-dependent returns)

Factors affecting your rate:
- CIBIL score (higher score = lower rate, biggest factor)
- Income stability and employment type
- Loan amount and tenure
- Existing relationship with bank
- Type of collateral (secured loans get lower rates)
- Lender competition (we compare 200+ banks for you)

Best rates available with CIBIL 750+. We compare all 200+ bank partners to get you the lowest possible EMI.`,
  },

  // ─── Documents ───────────────────────────────────────────────────────────────
  {
    id: "documents_required",
    topics: ["document", "papers", "paperwork", "required", "kyc", "aadhaar", "pan", "salary slip", "bank statement", "itr", "form 16", "gst", "what do i need"],
    content: `Documents Required for Loan Application — Speedy Loan Finance Services:
Common KYC Documents (Required for ALL loan types):
- Aadhaar Card (identity + address proof)
- PAN Card (mandatory for all)
- Passport-size photographs (2–3)

For Salaried Employees:
- Last 3 months salary slips
- 6 months bank statement (salary account)
- Form 16 / ITR (last 2 years)
- Employment offer letter / employee ID card
- Appointment letter (sometimes required)

For Self-Employed / Business Owners:
- ITR with computation (last 2–3 years)
- 12 months business/current account bank statement
- GST registration certificate + GST returns (12 months)
- Audited balance sheet & profit & loss statement
- Business registration proof (shop act, MSME certificate, MOA, partnership deed)
- Business address proof

For Property-Related Loans (Home Loan / LAP):
- Property title deed (original, chain of title)
- Property tax receipts (latest)
- Approved building plan / occupancy certificate
- Sale agreement / allotment letter
- Valuation report from approved valuer
- Legal opinion report

The exact list depends on loan type. Ask for loan-specific document checklist.`,
  },

  // ─── Banks & Partners ────────────────────────────────────────────────────────
  {
    id: "banks_partners",
    topics: ["bank", "banks", "nbfc", "partner", "lender", "andromeda", "hdfc", "sbi", "icici", "axis", "kotak", "bajaj", "tata capital", "pnb", "yes bank", "iifl", "which bank"],
    content: `Banks & NBFCs — Speedy Loan Finance Services Partner Network:
We are an authorized Andromeda Sales & Distribution partner with access to 200+ banks and NBFCs across India.

Major Bank Partners:
- HDFC Bank
- State Bank of India (SBI)
- ICICI Bank
- Axis Bank
- Kotak Mahindra Bank
- Punjab National Bank (PNB)
- Bank of India (BOI)
- Bank of Baroda (BOB)
- Central Bank of India
- Federal Bank
- Yes Bank
- IndusInd Bank
- IDFC First Bank
- AU Small Finance Bank

Major NBFC Partners:
- Bajaj Finance / Bajaj Finserv
- Tata Capital
- HDB Financial Services
- Piramal Finance
- Muthoot Finance
- L&T Finance
- Aditya Birla Finance
- Shriram Finance
- Cholamandalam Finance
- IIFL Finance
- Ugro Capital

We have DSA codes for all major banks. Sub-agents can get location-wise codes for loan sourcing through our Andromeda partnership.`,
  },

  // ─── Government Schemes ──────────────────────────────────────────────────────
  {
    id: "government_schemes",
    topics: ["government", "scheme", "mudra", "cgtmse", "pmegp", "udyam", "msme", "subsidy", "collateral free", "guarantee", "startup india", "stand up india"],
    content: `Government Loan Schemes — Speedy Loan Finance Services:
MUDRA Loan (Pradhan Mantri MUDRA Yojana):
- Shishu: Up to ₹50,000 (for new/micro businesses)
- Kishore: ₹50,001 – ₹5 Lakhs (for growing businesses)
- Tarun: ₹5 Lakhs – ₹10 Lakhs (for established businesses)
- No collateral required, low interest rates
- For manufacturing, trading, services MSMEs

CGTMSE (Credit Guarantee Fund Trust for Micro & Small Enterprises):
- Collateral-free loans up to ₹2 Crore for MSMEs
- Government guarantee covers 75–85% of loan amount
- Banks feel secure to lend without collateral due to government guarantee

PMEGP (Prime Minister's Employment Generation Programme):
- For setting up new enterprises
- Subsidy of 15–35% on project cost
- Available through KVIC, KVIB, DIC offices

Udyam Registration: Mandatory for all MSME loans and government scheme benefits. Register free at udyam.gov.in.

Stand Up India: Loans of ₹10 Lakh – ₹1 Crore for SC/ST/women entrepreneurs.
We help with all government scheme applications, documentation, and follow-up.`,
  },

  // ─── Wealth Management ───────────────────────────────────────────────────────
  {
    id: "wealth_management",
    topics: ["wealth", "management", "financial planning", "portfolio", "grow money", "financial advisor", "retirement", "goal", "savings", "investment planning"],
    content: `Wealth Management — Speedy Loan Finance Services:
Our Wealth Services:
- Personalized financial goal planning (retirement, child education, wealth creation)
- Equity & Mutual Fund advisory with regular review
- Fixed Deposit & Bond investments for guaranteed returns
- Insurance planning (life + health protection)
- Real estate investment guidance
- Tax optimization strategies (80C, 80D, 80E, 54EC)

Our Process:
1. Understand your financial goals and timeline
2. Assess your risk appetite (conservative / moderate / aggressive)
3. Create a diversified investment plan
4. Execute investments with best products
5. Regular monitoring & rebalancing quarterly

Tax Benefits Available:
- Section 80C: Up to ₹1.5L deduction (ELSS, PPF, LIC, EPF, NSC)
- Section 80D: ₹25K–₹75K (health insurance premiums)
- Section 80E: Full interest deduction on education loan
- Section 54EC: Capital gains exemption through bonds

Free initial consultation. No hidden charges. Comprehensive financial planning for every life stage.`,
  },

  // ─── Why Choose Us ───────────────────────────────────────────────────────────
  {
    id: "why_choose_us",
    topics: ["why", "choose", "benefit", "advantage", "speedy", "best", "feature", "services", "unique", "compare", "trust", "reliable"],
    content: `Why Choose Speedy Loan Finance Services:
- 200+ banking partners through Andromeda network — get the best rate from multiple lenders
- Free loan counselling — no hidden charges, transparent process
- Minimal paperwork with doorstep service available across Pune
- Fastest approval — same day approval in many cases, disbursal within 72 hours
- Dedicated relationship manager assigned for every customer
- Experienced team — handling loans since 2020
- All loan types under one roof — personal, home, business, LAP, working capital, insurance
- Government scheme expertise — MUDRA, CGTMSE, PMEGP assistance
- Multi-bank comparison — we submit to 5+ banks and present you the best offer
- Post-disbursement support — balance transfer, top-up assistance
- 1.5M+ customers served | ₹75,000+ Crore annual disbursals`,
  },

  // ─── Process & Steps ────────────────────────────────────────────────────────
  {
    id: "loan_process",
    topics: ["process", "how to apply", "steps", "procedure", "how does it work", "apply", "application", "approval", "disbursal", "timeline", "how long"],
    content: `Loan Application Process — Speedy Loan Finance Services:
Step 1 — Free Consultation: Share your requirements (loan type, amount, income) with us. We assess your eligibility across 200+ lenders.
Step 2 — Document Collection: We provide a precise checklist. Doorstep document pickup available in Pune.
Step 3 — Multi-Bank Submission: We submit your application to 5+ best-matched banks simultaneously.
Step 4 — Bank Processing: Banks verify documents, conduct credit check, property valuation (if applicable).
Step 5 — Offer Comparison: We present you multiple bank offers with rate comparison. You choose the best.
Step 6 — Approval & Disbursement: Loan approved and disbursed directly to your account.

Timeline:
- Personal Loan: 24 hours to 7 working days
- Business Loan: 3–10 working days
- Home Loan: 7–21 working days
- LAP: 10–21 working days

Contact us at 73500 05590 to start your loan journey today!`,
  },
];
