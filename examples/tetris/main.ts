import { button, div, effect, render, signal, Signal } from 'tacit-dom';
import styles from './styles.module.css';

// Global type declarations for chiptune libraries
declare global {
  let libopenmpt: any;
  let Module: any;
}

// Game constants
const BOARD_WIDTH = 10;
const BOARD_HEIGHT = 20;
const INITIAL_DROP_INTERVAL = 1000; // 1 second
const SOFT_DROP_INTERVAL = 50; // 50ms for rapid falling
const SPEED_UP_FACTOR = 0.95;
const LINES_PER_LEVEL = 10;

// Tetromino shapes (classic NES Tetris)
const TETROMINOS = {
  I: [[1, 1, 1, 1]],
  O: [
    [1, 1],
    [1, 1],
  ],
  T: [
    [0, 1, 0],
    [1, 1, 1],
  ],
  S: [
    [0, 1, 1],
    [1, 1, 0],
  ],
  Z: [
    [1, 1, 0],
    [0, 1, 1],
  ],
  J: [
    [1, 0, 0],
    [1, 1, 1],
  ],
  L: [
    [0, 0, 1],
    [1, 1, 1],
  ],
};

// Level-based color variations (classic NES color cycling)

// Level-based color variations (classic NES color cycling)
const LEVEL_COLOR_VARIATIONS = [
  // Level 1-3: Original colors
  { I: '#00ffff', O: '#ffff00', T: '#00ff00', S: '#00ff00', Z: '#ff8000', J: '#0000ff', L: '#800080' },
  // Level 4-6: Slightly different shades
  { I: '#00cccc', O: '#cccc00', T: '#00cc00', S: '#00cc00', Z: '#cc6600', J: '#0000cc', L: '#660066' },
  // Level 7-9: More variations
  { I: '#009999', O: '#999900', T: '#009900', S: '#009900', Z: '#994400', J: '#000099', L: '#440044' },
  // Level 10+: Final color scheme
  { I: '#006666', O: '#666600', T: '#006600', S: '#006600', Z: '#662200', J: '#000066', L: '#220022' },
];

// Function to get tetromino color based on current level
function getTetrominoColor(type: TetrominoType): string {
  const currentLevel = level.get();
  const colorIndex = Math.min(Math.floor((currentLevel - 1) / 3), LEVEL_COLOR_VARIATIONS.length - 1);
  return LEVEL_COLOR_VARIATIONS[colorIndex][type];
}

// Game state signals
const gameBoard = signal<number[][]>(createEmptyBoard());
const currentPiece = signal<Tetromino | null>(null);
const nextPiece = signal<Tetromino | null>(null);
const gameState = signal<'playing' | 'paused' | 'gameOver' | 'notStarted'>('notStarted');
const score = signal<number>(0);
const level = signal<number>(1);
const lines = signal<number>(0);
const dropInterval = signal<number>(INITIAL_DROP_INTERVAL);
const gameLoopId = signal<number | null>(null);
const isSoftDropping = signal<boolean>(false);
const pieceStatistics = signal<Record<TetrominoType, number>>({
  I: 0,
  O: 0,
  T: 0,
  S: 0,
  Z: 0,
  J: 0,
  L: 0,
});

// Audio system
let chiptunePlayer: any = null;
let musicBuffer: ArrayBuffer | null = null;
const musicSpeed = signal<number>(1.0);
const isMusicPlaying = signal<boolean>(false);

// Wait for chiptune libraries to be ready
function waitForChiptuneLibraries(): Promise<void> {
  return new Promise((resolve, reject) => {
    if ((window as any).chiptuneLibrariesReady === true) {
      resolve();
      return;
    }

    if ((window as any).chiptuneLibrariesReady === false) {
      reject(new Error('Chiptune libraries failed to load'));
      return;
    }

    // Wait for the custom event
    const timeout = setTimeout(() => {
      reject(new Error('Timeout waiting for chiptune libraries'));
    }, 10000); // 10 second timeout

    window.addEventListener(
      'chiptuneReady',
      () => {
        clearTimeout(timeout);
        resolve();
      },
      { once: true },
    );
  });
}

