import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Html, Line, Stars } from "@react-three/drei";
import {
  motion,
  AnimatePresence,
  useReducedMotion as useFramerReducedMotion,
} from "framer-motion";
import {
  Activity,
  BarChart3,
  BriefcaseBusiness,
  ChevronRight,
  CircleDot,
  Globe2,
  GraduationCap,
  Layers3,
  MousePointer2,
  Pause,
  Play,
  RefreshCw,
  Rocket,
  Sparkles,
  Target,
  Trophy,
  Users,
  X,
  Zap,
} from "lucide-react";
import opportunityApi from "../../config/opportunityApi";

/* =========================================================
   PALETTE
========================================================= */

const PALETTE = [
  "#38bdf8",
  "#8b5cf6",
  "#ec4899",
  "#22c55e",
  "#facc15",
  "#fb923c",
  "#06b6d4",
  "#a855f7",
  "#10b981",
  "#f43f5e",
  "#3b82f6",
  "#e879f9",
];

const colorForIndex = (index) => PALETTE[index % PALETTE.length];

/* =========================================================
   HELPERS
========================================================= */

const formatNumber = (value) => {
  const number = Number(value || 0);

  if (number >= 1000000) {
    return `${(number / 1000000).toFixed(1)}M`;
  }

  if (number >= 1000) {
    return `${(number / 1000).toFixed(1)}K`;
  }

  return number.toLocaleString();
};

const getCategoryIcon = (type = "") => {
  const normalized = type.toLowerCase();

  if (normalized.includes("job")) return BriefcaseBusiness;
  if (normalized.includes("intern")) return GraduationCap;
  if (normalized.includes("hack")) return Trophy;
  if (normalized.includes("compet")) return Trophy;
  if (normalized.includes("scholar")) return Target;
  if (normalized.includes("fellow")) return Rocket;
  if (normalized.includes("event")) return Activity;

  return Sparkles;
};

const isLowPowerDevice = () => {
  if (typeof navigator === "undefined") return false;

  const cores = navigator.hardwareConcurrency || 4;
  const memory = navigator.deviceMemory || 4;
  const isMobile = /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent);

  return isMobile || cores <= 4 || memory <= 4;
};

/* =========================================================
   FLOATING PARTICLES
========================================================= */

