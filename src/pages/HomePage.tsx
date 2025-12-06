import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  TrendingDown,
  Activity,
  Zap,
  HelpCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MarketingLayout } from '@/components/layout/MarketingLayout';
import { useNavigate } from 'react-router-dom';
import { LeadGenModal } from '@/components/lead-gen-modal';
export function HomePage() {
  const navigate = useNavigate();
  const [isLeadGenOpen, setIsLeadGenOpen] = useState(false);
  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.6 }
  };
  return (
    <MarketingLayout>
      <LeadGenModal open={isLeadGenOpen} onOpenChange={setIsLeadGenOpen} />
      {/* HERO SECTION */}
      <section className="relative bg-navy-900 text-white overflow-hidden">
        {/* Background images - Updated URL */}
        <div className="absolute inset-0 bg-[url('https://app.getdreamforge.com/api/generated/71ad42fd-0082-4739-8418-65e29178b0b7.jpeg')] bg-cover bg-center opacity-20 mix-blend-overlay"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-navy-900/80 via-navy-900/60 to-navy-900"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32 lg:py-40">
          <div className="max-w-4xl">
            <motion.div {...fadeIn}>
              <span className="inline-block py-1 px-3 rounded-full bg-orange-500/20 text-orange-400 text-sm font-semibold mb-6 border border-orange-500/30">
                New Cohort Starting Soon
              </span>
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-display font-bold leading-tight mb-6">
                Reverse Your <span className="text-orange-500">Metabolic Age</span> in Just 28 Days.
              </h1>
              <h2 className="text-xl md:text-2xl text-slate-200 font-medium mb-6 max-w-3xl">
                Stop guessing with fad diets. Join the science-backed study designed to help adults over 50 reclaim their energy, lose visceral fat, and optimize their health.
              </h2>
              <p className="text-lg text-slate-400 mb-10 leading-relaxed max-w-2xl">
                Most people accept fatigue and weight gain as a normal part of aging. We prove them wrong. By tracking 5 key biometric markers, you can turn back the clock on your metabolism and feel at home in your body again.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  size="lg"
                  onClick={() => navigate('/register')}
                  className="bg-orange-500 hover:bg-orange-600 text-white text-lg px-8 py-6 rounded-full shadow-glow hover:shadow-lg hover:-translate-y-1 transition-all"
                >
                  JOIN THE CHALLENGE
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => setIsLeadGenOpen(true)}
                  className="border-slate-600 text-slate-200 hover:bg-white/10 hover:text-white text-lg px-8 py-6 rounded-full"
                >
                  GET THE METABOLIC HEALTH CHECKLIST
                </Button>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
      {/* PROBLEM SECTION (The Stakes) */}
      <section id="problem" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div {...fadeIn}>
              <h2 className="text-3xl md:text-4xl font-display font-bold text-navy-900 mb-6">
                The Diets That Worked in Your 30s Have Stopped Working.
              </h2>
              <p className="text-lg text-slate-600 mb-6 leading-relaxed">
                It’s not your fault, and you aren’t crazy. As we age, an invisible thief called <strong className="text-navy-900">Metabolic Decline</strong> steals our energy and changes how our bodies process food.
              </p>
              <p className="text-lg text-slate-600 mb-8 leading-relaxed">
                If you ignore your metabolic health, the cost is high:
              </p>
              <div className="space-y-4 mb-8">
                {[
                  "Stubborn Weight Gain",
                  "Brain Fog",
                  "Declining Energy"
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="bg-red-100 p-1.5 rounded-full">
                      <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    </div>
                    <span className="text-slate-700 font-medium">{item}</span>
                  </div>
                ))}
              </div>
              <p className="text-lg text-navy-900 font-medium italic border-l-4 border-orange-500 pl-4">
                "You shouldn't have to accept 'slowing down' just because you’re getting older. You deserve to live your prime years with vitality."
              </p>
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
                src="https://app.getdreamforge.com/api/generated/8bc7d2ff-f493-497f-96a7-d0b958d59224.jpeg"
                alt="Woman looking concerned about health"
                className="relative rounded-2xl shadow-xl w-full object-cover aspect-[4/3]"
              />
            </motion.div>
          </div>
        </div>
      </section>
      {/* SOLUTION SECTION (Value Prop) */}
      <section id="solution" className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-navy-900 mb-4">
              Don’t Just Diet. Join the Study.
            </h2>
            <p className="text-xl text-slate-600">
              We replace confusion with clinical data.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: <Activity className="w-8 h-8 text-orange-500" />,
                title: "Clarity Over Guesswork",
                desc: "Stop wondering what works. We don't rely on trends. We use a 'Study' methodology to track your specific biometric data, so you know exactly how your body is responding in real-time."
              },
              {
                icon: <TrendingDown className="w-8 h-8 text-orange-500" />,
                title: "Visceral Fat Reduction",
                desc: "Target the fat that matters. Metabolic decline stores fat around your organs. Our protocol is specifically engineered to target dangerous visceral fat, reducing your health risks and shrinking your waistline."
              },
              {
                icon: <Zap className="w-8 h-8 text-orange-500" />,
                title: "Sustainable Energy",
                desc: "Wake up ready for the day. By optimizing your metabolic markers, you eliminate the afternoon crash. Experience the steady, reliable energy you haven't felt in decades."
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
      {/* PLAN SECTION */}
      <section id="how-it-works" className="py-20 bg-navy-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
              Your Path to a Younger Metabolism is Simple.
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative mb-16">
            {/* Connector Line (Desktop) */}
            <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-0.5 bg-navy-700 z-0"></div>
            {[
              {
                step: "01",
                title: "Place Your Bet",
                desc: "Commit to yourself. Join the challenge for just $28. This isn't a fee—it's an accountability pledge to ensure you show up for your health."
              },
              {
                step: "02",
                title: "Track Your Habits",
                desc: "Follow the protocol. Use our mobile-friendly app to track simple daily habits. No complex calorie counting—just clear, science-backed inputs."
              },
              {
                step: "03",
                title: "See the Change",
                desc: "See the proof. Watch your biometric markers improve, your energy skyrocket, and your metabolic age drop."
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
          <div className="text-center">
             <Button
                variant="outline"
                size="lg"
                onClick={() => {
                    const el = document.getElementById('solution');
                    el?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-white text-lg px-8 py-6 rounded-full"
              >
                SEE HOW IT WORKS
              </Button>
          </div>
        </div>
      </section>
      {/* TRANSFORMATION SECTION */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-navy-900 mb-8">
              Who Will You Be in 28 Days?
            </h2>
            <p className="text-lg text-slate-600 mb-12 leading-relaxed">
              Right now, you might feel sluggish, frustrated, and worried that your best years are behind you. But 28 days from now, you could be a different person. Imagine walking into a room with confidence, sleeping through the night, and having the energy to keep up with your grandkids or travel the world.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-slate-50 p-8 rounded-2xl border border-slate-200">
                <div className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">From</div>
                <h3 className="text-xl font-bold text-slate-700">An Aging Bystander</h3>
                <p className="text-slate-500 mt-2">Feeling "past their prime" and accepting decline.</p>
              </div>
              <div className="bg-navy-50 p-8 rounded-2xl border border-navy-100 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-16 h-16 bg-orange-500/10 rounded-bl-full"></div>
                <div className="text-sm font-bold text-orange-600 uppercase tracking-wider mb-2">To</div>
                <h3 className="text-xl font-bold text-navy-900">A Metabolically Optimized Adult</h3>
                <p className="text-navy-700 mt-2">Aging in reverse with vitality and purpose.</p>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* GUIDE SECTION (Social Proof) - RESTRUCTURED */}
      <section id="stories" className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Column: New Guide Image */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <img
                src="https://app.getdreamforge.com/api/generated/fe5264c6-500c-407f-ad23-308eef4253cc.jpeg"
                alt="Empathetic guide helping a participant"
                className="rounded-2xl shadow-xl w-full object-cover aspect-[4/3]"
              />
            </motion.div>
            {/* Right Column: Content & Testimonials */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className="mb-10">
                <h2 className="text-3xl md:text-4xl font-display font-bold text-navy-900 mb-4">
                  Join Thousands Who Refused to 'Slow Down.'
                </h2>
                <p className="text-lg text-slate-600">
                  We aren't influencers; we are researchers. We treat your health with clinical precision.
                </p>
              </div>
              <div className="space-y-6">
                {/* Testimonial 1 */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                  <div className="flex gap-1 mb-3">
                    {[1,2,3,4,5].map(s => <div key={s} className="w-4 h-4 text-orange-500 fill-current">★</div>)}
                  </div>
                  <blockquote className="text-slate-700 italic mb-4">
                    "I thought my metabolism was broken forever. My doctor told me it was just 'part of aging.' The 28 Day Reset proved them wrong. I haven't just lost weight; I've got my brain back."
                  </blockquote>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-navy-100 flex items-center justify-center text-navy-700 font-bold">S</div>
                    <div>
                      <div className="font-bold text-navy-900">Sarah M.</div>
                      <div className="text-xs text-slate-500">Age 62</div>
                    </div>
                  </div>
                </div>
                {/* Testimonial 2 */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                  <div className="flex gap-1 mb-3">
                    {[1,2,3,4,5].map(s => <div key={s} className="w-4 h-4 text-orange-500 fill-current">★</div>)}
                  </div>
                  <blockquote className="text-slate-700 italic mb-4">
                    "The data doesn't lie. Seeing my numbers change kept me motivated when willpower failed. This is the most scientific approach I've ever seen."
                  </blockquote>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-navy-100 flex items-center justify-center text-navy-700 font-bold">R</div>
                    <div>
                      <div className="font-bold text-navy-900">Robert T.</div>
                      <div className="text-xs text-slate-500">Age 58</div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
      {/* EXPLANATORY SECTION (Why $28?) */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-orange-100 mb-6">
              <HelpCircle className="w-8 h-8 text-orange-500" />
            </div>
            <h2 className="text-3xl md:text-4xl font-display font-bold text-navy-900 mb-6">
              Why do we charge $28?
            </h2>
            <p className="text-lg text-slate-600 mb-8 leading-relaxed">
              We used to offer free challenges, but we found that people who don't pay, don't pay attention. We want you to succeed. By betting $28 on yourself, you are making a psychological commitment to show up.
            </p>
            <div className="bg-slate-50 p-8 rounded-2xl border border-slate-200 text-left mb-12">
              <h3 className="text-xl font-bold text-navy-900 mb-4">Why do we call it a Reset?</h3>
              <p className="text-slate-600 leading-relaxed">
                Because your body is resilient. It wants to be healthy, but modern life has scrambled the signals. By focusing on metabolic flexibility for 28 days, we clear the noise and allow your body's natural healing systems to come back online. This isn't magic; it's physiology.
              </p>
            </div>
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm inline-block text-left max-w-2xl">
              <h3 className="font-bold text-navy-900 mb-2 flex items-center gap-2">
                <span className="bg-navy-900 text-white text-xs px-2 py-1 rounded">COACH OPTION</span>
                Are you an Optivia Coach?
              </h3>
              <p className="text-slate-600 text-sm mb-4">
                Register as a Captain ($49) to lead a team and access advanced study data.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/register')}
                className="text-orange-600 border-orange-200 hover:bg-orange-50"
              >
                Register as Captain
              </Button>
            </div>
          </div>
        </div>
      </section>
      {/* FINAL CTA */}
      <section className="py-24 bg-orange-500 text-white text-center">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-4xl md:text-5xl font-display font-bold mb-6">
            Ready to Reset Your Health?
          </h2>
          <p className="text-xl text-orange-100 mb-4 max-w-2xl mx-auto">
            The next cohort is filling up. Don't let another month of fatigue go by.
          </p>
          <p className="text-lg text-white/90 mb-10 font-medium">
            Your metabolism doesn't pause—it's either getting better or getting worse. Take control today.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button
              size="lg"
              onClick={() => navigate('/register')}
              className="bg-white text-orange-600 hover:bg-slate-100 text-xl px-12 py-8 rounded-full shadow-xl font-bold"
            >
              JOIN THE CHALLENGE - $28
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => setIsLeadGenOpen(true)}
              className="border-white text-white hover:bg-white/10 text-lg px-8 py-8 rounded-full"
            >
              GET THE METABOLIC HEALTH CHECKLIST
            </Button>
          </div>
        </div>
      </section>
    </MarketingLayout>
  );
}