// Initialize audio system
async function initMusicPlayer() {
  try {
    console.log('Waiting for chiptune libraries to load...');
    await waitForChiptuneLibraries();
    console.log('Chiptune libraries are ready');

    // Debug: Log what's actually available
    console.log('Available globals check:');
    console.log('- typeof libopenmpt:', typeof libopenmpt);
    console.log('- typeof window.libopenmpt:', typeof (window as any).libopenmpt);
    console.log('- typeof Module:', typeof (window as any).Module);
    console.log('- window.Module:', (window as any).Module);

    // Check if libopenmpt is available (it might be global or Module)
    const hasLibopenmpt =
      typeof libopenmpt !== 'undefined' ||
      typeof (window as any).libopenmpt !== 'undefined' ||
      (typeof (window as any).Module !== 'undefined' && (window as any).Module._openmpt_module_create_from_memory);

    if (!hasLibopenmpt) {
      throw new Error('libopenmpt not loaded. Please check the HTML file includes the scripts.');
    }

    // If libopenmpt is actually Module, assign it
    if (typeof libopenmpt === 'undefined' && typeof (window as any).Module !== 'undefined') {
      (window as any).libopenmpt = (window as any).Module;
      console.log('Assigned Module to window.libopenmpt');
    }

    // Check if chiptune2.js is available
    if (!(window as any).ChiptuneJsPlayer) {
      throw new Error('Chiptune2.js not loaded. Please check the HTML file includes the scripts.');
    }

    console.log('Creating ChiptuneJsPlayer instance...');
    // Create chiptune player with proper configuration
    chiptunePlayer = new (window as any).ChiptuneJsPlayer({
      context: new (window.AudioContext || (window as any).webkitAudioContext)(),
    });
    console.log('ChiptuneJsPlayer created:', chiptunePlayer);

    // Load the XM file
    console.log('Fetching music...');
    const response = await fetch('/tightrope dancing.xm');
    if (!response.ok) {
      throw new Error(`Failed to fetch XM file: ${response.status} ${response.statusText}`);
    }
    musicBuffer = await response.arrayBuffer();
    console.log('XM file loaded, size:', musicBuffer.byteLength);

    // Validate arrayBuffer
    if (!musicBuffer || musicBuffer.byteLength === 0) {
      throw new Error('XM file is empty or invalid');
    }

    // Validate XM header
    const view = new Uint8Array(musicBuffer.slice(0, 17));
    const header = Array.from(view)
      .map((b) => String.fromCharCode(b))
      .join('');
    if (header !== 'Extended Module: ') {
      throw new Error(`Invalid XM file header: "${header}"`);
    }

    console.log('XM file validated successfully');

    // Set initial volume and speed
    chiptunePlayer.volume = 0.7;
    chiptunePlayer.playbackRate = musicSpeed.get();

    console.log('Chiptune2.js music player initialized successfully');
    console.log('Player state:', {
      volume: chiptunePlayer.volume,
      playbackRate: chiptunePlayer.playbackRate,
      readyState: chiptunePlayer.readyState,
    });
  } catch (error) {
    console.error('Failed to initialize chiptune2.js player:', error);
    // Fallback to procedural music
    createFallbackAudio();
  }
}

// Note: chiptune2.js and libopenmpt.js are now loaded directly in the HTML file

// Fallback audio functions
function playNote(frequency: number, duration: number, volume: number, audioContext: AudioContext) {
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();

  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);

  oscillator.frequency.value = frequency;
  oscillator.type = 'square';

  gainNode.gain.setValueAtTime(volume, audioContext.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);

  oscillator.start(audioContext.currentTime);
  oscillator.stop(audioContext.currentTime + duration);
}

function startProceduralMusic(
  audioContext: AudioContext,
  musicInterval: { current: number | null },
  musicSpeed: Signal<number>,
  isMusicPlaying: Signal<boolean>,
) {
  if (musicInterval.current) {
    clearInterval(musicInterval.current);
  }

  const baseTempo = 120; // BPM
  const currentSpeed = musicSpeed.get();
  const intervalMs = ((60 / baseTempo) * 1000) / currentSpeed;

  let noteIndex = 0;
  const melody = [262, 330, 392, 523, 392, 330]; // C4, E4, G4, C5, G4, E4

  musicInterval.current = window.setInterval(() => {
    if (!isMusicPlaying.get()) return;

    playNote(melody[noteIndex], 0.1, 0.3, audioContext);
    noteIndex = (noteIndex + 1) % melody.length;
  }, intervalMs);
}

