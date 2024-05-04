'use client';
import React, { useState, useEffect } from 'react';
import { AppHero } from '../ui/ui-layout';
import dinoStationary from '/home/shubham/Downloads/dino/assets/dino-stationary.png';
import ground from '/home/shubham/Downloads/dino/assets/ground.png';
import '../../../style.css';

const SPEED_SCALE = 0.00001;
const CACTUS_SPEED = 0.05;
const CACTUS_INTERVAL_MIN = 500;
const CACTUS_INTERVAL_MAX = 2000;

let nextCactusTime = 0;






export default function DashboardFeature() {
  
  const [dino, setDino] = useState<HTMLElement | null>(null);
  const [game, setGame] = useState<HTMLElement | null>(null);
  const [scoreDisplay, setScoreDisplay] = useState<HTMLElement | null>(null);
  const [startMessage, setStartMessage] = useState<HTMLElement | null>(null);
  const [gameoverMessage, setGameoverMessage] = useState<HTMLElement | null>(null);
  const [score, setScore] = useState(0);
  const [lastTime, setLastTime] = useState<DOMHighResTimeStamp | null>(null);
  const [speedScale, setSpeedScale] = useState(1);
  const [isJumping, setIsJumping] = useState(false);
  const [dinoFrame, setDinoFrame] = useState(0);
  const [currentFrameTime, setCurrentFrameTime] = useState(0);
  const [yVelocity, setYVelocity] = useState(0);
  const [grounds, setGrounds] = useState<HTMLElement[] | null>(null);

  useEffect(() => {
    const handleKeyPress = (event:KeyboardEvent) => {
      if (event.key === ' ') {
        console.log("handle");
        startGame();
      }
    };
    if (typeof document !== 'undefined') {
    document.addEventListener('keydown', handleKeyPress);}

    return () => {
      document.removeEventListener('keydown', handleKeyPress);
    };
  }, []);

  

  useEffect(() => {
    if (typeof document !== 'undefined') {
      console.log("useEffect");
      const groundsList = Array.from(document.querySelectorAll(".ground")) as HTMLElement[];
      setDino(document.querySelector("#dino") as HTMLElement);
    setGame(document.querySelector("#game") as HTMLElement);
    setScoreDisplay(document.querySelector("#score") as HTMLElement);
    setStartMessage(document.querySelector("#start-message") as HTMLElement);
    setGameoverMessage(document.querySelector("#gameover-message") as HTMLElement);
      setGrounds(groundsList);

    }
  }, []);

  const update = (time:DOMHighResTimeStamp) => {
    if (lastTime == null) {
      setLastTime(time);
      requestAnimationFrame(update);
      return;
    }

    const delta = time - lastTime;

    updateGround(delta, speedScale);
    updateDino(delta, speedScale);
    updateCactus(delta, speedScale);
    updateSpeedScale(delta);
    updateScore(delta);

    if (checkGameOver()) return handleGameOver();

    setLastTime(time);
    requestAnimationFrame(update);
  };

  const startGame = () => {
    console.log("start");
    setLastTime(null);
    setSpeedScale(1);
    setScore(0);
    setupGround();
    setupDino();
    setupCactus();
    document.getElementById('start-message')?.classList.add('hide');
    console.log("start-message");
    document.getElementById('gameover-message')?.classList.add('hide');
    requestAnimationFrame(update);
  };

  const updateSpeedScale = (delta : number) => {
    setSpeedScale((scale) => scale + delta * SPEED_SCALE);
  };

  const updateScore = (delta : number) => {
    setScore((score) => score + delta * 0.01);
  };

  interface Rectangle {
    left: number;
    top: number;
    right: number;
    bottom: number;
  }
  
  function checkCollision(rect1: Rectangle, rect2: Rectangle): boolean {
    return (
      rect1.left < rect2.right &&
      rect1.top < rect2.bottom &&
      rect1.right > rect2.left &&
      rect1.bottom > rect2.top
    );
  }

  function checkGameOver(): boolean {
    const dinoRect = getDinoRect();
    if (!dinoRect) return false; // No collision if dinoRect is null
    return getCactusRects().some(rect => checkCollision(rect, dinoRect));
  }
  
  function handleGameOver(): void {
    setDinoLose();
    setTimeout(() => {
      document.addEventListener("keydown", startGame, { once: true });
      gameoverMessage?.classList.remove("hide");
    }, 100);
  }

  function getCustomProperty(elem: HTMLElement, prop: string): number {
    return parseFloat(getComputedStyle(elem).getPropertyValue(prop)) || 0;
  }
  
  function setCustomProperty(elem: HTMLElement, prop: string, value: string): void {
    elem.style.setProperty(prop, value);
  }
  
  function incrementCustomProperty(elem: HTMLElement, prop: string, inc: number): void {
    const currentValue = getCustomProperty(elem, prop);
    setCustomProperty(elem, prop, `${currentValue + inc}px`);
  }
  
  const GROUND_SPEED = 0.05;

  
  
  function setupGround(): void {
    if(grounds){
      setCustomProperty(grounds[0], "--left", "0");
      setCustomProperty(grounds[1], "--left", "300");
    }
    
  }
  


  // const setupGround = () => {
  //   const grounds = document.querySelectorAll('.ground');
  //   grounds.forEach((ground, index) => {
  //     const groundElement = ground as HTMLElement;
  //     groundElement.style.setProperty('--left', `${index * 300}px`);
  //   });
  // };

  function updateGround(delta: number, speedScale: number): void {
    if(grounds){
      grounds.forEach((ground: HTMLElement) => {
        incrementCustomProperty(ground, "--left", delta * speedScale * GROUND_SPEED * -1); /* moves the ground according to game speed */
    
        if (getCustomProperty(ground, "--left") <= -300) {
          incrementCustomProperty(ground, "--left", 600); /* loop the elements */
        }
      });
    }
    
  }

  
  const JUMP_SPEED = 0.45;
  const GRAVITY = 0.0015;
  const DINO_FRAME_COUNT = 2;
  const FRAME_TIME = 100;


  const setupDino = () => {
    setIsJumping(false);
    setDinoFrame(0);
    setCurrentFrameTime(0);
    setYVelocity(0);
    if (dino) {
      setCustomProperty(dino, "--bottom", "0");
    }
    document.removeEventListener('keydown', onJump);
    document.addEventListener('keydown', onJump);
  };

  

  // const updateDino = (delta: number, speedScale: number) => {
  //   if (isJumping) {
  //     return;
  //   }

  //   if (currentFrameTime >= 100) {
  //     setDinoFrame((frame) => (frame + 1) % 2);
  //     setCurrentFrameTime((time) => time - 100);
  //   }
  //   setCurrentFrameTime((time) => time + delta * speedScale);
  // };

  function updateDino(delta: number, speedScale: number): void {
    handleRun(delta, speedScale);
    handleJump(delta);
  }
  
  function getDinoRect(): DOMRect | null {
    return dino?.getBoundingClientRect() ?? null; /* get the dinosaur hitbox or return null if dino is null */
  }

  function setDinoLose(): void {
    (dino as HTMLImageElement).src = "../../../assets/dino-lose.png";
  }
  
  function handleRun(delta: number, speedScale: number): void {
    if (isJumping) {
      (dino as HTMLImageElement).src = `../../../assets/dino-stationary.png`;
      return;
    }
  
    if (currentFrameTime >= FRAME_TIME) {
      setDinoFrame((dinoFrame+1) % DINO_FRAME_COUNT);
      (dino as HTMLImageElement).src = `../../../assets/dino-run-${dinoFrame}.png`; /* switch between images to simulate movement */
      setCurrentFrameTime(currentFrameTime-FRAME_TIME)
    }
    setCurrentFrameTime(currentFrameTime+(delta*speedScale));
  }

  function handleJump(delta: number): void {
    if (!isJumping|| !dino) return;
  
    incrementCustomProperty(dino, "--bottom", yVelocity * delta);
  
    if (getCustomProperty(dino, "--bottom") <= 0) {
      setCustomProperty(dino, "--bottom", "0");
      setIsJumping(false);
    }
  
    setYVelocity(yVelocity - (GRAVITY*delta));
  }

  const onJump = (event: KeyboardEvent) => {
    if (event.code !== 'Space' || isJumping) {
      return;
    }
    setYVelocity(JUMP_SPEED);
    setIsJumping(true);
  };




  const setupCactus = () => {
    nextCactusTime = CACTUS_INTERVAL_MIN;
    const cactuses = document.querySelectorAll<HTMLElement>(".cactus");
    cactuses.forEach((cactus: HTMLElement) => {
      cactus.remove(); /* remove cactus when game restart */
    });
  };
  

  const updateCactus = (
    delta: number,
    speedScale: number
  ) => {
    const cactuses = document.querySelectorAll<HTMLElement>(".cactus");
    cactuses.forEach((cactus: HTMLElement) => {
      const left = parseFloat(getComputedStyle(cactus).getPropertyValue("--left"));
      cactus.style.setProperty("--left", `${left - delta * speedScale * CACTUS_SPEED * -1}px`);
      if (left <= -100) {
        cactus.remove(); /* remove cactus off screen so it doesn't impair game performance */
      }
    });
  
    if (nextCactusTime <= 0) {
      createCactus();
      nextCactusTime =
        randomizer(CACTUS_INTERVAL_MIN, CACTUS_INTERVAL_MAX) / speedScale;
    }
    nextCactusTime -= delta;
  };

  function getCactusRects(): DOMRect[] {
    return Array.from(document.querySelectorAll(".cactus")).map(cactus => {
      return (cactus as HTMLElement).getBoundingClientRect(); /* get the hitbox of all the cactus on the screen */
    });
  }
  

  

  const createCactus = () => {
    const cactus = document.createElement("img");
    cactus.src = "../../../assets/cactus.png";
    cactus.classList.add("cactus");
    cactus.style.setProperty("--left", "100px"); // Use style.setProperty instead of setCustomProperty
    game?.appendChild(cactus); // Use appendChild instead of append
  };

  const randomizer = (min: number, max: number) => {
    return Math.floor(Math.random() * (max - min + 1) + min); /* choose a number between minimum and maximum */
  };
  



  return (
    <div>
      <AppHero title="gm" subtitle="Chrome Dino Game" />
      <div id="game" className="game">
        <div id="score" className="score">{score}</div>
        <div id="start-message" className="start-message">Press any key to start</div>
        <img src={ground.src} alt="Ground" className="ground" />
        <img src={ground.src} alt="Ground" className="ground" />
        <img src={dinoStationary.src} alt="Dinosaur" id="dino" className="dino" />
        <div id="gameover-message" className="gameover-message hide">
          <p>Game over</p>
          <span>Press any key to restart</span>
        </div>
      </div>
    </div>
  );
}
