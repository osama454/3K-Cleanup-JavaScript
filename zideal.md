1. `index.html`

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Book Collection</title>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/localforage/1.10.0/localforage.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/fuse.js/6.6.2/fuse.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/lodash.js/4.17.21/lodash.min.js"></script>
  </head>
  <body>
    <h1>Manage Your Book Collection</h1>
    <form id="add-book-form">
      <input type="text" id="title" placeholder="Book Title" required />
      <input type="text" id="author" placeholder="Author" required />
      <input type="text" id="publication-date" placeholder="Publication Date" />
      <button type="submit">Add Book</button>
    </form>

    <h2>Book List</h2>
    <ul id="book-list"></ul>

    <h2>Search Books</h2>
    <input
      type="text"
      id="search-query"
      placeholder="Search by title or author"
    />
    <button
      onclick="searchBooks(document.getElementById('search-query').value)"
    >
      Search
    </button>

    <h2>Sort Books</h2>
    <button onclick="sortBooks('title')">Sort by Title</button>
    <button onclick="sortBooks('author')">Sort by Author</button>
    <button onclick="sortBooks('publicationDate')">
      Sort by Publication Date
    </button>

    <script src="script.js"></script>
  </body>
</html>
```

2. `script.js`

```js
const localforage =
  typeof require !== "undefined" ? require("localforage") : window.localforage;

async function addBook(title, author, publicationDate) {
  try {
    const books = (await localforage.getItem("books")) || [];

    title = title.trim() || "Unknown Title";
    author = author.trim() || "Unknown Author";
    publicationDate = publicationDate ? publicationDate.trim() : null;

    const duplicate = books.some(
      (book) =>
        book.title.toLowerCase() === title.toLowerCase() &&
        book.author.toLowerCase() === author.toLowerCase()
    );

    if (duplicate) {
      return;
    }

    const newBook = { title, author, publicationDate };
    books.push(newBook);
    await localforage.setItem("books", books);

    await displayBooks();
  } catch (error) {
    console.error("Error adding book:", error);
  }
}

async function displayBooks() {
  try {
    const books = (await localforage.getItem("books")) || [];

    if (typeof document === "undefined") return;

    const bookList = document.getElementById("book-list");
    if (!bookList) return;

    bookList.innerHTML = "";

    if (books.length === 0) {
      bookList.innerHTML = "<p>No books in your collection yet.</p>";
      return;
    }

    books.forEach((book) => {
      const listItem = document.createElement("li");
      listItem.textContent = `${book.title} by ${book.author} (${
        book.publicationDate || "N/A"
      })`;
      bookList.appendChild(listItem);
    });
  } catch (error) {
    console.error("Error displaying books:", error);
  }
}

async function searchBooks(query) {
  try {
    if (!query || query.trim() === "") {
      await displayBooks();
      return [];
    }

    const books = (await localforage.getItem("books")) || [];

    let results = [];
    if (typeof Fuse !== "undefined") {
      const fuse = new Fuse(books, {
        keys: ["title", "author"],
        includeScore: true,
        threshold: 0.4,
      });
      results = fuse.search(query);
    } else {
      results = books
        .filter(
          (book) =>
            book.title.toLowerCase().includes(query.toLowerCase()) ||
            book.author.toLowerCase().includes(query.toLowerCase())
        )
        .map((book) => ({ item: book }));
    }

    const matchingBooks = results.map((result) => result.item);

    if (typeof document === "undefined") return matchingBooks;

    const bookList = document.getElementById("book-list");
    if (!bookList) return matchingBooks;

    bookList.innerHTML = "";

    if (matchingBooks.length === 0) {
      bookList.innerHTML = "<p>No matching books found.</p>";
      return [];
    }

    matchingBooks.forEach((book) => {
      const listItem = document.createElement("li");
      listItem.textContent = `${book.title} by ${book.author} (${
        book.publicationDate || "N/A"
      })`;
      bookList.appendChild(listItem);
    });

    return matchingBooks;
  } catch (error) {
    console.error("Error searching books:", error);
    return [];
  }
}

async function sortBooks(criterion) {
  try {
    const books = (await localforage.getItem("books")) || [];

    if (books.length === 0) {
      return books;
    }

    let sortedBooks;
    if (typeof _ !== "undefined") {
      sortedBooks = _.sortBy(books, [criterion]);
    } else {
      sortedBooks = [...books].sort((a, b) => {
        const valueA = a[criterion] || "";
        const valueB = b[criterion] || "";
        return valueA.toString().localeCompare(valueB.toString());
      });
    }

    await localforage.setItem("books", sortedBooks);

    await displayBooks();
    return sortedBooks;
  } catch (error) {
    console.error("Error sorting books:", error);
    return [];
  }
}

if (typeof document !== "undefined") {
  document.addEventListener("DOMContentLoaded", function () {
    const addBookForm = document.getElementById("add-book-form");
    if (addBookForm) {
      addBookForm.addEventListener("submit", (event) => {
        event.preventDefault();

        const title = document.getElementById("title").value.trim();
        const author = document.getElementById("author").value.trim();
        const publicationDate = document
          .getElementById("publication-date")
          .value.trim();

        if (!title || !author) {
          return;
        }

        addBook(title, author, publicationDate);

        document.getElementById("title").value = "";
        document.getElementById("author").value = "";
        document.getElementById("publication-date").value = "";
      });
    }

    const searchButton = document.querySelector(
      'button[onclick^="searchBooks"]'
    );
    if (searchButton) {
      searchButton.onclick = function () {
        const query = document.getElementById("search-query").value;
        searchBooks(query);
      };
    }

    const searchInput = document.getElementById("search-query");
    if (searchInput) {
      searchInput.addEventListener("keypress", function (e) {
        if (e.key === "Enter") {
          searchBooks(this.value);
        }
      });
    }

    // Expose functions to global scope for button click handlers
    if (typeof window !== "undefined") {
      window.sortBooks = sortBooks;
      window.searchBooks = searchBooks;
      window.displayBooks = displayBooks;
    }

    displayBooks();
  });
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = { addBook, displayBooks, searchBooks, sortBooks };
}
```
