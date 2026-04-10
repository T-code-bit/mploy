import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";

const sections = [
  {
    title: "1. Information We Collect",
    content: `We collect information you provide directly when creating an account, building a CV, or contacting us. This includes your name, email address, phone number, location, work experience, education details, and skills.\n\nWe also automatically collect usage data such as pages visited, features used, device information, IP address, and browser type to improve our platform and user experience.`,
  },
  {
    title: "2. How We Use Your Information",
    content: `Your personal information is used to:\n• Provide and maintain our services (job matching, CV building, academy courses)\n• Create and manage your account\n• Process job applications on your behalf\n• Send relevant job alerts and career tips (with your consent)\n• Improve our platform through analytics\n• Communicate with you about updates, security, and support\n• Comply with legal obligations`,
  },
  {
    title: "3. Information Sharing",
    content: `We do not sell your personal data. We may share your information with:\n• Employers — only when you actively apply for a job listing\n• Service providers — trusted third parties who help us operate our platform (hosting, analytics, email)\n• Legal authorities — when required by law or to protect our rights\n\nAll third-party providers are bound by data processing agreements.`,
  },
  {
    title: "4. Data Security",
    content: `We implement industry-standard security measures including encryption in transit (TLS/SSL), encrypted data at rest, role-based access controls, and regular security audits. While no system is 100% secure, we take every reasonable step to protect your data.`,
  },
  {
    title: "5. Your Rights",
    content: `Depending on your location, you may have the right to:\n• Access the personal data we hold about you\n• Request correction of inaccurate data\n• Request deletion of your data ("right to be forgotten")\n• Object to or restrict certain processing\n• Data portability — receive your data in a structured format\n• Withdraw consent at any time\n\nTo exercise these rights, contact us at privacy@m-ploy.com.`,
  },
  {
    title: "6. Cookies & Tracking",
    content: `We use essential cookies for authentication and session management. We also use analytics cookies (with your consent) to understand how our platform is used. You can manage cookie preferences through your browser settings or our cookie banner.`,
  },
  {
    title: "7. Data Retention",
    content: `We retain your account data for as long as your account is active. If you delete your account, we will remove your personal data within 30 days, except where retention is required by law. Anonymized analytics data may be retained indefinitely.`,
  },
  {
    title: "8. Children's Privacy",
    content: `M-Ploy is not intended for users under the age of 16. We do not knowingly collect personal information from children. If we become aware that we have collected data from a child, we will delete it promptly.`,
  },
  {
    title: "9. Changes to This Policy",
    content: `We may update this privacy policy from time to time. We will notify you of significant changes via email or a prominent notice on our platform. Your continued use of M-Ploy after changes constitutes acceptance.`,
  },
  {
    title: "10. Contact Us",
    content: `If you have questions about this privacy policy or your data, please contact us:\n\nEmail: privacy@m-ploy.com\nAddress: M-Ploy Headquarters, Nairobi, Kenya\nPhone: +254 700 000 000`,
  },
];

const Privacy = () => (
  <div className="min-h-screen bg-background">
    <Navbar />
    <div className="pt-24 pb-16">
      <div className="container mx-auto px-4 max-w-3xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
          <h1 className="font-display text-4xl font-bold text-foreground tracking-tight mb-3">Privacy Policy</h1>
          <p className="text-muted-foreground">Last updated: March 2026</p>
          <p className="text-muted-foreground mt-4 leading-relaxed">
            At M-Ploy, your privacy matters. This policy explains how we collect, use, and protect your personal information when you use our platform.
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

export default Privacy;
