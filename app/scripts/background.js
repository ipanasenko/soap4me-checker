'use strict';

var shows;

function setBadge(text) {
  chrome.browserAction.setBadgeText({
    text: text
  });
}

function loadSettings() {
  var settingsLoader = jQuery.Deferred();

  settingsLoader.done(function (settings) {
    console.log('settings loaded:', settings);
  });

  chrome.storage.local.get(defaultSettings, function (settings) {
    settingsLoader.resolve(settings);
  });
  return settingsLoader.promise();
}

function saveSettings() {

}


function initCheck() {
  jQuery
    .when(loadSettings(), jQuery.get(soapify('/new/soap/')))
    .then(function (settings, soapData) {
      console.log(settings, soapData);

      soapData = jQuery(soapData[0]);

      var parsedShows = shows = soapData.find('ul.new').html();

      chrome.runtime.sendMessage({shows: parsedShows});
    });
}

setTimeout(initCheck, 3000);
//initCheck();
chrome.alarms.create('initCheck', {
  // check every day, no need to check more often
  delayInMinutes: 1440,
  periodInMinutes: 1440
});
chrome.alarms.onAlarm.addListener(function (alarm) {
  if (alarm.name === 'initCheck') {
    initCheck();
  }
});