export default function Footer() {
  return (
    <footer className="border-t border-ink/5 bg-white py-6 text-center text-xs text-ink/50">
      Built for neighbors within five miles · Kindred {new Date().getFullYear()}
    </footer>
  );
}