// Fallback audio for testing
function createFallbackAudio() {
  console.log('Using fallback procedural music');

  let audioContext: AudioContext | null = null;
  const musicInterval: { current: number | null } = { current: null };

  try {
    audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();

    // Store the procedural music functions for use
    const fallbackStartMusic = () => {
      if (!isMusicPlaying.get()) {
        startProceduralMusic(audioContext!, musicInterval, musicSpeed, isMusicPlaying);
        isMusicPlaying.set(true);
        console.log('Fallback procedural music started');
      }
    };

    const fallbackStopMusic = () => {
      if (isMusicPlaying.get()) {
        if (musicInterval.current) {
          clearInterval(musicInterval.current);
          musicInterval.current = null;
        }
        isMusicPlaying.set(false);
        console.log('Fallback procedural music stopped');
      }
    };

    // Replace the global music functions
    (window as any).fallbackStartMusic = fallbackStartMusic;
    (window as any).fallbackStopMusic = fallbackStopMusic;

    console.log('Fallback procedural music system initialized');
  } catch (error) {
    console.error('Failed to initialize fallback audio:', error);
  }
}

// Types
type TetrominoType = keyof typeof TETROMINOS;
type Tetromino = {
  type: TetrominoType;
  shape: number[][];
  x: number;
  y: number;
  rotation: number;
};

// Utility functions
function createEmptyBoard(): number[][] {
  return Array(BOARD_HEIGHT)
    .fill(null)
    .map(() => Array(BOARD_WIDTH).fill(0));
}

function createTetromino(type: TetrominoType): Tetromino {
  return {
    type,
    shape: TETROMINOS[type],
    x: Math.floor(BOARD_WIDTH / 2) - Math.floor(TETROMINOS[type][0].length / 2),
    y: 0,
    rotation: 0,
  };
}

function getRandomTetromino(): TetrominoType {
  const types: TetrominoType[] = ['I', 'O', 'T', 'S', 'Z', 'J', 'L'];
  return types[Math.floor(Math.random() * types.length)];
}

function rotateTetromino(tetromino: Tetromino): Tetromino {
  const rotated = {
    ...tetromino,
    shape: tetromino.shape[0].map((_, i) => tetromino.shape.map((row) => row[i]).reverse()),
    rotation: (tetromino.rotation + 1) % 4,
  };
  return rotated;
}

function isValidMove(tetromino: Tetromino, board: number[][]): boolean {
  for (let y = 0; y < tetromino.shape.length; y++) {
    for (let x = 0; x < tetromino.shape[y].length; x++) {
      if (tetromino.shape[y][x]) {
        const boardX = tetromino.x + x;
        const boardY = tetromino.y + y;

        if (boardX < 0 || boardX >= BOARD_WIDTH || boardY >= BOARD_HEIGHT || (boardY >= 0 && board[boardY][boardX])) {
          return false;
        }
      }
    }
  }
  return true;
}

function placeTetromino(tetromino: Tetromino, board: number[][]): number[][] {
  const newBoard = board.map((row) => [...row]);

  for (let y = 0; y < tetromino.shape.length; y++) {
    for (let x = 0; x < tetromino.shape[y].length; x++) {
      if (tetromino.shape[y][x]) {
        const boardX = tetromino.x + x;
        const boardY = tetromino.y + y;
        if (boardY >= 0) {
          newBoard[boardY][boardX] = 1;
        }
      }
    }
  }

  return newBoard;
}

function clearLines(board: number[][]): { newBoard: number[][]; linesCleared: number } {
  let linesCleared = 0;
  const newBoard = board.filter((row) => {
    if (row.every((cell) => cell === 1)) {
      linesCleared++;
      return false;
    }
    return true;
  });

  // Add empty rows at the top
  while (newBoard.length < BOARD_HEIGHT) {
    newBoard.unshift(Array(BOARD_WIDTH).fill(0));
  }

  return { newBoard, linesCleared };
}

