import lang from "./multilingualization.js";

/**
 * Obtains a list of nodes matching the specified selector
 *
 * @param {string} id selector
 * @returns {NodeList}
 */
function $$(id) {
    return document.querySelector(id);
}

/**
 * Check if URL
 *
 * @param {string} url
 * @returns {boolean}
 */
function urlValication(url) {
    return /^(http|https):\/\/[^ "]+$/.test(url)
}

/**
 * Remove the specified url from the list of localStorage.
 *
 * @param {string} url
 */
function removeFeeds(url) {
    let rssList = JSON.parse(localStorage.getItem('urls')) ?? [];

    rssList = rssList.filter(item => item.match(`${url}`) == null);

    localStorage.setItem('urls', JSON.stringify(rssList));
}

/**
 * Drawing RSS feeds
 *
 * @param {string} url
 */
function drawFeeds(url) {
    const domain = url.split('/')[2];

    const deleteButton = document.createElement('div');
    deleteButton.classList.add('delete-btn');
    deleteButton.innerHTML = '<i class="fa-solid fa-delete-left"></i>';

    const cardTitle = document.createElement('h3');
    cardTitle.innerText = domain;  // Domain in URL

    const cardBody = document.createElement("div")
    cardBody.classList.add('card-body');
    cardBody.classList.add('rss-entries');

    const card = document.createElement("div")
    card.classList.add('card')
    card.classList.add('feed-card')
    card.setAttribute('data-url', url)
    card.appendChild(cardTitle);
    card.appendChild(deleteButton);
    card.appendChild(cardBody);

    deleteButton.addEventListener('click', e => {
        card.remove();
        removeFeeds(card.getAttribute('data-url'));
    });

    // Object.defineProperty(document, "referrer", {value: domain}); // CORS avoidance
    fetch(url)
    .then( response => response.text())
    .then( xmlData => {
        if (xmlData.length <= 0) {
            return;
        }

        // Convert to XML format
        const parser = new DOMParser();
        const doc = parser.parseFromString(xmlData, "text/xml");
        let rss = doc.documentElement.getElementsByTagName("item");

        // Creating HTML tags
        for (let i = 0; i <= rss.length && i < 10; i++) {
            // Stores title and link information retrieved from RSS
            let rssTitle = rss[i].getElementsByTagName("title")[0].textContent;
            let rssLink = rss[i].getElementsByTagName("link")[0].textContent;

            const tagString = `<a href="${rssLink}">${rssTitle}</a><br/>`;

            cardBody.insertAdjacentHTML('beforeend', tagString);
        }
    })
    .catch( err => {
        cardBody.insertAdjacentHTML('beforeend', lang.translate('Failed to load rss.'));
    });

    $$('#container').appendChild(card);
}

async function copyToClipboard(text) {
    try {
        await navigator.clipboard.writeText(text)
        return ;
    } catch (error) {
        return ;
    }
}

const modal = new bootstrap.Modal($$('#url-input-dialog'));

$$('#add-rss').addEventListener('click', e => {
    modal.show();
});

$$('#url-input-dialog').addEventListener('shown.bs.modal', e => {
    $$('#add-URL-input').focus()
});

$$('#url-input-dialog-submit').addEventListener('click', e => {
    // Retrieve a list of URLs from local storage
    let rssList = JSON.parse(localStorage.getItem('urls')) ?? [];

    const rssUrlInput = $$('#add-URL-input');
    const url = rssUrlInput.value;

    // Add URLs entered in the list
    if (urlValication(url)) {
        rssList.push(url);

        // Remove duplicate elements
        const uniquRssList = [... new Set(rssList)];

        // Write back to local storage
        localStorage.setItem('urls', JSON.stringify(uniquRssList));

        modal.hide();
        rssUrlInput.value = '';
        rssUrlInput.classList.remove('is-invalid');
    } else {
        rssUrlInput.classList.add('is-invalid');
    }

    // Reload and redraw the cards.
    document.location.reload();
});

window.onload = e => {
    console.log(lang.language());
    lang.translateAll();

    // Retrieve a list of URLs from local storage
    let rssList = JSON.parse(localStorage.getItem('urls')) ?? [];

    for (let url of rssList) {
        drawFeeds(url);
    }
};


