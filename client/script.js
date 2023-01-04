//Importowanie zasobów
import bot from './assets/bot.svg';
import user from './assets/user.svg';

//Definiowanie elementów z html(FindByView w Androidzie)
const form = document.querySelector('form');
const chatContainer = document.querySelector('#chat_container');

//Definiowanie zmiennej(wypełnimy później)
let loadInterval;

//Funkcja wyświetlana na etapie ładowania odpowiedzi od Modelu
function loader(element){
    element.textContent = '';

    loadInterval = setInterval(()=>{
        //Dodawanie kropki co 300ms
        element.textContent +='.';
        if (element.textContent ==='....'){
            element.textContent = '';
        }
    },300);
}

//Funkcja odpowiadająca za odpowiadanie literka po literce
function typeText(element,text){
let index = 0;

let interval = setInterval(()=>{
    //Jeśli jest tekst do wyświetlenia to pokazuj kolejne litery
    if(index<text.length) {
        element.innerHTML += text.charAt(index);
        index++;
    } else{
        clearInterval(interval);
    }
},20)
} 

//Funkcja do generowania ID dla każdej wiadomości od ChatGPT
function generateUniqueId(){
    //Losowość uzyskujemy za pomocą czasu otrzymania, losowej liczby i Hexa
    const timestamp = Date.now();
    const randomNumber = Math.random();
    const hexadecimalString = randomNumber.toString(16);

    return `id-${timestamp}-${hexadecimalString}`;
}

//Funkcja do wyświetlania wypowiedzi zdefiniowanych tym kto pisze, wartości i id
function chatStripe(isAI, value, uniqueId){
return (
`
<div class="wrapper ${isAI && 'ai'}">
    <div class="chat">
        <div class="profile">
            <img
            src="${isAI ? bot : user}"
            alt="${isAI ? 'bot' : 'user'}"
            />
        </div>
        <div class="message" id=${uniqueId}>${value}</div>
    </div>
</div>
`
)
}

//Funkcja Submitowania wiadomości
const handleSubmit = async(e)=> {
//Defaultowo się przeładowuje przeglądarka, więc to blokujemy:
e.preventDefault();
//Pobieranie danych z formularza
const data = new FormData(form);
//Wizualizacja wiadomości użytkownika
chatContainer.innerHTML += chatStripe(false,data.get('prompt'));

form.reset();

//Wizualizacja wiadomości bota(ChatGTP)
const uniqueId = generateUniqueId();
chatContainer.innerHTML += chatStripe(true, " ", uniqueId);

//W momencie gdy użytkownik pisze, chcemy przewijać w dół żeby widziec wiadomość
chatContainer.scrollTop = chatContainer.scrollHeight;

const messageDiv = document.getElementById(uniqueId);

loader(messageDiv);

//Pobieranie odpowiedzi od bota
const response = await fetch('https://codexai-zeu6.onrender.com/', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({
        prompt: data.get('prompt')
    })
})

clearInterval(loadInterval); 
messageDiv.innerHTML = '';
if(response.ok){
    const data = await response.json();
    const parsedData = data.bot.trim();

    typeText(messageDiv,parsedData);
} else {
    const err = await response.json();

    messageDiv.innerHTML = "Something went wrong";

    alert(err);
}

}

//Wywoływanie Submita(handle Submit) przez przycisk i za pomocą Entera
form.addEventListener('submit',handleSubmit);
form.addEventListener('keyup', (e) => {
 if(e.keyCode===13){
    handleSubmit(e);
 }
})