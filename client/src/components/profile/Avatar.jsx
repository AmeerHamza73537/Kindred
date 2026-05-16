export default function Avatar({ user, size = 40 }) {
  const s = { width: size, height: size };
  if (user?.avatar) {
    return (
      <img
        src={user.avatar}
        alt=""
        className="rounded-full object-cover ring-2 ring-white shadow-sm"
        style={s}
      />
    );
  }
  const initial = user?.name?.[0]?.toUpperCase() || '?';
  return (
    <div
      className="flex items-center justify-center rounded-full bg-secondary font-semibold text-primary ring-2 ring-white"
      style={s}
    >
      {initial}
    </div>
  );
}
