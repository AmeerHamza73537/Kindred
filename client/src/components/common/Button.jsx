export default function Button({ children, className = '', variant = 'primary', ...props }) {
  const base =
    'inline-flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none';
  const styles = {
    primary: 'bg-primary text-white hover:bg-[#245a43] focus-visible:ring-primary',
    secondary: 'bg-secondary text-ink hover:bg-[#7fc59a] focus-visible:ring-secondary',
    accent: 'bg-accent text-ink hover:bg-[#e8924f] focus-visible:ring-accent',
    ghost: 'bg-transparent text-primary ring-1 ring-primary/30 hover:bg-primary/5',
  };
  return (
    <button className={`${base} ${styles[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
}
