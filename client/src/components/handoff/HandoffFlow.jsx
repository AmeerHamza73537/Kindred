import HandoffStepper from './HandoffStepper.jsx';
import MeetupCard from './MeetupCard.jsx';

/** Groups stepper + meetup summary for the handoff page */
export default function HandoffFlow({ handoff, itemType }) {
  return (
    <div className="space-y-4">
      <HandoffStepper handoff={handoff} itemType={itemType} />
      <MeetupCard handoff={handoff} />
    </div>
  );
}
