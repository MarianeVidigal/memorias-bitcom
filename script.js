// ==========================================
// MEMÓRIAS BITCOM
// Controle das telas + vídeo + mural
// ==========================================


// ==========================================
// CONFIGURAÇÃO
// ==========================================

const GOOGLE_SHEETS_URL =
    "https://script.google.com/macros/s/AKfycbwQ53M1t-NYC7rWlXWMFTBeOPNoWR35MmQ9s5xO3QZnli71QcL4ECloOb5ZKJTHuhrS/exec";

const FORMSUBMIT_URL =
    "https://formsubmit.co/ajax/marianevidigal@gmail.com";


// ==========================================
// TELAS
// ==========================================

const screens = {
    home: document.getElementById("home"),
    intro: document.getElementById("intro"),
    video: document.getElementById("videoScreen"),
    farewell: document.getElementById("farewell"),
    wall: document.getElementById("wall")
};


// ==========================================
// BOTÕES
// ==========================================

const startButton = document.getElementById("startButton");
const introButton = document.getElementById("introButton");
const afterVideoButton = document.getElementById("afterVideoButton");
const goToWallButton = document.getElementById("goToWallButton");


// ==========================================
// VÍDEO
// ==========================================

const farewellVideo = document.getElementById("farewellVideo");
const videoProgress = document.getElementById("videoProgress");
const videoStatus = document.getElementById("videoStatus");


// ==========================================
// MURAL
// ==========================================

const messageForm = document.getElementById("messageForm");
const nameInput = document.getElementById("nameInput");
const messageInput = document.getElementById("messageInput");
const characterCount = document.getElementById("characterCount");
const publishButton = document.getElementById("publishButton");
const formStatus = document.getElementById("formStatus");
const messagesContainer = document.getElementById("messagesContainer");


// ==========================================
// TROCA DE TELA
// ==========================================

function changeScreen(screenName) {

    Object.values(screens).forEach(screen => {
        screen.classList.remove("active");
    });

    if (screens[screenName]) {
        screens[screenName].classList.add("active");
        screens[screenName].scrollTop = 0;
    }

    // Quando entrar no mural, carregar mensagens aprovadas
    if (screenName === "wall") {
        carregarMensagens();
    }
}


// ==========================================
// NAVEGAÇÃO
// ==========================================

startButton.addEventListener("click", () => {
    changeScreen("intro");
});

introButton.addEventListener("click", () => {
    changeScreen("video");

    farewellVideo.currentTime = 0;
    farewellVideo.play().catch(() => {
        // O navegador pode bloquear autoplay.
    });
});

afterVideoButton.addEventListener("click", () => {
    changeScreen("farewell");
});

goToWallButton.addEventListener("click", () => {
    changeScreen("wall");
});


// ==========================================
// CONTROLE DO VÍDEO
// ==========================================

farewellVideo.addEventListener("timeupdate", () => {

    if (!farewellVideo.duration) {
        return;
    }

    const progress =
        (farewellVideo.currentTime / farewellVideo.duration) * 100;

    videoProgress.style.width = `${progress}%`;
});


farewellVideo.addEventListener("ended", () => {

    videoProgress.style.width = "100%";

    videoStatus.textContent = "MEMÓRIA CONCLUÍDA";

    afterVideoButton.classList.remove("hidden");
});


// ==========================================
// CONTADOR DE CARACTERES
// ==========================================

messageInput.addEventListener("input", () => {

    const total = messageInput.value.length;

    characterCount.textContent = `${total}/500`;
});


// ==========================================
// ENVIAR MENSAGEM
// ==========================================

