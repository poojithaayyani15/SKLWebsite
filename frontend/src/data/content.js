export const COMPANY = {
  name: "SKL Enterprises",
  founder: "E.L. Ashok Anand",
  founderTitle: "Founder & Managing Director",
  positioning: "Technology-Driven Public Service Solutions",
  tagline: "Empowering Digital Citizen Services Across India",
  vision:
    "To simplify access to government and digital citizen services through technology, operational excellence and trusted service delivery.",
  mission:
    "To deliver reliable, efficient and accessible digital services for individuals, businesses and institutions — bridging citizens with essential government programmes through technology and trusted execution.",
  values: [
    { title: "Quality", desc: "Uncompromising standards in every service we deliver, from first enquiry to final delivery." },
    { title: "Trust", desc: "Transparency, integrity and dependability at the core of every citizen and partner relationship." },
    { title: "Commitment", desc: "A relentless focus on outcomes, deadlines and the communities we serve." },
  ],
  address: "No. 2, Shop No. 6, 2nd Street, Race View Colony, Guindy, Chennai – 600032, Tamil Nadu, India",
  phone: "+91 95516 11666",
  phoneRaw: "+919551611666",
  whatsapp: "+91 94984 00986",
  whatsappRaw: "919498400986",
  email: "sklenterprises@zohomail.in",
  hours: "Monday – Saturday: 9:30 AM – 6:30 PM · Sunday: Closed",
  mapQuery: "Race View Colony, Guindy, Chennai, Tamil Nadu 600032",
  partnership: "SKL Enterprises serves as the South India Channel Partner of EAS, supporting the implementation and expansion of digital public service initiatives across the region.",
};

export const IMAGES = {
  heroOffice: "https://images.unsplash.com/photo-1560264280-88b68371db39?crop=entropy&cs=srgb&fm=jpg&q=85&w=1600",
  leadership: "https://images.unsplash.com/photo-1531973576160-7125cd663d86?crop=entropy&cs=srgb&fm=jpg&q=85&w=1200",
  officeTeam: "https://images.pexels.com/photos/7580644/pexels-photo-7580644.jpeg?auto=compress&cs=tinysrgb&w=1200",
  careers: "https://images.pexels.com/photos/7581016/pexels-photo-7581016.jpeg?auto=compress&cs=tinysrgb&w=1200",
  apaarHero: "/apaar.png",
  apaarContent: "/apaar.png",
  panHero: "/pan2.png",
  panContent: "/pan2.png",
};

export const STATS = [
  { value: 2, suffix: "", label: "Flagship National Projects" },
  { value: 12, suffix: "+", label: "Districts Targeted" },
  { value: 500, suffix: "+", label: "Agent Network Capacity" },
  { value: 100, suffix: "%", label: "Digital-First Delivery" },
];

export const SERVICES = [
  { title: "Digital Citizen Services", desc: "End-to-end facilitation of government digital services for citizens, students and institutions.", icon: "Users" },
  { title: "Identity & Document Solutions", desc: "Secure identity enrolment, verification and document management aligned with government standards.", icon: "ShieldCheck" },
  { title: "Agent Network Enablement", desc: "Recruiting, training and empowering a trusted field workforce across South India.", icon: "Network" },
  { title: "Technology Infrastructure", desc: "Reliable digital infrastructure and operations that scale service delivery with accuracy.", icon: "Server" },
  { title: "Operational Excellence", desc: "Process-driven execution ensuring speed, transparency and consistency at every touchpoint.", icon: "Gauge" },
  { title: "Citizen Support & Enquiry", desc: "Responsive multi-channel support for citizens navigating government programmes.", icon: "Headset" },
];

export const WHY_US = [
  { title: "Government-Aligned Delivery", desc: "Services structured around official government programmes and publicly available guidelines." },
  { title: "Trusted Field Workforce", desc: "A vetted, trained network of coordinators and agents delivering services at the last mile." },
  { title: "Technology at the Core", desc: "Digital-first operations that reduce friction, errors and turnaround time for citizens." },
  { title: "Transparent & Accountable", desc: "Clear processes, documented status and dependable communication at every stage." },
];

