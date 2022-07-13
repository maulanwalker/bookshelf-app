const BOOK_ITEMID = "itemId";
const FINISHED_BOOK_LIST = "#finishedBookList";
const UNFINISHED_BOOK_LIST = "#unfinishedBookList";

function makeBook(title, author, year, isCompleted) {
	const textContainer = $("<div></div>").addClass("inner")[0];
	textContainer.append($("<h3></h3>").text(title)[0],
	$($("<p></p>").addClass("author")).text("Penulis : " + author)[0], 
	$($("<p></p>").addClass("year")).text("Tahun : " + year)[0]);

	const container = $("<article></article>").addClass("book_item")[0];
	container.append(textContainer);

	const buttonContainer = $("<div></div>").addClass("button-group")[0];

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
	const button = $("<button></button>").addClass(buttonTypeClass)[0];
	let iconClass;
	switch (buttonTypeClass) {
		case "check-button" :
			iconClass = "fa-check-circle-o";
			break;
		case "undo-button" :
			iconClass = "fa-undo";
			break;
		case "edit-button" :
			iconClass = "fa-edit";
			break;
		case "trash-button" :
			iconClass = "fa-trash-o";
			break;
	}
	const icon = $("<i></i>").addClass("fa " + iconClass)[0];
	button.append(icon);

	button.addEventListener("click", function(event) {
		eventListener(event);
		event.stopPropagation();
	});
	return button;
}

function createCheckButton() {
	return createButton("check-button", function(event) {
		addBookToFinished(event.target.parentElement.parentElement);
	});
}

function createEditButton() {
	return createButton("edit-button", function(event) {
		editBookFromBookshelf(event.target.parentElement.parentElement);
	});
}

function createTrashButton() {
	return createButton("trash-button", function(event) {
		removeBookFromBookshelf(event.target.parentElement.parentElement);
	});
}

function createUndoButton() {
	return createButton("undo-button", function(event) {
		undoBookFromFinished(event.target.parentElement.parentElement);
	});
}

function addBook() {
	const textBook = $("#inputBookTitle").val();
	const textAuthor = $("#inputBookAuthor").val();
	const textYear = $("#inputBookYear").val();
	const isCompleted = $("#inputBookIsComplete").is(':checked');

	const book = makeBook(textBook, textAuthor, textYear, isCompleted);
	const bookObject = composeBookObject(textBook, textAuthor, textYear, isCompleted);

	book[BOOK_ITEMID] = bookObject.id;
	books.push(bookObject);

	isCompleted ? $(FINISHED_BOOK_LIST).append(book) : $(UNFINISHED_BOOK_LIST).append(book);

	$(".home:eq(0)").css("display", "block");
	$(".add_book:eq(0)").css("display", "none");

	updateDataToStorage();
}

function editBook() {
	const textBook = $("#editBookTitle").val();
	const textAuthor = $("#editBookAuthor").val();
	const textYear = $("#editBookYear").val();
	const isCompleted = $("#editBookIsComplete").is(':checked');

	const book = makeBook(textBook, textAuthor, textYear, isCompleted);
	const bookObject = composeEditedBookObject(tempId, textBook, textAuthor, textYear, isCompleted);
	$(".edit_book").hide();

	book[BOOK_ITEMID] = bookObject.id;
	books.splice(tempPosition, 1, bookObject);

	$(FINISHED_BOOK_LIST).html("");
	$(UNFINISHED_BOOK_LIST).html("");

	$(".home:eq(0)").css("display", "block");
	$(".add_book:eq(0)").css("display", "none");

	updateDataToStorage();
	refreshDataFromBooks();
}

