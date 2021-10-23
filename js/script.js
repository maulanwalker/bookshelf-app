document.addEventListener("DOMContentLoaded", function(){
	const submitForm = document.getElementById("inputBook");
	const submitEditForm = document.getElementById("editBook");
	const searchBook = document.getElementById("searchBookForm");

	submitForm.addEventListener("submit", function(event){
		event.preventDefault();
		addBook();
	});

	submitEditForm.addEventListener("submit", function(event){
		event.preventDefault();
		editBook();
	});

	searchBook.addEventListener("submit", function(event){
		event.preventDefault();
		searchBookInBookshelf();
	});

	if(isStorageExist()){
		loadDataFromStorage();
	}
});

document.addEventListener("ondataloaded", () => {
	refreshDataFromBooks();
});

const checkbox = document.querySelector("input[id=inputBookIsComplete]");
const addBookButton = document.getElementById("addBookButton");
const cancelAdd = document.getElementById("cancelAddBook");
const cancelEdit = document.getElementById("cancelEditBook");

checkbox.addEventListener("change", function(){
	let choice = document.getElementById("choice");
	if (this.checked) {
		choice.innerText = "Selesai dibaca";
	} else {
		choice.innerText = "Belum selesai dibaca";
	}
});

addBookButton.addEventListener("click", function() {
	document.getElementsByClassName("home")[0].style.display = "none";
	document.getElementsByClassName("add_book")[0].style.display = "block";
});

cancelAdd.addEventListener("click", function() {
	document.getElementsByClassName("add_book")[0].style.display = "none";
	cancelForm();
});

cancelEdit.addEventListener("click", function() {
	document.getElementsByClassName("edit_book")[0].style.display = "none";
	cancelForm();
});