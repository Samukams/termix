const board =
document.getElementById("board");

const keyboard =
document.getElementById("keyboard");

const rankingBtn =
document.getElementById("rankingBtn");

const rankingModal =
document.getElementById("rankingModal");

const rankingContent =
document.getElementById("rankingContent");

const closeRanking =
document.getElementById("closeRanking");

const profileModal =
document.getElementById("profileModal");

const profileContent =
document.getElementById("profileContent");

const closeProfile =
document.getElementById("closeProfile");

const loginModal =
document.getElementById("loginModal");

const savePlayerBtn =
document.getElementById("savePlayer");

const playerInput =
document.getElementById("playerName");

const menu =
document.getElementById("menu");

const modeButtons =
document.querySelectorAll(".mode-btn");

const container =
document.querySelector(".container");

const timerDiv =
document.getElementById("timer");

const themeSelect =
document.getElementById("themeSelect");

let rows = 6;

const cols = 5;

let currentRow = 0;

let currentCol = 0;

let selectedCol = 0;

let gameOver = false;

let secretWord = "";

let grid = [];

let gameMode = "easy";

let timer = null;

let timeLeft = 0;

window.onload = ()=>{

    document.body.className = "";

    document.body.classList.add(
        "classic"
    );

    themeSelect.value =
    "classic";

    localStorage.setItem(
        "theme",
        "classic"
    );

    const savedPlayer =
    localStorage.getItem(
        "termixPlayer"
    );

    if(savedPlayer){

        loginModal.classList.add(
            "hidden"
        );

    }

};

savePlayerBtn.onclick = ()=>{

    const name =
    playerInput.value.trim();

    if(name.length < 2){

        alert("Digite um nome válido");

        return;

    }

    localStorage.setItem(
        "termixPlayer",
        name
    );

    loginModal.classList.add(
        "hidden"
    );

};

rankingBtn.onclick = async ()=>{

    rankingModal.classList.remove(
        "hidden"
    );

    loadRanking("geral");

};

closeRanking.onclick = ()=>{

    rankingModal.classList.add(
        "hidden"
    );

};

document
.querySelectorAll(".tabBtn")
.forEach(btn=>{

    btn.onclick = ()=>{

        loadRanking(
            btn.dataset.tab
        );

    };

});

async function loadRanking(type){

    const res =
    await fetch("/ranking");

    const data =
    await res.json();

    let html = "";

    if(type === "geral"){

        data.geral.forEach((p,i)=>{

            html += `

            <div class="rank-item"
            onclick="openProfile('${p.nome}')">

                <span>
                #${i+1} ${p.nome}
                </span>

                <span>
                ${p.vitorias} wins
                </span>

            </div>

            `;

        });

    }

    if(type === "medio"){

        data.medio.forEach((p,i)=>{

            html += `

            <div class="rank-item"
            onclick="openProfile('${p.nome}')">

                <span>
                #${i+1} ${p.nome}
                </span>

                <span>
                ${p.melhor_tempo_medio}s
                </span>

            </div>

            `;

        });

    }

    if(type === "dificil"){

        data.dificil.forEach((p,i)=>{

            html += `

            <div class="rank-item"
            onclick="openProfile('${p.nome}')">

                <span>
                #${i+1} ${p.nome}
                </span>

                <span>
                ${p.melhor_tempo_dificil}s
                </span>

            </div>

            `;

        });

    }

    rankingContent.innerHTML =
    html;

}

async function openProfile(name){

    const res =
    await fetch("/player/" + name);

    const data =
    await res.json();

    profileModal.classList.remove(
        "hidden"
    );

    profileContent.innerHTML = `

        <h2>👤 ${data.nome}</h2>

        <p>🏆 Vitórias: ${data.vitorias}</p>

        <p>❌ Derrotas: ${data.derrotas}</p>

        <p>🎮 Partidas: ${data.partidas}</p>

        <p>⚡ Melhor Médio:
        ${data.melhor_tempo_medio || "-"}</p>

        <p>💀 Melhor Difícil:
        ${data.melhor_tempo_dificil || "-"}</p>

    `;

}

