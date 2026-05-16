import { Link } from 'react-router-dom';
import Button from '../components/common/Button.jsx';

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
      <h1 className="font-serif text-4xl text-primary">404</h1>
      <p className="max-w-md text-ink/70">This path doesn’t exist in Kindred yet.</p>
      <Link to="/">
        <Button variant="primary">Back home</Button>
      </Link>
    </div>
  );
}