function searchBookInBookshelf() {
	let finished = 0, unfinished = 0;

	for (book of books) {
		book.title.toUpperCase().indexOf($("#searchBookTitle").val().toUpperCase()) > -1 ?
			(book.isCompleted ? $($(FINISHED_BOOK_LIST).children()[finished++]).css("display", "") : $($(UNFINISHED_BOOK_LIST).children()[unfinished++]).css("display", "")) :
			(book.isCompleted ? $($(FINISHED_BOOK_LIST).children()[finished++]).css("display", "none") : $($(UNFINISHED_BOOK_LIST).children()[unfinished++]).css("display", "none"));
	}
}

function addBookToFinished(bookElement) {
	$(bookElement).attr('class') === "book_item" ? bookElement = $(bookElement).children()[1] : bookElement;

	const bookTitle = $($($($(bookElement)).siblings()[0]).children()[0]).text();
	const bookAuthor = $($($($(bookElement)).siblings()[0]).children()[1]).text();
	const bookYear = $($($($(bookElement)).siblings()[0]).children()[2]).text();

	const newBook = makeBook(bookTitle, bookAuthor.slice(10), bookYear.slice(7), true);

	const book = findBook($(bookElement).parent()[0][BOOK_ITEMID]);
	book.isCompleted = true;
	newBook[BOOK_ITEMID] = book.id;

	$(FINISHED_BOOK_LIST).append(newBook);
	$($(bookElement).parent()[0]).remove();

	updateDataToStorage();
}

function editBookFromBookshelf(bookElement) {
	$(bookElement).attr('class') === "book_item" ? bookElement = $(bookElement).children()[1] : bookElement;

	const bookPosition = findBookIndex($(bookElement).parent()[0][BOOK_ITEMID]);
	tempId = $(bookElement).parent()[0][BOOK_ITEMID];
	tempPosition = bookPosition;

	$("#editBookTitle").val(books[bookPosition].title);
	$("#editBookAuthor").val(books[bookPosition].author);
	$("#editBookYear").val(books[bookPosition].year);
	$("#editBookIsComplete").val(books[bookPosition].isCompleted);

	$($(".home")[0]).css("display", "none");
	$($(".edit_book")[0]).css("display", "block");

	$($(bookElement).parent()[0]).remove();
}

function removeBookFromBookshelf(bookElement) {
	$(bookElement).attr('class') === "book_item" ? bookElement = $(bookElement).children()[1] : bookElement;

	const bookPosition = findBookIndex($(bookElement).parent()[0][BOOK_ITEMID]);
	books.splice(bookPosition, 1);
	$($(bookElement).parent()[0]).remove();
	updateDataToStorage();
}

function undoBookFromFinished(bookElement) {
	$(bookElement).attr('class') === "book_item" ? bookElement = $(bookElement).children()[1] : bookElement;

	const bookTitle = $($($($(bookElement)).siblings()[0]).children()[0]).text();
	const bookAuthor = $($($($(bookElement)).siblings()[0]).children()[1]).text();
	const bookYear = $($($($(bookElement)).siblings()[0]).children()[2]).text();

	const newBook = makeBook(bookTitle, bookAuthor.slice(10), bookYear.slice(7), false);

	const book = findBook($(bookElement).parent()[0][BOOK_ITEMID]);
	book.isCompleted = false;
	newBook[BOOK_ITEMID] = book.id;

	$(UNFINISHED_BOOK_LIST).append(newBook);
	$($(bookElement).parent()[0]).remove();

	updateDataToStorage();
}

function refreshDataFromBooks() {
	for (book of books) {
		const newBook = makeBook(book.title, book.author, book.year, book.isCompleted);
		newBook[BOOK_ITEMID] = book.id;
		book.isCompleted ? $(FINISHED_BOOK_LIST).append(newBook) : $(UNFINISHED_BOOK_LIST).append(newBook);
	}
}

function cancelForm() {
	$($(".home")[0]).css("display", "block");
	refreshDataFromBooks();

	$(FINISHED_BOOK_LIST).html("");
	$(UNFINISHED_BOOK_LIST).html("");

	refreshDataFromBooks();
}