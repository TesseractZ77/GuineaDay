import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import HandTracker from '@/components/HandTracker';
import FlyingGuineaPigGame from '@/components/FlyingGuineaPigGame';
import { Button } from '@/components/ui/button';
import { Camera, Mouse, CloudSun, Calendar } from 'lucide-react';
import { useLocation } from 'react-router-dom';

const Index = () => {
  const location = useLocation();
  const [useHandTracking, setUseHandTracking] = useState(false);
  const [handPosition, setHandPosition] = useState<{ x: number; y: number; isGrabbing: boolean } | null>(null);
  const [hasEntered, setHasEntered] = useState(false);

  useEffect(() => {
    if (location.state?.fromTasks) {
      setHasEntered(true);
    }
  }, [location]);
  const [showModeSelection, setShowModeSelection] = useState(true);

  // Weather state
  const [weather, setWeather] = useState<{ temp: number; code: number } | null>(null);
  const [currentDate, setCurrentDate] = useState<string>('');

  useEffect(() => {
    // Set date
    const date = new Date();
    setCurrentDate(new Intl.DateTimeFormat('en-AU', {
      weekday: 'long',
      day: 'numeric',
      month: 'long'
    }).format(date));

    // Fetch weather (Melbourne coordinates default)
    const fetchWeather = async () => {
      try {
        const res = await fetch('https://api.open-meteo.com/v1/forecast?latitude=-37.8136&longitude=144.9631&current_weather=true');
        const data = await res.json();
        setWeather({
          temp: Math.round(data.current_weather.temperature),
          code: data.current_weather.weathercode
        });
      } catch (e) {
        console.error("Failed to fetch weather", e);
      }
    };
    fetchWeather();
  }, []);

  const getWeatherEmoji = (code: number) => {
    if (code === 0) return '☀️';
    if (code >= 1 && code <= 3) return '⛅';
    if (code >= 45 && code <= 48) return '🌫️';
    if (code >= 51 && code <= 67) return '🌧️';
    if (code >= 71 && code <= 77) return '❄️';
    if (code >= 80 && code <= 82) return '🌦️';
    if (code >= 95) return '⚡';
    return '🌡️';
  };

  const handleHandMove = useCallback((position: { x: number; y: number; isGrabbing: boolean } | null) => {
    setHandPosition(position);
  }, []);

  const handleComplete = useCallback(() => {
    setTimeout(() => {
      setHasEntered(true);
    }, 100);
  }, []);

  const selectMode = (useHand: boolean) => {
    setUseHandTracking(useHand);
    setShowModeSelection(false);
  };

  if (hasEntered) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="min-h-screen gradient-warm flex items-center justify-center p-8 relative"
      >
        {/* Date and Weather Widget */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-6 left-6 md:top-8 md:left-8 z-20 flex flex-col gap-2 pointer-events-none"
        >
          <div className="glass-card px-4 py-2 rounded-full flex items-center gap-2 shadow-sm border border-white/20">
            <Calendar className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-foreground/80">{currentDate}</span>
          </div>
          {weather && (
            <div className="glass-card px-4 py-2 rounded-full flex items-center gap-2 shadow-sm border border-white/20 w-fit">
              <span className="text-lg">{getWeatherEmoji(weather.code)}</span>
              <span className="text-sm font-medium text-foreground/80">{weather.temp}°C</span>
            </div>
          )}
        </motion.div>

        <div className="text-center max-w-2xl mx-auto">
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.2 }}
            className="text-8xl mb-8"
          >
            🐹
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-4xl md:text-5xl font-display font-bold text-foreground mb-4"
          >
            GuineaDay
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="text-lg text-muted-foreground mb-8"
          >
            Welcome to the cutest guinea pig paradise!
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
          >
            <Button
              onClick={() => {
                setHasEntered(false);
                setShowModeSelection(true);
              }}
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-8 py-6 text-lg rounded-2xl shadow-float hover:shadow-glow transition-all"
            >
              Play Again 🎉
            </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.0 }}
            className="mt-6 flex flex-col gap-4 items-center"
          >
            <Button
              variant="outline"
              onClick={() => window.location.href = '/tasks'}
              className="px-6 py-4 rounded-xl border-2 hover:bg-accent/10"
            >
              📋 Daily Tasks
            </Button>
            <Button
              variant="outline"
              onClick={() => window.location.href = '/gallery'}
              className="px-6 py-4 rounded-xl border-2 hover:bg-accent/10"
            >
              📷 Photo Gallery
            </Button>
          </motion.div>
        </div >
      </motion.div >
    );
  }

  return (
    <div className="min-h-screen gradient-sunset flex flex-col items-center justify-center p-4 md:p-8 overflow-hidden relative">
      {/* Background decorations */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <motion.div
          className="absolute top-10 left-10 text-6xl opacity-20"
          animate={{ y: [0, -10, 0], rotate: [0, 5, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        >
          🌿
        </motion.div>
        <motion.div
          className="absolute top-20 right-20 text-5xl opacity-20"
          animate={{ y: [0, -15, 0], rotate: [0, -5, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
        >
          🥕
        </motion.div>
        <motion.div
          className="absolute bottom-20 left-20 text-4xl opacity-20"
          animate={{ y: [0, -8, 0], rotate: [0, 10, 0] }}
          transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
        >
          🥬
        </motion.div>
        <motion.div
          className="absolute bottom-32 right-32 text-5xl opacity-20"
          animate={{ y: [0, -12, 0], rotate: [0, -8, 0] }}
          transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut', delay: 1.5 }}
        >
          🌾
        </motion.div>
      </div>

      {/* Mode selection */}
      <AnimatePresence mode="wait">
        {showModeSelection ? (
          <motion.div
            key="mode-selection"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="text-center z-10"
          >
            <motion.h1
              className="text-4xl md:text-6xl font-display font-bold text-foreground mb-4"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              GuineaDay
            </motion.h1>
            <motion.p
              className="text-lg md:text-xl text-muted-foreground mb-12"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              Choose your interaction mode
            </motion.p>

            <motion.div
              className="flex flex-col md:flex-row gap-4 md:gap-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <motion.button
                onClick={() => selectMode(true)}
                className="glass-card p-6 md:p-8 flex flex-col items-center gap-4 hover:shadow-glow transition-all group"
                whileHover={{ scale: 1.02, y: -4 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <Camera className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-lg text-foreground mb-1">
                    Hand Gesture
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Grab guinea pigs with your hand
                  </p>
                </div>
              </motion.button>

              <motion.button
                onClick={() => selectMode(false)}
                className="glass-card p-6 md:p-8 flex flex-col items-center gap-4 hover:shadow-glow transition-all group"
                whileHover={{ scale: 1.02, y: -4 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center group-hover:bg-accent/20 transition-colors">
                  <Mouse className="w-8 h-8 text-accent" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-lg text-foreground mb-1">
                    Mouse / Touch
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Click and drag guinea pigs
                  </p>
                </div>
              </motion.button>
            </motion.div>
          </motion.div>
        ) : (
          <motion.div
            key="game"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="w-full max-w-5xl z-10"
          >
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-center mb-6 md:mb-8"
            >
              <h1 className="text-3xl md:text-5xl font-display font-bold text-foreground mb-2">
                Feed the Guinea Pigs!
              </h1>
              <p className="text-muted-foreground">
                {useHandTracking
                  ? 'Grab any flying guinea pig and drop it on the food'
                  : 'Click and drag any guinea pig to the food'}
              </p>
            </motion.div>

            <FlyingGuineaPigGame
              onComplete={handleComplete}
              handPosition={handPosition}
              useHandTracking={useHandTracking}
            />

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="mt-6 text-center"
            >
              <button
                onClick={() => setShowModeSelection(true)}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors underline underline-offset-4"
              >
                Switch interaction mode
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hand tracker using webcam but not showing feed */}
      <HandTracker
        onHandMove={handleHandMove}
        enabled={useHandTracking && !showModeSelection}
      />
    </div>
  );
};

export default Index;
