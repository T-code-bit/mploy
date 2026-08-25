import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";
import usePageTitle from "@/hooks/usePageTitle";

const sections = [
  {
    title: "What Are Cookies?",
    content: `Cookies are small text files stored on your device when you visit a website. They help us recognize your browser, remember your preferences, and understand how you use our platform.`,
  },
  {
    title: "Cookies We Use",
    content: `**Essential Cookies** — Required for the platform to function. These handle authentication, session management, and security. They cannot be disabled.\n\n**Analytics Cookies** — Help us understand how visitors interact with M-Ploy. We use this data to improve our platform and user experience. These are only set with your consent.\n\n**Preference Cookies** — Remember your settings like language, theme (light/dark mode), and display preferences to provide a personalized experience.`,
  },
  {
    title: "Third-Party Cookies",
    content: `We may use limited third-party services that set their own cookies:\n• Analytics providers to measure platform usage\n• Authentication services for secure sign-in\n\nWe do not use advertising cookies or sell data to third-party advertisers.`,
  },
  {
    title: "Managing Cookies",
    content: `You can control cookies through your browser settings:\n• **Chrome**: Settings → Privacy and Security → Cookies\n• **Firefox**: Settings → Privacy & Security → Cookies\n• **Safari**: Preferences → Privacy → Cookies\n• **Edge**: Settings → Cookies and Site Permissions\n\nPlease note that disabling essential cookies may prevent you from using certain features of M-Ploy.`,
  },
  {
    title: "Updates to This Policy",
    content: `We may update this cookie policy periodically. The "Last updated" date at the top of this page indicates when the policy was last revised.`,
  },
  {
    title: "Contact Us",
    content: `If you have questions about our use of cookies:\n\nEmail: mploykenya@gmail.com\nAddress: M-Ploy Headquarters, Nairobi, Kenya`,
  },
];

const Cookies = () => {
  usePageTitle("Cookie Policy");
  return (
  <div className="min-h-screen bg-background">
    <Navbar />
    <div className="pt-24 pb-16">
      <div className="container mx-auto px-4 max-w-3xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
          <h1 className="font-display text-4xl font-bold text-foreground tracking-tight mb-3">Cookie Policy</h1>
          <p className="text-muted-foreground">Last updated: March 2026</p>
          <p className="text-muted-foreground mt-4 leading-relaxed">
            This policy explains how M-Ploy uses cookies and similar technologies to provide, protect, and improve our platform.
          </p>
        </motion.div>

        <div className="space-y-8">
          {sections.map((s, i) => (
            <motion.div key={s.title} initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.03 }}>
              <h2 className="font-display text-xl font-semibold text-foreground mb-3">{s.title}</h2>
              <div className="text-muted-foreground leading-relaxed whitespace-pre-line text-sm">{s.content}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
    <Footer />
  </div>
  );
};

export default Cookies;
