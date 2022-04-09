// Get references of the elements in JavaScript

const groceryItemForm = document.querySelector('#grocery-item-form');
const groceryItemName = document.querySelector('#grocery-item-name');
const groceryItemDescription = document.querySelector('#grocery-item-description');
const addItemButton = document.querySelector('#add-item-btn');
const groceryList = document.querySelector('.item-list');
const clearListButton = document.querySelector('#clear-list-btn');
const filterItemsInput = document.querySelector('#filter');
const cancelButton = document.querySelector('#cancel-btn');
const editButton = document.querySelector('#edit-btn');
const groceryModeTitle = document.querySelector('#grocery-mode-title');

let itemIdCounter = 0;

// Load all event listeners
loadEventListeners();

function loadEventListeners() {

    // Retrieve Items on Load Event Listener

    document.addEventListener('DOMContentLoaded', init);

    // Add Item Event Listener
    groceryItemForm.addEventListener('submit', addItemToList);

    // Add Edit Item Event Listener
    editButton.addEventListener('click', confirmEdit);

    // Add Cancel Edit Event Listener
    cancelButton.addEventListener ('click', cancelEditMode);

    // Clear List event Listener
    clearListButton.addEventListener('click', clearItemFromList);

    // Filter List event Listener
    filterItemsInput.addEventListener('input', filterItems);
}

function init() {
    groceryItemForm.setAttribute('mode', 'add');

    retrieveItems();
}

// Add items to the list

function addItemToList(e) {

    // Retrieve values for name and description
    let itemName = groceryItemName.value
    let itemDescription = groceryItemDescription.value;

    // Check for blank inputs

    if (itemName === '' || itemDescription === '') {
        alert('Vpisati morate vse podatke! Prosimo poskusite ponovno!');

        e.preventDefault();
        return;
    }

    createItem(itemName, itemDescription);

    groceryItemName.value = '';
    groceryItemDescription.value = '';

    saveItemToLocalStorage({ name: itemName, description: itemDescription, id: itemIdCounter });

    itemIdCounter++;
    e.preventDefault();
}

// Create the Item Helper Function

function createItem(itemName, itemDescription, itemId = null) {
    
    //Create a new item and its properties
    const li = document.createElement('li');
    li.className = 'collection-item';
    li.style ='display: flex; align-items: center; justify-content: space-between';
    itemId === null ? li.id = `item-${itemIdCounter}` : li.id = `item-${itemId}`;

    // Add a template to the item
    li.innerHTML = `
        <div class="item-info">
            <h5 class="item-name">${itemName}</h5>
            <span class="item-description">${itemDescription}</span>
        </div>
    `;

    // Create Remove button and its properties

    const removeButton = document.createElement('a');
    removeButton.innerHTML = '<i class="fa fa-remove"></i>';
    removeButton.style = 'cursor: pointer'
    removeButton.classList = 'delete-item secondary-content';

    // Create Edit Button and its properties

    const editButton = document.createElement('a');
    editButton.innerHTML = '<i class="fa fa-edit"></i>';
    editButton.style = 'cursor: pointer';
    editButton.classList = 'edit-item secondary-content';

    //Add Event Listener to the buttons

    removeButton.addEventListener('click', removeItemFromList);
    editButton.addEventListener('click', editItemFromList);

    // Create Button Container

    const buttonContainer = document.createElement('div');
    buttonContainer.classList = 'button-container';

    // Append buttons to Container

    buttonContainer.appendChild(removeButton);
    buttonContainer.appendChild(editButton);

    // Append button container to item

    li.appendChild(buttonContainer);

    // Add the item to the list

    groceryList.appendChild(li);
}

// Remove item from list

function removeItemFromList(e) {
    if (e.target.parentElement.classList.contains('delete-item')) {
        if(confirm('Ste prepričani?')) {
            let groceryItem = e.target.parentElement.parentElement.parentElement;

            groceryItem.remove();

            removeItemFromLocalStorage(groceryItem.id.split('-')[1]);
        }
    }

    e.preventDefault();
}

// Edit items from list

function editItemFromList(e) {
    let groceryItem = null;

    if (e.target.parentElement.classList.contains('edit-item')) {
        groceryItem = e.target.parentElement.parentElement.parentElement;

        // Toggle edit mode
        groceryItemForm.setAttribute('mode', 'edit');
        onModeToggle(groceryItem);
    }

    e.preventDefault();
}

