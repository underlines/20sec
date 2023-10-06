// Add a simple Hacker News-like stylesheet to the page
const style = document.createElement('style');
style.textContent = `
  .hn-article { 
    background-color: #f6f6ef; 
    margin: 10px 0; 
    padding: 8px; 
  }
  .hn-article-alt { 
    background-color: #e6e6df;
    margin: 10px 0; 
    padding: 8px; 
  }
  .hn-article-link {
    color: #000000;
    text-decoration: none;
    font-size: 14px;
  }
  .hn-article-info {
    font-size: 12px;
    color: #828282;
  }
`;
document.head.appendChild(style);

// Listen for state changes from the background script
chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    if (request.message === 'stateChanged') {
      if (request.newState === 'off') {
        location.reload();
      } else if (request.newState === 'on') {
        manipulateDOM();
      }
    }
  }
);

function manipulateDOM() {
	const url = window.location.href;
	// home page
	if (url === 'https://www.20min.ch/') {
	  chrome.storage.sync.get('extensionState', function(result) {
		if (result.extensionState === 'on') {
		  const articles = document.querySelectorAll('section > div > article');

		  // Clear the entire body to remove any existing clutter
		  document.body.innerHTML = '';

		  articles.forEach((article, index) => {
			const articleDiv = document.createElement('div');
			articleDiv.className = 'hn-article';

			const a = article.querySelector('a');

			// Extracting Main title
			const mainTitleSpan = a ? a.querySelector('h2 > span:last-child') : null;
			const mainTitle = mainTitleSpan ? mainTitleSpan.innerText : 'No Title';
			// Extracting Sub title
			const subTitleSpan = a ? a.querySelector('h2 > div > span') : null;
			const subTitle = subTitleSpan ? subTitleSpan.innerText : null;
			// Extracting Tag
			const tagSpan = a ? a.querySelector('div > div > span') : null;
			const tag = tagSpan ? tagSpan.innerText : null;
			// Formatting the title
			let formattedTitle = mainTitle;
			if (subTitle) {
			  formattedTitle = `${subTitle}: ${formattedTitle}`;
			}
			if (tag) {
			  formattedTitle = `${formattedTitle} (${tag})`;
			}

			const articleLink = document.createElement('a');
			articleLink.className = 'hn-article-link';
			articleLink.href = a ? a.href : '#';
			articleLink.innerText = formattedTitle;

			const buttons = article.querySelectorAll('button > div');
			let comments = buttons.length > 0 ? buttons[0].innerText : 'N/A';
			let reactions = buttons.length > 1 ? buttons[1].innerText : 'N/A';
			let shares = buttons.length > 2 ? buttons[2].innerText : 'N/A';

			const articleInfo = document.createElement('div');
			articleInfo.className = 'hn-article-info';
			articleInfo.innerText = `Comments: ${comments}, Reactions: ${reactions}, Shares: ${shares}`;

			articleDiv.appendChild(articleLink);
			articleDiv.appendChild(articleInfo);

			document.body.appendChild(articleDiv);
		  });
		}
	  });
	}
	// article (story) page
	else if (url.startsWith('https://www.20min.ch/story/')) {
		chrome.storage.sync.get('extensionState', function(result) {
		  if (result.extensionState === 'on') {
			const articleContent = document.querySelector('article > section');
			
			if (articleContent) {
			  // Clear the entire body to remove existing clutter
			  document.body.innerHTML = '';

			  let alt = false;

			  articleContent.querySelectorAll('div').forEach((div, index) => {
				const articleDiv = document.createElement('div');
				articleDiv.className = alt ? 'hn-article-alt' : 'hn-article';
				alt = !alt;  // toggle for alternating styles

				articleDiv.innerHTML = div.innerHTML;

				document.body.appendChild(articleDiv);
			  });
			}
		  }
		});
	}
}

// Call manipulateDOM on page load as well
chrome.storage.sync.get('extensionState', function(result) {
  if (result.extensionState === 'on') {
    manipulateDOM();
  }
});
