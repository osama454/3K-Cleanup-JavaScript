I am a freelance coder and take on projects from various individuals. I just received a project from one of my clients to develop a web application that would help them manage their personal book collections. The application should allow the client to add new books, display a list of books, search for books by title or author, and sort the books by various criteria such as title, author, and publication date. I need help implementing these functionalities using JavaScript. The generated JavaScript code should follow the given set of guidelines. It should initialize the data storage using localforage and display the list of books available to the client. When a book is added, it should make sure the function takes the title, author, and publication date as inputs and stores the book in localforage. It should make use of fuse.js to search for books by title or author. The function should handle cases when no matching book is found, and finally, the program should make use of lodash to sort the books by title, author, or publication date. Make sure that the sorting function can handle cases where the collection is empty or contains books with missing information. I want the code to be as modular as possible and make sure all the code is in one file and runs without any errors.
I want you to generate the code in strict compliance with the following structure:

```javascript
async function addBook(title, author, publicationDate) {

}

async function displayBooks() {

}

async function searchBooks(query) {

}

async function sortBooks(criterion) {

}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { addBook, displayBooks, searchBooks, sortBooks };
}
```

Assume the html body is:
```html
<form id="add-book-form">
  <input id="title" />
  <input id="author" />
  <input id="publication-date" />
  <button type="submit">Add Book</button>
</form>
<ul id="book-list"></ul>
```