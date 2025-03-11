```javascript
jest.mock('localforage');

const localforage = require('localforage');
const { addBook, displayBooks, searchBooks, sortBooks } = require('./script');

let storage = {};

localforage.getItem.mockImplementation((key) => {
  return Promise.resolve(storage[key]);
});

localforage.setItem.mockImplementation((key, value) => {
  storage[key] = value;
  return Promise.resolve(value);
});

beforeEach(async () => {
  jest.clearAllMocks();
  storage = {};
  await localforage.clear();
  document.body.innerHTML = ` 
    <form id="add-book-form">
      <input id="title" />
      <input id="author" />
      <input id="publication-date" />
      <button type="submit">Add Book</button>
    </form>
    <ul id="book-list"></ul>
  `;
});

it('should add a new book to the collection', async () => {
  await addBook('The Lord of the Rings', 'J.R.R. Tolkien', '1954');
  expect(localforage.setItem).toHaveBeenCalledWith('books', [
    {
      title: 'The Lord of the Rings',
      author: 'J.R.R. Tolkien',
      publicationDate: '1954',
    },
  ]);
});

it('should not add a duplicate book', async () => {
  await addBook('The Lord of the Rings', 'J.R.R. Tolkien', '1954');
  await addBook('The Lord of the Rings', 'J.R.R. Tolkien', '1954');
  expect(localforage.setItem).toHaveBeenCalledTimes(1);
});

it('should display an empty collection message', async () => {
  await displayBooks();
  const bookListContainer = document.getElementById('book-list');
  expect(bookListContainer.innerHTML).toContain(
    'No books in your collection yet.'
  );
});

it('should sort books by title', async () => {
  storage['books'] = [
    {
      title: "The Hitchhiker's Guide to the Galaxy",
      author: 'Douglas Adams',
      publicationDate: '1979',
    },
    {
      title: 'Pride and Prejudice',
      author: 'Jane Austen',
      publicationDate: '1813',
    },
  ];

  await sortBooks('title');
  expect(localforage.setItem).toHaveBeenCalledWith('books', [
    {
      title: 'Pride and Prejudice',
      author: 'Jane Austen',
      publicationDate: '1813',
    },
    {
      title: "The Hitchhiker's Guide to the Galaxy",
      author: 'Douglas Adams',
      publicationDate: '1979',
    },
  ]);
});

it('should sort books by author', async () => {
  storage['books'] = [
    {
      title: "The Hitchhiker's Guide to the Galaxy",
      author: 'Douglas Adams',
      publicationDate: '1979',
    },
    {
      title: 'Pride and Prejudice',
      author: 'Jane Austen',
      publicationDate: '1813',
    },
  ];

  await sortBooks('author');
  expect(localforage.setItem).toHaveBeenCalledWith('books', [
    {
      title: "The Hitchhiker's Guide to the Galaxy",
      author: 'Douglas Adams',
      publicationDate: '1979',
    },
    {
      title: 'Pride and Prejudice',
      author: 'Jane Austen',
      publicationDate: '1813',
    },
  ]);
});

it('should sort books by publication date', async () => {
  storage['books'] = [
    {
      title: "The Hitchhiker's Guide to the Galaxy",
      author: 'Douglas Adams',
      publicationDate: '1979',
    },
    {
      title: 'Pride and Prejudice',
      author: 'Jane Austen',
      publicationDate: '1813',
    },
  ];

  await sortBooks('publicationDate');
  expect(localforage.setItem).toHaveBeenCalledWith('books', [
    {
      title: 'Pride and Prejudice',
      author: 'Jane Austen',
      publicationDate: '1813',
    },
    {
      title: "The Hitchhiker's Guide to the Galaxy",
      author: 'Douglas Adams',
      publicationDate: '1979',
    },
  ]);
});

it('should display "N/A" if publication date is missing', async () => {
  storage['books'] = [
    {
      title: 'To Kill a Mockingbird',
      author: 'Harper Lee',
      publicationDate: null,
    },
  ];
  await displayBooks();
  const bookListContainer = document.getElementById('book-list');
  expect(bookListContainer.innerHTML).toContain(
    'To Kill a Mockingbird by Harper Lee (N/A)'
  );
});

```