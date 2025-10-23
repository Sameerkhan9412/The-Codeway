import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import { useSelector } from 'react-redux';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import codeway from  "../utils/logo/theCodeway.png"

import { 
  Zap, Rocket, Play, Sparkles, Trophy, Flame, Swords, Cpu,
  BrainCircuit, Code2, GraduationCap, Users, Check, GitBranch,
  BookOpen, MessageSquare, Clock, Star, ChevronDown, Lightbulb,
  Target, Medal, Coins, Calendar, UserCheck, FileText, Globe,
  Shield, TrendingUp, Heart, CircleDashed, BadgeCheck, Terminal,
  Bot, Code, FileCode, Laptop, Notebook, Puzzle, GitPullRequest,
  Award, BarChart, Database, Server, ShieldCheck, Timer,
  ArrowRight, CheckCircle, Brain, Search, Filter, Gamepad2, Layers,
  Network, Binary, Hash, Maximize, TreePine, PieChart, LineChart,
  Activity, ThumbsUp, Eye, Share2, Download, BookMarked, HelpCircle,
  Headphones, Palette, Monitor, Smartphone, Settings, Bell, Gift,
  Building, MapPin, Mail, Phone, Twitter, Github, Linkedin, Facebook, Compass  ,
  Instagram, Youtube, Crown, X, Menu
} from 'lucide-react';

// Register ScrollTrigger plugin
gsap.registerPlugin(ScrollTrigger);

