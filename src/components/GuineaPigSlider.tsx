import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import guineaPigsImage from '@/assets/guinea-pigs.png';

interface GuineaPig {
  id: number;
  x: number;
  width: number;
  name: string;
}

interface GuineaPigSliderProps {
  onComplete: () => void;
  handPosition: { x: number; y: number; isGrabbing: boolean } | null;
  useHandTracking: boolean;
}

const guineaPigs: GuineaPig[] = [
  { id: 1, x: 0, width: 15, name: '花花' },
  { id: 2, x: 15, width: 13, name: '小黄' },
  { id: 3, x: 28, width: 12, name: '灰灰' },
  { id: 4, x: 40, width: 18, name: '奶茶' },
  { id: 5, x: 58, width: 16, name: '小斑' },
  { id: 6, x: 74, width: 14, name: '糯米' },
  { id: 7, x: 88, width: 12, name: '雪球' },
];

const GuineaPigSlider = ({ onComplete, handPosition, useHandTracking }: GuineaPigSliderProps) => {
  const [dragProgress, setDragProgress] = useState(0);
  const [selectedPig, setSelectedPig] = useState<number | null>(null);
  const [isGrabbed, setIsGrabbed] = useState(false);
  const [showComplete, setShowComplete] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const startXRef = useRef(0);
  const lastHandGrabRef = useRef(false);

  const threshold = 80; // 80% to complete

  // Handle completion
  useEffect(() => {
    if (dragProgress >= threshold && !showComplete) {
      setShowComplete(true);
      setTimeout(() => {
        onComplete();
      }, 800);
    }
  }, [dragProgress, threshold, onComplete, showComplete]);

  // Handle hand tracking interaction
  useEffect(() => {
    if (!useHandTracking || !handPosition || !containerRef.current) return;

    const container = containerRef.current;
    const rect = container.getBoundingClientRect();
    
    // Check if hand is within the slider area (with some padding)
    const isInArea = 
      handPosition.x >= rect.left - 100 &&
      handPosition.x <= rect.right + 100 &&
      handPosition.y >= rect.top - 100 &&
      handPosition.y <= rect.bottom + 100;

    if (!isInArea) {
      if (isGrabbed) {
        setIsGrabbed(false);
        setSelectedPig(null);
      }
      return;
    }

    // Detect grab start
    if (handPosition.isGrabbing && !lastHandGrabRef.current) {
      // Find which pig is closest to hand position
      const relativeX = (handPosition.x - rect.left) / rect.width * 100;
      
      for (const pig of guineaPigs) {
        const pigCenter = pig.x + pig.width / 2;
        if (Math.abs(relativeX - pigCenter) < pig.width) {
          setSelectedPig(pig.id);
          setIsGrabbed(true);
          startXRef.current = handPosition.x;
          break;
        }
      }
    }
    
    // Handle dragging
    if (isGrabbed && handPosition.isGrabbing && selectedPig !== null) {
      const deltaX = handPosition.x - startXRef.current;
      const progressDelta = (deltaX / rect.width) * 100;
      setDragProgress(Math.max(0, Math.min(100, progressDelta)));
    }
    
    // Detect grab release
    if (!handPosition.isGrabbing && lastHandGrabRef.current && isGrabbed) {
      if (dragProgress < threshold) {
        // Spring back
        setDragProgress(0);
      }
      setIsGrabbed(false);
      setSelectedPig(null);
    }

    lastHandGrabRef.current = handPosition.isGrabbing;
  }, [handPosition, useHandTracking, isGrabbed, selectedPig, dragProgress, threshold]);

  // Mouse/Touch handlers for fallback
  const handleMouseDown = useCallback((pigId: number, e: React.MouseEvent | React.TouchEvent) => {
    if (useHandTracking) return;
    
    e.preventDefault();
    setSelectedPig(pigId);
    setIsGrabbed(true);
    
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    startXRef.current = clientX;
  }, [useHandTracking]);

  const handleMouseMove = useCallback((e: MouseEvent | TouchEvent) => {
    if (!isGrabbed || selectedPig === null || !containerRef.current) return;
    
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const container = containerRef.current;
    const rect = container.getBoundingClientRect();
    
    const deltaX = clientX - startXRef.current;
    const progressDelta = (deltaX / rect.width) * 100;
    setDragProgress(Math.max(0, Math.min(100, progressDelta)));
  }, [isGrabbed, selectedPig]);

  const handleMouseUp = useCallback(() => {
    if (!isGrabbed) return;
    
    if (dragProgress < threshold) {
      setDragProgress(0);
    }
    setIsGrabbed(false);
    setSelectedPig(null);
  }, [isGrabbed, dragProgress, threshold]);

  useEffect(() => {
    if (!useHandTracking) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      window.addEventListener('touchmove', handleMouseMove);
      window.addEventListener('touchend', handleMouseUp);
      
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
        window.removeEventListener('touchmove', handleMouseMove);
        window.removeEventListener('touchend', handleMouseUp);
      };
    }
  }, [useHandTracking, handleMouseMove, handleMouseUp]);

  return (
    <div className="relative w-full max-w-4xl mx-auto px-4">
      {/* Progress track */}
      <div className="relative mb-8">
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-primary to-accent rounded-full"
            style={{ width: `${dragProgress}%` }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          />
        </div>
        
        {/* Threshold marker */}
        <div 
          className="absolute top-0 w-1 h-4 bg-primary/50 rounded-full transform -translate-x-1/2 -translate-y-1"
          style={{ left: `${threshold}%` }}
        />
      </div>

      {/* Guinea pigs container */}
      <div
        ref={containerRef}
        className="relative h-32 md:h-40 select-none"
      >
        <motion.div
          className="absolute inset-0 flex items-center"
          animate={{ x: `${dragProgress * 0.5}%` }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        >
          <img
            src={guineaPigsImage}
            alt="可爱的荷兰猪们"
            className="h-full w-auto object-contain"
            draggable={false}
          />
        </motion.div>

        {/* Invisible interaction zones for each guinea pig */}
        {!useHandTracking && guineaPigs.map((pig) => (
          <div
            key={pig.id}
            className="absolute top-0 h-full cursor-grab active:cursor-grabbing"
            style={{
              left: `${pig.x}%`,
              width: `${pig.width}%`,
            }}
            onMouseDown={(e) => handleMouseDown(pig.id, e)}
            onTouchStart={(e) => handleMouseDown(pig.id, e)}
          >
            {/* Hover indicator */}
            <motion.div
              className="absolute inset-0 bg-primary/10 rounded-2xl opacity-0 hover:opacity-100 transition-opacity"
              whileHover={{ scale: 1.05 }}
            />
          </div>
        ))}

        {/* Selected pig indicator */}
        <AnimatePresence>
          {selectedPig !== null && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-card px-3 py-1 rounded-full shadow-soft text-sm font-medium text-foreground"
            >
              抓住了 {guineaPigs.find(p => p.id === selectedPig)?.name}！
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Instructions */}
      <motion.p
        className="text-center mt-6 text-muted-foreground text-sm md:text-base"
        animate={{ opacity: isGrabbed ? 0.5 : 1 }}
      >
        {useHandTracking 
          ? '👋 用手抓住任意一只荷兰猪，往右拖动进入' 
          : '👆 点击并拖动任意一只荷兰猪往右滑动进入'
        }
      </motion.p>

      {/* Completion overlay */}
      <AnimatePresence>
        {showComplete && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              className="text-center"
            >
              <motion.div
                animate={{ rotate: [0, -10, 10, -10, 10, 0] }}
                transition={{ duration: 0.5 }}
                className="text-6xl mb-4"
              >
                🐹
              </motion.div>
              <h2 className="text-2xl font-display font-bold text-foreground">
                欢迎来到荷兰猪乐园！
              </h2>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hand cursor indicator when using hand tracking */}
      {useHandTracking && handPosition && (
        <motion.div
          className="fixed pointer-events-none z-40"
          style={{
            left: handPosition.x,
            top: handPosition.y,
            transform: 'translate(-50%, -50%)',
          }}
          animate={{
            scale: handPosition.isGrabbing ? 0.8 : 1,
            opacity: handPosition.isGrabbing ? 1 : 0.7,
          }}
        >
          <div className={`text-4xl transition-transform ${handPosition.isGrabbing ? 'scale-90' : ''}`}>
            {handPosition.isGrabbing ? '✊' : '🖐️'}
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default GuineaPigSlider;