messageForm.addEventListener("submit", async (event) => {

    event.preventDefault();

    const name = nameInput.value.trim();
    const message = messageInput.value.trim();

    if (!name || !message) {
        formStatus.textContent =
            "Preencha seu nome e sua mensagem.";
        return;
    }

    if (message.length > 500) {
        formStatus.textContent =
            "A mensagem deve ter no máximo 500 caracteres.";
        return;
    }

    publishButton.disabled = true;
    publishButton.textContent = "ENVIANDO...";
    formStatus.textContent = "";


    // ======================================
    // 1. ENVIA PARA O GOOGLE SHEETS
    // ======================================

    try {

        await fetch(GOOGLE_SHEETS_URL, {
            method: "POST",
            mode: "no-cors",
            headers: {
                "Content-Type": "text/plain;charset=utf-8"
            },
            body: JSON.stringify({
                nome: name,
                mensagem: message
            })
        });

    } catch (error) {

        console.error(
            "Erro ao enviar para o Google Sheets:",
            error
        );
    }


    // ======================================
    // 2. ENVIA PARA O E-MAIL
    // ======================================

    try {

        const response = await fetch(
            FORMSUBMIT_URL,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json"
                },
                body: JSON.stringify({
                    nome: name,
                    mensagem: message,

                    _subject:
                        "Nova mensagem para o Mural - Memórias Bitcom",

                    _template: "table",

                    _captcha: "false"
                })
            }
        );

        const data = await response.json();

        console.log(
            "Resposta do FormSubmit:",
            data
        );

    } catch (error) {

        console.error(
            "Erro no envio por e-mail:",
            error
        );
    }


    // ======================================
    // FINALIZA
    // ======================================

    formStatus.textContent =
        "Mensagem enviada! ❤️ Obrigada por fazer parte dessa história.";

    messageForm.reset();

    characterCount.textContent = "0/500";

    publishButton.disabled = false;
    publishButton.textContent = "DEIXAR MINHA MARCA";
});


// ==========================================
// CARREGAR MENSAGENS APROVADAS
// ==========================================

async function carregarMensagens() {

    if (!messagesContainer) {
        return;
    }

    messagesContainer.innerHTML = `
        <div class="loading-messages">
            Carregando mensagens...
        </div>
    `;

    try {

        const response = await fetch(
            `${GOOGLE_SHEETS_URL}?t=${Date.now()}`
        );

        if (!response.ok) {
            throw new Error(
                "Não foi possível carregar as mensagens."
            );
        }

        const mensagens = await response.json();

        messagesContainer.innerHTML = "";


        // Nenhuma mensagem aprovada ainda
        if (!Array.isArray(mensagens) || mensagens.length === 0) {

            messagesContainer.innerHTML = `
                <div class="loading-messages">
                    Ainda não há mensagens publicadas.
                    <br>
                    Seja a primeira pessoa a deixar uma marca. ❤️
                </div>
            `;

            return;
        }


        // Mostrar mensagens aprovadas
        mensagens.forEach(mensagem => {

            const card = document.createElement("article");

            card.className = "message-card";


            const nameElement =
                document.createElement("div");

            nameElement.className =
                "message-name";

            nameElement.textContent =
                mensagem.nome;


            const textElement =
                document.createElement("div");

            textElement.className =
                "message-text";

            textElement.textContent =
                mensagem.mensagem;


            const dateElement =
                document.createElement("div");

            dateElement.className =
                "message-date";

            dateElement.textContent =
                formatarData(mensagem.data);


            card.appendChild(nameElement);
            card.appendChild(textElement);
            card.appendChild(dateElement);

            messagesContainer.appendChild(card);
        });

    } catch (error) {

        console.error(
            "Erro ao carregar mensagens:",
            error
        );

        messagesContainer.innerHTML = `
            <div class="loading-messages">
                Não foi possível carregar as mensagens agora.
            </div>
        `;
    }
}


// ==========================================
// FORMATAR DATA
// ==========================================

function formatarData(data) {

    if (!data) {
        return "";
    }

    const date = new Date(data);

    if (isNaN(date.getTime())) {
        return "";
    }

    return date.toLocaleDateString(
        "pt-BR",
        {
            day: "2-digit",
            month: "2-digit",
            year: "numeric"
        }
    );
}
