// Try different import methods for parse-domain
let parseDomain;
try {
  const parseModule = require('parse-domain');
  parseDomain = parseModule.parseDomain || parseModule;
} catch (error) {
  console.error('Error importing parse-domain:', error);
  process.exit(1);
}

const websites = require('require-all')(`${__dirname}/websites`);

async function sandbox(website = 'https://www.avenuedelabrique.com/nouveautes-lego') {
  try {
    console.log(`🕵️‍♀️  browsing ${website} website`);
    
    // Extract domain name from URL
    const url = new URL(website);
    const hostname = url.hostname;
    
    // Get domain name without www. prefix
    const domainParts = hostname.split('.');
    let domain;
    
    if (domainParts[0] === 'www') {
      domain = domainParts[1];
    } else {
      domain = domainParts[0];
    }
    
    if (!websites[domain]) {
      throw new Error(`No scraper found for domain: ${domain}`);
    }
    
    const deals = await websites[domain].scrape(website);
    console.log(deals);
    console.log('done');
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}

const [,, eshop] = process.argv;
sandbox(eshop);