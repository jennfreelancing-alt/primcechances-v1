
"use client";
import React from "react";
import { motion } from "motion/react";

const testimonials = [
  {
    text: "PrimeChances transformed my career search. I found amazing fellowships and grants I never knew existed. The AI matching is incredibly accurate!",
    image: "https://randomuser.me/api/portraits/women/1.jpg",
    name: "Sarah Johnson",
    role: "Research Fellow",
  },
  {
    text: "The platform's user-friendly interface made finding scholarships effortless. I secured funding for my master's program within weeks!",
    image: "https://randomuser.me/api/portraits/men/2.jpg",
    name: "Ahmed Hassan",
    role: "Graduate Student",
  },
  {
    text: "Exceptional support team guided me through every step. Found perfect job opportunities at international organizations.",
    image: "https://randomuser.me/api/portraits/women/3.jpg",
    name: "Maria Garcia",
    role: "UN Program Officer",
  },
  {
    text: "The curated opportunities saved me countless hours. Every listing is legitimate and well-detailed. Highly recommend!",
    image: "https://randomuser.me/api/portraits/men/4.jpg",
    name: "David Chen",
    role: "Development Consultant",
  },
  {
    text: "AI recommendations perfectly matched my skills and interests. Landed my dream job at UNICEF through this platform.",
    image: "https://randomuser.me/api/portraits/women/5.jpg",
    name: "Priya Patel",
    role: "UNICEF Program Manager",
  },
  {
    text: "The global reach is impressive. Found opportunities I wouldn't have discovered anywhere else. Game-changing platform!",
    image: "https://randomuser.me/api/portraits/women/6.jpg",
    name: "Lisa Thompson",
    role: "World Bank Analyst",
  },
  {
    text: "Streamlined my opportunity search process. The verification system ensures all listings are authentic and valuable.",
    image: "https://randomuser.me/api/portraits/men/7.jpg",
    name: "Michael Roberts",
    role: "NGO Director",
  },
  {
    text: "Outstanding platform that connects talent with global opportunities. The personalized approach makes all the difference.",
    image: "https://randomuser.me/api/portraits/women/8.jpg",
    name: "Jennifer Lee",
    role: "International Consultant",
  },
  {
    text: "From scholarships to careers, this platform covers it all. My go-to resource for professional development opportunities.",
    image: "https://randomuser.me/api/portraits/men/9.jpg",
    name: "Carlos Rodriguez",
    role: "Policy Researcher",
  },
];

export const TestimonialsColumn = (props: {
  className?: string;
  testimonials: typeof testimonials;
  duration?: number;
}) => {
  return (
    <div className={props.className}>
      <motion.div
        animate={{
          translateY: "-50%",
        }}
        transition={{
          duration: props.duration || 10,
          repeat: Infinity,
          ease: "linear",
          repeatType: "loop",
        }}
        className="flex flex-col gap-6 pb-6 bg-background"
      >
        {[
          ...new Array(2).fill(0).map((_, index) => (
            <React.Fragment key={index}>
              {props.testimonials.map(({ text, image, name, role }, i) => (
                <div className="p-10 rounded-3xl border shadow-lg shadow-primary/10 max-w-xs w-full" key={i}>
                  <div>{text}</div>
                  <div className="flex items-center gap-2 mt-5">
                    <img
                      width={40}
                      height={40}
                      src={image}
                      alt={name}
                      className="h-10 w-10 rounded-full"
                    />
                    <div className="flex flex-col">
                      <div className="font-medium tracking-tight leading-5">{name}</div>
                      <div className="leading-5 opacity-60 tracking-tight">{role}</div>
                    </div>
                  </div>
                </div>
              ))}
            </React.Fragment>
          )),
        ]}
      </motion.div>
    </div>
  );
};

const firstColumn = testimonials.slice(0, 3);
const secondColumn = testimonials.slice(3, 6);
const thirdColumn = testimonials.slice(6, 9);

const Testimonials = () => {
  return (
    <section className="bg-background my-20 relative">
      <div className="container z-10 mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          viewport={{ once: true }}
          className="flex flex-col items-center justify-center max-w-[540px] mx-auto"
        >
          <div className="flex justify-center">
            <div className="border py-1 px-4 rounded-lg">Success Stories</div>
          </div>

          <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold tracking-tighter mt-5">
            What our users say
          </h2>
          <p className="text-center mt-5 opacity-75">
            See how PrimeChances has transformed careers and opened doors worldwide.
          </p>
        </motion.div>

        <div className="flex justify-center gap-6 mt-10 [mask-image:linear-gradient(to_bottom,transparent,black_25%,black_75%,transparent)] max-h-[740px] overflow-hidden">
          <TestimonialsColumn testimonials={firstColumn} duration={15} />
          <TestimonialsColumn testimonials={secondColumn} className="hidden md:block" duration={19} />
          <TestimonialsColumn testimonials={thirdColumn} className="hidden lg:block" duration={17} />
        </div>
      </div>
    </section>
  );
};

export { Testimonials };
