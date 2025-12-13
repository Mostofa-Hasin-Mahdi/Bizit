export default function FeatureCard({ icon, title, desc }) {
  return (
    <div className="bg-[#0B0B0F] border border-[#2B124C] rounded-2xl p-6 shadow hover:shadow-xl transition">
      <div className="text-[#E9D5FF] mb-4">{icon}</div>
      <h4 className="font-semibold mb-2">{title}</h4>
      <p className="text-sm text-gray-400">{desc}</p>
    </div>
  );
}
