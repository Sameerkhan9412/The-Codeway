import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import Navbar from '../components/common/Navbar'
import codeway from  "../utils/logo/theCodeway.png"
import {
  Code,
  Trophy,
  Users,
  Brain,
  Zap,
  ArrowRight,
  CheckCircle,
  Star,
  Sparkles,
  Rocket,
  BookOpen,
  Terminal,
  GitBranch,
  Timer,
  UserCheck,
  Flame,
  Laptop,
  Swords,
  BrainCircuit,
  Calendar,
  Clock,
  Crown,
  Play,
  TrendingUp,
  Award,
  Globe,
  Shield,
  Lightbulb,
  Target,
  Coffee,
  Code2,
  Database,
  Server,
  Monitor,
  Smartphone,
  Palette,
  Headphones,
  MessageCircle,
  Heart,
  Eye,
  ThumbsUp,
  Share2,
  Download,
  BookMarked,
  Cpu,
  Activity,
  BarChart3,
  PieChart,
  LineChart,
  TrendingDown,
  Volume2,
  VolumeX,
  Settings,
  Filter,
  Search,
  Bell,
  Gift,
  Gamepad2,
  Medal,
  Layers,
  Zap as Lightning,
  Briefcase,
  GraduationCap,
  Building,
  MapPin,
  Mail,
  Phone,
  Twitter,
  Github,
  Linkedin,
  Facebook,
  Instagram,
  Youtube,
  MessageSquare,
  HelpCircle,
  Network,
  TreePine,
  Maximize,
  Binary,
  Hash,
  Menu,
  X,
  ChevronDown
} from 'lucide-react'
import AiAssistant from '../components/common/AiAssistant'
import { FaCode } from 'react-icons/fa'

// Enhanced mock data
const mockUser = {
  isAuthenticated: true,
  name: "Alex Chen",
  avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face",
  level: "Expert",
  streak: 15,
  points: 2340
}