const FloatingParticles = ({ count = 90 }) => {
  const pointsRef = useRef(null);

  const positions = useMemo(() => {
    const data = new Float32Array(count * 3);

    for (let i = 0; i < count * 3; i += 1) {
      data[i] = (Math.random() - 0.5) * 10;
    }

    return data;
  }, [count]);

  useFrame(({ clock }) => {
    if (!pointsRef.current) return;

    pointsRef.current.rotation.y = clock.getElapsedTime() * 0.015;
    pointsRef.current.rotation.x =
      Math.sin(clock.getElapsedTime() * 0.12) * 0.04;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={positions.length / 3}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>

      <pointsMaterial
        size={0.025}
        color="#7dd3fc"
        transparent
        opacity={0.55}
        sizeAttenuation
      />
    </points>
  );
};

/* =========================================================
   GLOBE CORE
========================================================= */

const GlobeCore = () => {
  const globeRef = useRef(null);
  const innerRef = useRef(null);

  useFrame(({ clock }) => {
    const time = clock.getElapsedTime();

    if (globeRef.current) {
      globeRef.current.rotation.y = time * 0.08;
      globeRef.current.rotation.x = Math.sin(time * 0.15) * 0.04;
    }

    if (innerRef.current) {
      innerRef.current.rotation.y = -time * 0.04;
      innerRef.current.rotation.z = time * 0.02;
    }
  });

  return (
    <group>
      {/* Outer wire globe */}
      <mesh ref={globeRef}>
        <sphereGeometry args={[2.05, 32, 32]} />

        <meshBasicMaterial
          color="#38bdf8"
          wireframe
          transparent
          opacity={0.16}
        />
      </mesh>

      {/* Inner sphere */}
      <mesh ref={innerRef}>
        <sphereGeometry args={[1.92, 32, 32]} />

        <meshBasicMaterial color="#111827" transparent opacity={0.35} />
      </mesh>

      {/* Atmospheric glow */}
      <mesh>
        <sphereGeometry args={[2.13, 32, 32]} />

        <meshBasicMaterial
          color="#6366f1"
          transparent
          opacity={0.035}
          side={2}
        />
      </mesh>
    </group>
  );
};

/* =========================================================
   CATEGORY NODE
========================================================= */

const CategoryNode = ({
  position,
  color,
  size,
  label,
  count,
  index,
  selected,
  onSelect,
}) => {
  const meshRef = useRef(null);
  const ringRef = useRef(null);
  const [hovered, setHovered] = useState(false);

  useFrame(({ clock }) => {
    const time = clock.getElapsedTime();

    if (meshRef.current) {
      const pulse =
        1 +
        Math.sin(time * 1.6 + index * 0.7) *
          (selected ? 0.14 : hovered ? 0.1 : 0.05);

      const scale = (selected ? 1.35 : hovered ? 1.18 : 1) * pulse;

      meshRef.current.scale.setScalar(size * scale);
    }

    if (ringRef.current) {
      ringRef.current.rotation.z = time * (0.8 + index * 0.03);

      ringRef.current.scale.setScalar(1 + Math.sin(time * 1.5 + index) * 0.08);
    }
  });

  return (
    <group position={position}>
      {/* Connection line */}
      <Line
        points={[
          [0, 0, 0],
          [-position[0], -position[1], -position[2]],
        ]}
        color={color}
        transparent
        opacity={selected ? 0.42 : hovered ? 0.3 : 0.11}
        lineWidth={selected ? 1.6 : 0.8}
      />

      {/* Orbit ring */}
      {(hovered || selected) && (
        <mesh ref={ringRef} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.17, 0.012, 8, 32]} />

          <meshBasicMaterial color={color} transparent opacity={0.75} />
        </mesh>
      )}

      {/* Node */}
      <mesh
        ref={meshRef}
        onPointerOver={(event) => {
          event.stopPropagation();
          setHovered(true);
        }}
        onPointerOut={() => setHovered(false)}
        onClick={(event) => {
          event.stopPropagation();
          onSelect?.(label);
        }}
      >
        <sphereGeometry args={[1, 20, 20]} />

        <meshBasicMaterial color={hovered || selected ? "#ffffff" : color} />
      </mesh>

      {/* Label */}
      <Html distanceFactor={7}>
        <motion.button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onSelect?.(label);
          }}
          animate={{
            scale: selected ? 1.08 : hovered ? 1.04 : 1,
          }}
          className={`whitespace-nowrap rounded-xl border px-2.5 py-1.5 text-[10px] backdrop-blur-xl transition-all ${
            selected
              ? "border-white/30 bg-white/15 font-semibold text-white shadow-lg"
              : hovered
                ? "border-white/20 bg-black/80 text-white"
                : "border-white/10 bg-black/55 text-white/70"
          }`}
        >
          <span className="mr-1.5 inline-block">{label}</span>

          <span className="font-bold" style={{ color }}>
            {formatNumber(count)}
          </span>
        </motion.button>
      </Html>
    </group>
  );
};

/* =========================================================
   NODE SPHERE
========================================================= */

const NodeSphere = ({ counts, selectedCategory, onSelectCategory, paused }) => {
  const groupRef = useRef(null);

  const nodes = useMemo(() => {
    const total = counts.length || 1;

    const values = counts.map((item) => Number(item.count || 0));

    const min = Math.min(...values);
    const max = Math.max(...values);

    const sizeScale = (value) => {
      if (max === min) return 0.11;

      return 0.075 + ((value - min) / (max - min)) * 0.16;
    };

    return counts.map((item, index) => {
      const phi = Math.acos(-1 + (2 * index) / total);

      const theta = Math.sqrt(total * Math.PI) * phi;

      const radius = 2.4;

      return {
        ...item,
        color: colorForIndex(index),
        size: sizeScale(Number(item.count || 0)),
        position: [
          radius * Math.cos(theta) * Math.sin(phi),

          radius * Math.sin(theta) * Math.sin(phi),

          radius * Math.cos(phi),
        ],
      };
    });
  }, [counts]);

  useFrame(({ clock }) => {
    if (!groupRef.current || paused) return;

    groupRef.current.rotation.y = clock.getElapsedTime() * 0.06;
  });

  return (
    <group ref={groupRef}>
      <GlobeCore />

      {nodes.map((node, index) => (
        <CategoryNode
          key={`${node.type}-${index}`}
          index={index}
          position={node.position}
          color={node.color}
          size={node.size}
          label={node.type}
          count={node.count}
          selected={selectedCategory === node.type}
          onSelect={onSelectCategory}
        />
      ))}
    </group>
  );
};

