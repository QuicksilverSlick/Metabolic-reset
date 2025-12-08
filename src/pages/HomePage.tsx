import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingDown, 
  Activity, 
  Zap, 
  HelpCircle, 
  CheckCircle2, 
  ArrowRight,
  Star
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MarketingLayout } from '@/components/layout/MarketingLayout';
import { useNavigate } from 'react-router-dom';
import { LeadGenModal } from '@/components/lead-gen-modal';
import { useSystemStats } from '@/hooks/use-queries';
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
      <LeadGenModal open={isLeadGenOpen} onOpenChange={setIsLeadGenOpen} />
      {/* HERO SECTION */}
      <section className="relative bg-navy-900 text-white overflow-hidden min-h-[90vh] flex items-center">
        {/* Background images */}
        <div className="absolute inset-0 bg-[url('https://storage.googleapis.com/msgsndr/ck6TDBskjrhSPWEO92xX/media/693713334b202f8789c13789.png')] bg-cover bg-center opacity-20 mix-blend-overlay"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-navy-900 via-navy-900/90 to-navy-900/40"></div>
        <div className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
          <div className="max-w-4xl">
            <motion.div {...fadeIn}>
              <div className="inline-flex items-center gap-2 py-2 px-4 rounded-full bg-orange-500/10 border border-orange-500/30 text-orange-300 text-sm font-bold mb-8 backdrop-blur-sm">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
                </span>
                New Cohort Starting Soon
              </div>
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-display font-bold leading-[1.1] mb-8 tracking-tight">
                <span className="text-white">Reverse Your</span> <span className="text-orange-500">Metabolic Age</span> <span className="text-white">in Just 28 Days.</span>
              </h1>
              <h2 className="text-xl md:text-2xl text-slate-200 font-medium mb-8 max-w-3xl leading-relaxed">
                Stop guessing with fad diets. Join the science-backed study designed to help adults over 50 reclaim their energy, lose visceral fat, and optimize their health.
              </h2>
              <p className="text-lg md:text-xl text-slate-300 mb-12 leading-relaxed max-w-2xl font-sans">
                Most people accept fatigue and weight gain as a normal part of aging. We prove them wrong. By tracking 5 key biometric markers, you can turn back the clock on your metabolism and feel at home in your body again.
              </p>
              <div className="flex flex-col sm:flex-row gap-5">
                <Button 
                  size="lg" 
                  onClick={() => navigate('/register')}
                  className="bg-orange-500 hover:bg-orange-600 text-white text-lg px-10 py-7 rounded-full shadow-[0_0_20px_rgba(255,107,53,0.3)] hover:shadow-[0_0_30px_rgba(255,107,53,0.5)] hover:-translate-y-1 transition-all duration-300 font-bold tracking-wide"
                >
                  JOIN THE CHALLENGE
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button 
                  size="lg" 
                  onClick={() => setIsLeadGenOpen(true)}
                  className="bg-white text-navy-900 hover:bg-slate-100 text-lg px-8 py-7 rounded-full transition-all duration-300 font-semibold shadow-lg hover:shadow-xl"
                >
                  GET YOUR METABOLIC SCORE
                </Button>
              </div>
              <div className="mt-12 flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-8 text-sm text-slate-400 font-medium">
                <div className="flex items-center gap-4">
                  <div className="flex -space-x-2">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="w-8 h-8 rounded-full bg-navy-800 border-2 border-navy-900 flex items-center justify-center text-xs text-white overflow-hidden">
                         <div className="w-full h-full bg-slate-600 animate-pulse"></div>
                      </div>
                    ))}
                  </div>
                  <p>
                    Join <span className="text-white font-bold">{stats?.totalParticipants ? stats.totalParticipants.toLocaleString() + '+' : '2,000+'}</span> participants
                  </p>
                </div>
                {stats?.totalBiometricSubmissions && stats.totalBiometricSubmissions > 100 && (
                  <div className="hidden sm:block w-px h-4 bg-navy-700"></div>
                )}
                {stats?.totalBiometricSubmissions && stats.totalBiometricSubmissions > 100 && (
                  <p>
                    Over <span className="text-white font-bold">{stats.totalBiometricSubmissions.toLocaleString()}</span> data points logged
                  </p>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </section>
      {/* PROBLEM SECTION (The Stakes) */}
      <section id="problem" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
            <motion.div {...fadeIn} className="order-2 lg:order-1">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold text-navy-900 mb-8 leading-tight">
                The Diets That Worked in Your 30s Have Stopped Working.
              </h2>
              <p className="text-lg text-slate-600 mb-8 leading-relaxed font-sans">
                It’s not your fault, and you aren’t crazy. As we age, an invisible thief called <strong className="text-navy-900 font-bold">Metabolic Decline</strong> steals our energy and changes how our bodies process food.
              </p>
              <p className="text-lg text-slate-600 mb-10 leading-relaxed font-sans">
                If you ignore your metabolic health, the cost is high:
              </p>
              <div className="space-y-6 mb-10">
                {[
                  { title: "Stubborn Weight Gain", desc: "Especially around the midsection (Visceral Fat)." },
                  { title: "Brain Fog & Fatigue", desc: "Feeling tired by 2:00 PM and struggling to focus." },
                  { title: "Declining Vitality", desc: "Accepting a 'slower' life instead of an active one." }
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-4 p-4 rounded-xl bg-red-50/50 border border-red-100">
                    <div className="bg-red-100 p-2 rounded-full shrink-0 mt-1">
                      <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    </div>
                    <div>
                      <h4 className="text-navy-900 font-bold text-lg">{item.title}</h4>
                      <p className="text-slate-600">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="pl-6 border-l-4 border-orange-500 py-2">
                <p className="text-xl text-navy-900 font-medium italic font-display">
                  "You shouldn't have to accept 'slowing down' just because you���re getting older. You deserve to live your prime years with vitality."
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
              <div className="absolute -inset-4 bg-orange-100 rounded-[2rem] transform rotate-3 z-0"></div>
              <div className="absolute -inset-4 bg-navy-50 rounded-[2rem] transform -rotate-2 z-0"></div>
              <img 
                src="https://app.getdreamforge.com/api/generated/8bc7d2ff-f493-497f-96a7-d0b958d59224.jpeg" 
                alt="Woman looking concerned about health" 
                className="relative z-10 rounded-2xl shadow-2xl w-full object-cover aspect-[4/5]"
              />
            </motion.div>
          </div>
        </div>
      </section>
      {/* SOLUTION SECTION (Value Prop) */}
      <section id="solution" className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <span className="text-orange-600 font-bold tracking-wider uppercase text-sm mb-3 block">The Solution</span>
            <h2 className="text-4xl md:text-5xl font-display font-bold text-navy-900 mb-6">
              Don’t Just Diet. Join the Study.
            </h2>
            <p className="text-xl text-slate-600 leading-relaxed font-sans">
              We replace confusion with clinical data. By tracking what matters, you regain control.
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
                icon: <Activity className="w-10 h-10 text-orange-500" />, 
                title: "Clarity Over Guesswork", 
                desc: "Stop wondering what works. We don't rely on trends. We use a 'Study' methodology to track your specific biometric data, so you know exactly how your body is responding in real-time."
              },
              { 
                icon: <TrendingDown className="w-10 h-10 text-orange-500" />, 
                title: "Visceral Fat Reduction", 
                desc: "Target the fat that matters. Metabolic decline stores fat around your organs. Our protocol is specifically engineered to target dangerous visceral fat, reducing your health risks."
              },
              { 
                icon: <Zap className="w-10 h-10 text-orange-500" />, 
                title: "Sustainable Energy", 
                desc: "Wake up ready for the day. By optimizing your metabolic markers, you eliminate the afternoon crash. Experience the steady, reliable energy you haven't felt in decades."
              }
            ].map((card, i) => (
              <motion.div 
                key={i}
                variants={fadeIn}
                className="bg-white p-10 rounded-[2rem] shadow-card hover:shadow-xl hover:-translate-y-2 transition-all duration-300 border border-slate-100 group"
              >
                <div className="bg-orange-50 w-20 h-20 rounded-2xl flex items-center justify-center mb-8 group-hover:bg-orange-500 transition-colors duration-300">
                  <div className="group-hover:text-white transition-colors duration-300">
                    {card.icon}
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-navy-900 mb-4 font-display">{card.title}</h3>
                <p className="text-slate-600 leading-relaxed text-lg font-sans">{card.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>
      {/* PLAN SECTION */}
      <section id="how-it-works" className="py-24 bg-navy-900 text-white relative overflow-hidden">
        {/* Decorative background elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-10 pointer-events-none">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-orange-500 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2"></div>
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-500 rounded-full blur-[120px] translate-y-1/2 -translate-x-1/2"></div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-20">
            <h2 className="text-3xl md:text-5xl font-display font-bold mb-6 text-white leading-tight">
              Your Path to a Younger Metabolism is Simple.
            </h2>
            <p className="text-xl text-slate-300 max-w-2xl mx-auto font-sans">
              Three steps to reclaim your health. No complex calculations, just clear actions.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative mb-20">
            {/* Connector Line (Desktop) */}
            <div className="hidden md:block absolute top-16 left-[16%] right-[16%] h-1 bg-navy-700 z-0"></div>
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
              <div key={i} className="relative z-10 flex flex-col items-center text-center group">
                <div className="w-32 h-32 rounded-full bg-navy-800 border-4 border-navy-700 flex items-center justify-center mb-8 shadow-[0_0_30px_rgba(15,44,89,0.5)] group-hover:border-orange-500 group-hover:shadow-[0_0_30px_rgba(255,107,53,0.3)] transition-all duration-300">
                  <span className="font-display font-bold text-4xl text-orange-500 group-hover:text-white transition-colors duration-300">{item.step}</span>
                </div>
                <h3 className="text-2xl font-bold mb-4 font-display">{item.title}</h3>
                <p className="text-slate-300 text-lg leading-relaxed font-sans">{item.desc}</p>
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
                className="border-2 border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-white text-lg px-10 py-7 rounded-full font-bold transition-all duration-300"
              >
                SEE HOW IT WORKS
              </Button>
          </div>
        </div>
      </section>
      {/* TRANSFORMATION SECTION */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-display font-bold text-navy-900 mb-8">
              Who Will You Be in 28 Days?
            </h2>
            <p className="text-xl text-slate-600 leading-relaxed font-sans">
              Right now, you might feel sluggish, frustrated, and worried that your best years are behind you. But 28 days from now, you could be a different person.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
            <div className="bg-slate-50 p-10 rounded-[2rem] border border-slate-200 flex flex-col h-full">
              <div className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Current State</div>
              <h3 className="text-2xl font-bold text-slate-700 mb-4 font-display">An Aging Bystander</h3>
              <ul className="space-y-4 mt-auto">
                <li className="flex items-center gap-3 text-slate-500 text-lg">
                  <div className="w-2 h-2 bg-slate-400 rounded-full"></div>
                  Feeling "past their prime"
                </li>
                <li className="flex items-center gap-3 text-slate-500 text-lg">
                  <div className="w-2 h-2 bg-slate-400 rounded-full"></div>
                  Accepting physical decline
                </li>
                <li className="flex items-center gap-3 text-slate-500 text-lg">
                  <div className="w-2 h-2 bg-slate-400 rounded-full"></div>
                  Confused by conflicting advice
                </li>
              </ul>
            </div>
            <div className="bg-navy-900 p-10 rounded-[2rem] border border-navy-800 relative overflow-hidden flex flex-col h-full shadow-2xl transform md:-translate-y-4">
              <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/20 rounded-bl-full"></div>
              <div className="text-sm font-bold text-orange-400 uppercase tracking-wider mb-4 relative z-10">Future State</div>
              <h3 className="text-2xl font-bold text-white mb-4 font-display relative z-10">A Metabolically Optimized Adult</h3>
              <ul className="space-y-4 mt-auto relative z-10">
                <li className="flex items-center gap-3 text-slate-200 text-lg">
                  <CheckCircle2 className="w-5 h-5 text-orange-500" />
                  Aging in reverse with vitality
                </li>
                <li className="flex items-center gap-3 text-slate-200 text-lg">
                  <CheckCircle2 className="w-5 h-5 text-orange-500" />
                  Data-driven confidence
                </li>
                <li className="flex items-center gap-3 text-slate-200 text-lg">
                  <CheckCircle2 className="w-5 h-5 text-orange-500" />
                  Active, energetic, and purposeful
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>
      {/* GUIDE SECTION (Social Proof) */}
      <section id="stories" className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Left Column: Guide Image */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="relative"
            >
              <div className="absolute -inset-4 bg-white rounded-[2rem] shadow-lg transform -rotate-2"></div>
              <img 
                src="https://app.getdreamforge.com/api/generated/fe5264c6-500c-407f-ad23-308eef4253cc.jpeg" 
                alt="Empathetic guide helping a participant" 
                className="relative rounded-2xl shadow-xl w-full object-cover aspect-[4/3]"
              />
              {/* Floating Stat Card */}
              <div className="absolute -bottom-8 -right-8 bg-white p-6 rounded-xl shadow-xl border border-slate-100 max-w-xs hidden md:block">
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex -space-x-1">
                    {[1,2,3,4,5].map(i => <Star key={i} className="w-4 h-4 text-orange-500 fill-orange-500" />)}
                  </div>
                  <span className="font-bold text-navy-900">4.9/5</span>
                </div>
                <p className="text-sm text-slate-600">"The most supportive community I've ever been part of."</p>
              </div>
            </motion.div>
            {/* Right Column: Content & Testimonials */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <div className="mb-12">
                <h2 className="text-3xl md:text-4xl font-display font-bold text-navy-900 mb-6">
                  Join Thousands Who Refused to 'Slow Down.'
                </h2>
                <p className="text-xl text-slate-600 font-sans leading-relaxed">
                  We aren't influencers; we are researchers. We treat your health with clinical precision and human empathy.
                </p>
              </div>
              <div className="space-y-8">
                {/* Testimonial 1 */}
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 relative">
                  <div className="absolute top-8 right-8 text-slate-200">
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor"><path d="M14.017 21L14.017 18C14.017 16.896 14.321 15.923 14.929 15.081C15.537 14.239 16.313 13.533 17.257 12.963C18.201 12.393 19.245 11.963 20.389 11.673L20.389 9.633C19.245 9.633 18.201 9.923 17.257 10.503C16.313 11.083 15.537 11.789 14.929 12.621C14.321 13.453 14.017 14.426 14.017 15.54L14.017 21ZM4.909 21L4.909 18C4.909 16.896 5.213 15.923 5.821 15.081C6.429 14.239 7.205 13.533 8.149 12.963C9.093 12.393 10.137 11.963 11.281 11.673L11.281 9.633C10.137 9.633 9.093 9.923 8.149 10.503C7.205 11.083 6.429 11.789 5.821 12.621C5.213 13.453 4.909 14.426 4.909 15.54L4.909 21Z" /></svg>
                  </div>
                  <blockquote className="text-slate-700 text-lg italic mb-6 relative z-10">
                    "I thought my metabolism was broken forever. My doctor told me it was just 'part of aging.' The 28 Day Reset proved them wrong. I haven't just lost weight; I've got my brain back."
                  </blockquote>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-navy-100 flex items-center justify-center text-navy-700 font-bold text-xl">S</div>
                    <div>
                      <div className="font-bold text-navy-900 text-lg">Sarah M.</div>
                      <div className="text-sm text-slate-500">Age 62 • Lost 14lbs</div>
                    </div>
                  </div>
                </div>
                {/* Testimonial 2 */}
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
                  <blockquote className="text-slate-700 text-lg italic mb-6">
                    "The data doesn't lie. Seeing my numbers change kept me motivated when willpower failed. This is the most scientific approach I've ever seen."
                  </blockquote>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-navy-100 flex items-center justify-center text-navy-700 font-bold text-xl">R</div>
                    <div>
                      <div className="font-bold text-navy-900 text-lg">Robert T.</div>
                      <div className="text-sm text-slate-500">Age 58 • Reduced Visceral Fat by 2 pts</div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
      {/* EXPLANATORY SECTION (Why $28?) */}
      <section className="py-24 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-orange-50 mb-8">
              <HelpCircle className="w-10 h-10 text-orange-500" />
            </div>
            <h2 className="text-3xl md:text-4xl font-display font-bold text-navy-900 mb-8">
              Why do we charge $28?
            </h2>
            <p className="text-xl text-slate-600 mb-10 leading-relaxed font-sans">
              We used to offer free challenges, but we found that people who don't pay, don't pay attention. We want you to succeed. By betting $28 on yourself, you are making a psychological commitment to show up.
            </p>
            <div className="bg-slate-50 p-10 rounded-[2rem] border border-slate-200 text-left mb-16">
              <h3 className="text-2xl font-bold text-navy-900 mb-4 font-display">Why do we call it a Reset?</h3>
              <p className="text-lg text-slate-600 leading-relaxed font-sans">
                Because your body is resilient. It wants to be healthy, but modern life has scrambled the signals. By focusing on metabolic flexibility for 28 days, we clear the noise and allow your body's natural healing systems to come back online. This isn't magic; it's physiology.
              </p>
            </div>
            <div className="bg-white p-8 rounded-2xl border-2 border-navy-100 shadow-lg inline-block text-left max-w-2xl w-full">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                <div>
                  <h3 className="font-bold text-navy-900 text-xl mb-2 flex items-center gap-3">
                    <span className="bg-navy-900 text-white text-xs px-2 py-1 rounded uppercase tracking-wider">Coach Option</span>
                    Are you an Optivia Coach?
                  </h3>
                  <p className="text-slate-600 text-base">
                    Register as a Captain ($49) to lead a team and access advanced study data.
                  </p>
                </div>
                <Button 
                  variant="outline" 
                  onClick={() => navigate('/register')}
                  className="shrink-0 border-orange-200 text-orange-600 hover:bg-orange-50 hover:text-orange-700 font-bold"
                >
                  Register as Captain
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* FINAL CTA */}
      <section className="py-32 bg-orange-500 text-white text-center relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent"></div>
        <div className="max-w-5xl mx-auto px-4 relative z-10">
          <h2 className="text-4xl md:text-6xl font-display font-bold mb-8 leading-tight">
            Ready to Reset Your Health?
          </h2>
          <p className="text-xl md:text-2xl text-orange-100 mb-6 max-w-3xl mx-auto font-medium">
            The next cohort is filling up. Don't let another month of fatigue go by.
          </p>
          <p className="text-lg text-white/90 mb-12 font-medium">
            Your metabolism doesn't pause—it's either getting better or getting worse. Take control today.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-6">
            <Button 
              size="lg" 
              onClick={() => navigate('/register')}
              className="bg-white text-orange-600 hover:bg-slate-100 text-xl px-12 py-8 rounded-full shadow-2xl font-bold hover:-translate-y-1 transition-all duration-300"
            >
              JOIN THE CHALLENGE - $28
            </Button>
            <Button 
              size="lg" 
              onClick={() => setIsLeadGenOpen(true)}
              className="bg-navy-900 text-white hover:bg-navy-800 text-lg px-10 py-8 rounded-full font-semibold transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              GET YOUR METABOLIC SCORE
            </Button>
          </div>
          <p className="mt-8 text-sm text-orange-200/80">
            100% Money-Back Guarantee if you don't see results.
          </p>
        </div>
      </section>
    </MarketingLayout>
  );
}