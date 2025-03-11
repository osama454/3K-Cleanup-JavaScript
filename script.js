const localforage =
  typeof require !== 'undefined' ? require('localforage') : window.localforage;

async function addBook(title, author, publicationDate) {
  try {
    const books = (await localforage.getItem('books')) || [];

    title = title.trim() || 'Unknown Title';
    author = author.trim() || 'Unknown Author';
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
    await localforage.setItem('books', books);

    await displayBooks();
  } catch (error) {
    console.error('Error adding book:', error);
  }
}

async function displayBooks() {
  try {
    const books = (await localforage.getItem('books')) || [];

    if (typeof document === 'undefined') return;

    const bookList = document.getElementById('book-list');
    if (!bookList) return;

    bookList.innerHTML = '';

    if (books.length === 0) {
      bookList.innerHTML = '<p>No books in your collection yet.</p>';
      return;
    }

    books.forEach((book) => {
      const listItem = document.createElement('li');
      listItem.textContent = `${book.title} by ${book.author} (${
        book.publicationDate || 'N/A'
      })`;
      bookList.appendChild(listItem);
    });
  } catch (error) {
    console.error('Error displaying books:', error);
  }
}

async function searchBooks(query) {
  try {
    if (!query || query.trim() === '') {
      await displayBooks();
      return [];
    }

    const books = (await localforage.getItem('books')) || [];

    let results = [];
    if (typeof Fuse !== 'undefined') {
      const fuse = new Fuse(books, {
        keys: ['title', 'author'],
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

    if (typeof document === 'undefined') return matchingBooks;

    const bookList = document.getElementById('book-list');
    if (!bookList) return matchingBooks;

    bookList.innerHTML = '';

    if (matchingBooks.length === 0) {
      bookList.innerHTML = '<p>No matching books found.</p>';
      return [];
    }

    matchingBooks.forEach((book) => {
      const listItem = document.createElement('li');
      listItem.textContent = `${book.title} by ${book.author} (${
        book.publicationDate || 'N/A'
      })`;
      bookList.appendChild(listItem);
    });

    return matchingBooks;
  } catch (error) {
    console.error('Error searching books:', error);
    return [];
  }
}

async function sortBooks(criterion) {
  try {
    const books = (await localforage.getItem('books')) || [];

    if (books.length === 0) {
      return books;
    }

    let sortedBooks;
    if (typeof _ !== 'undefined') {
      sortedBooks = _.sortBy(books, [criterion]);
    } else {
      sortedBooks = [...books].sort((a, b) => {
        const valueA = a[criterion] || '';
        const valueB = b[criterion] || '';
        return valueA.toString().localeCompare(valueB.toString());
      });
    }

    await localforage.setItem('books', sortedBooks);

    await displayBooks();
    return sortedBooks;
  } catch (error) {
    console.error('Error sorting books:', error);
    return [];
  }
}

if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', function () {
    const addBookForm = document.getElementById('add-book-form');
    if (addBookForm) {
      addBookForm.addEventListener('submit', (event) => {
        event.preventDefault();

        const title = document.getElementById('title').value.trim();
        const author = document.getElementById('author').value.trim();
        const publicationDate = document
          .getElementById('publication-date')
          .value.trim();

        if (!title || !author) {
          return;
        }

        addBook(title, author, publicationDate);

        document.getElementById('title').value = '';
        document.getElementById('author').value = '';
        document.getElementById('publication-date').value = '';
      });
    }

    const searchButton = document.querySelector(
      'button[onclick^="searchBooks"]'
    );
    if (searchButton) {
      searchButton.onclick = function () {
        const query = document.getElementById('search-query').value;
        searchBooks(query);
      };
    }

    const searchInput = document.getElementById('search-query');
    if (searchInput) {
      searchInput.addEventListener('keypress', function (e) {
        if (e.key === 'Enter') {
          searchBooks(this.value);
        }
      });
    }

    // Expose functions to global scope for button click handlers
    if (typeof window !== 'undefined') {
      window.sortBooks = sortBooks;
      window.searchBooks = searchBooks;
      window.displayBooks = displayBooks;
    }

    displayBooks();
  });
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { addBook, displayBooks, searchBooks, sortBooks };
}
