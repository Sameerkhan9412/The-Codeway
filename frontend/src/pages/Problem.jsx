import React, { useEffect, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useSelector, useDispatch } from "react-redux";
import { fetchSolvedProblems } from "../slice/problemSlice";
import {
  Search,
  Filter,
  Trophy,
  Clock,
  Users,
  Star,
  ChevronDown,
  Play,
  CheckCircle,
  Circle,
  Zap,
  Target,
  Brain,
  Grid,
  List,
  ArrowUpDown,
  Eye,
  BookOpen,
  Code,
  TrendingUp,
  Award,
  Flame,
  ArrowLeft,
  Plus,
  FolderPlus,
  ListPlus,
  X,
  Folder,
  Calendar,
  BarChart3,
  Sparkles,
  Rocket,
  Crown,
  ChevronRight,
  Timer,
  Activity,
  Lightbulb,
  CodeIcon,
  Hash,
  Database,
  Layers,
  GitBranch,
  Calculator,
  SlidersHorizontal,
  Funnel,
} from "lucide-react";
import { NavLink } from "react-router-dom";
import axiosClient from "../utils/axiosClient";

const Problem = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const solvedProblems = useSelector((state) => state.problems.solvedProblems);
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    difficulty: "all",
    tag: "all",
    status: "all",
    search: "",
  });
  const [sortBy, setSortBy] = useState("title");
  const [viewMode, setViewMode] = useState("card");
  const [showFilters, setShowFilters] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    solved: 0,
    easy: 0,
    medium: 0,
    hard: 0,
  });
  const [playlists, setPlaylists] = useState([]);
  const [showPlaylistModal, setShowPlaylistModal] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState("");
  const [selectedProblemForPlaylist, setSelectedProblemForPlaylist] = useState(null);
  const [showAddToPlaylistModal, setShowAddToPlaylistModal] = useState(false);
  const [playlistLoading, setPlaylistLoading] = useState(false);
  const [addingToPlaylist, setAddingToPlaylist] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);
  const [allProblems, setAllProblems] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // Get unique tags from problems
  const uniqueTags = React.useMemo(() => {
    const tagSet = new Set();
    if (Array.isArray(problems)) {
      problems.forEach(problem => {
        const tags = Array.isArray(problem.tags) 
          ? problem.tags 
          : typeof problem.tags === "string" 
          ? [problem.tags] 
          : [];
        tags.forEach(tag => tagSet.add(tag));
      });
    }
    return Array.from(tagSet).sort();
  }, [problems]);

  // Initial data fetch
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [problemsRes, playlistsRes] = await Promise.all([
          axiosClient.get("/problem/getAllProblems"),
          user
            ? axiosClient.get("/playlists/user")
            : Promise.resolve({ data: [] }),
        ]);

        const fetchedProblems = problemsRes.data || [];
        setAllProblems(fetchedProblems);
        setProblems(fetchedProblems.slice(0, 15));
        setHasMore(fetchedProblems.length > 15);
        setPage(1);
        if (user && initialLoad) {
          setPlaylists(playlistsRes.data?.data || playlistsRes.data || []);
          // Fetch solved problems only if they haven't been fetched yet
          if (solvedProblems.length === 0) {
            try {
              await dispatch(fetchSolvedProblems()).unwrap();
              setInitialLoad(false);
            } catch (error) {
              console.error("Error dispatching fetchSolvedProblems:", error);
              toast.error("Failed to load solved problems. Please try again.");
            }
          }
        }
      } catch (err) {
        console.error("Error fetching data:", err);
        toast.error("Failed to load problems. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, dispatch, initialLoad]);

  const fetchMoreProblems = () => {
    if (!hasMore) return;

    const nextPage = page + 1;
    const newProblems = allProblems.slice(0, nextPage * 15);
    setProblems(newProblems);
    setPage(nextPage);
    setHasMore(newProblems.length < allProblems.length);
  };

  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + document.documentElement.scrollTop >=
          document.documentElement.offsetHeight - 200
      ) {
        fetchMoreProblems();
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [hasMore, page, allProblems]);
  
  // Add error display for solved problems fetch failure
  const solvedProblemsError = useSelector(state => state.problems.error);

  // Update stats whenever problems or solvedProblems change
  useEffect(() => {
    if (problems.length > 0) {
      const newStats = {
        total: problems.length,
        solved: user ? solvedProblems.length : 0,
        easy: problems.filter((p) => p.difficulty === "easy").length,
        medium: problems.filter((p) => p.difficulty === "medium").length,
        hard: problems.filter((p) => p.difficulty === "hard").length,
      };
      setStats(newStats);
    }
  }, [problems, solvedProblems, user]);

  const filteredProblems = (problems || []).filter((problem) => {
    const difficultyMatch =
      filters.difficulty === "all" || problem.difficulty === filters.difficulty;

    const problemTags = Array.isArray(problem.tags)
      ? problem.tags
      : typeof problem.tags === "string"
      ? [problem.tags]
      : [];
    const tagMatch = filters.tag === "all" || problemTags.includes(filters.tag);

    const statusMatch =
      filters.status === "all" ||
      (filters.status === "solved" &&
        solvedProblems.some((sp) => sp._id === problem._id)) ||
      (filters.status === "unsolved" &&
        !solvedProblems.some((sp) => sp._id === problem._id));
    const searchMatch =
      filters.search === "" ||
      problem.title.toLowerCase().includes(filters.search.toLowerCase()) ||
      (problem.description && problem.description.toLowerCase().includes(filters.search.toLowerCase()));

    return difficultyMatch && tagMatch && statusMatch && searchMatch;
  });

  const sortedProblems = [...filteredProblems].sort((a, b) => {
    switch (sortBy) {
      case "difficulty":
        const diffOrder = { easy: 1, medium: 2, hard: 3 };
        return diffOrder[a.difficulty] - diffOrder[b.difficulty];
      case "title":
        return a.title.localeCompare(b.title);
      case "acceptance":
        return (b.acceptance || 0) - (a.acceptance || 0);
      default:
        return 0;
    }
  });

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case "easy":
        return "text-emerald-400 bg-emerald-400/10 border-emerald-400/30 shadow-emerald-400/20";
      case "medium":
        return "text-amber-400 bg-amber-400/10 border-amber-400/30 shadow-amber-400/20";
      case "hard":
        return "text-rose-400 bg-rose-400/10 border-rose-400/30 shadow-rose-400/20";
      default:
        return "text-slate-400 bg-slate-400/10 border-slate-400/30";
    }
  };

  const getDifficultyIcon = (difficulty) => {
    switch (difficulty) {
      case "easy":
        return <Target className="w-4 h-4" />;
      case "medium":
        return <Zap className="w-4 h-4" />;
      case "hard":
        return <Brain className="w-4 h-4" />;
      default:
        return <Circle className="w-4 h-4" />;
    }
  };

  const isProblemSolved = (problemId) => {
    if (!solvedProblems || !Array.isArray(solvedProblems)) {
      return false;
    }
    // Check if the first element is a string (problem ID) or an object
    if (typeof solvedProblems[0] === 'string') {
      return solvedProblems.includes(problemId);
    }
    // Original logic for array of objects
    return solvedProblems.some((sp) => sp && sp._id === problemId);
  };

  // Add a function to refresh solved problems
  const refreshSolvedProblems = async () => {
    if (user) {
      try {
        await dispatch(fetchSolvedProblems()).unwrap();
        console.log("Solved problems refreshed");
      } catch (error) {
        console.error("Error refreshing solved problems:", error);
      }
    }
  };

  const handleCreatePlaylist = async () => {
    try {
      if (!newPlaylistName.trim()) {
        toast.error("Playlist name cannot be empty");
        return;
      }

      setPlaylistLoading(true);
      const { data } = await axiosClient.post("/playlists", {
        name: newPlaylistName,
      });

      setPlaylists((prevPlaylists) => [
        ...prevPlaylists,
        {
          _id: data.data._id,
          name: data.data.name,
          user: data.data.user,
          problems: data.data.problems || []
        }
      ]);

      setNewPlaylistName("");
      setShowPlaylistModal(false);
      toast.success("Playlist created successfully!");
    } catch (err) {
      console.error("Error creating playlist:", err);
      toast.error(err.response?.data?.message || "Failed to create playlist");
    } finally {
      setPlaylistLoading(false);
    }
  };

  const handleAddToPlaylist = async (playlistId) => {
    try {
      setAddingToPlaylist(true);
      const { data } = await axiosClient.post(`/playlists/${playlistId}/problems`, {
        problemId: selectedProblemForPlaylist,
      });

      const problemToAdd = problems.find(p => p._id === selectedProblemForPlaylist);
      
      if (!problemToAdd) {
        throw new Error("Problem not found");
      }

      setPlaylists(prevPlaylists => 
        prevPlaylists.map(playlist => 
          playlist._id === playlistId 
            ? {
                ...playlist,
                problems: [
                  ...(playlist.problems || []),
                  {
                    _id: problemToAdd._id,
                    title: problemToAdd.title,
                    difficulty: problemToAdd.difficulty,
                    tags: problemToAdd.tags,
                    acceptance: problemToAdd.acceptance
                  }
                ]
              }
            : playlist
        )
      );

      toast.success("Problem added to playlist successfully!");
      setShowAddToPlaylistModal(false);
    } catch (err) {
      console.error("Error adding problem to playlist:", err);
      toast.error(
        err.response?.data?.message || "Failed to add problem to playlist"
      );
    } finally {
      setAddingToPlaylist(false);
    }
  };

  const getTagIcon = (tag) => {
    const tagIcons = {
      Array: <Database className="w-3 h-3" />,
      String: <Hash className="w-3 h-3" />,
      "Hash Table": <Grid className="w-3 h-3" />,
      "Dynamic Programming": <Layers className="w-3 h-3" />,
      Math: <Calculator className="w-3 h-3" />,
      Sorting: <ArrowUpDown className="w-3 h-3" />,
      Greedy: <Target className="w-3 h-3" />,
      "Depth-First Search": <GitBranch className="w-3 h-3" />,
      "Binary Search": <Search className="w-3 h-3" />,
      Tree: <GitBranch className="w-3 h-3" />,
      Graph: <Activity className="w-3 h-3" />,
    };
    return tagIcons[tag] || <Code className="w-3 h-3" />;
  };

  const clearAllFilters = () => {
    setFilters({
      difficulty: "all",
      tag: "all",
      status: "all",
      search: "",
    });
    setShowFilters(false);
  };

  const hasActiveFilters = filters.difficulty !== "all" || filters.tag !== "all" || filters.status !== "all" || filters.search !== "";

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-orange-500 border-solid mx-auto mb-4"></div>
          </div>
          <div className="text-slate-300 font-medium">Loading Problems...</div>
          <div className="text-slate-500 text-sm mt-1">
            Preparing your coding journey
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        {/* Header Section */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-orange-500/5 via-transparent to-purple-500/5"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_50%,rgba(251,146,60,0.05),transparent_50%)]"></div>

          <div className="relative bg-slate-800/50 backdrop-blur-xl border-b border-slate-700/50 sticky top-0 z-10">
            <div className="container mx-auto px-6 py-8">
              {/* Navigation Header */}
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                  <NavLink
                    to="/"
                    className="group flex items-center gap-2 text-slate-400 hover:text-orange-400 transition-all duration-300"
                  >
                    <div className="p-2 rounded-xl bg-slate-700/30 group-hover:bg-orange-500/10 border border-slate-600/30 group-hover:border-orange-500/30 transition-all duration-300">
                      <ArrowLeft className="w-5 h-5" />
                    </div>
                    <span className="text-sm font-medium">Back to Home</span>
                  </NavLink>

                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-2xl bg-gradient-to-br from-orange-500/20 to-purple-500/20 border border-orange-500/30">
                      <Trophy className="w-8 h-8 text-orange-400" />
                    </div>
                    <div>
                      <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-orange-200 to-orange-400 bg-clip-text text-transparent">
                        Problems
                      </h1>
                      <p className="text-slate-400 mt-1">
                        Master coding challenges and level up your skills
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  {user && (
                    <>
                      <button
                        onClick={refreshSolvedProblems}
                        className="group flex items-center gap-2 px-4 py-2 bg-slate-700/50 hover:bg-slate-600/50 text-slate-300 hover:text-white rounded-xl font-medium border border-slate-600/30 hover:border-slate-500/30 transition-all duration-300"
                        title="Refresh solved problems"
                      >
                        <Activity className="w-4 h-4 group-hover:animate-pulse" />
                        Refresh
                      </button>
                      <button
                        onClick={() => setShowPlaylistModal(true)}
                        className="group flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-xl font-medium shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 transition-all duration-300 transform hover:scale-105"
                      >
                        <FolderPlus className="w-4 h-4 group-hover:rotate-12 transition-transform duration-300" />
                        Create Playlist
                        <Sparkles className="w-4 h-4 opacity-60" />
                      </button>
                    </>
                  )}

                  <div className="flex items-center gap-2 p-1 bg-slate-700/50 rounded-xl border border-slate-600/30">
                    <button
                      onClick={() => setViewMode("card")}
                      className={`p-3 rounded-lg transition-all duration-300 ${
                        viewMode === "card"
                          ? "bg-orange-500 text-white shadow-lg shadow-orange-500/25"
                          : "text-slate-400 hover:text-white hover:bg-slate-600/50"
                      }`}
                    >
                      <Grid className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setViewMode("list")}
                      className={`p-3 rounded-lg transition-all duration-300 ${
                        viewMode === "list"
                          ? "bg-orange-500 text-white shadow-lg shadow-orange-500/25"
                          : "text-slate-400 hover:text-white hover:bg-slate-600/50"
                      }`}
                    >
                      <List className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-6 mb-8">
                <div className="group relative overflow-hidden bg-gradient-to-br from-slate-800/80 to-slate-700/80 backdrop-blur-sm rounded-2xl p-6 border border-slate-600/30 hover:border-blue-500/30 transition-all duration-500 hover:transform hover:scale-105">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <div className="relative">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 rounded-xl bg-blue-500/10 border border-blue-500/20">
                        <BookOpen className="w-5 h-5 text-blue-400" />
                      </div>
                      <span className="text-slate-400 font-medium">Total</span>
                    </div>
                    <div className="text-3xl font-bold text-white mb-1">
                      {stats.total}
                    </div>
                    <div className="text-xs text-blue-400 font-medium">
                      Problems Available
                    </div>
                  </div>
                </div>

                <div className="group relative overflow-hidden bg-gradient-to-br from-slate-800/80 to-slate-700/80 backdrop-blur-sm rounded-2xl p-6 border border-slate-600/30 hover:border-emerald-500/30 transition-all duration-500 hover:transform hover:scale-105">
                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <div className="relative">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                        <CheckCircle className="w-5 h-5 text-emerald-400" />
                      </div>
                      <span className="text-slate-400 font-medium">Solved</span>
                    </div>
                    <div className="text-3xl font-bold text-emerald-400 mb-1">
                      {stats.solved}
                    </div>
                    <div className="text-xs text-emerald-400 font-medium">
                      {stats.total > 0
                        ? Math.round((stats.solved / stats.total) * 100)
                        : 0}
                      % Complete
                    </div>
                  </div>
                </div>

                <div className="group relative overflow-hidden bg-gradient-to-br from-slate-800/80 to-slate-700/80 backdrop-blur-sm rounded-2xl p-6 border border-slate-600/30 hover:border-emerald-500/30 transition-all duration-500 hover:transform hover:scale-105">
                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <div className="relative">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                        <Target className="w-5 h-5 text-emerald-400" />
                      </div>
                      <span className="text-slate-400 font-medium">Easy</span>
                    </div>
                    <div className="text-3xl font-bold text-emerald-400 mb-1">
                      {stats.easy}
                    </div>
                    <div className="text-xs text-emerald-400 font-medium">
                      Foundation Level
                    </div>
                  </div>
                </div>

                <div className="group relative overflow-hidden bg-gradient-to-br from-slate-800/80 to-slate-700/80 backdrop-blur-sm rounded-2xl p-6 border border-slate-600/30 hover:border-amber-500/30 transition-all duration-500 hover:transform hover:scale-105">
                  <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <div className="relative">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20">
                        <Zap className="w-5 h-5 text-amber-400" />
                      </div>
                      <span className="text-slate-400 font-medium">Medium</span>
                    </div>
                    <div className="text-3xl font-bold text-amber-400 mb-1">
                      {stats.medium}
                    </div>
                    <div className="text-xs text-amber-400 font-medium">
                      Intermediate
                    </div>
                  </div>
                </div>

                <div className="group relative overflow-hidden bg-gradient-to-br from-slate-800/80 to-slate-700/80 backdrop-blur-sm rounded-2xl p-6 border border-slate-600/30 hover:border-rose-500/30 transition-all duration-500 hover:transform hover:scale-105">
                  <div className="absolute inset-0 bg-gradient-to-br from-rose-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <div className="relative">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 rounded-xl bg-rose-500/10 border border-rose-500/20">
                        <Brain className="w-5 h-5 text-rose-400" />
                      </div>
                      <span className="text-slate-400 font-medium">Hard</span>
                    </div>
                    <div className="text-3xl font-bold text-rose-400 mb-1">
                      {stats.hard}
                    </div>
                    <div className="text-xs text-rose-400 font-medium">
                      Expert Level
                    </div>
                  </div>
                </div>
              </div>


               {/* Playlists Section */}
               {user && playlists.length > 0 && (
                <div className="mb-8">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30">
                      <Folder className="w-6 h-6 text-purple-400" />
                    </div>
                    <h3 className="text-xl font-bold text-white">
                      Your Study Playlists
                    </h3>
                    <div className="flex-1 h-px bg-gradient-to-r from-purple-500/30 to-transparent"></div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {playlists.map((playlist) => (
                      <NavLink
                        key={playlist._id}
                        to={`/playlists/${playlist._id}`}
                        state={{ playlist }}
                        className="group relative overflow-hidden bg-gradient-to-br from-slate-800/80 to-slate-700/80 backdrop-blur-sm rounded-2xl p-6 border border-slate-600/30 hover:border-purple-500/30 transition-all duration-300 hover:transform hover:scale-105"
                      >
                        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        <div className="relative">
                          <div className="flex items-center justify-between mb-3">
                            <div className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/20">
                              <List className="w-5 h-5 text-purple-400" />
                            </div>
                            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-purple-400 transition-colors" />
                          </div>
                          <h4 className="font-semibold text-white mb-2 group-hover:text-purple-400 transition-colors">
                            {playlist.name}
                          </h4>
                          <div className="flex items-center gap-2 text-sm text-slate-400">
                            <BookOpen className="w-4 h-4" />
                            <span>
                              {playlist.problems?.length || 0} problems
                            </span>
                            {playlist.problems?.length > 0 && (
                              <div className="flex gap-1 ml-2">
                                {playlist.problems.slice(0, 3).map((problem, idx) => (
                                  <span
                                    key={idx}
                                    className={`w-2 h-2 rounded-full ${
                                      problem.difficulty === 'easy'
                                        ? 'bg-emerald-400'
                                        : problem.difficulty === 'medium'
                                        ? 'bg-amber-400'
                                        : 'bg-rose-400'
                                    }`}
                                  />
                                ))}
                                {playlist.problems.length > 3 && (
                                  <span className="text-xs text-slate-500">
                                    +{playlist.problems.length - 3}
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </NavLink>
                    ))}
                  </div>
                </div>
              )}

              {/* Search and Filter Section */}
              <div className="mb-8">
                <div className="flex flex-col lg:flex-row gap-4 items-center justify-between mb-6">
                  {/* Search Bar */}
                  <div className="relative flex-1 max-w-2xl">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Search className="h-5 w-5 text-slate-400" />
                    </div>
                    <input
                      type="text"
                      placeholder="Search problems by title or description..."
                      value={filters.search}
                      onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                      className="w-full pl-12 pr-4 py-4 bg-slate-800/80 backdrop-blur-sm border border-slate-600/30 rounded-2xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50 transition-all duration-300"
                    />
                    {filters.search && (
                      <button
                        onClick={() => setFilters(prev => ({ ...prev, search: "" }))}
                        className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-white transition-colors"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    )}
                  </div>

                  {/* Filter Toggle and Sort */}
                  <div className="flex items-center gap-3">
                    {/* Filter Toggle Button */}
                    <button
                      onClick={() => setShowFilters(!showFilters)}
                      className={`group flex items-center gap-2 px-6 py-3 rounded-2xl font-medium border transition-all duration-300 ${
                        hasActiveFilters
                          ? "bg-orange-500/20 border-orange-500/30 text-orange-400 hover:bg-orange-500/30"
                          : "bg-slate-700/50 border-slate-600/30 text-slate-300 hover:bg-slate-600/50 hover:text-white"
                      }`}
                    >
                      <SlidersHorizontal className="w-4 h-4" />
                      Filters
                      {hasActiveFilters && (
                        <span className="ml-1 px-2 py-0.5 bg-orange-500 text-white text-xs rounded-full">
                          {[filters.difficulty !== "all", filters.tag !== "all", filters.status !== "all", filters.search !== ""].filter(Boolean).length}
                        </span>
                      )}
                      <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${showFilters ? "rotate-180" : ""}`} />
                    </button>

                    {/* Sort Dropdown */}
                    <div className="relative">
                      <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="appearance-none px-6 py-3 bg-slate-700/50 border border-slate-600/30 rounded-2xl text-slate-300 font-medium focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50 transition-all duration-300 pr-12"
                      >
                        <option value="title">Sort by Title</option>
                        <option value="difficulty">Sort by Difficulty</option>
                        <option value="acceptance">Sort by Acceptance</option>
                      </select>
                      <ArrowUpDown className="absolute right-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                    </div>
                  </div>
                </div>

                {/* Filter Options Panel */}
                {showFilters && (
                  <div className="mb-6 p-6 bg-slate-800/50 backdrop-blur-sm border border-slate-600/30 rounded-2xl">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {/* Difficulty Filter */}
                      <div>
                        <label className="block text-slate-300 font-medium mb-3">
                          <Target className="w-4 h-4 inline mr-2" />
                          Difficulty
                        </label>
                        <div className="space-y-2">
                          {["all", "easy", "medium", "hard"].map((diff) => (
                            <label key={diff} className="flex items-center">
                              <input
                                type="radio"
                                name="difficulty"
                                value={diff}
                                checked={filters.difficulty === diff}
                                onChange={(e) => setFilters(prev => ({ ...prev, difficulty: e.target.value }))}
                                className="sr-only"
                              />
                              <div className={`flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-all duration-300 ${
                                filters.difficulty === diff
                                  ? "bg-orange-500/20 border border-orange-500/30 text-orange-400"
                                  : "bg-slate-700/30 border border-slate-600/30 text-slate-300 hover:bg-slate-600/30"
                              }`}>
                                {diff === "all" && <Funnel className="w-4 h-4" />}
                                {diff === "easy" && <Target className="w-4 h-4 text-emerald-400" />}
                                {diff === "medium" && <Zap className="w-4 h-4 text-amber-400" />}
                                {diff === "hard" && <Brain className="w-4 h-4 text-rose-400" />}
                                <span className="capitalize font-medium">
                                  {diff === "all" ? "All Difficulties" : diff}
                                </span>
                              </div>
                            </label>
                          ))}
                        </div>
                      </div>

                      {/* Tag Filter */}
                      <div>
                        <label className="block text-slate-300 font-medium mb-3">
                          <Hash className="w-4 h-4 inline mr-2" />
                          Topic
                        </label>
                        <select
                          value={filters.tag}
                          onChange={(e) => setFilters(prev => ({ ...prev, tag: e.target.value }))}
                          className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/30 rounded-xl text-slate-300 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50 transition-all duration-300"
                        >
                          <option value="all">All Topics</option>
                          {uniqueTags.map((tag) => (
                            <option key={tag} value={tag}>
                              {tag}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Status Filter */}
                      {user && (
                        <div>
                          <label className="block text-slate-300 font-medium mb-3">
                            <CheckCircle className="w-4 h-4 inline mr-2" />
                            Status
                          </label>
                          <div className="space-y-2">
                            {[
                              { value: "all", label: "All Problems", icon: <Funnel className="w-4 h-4" /> },
                              { value: "solved", label: "Solved", icon: <CheckCircle className="w-4 h-4 text-emerald-400" /> },
                              { value: "unsolved", label: "Unsolved", icon: <Circle className="w-4 h-4 text-slate-400" /> }
                            ].map((status) => (
                              <label key={status.value} className="flex items-center">
                                <input
                                  type="radio"
                                  name="status"
                                  value={status.value}
                                  checked={filters.status === status.value}
                                  onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                                  className="sr-only"
                                />
                                <div className={`flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-all duration-300 ${
                                  filters.status === status.value
                                    ? "bg-orange-500/20 border border-orange-500/30 text-orange-400"
                                    : "bg-slate-700/30 border border-slate-600/30 text-slate-300 hover:bg-slate-600/30"
                                }`}>
                                  {status.icon}
                                  <span className="font-medium">{status.label}</span>
                                </div>
                              </label>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Filter Actions */}
                    {hasActiveFilters && (
                      <div className="flex justify-between items-center mt-6 pt-6 border-t border-slate-600/30">
                        <div className="text-sm text-slate-400">
                          {sortedProblems.length} of {problems.length} problems match your filters
                        </div>
                        <button
                          onClick={clearAllFilters}
                          className="flex items-center gap-2 px-4 py-2 bg-slate-700/50 hover:bg-slate-600/50 text-slate-300 hover:text-white rounded-xl font-medium border border-slate-600/30 hover:border-slate-500/30 transition-all duration-300"
                        >
                          <X className="w-4 h-4" />
                          Clear Filters
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

             
            </div>
          </div>
        </div>

        {/* Problems List */}
        <div className="container mx-auto px-6 py-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-500/30">
                <BarChart3 className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <p className="text-lg font-semibold text-white">
                  {sortedProblems.length} Problems Found
                </p>
                <p className="text-slate-400 text-sm">
                  Out of {problems.length} total problems available
                </p>
              </div>
            </div>

            {sortedProblems.length > 0 && (
              <div className="flex items-center gap-2 px-4 py-2 bg-slate-700/30 rounded-xl border border-slate-600/30">
                <Activity className="w-4 h-4 text-green-400" />
                <span className="text-sm text-slate-300">Ready to code</span>
              </div>
            )}
          </div>

          {viewMode === "card" ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
              {sortedProblems.map((problem, index) => (
                <div
                  key={problem._id}
                  className="group relative animate-fadeInUp"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  {user && (
                    <button
                      onClick={() => {
                        setSelectedProblemForPlaylist(problem._id);
                        setShowAddToPlaylistModal(true);
                      }}
                      className="absolute top-4 right-4 p-2.5 rounded-full bg-slate-800/80 backdrop-blur-sm hover:bg-slate-700/80 text-slate-400 hover:text-orange-400 border border-slate-600/30 hover:border-orange-500/30 transition-all duration-300 z-10 opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0"
                      title="Add to playlist"
                    >
                      <ListPlus className="w-4 h-4" />
                    </button>
                  )}

                  <div className="relative overflow-hidden bg-gradient-to-br from-slate-800/80 to-slate-700/80 backdrop-blur-sm rounded-3xl p-8 border border-slate-600/30 hover:border-slate-500/50 transition-all duration-500 hover:transform hover:scale-105 hover:shadow-2xl hover:shadow-orange-500/10 h-full flex flex-col group-hover:bg-gradient-to-br group-hover:from-slate-700/80 group-hover:to-slate-600/80">
                    <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 via-transparent to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                    <div className="relative">
                      <div className="flex items-start justify-between mb-6">
                        <div className="flex items-center gap-3">
                          <div
                            className={`p-2 rounded-xl transition-all duration-300 ${
                              isProblemSolved(problem._id)
                                ? "bg-emerald-500/20 border border-emerald-500/30"
                                : "bg-slate-700/50 border border-slate-600/30"
                            }`}
                          >
                            {isProblemSolved(problem._id) ? (
                              <CheckCircle className="w-6 h-6 text-emerald-400" />
                            ) : (
                              <Circle className="w-6 h-6 text-slate-500" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-xl font-bold text-white group-hover:text-orange-400 transition-colors duration-300 line-clamp-2">
                              <NavLink to={`/problem/${problem._id}`}>
                                {problem?.title}
                              </NavLink>
                            </h3>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 mb-6">
                        <span
                          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border shadow-lg ${getDifficultyColor(
                            problem.difficulty
                          )}`}
                        >
                          {getDifficultyIcon(problem.difficulty)}
                          {problem.difficulty.charAt(0).toUpperCase() +
                            problem.difficulty.slice(1)}
                        </span>
                        {problem.acceptance && (
                          <div className="flex items-center gap-1 px-3 py-1.5 bg-slate-700/50 rounded-lg border border-slate-600/30">
                            <TrendingUp className="w-3 h-3 text-blue-400" />
                            <span className="text-xs text-slate-300 font-medium">
                              {problem.acceptance}%
                            </span>
                          </div>
                        )}
                      </div>

                      {problem.description && (
                        <p className="text-slate-400 text-sm mb-6 line-clamp-3 leading-relaxed flex-grow">
                          {problem.description}
                        </p>
                      )}

                      <div className="space-y-4 mt-auto">
                        <div className="flex flex-wrap gap-2">
                          {(() => {
                            const tags = Array.isArray(problem.tags)
                              ? problem.tags
                              : typeof problem.tags === "string"
                              ? [problem.tags]
                              : [];
                            return tags.slice(0, 3).map((tag, index) => (
                              <span
                                key={index}
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-700/50 hover:bg-slate-600/50 text-slate-300 text-xs rounded-lg border border-slate-600/30 hover:border-slate-500/30 transition-all duration-300"
                              >
                                {getTagIcon(tag)}
                                {tag}
                              </span>
                            ));
                          })()}
                          {(() => {
                            const tags = Array.isArray(problem.tags)
                              ? problem.tags
                              : typeof problem.tags === "string"
                              ? [problem.tags]
                              : [];
                            return (
                              tags.length > 3 && (
                                <span className="flex items-center gap-1 px-3 py-1.5 bg-slate-700/50 text-slate-400 text-xs rounded-lg border border-slate-600/30">
                                  <Plus className="w-3 h-3" />
                                  {tags.length - 3} more
                                </span>
                              )
                            );
                          })()}
                        </div>

                        <NavLink
                          to={`/problem/${problem._id}`}
                          className="block"
                        >
                          <button className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold rounded-xl shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 transition-all duration-300 transform hover:scale-105">
                            <Rocket className="w-4 h-4" />
                            Start Solving
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        </NavLink>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-gradient-to-br from-slate-800/80 to-slate-700/80 backdrop-blur-sm border border-slate-600/30 rounded-3xl overflow-hidden shadow-2xl">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gradient-to-r from-slate-700/80 to-slate-600/80 border-b border-slate-600/30">
                    <tr>
                      <th className="px-8 py-6 text-left text-sm font-bold text-slate-200 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-8 py-6 text-left text-sm font-bold text-slate-200 uppercase tracking-wider">
                        Problem
                      </th>
                      <th className="px-8 py-6 text-left text-sm font-bold text-slate-200 uppercase tracking-wider">
                        Difficulty
                      </th>
                      <th className="px-8 py-6 text-left text-sm font-bold text-slate-200 uppercase tracking-wider">
                        Topics
                      </th>
                      <th className="px-8 py-6 text-left text-sm font-bold text-slate-200 uppercase tracking-wider">
                        Acceptance
                      </th>
                      <th className="px-8 py-6 text-left text-sm font-bold text-slate-200 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700/30">
                    {sortedProblems.map((problem, index) => (
                      <tr
                        key={problem._id}
                        className="hover:bg-slate-700/30 transition-all duration-300 group animate-fadeInUp"
                        style={{ animationDelay: `${index * 30}ms` }}
                      >
                        <td className="px-8 py-6">
                          <div
                            className={`p-2 rounded-xl w-fit transition-all duration-300 ${
                              isProblemSolved(problem._id)
                                ? "bg-emerald-500/20 border border-emerald-500/30"
                                : "bg-slate-700/50 border border-slate-600/30"
                            }`}
                          >
                            {isProblemSolved(problem._id) ? (
                              <CheckCircle className="w-5 h-5 text-emerald-400" />
                            ) : (
                              <Circle className="w-5 h-5 text-slate-500" />
                            )}
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <div className="text-white font-semibold hover:text-orange-400 transition-colors cursor-pointer text-lg">
                            <NavLink
                              to={`/problem/${problem._id}`}
                              className="group-hover:underline"
                            >
                              {problem?.title}
                            </NavLink>
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <span
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border shadow-lg w-fit ${getDifficultyColor(
                              problem.difficulty
                            )}`}
                          >
                            {getDifficultyIcon(problem.difficulty)}
                            {problem.difficulty.charAt(0).toUpperCase() +
                              problem.difficulty.slice(1)}
                          </span>
                        </td>
                        <td className="px-8 py-6">
                          <div className="flex flex-wrap gap-2">
                            {(() => {
                              const tags = Array.isArray(problem.tags)
                                ? problem.tags
                                : typeof problem.tags === "string"
                                ? [problem.tags]
                                : [];
                              return tags.slice(0, 2).map((tag, index) => (
                                <span
                                  key={index}
                                  className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-700/50 text-slate-300 text-xs rounded-lg border border-slate-600/30"
                                >
                                  {getTagIcon(tag)}
                                  {tag}
                                </span>
                              ));
                            })()}
                            {(() => {
                              const tags = Array.isArray(problem.tags)
                                ? problem.tags
                                : typeof problem.tags === "string"
                                ? [problem.tags]
                                : [];
                              return (
                                tags.length > 2 && (
                                  <span className="flex items-center gap-1 px-3 py-1.5 bg-slate-700/50 text-slate-400 text-xs rounded-lg border border-slate-600/30">
                                    <Plus className="w-3 h-3" />
                                    {tags.length - 2}
                                  </span>
                                )
                              );
                            })()}
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-2">
                            <TrendingUp className="w-4 h-4 text-blue-400" />
                            <span className="text-slate-300 font-medium">
                              {problem.acceptance
                                ? `${problem.acceptance}%`
                                : "N/A"}
                            </span>
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-3">
                            {user && (
                              <button
                                onClick={() => {
                                  setSelectedProblemForPlaylist(problem._id);
                                  setShowAddToPlaylistModal(true);
                                }}
                                className="p-2.5 rounded-xl bg-slate-700/50 hover:bg-slate-600/50 text-slate-400 hover:text-orange-400 border border-slate-600/30 hover:border-orange-500/30 transition-all duration-300"
                                title="Add to playlist"
                              >
                                <ListPlus className="w-4 h-4" />
                              </button>
                            )}
                            <NavLink to={`/problem/${problem._id}`}>
                              <button className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold rounded-xl shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 transition-all duration-300 transform hover:scale-105">
                                <Rocket className="w-4 h-4" />
                                Solve
                              </button>
                            </NavLink>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {hasMore && (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-orange-500"></div>
              <span className="ml-4 text-slate-300">Loading more problems...</span>
            </div>
          )}

          {!hasMore && sortedProblems.length > 0 && (
            <div className="text-center py-10 text-slate-400">
              You've reached the end of the list.
            </div>
          )}

          {/* Empty State */}
          {sortedProblems.length === 0 && !loading && (
            <div className="text-center py-20">
              <div className="relative mb-8">
                <div className="p-6 rounded-full bg-gradient-to-br from-slate-700/50 to-slate-600/50 border border-slate-500/30 w-fit mx-auto">
                  <Search className="w-12 h-12 text-slate-400" />
                </div>
                <div className="absolute -top-2 -right-2 p-2 rounded-full bg-orange-500/20 border border-orange-500/30">
                  <X className="w-4 h-4 text-orange-400" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">
                No Problems Found
              </h3>
              <p className="text-slate-400 mb-6 max-w-md mx-auto">
                We couldn't find any problems matching your current filters. Try
                adjusting your search terms or filter criteria.
              </p>
              <button
                onClick={clearAllFilters}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold rounded-xl shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 transition-all duration-300 mx-auto"
              >
                <X className="w-4 h-4" />
                Clear All Filters
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Create Playlist Modal */}
      {showPlaylistModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-6">
          <div className="relative w-full max-w-md">
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/20 to-purple-500/20 rounded-3xl blur-xl"></div>
            <div className="relative bg-gradient-to-br from-slate-800/90 to-slate-700/90 backdrop-blur-xl border border-slate-600/50 rounded-3xl p-8 shadow-2xl">
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-orange-500/20 border border-orange-500/30">
                    <FolderPlus className="w-6 h-6 text-orange-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-white">
                    Create Playlist
                  </h3>
                </div>
                <button
                  onClick={() => setShowPlaylistModal(false)}
                  className="p-2 rounded-xl bg-slate-700/50 hover:bg-slate-600/50 text-slate-400 hover:text-white border border-slate-600/30 hover:border-slate-500/30 transition-all duration-300"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="mb-6">
                <label className="block text-slate-300 font-medium mb-3">
                  Playlist Name
                </label>
                <input
                  type="text"
                  value={newPlaylistName}
                  onChange={(e) => setNewPlaylistName(e.target.value)}
                  className="w-full px-4 py-4 bg-slate-700/50 border border-slate-600/30 rounded-2xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50 transition-all duration-300"
                  placeholder="My Awesome Study Plan"
                />
              </div>
              <div className="flex justify-end gap-4">
                <button
                  onClick={() => setShowPlaylistModal(false)}
                  className="px-6 py-3 bg-slate-700/50 hover:bg-slate-600/50 text-white font-medium rounded-xl border border-slate-600/30 hover:border-slate-500/30 transition-all duration-300"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreatePlaylist}
                  disabled={playlistLoading || !newPlaylistName.trim()}
                  className="px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold rounded-xl shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {playlistLoading ? (
                    <>
                      <svg
                        className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Creating...
                    </>
                  ) : (
                    "Create Playlist"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add to Playlist Modal */}
      {showAddToPlaylistModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-6">
          <div className="relative w-full max-w-md">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-3xl blur-xl"></div>
            <div className="relative bg-gradient-to-br from-slate-800/90 to-slate-700/90 backdrop-blur-xl border border-slate-600/50 rounded-3xl p-8 shadow-2xl">
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-purple-500/20 border border-purple-500/30">
                    <ListPlus className="w-6 h-6 text-purple-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-white">
                    Add to Playlist</h3>
                </div>
                <button
                  onClick={() => setShowAddToPlaylistModal(false)}
                  className="p-2 rounded-xl bg-slate-700/50 hover:bg-slate-600/50 text-slate-400 hover:text-white border border-slate-600/30 hover:border-slate-500/30 transition-all duration-300"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              {playlists.length === 0 ? (
                <div className="text-center py-8">
                  <div className="p-4 rounded-xl bg-slate-700/30 border border-slate-600/30 w-fit mx-auto mb-4">
                    <Folder className="w-8 h-8 text-slate-400" />
                  </div>
                  <p className="text-slate-400 mb-4">
                    You don't have any playlists yet.
                  </p>
                  <button
                    onClick={() => {
                      setShowAddToPlaylistModal(false);
                      setShowPlaylistModal(true);
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-medium rounded-xl shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 transition-all duration-300 mx-auto"
                  >
                    <FolderPlus className="w-4 h-4" />
                    Create First Playlist
                  </button>
                </div>
              ) : (
                <div className="space-y-3 max-h-60 overflow-y-auto">
                  {playlists.map((playlist) => (
                    <button
                      key={playlist._id}
                      onClick={() => handleAddToPlaylist(playlist._id)}
                      disabled={addingToPlaylist}
                      className="w-full flex items-center justify-between p-4 bg-slate-700/50 hover:bg-slate-600/50 border border-slate-600/30 hover:border-purple-500/30 rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-purple-500/10 border border-purple-500/20 group-hover:bg-purple-500/20">
                          <List className="w-4 h-4 text-purple-400" />
                        </div>
                        <div className="text-left">
                          <div className="text-white font-medium group-hover:text-purple-400 transition-colors">
                            {playlist.name}
                          </div>
                          <div className="text-slate-400 text-sm">
                            {playlist.problems?.length || 0} problems
                          </div>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-purple-400 transition-colors" />
                    </button>
                  ))}
                </div>
              )}

              <div className="flex justify-end gap-4 mt-6 pt-6 border-t border-slate-600/30">
                <button
                  onClick={() => setShowAddToPlaylistModal(false)}
                  className="px-6 py-3 bg-slate-700/50 hover:bg-slate-600/50 text-white font-medium rounded-xl border border-slate-600/30 hover:border-slate-500/30 transition-all duration-300"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    setShowAddToPlaylistModal(false);
                    setShowPlaylistModal(true);
                  }}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-semibold rounded-xl shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 transition-all duration-300 transform hover:scale-105"
                >
                  <FolderPlus className="w-4 h-4" />
                  New Playlist
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Error Display for Solved Problems */}
      {solvedProblemsError && (
        <div className="fixed bottom-6 right-6 p-4 bg-red-500/90 backdrop-blur-sm border border-red-400/30 rounded-xl text-white shadow-lg z-50">
          <div className="flex items-center gap-2 mb-2">
            <X className="w-4 h-4" />
            <span className="font-medium">Error Loading Solved Problems</span>
          </div>
          <p className="text-sm text-red-100">{solvedProblemsError}</p>
          <button
            onClick={() => dispatch(fetchSolvedProblems())}
            className="mt-2 px-3 py-1 bg-red-400/20 hover:bg-red-400/30 rounded-lg text-sm transition-colors"
          >
            Retry
          </button>
        </div>
      )}

      {/* Toast Container */}
      <ToastContainer
        position="bottom-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
        toastClassName="bg-slate-800 border border-slate-700"
      />

      {/* Custom Styles */}
      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fadeInUp {
          animation: fadeInUp 0.6s ease-out forwards;
        }

        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .line-clamp-3 {
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        /* Custom scrollbar for playlist modal */
        .overflow-y-auto::-webkit-scrollbar {
          width: 6px;
        }

        .overflow-y-auto::-webkit-scrollbar-track {
          background: rgba(71, 85, 105, 0.2);
          border-radius: 3px;
        }

        .overflow-y-auto::-webkit-scrollbar-thumb {
          background: rgba(251, 146, 60, 0.5);
          border-radius: 3px;
        }

        .overflow-y-auto::-webkit-scrollbar-thumb:hover {
          background: rgba(251, 146, 60, 0.7);
        }

        /* Loading animation for buttons */
        .animate-spin {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        /* Backdrop blur support */
        .backdrop-blur-sm {
          backdrop-filter: blur(4px);
        }

        .backdrop-blur-xl {
          backdrop-filter: blur(24px);
        }

        /* Gradient text support */
        .bg-clip-text {
          -webkit-background-clip: text;
          background-clip: text;
        }

        /* Shadow effects */
        .shadow-2xl {
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
        }

        /* Transform and transition support */
        .transform {
          transform: translateX(0) translateY(0) rotate(0) skewX(0) skewY(0) scaleX(1) scaleY(1);
        }

        .transition-all {
          transition-property: all;
          transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
        }

        .duration-300 {
          transition-duration: 300ms;
        }

        .duration-500 {
          transition-duration: 500ms;
        }

        /* Hover effects */
        .hover\:scale-105:hover {
          transform: scale(1.05);
        }

        /* Focus effects */
        .focus\:ring-2:focus {
          outline: 2px solid transparent;
          outline-offset: 2px;
          box-shadow: 0 0 0 2px rgba(251, 146, 60, 0.5);
        }

        .focus\:border-orange-500\/50:focus {
          border-color: rgba(251, 146, 60, 0.5);
        }
      `}</style>
    </>
  );
};

export default Problem;
