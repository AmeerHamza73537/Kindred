const steps = [
  'Approve & plan',
  'Pickup details',
  'Confirm time',
  'Verify code',
  'Return',
];

/**
 * Backend `stage` is coarse; during `pickup_pending` we subdivide so the stepper
 * matches what the user is actually doing (details → confirm → code).
 */
function pickupPendingStep(handoff) {
  const p = handoff?.pickupDetails;
  const hasPickupDetails =
    Boolean(p?.location && String(p.location).trim()) &&
    p?.scheduledTime != null &&
    String(p.scheduledTime).trim() !== '';
  const bothConfirmed = !!(p?.confirmedByOwner && p?.confirmedByBorrower);
  if (bothConfirmed) return 4;
  if (hasPickupDetails) return 3;
  return 2;
}

function computeCurrentStep(handoff, stage, itemType) {
  const max = itemType === 'gift' ? 4 : 5;
  if (stage === 'completed') return max;
  if (stage === 'return_pending') return 5;
  if (stage === 'item_with_borrower') return itemType === 'gift' ? max : 5;
  if (stage === 'pickup_pending') return pickupPendingStep(handoff);
  return 2;
}

export default function HandoffStepper({ handoff, itemType }) {
  const stage = handoff?.stage;
  const max = itemType === 'gift' ? 4 : 5;
  const allDone = stage === 'completed';
  const current = computeCurrentStep(handoff, stage, itemType);

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between gap-1 overflow-x-auto">
        {steps.slice(0, max).map((label, i) => {
          const n = i + 1;
          const done = allDone || n < current;
          const active = !allDone && n === current;
          return (
            <div key={`${itemType}-step-${i}-${label}`} className="flex min-w-[72px] flex-1 flex-col items-center gap-2">
              <div
                className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold ${
                  done
                    ? 'bg-primary text-white'
                    : active
                      ? 'bg-accent text-ink'
                      : 'bg-ink/10 text-ink/40'
                }`}
              >
                {n}
              </div>
              <p className="text-center text-[10px] font-medium uppercase tracking-wide text-ink/60">
                {label}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
