
import {
  GlobeIcon,
  MagnifyingGlassIcon,
  BellIcon,
  PersonIcon,
  BookmarkIcon,
} from "@radix-ui/react-icons";

import { BentoCard, BentoGrid } from "@/components/ui/bento-grid";

const features = [
  {
    Icon: MagnifyingGlassIcon,
    name: "Smart Discovery",
    description: "AI-powered matching connects you with opportunities that fit your profile and aspirations perfectly.",
    href: "/dashboard",
    cta: "Explore Now",
    background: <div className="absolute -right-20 -top-20 h-40 w-40 rounded-full bg-gradient-to-br from-blue-400/20 to-purple-400/20 blur-2xl" />,
    className: "lg:row-start-1 lg:row-end-4 lg:col-start-2 lg:col-end-3",
  },
  {
    Icon: GlobeIcon,
    name: "Global Opportunities",
    description: "Access scholarships, fellowships, and career opportunities from organizations worldwide.",
    href: "/category/all",
    cta: "Browse All",
    background: <div className="absolute -right-20 -top-20 h-40 w-40 rounded-full bg-gradient-to-br from-green-400/20 to-blue-400/20 blur-2xl" />,
    className: "lg:col-start-1 lg:col-end-2 lg:row-start-1 lg:row-end-3",
  },
  {
    Icon: PersonIcon,
    name: "Personalized Profile",
    description: "Create a comprehensive profile to get matched with the most relevant opportunities.",
    href: "/profile",
    cta: "Build Profile",
    background: <div className="absolute -right-20 -top-20 h-40 w-40 rounded-full bg-gradient-to-br from-purple-400/20 to-pink-400/20 blur-2xl" />,
    className: "lg:col-start-1 lg:col-end-2 lg:row-start-3 lg:row-end-4",
  },
  {
    Icon: BellIcon,
    name: "Real-time Alerts",
    description: "Never miss a deadline with instant notifications for new opportunities and application reminders.",
    href: "/dashboard",
    cta: "Set Alerts",
    background: <div className="absolute -right-20 -top-20 h-40 w-40 rounded-full bg-gradient-to-br from-orange-400/20 to-red-400/20 blur-2xl" />,
    className: "lg:col-start-3 lg:col-end-3 lg:row-start-1 lg:row-end-2",
  },
  {
    Icon: BookmarkIcon,
    name: "Save & Track",
    description: "Bookmark opportunities and track your applications with our comprehensive management system.",
    href: "/dashboard",
    cta: "Get Started",
    background: <div className="absolute -right-20 -top-20 h-40 w-40 rounded-full bg-gradient-to-br from-teal-400/20 to-cyan-400/20 blur-2xl" />,
    className: "lg:col-start-3 lg:col-end-3 lg:row-start-2 lg:row-end-4",
  },
];

function OpportunityBento() {
  return (
    <BentoGrid className="lg:grid-rows-3">
      {features.map((feature) => (
        <BentoCard key={feature.name} {...feature} />
      ))}
    </BentoGrid>
  );
}

export { OpportunityBento };
