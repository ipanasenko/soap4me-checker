'use strict';

var shows;

function setBadge(text) {
  chrome.browserAction.setBadgeText({
    text: text.toString()
  });
}

var loadingBadge = (function () {
  var showLoading = false;
  return {
    show: function () {
      if (showLoading) {
        return;
      }
      showLoading = true;

      var text = '    ...'.split('');

      (function update() {
        if (!showLoading) {
          return;
        }

        setBadge(text.join(''));
        setTimeout(function () {
          text.push(text.shift());
          update();
        }, 100);
      }());
    },
    hide: function () {
      showLoading = false;
      setBadge('');
    }
  }
}());

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

function saveSettings(settings) {
  console.log(settings);
  chrome.storage.local.set(settings, function () {
    console.log('saved');
  });
}

function getShowID(showLi) {
  return +jQuery(showLi).find('img')[0].src.match(/\/(\d+)\.jpg/)[1];
}

function loadSoapPage(soapPage) {
  return jQuery
    .when(loadSettings(), jQuery.get(soapPage))
    .always(loadingBadge.hide)
    .then(function (settings, soapData) {
      soapData = jQuery(soapData[0]);

      var parsedShows = soapData.find('ul.new'),
        parsedIds = parsedShows.children().toArray().map(getShowID);

      parsedShows = shows = parsedShows.html();

      console.groupCollapsed('response');
      console.log(parsedShows);
      console.groupEnd('response');
      console.log(settings.latestShow, parsedIds);

      var newShows = '';
      if (settings.latestShow !== 0) {
        newShows = parsedIds.filter(function (id) {
          return id > settings.latestShow;
        }).length;

        if (newShows === 0) {
          newShows = '';
        }
      }

      setBadge(newShows);

      settings.latestShow = parsedIds[0];
      saveSettings(settings);

      chrome.runtime.sendMessage({shows: parsedShows});
    });
}

function initCheck() {
  loadingBadge.show();
  loadSoapPage(soapify('/new/soap/'));
}

initCheck();
chrome.alarms.create('initCheck', {
  delayInMinutes: 60,
  periodInMinutes: 60
});
chrome.alarms.onAlarm.addListener(function (alarm) {
  if (alarm.name === 'initCheck') {
    initCheck();
  }
});