import Link from "next/link";

export default function Header() {
  return (
    <header className="w-full border-b">
      <div className="px-6 py-4 sm:px-12 lg:px-24">
        <Link href="/" className="text-xl font-semibold">
          AI tools
        </Link>
      </div>
    </header>
  );
}
