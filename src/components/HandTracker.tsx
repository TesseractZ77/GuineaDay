import { useEffect, useRef, useState, useCallback } from 'react';

interface HandPosition {
  x: number;
  y: number;
  isGrabbing: boolean;
}

interface HandTrackerProps {
  onHandMove: (position: HandPosition | null) => void;
  enabled: boolean;
}

declare global {
  interface Window {
    Hands: any;
    Camera: any;
    drawConnectors: any;
    drawLandmarks: any;
    HAND_CONNECTIONS: any;
  }
}

const HandTracker = ({ onHandMove, enabled }: HandTrackerProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const handsRef = useRef<any>(null);
  const cameraRef = useRef<any>(null);

  const isGrabbing = useCallback((landmarks: any[]): boolean => {
    if (!landmarks || landmarks.length < 21) return false;
    
    // Check if fingers are curled (grabbing gesture)
    // Compare fingertip y position with finger base
    const thumbTip = landmarks[4];
    const indexTip = landmarks[8];
    const middleTip = landmarks[12];
    const ringTip = landmarks[16];
    const pinkyTip = landmarks[20];
    
    const indexBase = landmarks[5];
    const middleBase = landmarks[9];
    const ringBase = landmarks[13];
    const pinkyBase = landmarks[17];
    
    // If fingertips are below (higher y value) their bases, fingers are curled
    const indexCurled = indexTip.y > indexBase.y - 0.05;
    const middleCurled = middleTip.y > middleBase.y - 0.05;
    const ringCurled = ringTip.y > ringBase.y - 0.05;
    const pinkyCurled = pinkyTip.y > pinkyBase.y - 0.05;
    
    // At least 3 fingers should be curled for a grab
    const curledCount = [indexCurled, middleCurled, ringCurled, pinkyCurled].filter(Boolean).length;
    return curledCount >= 2;
  }, []);

  useEffect(() => {
    if (!enabled) {
      onHandMove(null);
      return;
    }

    let mounted = true;

    const loadScripts = async () => {
      // Load MediaPipe scripts
      const scripts = [
        'https://cdn.jsdelivr.net/npm/@mediapipe/hands/hands.js',
        'https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js',
        'https://cdn.jsdelivr.net/npm/@mediapipe/drawing_utils/drawing_utils.js',
      ];

      for (const src of scripts) {
        if (!document.querySelector(`script[src="${src}"]`)) {
          await new Promise<void>((resolve, reject) => {
            const script = document.createElement('script');
            script.src = src;
            script.crossOrigin = 'anonymous';
            script.onload = () => resolve();
            script.onerror = () => reject(new Error(`Failed to load ${src}`));
            document.head.appendChild(script);
          });
        }
      }
    };

    const initializeHands = async () => {
      try {
        setIsLoading(true);
        await loadScripts();

        // Wait for scripts to be available
        await new Promise(resolve => setTimeout(resolve, 500));

        if (!mounted || !videoRef.current || !canvasRef.current) return;
        if (!window.Hands || !window.Camera) {
          throw new Error('MediaPipe libraries not loaded');
        }

        const hands = new window.Hands({
          locateFile: (file: string) => {
            return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
          }
        });

        hands.setOptions({
          maxNumHands: 1,
          modelComplexity: 0,
          minDetectionConfidence: 0.5,
          minTrackingConfidence: 0.5,
        });

        hands.onResults((results: any) => {
          if (!mounted) return;

          const canvas = canvasRef.current;
          const ctx = canvas?.getContext('2d');
          
          if (canvas && ctx && videoRef.current) {
            canvas.width = videoRef.current.videoWidth;
            canvas.height = videoRef.current.videoHeight;
            
            ctx.save();
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(results.image, 0, 0, canvas.width, canvas.height);
            
            if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
              const landmarks = results.multiHandLandmarks[0];
              
              // Draw hand landmarks
              if (window.drawConnectors && window.HAND_CONNECTIONS) {
                window.drawConnectors(ctx, landmarks, window.HAND_CONNECTIONS, {
                  color: 'rgba(255, 255, 255, 0.6)',
                  lineWidth: 2
                });
              }
              if (window.drawLandmarks) {
                window.drawLandmarks(ctx, landmarks, {
                  color: 'hsl(30, 60%, 50%)',
                  lineWidth: 1,
                  radius: 3
                });
              }
              
              // Get palm center (average of wrist and middle finger base)
              const palmX = (landmarks[0].x + landmarks[9].x) / 2;
              const palmY = (landmarks[0].y + landmarks[9].y) / 2;
              
              // Convert to screen coordinates (mirror x for natural interaction)
              const screenX = (1 - palmX) * window.innerWidth;
              const screenY = palmY * window.innerHeight;
              
              onHandMove({
                x: screenX,
                y: screenY,
                isGrabbing: isGrabbing(landmarks)
              });
            } else {
              onHandMove(null);
            }
            
            ctx.restore();
          }
        });

        handsRef.current = hands;

        const camera = new window.Camera(videoRef.current, {
          onFrame: async () => {
            if (handsRef.current && videoRef.current) {
              await handsRef.current.send({ image: videoRef.current });
            }
          },
          width: 640,
          height: 480,
        });

        cameraRef.current = camera;
        await camera.start();
        
        if (mounted) {
          setIsLoading(false);
        }
      } catch (err) {
        console.error('Hand tracking error:', err);
        if (mounted) {
          setError('无法启动摄像头，请检查权限设置');
          setIsLoading(false);
        }
      }
    };

    initializeHands();

    return () => {
      mounted = false;
      if (cameraRef.current) {
        cameraRef.current.stop();
      }
      if (handsRef.current) {
        handsRef.current.close();
      }
    };
  }, [enabled, onHandMove, isGrabbing]);

  if (!enabled) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="relative rounded-2xl overflow-hidden shadow-float border-2 border-primary/30 bg-card">
        <video
          ref={videoRef}
          className="hidden"
          playsInline
        />
        <canvas
          ref={canvasRef}
          className="w-48 h-36 object-cover"
          style={{ transform: 'scaleX(-1)' }}
        />
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-card/90">
            <div className="text-center">
              <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2" />
              <p className="text-xs text-muted-foreground">启动摄像头...</p>
            </div>
          </div>
        )}
        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-card/90 p-2">
            <p className="text-xs text-destructive text-center">{error}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default HandTracker;
