import { NextResponse } from "next/server";
import { corpus } from "@/lib/corpus";

// The internal catalogue of static study material: every volume of the
// specification set with its sections, for explicit human selection of what
// a knot is given to read.
export async function GET() {
  const c = await corpus();
  const volumes = c.docs.map((doc) => ({
    slug: doc.slug,
    label: `${doc.volumeLabel} — ${doc.title}`,
    sections: c.sections
      .filter((section) => section.slug === doc.slug && section.anchor)
      .map((section) => ({ anchor: section.anchor, heading: section.heading }))
  }));
  return NextResponse.json({ volumes });
}
