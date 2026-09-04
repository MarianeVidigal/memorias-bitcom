// ==========================================
// MEMÓRIAS BITCOM
// ==========================================


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


// ==========================================
// TROCA DE TELAS
// ==========================================

function changeScreen(screenName) {

    Object.values(screens).forEach(screen => {
        screen.classList.remove("active");
    });

    screens[screenName].classList.add("active");

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}


// ==========================================
// ABERTURA → INTRO
// ==========================================

startButton.addEventListener("click", () => {

    changeScreen("intro");

});


// ==========================================
// INTRO → VÍDEO
// ==========================================

introButton.addEventListener("click", () => {

    changeScreen("video");

});


// ==========================================
// PROGRESSO DO VÍDEO
// ==========================================

farewellVideo.addEventListener("timeupdate", () => {

    if (!farewellVideo.duration) {
        return;
    }

    const percentage =
        (farewellVideo.currentTime / farewellVideo.duration) * 100;

    videoProgress.style.width = `${percentage}%`;

});


// ==========================================
// VÍDEO TERMINOU
// ==========================================

farewellVideo.addEventListener("ended", () => {

    videoProgress.style.width = "100%";

    videoStatus.textContent = "MEMÓRIA CONCLUÍDA";

    afterVideoButton.classList.remove("hidden");

});


// ==========================================
// VÍDEO → DESPEDIDA
// ==========================================

afterVideoButton.addEventListener("click", () => {

    changeScreen("farewell");

});


// ==========================================
// DESPEDIDA → MURAL
// ==========================================

goToWallButton.addEventListener("click", () => {

    changeScreen("wall");

});


// ==========================================
// CONTADOR DE CARACTERES
// ==========================================

messageInput.addEventListener("input", () => {

    const currentLength = messageInput.value.length;

    characterCount.textContent =
        `${currentLength} / 500`;

});


// ==========================================
// ENVIO DA MENSAGEM
// ==========================================

messageForm.addEventListener("submit", async (event) => {

    event.preventDefault();


    const name = nameInput.value.trim();
    const message = messageInput.value.trim();


    // --------------------------------------
    // VALIDAÇÃO
    // --------------------------------------

    if (!name) {

        showFormStatus(
            "Por favor, coloque seu nome.",
            true
        );

        nameInput.focus();

        return;
    }


    if (!message) {

        showFormStatus(
            "Por favor, escreva uma mensagem.",
            true
        );

        messageInput.focus();

        return;
    }


    // --------------------------------------
    // BOTÃO
    // --------------------------------------

    publishButton.disabled = true;

    publishButton.textContent = "ENVIANDO...";


    // --------------------------------------
    // DADOS
    // --------------------------------------

    const formData = {

        nome: name,

        mensagem: message,

        _subject:
            "Nova mensagem para o Mural - Memórias Bitcom",

        _template: "table",

        _captcha: "false"

    };


    try {

        // ----------------------------------
        // ENVIA PARA O FORMSUBMIT
        // ----------------------------------

        const response = await fetch(
            "https://formsubmit.co/ajax/marianevidigal@gmail.com",
            {

                method: "POST",

                headers: {

                    "Content-Type":
                        "application/json",

                    "Accept":
                        "application/json"

                },

                body: JSON.stringify(formData)

            }
        );


        // ----------------------------------
        // TENTA LER A RESPOSTA
        // ----------------------------------

        const data = await response.json();


        console.log("Resposta do FormSubmit:", data);


        // ----------------------------------
        // SUCESSO
        // ----------------------------------

        if (response.ok && data.success) {

            messageForm.reset();

            characterCount.textContent =
                "0 / 500";


            showFormStatus(
                "Mensagem enviada! ❤️ Obrigada por fazer parte dessa história.",
                false
            );


        } else {

            console.error(
                "FormSubmit retornou erro:",
                data
            );


            showFormStatus(
                data.message ||
                "O envio não foi concluído. Verifique o console do navegador.",
                true
            );

        }


    } catch (error) {

        console.error(
            "Erro ao enviar mensagem:",
            error
        );


        showFormStatus(
            "Não foi possível conectar ao serviço de envio. Verifique sua conexão com a internet.",
            true
        );

    }


    // --------------------------------------
    // RESTAURA BOTÃO
    // --------------------------------------

    publishButton.disabled = false;

    publishButton.textContent =
        "DEIXAR MINHA MARCA";

});


// ==========================================
// STATUS DO FORMULÁRIO
// ==========================================

function showFormStatus(message, isError) {

    formStatus.textContent = message;

    formStatus.classList.remove("hidden");


    if (isError) {

        formStatus.classList.add("error");

    } else {

        formStatus.classList.remove("error");

    }


    setTimeout(() => {

        formStatus.classList.add("hidden");

    }, 8000);

}