closeProfile.onclick = ()=>{

    profileModal.classList.add(
        "hidden"
    );

};

async function loadWord(){

    const res =
    await fetch("/word");

    const data =
    await res.json();

    secretWord =
    data.word.trim().toUpperCase();

}

function createBoard(){

    board.innerHTML = "";

    grid = [];

    for(let r=0;r<rows;r++){

        grid[r] = [];

        for(let c=0;c<cols;c++){

            const tile =
            document.createElement("div");

            tile.className = "tile";

            if(r===0 && c===0){

                tile.classList.add(
                    "selected"
                );

            }

            tile.addEventListener(
                "click",
                ()=>{

                    if(r === currentRow){

                        document
                        .querySelectorAll(".tile")
                        .forEach(t=>{

                            t.classList.remove(
                                "selected"
                            );

                        });

                        selectedCol = c;

                        currentCol = c;

                        tile.classList.add(
                            "selected"
                        );

                    }

                }
            );

            board.appendChild(tile);

            grid[r][c] = tile;

        }

    }

}

function createKeyboard(){

    keyboard.innerHTML = "";

    const layout = [

        "QWERTYUIOP",
        "ASDFGHJKL",
        "ENTERZXCVBNM⌫"

    ];

    layout.forEach(row=>{

        const rowDiv =
        document.createElement("div");

        rowDiv.classList.add(
            "keyboard-row"
        );

        if(row.includes("ENTER")){

            rowDiv.appendChild(
                createKey("ENTER","large")
            );

            "ZXCVBNM"
            .split("")
            .forEach(letter=>{

                rowDiv.appendChild(
                    createKey(letter)
                );

            });

            rowDiv.appendChild(
                createKey("⌫")
            );

        }

        else{

            row.split("")
            .forEach(letter=>{

                rowDiv.appendChild(
                    createKey(letter)
                );

            });

        }

        keyboard.appendChild(rowDiv);

    });

}

function createKey(letter,extra=""){

    const key =
    document.createElement("button");

    key.textContent = letter;

    key.classList.add("key");

    if(extra)
        key.classList.add(extra);

    key.onclick =
    ()=>handleKey(letter);

    return key;

}

function handleKey(key){

    if(gameOver) return;

    if(key==="⌫"){

        deleteLetter();

        return;

    }

    if(key==="ENTER"){

        checkWord();

        return;

    }

    addLetter(key);

}

function addLetter(letter){

    if(gameOver) return;

    if(selectedCol >= cols) return;

    const tile =
    grid[currentRow][selectedCol];

    tile.textContent = letter;

    currentCol = selectedCol;

    if(selectedCol < cols - 1){

        selectedCol++;

    }

    updateSelection();

}

function deleteLetter(){

    if(gameOver) return;

    let tile =
    grid[currentRow][selectedCol];

    tile.classList.remove("selected");

    if(tile.textContent !== ""){

        tile.textContent = "";

    }

    else if(selectedCol > 0){

        selectedCol--;

        currentCol = selectedCol;

        grid[currentRow][selectedCol]
        .textContent = "";

    }

    updateSelection();

}

