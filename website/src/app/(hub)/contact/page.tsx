import { ComingSoon } from "@/components/ComingSoon";

export const metadata = {
  title: "Contact | Sharan Created This",
  description: "Get in touch for collaborations, projects, or inquiries.",
};

export default function ContactPage() {
  return (
    <div className="w-full">
      <ComingSoon
        title="Contact"
        subtitle="Direct channel for project inquiries, film collaborations, and feedback will open shortly."
      />
    </div>
  );
}