function moveTetromino(dx: number, dy: number): boolean {
  console.log('moveTetromino called with dx:', dx, 'dy:', dy);

  if (!currentPiece.get()) {
    console.log('No current piece');
    return false;
  }

  if (gameState.get() !== 'playing') {
    console.log('Game not playing, state:', gameState.get());
    return false;
  }

  const piece = currentPiece.get()!;
  console.log('Current piece:', piece);

  const newPiece = { ...piece, x: piece.x + dx, y: piece.y + dy };
  console.log('New piece position:', newPiece);

  if (isValidMove(newPiece, gameBoard.get())) {
    console.log('Move is valid, updating piece');
    currentPiece.set(newPiece);
    return true;
  }

  console.log('Move is not valid');
  // If moving down failed, try to place the piece
  if (dy > 0) {
    console.log('Moving down failed, placing piece');
    return placeCurrentPiece();
  }

  return false;
}

function rotateCurrentPiece(): boolean {
  if (!currentPiece.get() || gameState.get() !== 'playing') return false;

  const piece = currentPiece.get()!;
  const rotated = rotateTetromino(piece);

  if (isValidMove(rotated, gameBoard.get())) {
    currentPiece.set(rotated);
    return true;
  }

  // Try wall kicks
  const kicks = [
    { x: -1, y: 0 },
    { x: 1, y: 0 },
    { x: 0, y: -1 },
    { x: -1, y: -1 },
    { x: 1, y: -1 },
  ];

  for (const kick of kicks) {
    const kicked = { ...rotated, x: rotated.x + kick.x, y: rotated.y + kick.y };
    if (isValidMove(kicked, gameBoard.get())) {
      currentPiece.set(kicked);
      return true;
    }
  }

  return false;
}

function getBoardFillRatio(): number {
  const board = gameBoard.get();
  let occupied = 0;
  board.forEach((row) => {
    row.forEach((cell) => {
      if (cell !== 0) occupied++;
    });
  });
  return occupied / (BOARD_WIDTH * BOARD_HEIGHT);
}

function placeCurrentPiece(): boolean {
  if (!currentPiece.get()) return false;

  const piece = currentPiece.get()!;
  const newBoard = placeTetromino(piece, gameBoard.get());
  const { newBoard: clearedBoard, linesCleared } = clearLines(newBoard);

  gameBoard.set(clearedBoard);

  // Update piece statistics
  const stats = pieceStatistics.get();
  stats[piece.type]++;
  pieceStatistics.set({ ...stats });

  // Always update music speed after board changes
  updateMusicSpeed();

  if (linesCleared > 0) {
    const newLines = lines.get() + linesCleared;
    const newLevel = Math.floor(newLines / LINES_PER_LEVEL) + 1;
    const newScore = score.get() + linesCleared * 100 * newLevel;

    lines.set(newLines);
    level.set(newLevel);
    score.set(newScore);

    // Speed up the game
    if (newLevel > level.get()) {
      dropInterval.set(dropInterval.get() * SPEED_UP_FACTOR);
    }
  }

  // Check for game over
  if (!isValidMove(createTetromino(getRandomTetromino()), clearedBoard)) {
    gameState.set('gameOver');
    stopMusic();
    return false;
  }

  // Spawn new piece
  currentPiece.set(nextPiece.get());
  nextPiece.set(createTetromino(getRandomTetromino()));

  return true;
}

function dropPiece(): void {
  if (gameState.get() !== 'playing') {
    console.log('Game not playing, state:', gameState.get());
    return;
  }

  console.log('Attempting to drop piece...');
  if (!moveTetromino(0, 1)) {
    console.log('Piece cannot move down, placing it...');
    // Piece couldn't move down, game over
    if (!placeCurrentPiece()) {
      console.log('Game over!');
      gameState.set('gameOver');
      stopMusic();
    }
  }
}

