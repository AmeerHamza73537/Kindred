import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { createItem } from '../api/items.js';
import Button from '../components/common/Button.jsx';
import { useGeoLocation } from '../hooks/useLocation.js';
import { useEffect, useRef } from 'react';

const schema = yup.object({
  title: yup.string().required(),
  description: yup.string(),
  category: yup.string().required(),
  type: yup.string().oneOf(['lend', 'gift', 'skill']).required(),
  borrowDurationDays: yup
    .number()
    .transform((v, orig) => (orig === '' || orig == null ? undefined : Number(orig)))
    .min(1)
    .max(60)
    .when('type', {
      is: (t) => t === 'gift',
      then: (s) => s.notRequired().nullable(),
      otherwise: (s) => s.required(),
    }),
  condition: yup.string().oneOf(['new', 'good', 'fair']).required(),
});

export default function AddItem() {
  const navigate = useNavigate();
  const imagesRef = useRef(null);
  const { coords, detect } = useGeoLocation();
  useEffect(() => {
    detect();
  }, [detect]);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: { borrowDurationDays: 7, condition: 'good', category: 'Tools', type: 'lend' },
  });

  const selectedType = watch('type');

  const onSubmit = async (values) => {
    const fd = new FormData();
    Object.entries(values).forEach(([k, v]) => fd.append(k, v));
    if (coords) {
      fd.append('lat', String(coords.lat));
      fd.append('lng', String(coords.lng));
    }
    const files = imagesRef.current?.files;
    if (files?.length) {
      for (const f of files) fd.append('images', f);
    }
    try {
      const { data } = await createItem(fd);
      if (data.success) {
        toast.success('Item listed');
        navigate(`/items/${data.data.item._id}`);
      }
    } catch (e) {
      toast.error(e.response?.data?.message || 'Could not create item');
    }
  };

  return (
    <div className="mx-auto max-w-xl space-y-6 rounded-3xl border border-ink/5 bg-white p-8 shadow-sm">
      <h1 className="font-serif text-3xl text-ink">Add a listing</h1>
      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
        <div>
          <label className="text-xs font-semibold uppercase tracking-wide text-ink/50">Title</label>
          <input className="mt-1 w-full rounded-xl border border-ink/10 px-3 py-2 text-sm" {...register('title')} />
          {errors.title && <p className="text-xs text-red-600">{errors.title.message}</p>}
        </div>
        <div>
          <label className="text-xs font-semibold uppercase tracking-wide text-ink/50">Description</label>
          <textarea className="mt-1 w-full rounded-xl border border-ink/10 px-3 py-2 text-sm" rows={3} {...register('description')} />
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="text-xs font-semibold uppercase tracking-wide text-ink/50">Category</label>
            <select className="mt-1 w-full rounded-xl border border-ink/10 px-2 py-2 text-sm" {...register('category')}>
              {['Tools', 'Kitchen', 'Electronics', 'Sports', 'Garden', 'Skills', 'Other'].map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold uppercase tracking-wide text-ink/50">Type</label>
            <select className="mt-1 w-full rounded-xl border border-ink/10 px-2 py-2 text-sm" {...register('type')}>
              <option value="lend">Lend</option>
              <option value="gift">Gift</option>
              <option value="skill">Skill</option>
            </select>
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="text-xs font-semibold uppercase tracking-wide text-ink/50">Borrow days</label>
            <input
              type="number"
              className="mt-1 w-full rounded-xl border border-ink/10 px-3 py-2 text-sm disabled:opacity-40 disabled:cursor-not-allowed"
              disabled={selectedType === 'gift'}
              {...register('borrowDurationDays')}
            />
            {selectedType === 'gift' && (
              <p className="mt-1 text-xs text-ink/40">Not applicable for gifts</p>
            )}
          </div>
          <div>
            <label className="text-xs font-semibold uppercase tracking-wide text-ink/50">Condition</label>
            <select className="mt-1 w-full rounded-xl border border-ink/10 px-2 py-2 text-sm" {...register('condition')}>
              <option value="new">New</option>
              <option value="good">Good</option>
              <option value="fair">Fair</option>
            </select>
          </div>
        </div>
        <div>
          <label className="text-xs font-semibold uppercase tracking-wide text-ink/50">Photos</label>
          <input ref={imagesRef} type="file" multiple className="mt-1 w-full text-sm" accept="image/*" />
        </div>
        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? 'Publishing…' : 'Publish listing'}
        </Button>
      </form>
    </div>
  );
}
