import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";
import testimonial1 from "@/assets/testimonial-1.jpg";
import testimonial2 from "@/assets/testimonial-2.jpg";
import testimonial3 from "@/assets/testimonial-3.jpg";
import testimonial4 from "@/assets/testimonial-4.jpg";

const testimonials = [
  {
    name: "Amara Okafor",
    role: "Software Developer",
    location: "Lagos, Nigeria",
    text: "M-Ploy helped me land a remote role in just 3 weeks. The ATS-optimized CV made all the difference — I went from zero callbacks to 5 interviews.",
    rating: 5,
    photo: testimonial1,
  },
  {
    name: "Sarah Mitchell",
    role: "Marketing Manager",
    location: "London, UK",
    text: "The Academy courses on communication and digital literacy gave me the edge I needed. I earned my TrustBadge and got hired within a month.",
    rating: 5,
    photo: testimonial2,
  },
  {
    name: "Carlos Mendez",
    role: "Data Analyst",
    location: "São Paulo, Brazil",
    text: "As an employer, the portal is incredibly intuitive. We posted 10 jobs and received quality applicants fast. The verification system builds real trust.",
    rating: 5,
    photo: testimonial3,
  },
  {
    name: "Priya Sharma",
    role: "UX Designer",
    location: "Bangalore, India",
    text: "The dynamic CV templates are beautifully designed and actually pass ATS systems. I could see my match score improve in real-time as I edited.",
    rating: 5,
    photo: testimonial4,
  },
];

const TestimonialsSection = () => (
  <section className="py-28 bg-background relative overflow-hidden">
    <div className="absolute inset-0 bg-mesh" />
    <div className="container mx-auto px-4 relative z-10">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center max-w-2xl mx-auto mb-16"
      >
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary/10 mb-5">
          <Star className="h-3.5 w-3.5 text-secondary fill-secondary" />
          <span className="text-xs font-semibold text-secondary uppercase tracking-wider">Testimonials</span>
        </div>
        <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-5 tracking-tight">
          Loved by <span className="text-gradient-accent">Job Seekers</span> Worldwide
        </h2>
        <p className="text-muted-foreground text-lg">
          Real stories from real people who transformed their careers with M-Ploy.
        </p>
      </motion.div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {testimonials.map((t, i) => (
          <motion.div
            key={t.name}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1, duration: 0.5 }}
            className="bg-card rounded-2xl p-6 border border-border shadow-card hover:shadow-lg transition-all duration-300 hover:-translate-y-1 relative"
          >
            <Quote className="h-8 w-8 text-primary/10 absolute top-5 right-5" />
            <div className="flex items-center gap-1 mb-4">
              {Array.from({ length: t.rating }).map((_, j) => (
                <Star key={j} className="h-3.5 w-3.5 text-secondary fill-secondary" />
              ))}
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed mb-6">"{t.text}"</p>
            <div className="flex items-center gap-3">
              <img
                src={t.photo}
                alt={t.name}
                className="h-11 w-11 rounded-xl object-cover"
                loading="lazy"
              />
              <div>
                <p className="text-sm font-semibold text-card-foreground">{t.name}</p>
                <p className="text-xs text-muted-foreground">{t.role} · {t.location}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default TestimonialsSection;