function startGame(): void {
  console.log('Starting game...');
  gameBoard.set(createEmptyBoard());
  currentPiece.set(createTetromino(getRandomTetromino()));
  nextPiece.set(createTetromino(getRandomTetromino()));
  gameState.set('playing');
  score.set(0);
  level.set(1);
  lines.set(0);
  dropInterval.set(INITIAL_DROP_INTERVAL);
  pieceStatistics.set({ I: 0, O: 0, T: 0, S: 0, Z: 0, J: 0, L: 0 });
  isSoftDropping.set(false);

  console.log('Game state set to playing, current piece:', currentPiece.get());

  // Clear any existing game loop
  if (gameLoopId.get()) {
    clearTimeout(gameLoopId.get()!);
    gameLoopId.set(null);
  }

  // Start game loop
  const loop = () => {
    if (gameState.get() === 'playing') {
      console.log('Game loop iteration, dropping piece...');
      dropPiece();
      // Use soft drop interval if down key is held, otherwise use normal interval
      const currentInterval = isSoftDropping.get() ? SOFT_DROP_INTERVAL : dropInterval.get();
      const id = window.setTimeout(loop, currentInterval);
      gameLoopId.set(id);
    }
  };

  // Start the first iteration
  loop();

  // Initialize and start background music
  initMusicPlayer().then(() => {
    startMusic();
  });
}

function pauseGame(): void {
  if (gameState.get() === 'playing') {
    gameState.set('paused');
    if (gameLoopId.get()) {
      clearTimeout(gameLoopId.get()!);
      gameLoopId.set(null);
    }
    // Pause music when game is paused
    if (isMusicPlaying.get()) {
      stopMusic();
    }
  } else if (gameState.get() === 'paused') {
    gameState.set('playing');
    startGame();
    // Resume music when game resumes
    if (isMusicPlaying.get()) {
      startMusic();
    }
  }
}

// Audio control functions
function startMusic(): void {
  if (!isMusicPlaying.get() && chiptunePlayer && musicBuffer) {
    try {
      // Play the module directly
      chiptunePlayer.play(musicBuffer);
      isMusicPlaying.set(true);

      console.log('Chiptune2.js music started');
    } catch (error) {
      console.error('Failed to start chiptune2.js music:', error);
    }
  }
}

function stopMusic(): void {
  if (isMusicPlaying.get() && chiptunePlayer) {
    try {
      // Stop chiptune2.js player
      chiptunePlayer.pause();
      isMusicPlaying.set(false);

      console.log('Chiptune2.js music stopped');
    } catch (error) {
      console.error('Failed to stop chiptune2.js music:', error);
    }
  }
}

function updateMusicSpeed(): void {
  const currentLevel = level.get();
  const fillRatio = getBoardFillRatio();

  let speed = 1.0;

  // Speed up slightly with each level
  speed += (currentLevel - 1) * 0.05;

  // Speed up as board fills
  speed += fillRatio * 5;

  // Additional boost when fill is high
  if (fillRatio > 0.6) {
    speed * 2;
  }

  // Clamp speed between 0.5x and 2.0x
  speed = Math.max(0.5, Math.min(2.0, speed));

  if (speed !== musicSpeed.get()) {
    musicSpeed.set(speed);

    // Restart playback to apply new speed
    if (isMusicPlaying.get() && chiptunePlayer) {
      // chiptunePlayer.stop();
      chiptunePlayer.playbackRate = speed;
      // chiptunePlayer.play(musicBuffer);
    }

    console.log(
      `Music speed updated: ${speed.toFixed(2)}x (Level: ${currentLevel}, Fill: ${(fillRatio * 100).toFixed(0)}%)`,
    );
  }
}

// Function to create NES-style 3D block
function createNESBlock(color: string): HTMLElement {
  const block = div({
    style: {
      width: '20px',
      height: '20px',
      backgroundColor: color,
      border: '1px solid #000',
      boxSizing: 'border-box',
      position: 'relative',
      overflow: 'hidden',
    },
  });

  // Add very subtle white highlight (top-left corner) - much smaller
  block.appendChild(
    div({
      style: {
        position: 'absolute',
        top: '0',
        left: '0',
        width: '2px',
        height: '2px',
        backgroundColor: '#fff',
        border: 'none',
      },
    }),
  );

  // Add very subtle dark shading (bottom-right corner) - much smaller
  block.appendChild(
    div({
      style: {
        position: 'absolute',
        bottom: '0',
        right: '0',
        width: '2px',
        height: '2px',
        backgroundColor: '#000',
        border: 'none',
        opacity: '0.4',
      },
    }),
  );

  return block;
}