const Homepage = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [activeFeature, setActiveFeature] = useState('interview-ai')
  const [isVisible, setIsVisible] = useState(false)
  const [currentTestimonial, setCurrentTestimonial] = useState(0)
  const [animatedStats, setAnimatedStats] = useState({
    users: 0,
    problems: 0,
    contests: 0,
    companies: 0
  })
  
  const heroRef = useRef(null)
  const featuresRef = useRef(null)
  const statsRef = useRef(null)
  const ctaRef = useRef(null)
  
  // Entry animation
  useEffect(() => {
    setIsVisible(true)
    
    // Animate stats when component loads
    const animateStats = () => {
      const duration = 2000
      const targetValues = { users: 75000, problems: 350000, contests: 1200, companies: 500 }
      
      const startTime = Date.now()
      
      const animate = () => {
        const now = Date.now()
        const progress = Math.min(1, (now - startTime) / duration)
        
        setAnimatedStats({
          users: Math.floor(progress * targetValues.users),
          problems: Math.floor(progress * targetValues.problems),
          contests: Math.floor(progress * targetValues.contests),
          companies: Math.floor(progress * targetValues.companies)
        })
        
        if (progress < 1) requestAnimationFrame(animate)
      }
      
      animate()
    }
    
    // Start stats animation after a delay
    const timer = setTimeout(animateStats, 1000)
    
    // Testimonial rotation
    const testimonialTimer = setInterval(() => {
      setCurrentTestimonial(prev => (prev + 1) % testimonials.length)
    }, 5000)
    
    return () => {
      clearTimeout(timer)
      clearInterval(testimonialTimer)
    }
  }, [])
  
  // Enhanced features data with your projects
  const features = {
    'interview-ai': {
      title: 'Interview AI',
      icon: BrainCircuit,
      description: 'AI-powered mock interviews',
      details: 'Practice coding interviews with our advanced AI that simulates real FAANG interviews. Get instant feedback, personalized suggestions, and track your progress with detailed analytics.',
      color: 'from-purple-500 to-indigo-500',
      stats: '95% success rate',
      badge: 'AI POWERED',
      features: ['FAANG-style questions', 'Real-time feedback', 'Performance analytics', 'Voice interaction']
    },
    'doubt-assistant': {
      title: 'Doubt Assistant',
      icon: HelpCircle,
      description: '24/7 coding help',
      details: 'Get instant help with your coding doubts from our AI assistant. Whether it\'s debugging, algorithm optimization, or concept clarification - we\'ve got you covered.',
      color: 'from-green-500 to-emerald-500',
      stats: '99.9% uptime',
      badge: 'INSTANT HELP',
      features: ['Code debugging', 'Concept explanations', 'Best practices', 'Multiple languages']
    },
    'discuss': {
      title: 'Discussion Forum',
      icon: MessageSquare,
      description: 'Community-driven learning',
      details: 'Connect with fellow coders, share solutions, discuss algorithms, and learn from the community. Upvote best answers and build your reputation.',
      color: 'from-blue-500 to-cyan-500',
      stats: '50K+ discussions',
      badge: 'COMMUNITY',
      features: ['Q&A format', 'Expert answers', 'Code sharing', 'Reputation system']
    },
    'dsa-visualizer': {
      title: 'DSA Visualizer',
      icon: Network,
      description: 'Interactive algorithm learning',
      details: 'Visualize data structures and algorithms with interactive animations. Understand complex concepts like never before with step-by-step visual explanations.',
      color: 'from-orange-500 to-red-500',
      stats: '100+ visualizations',
      badge: 'INTERACTIVE',
      features: ['Tree structures', 'Graph algorithms', 'Sorting animations', 'Custom inputs']
    },
    'contests': {
      title: 'Global Contests',
      icon: Trophy,
      description: 'Compete worldwide',
      details: 'Join weekly coding competitions with global rankings, cash prizes up to $15,000, detailed performance analytics, and career opportunities with top companies.',
      color: 'from-amber-500 to-yellow-500',
      stats: '$100K+ in prizes',
      badge: 'WEEKLY',
      features: ['Cash prizes', 'Global rankings', 'Career opportunities', 'Skill assessments']
    }
  }
  
  // Testimonials data
  const testimonials = [
    {
      name: "Priya Sharma",
      role: "SDE-2 at Google",
      content: "The Interview AI helped me crack Google's interview in just 2 months. The mock sessions were incredibly realistic!",
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b5bc?w=60&h=60&fit=crop&crop=face",
      rating: 5
    },
    {
      name: "Rahul Kumar",
      role: "Senior SDE at Microsoft",
      content: "DSA Visualizer made complex algorithms so easy to understand. I finally get how dynamic programming works!",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=60&h=60&fit=crop&crop=face",
      rating: 5
    },
    {
      name: "Ananya Patel",
      role: "Tech Lead at Amazon",
      content: "The discussion forum is amazing! Got help with my doubts instantly and learned so much from the community.",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=60&h=60&fit=crop&crop=face",
      rating: 5
    }
  ]
  
  // Upcoming contest data
  const upcomingContest = {
    title: 'CodeSprint Championship #52',
    startTime: new Date(Date.now() + 86400000 * 3), // 3 days from now
    duration: '3 hours',
    participants: 2847,
    difficulty: 'Mixed (Easy to Hard)',
    prize: '$5,000',
    problems: 8,
    sponsors: ['Google', 'Microsoft', 'Amazon']
  }
  
  // Recent achievements data
  const recentAchievements = [
    { user: "Vikash R.", achievement: "Solved 500 problems", time: "1 hour ago", icon: Target },
    { user: "Sneha M.", achievement: "Won Weekly Contest", time: "3 hours ago", icon: Trophy },
    { user: "Arjun S.", achievement: "60-day streak", time: "5 hours ago", icon: Flame },
    { user: "Kavya L.", achievement: "Algorithm Ninja", time: "1 day ago", icon: Crown },
    { user: "Rohit K.", achievement: "Interview AI Master", time: "2 days ago", icon: BrainCircuit }
  ]
  
  // Popular DSA topics for visualizer
  const dsaTopics = [
    { name: 'Binary Trees', icon: Binary, difficulty: 'Medium', problems: 45 },
    { name: 'Graph Algorithms', icon: Network, difficulty: 'Hard', problems: 38 },
    { name: 'Dynamic Programming', icon: BrainCircuit, difficulty: 'Hard', problems: 52 },
    { name: 'Sorting Algorithms', icon: BarChart3, difficulty: 'Easy', problems: 25 },
    { name: 'Hash Tables', icon: Hash, difficulty: 'Medium', problems: 31 },
    { name: 'Linked Lists', icon: GitBranch, difficulty: 'Easy', problems: 22 }
  ]
  
  // Format date for contest
  const formatContestDate = (date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatTimeUntil = (date) => {
    const now = new Date()
    const diff = date - now
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    return `${days}d ${hours}h`
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white overflow-hidden">
      {/* Navbar */}
      <Navbar />

      {/* Enhanced Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-orange-500/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-3/4 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl animate-pulse" style={{animationDelay: '4s'}}></div>
        <div className="absolute top-1/3 right-1/3 w-64 h-64 bg-green-500/5 rounded-full blur-2xl animate-pulse" style={{animationDelay: '6s'}}></div>
      </div>

      {/* Hero Section */}
      <section 
        ref={heroRef}
        className={`relative min-h-screen flex items-center justify-center px-4 py-20 pt-32 transition-all duration-1000 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
      >
        <div className="max-w-7xl mx-auto text-center relative z-10">
          {/* Enhanced Hero Badge */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-6"
          >
            <div className="inline-flex items-center space-x-2 bg-gray-800/60 backdrop-blur-sm border border-gray-700/50 rounded-full px-6 py-3 mb-8">
              <Sparkles className="w-5 h-5 text-orange-400" />
              <span className="text-sm text-gray-300">🚀 Trusted by 1000+ developers worldwide</span>
              <div className="flex -space-x-2">
                {[1,2,3,4,5].map(i => (
                  <div key={i} className="w-7 h-7 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 border-2 border-gray-800 flex items-center justify-center text-xs font-bold text-white">
                    {i === 3 ? '🔥' : '⭐'}
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
          
          <motion.h1 
            className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-amber-300 to-yellow-400">
              Code. Learn. Compete.
            </span>
            <br />
            <span className="text-white">
              Conquer Interviews.
            </span>
          </motion.h1>
          
          <motion.p 
            className="text-xl md:text-2xl text-gray-300 max-w-4xl mx-auto mb-10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            Master coding with AI-powered interviews, interactive DSA visualizations, 
            instant doubt resolution, and compete for prizes up to <span className="text-orange-400 font-bold">$15,000</span>.
          </motion.p>
          
          <motion.div 
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <Link to="/problems">
            <button 
              onClick={() => setIsAuthenticated(true)}
              className="px-8 py-4 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold rounded-xl shadow-lg hover:shadow-orange-500/30 transition-all duration-300 flex items-center gap-2 group"
            >
              {isAuthenticated ? 'Continue Learning' : 'Start Free Journey'}
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
            </button>
            </Link>
          
            
            <button className="px-8 py-4 bg-gray-800/80 hover:bg-gray-700/80 backdrop-blur-sm border border-gray-700 text-white font-bold rounded-xl shadow-lg transition-all duration-300 flex items-center gap-2">
              <Play className="w-5 h-5" />
              Watch Platform Tour
            </button>
          </motion.div>
          
          {/* Enhanced Live Activity Feed */}
          <motion.div 
            className="max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
          >
            <div className="bg-gray-800/60 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <Activity className="w-5 h-5 text-green-400" />
                  Live Community Activity
                </h3>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-sm text-gray-400">Live</span>
                </div>
              </div>
              
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {recentAchievements.map((achievement, index) => (
                  <motion.div 
                    key={index}
                    className="flex items-center justify-between p-3 bg-gray-900/50 rounded-lg hover:bg-gray-900/70 transition-colors duration-300"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 1 + index * 0.2 }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-amber-500 rounded-full flex items-center justify-center">
                        <achievement.icon className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <span className="text-white font-medium">{achievement.user}</span>
                        <span className="text-gray-300 ml-2">{achievement.achievement}</span>
                      </div>
                    </div>
                    <span className="text-gray-400 text-sm">{achievement.time}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>
      
      {/* Enhanced Features Section */}
      <section 
        ref={featuresRef}
        className="py-20 px-4 relative"
      >
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl md:text-5xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-400">
                Complete Coding Ecosystem
              </h2>
              <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                Everything you need to master coding - from AI-powered interviews to interactive visualizations.
              </p>
            </motion.div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
            {Object.entries(features).map(([key, feature], index) => (
              <motion.div 
                key={key}
                className={`relative group cursor-pointer rounded-2xl overflow-hidden transition-all duration-500 ${activeFeature === key ? 'ring-2 ring-offset-4 ring-offset-gray-900 ring-orange-500 scale-105' : 'hover:scale-102'}`}
                onClick={() => setActiveFeature(key)}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -5 }}
              >
                {/* Background gradient */}
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-10 group-hover:opacity-20 transition-opacity duration-300`}></div>
                
                {/* Glass card */}
                <div className="relative z-10 backdrop-blur-sm bg-gray-800/80 border border-gray-700/50 p-6 h-full">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br ${feature.color} shadow-lg`}>
                      <feature.icon className="w-6 h-6 text-white" />
                    </div>
                    
                    <div className="flex flex-col items-end gap-2">
                      <div className={`bg-gradient-to-r ${feature.color} text-white text-xs font-bold px-2 py-1 rounded-full`}>
                        {feature.badge}
                      </div>
                    </div>
                  </div>
                  
                  <h3 className="text-xl font-bold mb-2 text-white group-hover:text-orange-400 transition-colors duration-300">
                    {feature.title}
                  </h3>
                  
                  <p className="text-gray-400 mb-3">
                    {feature.description}
                  </p>
                  
                  <div className="text-sm text-orange-400 font-medium mb-4">
                    {feature.stats}
                  </div>
                  
                  <AnimatePresence>
                    {activeFeature === key && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                      >
                        <p className="text-gray-300 mb-4 text-sm">
                          {feature.details}
                        </p>
                        
                        <div className="space-y-2 mb-4">
                          {feature.features.map((item, idx) => (
                            <div key={idx} className="flex items-center gap-2 text-xs text-gray-400">
                              <CheckCircle className="w-3 h-3 text-green-400" />
                              <span>{item}</span>
                            </div>
                          ))}
                        </div>
                        
                        <Link to={`/${key.toLowerCase()}`} className="w-full py-2 bg-gradient-to-r from-orange-500/20 to-amber-500/20 hover:from-orange-500/30 hover:to-amber-500/30 text-orange-400 hover:text-orange-300 rounded-lg transition-all duration-300 text-sm font-medium text-center">
                          Explore {feature.title}
                        </Link>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            ))}
          </div>

          {/* DSA Visualizer Showcase */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="mb-16"
          >
            <h3 className="text-2xl font-bold mb-8 text-center text-white">Popular DSA Topics to Visualize</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {dsaTopics.map((topic, index) => (
                <motion.div
                  key={index}
                  className="bg-gray-800/60 backdrop-blur-sm border border-gray-700/50 rounded-xl p-4 hover:scale-105 transition-all duration-300 cursor-pointer group"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <div className="text-center">
                    <div className="w-10 h-10 mx-auto mb-3 bg-gradient-to-r from-orange-500 to-amber-500 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <topic.icon className="w-5 h-5 text-white" />
                    </div>
                    <h4 className="font-semibold text-white text-sm mb-1">{topic.name}</h4>
                    <div className="text-xs text-gray-400 mb-1">{topic.problems} problems</div>
                    <div className={`text-xs px-2 py-1 rounded-full ${
                      topic.difficulty === 'Easy' ? 'bg-green-500/20 text-green-400' :
                      topic.difficulty === 'Medium' ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-red-500/20 text-red-400'
                    }`}>
                      {topic.difficulty}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>


        </div>
      </section>
      
      {/* Enhanced Contest Section */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-5xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-400">
              Upcoming Championship
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Compete against the world's best programmers and win amazing prizes with career opportunities.
            </p>
          </motion.div>
          
          <motion.div 
            className="relative max-w-5xl mx-auto mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
          >
            {/* Enhanced glow effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-orange-500/30 to-amber-500/30 rounded-2xl blur-xl"></div>
            
            {/* Contest card */}
            <div className="relative backdrop-blur-md bg-gray-800/90 border border-gray-700/50 rounded-2xl overflow-hidden shadow-2xl">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-500 to-amber-500"></div>
              
              <div className="p-8">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-4">
                      <h3 className="text-2xl font-bold text-white">{upcomingContest.title}</h3>
                      <div className="bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full animate-pulse">
                        STARTS IN {formatTimeUntil(upcomingContest.startTime)}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                      <div className="bg-gray-900/50 rounded-lg p-3 text-center">
                        <Gift className="w-5 h-5 mx-auto mb-1 text-orange-400" />
                        <div className="text-sm text-gray-400">Prize Pool</div>
                        <div className="text-white font-bold">{upcomingContest.prize}</div>
                      </div>
                      <div className="bg-gray-900/50 rounded-lg p-3 text-center">
                        <Users className="w-5 h-5 mx-auto mb-1 text-blue-400" />
                        <div className="text-sm text-gray-400">Registered</div>
                        <div className="text-white font-bold">{upcomingContest.participants.toLocaleString()}</div>
                      </div>
                      <div className="bg-gray-900/50 rounded-lg p-3 text-center">
                        <Timer className="w-5 h-5 mx-auto mb-1 text-green-400" />
                        <div className="text-sm text-gray-400">Duration</div>
                        <div className="text-white font-bold">{upcomingContest.duration}</div>
                      </div>
                      <div className="bg-gray-900/50 rounded-lg p-3 text-center">
                        <Code className="w-5 h-5 mx-auto mb-1 text-purple-400" />
                        <div className="text-sm text-gray-400">Problems</div>
                        <div className="text-white font-bold">{upcomingContest.problems}</div>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-4 text-sm text-gray-300 mb-4">
                      <div className="flex items-center gap-2">
                        <Zap className="w-4 h-4 text-orange-400" />
                        <span>{upcomingContest.difficulty}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Globe className="w-4 h-4 text-orange-400" />
                        <span>Global Leaderboard</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Building className="w-4 h-4 text-orange-400" />
                        <span>Career Opportunities</span>
                      </div>
                    </div>

                    {/* Sponsors */}
                    <div className="mb-4">
                      <div className="text-sm text-gray-400 mb-2">Sponsored by:</div>
                      <div className="flex gap-2">
                        {upcomingContest.sponsors.map((sponsor, index) => (
                          <div key={index} className="px-3 py-1 bg-gray-700/50 rounded-full text-xs text-white">
                            {sponsor}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col gap-3">
                    <Link to="/contests">
                    <button className="w-full px-8 py-4 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold rounded-xl shadow-lg hover:shadow-orange-500/30 transition-all duration-300 flex items-center gap-2 group whitespace-nowrap">
                      <Trophy className="w-5 h-5" />
                      Register Now
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
                    </button>
                    </Link>
                    
                    <button className="px-8 py-4 bg-gray-700/80 hover:bg-gray-600/80 backdrop-blur-sm border border-gray-600 text-white font-medium rounded-xl transition-all duration-300 flex items-center gap-2 justify-center">
                      <Bell className="w-4 h-4" />
                      Set Reminder
                    </button>

                    <Link to="/contests">
                    <button className="w-full px-8 py-4 bg-purple-600/20 hover:bg-purple-600/30 backdrop-blur-sm border border-purple-600/50 text-purple-400 font-medium rounded-xl transition-all duration-300 flex items-center gap-2 justify-center">
                      <Eye className="w-4 h-4" />
                      View Past Contests
                    </button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Contest Statistics */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            <div className="bg-gray-800/60 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6 text-center">
              <div className="w-12 h-12 mx-auto mb-4 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center">
                <Medal className="w-6 h-6 text-white" />
              </div>
              <div className="text-2xl font-bold text-white mb-2">1,200+</div>
              <div className="text-gray-400">Contests Hosted</div>
            </div>

            <div className="bg-gray-800/60 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6 text-center">
              <div className="w-12 h-12 mx-auto mb-4 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div className="text-2xl font-bold text-white mb-2">85%</div>
              <div className="text-gray-400">Job Success Rate</div>
            </div>

            <div className="bg-gray-800/60 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6 text-center">
              <div className="w-12 h-12 mx-auto mb-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                <Award className="w-6 h-6 text-white" />
              </div>
              <div className="text-2xl font-bold text-white mb-2">$500K+</div>
              <div className="text-gray-400">Total Prizes Awarded</div>
            </div>
          </motion.div>
        </div>
      </section>
      
      {/* Enhanced Stats Section */}
      <section 
        ref={statsRef}
        className="py-20 px-4 relative overflow-hidden"
      >
        {/* Background elements */}
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl"></div>
        
        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-5xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-400">
              Join Our Global Community
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Be part of the world's most comprehensive competitive programming and interview preparation platform.
            </p>
          </motion.div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
            {[
              { 
                value: animatedStats.users, 
                label: 'Active Learners', 
                suffix: '+', 
                icon: Users,
                color: 'from-blue-500 to-cyan-500',
                description: 'Coding enthusiasts'
              },
              { 
                value: animatedStats.problems, 
                label: 'Problems Solved', 
                suffix: '+', 
                icon: CheckCircle,
                color: 'from-green-500 to-emerald-500',
                description: 'Daily submissions'
              },
              { 
                value: animatedStats.contests, 
                label: 'Contests Hosted', 
                suffix: '+', 
                icon: Trophy,
                color: 'from-yellow-500 to-orange-500',
                description: 'With cash prizes'
              },
              { 
                value: animatedStats.companies, 
                label: 'Hiring Partners', 
                suffix: '+', 
                icon: Building,
                color: 'from-purple-500 to-pink-500',
                description: 'Top tech companies'
              }
            ].map((stat, index) => (
              <motion.div 
                key={index}
                className="backdrop-blur-sm bg-gray-800/60 border border-gray-700/50 rounded-2xl p-6 text-center group hover:scale-105 transition-all duration-300"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <div className={`w-12 h-12 mx-auto mb-4 rounded-xl bg-gradient-to-r ${stat.color} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
                <div className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-400 mb-2">
                  {stat.value.toLocaleString()}{stat.suffix}
                </div>
                <div className="text-white font-medium mb-1">{stat.label}</div>
                <div className="text-sm text-gray-400">{stat.description}</div>
              </motion.div>
            ))}
          </div>

          {/* Enhanced Testimonials Section */}
          <motion.div 
            className="max-w-4xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h3 className="text-2xl font-bold mb-8 text-center text-white">Success Stories from Our Community</h3>
            
            <div className="relative">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentTestimonial}
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  transition={{ duration: 0.5 }}
                  className="bg-gray-800/60 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-8"
                >
                  <div className="flex items-center gap-4 mb-6">
                    <img 
                      src={testimonials[currentTestimonial].avatar} 
                      alt={testimonials[currentTestimonial].name}
                      className="w-16 h-16 rounded-full border-2 border-orange-500"
                    />
                    <div>
                      <h4 className="font-bold text-white text-lg">{testimonials[currentTestimonial].name}</h4>
                      <p className="text-orange-400 font-medium">{testimonials[currentTestimonial].role}</p>
                      <div className="flex items-center gap-1 mt-1">
                        {[...Array(testimonials[currentTestimonial].rating)].map((_, i) => (
                          <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <blockquote className="text-lg text-gray-300 italic leading-relaxed">
                    "{testimonials[currentTestimonial].content}"
                  </blockquote>
                </motion.div>
              </AnimatePresence>
              
              {/* Testimonial indicators */}
              <div className="flex justify-center gap-2 mt-6">
                {testimonials.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentTestimonial(index)}
                    className={`w-3 h-3 rounded-full transition-all duration-300 ${
                      index === currentTestimonial 
                        ? 'bg-orange-500 scale-110' 
                        : 'bg-gray-600 hover:bg-gray-500'
                    }`}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Enhanced CTA Section */}
      <section 
        ref={ctaRef}
        className="py-20 px-4"
      >
        <div className="max-w-5xl mx-auto relative">
          {/* Enhanced glow effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-orange-500/30 to-amber-500/30 rounded-2xl blur-xl"></div>
          
          {/* CTA card */}
          <motion.div 
            className="relative backdrop-blur-md bg-gray-800/90 border border-gray-700/50 rounded-2xl overflow-hidden shadow-2xl p-8 md:p-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <div className="text-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-6 text-white">
                Ready to Transform Your Coding Journey?
              </h2>
              
              <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
                Join over 75,000 developers who are mastering algorithms, acing FAANG interviews, 
                visualizing complex DSA concepts, and winning competitions. Start your success story today!
              </p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
                <Link to="/problems">
                <button 
                  onClick={() => setIsAuthenticated(true)}
                  className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold rounded-xl shadow-lg hover:shadow-orange-500/30 transition-all duration-300 flex items-center justify-center gap-2 group"
                >
                  <Rocket className="w-5 h-5" />
                  {isAuthenticated ? 'Continue Your Journey' : 'Start Free Today'}
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
                </button>
                </Link>
                <Link to="/premium">
                <button className="w-full sm:w-auto px-8 py-4 bg-gray-700/80 hover:bg-gray-600/80 backdrop-blur-sm border border-gray-600 text-white font-bold rounded-xl shadow-lg transition-all duration-300 flex items-center justify-center gap-2">
                  <Crown className="w-5 h-5 text-yellow-400" />
                  Upgrade to Premium
                </button>
                </Link>
               
              </div>
              
              {/* Feature highlights */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                <div className="flex items-center justify-center gap-2 text-gray-300">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span>Free forever plan</span>
                </div>
                <div className="flex items-center justify-center gap-2 text-gray-300">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span>No credit card required</span>
                </div>
                <div className="flex items-center justify-center gap-2 text-gray-300">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span>AI-powered learning</span>
                </div>
                <div className="flex items-center justify-center gap-2 text-gray-300">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span>Join in 30 seconds</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
      
      {/* Enhanced Footer */}
      <footer className="py-16 px-4 border-t border-gray-800">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-8 mb-12">
            <div className="md:col-span-2">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8  flex items-center justify-center">
                  {/* <img src={codeway}  height={30} width={40} alt="codeway-logo" /> */}
                  <FaCode className="w-6 h-6 text-orange-400" />
                </div>
                <span className="text-xl font-bold text-white">The CodeWay</span>
              </div>
              <p className="text-gray-400 mb-6 max-w-md">
                The ultimate platform for competitive programmers and interview preparation. 
                Master algorithms, ace interviews, visualize DSA concepts, and win competitions.
              </p>
              <div className="flex space-x-4">
                {[
                  { icon: Twitter, href: "#", color: "hover:text-blue-400" },
                  { icon: Github, href: "#", color: "hover:text-gray-300" },
                  { icon: Linkedin, href: "#", color: "hover:text-blue-600" },
                  { icon: Youtube, href: "#", color: "hover:text-red-500" },
                  { icon: Instagram, href: "#", color: "hover:text-pink-500" }
                ].map((social, index) => (
                  <a 
                    key={index}
                    href={social.href} 
                    className={`w-10 h-10 bg-gray-800 hover:bg-orange-500 rounded-lg flex items-center justify-center text-gray-400 hover:text-white transition-all duration-300 ${social.color}`}
                  >
                    <social.icon className="w-5 h-5" />
                  </a>
                ))}
              </div>
            </div>
            
            <div>
              <h3 className="text-white font-bold mb-4">Platform</h3>
              <ul className="space-y-3">
                {[
                  { name: 'Interview AI', path: '/interview' },
                  { name: 'DSA Visualizer', path: '/visualizer' },
                  { name: 'Doubt Assistant', path: '/doubt-ai' },
                  { name: 'Discussion Forum', path: '/discuss' },
                  { name: 'Contests', path: '/contest' },
                  { name: 'Problems', path: '/problems' }
                ].map((item, index) => (
                  <li key={index}>
                    <Link to={item.path} className="text-gray-400 hover:text-orange-400 transition-colors duration-300 flex items-center gap-2">
                      <ArrowRight className="w-3 h-3" />
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <h3 className="text-white font-bold mb-4">Learning</h3>
              <ul className="space-y-3">
                {['Learning Paths', 'Practice Problems', 'Mock Interviews', 'Code Visualizations', 'Tutorials', 'Blog'].map((item, index) => (
                  <li key={index}>
                    <a href="#" className="text-gray-400 hover:text-orange-400 transition-colors duration-300 flex items-center gap-2">
                      <ArrowRight className="w-3 h-3" />
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <h3 className="text-white font-bold mb-4">Company</h3>
              <ul className="space-y-3">
                {['About Us', 'Careers', 'Contact', 'Help Center', 'Privacy Policy', 'Terms of Service'].map((item, index) => (
                  <li key={index}>
                    <a href="#" className="text-gray-400 hover:text-orange-400 transition-colors duration-300 flex items-center gap-2">
                      <ArrowRight className="w-3 h-3" />
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          
          <div className="pt-8 mt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm mb-4 md:mb-0">
              © {new Date().getFullYear()} CodeMaster. All rights reserved. Built with ❤️ for developers worldwide.
            </p>
            
            <div className="flex items-center space-x-6">
              <div className="flex items-center gap-2 text-gray-400 text-sm">
                <Shield className="w-4 h-4 text-green-400" />
                <span>Secure & Private</span>
              </div>
              <div className="flex items-center gap-2 text-gray-400 text-sm">
                <Globe className="w-4 h-4 text-blue-400" />
                <span>Global Community</span>
              </div>
              <div className="flex items-center gap-2 text-gray-400 text-sm">
<Lightning className="w-4 h-4 text-yellow-400" />
                <span>Lightning Fast</span>
              </div>
            </div>
          </div>
          <AiAssistant/>
        </div>
      </footer>
    </div>
  )
}

export default Homepage
