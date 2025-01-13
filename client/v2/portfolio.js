// Invoking strict mode https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Strict_mode#invoking_strict_mode
'use strict';

/**
Description of the available api
GET https://lego-api-blue.vercel.app/deals

Search for specific deals

This endpoint accepts the following optional query string parameters:

- `page` - page of deals to return
- `size` - number of deals to return

GET https://lego-api-blue.vercel.app/sales

Search for current Vinted sales for a given lego set id

This endpoint accepts the following optional query string parameters:

- `id` - lego set id to return
*/

// current deals on the page
let currentDeals = [];
let currentPagination = {};

// instantiate the selectors
const selectShow = document.querySelector('#show-select');
const selectPage = document.querySelector('#page-select');
const selectLegoSetIds = document.querySelector('#lego-set-id-select');
const sectionDeals= document.querySelector('#deals');
const spanNbDeals = document.querySelector('#nbDeals');
const sortSelect = document.querySelector('#sort-select');

/**
 * Set global value
 * @param {Array} result - deals to display
 * @param {Object} meta - pagination meta info
 */
const setCurrentDeals = ({result, meta}) => {
  currentDeals = result;
  currentPagination = meta;
};

/**
 * Fetch deals from api
 * @param  {Number}  [page=1] - current page to fetch
 * @param  {Number}  [size=12] - size of the page
 * @return {Object}
 */
const fetchDeals = async (page = 1, size = 6) => {
  try {
    const response = await fetch(
      `https://lego-api-blue.vercel.app/deals?page=${page}&size=${size}`
    );
    const body = await response.json();

    if (body.success !== true) {
      console.error(body);
      return { currentDeals, currentPagination };
    }

    const deals = body.data.result.map(deal => ({
      ...deal,
      discount: deal.discount || 0, // Use the API's discount field, default to 0 if not present
      comments: deal.comments || 0,
      temperature: deal.temperature || 0,
      price: deal.price || 0,
      date: new Date(deal.date || Date.now()),
    }));

    return {
      result: deals,
      meta: body.data.meta,
    };

  } catch (error) {
    console.error(error);
    return {currentDeals, currentPagination};
  }
};



/**
 * Render list of deals
 * @param  {Array} deals
 */
const renderDeals = deals => {
  const fragment = document.createDocumentFragment();
  const div = document.createElement('div');
  const template = deals
    .map(deal => {
      return `
      <div class="deal" id=${deal.uuid}>
        <span>${deal.id}</span>
        <a href="${deal.link}">${deal.title}</a>
        <span>${deal.price}</span>
        <span> - Discount: ${deal.discount.toFixed(2)}%</span>
        <span> - Comments: ${deal.comments}</span> <!-- Displaying comments -->
        <span> - Temperature: ${deal.temperature}</span> <!-- Displaying temperature -->
        <span> - Date: ${deal.date.toLocaleDateString()}</span> <!-- Displaying date -->
      </div>
    `;
    })
    .join('');

  div.innerHTML = template;
  fragment.appendChild(div);
  sectionDeals.innerHTML = '<h2>Deals</h2>';
  sectionDeals.appendChild(fragment);
};

/**
 * Render page selector
 * @param  {Object} pagination
 */
const renderPagination = pagination => {
  const {currentPage, pageCount} = pagination;
  const options = Array.from(
    {length: pageCount},
    (value, index) => `<option value="${index + 1}">${index + 1}</option>`
  ).join('');

  selectPage.innerHTML = options;
  selectPage.selectedIndex = currentPage - 1;
};

/**
 * Render lego set ids selector
 * @param  {Array} lego set ids
 */
const renderLegoSetIds = deals => {
  const ids = getIdsFromDeals(deals);
  const options = ids.map(id => 
    `<option value="${id}">${id}</option>`
  ).join('');

  selectLegoSetIds.innerHTML = options;
};

/**
 * Render page selector
 * @param  {Object} pagination
 */
const renderIndicators = pagination => {
  const {count} = pagination;

  spanNbDeals.innerHTML = count;
};

const render = (deals, pagination) => {
  renderDeals(deals);
  renderPagination(pagination);
  renderIndicators(pagination);
  renderLegoSetIds(deals)
};

/**
 * Declaration of all Listeners
 */

/**
 * Select the number of deals to display
 */
selectShow.addEventListener('change', async (event) => {
  const deals = await fetchDeals(currentPagination.currentPage, parseInt(event.target.value));

  setCurrentDeals(deals);
  render(currentDeals, currentPagination);
});

document.addEventListener('DOMContentLoaded', async () => {
  const deals = await fetchDeals();

  setCurrentDeals(deals);
  render(currentDeals, currentPagination);
});


// Feature 1
selectPage.addEventListener('change', async (event) => {
  const size = parseInt(selectShow.value); // We get the selected size of deals to show
  const goToPage = parseInt(event.target.value); // We get selected page number
  const deals = await fetchDeals(goToPage, size); // We fetch deals of the selected page with the correct size we want to show

  setCurrentDeals(deals); // We update the state with new deals and pagination
  render(currentDeals, currentPagination); // We re-render the UI
});


sortSelect.addEventListener('change', () => {
  const selectedValue = sortSelect.value;

  if (selectedValue === 'none') {
    // Default case: Reset to all deals
    renderDeals(currentDeals);
    spanNbDeals.innerHTML = currentDeals.length;
  } else if (selectedValue === 'discount-desc') {
    // Filter by discount > 50%
    const filteredDeals = currentDeals.filter(deal => deal.discount > 50);
    renderDeals(filteredDeals.length > 0 ? filteredDeals : []);
    spanNbDeals.innerHTML = filteredDeals.length;
  } else if (selectedValue === 'most-commented') {
    // Filter by deals with more than 15 comments
    const filteredDeals = currentDeals.filter(deal => deal.comments > 15);
  } else if (selectedValue === 'hot-deals') {
    // Filter by temperature > 100
    const filteredDeals = currentDeals.filter(deal => deal.temperature > 100);
  } else if (selectedValue === 'price-asc') {
    // Sort by price: Low to High
    const sortedDeals = [...currentDeals].sort((a, b) => a.price - b.price);
    renderDeals(sortedDeals);
    spanNbDeals.innerHTML = sortedDeals.length;
  } else if (selectedValue === 'price-desc') {
    // Sort by price: High to Low
    const sortedDeals = [...currentDeals].sort((a, b) => b.price - a.price);
    renderDeals(sortedDeals);
    spanNbDeals.innerHTML = sortedDeals.length;
  } else if (selectedValue === 'date-asc') {
    // Sort by date: Oldest First
    const sortedDeals = [...currentDeals].sort((a, b) => a.date - b.date);
    renderDeals(sortedDeals);
    spanNbDeals.innerHTML = sortedDeals.length;
  } else if (selectedValue === 'date-desc') {
    // Sort by date: Newest First
    const sortedDeals = [...currentDeals].sort((a, b) => b.date - a.date);
    renderDeals(sortedDeals);
    spanNbDeals.innerHTML = sortedDeals.length;

    if (filteredDeals.length === 0) {
      sectionDeals.innerHTML = '<h2>No deals corresponding to your filter';
    } else {
      renderDeals(filteredDeals);
      spanNbDeals.innerHTML = filteredDeals.length;
    }
  }
});