// Game board component
function GameBoard() {
  // Create a reactive board that updates when signals change
  const boardElement = div({
    className: styles.gameBoard,
    style: {
      display: 'grid',
      gridTemplateColumns: `repeat(${BOARD_WIDTH}, 20px)`,
      gridTemplateRows: `repeat(${BOARD_HEIGHT}, 20px)`,
      gap: '0px',
    },
  });

  // Use effect to update the board when signals change
  effect(() => {
    const board = gameBoard.get();
    const piece = currentPiece.get();
    const state = gameState.get();

    // Update the className based on game state
    boardElement.className = `${styles.gameBoard} ${
      state === 'gameOver' ? styles.gameOver : state === 'paused' ? styles.paused : ''
    }`;

    // Clear existing cells
    boardElement.innerHTML = '';

    // Create board cells
    for (let y = 0; y < BOARD_HEIGHT; y++) {
      for (let x = 0; x < BOARD_WIDTH; x++) {
        const isOccupied = board[y][x] === 1;
        const isCurrentPiece =
          piece &&
          y >= piece.y &&
          y < piece.y + piece.shape.length &&
          x >= piece.x &&
          x < piece.x + piece.shape[0].length &&
          piece.shape[y - piece.y]?.[x - piece.x] === 1;

        let cell: HTMLElement;

        if (isCurrentPiece) {
          cell = createNESBlock(getTetrominoColor(piece!.type));
        } else if (isOccupied) {
          cell = createNESBlock('#0066cc'); // NES blue
        } else {
          cell = div({
            style: {
              width: '20px',
              height: '20px',
              backgroundColor: '#000',
              border: '1px solid #333',
              boxSizing: 'border-box',
            },
          });
        }

        boardElement.appendChild(cell);
      }
    }
  });

  return boardElement;
}

// Next piece preview component
function NextPiece() {
  const container = div({ className: styles.nextPiece });

  effect(() => {
    const piece = nextPiece.get();

    if (!piece) {
      container.innerHTML = '';
      return;
    }

    const cells: HTMLElement[] = [];

    for (let y = 0; y < 4; y++) {
      for (let x = 0; x < 4; x++) {
        const isOccupied = piece.shape[y]?.[x] === 1;
        const cell = isOccupied
          ? createNESBlock(getTetrominoColor(piece.type))
          : div({
              style: {
                width: '100%',
                height: '100%',
                backgroundColor: '#000',
                border: 'none',
                boxSizing: 'border-box',
              },
            });
        cells.push(cell);
      }
    }

    container.innerHTML = '';
    cells.forEach((cell) => container.appendChild(cell));
  });

  return container;
}

// Statistics panel component
function StatisticsPanel() {
  const stats = pieceStatistics.get();

  const statisticsItems = Object.entries(stats).map(([type, count]) => {
    const piece = TETROMINOS[type as TetrominoType];
    const cells: HTMLElement[] = [];

    for (let y = 0; y < 4; y++) {
      for (let x = 0; x < 4; x++) {
        const isOccupied = piece[y]?.[x] === 1;
        const cell = isOccupied
          ? createSmallNESBlock(getTetrominoColor(type as TetrominoType))
          : div({
              style: {
                width: '100%',
                height: '100%',
                backgroundColor: '#000',
                border: 'none',
                boxSizing: 'border-box',
              },
            });
        cells.push(cell);
      }
    }

    const pieceShape = div({ className: styles.pieceShape }, ...cells);
    const pieceCount = div({ className: styles.pieceCount }, count.toString().padStart(3, '0'));

    return div({ className: styles.statisticsItem }, pieceShape, pieceCount);
  });

  return div(
    { className: styles.statisticsPanel },
    div({ className: styles.statisticsTitle }, 'STATISTICS'),
    ...statisticsItems,
  );
}

