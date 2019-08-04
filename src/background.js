const regex_site = /^https?:\/\/(?:[^.]+\.)?(rev?ddit)\.com/
const reddit_title = 'View on reddit'


const getBrowser = () => {
    if (typeof browser !== "undefined") {
        return "firefox";
    } else {
        return "chrome";
    }
}


// For this extension, a missing tabId just means it was closed before
// the page action could be applied, so we can ignore any error
const nothing = () => {
  if (chrome.runtime.lastError) {}
}

const updateTabURL = (url) => {
  const matches = url.match(regex_site)
  if (matches) {
    if (matches[1] === 'reddit') {
      chrome.tabs.update({url: url.replace('reddit.com', 'revddit.com')})
    } else {
      chrome.tabs.update({url: url.replace('revddit.com', 'reddit.com')})
    }
  }
}

chrome.pageAction.onClicked.addListener(tab => {
  updateTabURL(tab.url)
})

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  const matches = tab.url.match(regex_site)
  if (changeInfo.status === 'complete' && matches) {
    if (matches[1] === 'revddit') {
      if (getBrowser() === 'chrome') {
        chrome.pageAction.setTitle({tabId, title: reddit_title}, () => nothing())
      } else {
        chrome.pageAction.setTitle({tabId, title: reddit_title})
      }
    }
    chrome.pageAction.show(tabId, () => nothing());
  } else if (changeInfo.status === 'complete') {
    chrome.pageAction.hide(tabId, () => nothing());
  }
});
chrome.tabs.onCreated.addListener((tab) => {
  const matches = tab.url.match(regex_site)
  if (tab.url && matches) {
    if (matches[1] === 'revddit') {
      if (getBrowser() === 'chrome') {
        chrome.pageAction.setTitle({tabId: tab.id, title: reddit_title}, () => nothing())
      } else {
        chrome.pageAction.setTitle({tabId: tab.id, title: reddit_title})
      }
    }
    chrome.pageAction.show(tab.id, () => nothing());
  }
});


const contextMenu_id = 'revddit-link'
chrome.contextMenus.removeAll(() => {
  chrome.contextMenus.create({
    id: contextMenu_id,
    title: 'revddit/reddit-view toggle',
    contexts: ['link','page'],
    documentUrlPatterns: ['https://*.reddit.com/*', 'https://revddit.com/*']
  })
})
chrome.contextMenus.onClicked.addListener(function(info, tab) {
  if (info.menuItemId == contextMenu_id) {
    let url = info.pageUrl
    if (info.linkUrl) {
      url = info.linkUrl
    }
    updateTabURL(url)
  }
});