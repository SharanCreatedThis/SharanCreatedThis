import { ComingSoon } from "@/components/ComingSoon";

export default function HomePage() {
  return (
    <div className="w-full">
      <ComingSoon showHomeDetails={true} />
    </div>
  );
}