export const FOUNDER = {
  name: "E.L. Ashok Anand",
  title: "Founder & Managing Director",
  photo: "/founder.png", // Official founder photograph
  bio: [
    "E. L. Ashok Anand is the Founder and Managing Director of SKL Enterprises, leading the organization with a vision to simplify access to essential government and digital services through technology, operational excellence, and customer-centric solutions.",
    "With a strong commitment to innovation, transparency, and service excellence, he established SKL Enterprises to deliver reliable, efficient, and accessible solutions for individuals, businesses, and organizations. Under his leadership, the company continues to expand its capabilities while maintaining high standards of professionalism, integrity, and customer satisfaction.",
    "His leadership philosophy is centred on empowering communities through digital transformation, creating employment opportunities, and delivering dependable services that contribute to India's digital progress. As SKL Enterprises continues to grow, he remains committed to building strategic partnerships, embracing innovation, and creating long-term value for stakeholders.",
  ],
  quote:
    "Leadership is not just about building a successful business—it's about creating opportunities, empowering people, and delivering services that make a meaningful difference in everyday lives.",
};

export const INDIAN_STATES = [
  "Tamil Nadu", "Karnataka", "Kerala", "Andhra Pradesh", "Telangana", "Puducherry",
  "Maharashtra", "Delhi", "Other",
];

