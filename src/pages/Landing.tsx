import STECHADLogo from "@/components/STECHADLogo";
import {
  ArrowRight,
  BadgeCheck,
  Cable,
  Cloud,
  Globe2,
  Handshake,
  Layers,
  Lock,
  MonitorSmartphone,
  Network,
  Server,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

type IconType = React.ComponentType<{ className?: string }>;
type Stat = { label: string; value: number; suffix?: string; prefix?: string };

const services: { title: string; description: string; icon: IconType }[] = [
  {
    title: "IT Staffing & Outstaffing",
    description: "Deploy vetted engineers on demand with 24/7 coverage across Europe and Africa.",
    icon: Users,
  },
  {
    title: "Network Engineering",
    description: "High-speed, secure networks from design to field surveys, install, and turn-ups.",
    icon: Network,
  },
  {
    title: "Cloud & Infrastructure",
    description: "Resilient cloud, data center, and on-prem builds with proactive monitoring.",
    icon: Cloud,
  },
  {
    title: "Cybersecurity",
    description: "Risk assessments, hardening, incident response, and zero-trust rollouts.",
    icon: ShieldCheck,
  },
  {
    title: "Project Management",
    description: "PMO-grade governance, agile delivery, and transparent reporting for every sprint.",
    icon: Layers,
  },
  {
    title: "Desktop & EUC Support",
    description: "Break/fix, migrations, and end-user computing that just works for global teams.",
    icon: MonitorSmartphone,
  },
  {
    title: "Cabling & Hardware",
    description: "Structured cabling, device installs, and hardware lifecycle services with clear SLAs.",
    icon: Cable,
  },
  {
    title: "Consulting & Advisory",
    description: "Strategy, governance, and roadmaps tailored to your operating model and budget.",
    icon: Handshake,
  },
];

const differentiators: { title: string; description: string; icon: IconType }[] = [
  {
    title: "Strategic IT Partner",
    description: "We co-create roadmaps that align technology with revenue and resilience goals.",
    icon: Sparkles,
  },
  {
    title: "Global Reliability",
    description: "Delivery hubs in Europe and Africa provide same-day response and local compliance.",
    icon: Globe2,
  },
  {
    title: "Security First",
    description: "Certified specialists embed security across infrastructure, data, and workflows.",
    icon: Lock,
  },
  {
    title: "Proven Talent",
    description: "Vetted engineers across levels L1 to L3, ready for onsite or remote work.",
    icon: BadgeCheck,
  },
];

const caseHighlights = [
  {
    title: "Europe-wide Field Services",
    body: "Dispatch, short-term, and full-time onsite support in France, Germany, Belgium, the UK, and beyond.",
    accent: "Deploy",
  },
  {
    title: "Enterprise Support at Scale",
    body: "Break/fix and installations for tier-1 manufacturers with 2hr, 4hr, and NBD SLAs across multiple countries.",
    accent: "Assure",
  },
  {
    title: "Long-term Desktop Programs",
    body: "Full-time onsite desktop support for thousands of users while improving uptime and satisfaction metrics.",
    accent: "Sustain",
  },
];

const stats: Stat[] = [
  { label: "Countries covered", value: 50, suffix: "+" },
  { label: "Avg. response time", value: 1, suffix: " min" },
  { label: "Certified engineers", value: 1400, suffix: "+" },
  { label: "Projects delivered", value: 3200, suffix: "+" },
];

const steps = [
  {
    title: "Discover",
    copy: "Share your needs or skills. We map them to the right stack and location.",
  },
  {
    title: "Vet",
    copy: "Technical and background vetting for quality, compliance, and safety.",
  },
  {
    title: "Deploy",
    copy: "Onboard in days with clear SLAs and blended onsite/remote options.",
  },
  {
    title: "Support",
    copy: "Delivery oversight, health checks, and responsive incident management.",
  },
];

const testimonials = [
  {
    quote: "STECHAD mobilized engineers across three countries in under a week and kept our stores online through a critical rollout.",
    name: "Retail Operations Lead",
    org: "Global Retail Brand",
  },
  {
    quote: "Their project managers and network specialists delivered ahead of schedule, with transparent reporting throughout.",
    name: "Head of Infrastructure",
    org: "Fintech Enterprise",
  },
];

const CountUp = ({ value, duration = 2000, suffix = "", prefix = "" }: { value: number; duration?: number; suffix?: string; prefix?: string }) => {
  const [display, setDisplay] = useState(0);
  const frame = useRef<number>();

  useEffect(() => {
    const start = performance.now();
    const step = (timestamp: number) => {
      const progress = Math.min((timestamp - start) / duration, 1);
      setDisplay(Math.floor(value * progress));
      if (progress < 1) {
        frame.current = requestAnimationFrame(step);
      }
    };
    frame.current = requestAnimationFrame(step);
    return () => {
      if (frame.current) cancelAnimationFrame(frame.current);
    };
  }, [value, duration]);

  return (
    <span>
      {prefix}
      {display.toLocaleString()}
      {suffix}
    </span>
  );
};

const CTAButtons = () => (
  <div className="flex flex-col sm:flex-row gap-3">
    <Link
      to="/login"
      className="inline-flex items-center justify-center gap-2 bg-primary text-white px-6 py-3 rounded-xl font-semibold shadow-sm hover:bg-primary-faint transition"
    >
      Login
      <ArrowRight className="h-4 w-4" />
    </Link>
    <Link
      to="/engineer-signup"
      className="inline-flex items-center justify-center gap-2 border border-primary text-primary bg-white px-6 py-3 rounded-xl font-semibold hover:bg-primary-light transition"
    >
      Join as engineer
    </Link>
  </div>
);

const HowItWorks = () => (
  <section className="py-16 bg-white" aria-labelledby="how-it-works">
    <div className="max-w-6xl mx-auto px-4 md:px-0">
      <div className="flex flex-col gap-4 mb-10 max-w-3xl">
        <p className="uppercase tracking-[0.18em] text-sm text-primary font-semibold">How engagements run</p>
        <h2 id="how-it-works" className="text-3xl font-extrabold text-text-main">
          Simple, transparent, and fast.
        </h2>
        <p className="text-text-muted text-base">
          Whether you are hiring talent or joining as an engineer, we keep the process lean so you can focus on delivery.
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {steps.map((step, idx) => (
          <div
            key={step.title}
            className="rounded-2xl border border-border bg-white shadow-smooth px-5 py-6 transition hover:-translate-y-1 hover:shadow-md animate-fade-up"
          >
            <div className="flex items-center gap-3 mb-2">
              <span className="h-9 w-9 inline-flex items-center justify-center rounded-full bg-primary-light text-primary font-bold">
                {idx + 1}
              </span>
              <p className="font-semibold text-text-main">{step.title}</p>
            </div>
            <p className="text-sm text-text-muted leading-relaxed">{step.copy}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

const Landing = () => {
  return (
    <div className="bg-background text-text-main">
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-light via-white to-white">
        <div className="absolute -right-10 top-10 h-40 w-40 rounded-full bg-primary/10 blur-3xl animate-float-slow" />
        <div className="absolute -left-16 bottom-0 h-48 w-48 rounded-full bg-primary/5 blur-3xl animate-float-slow" />
        <div className="max-w-7xl mx-auto px-4 md:px-0 pt-16 lg:pt-20 pb-24 grid md:grid-cols-2 gap-16 items-center relative z-10">
          <div className="space-y-6 animate-fade-up">
            <div className="flex items-center gap-3">
              <STECHADLogo size={62} />
              <div className="text-sm uppercase tracking-[0.2em] text-primary font-semibold">IT Outsourcing Partner</div>
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold leading-tight">
              Transforming businesses with innovative IT solutions.
            </h1>
            <p className="text-lg md:text-xl text-text-muted leading-relaxed max-w-2xl">
              We deliver staffing, infrastructure, cybersecurity, cloud, and project leadership that keep global teams online, secure, and future-ready.
            </p>
            <div className="flex flex-wrap gap-3">
              {["Europe and Africa coverage", "24/7 response", "Onsite + remote", "Security-led"]
                .map((pill) => (
                  <span
                    key={pill}
                    className="inline-flex items-center gap-2 rounded-full bg-white/80 border border-border px-4 py-2 text-sm text-text-muted shadow-sm"
                  >
                    <span className="h-2 w-2 rounded-full bg-primary" />
                    {pill}
                  </span>
                ))}
            </div>
            <CTAButtons />
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4">
              {stats.map((stat) => (
                <div key={stat.label} className="rounded-xl bg-white/80 border border-border p-4 md:px-2 md:py-4 shadow-sm animate-fade-up">
                  <p className="text-3xl md:text-4xl font-extrabold text-primary">
                    <CountUp value={stat.value} suffix={stat.suffix} prefix={stat.prefix} />
                  </p>
                  <p className="text-xs uppercase tracking-[0.14em] text-text-muted">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="relative animate-fade-up">
            <div className="absolute -inset-4 bg-gradient-to-tr from-primary/10 via-white to-white rounded-[28px] blur-xl" />
            <div className="relative rounded-[28px] overflow-hidden shadow-xl border border-border bg-white">
              <img
                src="https://images.unsplash.com/photo-1556761175-4b46a572b786?auto=format&fit=crop&w=1200&q=80"
                alt="Engineers collaborating"
                className="w-full h-[420px] object-cover"
              />
              <div className="absolute bottom-4 left-4 right-4 bg-white/90 backdrop-blur rounded-2xl border border-border p-4 shadow-smooth">
                <div className="flex items-center gap-3">
                  <Server className="h-9 w-9 text-primary" />
                  <div>
                    <p className="text-sm text-text-muted">Live projects</p>
                    <p className="font-semibold">Onsite and remote engineers ready to deploy today.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 md:px-0 py-14" aria-labelledby="services">
        <div className="space-y-3 max-w-3xl">
          <p className="uppercase tracking-[0.18em] text-sm text-primary font-semibold">What we do</p>
          <h2 id="services" className="text-3xl font-extrabold">Full-spectrum IT services, one partner.</h2>
          <p className="text-text-muted leading-relaxed">
            From managed services to rapid field engineering, STECHAD covers the lifecycle: design, build, secure, operate, and optimize. Our teams work beside yours with clear SLAs and measurable outcomes.
          </p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mt-10">
          {services.map(({ title, description, icon: Icon }) => (
            <div
              key={title}
              className="group rounded-2xl border border-border bg-white p-5 shadow-smooth transition hover:-translate-y-1 hover:shadow-md animate-fade-up"
            >
              <div className="flex items-center gap-3 mb-3">
                <span className="h-11 w-11 inline-flex items-center justify-center rounded-xl bg-primary-light text-primary">
                  <Icon className="h-5 w-5" />
                </span>
                <h3 className="font-semibold text-lg">{title}</h3>
              </div>
              <p className="text-sm text-text-muted leading-relaxed">{description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-primary text-white py-14" aria-labelledby="why-stechad">
        <div className="max-w-6xl mx-auto px-4 md:px-0 grid md:grid-cols-2 gap-10 items-center">
          <div className="space-y-4">
            <h2 id="why-stechad" className="text-3xl font-extrabold">Why companies choose STECHAD</h2>
            <p className="text-white/80">
              We combine local presence with global reach, pairing certified experts with battle-tested processes. Security, uptime, and speed to deploy are baked into every engagement.
            </p>
            <div className="grid sm:grid-cols-2 gap-4">
              {differentiators.map(({ title, description, icon: Icon }) => (
                <div key={title} className="rounded-xl bg-white/10 border border-white/20 p-4 backdrop-blur animate-fade-up">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="h-10 w-10 inline-flex items-center justify-center rounded-lg bg-white/15">
                      <Icon className="h-5 w-5" />
                    </span>
                    <p className="font-semibold">{title}</p>
                  </div>
                  <p className="text-sm text-white/80 leading-relaxed">{description}</p>
                </div>
              ))}
            </div>
            <div className="flex gap-3 flex-wrap text-sm text-white/80">
              <span className="inline-flex items-center gap-2"><Server className="h-4 w-4" /> 24/7 operations desk</span>
              <span className="inline-flex items-center gap-2"><Network className="h-4 w-4" /> Remote and onsite coverage</span>
              <span className="inline-flex items-center gap-2"><ShieldCheck className="h-4 w-4" /> Security built-in</span>
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            {caseHighlights.map(({ title, body, accent }) => (
              <div key={title} className="rounded-2xl bg-white text-text-main p-5 shadow-lg border border-white/40 animate-fade-up">
                <p className="text-xs uppercase tracking-[0.14em] text-primary font-semibold mb-2">{accent}</p>
                <h3 className="font-semibold text-lg mb-2">{title}</h3>
                <p className="text-sm text-text-muted leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 md:px-0 py-14" aria-labelledby="engineers">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-4">
            <p className="uppercase tracking-[0.18em] text-sm text-primary font-semibold">For engineers</p>
            <h2 id="engineers" className="text-3xl font-extrabold">Build a global career with STECHAD.</h2>
            <p className="text-text-muted">
              Work on meaningful projects from on-the-ground network builds to cloud migrations and cybersecurity rollouts. We back you with training, clear SLAs, and support from senior leads.
            </p>
            <div className="space-y-2 text-sm text-text-muted">
              <div className="flex items-center gap-2"><BadgeCheck className="h-4 w-4 text-primary" /> Transparent rates and timely payouts.</div>
              <div className="flex items-center gap-2"><Globe2 className="h-4 w-4 text-primary" /> Work across Europe and Africa with visa-aware planning.</div>
              <div className="flex items-center gap-2"><Lock className="h-4 w-4 text-primary" /> Security and safety standards on every engagement.</div>
            </div>
            <Link
              to="/engineer-signup"
              className="inline-flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-xl font-semibold shadow-sm hover:bg-primary-faint transition"
            >
              Get started as an engineer
            </Link>
          </div>
          <div className="rounded-[28px] border border-border shadow-smooth p-6 bg-white relative overflow-hidden">
            <div className="absolute -top-10 -right-10 h-32 w-32 rounded-full bg-primary-light blur-2xl" />
            <div className="space-y-4 relative z-10">
              <div className="flex items-center gap-3">
                <span className="h-10 w-10 inline-flex items-center justify-center rounded-lg bg-primary-light text-primary"><BadgeCheck className="h-5 w-5" /></span>
                <div>
                  <p className="text-xs text-text-muted">Opportunities</p>
                  <p className="font-semibold">Field, cloud, cybersecurity, PM, and more.</p>
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                {["Dispatch gigs", "Short-term sprints", "Full-time placements", "Remote pods"].map((item) => (
                  <div key={item} className="rounded-xl border border-border bg-muted/50 p-4 text-sm font-medium text-text-main">
                    {item}
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-3">
                <span className="h-11 w-11 inline-flex items-center justify-center rounded-xl bg-primary text-white"><Handshake className="h-5 w-5" /></span>
                <div>
                  <p className="text-sm text-text-muted">Mentorship and upskilling</p>
                  <p className="font-semibold">Work with leads who invest in your growth.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <HowItWorks />

      <section className="max-w-6xl mx-auto px-4 md:px-0 pb-14" aria-labelledby="testimonials">
        <div className="space-y-2 mb-6">
          <p className="uppercase tracking-[0.18em] text-sm text-primary font-semibold">Results</p>
          <h2 id="testimonials" className="text-3xl font-extrabold">What partners say</h2>
        </div>
        <div className="grid md:grid-cols-2 gap-5">
          {testimonials.map((item) => (
            <div key={item.quote} className="rounded-2xl border border-border bg-white p-5 shadow-smooth">
              <p className="text-text-main font-semibold mb-2">"{item.quote}"</p>
              <p className="text-sm text-text-muted">{item.name} - {item.org}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 md:px-0 pb-16">
        <div className="rounded-3xl border border-border bg-white shadow-smooth p-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <p className="uppercase tracking-[0.18em] text-sm text-primary font-semibold">Ready to move?</p>
            <h2 className="text-3xl font-extrabold">Let us design your next project or placement.</h2>
            <p className="text-text-muted">
              Tell us the skills, locations, and timelines you need. We will respond with a clear plan, vetted talent, and a go-live date.
            </p>
          </div>
          <div className="text-sm text-text-muted">Use the hero buttons above to start.</div>
        </div>
      </section>
    </div>
  );
};

export default Landing;
