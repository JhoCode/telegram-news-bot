// Importamos las bibliotecas necesarias
require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const NewsAPI = require('newsapi');
const schedule = require('node-schedule');

// Configuramos el token del bot de Telegram y el token de NewsAPI

const telegramToken = process.env.TELEGRAM_TOKEN;
const newsApiToken = process.env.NEWS_API_TOKEN;
const chatId = process.env.CHAT_ID;

// Creamos una instancia de TelegramBot y NewsAPI
const bot = new TelegramBot(telegramToken, { polling: true });
const newsapi = new NewsAPI(newsApiToken);

// Especificamos los temas de noticias que nos interesan
const topics = ['chatgpt', 'ycombinator', 'IA', 'Startups'];

// Creamos una variable contador para limitar el número de noticias enviadas
let counter = 0;

// Función que se encarga de buscar noticias y enviarlas por Telegram
function sendNews() {
  // Realizamos la búsqueda de noticias
  newsapi.v2.everything({
    q: topics.join(' OR '),
    language: 'es',
    sortBy: 'publishedAt',
  }).then(response => {
    // Enviamos las noticias encontradas por Telegram
    response.articles.forEach(article => {
      if (counter >= 6) {
        return; // Si ya se han enviado 6 noticias, no se envía ninguna más
      }
      const message = `${article.title}\n${article.url}`;
      bot.sendMessage(chatId, message);
      counter++; // Incrementamos el contador
    });
  }).catch(error => {
    console.error('Error obteniendo noticias:', error);
  });
}

// Establecemos una regla de horario para ejecutar la función sendNews cada 3 minutos
const job = schedule.scheduleJob('0 */6 * * *', sendNews);

// Agregamos un controlador de eventos para recibir mensajes en Telegram
bot.on('message', (msg) => {
  chatId = msg.chat.id;
  console.log(`El chatId es: ${chatId}`);
  bot.sendMessage(chatId, 'Hola! Te enviaré noticias sobre los temas que te interesan cada 3 minutos.');
});
