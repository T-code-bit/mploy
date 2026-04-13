import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";
import usePageTitle from "@/hooks/usePageTitle";

const sections = [
  {
    title: "1. Acceptance of Terms",
    content: `By accessing or using M-Ploy ("the Platform"), you agree to be bound by these Terms of Service. If you do not agree, please do not use the Platform. We reserve the right to modify these terms at any time, and your continued use constitutes acceptance of any changes.`,
  },
  {
    title: "2. Account Registration",
    content: `To access certain features, you must create an account. You agree to:\n• Provide accurate and complete information\n• Maintain the security of your password\n• Notify us immediately of any unauthorized access\n• Be responsible for all activity under your account\n\nYou must be at least 16 years old to create an account.`,
  },
  {
    title: "3. User Conduct",
    content: `You agree not to:\n• Post false, misleading, or fraudulent job listings\n• Use the platform for illegal purposes\n• Harass, abuse, or discriminate against other users\n• Attempt to access another user's account\n• Scrape, crawl, or automatically extract data from the Platform\n• Upload malicious code or interfere with the Platform's operation\n• Misrepresent your identity, qualifications, or affiliations`,
  },
  {
    title: "4. Job Listings & Applications",
    content: `M-Ploy verifies job listings to the best of our ability, but we do not guarantee the accuracy of every listing. Employers are responsible for the content of their postings. Job seekers are responsible for the accuracy of their applications and CVs.\n\nM-Ploy is not a party to any employment agreement between employers and job seekers.`,
  },
  {
    title: "5. CV Builder & Content",
    content: `Content you create using our CV Builder remains your intellectual property. By using the Platform, you grant M-Ploy a limited license to store, process, and display your content as necessary to provide our services.\n\nYou are responsible for ensuring your CV content is accurate and does not infringe on third-party rights.`,
  },
  {
    title: "6. Academy & Courses",
    content: `Academy courses are provided for educational purposes. Course content is owned by M-Ploy or its content partners. TrustBadges earned are non-transferable and may be revoked if obtained through fraudulent means.\n\nWe reserve the right to update, modify, or remove course content at any time.`,
  },
  {
    title: "7. Payments & Subscriptions",
    content: `Premium features require a paid subscription. By subscribing, you agree to:\n• Pay the fees as displayed at the time of purchase\n• Authorize recurring charges for subscription plans\n• Cancel at any time (effective at end of billing period)\n\nRefunds are provided within 14 days of initial purchase if you haven't substantially used premium features. All prices are in USD unless otherwise stated.`,
  },
  {
    title: "8. Intellectual Property",
    content: `The M-Ploy platform, including its design, logos, content, and technology, is owned by M-Ploy and protected by intellectual property laws. You may not copy, modify, distribute, or reverse engineer any part of the Platform without written permission.`,
  },
  {
    title: "9. Limitation of Liability",
    content: `M-Ploy is provided "as is" without warranties of any kind. To the maximum extent permitted by law, M-Ploy shall not be liable for:\n• Any indirect, incidental, or consequential damages\n• Loss of employment opportunities\n• Errors in job listings or employer information\n• Unauthorized access to your account\n\nOur total liability shall not exceed the amount you paid us in the 12 months preceding the claim.`,
  },
  {
    title: "10. Termination",
    content: `We may suspend or terminate your account if you violate these terms. You may delete your account at any time. Upon termination, your right to use the Platform ceases, but provisions relating to intellectual property, liability, and disputes survive.`,
  },
  {
    title: "11. Governing Law",
    content: `These terms are governed by the laws of Kenya. Any disputes shall be resolved through arbitration in Nairobi, Kenya, unless otherwise required by local consumer protection laws.`,
  },
  {
    title: "12. Contact",
    content: `For questions about these terms:\n\nEmail: legal@m-ploy.com\nAddress: M-Ploy Headquarters, Nairobi, Kenya\nPhone: +254 700 000 000`,
  },
];

const Terms = () => {
  usePageTitle("Terms of Service");
  return (
  <div className="min-h-screen bg-background">
    <Navbar />
    <div className="pt-24 pb-16">
      <div className="container mx-auto px-4 max-w-3xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
          <h1 className="font-display text-4xl font-bold text-foreground tracking-tight mb-3">Terms of Service</h1>
          <p className="text-muted-foreground">Last updated: March 2026</p>
          <p className="text-muted-foreground mt-4 leading-relaxed">
            Please read these terms carefully before using M-Ploy. They govern your access to and use of our platform, services, and features.
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

export default Terms;