/* =========================================================
   LEGEND
========================================================= */

const Legend = ({ counts, selectedCategory, onSelectCategory }) => {
  const reduced = useFramerReducedMotion();

  return (
    <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
      {counts.map((item, index) => {
        const Icon = getCategoryIcon(item.type);

        const active = selectedCategory === item.type;

        return (
          <motion.button
            key={item.type}
            type="button"
            onClick={() => onSelectCategory?.(item.type)}
            initial={
              reduced
                ? undefined
                : {
                    opacity: 0,
                    y: 12,
                  }
            }
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              delay: reduced ? 0 : index * 0.045,
              duration: 0.35,
            }}
            whileHover={
              reduced
                ? undefined
                : {
                    y: -3,
                    scale: 1.015,
                  }
            }
            whileTap={
              reduced
                ? undefined
                : {
                    scale: 0.97,
                  }
            }
            className={`group flex items-center gap-2 rounded-xl border p-2.5 text-left transition-all ${
              active
                ? "border-white/25 bg-white/10 shadow-lg"
                : "border-white/[0.08] bg-white/[0.035] hover:border-white/15 hover:bg-white/[0.07]"
            }`}
          >
            <span
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
              style={{
                backgroundColor: `${colorForIndex(index)}18`,
                color: colorForIndex(index),
              }}
            >
              <Icon className="h-4 w-4" />
            </span>

            <span className="min-w-0">
              <span className="block truncate text-[11px] font-medium text-white/70 group-hover:text-white">
                {item.type}
              </span>

              <span
                className="text-[10px]"
                style={{
                  color: colorForIndex(index),
                }}
              >
                {formatNumber(item.count)} opportunities
              </span>
            </span>
          </motion.button>
        );
      })}
    </div>
  );
};

/* =========================================================
   STAT CARD
========================================================= */

const StatCard = ({ icon: Icon, label, value, description, color }) => {
  return (
    <motion.div
      whileHover={{
        y: -4,
      }}
      className="group relative overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.035] p-4 backdrop-blur-xl"
    >
      <div
        className="absolute -right-8 -top-8 h-24 w-24 rounded-full blur-3xl opacity-20 transition-opacity group-hover:opacity-40"
        style={{
          backgroundColor: color,
        }}
      />

      <div className="relative flex items-start justify-between">
        <div>
          <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-white/35">
            {label}
          </p>

          <p className="mt-1 text-xl font-bold tracking-tight text-white">
            {value}
          </p>

          <p className="mt-1 text-[10px] text-white/35">{description}</p>
        </div>

        <div
          className="flex h-9 w-9 items-center justify-center rounded-xl border"
          style={{
            color,
            borderColor: `${color}30`,
            backgroundColor: `${color}12`,
          }}
        >
          <Icon className="h-4 w-4" />
        </div>
      </div>
    </motion.div>
  );
};

/* =========================================================
   SKELETON
========================================================= */

const GlobeSkeleton = () => {
  return (
    <div className="relative overflow-hidden rounded-[30px] border border-white/10 bg-[#080d18] p-5">
      <div className="animate-pulse">
        <div className="h-5 w-48 rounded bg-white/10" />

        <div className="mt-2 h-3 w-72 rounded bg-white/[0.06]" />

        <div className="mt-6 h-[25rem] rounded-[24px] bg-white/[0.04]" />

        <div className="mt-5 grid grid-cols-2 gap-2 md:grid-cols-4">
          {Array.from({ length: 8 }).map((_, index) => (
            <div key={index} className="h-14 rounded-xl bg-white/[0.04]" />
          ))}
        </div>
      </div>
    </div>
  );
};

/* =========================================================
   MAIN COMPONENT
========================================================= */

