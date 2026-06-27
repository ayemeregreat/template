import { Blend, ChartNoAxesColumn, CircleDot, Diamond, MessageCircle } from "lucide-react";

import { DashedLine } from "@/components/dashed-line";
import { Button } from "@/components/ui/button";
import { EmailSubscription } from "@/components/ui/email-subscription";
import InteractiveCalendar from "@/components/ui/visualize-booking";
import { VoicePlayer } from "@/components/ui/voice-player";

const features = [
  {
    title: "Purpose-built for deal execution.",
    description:
      "Built to support the way your team actually moves deals forward.",
    icon: CircleDot,
  },
  {
    title: "Manage deals end-to-end.",
    description:
      "From briefing to close, we keep every moving part in sync.",
    icon: Blend,
  },
  {
    title: "Build momentum and trusted habits.",
    description:
      "Simple routines that keep execution consistent and reliable.",
    icon: Diamond,
  },
  {
    title: "Progress insights.",
    description:
      "You'll always know what's moving, what's stalled, and what's next - without having to ask.",
    icon: ChartNoAxesColumn,
  },
];

export const Hero = () => {
  return (
    <section className="py-28 lg:py-32 lg:pt-44">
      <div className="container flex flex-col justify-between gap-8 md:gap-14 lg:flex-row lg:gap-20">
        {/* Left side - Main content */}
        <div className="flex-1">
          <VoicePlayer />
        </div>

        {/* Right side - Features */}
        <div className="relative flex flex-1 flex-col justify-center space-y-5 max-lg:pt-10 lg:pl-10">
          <DashedLine
            orientation="vertical"
            className="absolute top-0 left-0 max-lg:hidden"
          />
          <DashedLine
            orientation="horizontal"
            className="absolute top-0 lg:hidden"
          />
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <div key={feature.title} className="flex gap-2.5 lg:gap-5">
                <Icon className="text-foreground mt-1 size-4 shrink-0 lg:size-5" />
                <div>
                  <h2 className="text-zinc-100 text-xl font-semibold tracking-tight lg:text-2xl">
                    {feature.title}
                  </h2>
                  <p className="text-muted-foreground max-w-76 text-sm">
                    {feature.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Email Subscription and WhatsApp Section */}
      <div className="mt-12 md:mt-20 mb-10 md:mb-14">
        <div className="container flex flex-col items-center justify-center gap-5">
          <div className="w-full max-w-3xl text-center">
            <EmailSubscription />
          </div>

          <Button asChild size="lg" className="w-full max-w-[420px] text-base">
            <a
              href="https://wa.me/2348012345678?text=Hi%2C%20Osagie"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-md text-base font-medium"
            >
              <MessageCircle className="size-5" />
              WhatsApp
            </a>
          </Button>
        </div>
      </div>

      <div className="mt-12 max-lg:ml-6 max-lg:h-auto max-lg:overflow-hidden md:mt-20 lg:container lg:mt-24">
        <InteractiveCalendar />
      </div>
    </section>
  );
};
