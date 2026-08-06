import { motion } from "framer-motion";
import btlLogo from "@/assets/partner-btl.png";
import kenyaSealLogo from "@/assets/partner-kenya-seal.png";

const partners = [
  { name: "Republic of Kenya", logo: kenyaSealLogo },
  { name: "BTL (Be The Leader)", logo: btlLogo },
];

const TrustedBySection = () => (
  <section className="py-16 bg-card border-y border-border relative overflow-hidden">
    <div className="container mx-auto px-4">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-10"
      >
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-[0.2em] mb-1">
          In Partnership With
        </p>
        <p className="text-sm text-muted-foreground">
          Empowering careers alongside leading institutions
        </p>
      </motion.div>

      <div className="grid grid-cols-3 gap-8 items-center max-w-4xl mx-auto">
        {partners.map((partner, i) => (
          <motion.div
            key={partner.name}
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1, duration: 0.5 }}
            className="flex flex-col items-center gap-3 p-3 sm:p-6 rounded-2xl hover:bg-muted/50 transition-all duration-300 group"
          >
            <div className="aspect-square w-full max-w-[180px] sm:max-w-[220px] md:max-w-[260px] flex items-center justify-center">
              <img
                src={partner.logo}
                alt={`${partner.name} logo`}
                className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                loading="lazy"
              />
            </div>
            <p className="text-xs font-semibold text-muted-foreground text-center leading-tight group-hover:text-foreground transition-colors">
              {partner.name}
            </p>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default TrustedBySection;
