import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Import all guinea pig images
import guineaPig1 from '@/assets/guinea-pig-1.png';
import guineaPig2 from '@/assets/guinea-pig-2.png';
import guineaPig3 from '@/assets/guinea-pig-3.png';
import guineaPig4 from '@/assets/guinea-pig-4.png';
import guineaPig5 from '@/assets/guinea-pig-5.png';
import guineaPig6 from '@/assets/guinea-pig-6.png';

const guineaPigImages = [guineaPig1, guineaPig2, guineaPig3, guineaPig4, guineaPig5, guineaPig6];

const names = ['Patches', 'Sunny', 'Smokey', 'Cream', 'Coco', 'Snowball'];

const fruits = [
  { emoji: '🥕', name: 'Carrot' },
  { emoji: '🥬', name: 'Lettuce' },
  { emoji: '🍎', name: 'Apple' },
  { emoji: '🍓', name: 'Strawberry' },
  { emoji: '🥒', name: 'Cucumber' },
  { emoji: '🌽', name: 'Corn' },
  { emoji: '🍇', name: 'Grapes' },
  { emoji: '🍌', name: 'Banana' },
];

interface GuineaPig {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  image: string;
  name: string;
}

interface FruitPosition {
  id: number;
  x: number;
  y: number;
  emoji: string;
  name: string;
}

interface FlyingGuineaPigGameProps {
  onComplete: () => void;
  handPosition: { x: number; y: number; isGrabbing: boolean } | null;
  useHandTracking: boolean;
}