async function checkWord(){

    if(currentRow >= rows) return;

    let guess = "";

    for(let c=0;c<cols;c++){

        guess +=
        grid[currentRow][c]
        .textContent;

    }

    if(guess.length < cols){

        shakeBoard();

        return;

    }

    const res =
    await fetch("/check/" + guess);

    const data =
    await res.json();

    if(!data.exists){

        showMessage(
            "Palavra inválida ❌"
        );

        shakeBoard();

        return;

    }

    let tempWord =
    secretWord.split("");

    for(let c=0;c<cols;c++){

        const tile =
        grid[currentRow][c];

        const letter =
        guess[c];

        tile.classList.add("flip");

        tile.classList.remove("selected");

        if(letter === secretWord[c]){

            tile.classList.add(
                "correct"
            );

            updateKeyboard(
                letter,
                "correct"
            );

            tempWord[c] = null;

        }

    }

    for(let c=0;c<cols;c++){

        const tile =
        grid[currentRow][c];

        const letter =
        guess[c];

        if(tile.classList.contains(
            "correct"
        )) continue;

        const index =
        tempWord.indexOf(letter);

        if(index !== -1){

            tile.classList.add(
                "present"
            );

            updateKeyboard(
                letter,
                "present"
            );

            tempWord[index] = null;

        }

        else{

            tile.classList.add(
                "absent"
            );

            updateKeyboard(
                letter,
                "absent"
            );

        }

    }

    if(guess === secretWord){

        gameOver = true;

        clearInterval(timer);

        saveScore(true);

        setTimeout(()=>{

            showMessage(
                "VOCÊ VENCEU 🔥"
            );

            confetti();

        },1000);

        return;

    }

    currentRow++;

    currentCol = 0;

    selectedCol = 0;

    updateSelection();

    if(currentRow === rows){

    gameOver = true;

    clearInterval(timer);

    saveScore(false);

    if(gameMode === "medium" || gameMode === "hard"){

        const bomb =
        document.getElementById("bomb");

        bomb.innerHTML = "💥";

        bomb.classList.add("bomb-explode");

        const explosion =
        document.getElementById("explosion");

        explosion.classList.add(
            "explosion-active"
        );

        setTimeout(()=>{

            explosion.classList.remove(
                "explosion-active"
            );

        },800);

        document.body.animate([

            {
                transform:"translateX(-25px)"
            },

            {
                transform:"translateX(25px)"
            },

            {
                transform:"translateY(-15px)"
            },

            {
                transform:"translateY(15px)"
            },

            {
                transform:"translateX(0px)"
            }

        ],{

            duration:700

        });

    }

    showMessage(
        "Fim de jogo! Palavra: "
        + secretWord
    );

}

}

async function saveScore(venceu){

    const nome =
    localStorage.getItem(
        "termixPlayer"
    );

    let tempoFinal = 0;

    if(gameMode === "medium"){

        tempoFinal =
        90 - timeLeft;

    }

    if(gameMode === "hard"){

        tempoFinal =
        45 - timeLeft;

    }

    await fetch("/save-score",{

        method:"POST",

        headers:{
            "Content-Type":"application/json"
        },

        body:JSON.stringify({

            nome,

            modo:gameMode,

            tempo:tempoFinal,

            tentativas:currentRow+1,

            venceu

        })

    });

}

function updateKeyboard(letter,status){

    const key =
    [...document.querySelectorAll(".key")]
    .find(k=>k.textContent===letter);

    if(!key) return;

    if(status==="correct"){

        key.classList.remove(
            "present",
            "absent"
        );

        key.classList.add(
            "correct"
        );

    }

    else if(
        status==="present" &&
        !key.classList.contains(
            "correct"
        )
    ){

        key.classList.add(
            "present"
        );

    }

    else if(
        status==="absent" &&
        !key.classList.contains(
            "correct"
        )
    ){

        key.classList.add(
            "absent"
        );

    }

}

function shakeBoard(){

    board.animate([

        {
            transform:
            "translateX(-10px)"
        },

        {
            transform:
            "translateX(10px)"
        },

        {
            transform:
            "translateX(0px)"
        }

    ],{

        duration:300

    });

}

function showMessage(text){

    const msg =
    document.createElement("div");

    msg.classList.add("toast");

    msg.textContent = text;

    document.body.appendChild(msg);

    setTimeout(()=>{

        msg.remove();

    },2000);

}

function confetti(){

    for(let i=0;i<100;i++){

        const div =
        document.createElement("div");

        div.style.position="fixed";

        div.style.width="10px";

        div.style.height="10px";

        div.style.background=
        `hsl(${Math.random()*360},100%,50%)`;

        div.style.left=
        Math.random()*100+"vw";

        div.style.top="-20px";

        document.body.appendChild(div);

        div.animate([

            {
                transform:
                "translateY(0)"
            },

            {
                transform:
                "translateY(100vh)"
            }

        ],{

            duration:
            2000 + Math.random()*2000

        });

        setTimeout(()=>{

            div.remove();

        },4000);

    }

}

