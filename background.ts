// background.js

console.log('Service Worker Loaded');

// Listener for Chrome extension events (e.g., messages)
// chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
//   console.log(message)
//   if (message.action === 'enableSelection') {
//     console.log('resetAppIcon', message);
//     // console.log(chrome.action)
//     // chrome.action.setIcon({ path:{
//     //   "16": chrome.runtime.getURL("icons/selecting/icon16.png"),
//     //   "32": chrome.runtime.getURL("icons/selecting/icon32.png"),
//     //   "48": chrome.runtime.getURL("icons/selecting/icon48.png"),
//     //   "128": chrome.runtime.getURL("icons/selecting/icon128.png")
//     // } });
//     // chrome.action.setIcon({ path:{
//     //   "16": chrome.runtime.getURL("icons/default/icon16.png"),
//     //   "32": chrome.runtime.getURL("icons/default/icon32.png"),
//     //   "48": chrome.runtime.getURL("icons/default/icon48.png"),
//     //   "128": chrome.runtime.getURL("icons/default/icon128.png")
//     // } });
//     sendResponse({ reply: 'Hello from Service Worker!' });
//   }
// });

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "notify") {
    // console.log(message.message); // Log the selected text
    chrome.action.setIcon({ path:{
      "16": chrome.runtime.getURL("icons/selecting/icon16.png"),
      "32": chrome.runtime.getURL("icons/selecting/icon32.png"),
      "48": chrome.runtime.getURL("icons/selecting/icon48.png"),
      "128": chrome.runtime.getURL("icons/selecting/icon128.png")
    } });
    // chrome.notifications.create({
    //   type: 'basic',
    //   iconUrl: chrome.runtime.getURL('icons/extension_48.png'),
    //   title: 'Reminder!',
    //   message: 'Click the extension icon to open the popup!',
    //   priority: 2,
    // });
    
    // chrome.windows.create({
    //   url: chrome.runtime.getURL("action/default_popup.html"), // Use chrome.runtime.getURL in Manifest V3
    //   // type: "popup",
    //   width: 400,
    //   height: 600,
    //   type:"panel",
    // }, (window) => {
    //   // Handle success or error
    //   if (window) {
    //     console.log("Popup window opened successfully");
    //     sendResponse({ success: true });
    //   } else {
    //     console.error("Failed to open popup window");
    //     sendResponse({ success: false });
    //   }
    // });

    // Keep the message channel open until we send the response
    return true; 
  }
});

// // background.js
// chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
//   if (message.action === "reopenPopup") {
//     // Create a new popup window
//     chrome.windows.create({
//       url: chrome.runtime.getURL("index.html"), // Use chrome.runtime.getURL in Manifest V3
//       type: "popup",
//       width: 400,
//       height: 600,
//     });
//     sendResponse({ success: true });
//   }
// });

// Example: Use alarms API to schedule periodic tasks
// chrome.alarms.create('myAlarm', { delayInMinutes: 1, periodInMinutes: 5 });
// chrome.alarms.onAlarm.addListener((alarm) => {
//   if (alarm.name === 'myAlarm') {
//     console.log('Alarm triggered:', alarm);
//   }
// });

    // // Example: Use the tabs API to log active tab
    // chrome.action.onClicked.addListener(async (tab) => {
    //   console.log('Active tab:', tab);
    // });
