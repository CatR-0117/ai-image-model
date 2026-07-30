import Link from "next/link";

export default function Header() {
  return (
    <header className="w-full border-b">
      <div className="px-24 py-4">
        <Link href="/" className="text-xl font-semibold">
          AI tools
        </Link>
      </div>
    </header>
  );
}
