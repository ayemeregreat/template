import Image from "next/image";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const About = () => {
  return (
    <section className="container mt-10 flex max-w-5xl flex-col gap-8 md:mt-14 md:gap-14 lg:mt-20 lg:gap-16">
      <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:gap-10 xl:gap-14">
        <PillarsSection />
        <ImageSection
          images={[
            { src: "/about/3.webp", alt: "Modern workspace" },
            { src: "/about/4.webp", alt: "Team collaboration" },
          ]}
          className="lg:w-[340px] lg:pt-2 xl:translate-x-10"
        />
      </div>
    </section>
  );
};

export default About;

interface ImageSectionProps {
  images: { src: string; alt: string }[];
  className?: string;
}

export function ImageSection({ images, className }: ImageSectionProps) {
  return (
    <div className={cn("flex flex-col gap-6", className)}>
      {images.map((image, index) => (
        <div
          key={index}
          className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl"
        >
          <Image
            src={image.src}
            alt={image.alt}
            fill
            className="object-cover"
          />
        </div>
      ))}
    </div>
  );
}

function PillarsSection() {
  const pillars = [
    {
      title: "Bespoke Deal Structuring",
      description:
        "Eliminating transactional friction and administrative delays with highly tailored frameworks designed for high-stakes execution.",
    },
    {
      title: "Absolute Alignment",
      description:
        "We operate with complete corporate discretion. Because your legacy is our benchmark, our success is tied directly to your secured wins.",
    },
    {
      title: "Immediate Recalibration",
      description:
        "Setbacks are built directly into our strategy. When market conditions shift, we instantly convert the friction into an operational edge.",
    },
  ];

  return (
    <section className="flex-1">
      <div className="max-w-xl space-y-6">
        <div className="space-y-2">
          <p className="text-muted-foreground text-xs font-semibold uppercase tracking-[0.3em]">
            The Mandate
          </p>
          <h2 className="font-display text-3xl font-semibold tracking-tight text-zinc-100 md:text-4xl">
            Our Pillars of Execution
          </h2>
        </div>

        <div className="grid gap-4">
          {pillars.map((pillar) => (
            <article key={pillar.title} className="p-0">
              <h3 className="font-display text-2xl font-semibold tracking-tight text-zinc-100 md:text-[1.75rem]">
                {pillar.title}
              </h3>
              <p className="font-text mt-1 text-sm leading-7 text-zinc-400 md:text-base">
                {pillar.description}
              </p>
            </article>
          ))}
        </div>

        <div className="pt-2">
          <Link href="/careers">
            <Button size="lg">View open roles</Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