export const PROJECTS = {
  apaar: {
    slug: "apaar",
    name: "APAAR",
    full: "Automated Permanent Academic Account Registry",
    tagline: "One Nation, One Student ID — for a lifelong academic identity.",
    coverage: "South India",
    coverageStates: ["Tamil Nadu", "Kerala", "Karnataka", "Andhra Pradesh", "Telangana", "Puducherry"],
    positions: ["State Coordinator", "District Coordinator", "Field Agent"],
    recruiting: ["State Coordinators", "District Coordinators", "Field Agents"],
    hero: "/apaar.png",
    content: "/apaar.png",
    video: "/apaar-video.mp4",
    gallery: ["/apaar.png"],
    downloads: [
      { label: "APAAR Programme Overview", type: "PDF" },
      { label: "APAAR Agent Brochure", type: "PDF" },
    ],
    overview:
      "APAAR is a nationwide student identification initiative that provides every learner with a unique, permanent academic ID. SKL Enterprises facilitates awareness, enrolment support and last-mile service delivery for students and institutions, helping digitise and unify academic records across a student's lifetime.",
    objectives: [
      "Provide every student with a unique lifelong academic identifier.",
      "Enable secure, digital storage and portability of academic records.",
      "Simplify verification of academic credentials for institutions.",
      "Support the vision of a unified national academic registry.",
    ],
    benefits: [
      "Single, permanent academic identity across schools and colleges.",
      "Easy access to consolidated academic records and achievements.",
      "Seamless transfer and admission across institutions.",
      "Reduced paperwork and faster credential verification.",
      "Empowered students and institutions through digital records.",
    ],
    features: [
      "Unique permanent academic account for each student.",
      "Digital repository for certificates, credits and achievements.",
      "Institution-friendly verification workflow.",
      "Secure, consent-based data handling.",
    ],
    eligibility: [
      "Students enrolled in recognised schools and colleges.",
      "Institutions registered with relevant education authorities.",
      "Consent from student / guardian for registration.",
    ],
    documents: [
      "Student identity proof (as prescribed by the institution).",
      "School / College enrolment details.",
      "Guardian consent (for minors).",
      "Passport-size photograph (where required).",
    ],
    process: [
      "Awareness and enrolment drive at the institution.",
      "Collection and verification of student details.",
      "Digital registration and account creation.",
      "Linking of academic records to the APAAR ID.",
      "Confirmation and handover of the academic account.",
    ],
    faqs: [
      { q: "What is APAAR?", a: "APAAR is a permanent academic account that gives every student a unique lifelong ID to store and access academic records digitally." },
      { q: "Who can register?", a: "Students enrolled in recognised institutions can register, typically facilitated through their school or college with guardian consent for minors." },
      { q: "Is my data secure?", a: "Registration follows consent-based, secure data-handling practices aligned with government guidelines." },
      { q: "How can I become an APAAR agent?", a: "Use the 'Become an Agent' form on this page to apply as a State Coordinator, District Coordinator or Field Agent across South India." },
    ],
  },
  "pan-2": {
    slug: "pan-2",
    name: "PAN 2.0",
    full: "PAN 2.0 — QR-Enabled Digital PAN",
    tagline: "A smarter, secure and QR-enabled Permanent Account Number for every citizen.",
    coverage: "South India",
    coverageStates: ["Tamil Nadu", "Kerala", "Karnataka", "Andhra Pradesh", "Telangana", "Puducherry"],
    positions: ["State Coordinator", "District Coordinator", "Pincode-Level Agent"],
    recruiting: ["State Coordinators", "District Coordinators", "Pincode-Level Agents"],
    hero: "/pan2.png",
    content: "/pan2.png",
    video: null,
    gallery: ["/pan2.png"],
    downloads: [
      { label: "PAN 2.0 Programme Overview", type: "PDF" },
      { label: "PAN 2.0 Agent Brochure", type: "PDF" },
    ],
    overview:
      "PAN 2.0 is the next-generation, technology-driven upgrade of the Permanent Account Number system, featuring a secure QR-enabled PAN and a unified digital experience. SKL Enterprises supports citizens with awareness, application facilitation and last-mile service delivery across South India, with Tamil Nadu serving as an initial operational focus.",
    objectives: [
      "Deliver a secure, QR-enabled digital PAN experience.",
      "Unify PAN-related services on a single digital platform.",
      "Improve accuracy and speed of PAN issuance and updates.",
      "Strengthen identity verification and reduce duplication.",
    ],
    benefits: [
      "QR-enabled PAN for instant, secure verification.",
      "Faster application, correction and reprint processes.",
      "Unified, paperless digital experience.",
      "Enhanced security against identity fraud.",
      "Convenient access through trusted local agents.",
    ],
    features: [
      "QR-enabled PAN card with encoded identity data.",
      "Digital-first application and update workflow.",
      "Unified portal experience for PAN services.",
      "Robust verification and validation checks.",
    ],
    eligibility: [
      "Indian citizens and eligible entities requiring a PAN.",
      "Existing PAN holders seeking upgrade / correction.",
      "Applicants with valid identity and address proof.",
    ],
    documents: [
      "Proof of identity (Aadhaar / Voter ID / Passport).",
      "Proof of address.",
      "Proof of date of birth.",
      "Passport-size photograph.",
    ],
    process: [
      "Citizen enquiry and eligibility check with a local agent.",
      "Collection and verification of required documents.",
      "Digital submission of the PAN 2.0 application.",
      "Processing and QR-enabled PAN generation.",
      "Delivery and confirmation to the applicant.",
    ],
    faqs: [
      { q: "What is PAN 2.0?", a: "PAN 2.0 is an upgraded, QR-enabled and fully digital version of the PAN system that unifies PAN services on a single secure platform." },
      { q: "Do I need a new PAN?", a: "Existing PAN holders can upgrade to the QR-enabled PAN; new applicants receive the PAN 2.0 format directly." },
      { q: "What documents are required?", a: "Standard identity, address and date-of-birth proofs along with a photograph, as prescribed by the authorities." },
      { q: "How can I become a PAN 2.0 agent?", a: "Apply using the 'Join Our Network' form on this page. We recruit State Coordinators, District Coordinators and Pincode-Level Agents across South India." },
    ],
  },
};
