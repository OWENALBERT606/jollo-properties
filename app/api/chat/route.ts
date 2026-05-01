import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

function normalize(text: string) {
  return text.toLowerCase().replace(/[^a-z0-9 ]/g, " ").trim();
}

function contains(text: string, ...words: string[]) {
  return words.some((w) => text.includes(w));
}

function formatPrice(price: unknown): string {
  const num = Number(price);
  if (!num) return "Price not listed";
  return `UGX ${num.toLocaleString("en-UG")}`;
}

function formatSize(size: unknown, unit: string): string {
  return `${Number(size).toFixed(2)} ${unit}`;
}

async function buildReply(message: string): Promise<string> {
  const q = normalize(message);

  // ── Greeting ──────────────────────────────────────────────────────────────
  if (contains(q, "hello", "hi", "hey", "good morning", "good afternoon", "good evening")) {
    return "Hello! Welcome to Jollo Properties. I can help you find properties, learn about tenure types, registration, disputes, and more. What would you like to know?";
  }

  // ── Property count ────────────────────────────────────────────────────────
  if (contains(q, "how many properties", "total properties", "number of properties", "count properties")) {
    const [total, active, pending] = await Promise.all([
      prisma.property.count(),
      prisma.property.count({ where: { status: "ACTIVE" } }),
      prisma.property.count({ where: { status: "PENDING_APPROVAL" } }),
    ]);
    return `There are currently ${total} properties on the platform — ${active} active and ${pending} pending approval.`;
  }

  // ── Available / active listings ───────────────────────────────────────────
  if (contains(q, "available properties", "active properties", "properties for sale", "listed properties", "show properties", "list properties", "all properties")) {
    const props = await prisma.property.findMany({
      where: { status: "ACTIVE" },
      orderBy: { createdAt: "desc" },
      take: 6,
      select: { plotNumber: true, title: true, district: true, type: true, tenure: true, price: true, sizeUnit: true, size: true },
    });
    if (!props.length) return "No active property listings found at the moment. Please check back later.";
    const lines = props.map(
      (p) =>
        `• ${p.title} (${p.plotNumber}) — ${p.type}, ${p.tenure}, ${p.district} | ${formatSize(p.size, p.sizeUnit)} | ${formatPrice(p.price)}`
    );
    return `Here are the latest active properties:\n\n${lines.join("\n")}\n\nVisit the Listings page to see all properties with full details.`;
  }

  // ── Search by district ────────────────────────────────────────────────────
  const districtMatch = q.match(/properties? (?:in|at|from|around) ([a-z ]+?)(?:\s*$|\s+district)/);
  const districtKeyword = contains(q, "which district", "what district", "districts available", "list districts", "show districts");

  if (districtKeyword) {
    const rows = await prisma.property.groupBy({
      by: ["district"],
      _count: { id: true },
      orderBy: { _count: { id: "desc" } },
    });
    if (!rows.length) return "No properties have been registered yet.";
    const lines = rows.map((r) => `• ${r.district}: ${r._count.id} propert${r._count.id === 1 ? "y" : "ies"}`);
    return `Properties are registered in the following districts:\n\n${lines.join("\n")}`;
  }

  if (districtMatch) {
    const district = districtMatch[1].trim();
    const props = await prisma.property.findMany({
      where: { district: { contains: district, mode: "insensitive" }, status: "ACTIVE" },
      take: 5,
      select: { plotNumber: true, title: true, type: true, tenure: true, price: true, size: true, sizeUnit: true },
    });
    if (!props.length) return `No active properties found in "${district}". Try a different district name or browse the Listings page.`;
    const lines = props.map(
      (p) => `• ${p.title} (${p.plotNumber}) — ${p.type}, ${p.tenure} | ${formatSize(p.size, p.sizeUnit)} | ${formatPrice(p.price)}`
    );
    return `Found ${props.length} active propert${props.length === 1 ? "y" : "ies"} in ${district}:\n\n${lines.join("\n")}`;
  }

  // ── Search by property type ───────────────────────────────────────────────
  const typeMap: Record<string, string> = {
    residential: "RESIDENTIAL", commercial: "COMMERCIAL", agricultural: "AGRICULTURAL",
    industrial: "INDUSTRIAL", land: "LAND", house: "HOUSE", mixed: "MIXED_USE",
  };
  for (const [keyword, typeVal] of Object.entries(typeMap)) {
    if (contains(q, keyword)) {
      const count = await prisma.property.count({ where: { type: typeVal as never, status: "ACTIVE" } });
      const props = await prisma.property.findMany({
        where: { type: typeVal as never, status: "ACTIVE" },
        take: 5,
        select: { plotNumber: true, title: true, district: true, tenure: true, price: true, size: true, sizeUnit: true },
      });
      if (!count) return `No active ${keyword} properties found currently.`;
      const lines = props.map(
        (p) => `• ${p.title} (${p.plotNumber}) — ${p.tenure}, ${p.district} | ${formatSize(p.size, p.sizeUnit)} | ${formatPrice(p.price)}`
      );
      return `${count} active ${keyword} propert${count === 1 ? "y" : "ies"} on the platform:\n\n${lines.join("\n")}${count > 5 ? `\n\n...and ${count - 5} more. Visit Listings to see all.` : ""}`;
    }
  }

  // ── Search by tenure ──────────────────────────────────────────────────────
  const tenureMap: Record<string, string> = {
    mailo: "MAILO", kibanja: "KIBANJA", titled: "TITLED", leasehold: "LEASEHOLD", freehold: "FREEHOLD",
  };
  for (const [keyword, tenureVal] of Object.entries(tenureMap)) {
    if (contains(q, keyword)) {
      const count = await prisma.property.count({ where: { tenure: tenureVal as never, status: "ACTIVE" } });
      const props = await prisma.property.findMany({
        where: { tenure: tenureVal as never, status: "ACTIVE" },
        take: 5,
        select: { plotNumber: true, title: true, district: true, type: true, price: true, size: true, sizeUnit: true },
      });
      const explanation = {
        MAILO: "Mailo land is privately owned land under the Mailo system, mostly in Buganda region.",
        KIBANJA: "Kibanja is a form of tenure where a person occupies Mailo land with the owner's consent.",
        TITLED: "Titled land has a Certificate of Title registered with the Land Registry.",
        LEASEHOLD: "Leasehold land is held for a fixed term (usually 49 or 99 years) granted by the landlord.",
        FREEHOLD: "Freehold land is owned outright with no time limit.",
      }[tenureVal] ?? "";
      if (!count) return `${explanation}\n\nNo active ${keyword} properties are currently listed.`;
      const lines = props.map(
        (p) => `• ${p.title} (${p.plotNumber}) — ${p.type}, ${p.district} | ${formatSize(p.size, p.sizeUnit)} | ${formatPrice(p.price)}`
      );
      return `${explanation}\n\nThere are ${count} active ${keyword} propert${count === 1 ? "y" : "ies"} on the platform:\n\n${lines.join("\n")}${count > 5 ? `\n\n...and ${count - 5} more. Visit Listings to browse all.` : ""}`;
    }
  }

  // ── Tenure explanation (general) ──────────────────────────────────────────
  if (contains(q, "tenure type", "types of tenure", "land tenure", "what is tenure")) {
    return "Uganda has five main land tenure types on this platform:\n\n• **Mailo** — Privately owned, mostly in Buganda. Separate ownership of land and developments.\n• **Kibanja** — Occupancy on Mailo land with owner's consent.\n• **Titled** — Land with a Certificate of Title registered in the Land Registry.\n• **Leasehold** — Fixed-term ownership (49 or 99 years) granted by the landlord or government.\n• **Freehold** — Absolute ownership with no time limit.\n\nAsk me about any specific tenure type for more details.";
  }

  // ── Disputes ──────────────────────────────────────────────────────────────
  if (contains(q, "dispute", "conflict", "land conflict", "complaint")) {
    const [total, filed, underInvestigation, resolved] = await Promise.all([
      prisma.dispute.count(),
      prisma.dispute.count({ where: { status: "FILED" } }),
      prisma.dispute.count({ where: { status: "UNDER_INVESTIGATION" } }),
      prisma.dispute.count({ where: { status: "RESOLVED" } }),
    ]);
    return `The platform currently has ${total} dispute${total === 1 ? "" : "s"}: ${filed} filed, ${underInvestigation} under investigation, and ${resolved} resolved.\n\nTo file a dispute, go to Dashboard → Disputes → File a Dispute. A Land Officer will review and investigate your case.`;
  }

  // ── Transactions ──────────────────────────────────────────────────────────
  if (contains(q, "transaction", "sale", "transfer", "mortgage", "lease agreement")) {
    const [total, completed, pending] = await Promise.all([
      prisma.transaction.count(),
      prisma.transaction.count({ where: { status: "COMPLETED" } }),
      prisma.transaction.count({ where: { status: { in: ["INITIATED", "UNDER_REVIEW"] } } }),
    ]);
    return `There are ${total} transaction${total === 1 ? "" : "s"} on the platform — ${completed} completed and ${pending} in progress.\n\nTransaction types available:\n• **Sale** — Transfer of ownership for a price\n• **Lease** — Temporary use agreement\n• **Transfer** — Ownership change (e.g. inheritance, gift)\n• **Mortgage** — Property used as loan security\n\nAll transactions go through review and approval by a Land Officer.`;
  }

  // ── Registration guidance ─────────────────────────────────────────────────
  if (contains(q, "register", "registration", "how to add", "submit property", "add property", "new property")) {
    return "To register a property on Jollo Properties:\n\n1. **Create an account** — Sign up as a Public User\n2. **Go to My Properties** — Click \"Register Property\"\n3. **Fill in the details** — Plot number, location, tenure type, size, and boundary coordinates\n4. **Upload documents** — Title deed, survey map, and any supporting documents\n5. **Submit for review** — A Land Officer will review and approve your property\n\nOnce approved, your property becomes active and visible on the platform.";
  }

  // ── Documents ─────────────────────────────────────────────────────────────
  if (contains(q, "document", "title deed", "survey map", "upload")) {
    const total = await prisma.document.count();
    return `There are ${total} document${total === 1 ? "" : "s"} stored on the platform.\n\nAccepted document types:\n• Title Deed\n• Survey Map\n• Agreement\n• Photos\n• Other supporting documents\n\nDocuments can be uploaded when registering a property or as part of a transaction. Go to Dashboard → Documents to manage your files.`;
  }

  // ── Valuations / tax ──────────────────────────────────────────────────────
  if (contains(q, "valuation", "value", "tax", "assessment", "ugx", "worth")) {
    const total = await prisma.valuation.count();
    return `There are ${total} property valuation${total === 1 ? "" : "s"} on record.\n\nValuations are conducted by Land Officers and used for:\n• Tax assessment\n• Transaction pricing\n• Government records\n\nTo request a valuation, contact a Land Officer through the platform or visit Dashboard → Valuations.`;
  }

  // ── Contact / Land Officer ────────────────────────────────────────────────
  if (contains(q, "contact", "officer", "land officer", "speak to", "talk to", "help", "support", "human")) {
    return "For official assistance, you can reach a Land Officer through the platform:\n\n1. Log into your account\n2. Go to Dashboard → Disputes or Transactions\n3. Submit your inquiry or file a case\n\nLand Officers review property registrations, approve transactions, investigate disputes, and conduct valuations. For urgent matters, use the Contact page on this website.";
  }

  // ── Stats / overview ──────────────────────────────────────────────────────
  if (contains(q, "stats", "statistics", "overview", "summary", "platform", "how big", "numbers")) {
    const [properties, transactions, disputes, users] = await Promise.all([
      prisma.property.count({ where: { status: "ACTIVE" } }),
      prisma.transaction.count({ where: { status: "COMPLETED" } }),
      prisma.dispute.count({ where: { status: { in: ["FILED", "UNDER_INVESTIGATION"] } } }),
      prisma.user.count({ where: { role: "PUBLIC_USER" } }),
    ]);
    return `Jollo Properties Platform Overview:\n\n• ${properties} active properties\n• ${transactions} completed transactions\n• ${disputes} open disputes\n• ${users} registered users\n\nVisit the public Listings page to browse available properties, or sign up to register your own.`;
  }

  // ── Fallback ──────────────────────────────────────────────────────────────
  return "I can help you with:\n\n• Finding properties — \"Show me residential properties in Kampala\"\n• Tenure types — \"What is Mailo land?\"\n• Platform stats — \"How many properties are listed?\"\n• Registration — \"How do I register a property?\"\n• Disputes — \"How do I file a dispute?\"\n• Transactions — \"What transaction types are available?\"\n\nWhat would you like to know?";
}

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();
    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ message: "Invalid request" }, { status: 400 });
    }

    const lastUserMessage = [...messages].reverse().find((m: { role: string }) => m.role === "user");
    if (!lastUserMessage) {
      return NextResponse.json({ message: "No user message found" }, { status: 400 });
    }

    const reply = await buildReply(lastUserMessage.content as string);
    return NextResponse.json({ message: reply });
  } catch (err) {
    console.error("Chat error:", err);
    return NextResponse.json({ message: "Sorry, something went wrong. Please try again." }, { status: 500 });
  }
}
