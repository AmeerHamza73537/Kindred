import ItemCard from './ItemCard.jsx';

export default function ItemGrid({ items }) {
  return (
    <div className="flex gap-4 overflow-x-auto pb-2 md:grid md:grid-cols-2 md:overflow-visible lg:grid-cols-3">
      {items?.map((it) => (
        <ItemCard key={it._id} item={it} />
      ))}
    </div>
  );
}
