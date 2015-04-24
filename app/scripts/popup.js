'use strict';

var bg = chrome.extension.getBackgroundPage();

function insertShows(shows) {
  shows = shows || bg.shows || 'checking for shows...';

  jQuery('#shows').html(shows);
}

insertShows();
chrome.runtime.onMessage.addListener(function (request) {
  insertShows(request.shows);
});

jQuery(document).on('click', 'a', function (e) {
  e.preventDefault();
  chrome.tabs.create({
    url: soapify(this.getAttribute('href'))
  });
});