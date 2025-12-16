import React, { useState, Suspense } from 'react';
import { motion } from 'framer-motion';
import {
  TrendingDown,
  Activity,
  Zap,
  HelpCircle,
  ArrowRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MarketingLayout } from '@/components/layout/MarketingLayout';
import { useNavigate } from 'react-router-dom';
// import { LeadGenModal } from '@/components/lead-gen-modal';
import { useSystemStats } from '@/hooks/use-queries';
import { NeuralNetworkBackground } from '@/components/ui/neural-network-background';
import { FloatingParticles } from '@/components/ui/floating-particles';
import { DotPattern } from '@/components/ui/dot-pattern';
import { AnimatedOrbs } from '@/components/ui/animated-orbs';
import { AnimatedSteps } from '@/components/ui/animated-steps';
import { BeamsBackground } from '@/components/ui/beams-background';
export function HomePage() {
  const navigate = useNavigate();
  const [isLeadGenOpen, setIsLeadGenOpen] = useState(false);
  const { data: stats } = useSystemStats();
  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: "-100px" },
    transition: { duration: 0.6 }
  };
  const staggerChildren = {
    whileInView: { transition: { staggerChildren: 0.1 } },
    viewport: { once: true, margin: "-100px" }
  };
  return (
    <MarketingLayout>
      {/* <LeadGenModal open={isLeadGenOpen} onOpenChange={setIsLeadGenOpen} /> */}
      {/* HERO SECTION */}
      <section className="relative bg-navy-900 text-white overflow-hidden min-h-screen min-h-[100dvh] flex items-center">
        {/* Neural Network Animated Background */}
        <Suspense fallback={
          <div className="absolute inset-0 bg-navy-900">
            <div className="absolute inset-0 bg-gradient-to-r from-navy-900 via-navy-900/95 to-navy-900/50"></div>
          </div>
        }>
          <NeuralNetworkBackground />
        </Suspense>
        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
          <div className="max-w-4xl">
            <motion.div {...fadeIn}>
              <div className="inline-flex items-center gap-2 py-2 px-4 rounded-full bg-gold-500/10 border border-gold-500/30 text-gold-300 text-sm font-bold mb-8 backdrop-blur-sm">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-gold-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-gold-500"></span>
                </span>
                New Cohort Starting Soon
              </div>
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-display font-bold leading-[1.1] mb-8 tracking-tight">
                <span className="text-white">Reverse Your</span> <span className="text-gold-500">Metabolic Age</span> <span className="text-white">in 28 Days.</span>
              </h1>
              <h2 className="text-xl md:text-2xl lg:text-3xl text-slate-200 font-medium mb-8 max-w-3xl leading-relaxed">
                Join the science-backed challenge that helps you lose visceral fat, sleep better, and reclaim your energy.
              </h2>
              <p className="text-lg md:text-xl text-slate-300 mb-12 leading-relaxed max-w-2xl font-sans">
                Most people over 50 accept fatigue and weight gain as a normal part of aging because traditional diets stop working. We prove them wrong.
              </p>
              <div className="flex flex-col sm:flex-row gap-5">
                <Button
                  size="lg"
                  onClick={() => navigate('/register')}
                  className="bg-gold-500 hover:bg-gold-400 text-navy-900 text-lg md:text-xl px-10 py-8 rounded-full hover:-translate-y-1 transition-all duration-300 font-bold tracking-wide"
                >
                  JOIN THE CHALLENGE - $28
                  <ArrowRight className="ml-2 h-6 w-6" />
                </Button>
                <Button
                  size="lg"
                  onClick={() => navigate('/quiz')}
                  className="bg-white/10 text-white hover:bg-white/20 border border-white/20 text-lg md:text-xl px-8 py-8 rounded-full transition-all duration-300 font-semibold backdrop-blur-sm"
                >
                  WHAT'S MY METABOLIC AGE?
                </Button>
              </div>
              <div className="mt-12 flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-8 text-sm text-slate-400 font-medium">
                <div className="flex items-center gap-4">
                  <div className="flex -space-x-2">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="w-10 h-10 rounded-full bg-navy-800 border-2 border-navy-900 flex items-center justify-center text-xs text-white overflow-hidden">
                         <div className="w-full h-full bg-slate-600 animate-pulse"></div>
                      </div>
                    ))}
                  </div>
                  <p className="text-base">
                    Join <span className="text-white font-bold">{stats?.totalParticipants ? stats.totalParticipants.toLocaleString() + '+' : '2,000+'}</span> participants
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
      {/* PROBLEM SECTION (The Stakes) */}
      <section id="problem" className="py-24 bg-navy-950 relative overflow-hidden">
        {/* Floating particles background */}
        <FloatingParticles
          count={25}
          colors={['rgba(245, 158, 11, 0.4)', 'rgba(251, 191, 36, 0.3)', 'rgba(15, 44, 89, 0.5)']}
          speed={0.2}
          minSize={1}
          maxSize={4}
        />
        {/* Subtle background gradient */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gold-500/5 rounded-full blur-[120px] translate-x-1/2 -translate-y-1/2"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
            <motion.div {...fadeIn} className="order-2 lg:order-1">
              <span className="text-gold-500 font-bold tracking-wider uppercase text-sm mb-4 block">The Problem</span>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold text-white mb-8 leading-tight">
                The "Aging Myth" is Stealing Your Vitality.
              </h2>
              <p className="text-lg md:text-xl text-slate-300 mb-8 leading-relaxed font-sans">
                You've tried eating less. You've tried exercising more. But the scale doesn't move, and you're tired by 2:00 PM.
              </p>
              <p className="text-lg md:text-xl text-slate-300 mb-10 leading-relaxed font-sans">
                It's not your fault. It's your <strong className="text-gold-400 font-bold">Metabolic Health</strong>. And if you don't track it, you can't fix it.
              </p>
              <div className="space-y-4 mb-10">
                {[
                  { title: "Unexplained Weight Gain", desc: "Especially around the midsection (Visceral Fat)." },
                  { title: "Restless Sleep & Low Energy", desc: "Waking up tired and relying on caffeine." },
                  { title: "Diet Confusion", desc: "Overwhelmed by the 'Diet Industry' noise." }
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-4 p-5 rounded-xl bg-navy-800/50 border border-navy-700 backdrop-blur-sm hover:border-gold-500/30 transition-colors duration-300">
                    <div className="bg-gold-500/20 p-2 rounded-full shrink-0 mt-1">
                      <div className="w-2 h-2 bg-gold-500 rounded-full"></div>
                    </div>
                    <div>
                      <h4 className="text-white font-bold text-xl">{item.title}</h4>
                      <p className="text-slate-400 text-lg">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="pl-6 border-l-4 border-gold-500 py-2">
                <p className="text-xl md:text-2xl text-slate-200 font-medium italic font-display">
                  "You shouldn't have to accept physical decline just because you're getting older."
                </p>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.95, rotate: 2 }}
              whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="relative order-1 lg:order-2"
            >
              <div className="absolute -inset-4 bg-gold-500/20 rounded-[2rem] transform rotate-3 z-0 blur-sm"></div>
              <div className="absolute -inset-4 bg-navy-800 rounded-[2rem] transform -rotate-2 z-0"></div>
              <img
                src="https://app.getdreamforge.com/api/generated/8bc7d2ff-f493-497f-96a7-d0b958d59224.jpeg"
                alt="Woman looking concerned about health"
                className="relative z-10 rounded-2xl shadow-2xl w-full object-cover aspect-[4/5] border border-navy-700"
              />
            </motion.div>
          </div>
        </div>
      </section>
      {/* SOLUTION SECTION (Value Prop) */}
      <section id="solution" className="py-24 bg-navy-900 relative overflow-hidden">
        {/* Dot pattern background */}
        <DotPattern
          dotColor="rgba(245, 158, 11, 0.08)"
          dotSize={1}
          gap={32}
          fade={true}
          fadeDirection="radial"
        />
        {/* Subtle background accents */}
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-gold-500/5 rounded-full blur-[100px] -translate-x-1/2 translate-y-1/2"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <span className="text-gold-500 font-bold tracking-wider uppercase text-sm mb-3 block">The Solution</span>
            <h2 className="text-4xl md:text-5xl font-display font-bold text-white mb-6">
              Stop Guessing. Start Tracking.
            </h2>
            <p className="text-xl md:text-2xl text-slate-300 leading-relaxed font-sans">
              We don't just give you a diet plan. We invite you into a Biometric Study. By tracking 5 key health markers, you see exactly how your body responds to the right inputs.
            </p>
          </div>
          <motion.div
            variants={staggerChildren}
            initial="initial"
            whileInView="whileInView"
            className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12"
          >
            {[
              {
                icon: <TrendingDown className="w-10 h-10 text-gold-500" />,
                title: "Visceral Fat Reduction",
                desc: "Protect your organs. Target the dangerous fat stored deep in the abdomen that drives metabolic disease."
              },
              {
                icon: <Activity className="w-10 h-10 text-gold-500" />,
                title: "Lean Mass Retention",
                desc: "Keep your strength. Most diets burn muscle. Our protocol is designed to preserve lean mass while burning fat."
              },
              {
                icon: <Zap className="w-10 h-10 text-gold-500" />,
                title: "Metabolic Age",
                desc: "Turn back the clock. Watch your metabolic age drop as your cellular health improves week by week."
              }
            ].map((card, i) => (
              <motion.div
                key={i}
                variants={fadeIn}
                className="bg-navy-800/50 p-10 rounded-2xl border border-navy-700 hover:border-gold-500/30 hover:-translate-y-2 transition-all duration-300 group backdrop-blur-sm"
              >
                <div className="bg-gold-500/10 w-20 h-20 rounded-2xl flex items-center justify-center mb-8 group-hover:bg-gold-500/20 transition-colors duration-300 border border-gold-500/20">
                  <div className="group-hover:scale-110 transition-transform duration-300">
                    {card.icon}
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-white mb-4 font-display">{card.title}</h3>
                <p className="text-slate-400 leading-relaxed text-lg font-sans">{card.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>
      {/* GUIDE SECTION (Empathy & Authority) */}
      <section id="stories" className="py-24 bg-navy-950 relative overflow-hidden">
        {/* Floating particles background */}
        <FloatingParticles
          count={20}
          colors={['rgba(245, 158, 11, 0.3)', 'rgba(251, 191, 36, 0.25)', 'rgba(30, 64, 175, 0.4)']}
          speed={0.15}
          minSize={1}
          maxSize={3}
        />
        {/* Subtle background gradient */}
        <div className="absolute top-1/2 left-1/2 w-[800px] h-[800px] bg-gold-500/3 rounded-full blur-[150px] -translate-x-1/2 -translate-y-1/2"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="relative"
            >
              <div className="absolute -inset-4 bg-navy-800 rounded-[2rem] transform -rotate-2"></div>
              <div className="absolute -inset-4 bg-gold-500/10 rounded-[2rem] transform rotate-2 blur-sm"></div>
              <img
                src="https://app.getdreamforge.com/api/generated/fe5264c6-500c-407f-ad23-308eef4253cc.jpeg"
                alt="Empathetic guide helping a participant"
                className="relative rounded-2xl shadow-xl w-full object-cover aspect-[4/3] border border-navy-700"
              />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <div className="mb-12">
                <span className="text-gold-500 font-bold tracking-wider uppercase text-sm mb-3 block">Guided by Science & Community</span>
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold text-white mb-6">
                  We Know That Diet Fads Stop Working After 50.
                </h2>
                <p className="text-xl text-slate-300 font-sans leading-relaxed mb-6">
                  We've guided thousands of people through this reset. We understand that bodies change after 50. That's why we built a program that focuses on data, not deprivation.
                </p>
                <p className="text-xl text-gold-400 font-medium italic">
                  We provide the roadmap; you provide the effort.
                </p>
              </div>
              <div className="space-y-6">
                <div className="bg-navy-800/50 p-8 rounded-xl border border-navy-700 backdrop-blur-sm">
                  <p className="text-slate-300 italic mb-4 text-lg">"I lost 4 years of metabolic age in one month! Finally, a plan that explains WHY, not just HOW."</p>
                  <div className="font-bold text-gold-500 text-lg">- Sarah, 54</div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
      {/* PLAN SECTION */}
      <section id="how-it-works" className="py-24 bg-navy-900 text-white relative overflow-hidden">
        {/* Dot pattern background */}
        <DotPattern
          dotColor="rgba(245, 158, 11, 0.06)"
          dotSize={1}
          gap={28}
          fade={true}
          fadeDirection="bottom"
        />
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-10 pointer-events-none">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gold-500 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2"></div>
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-500 rounded-full blur-[120px] translate-y-1/2 -translate-x-1/2"></div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-20">
            <h2 className="text-3xl md:text-5xl font-display font-bold mb-6 text-white leading-tight">
              Your Reset Starts in 3 Steps.
            </h2>
          </div>
          <AnimatedSteps
            steps={[
              {
                step: "01",
                title: "Place Your Bet",
                desc: "Commit to your health for less than a dollar a day. Join the challenge for $28."
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
            ]}
            className="mb-20"
          />
          <div className="text-center">
            <Button
              size="lg"
              onClick={() => navigate('/register')}
              className="bg-gold-500 hover:bg-gold-600 text-navy-900 text-xl px-12 py-8 rounded-full font-bold transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              I'M READY TO START
            </Button>
          </div>
        </div>
      </section>
      {/* EXPLANATORY SECTION (Why $28?) */}
      <section className="py-24 bg-navy-900 relative overflow-hidden">
        {/* Floating particles background */}
        <FloatingParticles
          count={15}
          colors={['rgba(245, 158, 11, 0.25)', 'rgba(251, 191, 36, 0.2)']}
          speed={0.1}
          minSize={1}
          maxSize={3}
        />
        <div className="absolute top-0 left-1/2 w-[600px] h-[600px] bg-gold-500/5 rounded-full blur-[120px] -translate-x-1/2 -translate-y-1/2"></div>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gold-500/10 border border-gold-500/20 mb-8">
              <HelpCircle className="w-10 h-10 text-gold-500" />
            </div>
            <h2 className="text-3xl md:text-4xl font-display font-bold text-white mb-8">
              Why do we charge $28?
            </h2>
            <p className="text-xl text-slate-300 mb-10 leading-relaxed font-sans">
              We used to offer free challenges, but we found that people who don't pay, don't pay attention. We want you to succeed. By betting $28 on yourself, you are making a psychological commitment to show up.
            </p>
            <div className="bg-navy-800/50 p-8 rounded-2xl border border-navy-700 backdrop-blur-sm inline-block text-left max-w-2xl w-full">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                <div>
                  <h3 className="font-bold text-white text-xl mb-2 flex items-center gap-3">
                    <span className="bg-gold-500 text-navy-900 text-xs px-2 py-1 rounded uppercase tracking-wider font-bold">Coach Option</span>
                    Are you an Optivia Coach?
                  </h3>
                  <p className="text-slate-400 text-base">
                    Register as a Captain ($49) to lead a team and access advanced study data.
                  </p>
                </div>
                <Button
                  variant="outline"
                  onClick={() => navigate('/register')}
                  className="shrink-0 border-gold-500/30 text-gold-500 hover:bg-gold-500/10 hover:border-gold-500/50 font-bold"
                >
                  Register as Captain
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* FINAL CTA */}
      <BeamsBackground intensity="subtle" className="py-32 bg-gold-500 text-center">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="text-4xl md:text-6xl font-display font-bold mb-8 leading-tight text-navy-900">
            Don't just diet. Join the study.
          </h2>
          <p className="text-xl md:text-2xl text-navy-800 mb-6 max-w-3xl mx-auto font-medium">
            Reverse your metabolic age and finally feel at home in your body again.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-6 mt-12">
            <Button
              size="lg"
              onClick={() => navigate('/register')}
              className="bg-navy-900 text-white hover:bg-navy-800 text-xl px-12 py-8 rounded-full shadow-2xl font-bold hover:-translate-y-1 transition-all duration-300"
            >
              JOIN THE CHALLENGE
            </Button>
            <Button
              size="lg"
              onClick={() => navigate('/quiz')}
              className="bg-navy-900 text-white hover:bg-navy-800 text-lg px-10 py-8 rounded-full font-semibold transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              TAKE THE QUIZ FIRST
            </Button>
          </div>
        </div>
      </BeamsBackground>
    </MarketingLayout>
  );
}