const BOOK_ITEMID = "itemId";
const FINISHED_BOOK_LIST = "finishedBookList";
const UNFINISHED_BOOK_LIST = "unfinishedBookList";

function makeBook(title, author, year, isCompleted) {
	const textTitle = document.createElement("h3");
	textTitle.innerText = title;

	const textAuthor = document.createElement("p");
	textAuthor.classList.add("author");
	textAuthor.innerText = "Penulis : " + author;

	const textYear = document.createElement("p");
	textYear.classList.add("year");
	textYear.innerText = "Tahun : " + year;

	const textContainer = document.createElement("div");
	textContainer.classList.add("inner");
	textContainer.append(textTitle, textAuthor, textYear);

	const container = document.createElement("article");
	container.classList.add("book_item");
	container.append(textContainer);

	const buttonContainer = document.createElement("div");
	buttonContainer.classList.add("button-group");

	if (isCompleted) {
		buttonContainer.append(
			createUndoButton(),
			createEditButton(),
			createTrashButton()
		);
		container.append(buttonContainer);
	} else {
		buttonContainer.append(
			createCheckButton(),
			createEditButton(),
			createTrashButton()
		);
		container.append(buttonContainer);
	}
	return container;
}

function createButton(buttonTypeClass, eventListener) {
	const button = document.createElement("button");
	button.classList.add(buttonTypeClass);

	switch (buttonTypeClass) {
		case "check-button":
			button.innerHTML = "Selesai";
			break;
		case "edit-button":
			button.innerHTML = "Ubah";
			break;
		case "trash-button":
			button.innerHTML = "Hapus";
			break;
		case "undo-button":
			button.innerHTML = "Belum Selesai";
			break;
	}
	button.addEventListener("click", function(event) {
		eventListener(event);
		event.stopPropagation();
	});
	return button;
}

function createCheckButton() {
	return createButton("check-button", function(event) {
		addBookToFinished(event.target.parentElement);
	});
}

function createEditButton() {
	return createButton("edit-button", function(event) {
		editBookFromBookshelf(event.target.parentElement);
	});
}

function createTrashButton() {
	return createButton("trash-button", function(event) {
		removeBookFromBookshelf(event.target.parentElement);
	});
}

function createUndoButton() {
	return createButton("undo-button", function(event) {
		undoBookFromFinished(event.target.parentElement);
	});
}

function addBook() {
	const textBook = document.getElementById("inputBookTitle").value;
	const textAuthor = document.getElementById("inputBookAuthor").value;
	const textYear = document.getElementById("inputBookYear").value;
	const isCompleted = document.getElementById("inputBookIsComplete").checked;

	const book = makeBook(textBook, textAuthor, textYear, isCompleted);
	const bookObject = composeBookObject(textBook, textAuthor, textYear, isCompleted);
	const form = document.getElementById("inputBook").reset();

	book[BOOK_ITEMID] = bookObject.id;
	books.push(bookObject);

	if (isCompleted) {
		const finishedBookList = document.getElementById(FINISHED_BOOK_LIST);
		finishedBookList.append(book);
	} else {
		const unfinishedBookList = document.getElementById(UNFINISHED_BOOK_LIST);
		unfinishedBookList.append(book);
	}

	document.getElementsByClassName("home")[0].style.display = "block";
	document.getElementsByClassName("add_book")[0].style.display = "none";

	updateDataToStorage();
}

function editBook() {
	const textBook = document.getElementById("editBookTitle").value;
	const textAuthor = document.getElementById("editBookAuthor").value;
	const textYear = document.getElementById("editBookYear").value;
	const isCompleted = document.getElementById("editBookIsComplete").checked;

	const book = makeBook(textBook, textAuthor, textYear, isCompleted);
	const bookObject = composeEditedBookObject(tempId, textBook, textAuthor, textYear, isCompleted);
	const form = document.getElementById("editBook");
	form.reset();

	book[BOOK_ITEMID] = bookObject.id;
	books.splice(tempPosition, 1, bookObject);

	const finishedBookList = document.getElementById(FINISHED_BOOK_LIST);
	const unfinishedBookList = document.getElementById(UNFINISHED_BOOK_LIST);
	finishedBookList.innerHTML = "";
	unfinishedBookList.innerHTML = "";

	document.getElementsByClassName("home")[0].style.display = "block";
	document.getElementsByClassName("edit_book")[0].style.display = "none";

	updateDataToStorage();
	refreshDataFromBooks();
}

