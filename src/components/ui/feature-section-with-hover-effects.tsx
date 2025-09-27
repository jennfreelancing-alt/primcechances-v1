import React from "react";
import { cn } from "@/lib/utils";
import {
  IconAdjustmentsBolt,
  IconCloud,
  IconCurrencyDollar,
  IconEaseInOut,
  IconHeart,
  IconHelp,
  IconRouteAltLeft,
  IconTerminal2,
} from "@tabler/icons-react";

export function FeaturesSectionWithHoverEffects() {
  const features = [
    {
      title: "AI-Powered CV Builder",
      description:
        "Create ATS-optimized resumes tailored to specific job opportunities with our advanced AI technology.",
      icon: <IconTerminal2 />,
    },
    {
      title: "Smart Cover Letters",
      description:
        "Generate personalized cover letters that highlight your relevant skills and experience for each application.",
      icon: <IconEaseInOut />,
    },
    {
      title: "Application Guide",
      description:
        "Step-by-step guidance through the entire application process with personalized recommendations.",
      icon: <IconRouteAltLeft />,
    },
    {
      title: "Success Analysis",
      description:
        "AI-powered evaluation of your application's success probability with actionable improvement tips.",
      icon: <IconCloud />,
    },
    {
      title: "Voice Assistant",
      description:
        "Talk to our AI career assistant using natural speech for instant guidance and advice.",
      icon: <IconHelp />,
    },
    {
      title: "Personalized Matching",
      description:
        "Our AI analyzes your profile to match you with opportunities that align with your skills and goals.",
      icon: <IconCurrencyDollar />,
    },
    {
      title: "Career Insights",
      description:
        "Get data-driven insights and recommendations to improve your career prospects and growth.",
      icon: <IconAdjustmentsBolt />,
    },
    {
      title: "AI Interview Prep",
      description:
        "Practice with our AI interviewer and receive feedback to improve your interview performance.",
      icon: <IconHeart />,
    },
  ];


  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 relative z-10 py-10 max-w-7xl mx-auto">
      {features.map((feature, index) => (
        <Feature key={feature.title} {...feature} index={index} />
      ))}
    </div>
  );
}

const Feature = ({
  title,
  description,
  icon,
  index,
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
  index: number;
}) => {
  return (
    <div
      className={cn(
        "flex flex-col lg:border-r  py-10 relative group/feature dark:border-neutral-800",
        (index === 0 || index === 4) && "lg:border-l dark:border-neutral-800",
        index < 4 && "lg:border-b dark:border-neutral-800"
      )}
    >
      {/* Gradient overlay for top row */}
      {index < 4 && (
        <div className="opacity-0 group-hover/feature:opacity-100 transition duration-200 absolute inset-0 h-full w-full bg-gradient-to-t from-neutral-100 dark:from-neutral-800 to-transparent pointer-events-none" />
      )}

      {/* Gradient overlay for bottom row */}
      {index >= 4 && (
        <div className="opacity-0 group-hover/feature:opacity-100 transition duration-200 absolute inset-0 h-full w-full bg-gradient-to-b from-neutral-100 dark:from-neutral-800 to-transparent pointer-events-none" />
      )}

      {/* Icon */}
      <div className="mb-4 relative z-10 px-10 text-neutral-600 dark:text-neutral-400">
        {icon}
      </div>

      {/* Title with animated indicator */}
      <div className="text-lg font-bold mb-2 relative z-10 px-10">
        <div className="absolute left-0 inset-y-0 h-6 group-hover/feature:h-8 w-1 rounded-tr-full rounded-br-full bg-neutral-300 dark:bg-neutral-700 group-hover/feature:bg-[#90EE90] transition-all duration-200 origin-center" />
        <span className="group-hover/feature:translate-x-2 transition duration-200 inline-block text-neutral-800 dark:text-neutral-100">
          {title}
        </span>
      </div>

      {/* Description */}
      <p className="text-sm text-neutral-600 dark:text-neutral-300 max-w-xs relative z-10 px-10">
        {description}
      </p>
    </div>
  );
};