const OpportunityGlobe3D = ({ onSelectCategory }) => {
  const [counts, setCounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reduced, setReduced] = useState(false);
  const [paused, setPaused] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [showLegend, setShowLegend] = useState(true);

  const framerReduced = useFramerReducedMotion();

  const loadCategories = async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);

      const response = await opportunityApi.get("/categories");

      setCounts(response.data?.counts || []);
    } catch (error) {
      console.error("Failed to load opportunity categories:", error);

      setCounts([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    const motionPreference = window.matchMedia?.(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    setReduced(isLowPowerDevice() || Boolean(motionPreference));

    loadCategories();
  }, []);

  const total = useMemo(
    () => counts.reduce((sum, item) => sum + Number(item.count || 0), 0),
    [counts],
  );

  const largestCategory = useMemo(() => {
    if (!counts.length) return null;

    return [...counts].sort(
      (a, b) => Number(b.count || 0) - Number(a.count || 0),
    )[0];
  }, [counts]);

  const selectedData = useMemo(
    () => counts.find((item) => item.type === selectedCategory),
    [counts, selectedCategory],
  );

  const handleSelectCategory = (category) => {
    setSelectedCategory((current) => (current === category ? null : category));

    onSelectCategory?.(category);
  };

  if (loading) {
    return <GlobeSkeleton />;
  }

  if (!counts.length) {
    return null;
  }

  /* =========================================================
     LOW POWER FALLBACK
  ========================================================= */

  if (reduced) {
    return (
      <motion.section
        initial={
          framerReduced
            ? undefined
            : {
                opacity: 0,
                y: 18,
              }
        }
        animate={{
          opacity: 1,
          y: 0,
        }}
        className="relative overflow-hidden rounded-[30px] border border-white/10 bg-[#080d18] p-5 shadow-2xl"
      >
        <div className="absolute -right-20 -top-20 h-48 w-48 rounded-full bg-cyan-500/10 blur-3xl" />

        <div className="relative flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Globe2 className="h-5 w-5 text-cyan-300" />

              <h3 className="font-semibold text-white">Opportunity Universe</h3>
            </div>

            <p className="mt-1 text-xs text-white/40">
              Explore opportunities across {counts.length} categories.
            </p>
          </div>

          <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-2.5 py-1 text-[10px] text-emerald-300">
            {formatNumber(total)} live
          </span>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatCard
            icon={Layers3}
            label="Total"
            value={formatNumber(total)}
            description="opportunities"
            color="#38bdf8"
          />

          <StatCard
            icon={Sparkles}
            label="Categories"
            value={counts.length}
            description="opportunity types"
            color="#a78bfa"
          />

          <StatCard
            icon={Trophy}
            label="Top category"
            value={largestCategory?.type || "—"}
            description="highest volume"
            color="#facc15"
          />

          <StatCard
            icon={Activity}
            label="Discovery"
            value="Live"
            description="updated platform data"
            color="#4ade80"
          />
        </div>

        <Legend
          counts={counts}
          selectedCategory={selectedCategory}
          onSelectCategory={handleSelectCategory}
        />
      </motion.section>
    );
  }

  /* =========================================================
     PREMIUM 3D EXPERIENCE
  ========================================================= */

  return (
    <motion.section
      initial={
        framerReduced
          ? undefined
          : {
              opacity: 0,
              y: 25,
              scale: 0.985,
            }
      }
      animate={{
        opacity: 1,
        y: 0,
        scale: 1,
      }}
      transition={{
        duration: 0.7,
        ease: [0.16, 1, 0.3, 1],
      }}
      className="relative isolate overflow-hidden rounded-[32px] border border-white/[0.1] bg-[#070b14] shadow-[0_30px_100px_rgba(0,0,0,0.45)]"
    >
      {/* =====================================================
          AMBIENT BACKGROUND
      ====================================================== */}

      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-32 -top-32 h-80 w-80 rounded-full bg-cyan-500/10 blur-[100px]"
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-32 top-20 h-80 w-80 rounded-full bg-violet-500/10 blur-[110px]"
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-0 left-1/3 h-64 w-64 rounded-full bg-pink-500/[0.06] blur-[100px]"
      />

      {/* =====================================================
          HEADER
      ====================================================== */}

      <div className="relative z-10 border-b border-white/[0.07] p-5 sm:p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-2">
                <motion.div
                  animate={
                    framerReduced
                      ? undefined
                      : {
                          rotate: [0, 8, -8, 0],
                          scale: [1, 1.08, 1],
                        }
                  }
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="flex h-9 w-9 items-center justify-center rounded-xl border border-cyan-400/20 bg-cyan-400/10 text-cyan-300"
                >
                  <Globe2 className="h-5 w-5" />
                </motion.div>

                <div>
                  <h2 className="text-lg font-bold tracking-tight text-white sm:text-xl">
                    Opportunity Universe
                  </h2>

                  <p className="text-[11px] text-white/35">
                    Explore the TalkSphere opportunity ecosystem
                  </p>
                </div>
              </div>

              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-2 py-1 text-[9px] font-semibold uppercase tracking-[0.15em] text-emerald-300">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
                Live
              </span>
            </div>

            <p className="mt-4 max-w-2xl text-xs leading-5 text-white/45">
              Navigate through a colorful 3D map of jobs, internships,
              hackathons, scholarships, events, fellowships and more.
            </p>
          </div>

          {/* Controls */}

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setPaused((current) => !current)}
              className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-[11px] text-white/60 transition-all hover:border-white/20 hover:bg-white/[0.08] hover:text-white"
            >
              {paused ? (
                <Play className="h-3.5 w-3.5" />
              ) : (
                <Pause className="h-3.5 w-3.5" />
              )}

              {paused ? "Resume" : "Pause"}
            </button>

            <button
              type="button"
              onClick={() => loadCategories(true)}
              disabled={refreshing}
              className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-[11px] text-white/60 transition-all hover:border-white/20 hover:bg-white/[0.08] hover:text-white disabled:opacity-50"
            >
              <RefreshCw
                className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`}
              />
              Refresh
            </button>

            <button
              type="button"
              onClick={() => setShowLegend((current) => !current)}
              className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-[11px] text-white/60 transition-all hover:border-white/20 hover:bg-white/[0.08] hover:text-white"
            >
              <Layers3 className="h-3.5 w-3.5" />
              Categories
            </button>
          </div>
        </div>
      </div>

      {/* =====================================================
          STATS
      ====================================================== */}

      <div className="relative z-10 grid grid-cols-2 gap-3 border-b border-white/[0.07] p-5 sm:grid-cols-4 sm:p-6">
        <StatCard
          icon={Layers3}
          label="Opportunities"
          value={formatNumber(total)}
          description="across the platform"
          color="#38bdf8"
        />

        <StatCard
          icon={Sparkles}
          label="Categories"
          value={counts.length}
          description="ways to discover"
          color="#a78bfa"
        />

        <StatCard
          icon={Trophy}
          label="Leading"
          value={largestCategory?.type || "—"}
          description={
            largestCategory
              ? `${formatNumber(largestCategory.count)} opportunities`
              : "no data"
          }
          color="#facc15"
        />

        <StatCard
          icon={Users}
          label="Discovery"
          value="Live"
          description="real-time ecosystem"
          color="#4ade80"
        />
      </div>

      {/* =====================================================
          3D SCENE
      ====================================================== */}

      <div className="relative z-10 p-4 sm:p-6">
        <div className="relative h-[390px] overflow-hidden rounded-[26px] border border-white/[0.08] bg-[radial-gradient(circle_at_center,rgba(56,189,248,0.08),transparent_45%),#030712] sm:h-[470px] md:h-[540px]">
          {/* HUD */}
          <div className="pointer-events-none absolute left-4 top-4 z-20 flex items-center gap-2 rounded-xl border border-white/10 bg-black/30 px-3 py-2 backdrop-blur-xl">
            <MousePointer2 className="h-3.5 w-3.5 text-cyan-300" />

            <span className="text-[10px] text-white/45">
              Drag to explore · Click a node
            </span>
          </div>

          <div className="pointer-events-none absolute right-4 top-4 z-20 flex items-center gap-2 rounded-xl border border-white/10 bg-black/30 px-3 py-2 backdrop-blur-xl">
            <Zap className="h-3.5 w-3.5 text-yellow-300" />

            <span className="text-[10px] text-white/45">
              {paused ? "Animation paused" : "Auto rotating"}
            </span>
          </div>

          <Canvas
            dpr={[1, 1.5]}
            camera={{
              position: [0, 0, 6.2],
              fov: 48,
            }}
            gl={{
              antialias: true,
              alpha: true,
            }}
          >
            <Suspense fallback={null}>
              <ambientLight intensity={0.5} />

              <Stars
                radius={8}
                depth={5}
                count={reduced ? 250 : 700}
                factor={1.5}
                saturation={0}
                fade
                speed={reduced ? 0 : 0.25}
              />

              <FloatingParticles count={reduced ? 30 : 85} />

              <NodeSphere
                counts={counts}
                selectedCategory={selectedCategory}
                onSelectCategory={handleSelectCategory}
                paused={paused}
              />

              <OrbitControls
                enableZoom={false}
                enablePan={false}
                autoRotate={!paused}
                autoRotateSpeed={0.35}
                minPolarAngle={Math.PI * 0.25}
                maxPolarAngle={Math.PI * 0.75}
              />
            </Suspense>
          </Canvas>

          {/* Bottom HUD */}
          <div className="pointer-events-none absolute bottom-4 left-4 right-4 z-20 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-black/35 px-3 py-2 backdrop-blur-xl">
              <CircleDot className="h-3.5 w-3.5 text-cyan-300" />

              <span className="text-[10px] text-white/45">
                {counts.length} active categories
              </span>
            </div>

            <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-black/35 px-3 py-2 backdrop-blur-xl">
              <BarChart3 className="h-3.5 w-3.5 text-violet-300" />

              <span className="text-[10px] text-white/45">
                {formatNumber(total)} total opportunities
              </span>
            </div>
          </div>

          {/* Selected category panel */}

          <AnimatePresence>
            {selectedData && (
              <motion.div
                initial={{
                  opacity: 0,
                  x: -20,
                  y: 10,
                }}
                animate={{
                  opacity: 1,
                  x: 0,
                  y: 0,
                }}
                exit={{
                  opacity: 0,
                  x: -20,
                  y: 10,
                }}
                className="absolute bottom-16 left-4 z-30 w-[230px] rounded-2xl border border-white/10 bg-black/65 p-4 shadow-2xl backdrop-blur-2xl"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[9px] uppercase tracking-[0.18em] text-white/30">
                      Selected category
                    </p>

                    <h3 className="mt-1 font-semibold text-white">
                      {selectedData.type}
                    </h3>
                  </div>

                  <button
                    type="button"
                    onClick={() => setSelectedCategory(null)}
                    className="rounded-lg p-1 text-white/40 transition-colors hover:bg-white/10 hover:text-white"
                    aria-label="Close category"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>

                <div className="mt-4 flex items-end justify-between">
                  <div>
                    <p className="text-2xl font-bold text-white">
                      {formatNumber(selectedData.count)}
                    </p>

                    <p className="text-[10px] text-white/35">
                      opportunities available
                    </p>
                  </div>

                  <motion.div
                    animate={
                      framerReduced
                        ? undefined
                        : {
                            scale: [1, 1.15, 1],
                          }
                    }
                    transition={{
                      duration: 1.8,
                      repeat: Infinity,
                    }}
                    className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-400/10 text-cyan-300"
                  >
                    <Rocket className="h-5 w-5" />
                  </motion.div>
                </div>

                <button
                  type="button"
                  onClick={() => onSelectCategory?.(selectedData.type)}
                  className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-white py-2 text-[11px] font-semibold text-black transition-all hover:bg-white/90"
                >
                  Explore opportunities
                  <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ===================================================
            LEGEND
        ==================================================== */}

        <AnimatePresence initial={false}>
          {showLegend && (
            <motion.div
              initial={{
                opacity: 0,
                height: 0,
              }}
              animate={{
                opacity: 1,
                height: "auto",
              }}
              exit={{
                opacity: 0,
                height: 0,
              }}
              className="overflow-hidden"
            >
              <Legend
                counts={counts}
                selectedCategory={selectedCategory}
                onSelectCategory={handleSelectCategory}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* ===================================================
            FOOTER MESSAGE
        ==================================================== */}

        <div className="mt-5 flex flex-col gap-3 rounded-2xl border border-white/[0.07] bg-white/[0.025] p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-400/10 text-violet-300">
              <Rocket className="h-4 w-4" />
            </div>

            <div>
              <p className="text-xs font-medium text-white/70">
                Your next opportunity could be here.
              </p>

              <p className="mt-0.5 text-[10px] text-white/30">
                Select a category to start exploring.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-[10px] text-white/30">
            <Activity className="h-3.5 w-3.5 text-emerald-300" />
            TalkSphere Discovery Engine
          </div>
        </div>
      </div>
    </motion.section>
  );
};

export default OpportunityGlobe3D;
