import Link from "next/link";

export default function NotFound() {
  return (
    <section className="mx-auto w-[min(100%-2rem,1200px)] py-32 text-center">
      <p className="eyebrow">Off the rails</p>
      <h1 className="mt-3 font-display text-4xl font-bold">This stop isn&apos;t on the map</h1>
      <Link href="/characters" className="mt-8 inline-block text-gold hover:text-gold-strong">
        Back to the Character Archive →
      </Link>
    </section>
  );
}