// Function to create small NES-style blocks for statistics
function createSmallNESBlock(color: string): HTMLElement {
  const block = div({
    style: {
      width: '100%',
      height: '100%',
      backgroundColor: color,
      border: '1px solid #000',
      boxSizing: 'border-box',
      position: 'relative',
      overflow: 'hidden',
    },
  });

  // Add very subtle white highlight - even smaller for stats
  block.appendChild(
    div({
      style: {
        position: 'absolute',
        top: '0',
        left: '0',
        width: '1px',
        height: '1px',
        backgroundColor: '#fff',
        border: 'none',
      },
    }),
  );

  return block;
}

// Start modal component
function StartModal() {
  return div(
    { className: styles.startModal },
    div({ className: styles.modalTitle }, 'TETRIS'),
    div({ className: styles.modalSubtitle }, 'Classic NES Tetris Game'),

    div(
      { className: styles.keyBindings },
      div(
        { className: styles.keyBindingGroup },
        div({ className: styles.keyBindingTitle }, 'Movement'),
        div(
          { className: styles.keyBinding },
          div({ className: styles.key }, '←'),
          div({ className: styles.keyDescription }, 'Move Left'),
        ),
        div(
          { className: styles.keyBinding },
          div({ className: styles.key }, '→'),
          div({ className: styles.keyDescription }, 'Move Right'),
        ),
        div(
          { className: styles.keyBinding },
          div({ className: styles.key }, '↓'),
          div({ className: styles.keyDescription }, 'Soft Drop (Hold for rapid falling)'),
        ),
      ),

      div(
        { className: styles.keyBindingGroup },
        div({ className: styles.keyBindingTitle }, 'Actions'),
        div(
          { className: styles.keyBinding },
          div({ className: styles.key }, '↑'),
          div({ className: styles.keyDescription }, 'Rotate'),
        ),
        div(
          { className: styles.keyBinding },
          div({ className: styles.key }, 'Z'),
          div({ className: styles.keyDescription }, 'Rotate'),
        ),
        div(
          { className: styles.keyBinding },
          div({ className: styles.key }, 'X'),
          div({ className: styles.keyDescription }, 'Rotate'),
        ),
        div(
          { className: styles.keyBinding },
          div({ className: styles.key }, 'C'),
          div({ className: styles.keyDescription }, 'Hard Drop'),
        ),
        div(
          { className: styles.keyBinding },
          div({ className: styles.key }, 'Space'),
          div({ className: styles.keyDescription }, 'Pause/Resume'),
        ),
      ),
    ),

    div({ className: styles.startPrompt }, 'Press any key to start'),
  );
}

// Game overlay component
function GameOverlay() {
  const overlayContainer = div();

  effect(() => {
    const state = gameState.get();

    if (state === 'playing' || state === 'notStarted') {
      overlayContainer.innerHTML = '';
      return;
    }

    const isPaused = state === 'paused';
    const title = isPaused ? 'PAUSED' : 'GAME OVER';
    const subtitle = isPaused ? 'Press SPACE to resume' : `Final Score: ${score.get()}`;
    const buttonText = isPaused ? 'Resume' : 'New Game';
    const buttonAction = isPaused ? pauseGame : startGame;

    overlayContainer.innerHTML = '';
    overlayContainer.appendChild(
      div(
        {
          className: `${styles.gameOverlay} ${isPaused ? styles.pauseOverlay : ''}`,
        },
        div({ className: `${styles.overlayTitle} ${isPaused ? styles.pauseTitle : ''}` }, title),
        div({ className: `${styles.overlaySubtitle} ${isPaused ? styles.pauseSubtitle : ''}` }, subtitle),
        button(
          {
            className: styles.overlayButton,
            onClick: buttonAction,
          },
          buttonText,
        ),
      ),
    );
  });

  return overlayContainer;
}

function LinesDisplay() {
  const title = div({ className: styles.linesTitle }, 'LINES');
  const value = div({ className: styles.linesValue });
  const container = div({ className: styles.linesDisplay }, title, value);

  effect(() => {
    value.textContent = lines.get().toString().padStart(3, '0');
  });

  return container;
}

