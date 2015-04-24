'use strict';

var bg = chrome.extension.getBackgroundPage(), $shows = jQuery('#shows');

function insertShows(shows) {
  shows = shows || bg.shows;

  bg.setBadge('');

  if (!shows) {
    $shows.html('checking for shows...');
    return;
  }

  bg.saveSettings({latestShow: bg.getShowID(jQuery(shows).eq(0))});
  $shows.html(shows);
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