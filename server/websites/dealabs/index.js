const axios = require('axios');
const cheerio = require('cheerio');

// URL de la page que vous souhaitez scraper (ici, la page d'accueil de Dealabs)
const URL = 'https://www.dealabs.com/';

axios.get(URL)
  .then(response => {
    const html = response.data;
    // Charger le HTML avec Cheerio pour pouvoir l'interroger avec des sélecteurs de type jQuery
    const $ = cheerio.load(html);

    // Tableau qui contiendra les données des deals
    const deals = [];

    // ATTENTION : Les sélecteurs ci-dessous ('.thread-grid' et '.thread-title')
    // sont donnés à titre d'exemple.
    // Ouvrez la page Dealabs dans votre navigateur, inspectez-la (clic droit > Inspecter)
    // et ajustez les sélecteurs pour cibler précisément les éléments qui vous intéressent.
    $('.thread-grid').each((index, element) => {
      const title = $(element).find('.thread-title').text().trim();
      const link = $(element).find('a').attr('href');
      
      if (title) {
        deals.push({ title, link });
      }
    });

    console.log(deals);
  })
  .catch(error => {
    console.error('Erreur lors de la récupération de la page :', error);
  });