function BoardLinesLabel() {
  const label = div({
    style: {
      textAlign: 'center',
      marginBottom: '10px',
      color: '#fff',
      fontSize: '16px',
      fontWeight: 'bold',
    },
  });

  effect(() => {
    label.textContent = `LINES-${lines.get().toString().padStart(3, '0')}`;
  });

  return label;
}

// Main game component
function TetrisGame() {
  // Handle keyboard input
  effect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      console.log('Key pressed:', event.code, 'Game state:', gameState.get());

      if (gameState.get() === 'gameOver') {
        if (event.code === 'Space') {
          event.preventDefault();
          startGame();
        }
        return;
      }

      if (gameState.get() === 'notStarted') {
        // Start the game when any key is pressed
        if (event.code !== 'F5' && event.code !== 'F12') {
          // Ignore function keys
          event.preventDefault();
          startGame();
        }
        return;
      }

      switch (event.code) {
        case 'ArrowLeft': {
          event.preventDefault();
          console.log('Moving left...');
          const leftResult = moveTetromino(-1, 0);
          console.log('Left move result:', leftResult);
          break;
        }
        case 'ArrowRight': {
          event.preventDefault();
          console.log('Moving right...');
          const rightResult = moveTetromino(1, 0);
          console.log('Right move result:', rightResult);
          break;
        }
        case 'ArrowDown': {
          event.preventDefault();
          console.log('Moving down...');
          const downResult = moveTetromino(0, 1);
          console.log('Down move result:', downResult);
          // Enable soft dropping for rapid falling
          isSoftDropping.set(true);
          break;
        }
        case 'ArrowUp':
        case 'KeyZ':
        case 'KeyX': {
          event.preventDefault();
          console.log('Rotating...');
          const rotateResult = rotateCurrentPiece();
          console.log('Rotate result:', rotateResult);
          break;
        }
        case 'Space': {
          event.preventDefault();
          if (gameState.get() === 'playing') {
            pauseGame();
          } else if (gameState.get() === 'paused') {
            pauseGame();
          }
          break;
        }
        case 'KeyC': {
          event.preventDefault();
          console.log('Hard drop...');
          // Hard drop
          while (moveTetromino(0, 1)) {
            // Keep dropping until it can't move
          }
          break;
        }
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      if (event.code === 'ArrowDown') {
        // Disable soft dropping when down key is released
        isSoftDropping.set(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
    };
  });

  // Don't auto-start the game - wait for user to click Start Game button
  // The game will start when the StartModal button is clicked

  return div(
    { className: styles.gameContainer },
    div(
      { className: styles.gameArea },
      div({ className: styles.aTypeButton }, div({ className: styles.aTypeText }, 'A-TYPE')),
      LinesDisplay(),
      StatisticsPanel(),
    ),
    div({ style: { position: 'relative' } }, BoardLinesLabel(), GameBoard(), GameOverlay()),
    div(
      { className: styles.infoPanel },
      div(
        { className: styles.infoBox },
        div({ className: styles.infoTitle }, 'TOP'),
        div({ className: styles.infoValue }, '010000'),
      ),
      div(
        { className: styles.infoBox },
        div({ className: styles.infoTitle }, 'SCORE'),
        div({ className: styles.infoValue }, score.get().toString().padStart(6, '0')),
      ),
      div({ className: styles.infoBox }, div({ className: styles.infoTitle }, 'NEXT'), NextPiece()),
      div(
        { className: styles.infoBox },
        div({ className: styles.infoTitle }, 'LEVEL'),
        div({ className: styles.infoValue }, level.get().toString().padStart(2, '0')),
      ),
    ),
    // Show start modal when game hasn't started yet
    (() => {
      const modalContainer = div();

      effect(() => {
        const state = gameState.get();
        modalContainer.innerHTML = '';
        if (state === 'notStarted') {
          modalContainer.appendChild(StartModal());
        }
      });

      return modalContainer;
    })(),
  );
}

// Render the game
render(TetrisGame, document.getElementById('app')!);
