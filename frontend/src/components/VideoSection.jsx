import { PlayCircle } from "lucide-react";
import { Reveal, Overline } from "@/components/Reveal";

// Elegant responsive video section. Autoplay + muted + loop when a src is present,
// otherwise renders an editable placeholder (easy to swap in later).
export default function VideoSection({ src, poster, title = "Watch the film", label = "Video" }) {
  return (
    <section className="py-24 bg-slate-950" data-testid="video-section">
      <div className="max-w-6xl mx-auto px-6 lg:px-8">
        <Reveal className="max-w-2xl">
          <Overline className="!text-gold">{label}</Overline>
          <h2 className="font-heading text-3xl lg:text-4xl font-semibold text-white">{title}</h2>
        </Reveal>
        <Reveal delay={0.1}>
          <div className="mt-10 rounded-sm overflow-hidden border border-slate-800 bg-black aspect-video">
            {src ? (
              <video
                data-testid="project-video"
                src={src}
                poster={poster}
                autoPlay
                muted
                loop
                playsInline
                controls
                preload="metadata"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-center p-8" data-testid="video-placeholder">
                <PlayCircle className="h-16 w-16 text-slate-600" />
                <p className="mt-4 text-slate-400 max-w-md">Promotional video coming soon. This section is ready — the video can be added later without changing the layout.</p>
              </div>
            )}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
