import SystemCard from './SystemCard';

export default function SystemGrid({ systems, onSelect, showStudent = false }) {
  if (!systems.length) {
    return <p className="rounded-lg border border-dashed border-line p-8 text-center text-ink-soft">No systems have been added to this lab yet.</p>;
  }
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
      {systems.map((s) => (
        <SystemCard
          key={s._id}
          system={s}
          onSelect={onSelect}
          detail={showStudent && s.currentStudent ? `${s.currentStudent.name} (${s.currentStudent.admissionNo})` : undefined}
        />
      ))}
    </div>
  );
}
