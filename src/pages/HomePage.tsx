import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, CheckCircle2, TrendingDown, Battery, Brain, Activity, Users, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MarketingLayout } from '@/components/layout/MarketingLayout';
import { useNavigate } from 'react-router-dom';
export function HomePage() {
  const navigate = useNavigate();
  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.6 }
  };
  return (
    <MarketingLayout>
      {/* HERO SECTION */}
      <section className="relative bg-navy-900 text-white overflow-hidden">
        {/* Updated Hero Image */}
        <div className="absolute inset-0 bg-[url('https://app.getdreamforge.com/api/generated/3584470a-4ec7-4006-8eac-7c761bc87ece.jpeg')] bg-cover bg-center opacity-20 mix-blend-overlay"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-navy-900/80 via-navy-900/60 to-navy-900"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32 lg:py-40">
          <div className="max-w-3xl">
            <motion.div {...fadeIn}>
              <span className="inline-block py-1 px-3 rounded-full bg-orange-500/20 text-orange-400 text-sm font-semibold mb-6 border border-orange-500/30">
                New Cohort Starting Soon
              </span>
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-display font-bold leading-tight mb-6">
                Reverse Your <span className="text-orange-500">Metabolic Age</span> in 28 Days.
              </h1>
              <p className="text-xl text-slate-300 mb-8 leading-relaxed max-w-2xl">
                Join the science-backed challenge that helps you lose visceral fat, sleep better, and reclaim your energy. Don't just diet—join the study.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  size="lg"
                  onClick={() => navigate('/register')}
                  className="bg-orange-500 hover:bg-orange-600 text-white text-lg px-8 py-6 rounded-full shadow-glow hover:shadow-lg hover:-translate-y-1 transition-all"
                >
                  Join the Challenge - $28
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="border-slate-600 text-slate-200 hover:bg-white/10 hover:text-white text-lg px-8 py-6 rounded-full"
                >
                  How It Works
                </Button>
              </div>
              <p className="mt-4 text-sm text-slate-400">
                *Includes 28-day app access, coaching, and community.
              </p>
            </motion.div>
          </div>
        </div>
      </section>
      {/* PROBLEM SECTION (The Villain) */}
      <section id="problem" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl md:text-4xl font-display font-bold text-navy-900 mb-6">
                The "Aging Myth" is Stealing Your Vitality.
              </h2>
              <p className="text-lg text-slate-600 mb-6 leading-relaxed">
                You’ve tried eating less. You’ve tried exercising more. But the scale doesn't move, and you're tired by 2:00 PM. Most people accept this as "normal aging."
              </p>
              <p className="text-lg text-slate-600 mb-8 leading-relaxed font-medium">
                It’s not your fault. It’s your Metabolic Health. And if you don't track it, you can't fix it.
              </p>
              <div className="space-y-4">
                {[
                  "Unexplained weight gain around the midsection",
                  "Restless sleep and low energy",
                  "Confusion caused by 'Diet Industry' noise"
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="mt-1 bg-red-100 p-1 rounded-full">
                      <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    </div>
                    <span className="text-slate-700">{item}</span>
                  </div>
                ))}
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="relative"
            >
              <div className="absolute -inset-4 bg-orange-100 rounded-3xl transform rotate-3"></div>
              {/* Updated Problem Image */}
              <img
                src="https://app.getdreamforge.com/api/generated/7ff632a3-dfdf-4b1b-b31d-ab4844fa1b02.jpeg"
                alt="Frustrated person looking at health data"
                className="relative rounded-2xl shadow-xl w-full object-cover aspect-[4/3]"
              />
            </motion.div>
          </div>
        </div>
      </section>
      {/* SOLUTION SECTION (The Study) */}
      <section id="solution" className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-navy-900 mb-4">
              Stop Guessing. Start Tracking.
            </h2>
            <p className="text-lg text-slate-600">
              We don't just give you a diet plan. We invite you into a Biometric Study. By tracking 5 key health markers, you see exactly how your body responds to the right inputs.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: <TrendingDown className="w-8 h-8 text-orange-500" />,
                title: "Visceral Fat Reduction",
                desc: "Target the dangerous fat around your organs that drives inflammation."
              },
              {
                icon: <Battery className="w-8 h-8 text-orange-500" />,
                title: "Lean Mass Retention",
                desc: "Protect your muscle mass to keep your metabolism burning hot."
              },
              {
                icon: <Brain className="w-8 h-8 text-orange-500" />,
                title: "Metabolic Age",
                desc: "Turn back the clock and prove that age is just a number."
              }
            ].map((card, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className="bg-white p-8 rounded-2xl shadow-soft border border-slate-100 hover:border-orange-200 transition-colors"
              >
                <div className="bg-orange-50 w-16 h-16 rounded-xl flex items-center justify-center mb-6">
                  {card.icon}
                </div>
                <h3 className="text-xl font-bold text-navy-900 mb-3">{card.title}</h3>
                <p className="text-slate-600 leading-relaxed">{card.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      {/* GUIDE SECTION (Empathy & Authority) - NEW */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
             {/* Image Side (Left on Desktop for alternation) */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="relative order-2 lg:order-1"
            >
               <div className="absolute -inset-4 bg-navy-100 rounded-3xl transform -rotate-3"></div>
               <img
                src="https://app.getdreamforge.com/api/generated/2175cc86-5368-47d1-a9c9-9e9cb950ac0b.jpeg"
                alt="Coach guiding a participant"
                className="relative rounded-2xl shadow-xl w-full object-cover aspect-[4/3]"
              />
            </motion.div>
            {/* Text Side (Right on Desktop) */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="order-1 lg:order-2"
            >
              <div className="flex items-center gap-2 mb-4">
                <ShieldCheck className="w-6 h-6 text-orange-500" />
                <span className="text-orange-500 font-bold tracking-wide uppercase text-sm">Trusted Guidance</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-display font-bold text-navy-900 mb-6">
                Guided by Science & Community.
              </h2>
              <p className="text-lg text-slate-600 mb-6 leading-relaxed">
                We’ve guided thousands of people through this reset. We understand that bodies change after 50. That's why we built a program that focuses on data, not deprivation.
              </p>
              <p className="text-lg text-slate-600 mb-8 leading-relaxed font-medium border-l-4 border-orange-500 pl-4">
                We provide the roadmap; you provide the effort.
              </p>
              <div className="flex items-center gap-4">
                 <div className="flex -space-x-3">
                    {[1,2,3,4].map(i => (
                        <div key={i} className="w-10 h-10 rounded-full border-2 border-white bg-slate-200 overflow-hidden">
                           <div className={`w-full h-full bg-navy-${i*100+300} flex items-center justify-center text-white text-xs`}>
                              <Users className="w-5 h-5 opacity-50" />
                           </div>
                        </div>
                    ))}
                 </div>
                 <div className="text-sm text-slate-500">
                    Join <span className="font-bold text-navy-900">2,000+</span> Challengers
                 </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
      {/* THE PLAN */}
      <section id="how-it-works" className="py-20 bg-navy-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
              Your Reset Starts in 3 Steps
            </h2>
            <p className="text-slate-300 text-lg">
              Simple, actionable, and data-driven.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
            {/* Connector Line (Desktop) */}
            <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-0.5 bg-navy-700 z-0"></div>
            {[
              {
                step: "01",
                title: "Place Your Bet",
                desc: "Commit to your health for less than a dollar a day ($28)."
              },
              {
                step: "02",
                title: "Track Your Habits",
                desc: "Use our simple app to log Water, Steps, Sleep, and Weekly Biometrics."
              },
              {
                step: "03",
                title: "See the Change",
                desc: "Watch your Metabolic Age drop and your energy skyrocket."
              }
            ].map((item, i) => (
              <div key={i} className="relative z-10 flex flex-col items-center text-center">
                <div className="w-24 h-24 rounded-full bg-navy-800 border-4 border-navy-700 flex items-center justify-center mb-6 shadow-glow">
                  <span className="font-display font-bold text-3xl text-orange-500">{item.step}</span>
                </div>
                <h3 className="text-xl font-bold mb-3">{item.title}</h3>
                <p className="text-slate-400 max-w-xs">{item.desc}</p>
              </div>
            ))}
          </div>
          <div className="mt-16 text-center">
            <Button
              size="lg"
              onClick={() => navigate('/register')}
              className="bg-orange-500 hover:bg-orange-600 text-white text-lg px-12 py-6 rounded-full shadow-lg hover:scale-105 transition-transform"
            >
              I'm Ready to Start
            </Button>
          </div>
        </div>
      </section>
      {/* SOCIAL PROOF */}
      <section id="stories" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-display font-bold text-center text-navy-900 mb-16">
            Real Results from the Study
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              {
                quote: "I lost 4 years of metabolic age in one month! I didn't realize how much inflammation I was carrying until I saw the data.",
                author: "Sarah, 54",
                role: "Challenger"
              },
              {
                quote: "Finally, a plan that explains WHY, not just HOW. The daily lessons changed my relationship with food forever.",
                author: "Mark, 62",
                role: "Challenger"
              }
            ].map((testimonial, i) => (
              <div key={i} className="bg-slate-50 p-8 rounded-2xl border border-slate-100">
                <div className="flex gap-1 mb-4">
                  {[1,2,3,4,5].map(s => <div key={s} className="w-5 h-5 text-orange-500 fill-current">★</div>)}
                </div>
                <p className="text-lg text-slate-700 italic mb-6">"{testimonial.quote}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-navy-200 flex items-center justify-center text-navy-700 font-bold">
                    {testimonial.author[0]}
                  </div>
                  <div>
                    <div className="font-bold text-navy-900">{testimonial.author}</div>
                    <div className="text-sm text-slate-500">{testimonial.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      {/* FINAL CTA */}
      <section className="py-24 bg-orange-500 text-white text-center">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-4xl md:text-5xl font-display font-bold mb-6">
            Bet on Yourself Today.
          </h2>
          <p className="text-xl text-orange-100 mb-10 max-w-2xl mx-auto">
            The next 28 days are going to pass anyway. Do you want to be in the same place, or do you want to be metabolically younger?
          </p>
          <Button
            size="lg"
            onClick={() => navigate('/register')}
            className="bg-white text-orange-600 hover:bg-slate-100 text-xl px-12 py-8 rounded-full shadow-xl font-bold"
          >
            Join the Challenge Now
          </Button>
          <p className="mt-6 text-sm text-orange-200">
            100% Money-back guarantee if you don't feel the difference.
          </p>
        </div>
      </section>
    </MarketingLayout>
  );
}