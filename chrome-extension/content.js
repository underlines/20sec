// Create a variable to hold articles
let storedArticles = [];
let originalArticles = [];

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
  .hn-wrapper {
    max-width: 800px;
    margin: 0 auto;
  }
  @media (max-width: 768px) {
    .hn-wrapper {
      max-width: 100%;
      padding: 0 10px;
    }
  }
`;




document.head.appendChild(style);

function resetToOriginalOrder() {
  storedArticles = [...originalArticles];
  renderArticles();
}

function sortArticles(type) {
  storedArticles.sort((a, b) => {
    const aValue = isNaN(Number(a[type])) ? 0 : Number(a[type]);
    const bValue = isNaN(Number(b[type])) ? 0 : Number(b[type]);
    return bValue - aValue;
  });
  renderArticles();
}

function renderArticles() {
  document.body.innerHTML = ''; // Clear existing articles

  // Add sort buttons
  const sortBar = document.createElement('div');

  const sortCommentsBtn = document.createElement('button');
  sortCommentsBtn.innerText = 'Sort by Comments';
  sortCommentsBtn.addEventListener('click', () => sortArticles('comments'));

  const sortReactionsBtn = document.createElement('button');
  sortReactionsBtn.innerText = 'Sort by Reactions';
  sortReactionsBtn.addEventListener('click', () => sortArticles('reactions'));

  const sortSharesBtn = document.createElement('button');
  sortSharesBtn.innerText = 'Sort by Shares';
  sortSharesBtn.addEventListener('click', () => sortArticles('shares'));

  const reverseOrderBtn = document.createElement('button');
  reverseOrderBtn.innerText = 'Reverse Order';
  reverseOrderBtn.addEventListener('click', () => {
    storedArticles.reverse();
    renderArticles();
  });
  
  const resetOrderBtn = document.createElement('button');
  resetOrderBtn.innerText = 'Reset to Original Order';
  resetOrderBtn.addEventListener('click', resetToOriginalOrder);
  
  sortBar.appendChild(resetOrderBtn);
  sortBar.appendChild(sortCommentsBtn);
  sortBar.appendChild(sortReactionsBtn);
  sortBar.appendChild(sortSharesBtn);
  sortBar.appendChild(reverseOrderBtn);

  document.body.appendChild(sortBar);

  // Create wrapper
  const wrapper = document.createElement('div');
  wrapper.className = 'hn-wrapper';
  // Append sortBar to wrapper
  wrapper.appendChild(sortBar);

  storedArticles.forEach((articleData) => {
    const articleDiv = document.createElement('div');
    articleDiv.className = 'hn-article';
    const articleLink = document.createElement('a');
    articleLink.className = 'hn-article-link';
    articleLink.href = articleData.href;
    articleLink.innerText = articleData.title;
    const articleInfo = document.createElement('div');
    articleInfo.className = 'hn-article-info';
    articleInfo.innerText = `Comments: ${articleData.comments}, Reactions: ${articleData.reactions}, Shares: ${articleData.shares}`;

    articleDiv.appendChild(articleLink);
    articleDiv.appendChild(articleInfo);
    document.body.appendChild(articleDiv);
    
    wrapper.appendChild(articleDiv);
  });
  
  // Append wrapper to body
  document.body.appendChild(wrapper);
}

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

			articles.forEach((article, index) => {
			  const a = article.querySelector('a');

			  const mainTitleSpan = a ? a.querySelector('h2 > span:last-child') : null;
			  const mainTitle = mainTitleSpan ? mainTitleSpan.innerText : 'No Title';
			  const subTitleSpan = a ? a.querySelector('h2 > div > span') : null;
			  const subTitle = subTitleSpan ? subTitleSpan.innerText : null;
			  const tagSpan = a ? a.querySelector('div > div > span') : null;
			  const tag = tagSpan ? tagSpan.innerText : null;

			  let formattedTitle = mainTitle;
			  if (subTitle) {
				formattedTitle = `${subTitle}: ${formattedTitle}`;
			  }
			  if (tag) {
				formattedTitle = `${formattedTitle} (${tag})`;
			  }

			  const buttons = article.querySelectorAll('button > div');
			  let comments = buttons.length > 0 ? buttons[0].innerText : 'N/A';
			  let reactions = buttons.length > 1 ? buttons[1].innerText : 'N/A';
			  let shares = buttons.length > 2 ? buttons[2].innerText : 'N/A';

			  storedArticles.push({title: formattedTitle, comments, reactions, shares, href: a ? a.href : '#' });
			  originalArticles = [...storedArticles];
			});

			renderArticles();
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
			  
			  // Create wrapper
			  const wrapper = document.createElement('div');
			  wrapper.className = 'hn-wrapper';

			  let alt = false;
			  // clone the top-level <div> elements directly under the <section> within the <article>, using the child combinator (>) to get only direct children
			  articleContent.querySelectorAll(':scope > div').forEach((div, index) => {
				const articleDiv = document.createElement('div');
				articleDiv.className = alt ? 'hn-article-alt' : 'hn-article';
				alt = !alt;  // toggle for alternating styles

				articleDiv.innerHTML = div.innerHTML;

				wrapper.appendChild(articleDiv);
			  });
			  
			  // Append wrapper to body
			  document.body.appendChild(wrapper);
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
