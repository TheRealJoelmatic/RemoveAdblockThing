browser.runtime.onInstalled.addListener(() => {
  browser.windows.create({
    url: ["/installed.html"],
  });
});