function searchBookInBookshelf() {
	const finishedBookList = document.getElementById(FINISHED_BOOK_LIST);
	const unfinishedBookList = document.getElementById(UNFINISHED_BOOK_LIST);
	const inputTitle = document.getElementById("searchBookTitle");
	const search = inputTitle.value.toUpperCase();

	let finished = 0, unfinished = 0;

	const finishedList = finishedBookList.getElementsByClassName("book_item");
	const unfinishedList = unfinishedBookList.getElementsByClassName("book_item");

	for (book of books) {
		if (book.title.toUpperCase().indexOf(search) > -1) {
			if (book.isCompleted) {
				finishedList[finished++].style.display = "";
			} else {
				unfinishedList[unfinished++].style.display = "";
			}
		} else {
			if (book.isCompleted) {
				finishedList[finished++].style.display = "none";
			} else {
				unfinishedList[unfinished++].style.display = "none";
			}
		}
	}
}

function addBookToFinished(bookElement) {
	const finishedBookList = document.getElementById(FINISHED_BOOK_LIST);
	const bookTitle = bookElement.parentElement.querySelector(".inner > h3").innerText;
	const bookAuthor = bookElement.parentElement.querySelector(".inner > .author").innerText;
	const bookYear = bookElement.parentElement.querySelector(".inner > .year").innerText;

	const newBook = makeBook(bookTitle, bookAuthor, bookYear, true);

	const book = findBook(bookElement.parentElement[BOOK_ITEMID]);
	book.isCompleted = true;
	newBook[BOOK_ITEMID] = book.id;

	finishedBookList.append(newBook);
	bookElement.parentElement.remove();

	updateDataToStorage();
}

function editBookFromBookshelf(bookElement) {
	const bookPosition = findBookIndex(bookElement.parentElement[BOOK_ITEMID]);
	tempId = bookElement.parentElement[BOOK_ITEMID];
	tempPosition = bookPosition;

	document.getElementById("editBookTitle").value = books[bookPosition].title;
	document.getElementById("editBookAuthor").value = books[bookPosition].author;
	document.getElementById("editBookYear").value = books[bookPosition].year;
	document.getElementById("editBookIsComplete").checked = books[bookPosition].isCompleted;

	document.getElementsByClassName("home")[0].style.display = "none";
	document.getElementsByClassName("edit_book")[0].style.display = "block";

	bookElement.parentElement.remove();
}

function removeBookFromBookshelf(bookElement) {
	const bookPosition = findBookIndex(bookElement.parentElement[BOOK_ITEMID]);
	books.splice(bookPosition, 1);
	bookElement.parentElement.remove();
	updateDataToStorage();
}

function undoBookFromFinished(bookElement) {
	const unfinishedBookList = document.getElementById(UNFINISHED_BOOK_LIST);
	const bookTitle = bookElement.parentElement.querySelector(".inner > h3").innerText;
	const bookAuthor = bookElement.parentElement.querySelector(".inner > .author").innerText;
	const bookYear = bookElement.parentElement.querySelector(".inner > .year").innerText;

	const newBook = makeBook(bookTitle, bookAuthor, bookYear, false);

	const book = findBook(bookElement.parentElement[BOOK_ITEMID]);
	book.isCompleted = false;
	newBook[BOOK_ITEMID] = book.id;

	unfinishedBookList.append(newBook);
	bookElement.parentElement.remove();

	updateDataToStorage();
}

function refreshDataFromBooks() {
	const finishedBookList = document.getElementById(FINISHED_BOOK_LIST);
	const unfinishedBookList = document.getElementById(UNFINISHED_BOOK_LIST);

	for (book of books) {
		const newBook = makeBook(book.title, book.author, book.year, book.isCompleted);
		newBook[BOOK_ITEMID] = book.id;

		if (book.isCompleted) {
			finishedBookList.append(newBook);
		} else {
			unfinishedBookList.append(newBook);
		}
	}
}

function cancelForm() {
	document.getElementsByClassName("home")[0].style.display = "block";
	refreshDataFromBooks();

	const finishedBookList = document.getElementById(FINISHED_BOOK_LIST);
	const unfinishedBookList = document.getElementById(UNFINISHED_BOOK_LIST);
	finishedBookList.innerHTML = "";
	unfinishedBookList.innerHTML = "";
	refreshDataFromBooks();
}