const FlyingGuineaPigGame = ({ onComplete, handPosition, useHandTracking }: FlyingGuineaPigGameProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number>();
  const lastHandGrabRef = useRef(false);
  
  const [guineaPigs, setGuineaPigs] = useState<GuineaPig[]>([]);
  const [fruitPositions, setFruitPositions] = useState<FruitPosition[]>([]);
  const [selectedPig, setSelectedPig] = useState<number | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [dragPosition, setDragPosition] = useState({ x: 0, y: 0 });
  const [showComplete, setShowComplete] = useState(false);
  const [feedingInfo, setFeedingInfo] = useState<{ pigName: string; fruitName: string } | null>(null);

  // Initialize positions
  useEffect(() => {
    if (!containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const padding = 100;
    
    // Initialize guinea pigs at random positions with random velocities
    const pigs: GuineaPig[] = guineaPigImages.map((image, index) => ({
      id: index,
      x: padding + Math.random() * (rect.width - padding * 2 - 80),
      y: padding + Math.random() * (rect.height - padding * 2 - 80),
      vx: (Math.random() - 0.5) * 3,
      vy: (Math.random() - 0.5) * 3,
      image,
      name: names[index],
    }));
    setGuineaPigs(pigs);
    
    // Initialize fruit positions around the edges
    const fruitCount = 6;
    const fruitPos: FruitPosition[] = [];
    for (let i = 0; i < fruitCount; i++) {
      const fruit = fruits[i % fruits.length];
      fruitPos.push({
        id: i,
        x: 50 + Math.random() * (rect.width - 150),
        y: 50 + Math.random() * (rect.height - 150),
        emoji: fruit.emoji,
        name: fruit.name,
      });
    }
    setFruitPositions(fruitPos);
  }, []);

  // Animate guinea pigs flying around
  useEffect(() => {
    if (!containerRef.current || guineaPigs.length === 0) return;
    
    const animate = () => {
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;
      
      setGuineaPigs(prev => prev.map(pig => {
        if (pig.id === selectedPig) return pig; // Don't move selected pig
        
        let { x, y, vx, vy } = pig;
        
        // Update position
        x += vx;
        y += vy;
        
        // Bounce off walls
        const pigSize = 80;
        if (x < 0 || x > rect.width - pigSize) {
          vx = -vx * 0.9;
          x = Math.max(0, Math.min(rect.width - pigSize, x));
        }
        if (y < 0 || y > rect.height - pigSize) {
          vy = -vy * 0.9;
          y = Math.max(0, Math.min(rect.height - pigSize, y));
        }
        
        // Add slight random movement
        vx += (Math.random() - 0.5) * 0.2;
        vy += (Math.random() - 0.5) * 0.2;
        
        // Limit velocity
        const maxSpeed = 4;
        const speed = Math.sqrt(vx * vx + vy * vy);
        if (speed > maxSpeed) {
          vx = (vx / speed) * maxSpeed;
          vy = (vy / speed) * maxSpeed;
        }
        
        return { ...pig, x, y, vx, vy };
      }));
      
      animationRef.current = requestAnimationFrame(animate);
    };
    
    animationRef.current = requestAnimationFrame(animate);
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [guineaPigs.length, selectedPig]);

  // Check if pig is near any fruit
  const checkFruitCollision = useCallback((pigX: number, pigY: number) => {
    const pigSize = 80;
    const fruitSize = 60;
    const threshold = 60;
    
    for (const fruit of fruitPositions) {
      const dx = (pigX + pigSize / 2) - (fruit.x + fruitSize / 2);
      const dy = (pigY + pigSize / 2) - (fruit.y + fruitSize / 2);
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance < threshold) {
        return fruit;
      }
    }
    return null;
  }, [fruitPositions]);

  // Handle hand tracking
  useEffect(() => {
    if (!useHandTracking || !handPosition || !containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const localX = handPosition.x - rect.left;
    const localY = handPosition.y - rect.top;
    
    // Detect grab start
    if (handPosition.isGrabbing && !lastHandGrabRef.current) {
      // Find pig under hand
      for (const pig of guineaPigs) {
        if (
          localX >= pig.x && localX <= pig.x + 80 &&
          localY >= pig.y && localY <= pig.y + 80
        ) {
          setSelectedPig(pig.id);
          setDragOffset({ x: localX - pig.x, y: localY - pig.y });
          setDragPosition({ x: pig.x, y: pig.y });
          break;
        }
      }
    }
    
    // Handle dragging
    if (selectedPig !== null && handPosition.isGrabbing) {
      const newX = localX - dragOffset.x;
      const newY = localY - dragOffset.y;
      setDragPosition({ x: newX, y: newY });
      
      // Update pig position
      setGuineaPigs(prev => prev.map(pig => 
        pig.id === selectedPig ? { ...pig, x: newX, y: newY, vx: 0, vy: 0 } : pig
      ));
    }
    
    // Detect release
    if (!handPosition.isGrabbing && lastHandGrabRef.current && selectedPig !== null) {
      const pig = guineaPigs.find(p => p.id === selectedPig);
      if (pig) {
        const nearFruit = checkFruitCollision(pig.x, pig.y);
        if (nearFruit) {
          setFeedingInfo({ pigName: pig.name, fruitName: nearFruit.name });
          setShowComplete(true);
          setTimeout(() => onComplete(), 1500);
        }
      }
      setSelectedPig(null);
    }
    
    lastHandGrabRef.current = handPosition.isGrabbing;
  }, [handPosition, useHandTracking, guineaPigs, selectedPig, dragOffset, checkFruitCollision, onComplete]);

  // Mouse/Touch handlers
  const handleMouseDown = useCallback((pigId: number, e: React.MouseEvent | React.TouchEvent) => {
    if (useHandTracking) return;
    e.preventDefault();
    
    const pig = guineaPigs.find(p => p.id === pigId);
    if (!pig || !containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    
    setSelectedPig(pigId);
    setDragOffset({ x: clientX - rect.left - pig.x, y: clientY - rect.top - pig.y });
    setDragPosition({ x: pig.x, y: pig.y });
  }, [useHandTracking, guineaPigs]);

  const handleMouseMove = useCallback((e: MouseEvent | TouchEvent) => {
    if (selectedPig === null || !containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    
    const newX = clientX - rect.left - dragOffset.x;
    const newY = clientY - rect.top - dragOffset.y;
    
    setDragPosition({ x: newX, y: newY });
    setGuineaPigs(prev => prev.map(pig => 
      pig.id === selectedPig ? { ...pig, x: newX, y: newY, vx: 0, vy: 0 } : pig
    ));
  }, [selectedPig, dragOffset]);

  const handleMouseUp = useCallback(() => {
    if (selectedPig === null) return;
    
    const pig = guineaPigs.find(p => p.id === selectedPig);
    if (pig) {
      const nearFruit = checkFruitCollision(pig.x, pig.y);
      if (nearFruit) {
        setFeedingInfo({ pigName: pig.name, fruitName: nearFruit.name });
        setShowComplete(true);
        setTimeout(() => onComplete(), 1500);
      }
    }
    setSelectedPig(null);
  }, [selectedPig, guineaPigs, checkFruitCollision, onComplete]);

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
    <div 
      ref={containerRef}
      className="relative w-full h-[70vh] bg-gradient-to-b from-muted/30 to-muted/10 rounded-3xl overflow-hidden border border-border/50"
    >
      {/* Fruit targets */}
      {fruitPositions.map((fruit) => (
        <motion.div
          key={fruit.id}
          className="absolute select-none"
          style={{ left: fruit.x, top: fruit.y }}
          animate={{ 
            scale: [1, 1.1, 1],
            rotate: [0, 5, -5, 0],
          }}
          transition={{ 
            duration: 2 + Math.random(),
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          <div className="text-5xl md:text-6xl filter drop-shadow-lg">
            {fruit.emoji}
          </div>
        </motion.div>
      ))}

      {/* Guinea pigs */}
      {guineaPigs.map((pig) => (
        <motion.div
          key={pig.id}
          className={`absolute select-none ${useHandTracking ? '' : 'cursor-grab active:cursor-grabbing'}`}
          style={{ 
            left: pig.x, 
            top: pig.y,
            zIndex: selectedPig === pig.id ? 50 : 10,
          }}
          animate={selectedPig === pig.id ? {} : {
            rotate: [pig.vx > 0 ? 2 : -2, pig.vx > 0 ? -2 : 2],
          }}
          transition={{ 
            duration: 0.5,
            repeat: Infinity,
            repeatType: 'reverse',
          }}
          onMouseDown={(e) => handleMouseDown(pig.id, e)}
          onTouchStart={(e) => handleMouseDown(pig.id, e)}
        >
          <motion.img
            src={pig.image}
            alt={pig.name}
            className="w-16 h-16 md:w-20 md:h-20 object-contain filter drop-shadow-md"
            style={{ transform: pig.vx < 0 ? 'scaleX(-1)' : 'scaleX(1)' }}
            whileHover={!useHandTracking ? { scale: 1.1 } : {}}
            animate={selectedPig === pig.id ? { scale: 1.15 } : {}}
          />
          {/* Name tooltip on hover/grab */}
          <AnimatePresence>
            {selectedPig === pig.id && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute -top-8 left-1/2 -translate-x-1/2 bg-card px-2 py-1 rounded-full text-xs font-medium text-foreground shadow-soft whitespace-nowrap"
              >
                {pig.name}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      ))}

      {/* Hand cursor */}
      {useHandTracking && handPosition && (
        <motion.div
          className="fixed pointer-events-none z-50"
          style={{
            left: handPosition.x,
            top: handPosition.y,
            transform: 'translate(-50%, -50%)',
          }}
          animate={{
            scale: handPosition.isGrabbing ? 0.8 : 1,
          }}
        >
          <div className="text-4xl">
            {handPosition.isGrabbing ? '✊' : '🖐️'}
          </div>
        </motion.div>
      )}

      {/* Completion overlay */}
      <AnimatePresence>
        {showComplete && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50"
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
                🐹❤️{feedingInfo ? fruits.find(f => f.name === feedingInfo.fruitName)?.emoji : '🥕'}
              </motion.div>
              <h2 className="text-2xl font-display font-bold text-foreground">
                {feedingInfo ? `${feedingInfo.pigName} loves ${feedingInfo.fruitName}!` : 'Yummy!'}
              </h2>
              <p className="text-muted-foreground mt-2">Welcome to GuineaDay!</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Instructions overlay */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-card/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-soft">
        <p className="text-sm text-muted-foreground">
          {useHandTracking 
            ? '👋 Grab a guinea pig and drop it on any food!' 
            : '👆 Drag a guinea pig to any food to enter!'}
        </p>
      </div>
    </div>
  );
};

export default FlyingGuineaPigGame;
