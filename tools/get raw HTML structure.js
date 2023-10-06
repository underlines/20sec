// Clone and filter a given DOM element based on allowed elements and attributes
function cloneElement(element, allowedElements, allowedAttributes) {
  const tagName = element.tagName.toLowerCase();
  // Skip elements that aren't in the allowed list
  if (!allowedElements.includes(tagName)) return null;

  // Create a clone of the allowed element
  const clone = document.createElement(tagName);

  // Add only allowed attributes to the clone
  for (const {name, value} of Array.from(element.attributes)) {
    if (allowedAttributes.includes(name) || name.startsWith('data-')) {
      clone.setAttribute(name, value);
    }
  }
  
  return clone;
}

// Recursive function to filter the DOM tree
function filterDOM(root, allowedElements, allowedAttributes) {
  // Create a clone of the root element using allowed elements and attributes
  const clone = cloneElement(root, allowedElements, allowedAttributes);
  if (!clone) return null;

  // Loop through each child element and apply the same filtering
  for (const child of Array.from(root.children)) {
    const childClone = filterDOM(child, allowedElements, allowedAttributes);
    if (childClone) {
      clone.appendChild(childClone);
    }
  }
  
  return clone;
}

// Function to format HTML with proper indentation
function formatHTML(element, indentLevel = 0) {
  // Create the indentation string based on the current level
  const indent = '  '.repeat(indentLevel);
  
  // Initialize the formatted string with the opening tag
  let formatted = `${indent}<${element.tagName.toLowerCase()}`;
  
  // Add allowed attributes to the formatted string
  for (const {name, value} of Array.from(element.attributes)) {
    formatted += ` ${name}="${value}"`;
  }

  // Close the opening tag and add a newline
  formatted += '>\n';
  
  // Format each child element recursively
  for (const child of Array.from(element.children)) {
    formatted += formatHTML(child, indentLevel + 1);
  }
  
  // Add the closing tag and another newline
  formatted += `${indent}</${element.tagName.toLowerCase()}>\n`;
  
  return formatted;
}

// Configuration: Allowed elements and attributes
const allowedElements = ['html', 'head', 'body', 'div', 'a', 'p', 'article', 'section', 'header', 'ul', 'li', 'nav'];
const allowedAttributes = ['href', 'class', 'id'];

// Generate the filtered DOM structure
const filteredDOM = filterDOM(document.documentElement, allowedElements, allowedAttributes);

// Format the filtered DOM and output it
const formattedDOM = formatHTML(filteredDOM);
console.log(formattedDOM);
