document.addEventListener('DOMContentLoaded', () => {
    // Configurações de Dificuldade
    const DIFFICULTIES = {
        easy: { rows: 9, cols: 9, mines: 10 },
        medium: { rows: 16, cols: 16, mines: 40 },
        hard: { rows: 16, cols: 30, mines: 99 }
    };

    // Estado do Jogo
    let currentDifficulty = 'medium';
    let rows = DIFFICULTIES.medium.rows;
    let cols = DIFFICULTIES.medium.cols;
    let mineCount = DIFFICULTIES.medium.mines;
    
    let board = []; // Matriz representando o estado de cada célula
    let firstClick = true;
    let gameOver = false;
    let timerInterval = null;
    let secondsElapsed = 0;
    let flagsPlaced = 0;
    let isFlagModeActive = false; // Modo de clique para celular (bandeira ou cavar)

    // Elementos do DOM
    const boardElement = document.getElementById('minesweeper-board');
    const difficultySelect = document.getElementById('difficulty-select');
    const customSettings = document.getElementById('custom-settings');
    const customRowsInput = document.getElementById('custom-rows');
    const customColsInput = document.getElementById('custom-cols');
    const customMinesInput = document.getElementById('custom-mines');
    const applyCustomBtn = document.getElementById('apply-custom-btn');
    
    const resetButton = document.getElementById('reset-button');
    const minesCounter = document.getElementById('mines-counter');
    const timerDisplay = document.getElementById('timer');
    
    const flagToggleBtn = document.getElementById('flag-toggle-btn');
    
    const gameOverlay = document.getElementById('game-overlay');
    const overlayTitle = document.getElementById('overlay-title');
    const overlayMessage = document.getElementById('overlay-message');
    const overlayBtn = document.getElementById('overlay-btn');

    // Inicialização do Jogo
    function initGame() {
        // Limpar temporizadores e estados
        clearInterval(timerInterval);
        timerInterval = null;
        secondsElapsed = 0;
        firstClick = true;
        gameOver = false;
        flagsPlaced = 0;
        
        timerDisplay.textContent = '000';
        resetButton.textContent = '🙂';
        gameOverlay.classList.add('hidden');
        
        // Determinar configurações com base na dificuldade selecionada
        if (currentDifficulty !== 'custom') {
            rows = DIFFICULTIES[currentDifficulty].rows;
            cols = DIFFICULTIES[currentDifficulty].cols;
            mineCount = DIFFICULTIES[currentDifficulty].mines;
        }

        updateMinesCounter();
        createBoardHTML();
    }

    // Atualizar exibição de minas restantes
    function updateMinesCounter() {
        const remaining = mineCount - flagsPlaced;
        const formatted = String(Math.max(-99, Math.min(999, remaining))).padStart(3, '0');
        minesCounter.textContent = formatted.includes('-') ? formatted : formatted;
    }

    // Criar Grid no DOM
    function createBoardHTML() {
        boardElement.innerHTML = '';
        
        // Ajustar variáveis de grade CSS diretamente no elemento do tabuleiro
        boardElement.style.gridTemplateColumns = `repeat(${cols}, 32px)`;
        boardElement.style.gridTemplateRows = `repeat(${rows}, 32px)`;
        
        if (window.innerWidth <= 600) {
            boardElement.style.gridTemplateColumns = `repeat(${cols}, 28px)`;
            boardElement.style.gridTemplateRows = `repeat(${rows}, 28px)`;
        }

        board = [];

        for (let r = 0; r < rows; r++) {
            board[r] = [];
            for (let c = 0; c < cols; c++) {
                const cellElement = document.createElement('div');
                cellElement.classList.add('cell');
                cellElement.dataset.row = r;
                cellElement.dataset.col = c;
                
                // Eventos de clique
                cellElement.addEventListener('click', (e) => handleCellClick(r, c));
                cellElement.addEventListener('contextmenu', (e) => {
                    e.preventDefault();
                    handleCellRightClick(r, c);
                });

                boardElement.appendChild(cellElement);
                
                // Objeto interno que representa a célula
                board[r][c] = {
                    element: cellElement,
                    isMine: false,
                    isRevealed: false,
                    isFlagged: false,
                    neighborMines: 0
                };
            }
        }
    }

    // Tratar clique com o botão esquerdo ou toque no modo padrão
    function handleCellClick(r, c) {
        if (gameOver) return;

        const cell = board[r][c];

        if (cell.isRevealed) return;

        // Se o modo de bandeira para celular estiver ativado, tratar clique padrão como marcação de bandeira
        if (isFlagModeActive) {
            handleCellRightClick(r, c);
            return;
        }

        if (cell.isFlagged) return;

        // Primeiro clique: garante que a célula clicada e seus vizinhos não tenham minas
        if (firstClick) {
            firstClick = false;
            generateMines(r, c);
            calculateNeighbors();
            startTimer();
        }

        if (cell.isMine) {
            triggerGameOver(r, c);
        } else {
            revealCell(r, c);
            checkVictory();
        }
    }

    // Tratar clique direito (Bandeira)
    function handleCellRightClick(r, c) {
        if (gameOver) return;
        
        const cell = board[r][c];
        if (cell.isRevealed) return;

        if (cell.isFlagged) {
            cell.isFlagged = false;
            cell.element.classList.remove('flagged');
            cell.element.textContent = '';
            flagsPlaced--;
        } else {
            // Impedir mais bandeiras do que o limite não é estritamente proibido, mas vamos controlar
            cell.isFlagged = true;
            cell.element.classList.add('flagged');
            cell.element.textContent = '🚩';
            flagsPlaced++;
        }
        updateMinesCounter();
    }

    // Gerar as minas no tabuleiro excluindo a vizinhança do primeiro clique
    function generateMines(firstRow, firstCol) {
        let placedMines = 0;
        
        // Define uma zona de segurança de 3x3 em torno do primeiro clique
        const safetyZone = new Set();
        for (let r = firstRow - 1; r <= firstRow + 1; r++) {
            for (let c = firstCol - 1; c <= firstCol + 1; c++) {
                if (r >= 0 && r < rows && c >= 0 && c < cols) {
                    safetyZone.add(`${r},${c}`);
                }
            }
        }

        // Garante que não teremos um loop infinito caso o tabuleiro seja muito pequeno e as minas excedam a área permitida
        const maxPossibleMines = (rows * cols) - safetyZone.size;
        const targetMines = Math.min(mineCount, maxPossibleMines);

        while (placedMines < targetMines) {
            const randRow = Math.floor(Math.random() * rows);
            const randCol = Math.floor(Math.random() * cols);
            const key = `${randRow},${randCol}`;

            if (!board[randRow][randCol].isMine && !safetyZone.has(key)) {
                board[randRow][randCol].isMine = true;
                placedMines++;
            }
        }
        
        // Atualizar mineCount caso tenha sido ajustado para caber no tabuleiro
        mineCount = targetMines;
        updateMinesCounter();
    }

    // Calcular vizinhos com minas para cada célula
    function calculateNeighbors() {
        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                if (board[r][c].isMine) continue;

                let count = 0;
                for (let i = -1; i <= 1; i++) {
                    for (let j = -1; j <= 1; j++) {
                        const newR = r + i;
                        const newC = c + j;
                        if (newR >= 0 && newR < rows && newC >= 0 && newC < cols) {
                            if (board[newR][newC].isMine) {
                                count++;
                            }
                        }
                    }
                }
                board[r][c].neighborMines = count;
            }
        }
    }

    // Revelação Recursiva (Flood Fill)
    function revealCell(r, c) {
        const cell = board[r][c];
        if (cell.isRevealed || cell.isFlagged) return;

        cell.isRevealed = true;
        cell.element.classList.add('revealed');

        if (cell.neighborMines > 0) {
            cell.element.textContent = cell.neighborMines;
            cell.element.setAttribute('data-count', cell.neighborMines);
        } else {
            // Revelar recursivamente os 8 vizinhos
            for (let i = -1; i <= 1; i++) {
                for (let j = -1; j <= 1; j++) {
                    const newR = r + i;
                    const newC = c + j;
                    if (newR >= 0 && newR < rows && newC >= 0 && newC < cols) {
                        revealCell(newR, newC);
                    }
                }
            }
        }
    }

    // Iniciar temporizador do jogo
    function startTimer() {
        secondsElapsed = 0;
        timerInterval = setInterval(() => {
            secondsElapsed++;
            const display = String(Math.min(999, secondsElapsed)).padStart(3, '0');
            timerDisplay.textContent = display;
        }, 1000);
    }

    // Fim de Jogo: Explosão!
    function triggerGameOver(explodedR, explodedC) {
        gameOver = true;
        clearInterval(timerInterval);
        resetButton.textContent = '😵';

        // Destacar mina explodida
        board[explodedR][explodedC].element.classList.add('exploded');

        // Revelar todas as minas
        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                const cell = board[r][c];
                if (cell.isMine) {
                    cell.element.classList.add('revealed', 'mine');
                    if (!cell.isFlagged && !(r === explodedR && c === explodedC)) {
                        cell.element.textContent = '💣';
                    }
                } else if (cell.isFlagged) {
                    // Bandeira errada
                    cell.element.textContent = '❌';
                }
            }
        }

        // Mostrar tela de overlay após pequeno delay
        setTimeout(() => {
            overlayTitle.textContent = 'Fim de Jogo!';
            overlayTitle.style.color = '#ef4444';
            overlayMessage.textContent = `Você encontrou uma mina após ${secondsElapsed} segundos.`;
            overlayBtn.textContent = 'Tentar Novamente';
            gameOverlay.classList.remove('hidden');
        }, 800);
    }

    // Verificar se jogador venceu
    function checkVictory() {
        let revealedCount = 0;
        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                if (board[r][c].isRevealed) {
                    revealedCount++;
                }
            }
        }

        // Condição de vitória: todas as células não-minas foram reveladas
        if (revealedCount === (rows * cols) - mineCount) {
            gameOver = true;
            clearInterval(timerInterval);
            resetButton.textContent = '😎';

            // Colocar bandeiras em todas as minas não marcadas
            for (let r = 0; r < rows; r++) {
                for (let c = 0; c < cols; c++) {
                    const cell = board[r][c];
                    if (cell.isMine && !cell.isFlagged) {
                        cell.element.classList.add('flagged');
                        cell.element.textContent = '🚩';
                    }
                }
            }
            flagsPlaced = mineCount;
            updateMinesCounter();

            setTimeout(() => {
                overlayTitle.textContent = 'Vitória!';
                overlayTitle.style.color = '#10b981';
                overlayMessage.textContent = `Parabéns! Você desarmou o Campo Minado em ${secondsElapsed} segundos!`;
                overlayBtn.textContent = 'Jogar Novamente';
                gameOverlay.classList.remove('hidden');
            }, 800);
        }
    }

    // Controles de Dificuldade
    difficultySelect.addEventListener('change', (e) => {
        currentDifficulty = e.target.value;
        if (currentDifficulty === 'custom') {
            customSettings.classList.remove('hidden');
            // Valores padrão do formulário personalizado baseados no médio
            customRowsInput.value = 16;
            customColsInput.value = 16;
            customMinesInput.value = 40;
        } else {
            customSettings.classList.add('hidden');
            initGame();
        }
    });

    applyCustomBtn.addEventListener('click', () => {
        let r = parseInt(customRowsInput.value);
        let c = parseInt(customColsInput.value);
        let m = parseInt(customMinesInput.value);

        // Sanitize input
        r = Math.max(5, Math.min(30, isNaN(r) ? 16 : r));
        c = Math.max(5, Math.min(50, isNaN(c) ? 16 : c));
        
        const maxMines = Math.floor((r * c) * 0.7); // No máximo 70% do tabuleiro com minas
        m = Math.max(1, Math.min(maxMines, isNaN(m) ? 40 : m));

        customRowsInput.value = r;
        customColsInput.value = c;
        customMinesInput.value = m;

        rows = r;
        cols = c;
        mineCount = m;

        initGame();
    });

    // Botão de Reinício
    resetButton.addEventListener('click', initGame);
    overlayBtn.addEventListener('click', initGame);

    // Toggle de Modo Bandeira (Mobile)
    flagToggleBtn.addEventListener('click', () => {
        isFlagModeActive = !isFlagModeActive;
        if (isFlagModeActive) {
            flagToggleBtn.classList.add('active');
            flagToggleBtn.innerHTML = '<span class="icon">🚩</span> Marcar Modo';
        } else {
            flagToggleBtn.classList.remove('active');
            flagToggleBtn.innerHTML = '<span class="icon">⛏️</span> Revelar Modo';
        }
    });

    // Responsividade Dinâmica ao redimensionar tela
    window.addEventListener('resize', () => {
        // Apenas ajusta o tamanho da célula sem recriar o jogo
        boardElement.style.gridTemplateColumns = `repeat(${cols}, ${window.innerWidth <= 600 ? '28px' : '32px'})`;
        boardElement.style.gridTemplateRows = `repeat(${rows}, ${window.innerWidth <= 600 ? '28px' : '32px'})`;
    });

    // Inicializar o jogo pela primeira vez
    initGame();
});