function updateSelection(){

    document
    .querySelectorAll(".tile")
    .forEach(tile=>{

        tile.classList.remove("selected");

    });

    if(gameOver) return;

    if(currentRow >= rows) return;

    if(selectedCol < 0){

        selectedCol = 0;

    }

    if(selectedCol >= cols){

        selectedCol = cols - 1;

    }

    currentCol = selectedCol;

    const tile =
    grid[currentRow][selectedCol];

    if(tile && tile.textContent === ""){

        tile.classList.add("selected");

    }

}

document.addEventListener(
    "keydown",
    (e)=>{

        const key =
        e.key.toUpperCase();

        if(
            document.activeElement === themeSelect
        ){

            themeSelect.blur();

        }

        if(key==="BACKSPACE"){

            deleteLetter();

            return;

        }

        if(key === "ENTER"){

            if(gameOver) return;

            checkWord();

            return;

        }

        if(/^[A-Z]$/.test(key)){

            addLetter(key);

        }

    }
);

document.getElementById("newGame")
.onclick = ()=>{

    startGame();

};

modeButtons.forEach(button=>{

    button.onclick = ()=>{

        gameMode =
        button.dataset.mode;

        menu.classList.add(
            "hidden"
        );

        container.classList.remove(
            "hidden"
        );

        startGame();

    };

});

async function startGame(){

    clearInterval(timer);

    const bomb =
    document.getElementById("bomb");

    bomb.innerHTML = "💣";

    bomb.classList.remove("bomb-explode");

    bomb.style.transform = "scale(1)";

    currentRow = 0;

    currentCol = 0;

    selectedCol = 0;

    gameOver = false;

    grid = [];

    board.innerHTML = "";

    keyboard.innerHTML = "";

    timerDiv.textContent = "";

    document
    .getElementById("bomb")
    .classList.add("hidden");

    rows = 6;

    if(gameMode === "medium"){

    document
    .getElementById("bomb")
    .classList.remove("hidden");

    startTimer(90);

    }

    if(gameMode === "hard"){

    rows = 5;

    document
    .getElementById("bomb")
    .classList.remove("hidden");

    startTimer(45);

    }

    await loadWord();

    createBoard();

    createKeyboard();

    selectedCol = 0;

    currentCol = 0;

    updateSelection();

}

function startTimer(seconds){

    timeLeft = seconds;

    timerDiv.textContent =
    `⏳ ${timeLeft}s`;

    timer =
    setInterval(()=>{

        timeLeft--;

        timerDiv.textContent =
        `⏳ ${timeLeft}s`;

        if(timeLeft <= 0){

    clearInterval(timer);

    gameOver = true;

    saveScore(false);

    const bomb =
    document.getElementById("bomb");

    bomb.innerHTML = "💥";

    bomb.classList.add("bomb-explode");

    const explosion =
    document.getElementById("explosion");

    explosion.classList.add(
    "explosion-active"
    );

    setTimeout(()=>{

    explosion.classList.remove(
        "explosion-active"
    );

    },800);

    document.body.animate([

        {
            transform:"translateX(-25px)"
        },

        {
            transform:"translateX(25px)"
        },

        {
            transform:"translateY(-15px)"
        },

        {
            transform:"translateY(15px)"
        },

        {
            transform:"translateX(0px)"
        }

    ],{

        duration:700

    });

    showMessage(
        "TEMPO ESGOTADO ⏰ Palavra: " + secretWord
    );

}

    },1000);

}

themeSelect.addEventListener(
    "change",
    ()=>{

        document.body.className = "";

        document.body.classList.add(
            themeSelect.value
        );

        localStorage.setItem(
            "theme",
            themeSelect.value
        );

    }
);

// hospedar online