function onModeToggle(groceryItem = null) {

    const mode = groceryItemForm.getAttribute('mode');

    // Change form title

    groceryModeTitle.innerHTML = mode === 'edit' ? 'Spremeni produkt' : 'Dodaj produkt';

    // Hide Add mode buttons

    addItemButton.style.visibility = mode === 'edit' ? 'hidden' : 'visible';
    addItemButton.style.display = mode === 'edit' ? 'hidden' : 'visible';

    mode === 'edit' ? groceryItemForm.setAttribute('currentItemId', groceryItem.id) : groceryItemForm.removeAttribute('currentItemId');

    // show edit mode buttons
    
    cancelButton.style.visibility = mode === 'edit' ? 'visible' : 'hidden';
    editButton.style.visibility = mode === 'edit' ? 'visible' : 'hidden';

    // Populate inputs with item info / clear inputs

    if (mode === 'edit') {
        groceryItemName.value = groceryItem.querySelector('.item-name').innerHTML; 
        groceryItemDescription.value = groceryItem.querySelector('.item-description').innerHTML; 
    } else {
        groceryItemName.value = '';
        groceryItemDescription.value = '';
    }
}

// Confirm Edit on Item

function confirmEdit(e) {
    const currentItemId = groceryItemForm.getAttribute('currentItemId');

    const itemToEdit = groceryList.querySelector(`#${currentItemId}.collection-item`);

    // Retrieve values for name and description
    let itemName = groceryItemName.value;
    let itemDescription = groceryItemDescription.value;

    // Check for blank inputs

    if (itemName === '' || itemDescription === '') {
        alert('Vpisati morate vse podatke! Prosimo poskusite ponovno!');

        e.preventDefault();
        return;
    }

    itemToEdit.querySelector('.item-name').innerHTML = itemName;
    itemToEdit.querySelector('.item-description').innerHTML = itemDescription;

    // Toggle add mode
    groceryItemForm.setAttribute('mode', 'add');
    onModeToggle(itemToEdit);

    saveItemToLocalStorage({ name: itemName, description: itemDescription, id: itemToEdit.id.split('-')[1]});


    e.preventDefault();
}

// Cancel Edit Mode
function cancelEditMode(e) {
    groceryItemForm.setAttribute('mode', 'add');
    onModeToggle();

    e.preventDefault();
}

// Clear Items from List
function clearItemFromList(e) {
    while(groceryList.firstChild) {
        groceryList.firstChild.remove();
    }

    clearItemsFromLocalStorage();

    e.preventDefault();
}

// Filter Items
function filterItems(e) {
    const filterValue = e.target.value.toLowerCase();

    groceryList.querySelectorAll('.collection-item').forEach(function(item) {
        const itemName = item.querySelector('.item-name').innerHTML.toLowerCase();

        if (itemName.indexOf(filterValue) != -1) {
            item.style.display = 'flex';
        } else {
            item.style.display = 'none';
        }
    })
}

// Save Item to Local Storage

function saveItemToLocalStorage(item) {
    let groceryItems = localStorage.getItem('groceryItems');

    if (groceryItems !== null) {
        groceryItems = JSON.parse(groceryItems);
    } else {
        groceryItems = {};
    }

    groceryItems[item.id] =  { name: item.name, description: item.description, id: item.id  };

    localStorage.setItem('groceryItems', JSON.stringify(groceryItems));
}

// Remove Item from Local Storage

function removeItemFromLocalStorage(id) {
    let groceryItems = localStorage.getItem('groceryItems');

    if (groceryItems !== null) {
        groceryItems = JSON.parse(groceryItems);
    } else {
        groceryItems = {};
    }

    if (groceryItems[id]) {
        delete groceryItems[id];
        localStorage.setItem('groceryItems', JSON.stringify(groceryItems));
    }
}

// Clear Items from Local Storage

function clearItemsFromLocalStorage() {
    localStorage.clear();
}

// Retrieve Items from Local Storage on Load

function retrieveItems() {
    let groceryItems = localStorage.getItem('groceryItems');

    if (groceryItems !== null) {
        groceryItems = JSON.parse(groceryItems);
    } else {
        groceryItems = {};
    }

    for (let id in groceryItems) {
        createItem(groceryItems[id].name, groceryItems[id].description, groceryItems[id].id);
    }

    if (groceryList.children.length > 0) {
        itemIdCounter = Number(groceryList.lastChild.getAttribute('id').replace('item-', '')) + 1;
    }
}