# 💣 Campo Minado Neo-Retro: Experimento Pedagógico

Este é um projeto completo do clássico jogo **Campo Minado (Minesweeper)** desenvolvido com **JavaScript Vanilla, HTML5 e CSS3**. O projeto foi concebido e programado inteiramente por **Inteligência Artificial (IA)** com o objetivo de servir como material pedagógico de estudo.

O foco principal do projeto é demonstrar a viabilidade, elegância e robustez de aplicações interativas modernas utilizando apenas recursos nativos da web, sem frameworks ou bibliotecas de terceiros.

---

## 🎯 Objetivos Pedagógicos

Para estudantes e entusiastas de desenvolvimento web, este repositório ilustra diversos conceitos fundamentais da programação front-end:

1. **Manipulação do DOM (Document Object Model):** Geração dinâmica do tabuleiro de jogo utilizando elementos HTML instanciados e controlados via JavaScript.
2. **Algoritmos de Varredura (Flood Fill):** O processo recursivo utilizado para revelar automaticamente células vazias adjacentes quando o jogador clica em uma região sem minas adjacentes.
3. **Estruturas de Dados:** Uso de matrizes bidimensionais (arrays de duas dimensões) para representar o estado do tabuleiro de jogo (`isMine`, `isRevealed`, `isFlagged`, etc.).
4. **Gerenciamento de Estado:** Sincronização entre o estado interno da lógica do jogo e a representação visual (UI) apresentada ao usuário.
5. **Prevenção de Derrota no Primeiro Clique:** Lógica refinada onde o posicionamento das minas é gerado apenas *após* o primeiro clique do usuário, garantindo uma experiência justa.
6. **Design System & Animações com CSS Puro:** Utilização de CSS Variables, Glassmorphism (efeito vidro fosco), Grid Layout flexível e micro-animações interativas (como tremores ao explodir e transições de escala).

---

## 🕹️ Funcionalidades do Jogo

- **Estética Premium Neo-Retro**: Tema synthwave escuro com efeitos de brilho neon e displays numéricos no estilo fliperama.
- **Três Níveis de Dificuldade Nativos**:
  - **Fácil**: Grade 9x9 com 10 minas.
  - **Médio**: Grade 16x16 com 40 minas.
  - **Difícil**: Grade 30x16 com 99 minas.
- **Modo Personalizado (Custom)**: Permite que o usuário defina o tamanho de linhas, colunas e o número de minas.
- **Responsivo e Adaptável**: Grid flexível que detecta telas de smartphones e ajusta as dimensões.
- **Controle Mobile Friendly**: Um botão alternador (Toggle) permite jogar e marcar bandeiras via toque de tela em celulares de forma fácil.
- **Cronômetro e Contador**: Feedback em tempo real com fontes digitais.

---

## 🏗️ Estrutura do Código

O projeto está dividido de forma clássica e organizada:

```bash
├── index.html   # Estrutura semântica e esqueleto do jogo
├── style.css    # Design System, variáveis visuais, Glassmorphic UI e animações
├── script.js    # Inteligência do jogo (estado, algoritmos e interações)
└── README.md    # Este guia pedagógico
```

### Destaque no código: Algoritmo de Revelação Recursiva (Flood Fill)
A revelação das células utiliza o seguinte fluxo lógico simplificado em `script.js`:
```javascript
function revealCell(r, c) {
    const cell = board[r][c];
    if (cell.isRevealed || cell.isFlagged) return;

    cell.isRevealed = true;
    cell.element.classList.add('revealed');

    if (cell.neighborMines > 0) {
        cell.element.textContent = cell.neighborMines;
    } else {
        // Revelar recursivamente os 8 vizinhos caso não haja minas adjacentes
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
```

---

## 🤖 O Papel da Inteligência Artificial

Este projeto foi construído por **Antigravity (agente de IA do Google DeepMind)**. Ele demonstra o potencial da colaboração entre humanos e IA no desenvolvimento ágil de protótipos de alta fidelidade:
- **Design de Interface Integrado**: Planejamento estético que foge do básico, priorizando paletas harmônicas em HSL e sombras ricas.
- **Programação Limpa e Comentada**: O código é escrito respeitando boas práticas de encapsulamento, nomes de variáveis legíveis e modularidade de funções para facilitar a leitura pedagógica.

---

## 🚀 Como Executar o Projeto

1. Faça o download ou clone este diretório.
2. Abra o arquivo `index.html` em qualquer navegador web moderno.
3. Não é necessário nenhum servidor local, compilador ou gerenciador de pacotes (`npm`, `yarn`, etc.). É 100% estático e portátil!
