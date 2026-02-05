import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import HandTracker from '@/components/HandTracker';
import GuineaPigSlider from '@/components/GuineaPigSlider';
import { Button } from '@/components/ui/button';
import { Camera, Mouse } from 'lucide-react';

const Index = () => {
  const [useHandTracking, setUseHandTracking] = useState(false);
  const [handPosition, setHandPosition] = useState<{ x: number; y: number; isGrabbing: boolean } | null>(null);
  const [hasEntered, setHasEntered] = useState(false);
  const [showModeSelection, setShowModeSelection] = useState(true);

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
        className="min-h-screen gradient-warm flex items-center justify-center p-8"
      >
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
            荷兰猪乐园
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="text-lg text-muted-foreground mb-8"
          >
            欢迎来到最可爱的荷兰猪世界！
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
              再玩一次 🎉
            </Button>
          </motion.div>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="min-h-screen gradient-sunset flex flex-col items-center justify-center p-4 md:p-8 overflow-hidden">
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
              荷兰猪乐园
            </motion.h1>
            <motion.p
              className="text-lg md:text-xl text-muted-foreground mb-12"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              选择你的互动方式
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
                    手势互动
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    用手隔空抓取荷兰猪
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
                    鼠标/触屏
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    点击拖动荷兰猪
                  </p>
                </div>
              </motion.button>
            </motion.div>
          </motion.div>
        ) : (
          <motion.div
            key="slider"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="w-full max-w-4xl z-10"
          >
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-center mb-8 md:mb-12"
            >
              <h1 className="text-3xl md:text-5xl font-display font-bold text-foreground mb-2">
                抓住你的荷兰猪！
              </h1>
              <p className="text-muted-foreground">
                {useHandTracking 
                  ? '将手伸到摄像头前，抓住任意一只往右拖'
                  : '点击任意一只荷兰猪往右拖动'
                }
              </p>
            </motion.div>

            <GuineaPigSlider
              onComplete={handleComplete}
              handPosition={handPosition}
              useHandTracking={useHandTracking}
            />

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="mt-8 text-center"
            >
              <button
                onClick={() => setShowModeSelection(true)}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors underline underline-offset-4"
              >
                切换互动模式
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hand tracker camera view */}
      <HandTracker
        onHandMove={handleHandMove}
        enabled={useHandTracking && !showModeSelection}
      />
    </div>
  );
};

export default Index;
