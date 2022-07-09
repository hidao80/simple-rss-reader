import lang from "./multilingualization.js";
import env from "./env.js";

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

    rssList = rssList.filter(item => item !== url);

    localStorage.setItem('urls', JSON.stringify(rssList));
}

/**
 * Drawing RSS feeds
 *
 * @param {string} url
 */
function drawFeeds(url) {
    const deleteButton = document.createElement('div');
    deleteButton.classList.add('delete-btn');
    deleteButton.innerHTML = '<i class="fa-solid fa-delete-left"></i>';

    const cardTitle = document.createElement('h3');

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
    fetch(env.proxyUrl + url)
    .then( response => {
        if (response.status !== 200) {
            return false;
        } else {
            return response.text()
        }
    })
    .then( xmlData => {
        if (xmlData === false || xmlData.length <= 0) {
            cardBody.insertAdjacentHTML('beforeend', lang.translate('Failed to load rss.'));
            return;
        }

        // Convert to XML format
        const parser = new DOMParser();
        const doc = parser.parseFromString(xmlData, "text/xml");
        const title = doc.documentElement.getElementsByTagName("title")[0];
        const titleDisplayLength = 22;
        let rss = doc.documentElement.getElementsByTagName("item");

        cardTitle.innerText = title.textContent.substring(0, titleDisplayLength);

        // Creating HTML tags
        for (let i = 0; i < rss.length && i < 10; i++) {
            // Stores title and link information retrieved from RSS
            let rssTitle = rss[i].getElementsByTagName("title")[0].textContent;
            let rssLink = rss[i].getElementsByTagName("link")[0].textContent;

            const tagString = `<a target="_blank" href="${rssLink}">${rssTitle}</a>`;

            cardBody.insertAdjacentHTML('beforeend', tagString);
        }
    })
    .catch( err => {
        cardBody.insertAdjacentHTML('beforeend', lang.translate('Failed to load rss.'));
    });

    $$('#container').appendChild(card);
}

/**
 * Subscribe to RSS feeds from the dialog.
 *
 * @param {Event} e
 */
function addRssFeed(e) {
    // Retrieve a list of URLs from local storage
    let rssList = JSON.parse(localStorage.getItem('urls')) ?? [];

    const rssUrlInput = $$('#add-URL-input');
    const url = rssUrlInput.value;

    // Add URLs entered in the list
    if (urlValication(url)) {
        rssList.push(url);

        // Remove duplicate elements
        // const uniquRssList = [... new Set(rssList)];

        // Write back to local storage
        localStorage.setItem('urls', JSON.stringify([...rssList]));

        modal.hide();
        rssUrlInput.value = '';
        rssUrlInput.classList.remove('is-invalid');

        // Reload and redraw the cards.
        $$('.spinner-container').style.display = 'block';
        document.location.reload();
    } else {
        rssUrlInput.classList.add('is-invalid');
    }
}

/**
 * two-digit conversion
 *
 * @param {int} num
 * @returns {string}
 */
function toTwoDigit(num) {
    return ('00' + num).slice(-2);
}

/**
 * Get the current timestamp string
 *
 * return {string}
 */
function getTimestampString() {
    const now = new Date();
    const year = now.getFullYear();
    const month = toTwoDigit(now.getMonth()+1);
    const date = toTwoDigit(now.getDate());
    const hour = toTwoDigit(now.getHours());
    const min = toTwoDigit(now.getMinutes());

    return year + month + date + hour + min;
}

/**
 * Export json file
 */
function exportJsonFile() {
    // const contentType = 'application/json';
    const contentType = 'text/plain';

    // Creating Anchor Tags
    const downLoadLink = document.createElement("a");

    // Generate HTML text to download
    const outputDataString = localStorage.getItem('urls') ?? [];  // Pass byte strings as they are
    const downloadFileName = 'SimpleRssReaderFeeds_' + getTimestampString() + ".json"
    downLoadLink.download = downloadFileName;
    downLoadLink.href = URL.createObjectURL(new Blob([outputDataString], { type: contentType }));
    downLoadLink.dataset.downloadurl = [contentType, downloadFileName, downLoadLink.href].join(":");
    downLoadLink.click();
}

/**
 * Export json file
 */
function importJsonFile() {
    const files = $$("#upload-file").files;

    if (files.length === 0) {
        console.log("files length = 0");
        return false;
    }

    const file = files[0];
    const reader = new FileReader();
    reader.readAsText(file);
    reader.onload = () => {
        console.log(reader.result);

        // If it is not json, it will generate an error.
        const importFeeds = JSON.parse(reader.result);
        const currentFeeds = JSON.parse(localStorage.getItem('urls'));
        const json = JSON.stringify([...currentFeeds ?? [], ...importFeeds]);

        console.log(json);

        // Write back to local storage
        localStorage.setItem('urls', json);

        // Reload and redraw the cards.
        $$('.spinner-container').style.display = 'block';
        document.location.reload();
    }

    // Cancel a Submit event
    return false;
}

const modal = new bootstrap.Modal($$('#url-input-dialog'));

window.onload = e => {
    // Set event listener
    $$('#add-rss').addEventListener('click', e => modal.show());
    $$('#url-input-dialog-open').addEventListener('click', e => modal.show());
    $$('#url-input-dialog').addEventListener('shown.bs.modal', e => $$('#add-URL-input').focus());
    $$('#url-input-dialog-submit').addEventListener('click', addRssFeed);
    $$('#add-URL-input').addEventListener('keydown', e => {
        if (e.keyCode === 13) {
            addRssFeed(e);
        }
    });
    $$('#export-feeds').addEventListener('click', exportJsonFile);
    $$('#import-feeds').addEventListener('click', e => $$("#upload-file").click());
    $$('#upload-file').addEventListener('change', importJsonFile);

    console.log(lang.language());
    lang.translateAll();

    // Retrieve a list of URLs from local storage
    let rssList = JSON.parse(localStorage.getItem('urls')) ?? [];

    for (let url of rssList) {
        drawFeeds(url);
    }
};


