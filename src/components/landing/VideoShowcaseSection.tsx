import { motion } from "framer-motion";
import { Play } from "lucide-react";
import { useState } from "react";
import interviewImg from "@/assets/interview-scene.jpg";

const VideoShowcaseSection = () => {
  const [playing, setPlaying] = useState(false);

  return (
    <section className="py-28 bg-background relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[400px] h-[400px] rounded-full bg-secondary/5 blur-[120px]" />
      <div className="absolute bottom-0 left-0 w-[300px] h-[300px] rounded-full bg-primary/5 blur-[100px]" />

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-2xl mx-auto mb-14"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/8 mb-5">
            <Play className="h-3.5 w-3.5 text-primary" />
            <span className="text-xs font-semibold text-primary uppercase tracking-wider">See It In Action</span>
          </div>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-5 tracking-tight">
            Watch How M-Ploy <span className="text-gradient-accent">Transforms Careers</span>
          </h2>
          <p className="text-muted-foreground text-lg">
            See real success stories and learn how our platform connects talent with opportunity.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto"
        >
          <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-border group">
            {playing ? (
              <div className="aspect-video">
                <iframe
                  width="100%"
                  height="100%"
                  src="https://www.youtube.com/embed/3TnsIbJNm5E?autoplay=1&rel=0"
                  title="Tips to Ace Your Job Interviews — Indeed's Ultimate Guide"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full"
                />
              </div>
            ) : (
              <div
                className="aspect-video relative cursor-pointer"
                onClick={() => setPlaying(true)}
              >
                <img
                  src={interviewImg}
                  alt="M-Ploy platform demo - connecting talent with employers"
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-foreground/30 group-hover:bg-foreground/40 transition-colors duration-300" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="h-20 w-20 rounded-full bg-primary/90 flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform duration-300">
                    <Play className="h-8 w-8 text-primary-foreground ml-1" />
                  </div>
                </div>
                <div className="absolute bottom-6 left-6 right-6">
                  <p className="text-primary-foreground font-display font-semibold text-lg drop-shadow-lg">
                    Platform Overview — How M-Ploy Works
                  </p>
                  <p className="text-primary-foreground/70 text-sm drop-shadow-lg">3:42</p>
                </div>
              </div>
            )}
          </div>
        </motion.div>

        {/* Video grid - additional content */}
        <div className="grid sm:grid-cols-3 gap-5 max-w-4xl mx-auto mt-8">
          {[
            { title: "CV Builder Tutorial", duration: "2:15", bg: "from-primary/20 to-primary/5" },
            { title: "Success Stories", duration: "4:30", bg: "from-secondary/20 to-secondary/5" },
            { title: "ATS Tips & Tricks", duration: "3:08", bg: "from-accent/20 to-accent/5" },
          ].map((vid, i) => (
            <motion.div
              key={vid.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="relative rounded-2xl overflow-hidden border border-border shadow-card group cursor-pointer hover:shadow-lg transition-all hover:-translate-y-1"
            >
              <div className={`aspect-video bg-gradient-to-br ${vid.bg} flex items-center justify-center`}>
                <div className="h-12 w-12 rounded-full bg-card/80 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Play className="h-5 w-5 text-foreground ml-0.5" />
                </div>
              </div>
              <div className="p-4 bg-card">
                <p className="font-display font-semibold text-card-foreground text-sm">{vid.title}</p>
                <p className="text-xs text-muted-foreground">{vid.duration}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default VideoShowcaseSection;
