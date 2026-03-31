import { motion } from "framer-motion";

const partners = [
  { name: "Safaricom", abbr: "SF" },
  { name: "Equity Bank", abbr: "EQ" },
  { name: "KCB Group", abbr: "KCB" },
  { name: "Nation Media", abbr: "NM" },
  { name: "Kenya Airways", abbr: "KQ" },
  { name: "KPMG East Africa", abbr: "KP" },
  { name: "Deloitte", abbr: "DL" },
  { name: "PwC Kenya", abbr: "PwC" },
];

const TrustedBySection = () => (
  <section className="py-14 bg-background border-b border-border relative overflow-hidden">
    <div className="container mx-auto px-4">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-8"
      >
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-[0.2em]">
          Trusted by leading companies across East Africa
        </p>
      </motion.div>

      <div className="relative">
        <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-background to-transparent z-10" />
        <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-background to-transparent z-10" />
        
        <div className="flex items-center justify-center gap-8 md:gap-12 flex-wrap">
          {partners.map((partner, i) => (
            <motion.div
              key={partner.name}
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06 }}
              className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl hover:bg-muted/50 transition-colors group cursor-default"
            >
              <div className="h-9 w-9 rounded-lg bg-muted flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                <span className="text-xs font-bold text-muted-foreground group-hover:text-primary transition-colors">
                  {partner.abbr}
                </span>
              </div>
              <span className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors hidden sm:block">
                {partner.name}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  </section>
);

export default TrustedBySection;