const Explore = () => {
  // State management
  const [activeJourney, setActiveJourney] = useState('competitive');
  const [activeFeature, setActiveFeature] = useState(null);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilters, setSelectedFilters] = useState([]);
  const [isVisible, setIsVisible] = useState(false);
  const [animatedStats, setAnimatedStats] = useState({
    users: 0,
    problems: 0,
    offers: 0,
    streaks: 0
  });
  
  // Get auth state from Redux store
  const { isAuthenticated, user } = useSelector(state => state.auth || { isAuthenticated: false, user: null });
  
  // Refs for scroll animations
  const heroRef = useRef(null);
  const categoriesRef = useRef(null);
  const featuredRef = useRef(null);
  const statsRef = useRef(null);
  const testimonialsRef = useRef(null);
  const ctaRef = useRef(null);

  // Enhanced animations and effects
  useEffect(() => {
    // Set visibility for entry animations
    setIsVisible(true);
    
    // Animated counting effect with enhanced values
    const duration = 2000;
    const targetValues = { users: 45000, problems: 250000, offers: 2500, streaks: 25000 };
    
    const animate = (startTime) => {
      const now = Date.now();
      const progress = Math.min(1, (now - startTime) / duration);
      
      setAnimatedStats({
        users: Math.floor(progress * targetValues.users),
        problems: Math.floor(progress * targetValues.problems),
        offers: Math.floor(progress * targetValues.offers),
        streaks: Math.floor(progress * targetValues.streaks)
      });

      if (progress < 1) requestAnimationFrame(() => animate(startTime));
    };

    // Start stats animation after a delay
    const timer = setTimeout(() => animate(Date.now()), 500);
    
    // Testimonial rotation
    const testimonialTimer = setInterval(() => {
      setCurrentTestimonial(prev => (prev + 1) % testimonials.length);
    }, 5000);
    
    // GSAP animations for scroll effects
    if (heroRef.current) {
      gsap.fromTo(
        heroRef.current.querySelectorAll('.animate-on-scroll'),
        { y: 50, opacity: 0 },
        { 
          y: 0, 
          opacity: 1, 
          stagger: 0.2, 
          duration: 0.8,
          scrollTrigger: {
            trigger: heroRef.current,
            start: 'top 80%',
            toggleActions: 'play none none none'
          }
        }
      );
    }
    
    // Additional GSAP animations for other sections
    if (categoriesRef.current) {
      gsap.fromTo(
        categoriesRef.current.querySelectorAll('.feature-card'),
        { y: 30, opacity: 0 },
        { 
          y: 0, 
          opacity: 1, 
          stagger: 0.1, 
          duration: 0.8,
          scrollTrigger: {
            trigger: categoriesRef.current,
            start: 'top 80%',
            toggleActions: 'play none none none'
          }
        }
      );
    }
    
    if (testimonialsRef.current) {
      gsap.fromTo(
        testimonialsRef.current.querySelectorAll('.testimonial-item'),
        { y: 30, opacity: 0 },
        { 
          y: 0, 
          opacity: 1, 
          stagger: 0.1, 
          duration: 0.8,
          scrollTrigger: {
            trigger: testimonialsRef.current,
            start: 'top 80%',
            toggleActions: 'play none none none'
          }
        }
      );
    }
    
    if (ctaRef.current) {
      gsap.fromTo(
        ctaRef.current.querySelectorAll('.cta-item'),
        { y: 30, opacity: 0 },
        { 
          y: 0, 
          opacity: 1, 
          stagger: 0.1, 
          duration: 0.8,
          scrollTrigger: {
            trigger: ctaRef.current,
            start: 'top 80%',
            toggleActions: 'play none none none'
          }
        }
      );
    }
    
    // Cleanup function
    return () => {
      clearTimeout(timer);
      clearInterval(testimonialTimer);
      
      // Clean up all ScrollTrigger instances
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, []);

  // Enhanced feature categories organized by developer journey
  const journeyFeatures = {
    competitive: [
      {
        id: 'arena',
        title: 'Code Arena',
        icon: Swords,
        description: 'Real-time coding battles',
        status: 'LIVE',
        statusColor: 'bg-red-500',
        stats: '3.2K active now',
        details: 'Compete in algorithm duels with live leaderboards and instant feedback. Our matchmaking system pairs you with coders at your skill level.',
        highlights: [
          'Head-to-head matches',
          '15+ programming languages',
          'Dynamic difficulty',
          'Weekly tournaments'
        ],
        difficulty: 'Beginner → Expert',
        color: 'bg-gradient-to-br from-red-500/20 to-red-500/10',
        borderColor: 'border-red-500/30',
        hoverColor: 'hover:border-red-500/50'
      },
      {
        id: 'leaderboards',
        title: 'Dynamic Leaderboards',
        icon: Trophy,
        description: 'Track your progress',
        status: 'POPULAR',
        statusColor: 'bg-amber-500',
        stats: '25K+ ranked',
        details: 'Real-time rankings across multiple dimensions - daily, weekly, monthly, and by technology stack.',
        highlights: [
          'College rankings',
          'Skill-based tiers',
          'Achievement badges',
          'Seasonal rewards'
        ],
        difficulty: 'All Levels',
        color: 'bg-gradient-to-br from-amber-500/20 to-amber-500/10',
        borderColor: 'border-amber-500/30',
        hoverColor: 'hover:border-amber-500/50'
      }
    ],
    learning: [
      {
        id: 'ai-mentor',
        title: 'AI Mentor Pro',
        icon: BrainCircuit,
        description: 'Personalized guidance',
        status: 'BETA',
        statusColor: 'bg-purple-500',
        stats: '8.4K testers',
        details: 'Get 1:1 mentorship from our AI that learns your coding style and provides tailored recommendations.',
        highlights: [
          'Adaptive learning paths',
          'Code review assistant',
          'Interview simulator',
          'Debugging companion'
        ],
        difficulty: 'Adaptive',
        color: 'bg-gradient-to-br from-purple-500/20 to-purple-500/10',
        borderColor: 'border-purple-500/30',
        hoverColor: 'hover:border-purple-500/50'
      },
      {
        id: 'interactive-courses',
        title: 'Interactive Courses',
        icon: BookOpen,
        description: 'Learn by doing',
        status: 'NEW',
        statusColor: 'bg-blue-500',
        stats: '12K+ learners',
        details: 'Project-based courses with instant feedback and real-world applications.',
        highlights: [
          'Algorithm mastery',
          'System design',
          'Web3 curriculum',
          'Cloud computing'
        ],
        difficulty: 'Beginner → Advanced',
        color: 'bg-gradient-to-br from-blue-500/20 to-blue-500/10',
        borderColor: 'border-blue-500/30',
        hoverColor: 'hover:border-blue-500/50'
      }
    ],
    professional: [
      {
        id: 'interview-prep',
        title: 'Interview Dojo',
        icon: UserCheck,
        description: 'FAANG-level prep',
        status: 'LIVE',
        statusColor: 'bg-emerald-500',
        stats: '2K+ hires',
        details: 'Comprehensive interview preparation with company-specific question banks and mock interviews.',
        highlights: [
          'Resume-based simulations',
          'Behavioral coaching',
          'Whiteboard practice',
          'Offer negotiation'
        ],
        difficulty: 'Job Seekers',
        color: 'bg-gradient-to-br from-emerald-500/20 to-emerald-500/10',
        borderColor: 'border-emerald-500/30',
        hoverColor: 'hover:border-emerald-500/50'
      },
      {
        id: 'project-labs',
        title: 'Project Labs',
        icon: GitPullRequest,
        description: 'Portfolio builder',
        status: 'NEW',
        statusColor: 'bg-indigo-500',
        stats: '5K+ projects',
        details: 'Build real-world applications with guided tutorials and deployment support.',
        highlights: [
          'Full-stack projects',
          'Open-source contributions',
          'DevOps integration',
          'Team collaboration'
        ],
        difficulty: 'Intermediate+',
        color: 'bg-gradient-to-br from-indigo-500/20 to-indigo-500/10',
        borderColor: 'border-indigo-500/30',
        hoverColor: 'hover:border-indigo-500/50'
      }
    ],
    community: [
      {
        id: 'hackathons',
        title: 'Hackathon Hub',
        icon: Timer,
        description: 'Build and compete',
        status: 'LIVE',
        statusColor: 'bg-orange-500',
        stats: '500+ events',
        details: 'Regular hackathons with industry partners and prize pools.',
        highlights: [
          'Team formation',
          'Judging criteria',
          'Sponsor challenges',
          'Career opportunities'
        ],
        difficulty: 'All Levels',
        color: 'bg-gradient-to-br from-orange-500/20 to-orange-500/10',
        borderColor: 'border-orange-500/30',
        hoverColor: 'hover:border-orange-500/50'
      },
      {
        id: 'code-collab',
        title: 'Live Collaboration',
        icon: GitBranch,
        description: 'Pair programming',
        status: 'BETA',
        statusColor: 'bg-cyan-500',
        stats: '1K+ sessions',
        details: 'Real-time collaborative coding environment with video and chat.',
        highlights: [
          'Shared workspaces',
          'Code review tools',
          'Interview practice',
          'Mentor matching'
        ],
        difficulty: 'All Levels',
        color: 'bg-gradient-to-br from-cyan-500/20 to-cyan-500/10',
        borderColor: 'border-cyan-500/30',
        hoverColor: 'hover:border-cyan-500/50'
      }
    ]
  };

  // Enhanced testimonials data with styling properties
const testimonials = [
  {
    name: "Aarav Patel",
    role: "SWE at Microsoft",
    content: "CodeWay's Arena helped me go from beginner to Google interview-ready in 4 months. The streak system kept me accountable every single day.",
    rating: 5,
    avatar: "AP",
    result: "3 FAANG offers",
    gradientFrom: "from-blue-500",
    gradientTo: "to-indigo-600",
    bgColor: "bg-gradient-to-br from-blue-500/10 to-indigo-600/5",
    borderColor: "border-blue-500/20",
    company: "Microsoft",
    companyLogo: Code2,
    companyLogoProps: { className: "w-5 h-5 text-blue-400" }
  },
  {
    name: "Sophia Zhang",
    role: "CS Student at MIT",
    content: "The AI Mentor is revolutionary - it explains concepts better than most professors. I've doubled my problem-solving speed since joining.",
    rating: 5,
    avatar: "SZ",
    result: "ICPC Regional Finalist",
    gradientFrom: "from-purple-500",
    gradientTo: "to-pink-600",
    bgColor: "bg-gradient-to-br from-purple-500/10 to-pink-600/5",
    borderColor: "border-purple-500/20",
    company: "MIT",
    companyLogo: GraduationCap,
    companyLogoProps: { className: "w-5 h-5 text-purple-400" }
  },
  {
    name: "Kwame Ofori",
    role: "Bootcamp Graduate",
    content: "As a career changer, CodeWay gave me the structured path I needed. Landed my first dev job after completing the Full Stack track.",
    rating: 5,
    avatar: "KO",
    result: "Hired in 3 months",
    gradientFrom: "from-emerald-500",
    gradientTo: "to-teal-600",
    bgColor: "bg-gradient-to-br from-emerald-500/10 to-teal-600/5",
    borderColor: "border-emerald-500/20",
    company: "TechStartup",
    companyLogo: Rocket,
    companyLogoProps: { className: "w-5 h-5 text-emerald-400" }
  }
];

  return (
    <div className="min-h-screen bg-gray-950 text-white overflow-x-hidden">
      <Navbar />
      
      {/* Hero Section with animated elements */}
      <section ref={heroRef} className="relative pt-32 pb-24 overflow-hidden">
        {/* Animated background elements */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.5 }}
          transition={{ duration: 2 }}
          className="absolute top-0 right-0 w-1/3 h-1/3 bg-gradient-to-b from-orange-500/20 to-transparent rounded-full blur-3xl"
        />
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.4 }}
          transition={{ duration: 2, delay: 0.5 }}
          className="absolute bottom-0 left-0 w-1/3 h-1/3 bg-gradient-to-t from-amber-500/20 to-transparent rounded-full blur-3xl"
        />
        
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <div className="lg:w-1/2 text-center lg:text-left">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="inline-flex items-center bg-gradient-to-r from-orange-500/20 to-orange-500/10 border border-orange-500/30 rounded-full px-4 py-1.5 mb-6 backdrop-blur-sm animate-on-scroll"
              >
                <Sparkles className="w-4 h-4 mr-2 text-orange-400" />
                <span className="text-sm font-medium">Explore the complete coding ecosystem</span>
              </motion.div>
              
              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight animate-on-scroll"
              >
                <span className="bg-gradient-to-r from-orange-400 to-amber-500 bg-clip-text text-transparent">Discover</span> Your Perfect Coding Path
              </motion.h1>
              
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="text-xl text-gray-300 mb-8 max-w-xl mx-auto lg:mx-0 animate-on-scroll"
              >
                Everything you need to learn, practice, and excel in your coding journey - all in one place. Find the resources that match your goals.
              </motion.p>
              
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
                className="flex flex-wrap gap-4 justify-center lg:justify-start animate-on-scroll"
              >
                <button className="px-8 py-4 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white rounded-xl font-bold transition-all duration-300 flex items-center gap-2 shadow-lg shadow-orange-500/20">
                  <Rocket className="w-5 h-5" />
                  Get Started Free
                </button>
                <button className="px-8 py-4 bg-gray-800/80 hover:bg-gray-700/80 border border-gray-700 text-white rounded-xl font-bold transition-all duration-300 flex items-center gap-2 backdrop-blur-sm">
                  <Search className="w-5 h-5" />
                  Browse Resources
                </button>
              </motion.div>
            </div>
            
            <div className="lg:w-1/2">
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="relative"
              >
                {/* Search and filter interface mockup */}
                <div className="bg-gray-900/70 backdrop-blur-md border border-gray-800 rounded-2xl p-6 shadow-xl">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="flex-1 relative">
                      <input 
                        type="text" 
                        placeholder="Search resources, topics, or skills..." 
                        className="w-full bg-gray-800/70 border border-gray-700 rounded-xl py-3 pl-10 pr-4 text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-transparent"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                      <Search className="absolute left-3 top-3.5 w-5 h-5 text-gray-500" />
                    </div>
                    <button className="bg-gray-800/70 border border-gray-700 rounded-xl p-3 text-gray-400 hover:text-white transition-colors">
                      <Filter className="w-5 h-5" />
                    </button>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 mb-6">
                    {['Algorithms', 'Data Structures', 'Web Dev', 'Machine Learning', 'System Design'].map((filter, i) => (
                      <button 
                        key={i}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${selectedFilters.includes(filter) ? 'bg-orange-500/20 text-orange-300 border border-orange-500/30' : 'bg-gray-800/70 text-gray-400 border border-gray-700 hover:text-white'}`}
                        onClick={() => setSelectedFilters(prev => 
                          prev.includes(filter) ? prev.filter(f => f !== filter) : [...prev, filter]
                        )}
                      >
                        {filter}
                      </button>
                    ))}
                  </div>
                  
                  <div className="space-y-4">
                    {/* Resource cards */}
                    {[1, 2, 3].map((item) => (
                      <div key={item} className="bg-gray-800/50 border border-gray-700 rounded-xl p-4 hover:border-orange-500/30 transition-colors cursor-pointer">
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-orange-500/20 to-orange-500/10 flex items-center justify-center border border-orange-500/30">
                            {item === 1 && <BookOpen className="w-6 h-6 text-orange-400" />}
                            {item === 2 && <Code2 className="w-6 h-6 text-orange-400" />}
                            {item === 3 && <BrainCircuit className="w-6 h-6 text-orange-400" />}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                              <h3 className="font-semibold">
                                {item === 1 && 'Interactive DSA Course'}
                                {item === 2 && 'Advanced Algorithms'}
                                {item === 3 && 'System Design Fundamentals'}
                              </h3>
                              <span className="text-xs bg-gray-700/70 text-gray-300 px-2 py-0.5 rounded-full">
                                {item === 1 && 'Beginner'}
                                {item === 2 && 'Advanced'}
                                {item === 3 && 'Intermediate'}
                              </span>
                            </div>
                            <p className="text-sm text-gray-400 mb-2">
                              {item === 1 && 'Learn data structures with visualizations and practice problems'}
                              {item === 2 && 'Deep dive into complex algorithms with real-world applications'}
                              {item === 3 && 'Master the art of designing scalable systems and architectures'}
                            </p>
                            <div className="flex items-center text-xs text-gray-500">
                              <span className="flex items-center gap-1 mr-3">
                                <Users className="w-3 h-3" />
                                {item === 1 && '15K+ learners'}
                                {item === 2 && '8K+ learners'}
                                {item === 3 && '12K+ learners'}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {item === 1 && '20 hours'}
                                {item === 2 && '15 hours'}
                                {item === 3 && '25 hours'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    <button className="w-full py-3 text-center text-orange-400 hover:text-orange-300 transition-colors font-medium">
                      View all resources <ArrowRight className="w-4 h-4 inline ml-1" />
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Stats Section with animations */}
      <section ref={statsRef} className="py-20 relative border-t border-gray-800/50">
        <div className="absolute inset-0 bg-gradient-to-b from-gray-900/50 to-gray-950/50 backdrop-blur-sm"></div>
        
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <div className="text-4xl md:text-5xl font-bold mb-2 bg-gradient-to-r from-orange-400 to-amber-500 bg-clip-text text-transparent">
                {animatedStats.users.toLocaleString()}+
              </div>
              <div className="text-gray-300 font-medium">Active Learners</div>
              <div className="text-sm text-gray-500">Worldwide community</div>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <div className="text-4xl md:text-5xl font-bold mb-2 bg-gradient-to-r from-orange-400 to-amber-500 bg-clip-text text-transparent">
                {animatedStats.problems.toLocaleString()}+
              </div>
              <div className="text-gray-300 font-medium">Problems Solved</div>
              <div className="text-sm text-gray-500">By our community</div>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <div className="text-4xl md:text-5xl font-bold mb-2 bg-gradient-to-r from-orange-400 to-amber-500 bg-clip-text text-transparent">
                {animatedStats.offers.toLocaleString()}+
              </div>
              <div className="text-gray-300 font-medium">Job Offers</div>
              <div className="text-sm text-gray-500">For our top performers</div>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <div className="text-4xl md:text-5xl font-bold mb-2 bg-gradient-to-r from-orange-400 to-amber-500 bg-clip-text text-transparent">
                {animatedStats.streaks.toLocaleString()}+
              </div>
              <div className="text-gray-300 font-medium">Daily Streaks</div>
              <div className="text-sm text-gray-500">Consistency is key</div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Enhanced Features Section - Organized by Developer Journey */}
      <section ref={categoriesRef} className="py-24 relative">
        {/* Background decorations */}
        <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-gradient-to-b from-orange-500/10 to-transparent rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-1/3 h-1/3 bg-gradient-to-t from-amber-500/10 to-transparent rounded-full blur-3xl"></div>
        
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center bg-gradient-to-r from-orange-500/20 to-orange-500/10 border border-orange-500/30 rounded-full px-4 py-1.5 mb-6 backdrop-blur-sm">
              <Compass className="w-4 h-4 mr-2 text-orange-400" />
              <span className="text-sm font-medium">Find your perfect path</span>
            </div>
            
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              <span className="bg-gradient-to-r from-orange-400 to-amber-500 bg-clip-text text-transparent">Explore</span> Your Coding Journey
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              We've organized everything based on where you are in your developer journey
            </p>
          </motion.div>

          {/* Journey Tabs - Enhanced with animations */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            className="flex flex-wrap justify-center gap-3 mb-16"
          >
            {[
              { id: 'competitive', label: 'Competitive Coding', icon: Trophy, color: 'amber' },
              { id: 'learning', label: 'Skill Building', icon: BookOpen, color: 'blue' },
              { id: 'professional', label: 'Career Prep', icon: UserCheck, color: 'emerald' },
              { id: 'community', label: 'Community', icon: Users, color: 'purple' }
            ].map((journey) => (
              <motion.button
                key={journey.id}
                onClick={() => setActiveJourney(journey.id)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
                className={`flex items-center px-6 py-3 rounded-xl transition-all duration-300 border ${
                  activeJourney === journey.id 
                    ? `bg-gradient-to-br from-${journey.color}-500/20 to-${journey.color}-500/10 border-${journey.color}-500/30 text-${journey.color}-300 shadow-lg shadow-${journey.color}-500/10` 
                    : 'border-gray-800 text-gray-400 hover:text-white hover:border-gray-700'
                }`}
              >
                <journey.icon className="w-5 h-5 mr-2" />
                {journey.label}
              </motion.button>
            ))}
          </motion.div>

          {/* Feature Grid - Enhanced with animations and better styling */}
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {journeyFeatures[activeJourney].map((feature, index) => (
              <motion.div 
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -5 }}
                className={`group relative overflow-hidden ${feature.color} border ${feature.borderColor} rounded-2xl p-6 transition-all duration-300 ${feature.hoverColor} cursor-pointer backdrop-blur-sm`}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-gray-900/50 to-gray-950/50 z-0"></div>
                
                <div className="relative z-10">
                  <div className={`w-14 h-14 mb-6 flex items-center justify-center rounded-xl border ${feature.borderColor}`}>
                    <feature.icon className="w-8 h-8 text-orange-400" />
                  </div>
                  
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-xl font-bold group-hover:text-white transition-colors">{feature.title}</h3>
                    <span className="px-3 py-1 text-xs font-medium rounded-full bg-gray-800/70 text-gray-300 border border-gray-700">
                      {feature.status}
                    </span>
                  </div>
                  
                  <p className="text-gray-400 mb-5 group-hover:text-gray-300 transition-colors">{feature.description}</p>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500 group-hover:text-gray-400 transition-colors">{feature.stats}</span>
                    {feature.status === 'LIVE' || feature.status === 'POPULAR' ? (
                      <Link to={`/${feature.id}`} className="flex items-center gap-1 text-orange-400 group-hover:text-orange-300 transition-colors text-sm font-medium">
                        Explore <ArrowRight className="w-4 h-4" />
                      </Link>
                    ) : (
                      <span className="text-sm text-gray-500">Coming Soon</span>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Additional Features Carousel - Enhanced with better styling */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            viewport={{ once: true }}
            className="mt-24"
          >
            <div className="flex items-center justify-between mb-10">
              <h3 className="text-2xl font-bold">More Powerful Features</h3>
              <button className="flex items-center gap-2 text-orange-400 hover:text-orange-300 transition-colors font-medium">
                View all <ArrowRight className="w-4 h-4" />
              </button>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                { icon: Flame, name: 'Daily Streaks', stat: '25K+ active', color: 'from-red-500/20 to-red-500/10', border: 'border-red-500/30', hover: 'hover:border-red-500/50' },
                { icon: Bot, name: 'AI Assistant', stat: 'Unlimited help', color: 'from-purple-500/20 to-purple-500/10', border: 'border-purple-500/30', hover: 'hover:border-purple-500/50' },
                { icon: FileCode, name: 'Code Sheets', stat: '5K+ created', color: 'from-blue-500/20 to-blue-500/10', border: 'border-blue-500/30', hover: 'hover:border-blue-500/50' },
                { icon: Puzzle, name: 'Challenges', stat: '1K+ daily', color: 'from-emerald-500/20 to-emerald-500/10', border: 'border-emerald-500/30', hover: 'hover:border-emerald-500/50' }
              ].map((item, i) => (
                <motion.div 
                  key={i} 
                  whileHover={{ y: -5 }}
                  className={`p-5 bg-gradient-to-br ${item.color} border ${item.border} rounded-xl ${item.hover} transition-all duration-300 backdrop-blur-sm`}
                >
                  <div className="w-12 h-12 mb-4 flex items-center justify-center rounded-lg bg-gray-900/70 border border-gray-800">
                    <item.icon className="w-6 h-6 text-orange-400" />
                  </div>
                  <h4 className="font-semibold text-lg mb-1">{item.name}</h4>
                  <p className="text-sm text-gray-400">{item.stat}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Enhanced Testimonials Section */}
      <section ref={testimonialsRef} className="py-24 bg-gradient-to-b from-gray-900/80 to-gray-950/80 border-y border-gray-800">
        <div className="max-w-6xl mx-auto px-6">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-4xl font-bold text-center mb-20"
          >
            <span className="bg-gradient-to-r from-orange-400 to-amber-500 bg-clip-text text-transparent">Transformations</span> Not Just Testimonials
          </motion.h2>
          
          <div className="relative">
            {testimonials.map((testimonial, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0 }}
                animate={{ 
                  opacity: currentTestimonial === i ? 1 : 0,
                  x: currentTestimonial === i ? 0 : (currentTestimonial > i ? -20 : 20)
                }}
                transition={{ duration: 0.5 }}
                className={`transition-all duration-500 ${
                  currentTestimonial === i ? 'relative' : 'absolute top-0 left-0 w-full'
                }`}
              >
                <div className="bg-gray-900/70 border border-gray-800 rounded-3xl p-8 md:p-10 backdrop-blur-sm">
                  <div className="flex flex-col md:flex-row gap-8 items-center">
                    <div className="flex-shrink-0">
                      <div className="w-32 h-32 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center text-3xl font-bold text-white">
                        {testimonial.avatar}
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex mb-4">
                        {[...Array(testimonial.rating)].map((_, i) => (
                          <Star key={i} className="w-6 h-6 text-amber-400 fill-current" />
                        ))}
                      </div>
                      <blockquote className="text-xl md:text-2xl italic text-gray-300 mb-6">
                        "{testimonial.content}"
                      </blockquote>
                      <div>
                        <div className="font-bold text-lg">{testimonial.name}</div>
                        <div className="text-orange-400">{testimonial.role}</div>
                        <div className="mt-2 text-sm bg-gray-800 text-emerald-400 px-3 py-1 rounded-full inline-block">
                          {testimonial.result}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
            
            <div className="flex justify-center mt-8 gap-2">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentTestimonial(i)}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    currentTestimonial === i ? 'bg-orange-500 w-6' : 'bg-gray-700 hover:bg-gray-600'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Final CTA */}
      <section ref={ctaRef} className="py-32 relative overflow-hidden bg-gradient-to-br from-gray-950 to-gray-900">
        {/* Background decorations */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.5 }}
          transition={{ duration: 2 }}
          className="absolute top-0 right-0 w-1/3 h-1/3 bg-gradient-to-br from-orange-500/10 to-transparent rounded-full blur-3xl"
        />
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.4 }}
          transition={{ duration: 2, delay: 0.5 }}
          className="absolute bottom-0 left-0 w-1/3 h-1/3 bg-gradient-to-br from-amber-500/10 to-transparent rounded-full blur-3xl"
        />
        
        <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <div className="inline-flex items-center bg-gradient-to-r from-orange-500/20 to-orange-500/10 border border-orange-500/30 rounded-full px-5 py-2 mb-6 backdrop-blur-sm">
              <Lightbulb className="w-5 h-5 text-orange-300 mr-2" />
              <span className="text-sm font-medium text-orange-200">READY TO LEVEL UP?</span>
            </div>
            
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Start <span className="bg-gradient-to-r from-orange-400 to-amber-500 bg-clip-text text-transparent">Your Journey</span> Today
            </h2>
            
            <p className="text-xl text-gray-300 mb-10 max-w-3xl mx-auto">
              Join thousands of developers who've transformed their skills and careers with CodeWay
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              className="relative overflow-hidden group bg-gradient-to-br from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-bold py-4 px-10 rounded-xl transition-all duration-300 flex items-center justify-center gap-3 transform hover:scale-105 shadow-lg shadow-orange-500/20 hover:shadow-orange-500/30"
            >
              <span className="relative z-10 flex items-center gap-2">
                <Zap className="w-5 h-5" />
                Get Started Free
              </span>
              <span className="absolute inset-0 bg-gradient-to-r from-orange-600 to-red-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
            </motion.button>
            
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              className="relative overflow-hidden group bg-gray-900 hover:bg-gray-800 border-2 border-gray-700 hover:border-orange-500 text-white font-medium py-4 px-10 rounded-xl transition-all duration-300 flex items-center justify-center gap-3"
            >
              <span className="relative z-10 flex items-center gap-2">
                <Users className="w-5 h-5" />
                Join Community
              </span>
              <span className="absolute inset-0 bg-gradient-to-r from-gray-800 to-gray-900 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
            </motion.button>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            viewport={{ once: true }}
            className="mt-8 flex flex-wrap justify-center gap-8 text-gray-400"
          >
            <div className="flex items-center gap-2">
              <Check className="w-5 h-5 text-green-400" />
              <span>No credit card required</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-5 h-5 text-green-400" />
              <span>Free tier available</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-5 h-5 text-green-400" />
              <span>Cancel anytime</span>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Explore;
