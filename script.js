const form = document.querySelector("#form");
// Select Form Inputs-->
const usernameInput = document.querySelector("#username");
const usernameError = document.querySelector("#username-error");
const roleInput = document.querySelector("#role");
const roleError = document.querySelector("#role-error");
const photoLinkInput = document.querySelector("#photo-link");
const linkError = document.querySelector("#link-error");
const bioInput = document.querySelector("#bio");
const cardGrid = document.querySelector("#card-grid");
const cardBox = document.querySelector("#card-box");
const searchInput = document.querySelector("#search");
const submitBtn = document.querySelector("#submit-btn");
const cancelBtn = document.querySelector("#cancel-btn");
const themeimg = document.querySelector("#theme-img");

// Toggle Theme-->
function themeToggle(){
    if(document.body.classList.contains("dark")){
        document.body.classList.add("light");
        document.body.classList.remove("dark");
        themeimg.src = "./graphics/moon.png";
    }
    else if(document.body.classList.contains("light")){
        document.body.classList.add("dark");
        document.body.classList.remove("light");
        themeimg.src = "./graphics/sun.png";
    }
}

// Menu Toggle-->
let menuBtn = document.querySelector("#img-box");
let menuBox = document.querySelector("#menu-box");
function menuToggle(){
    menuBox.classList.toggle("hidden");
}

// Create different types of Toaster Notifications-->
const toasterBox =  document.querySelector("#toaster-box");
function createToaster(type){
    return function(msg){
        const toastNotification = document.createElement("div");
        toastNotification.textContent = msg;
        if(type === "add"){
            toastNotification.classList.add("toaster-notification", "bg-green-500");
        }
        else if(type === "delete"){
            toastNotification.classList.add("toaster-notification", "bg-red-500");
        }
        else toastNotification.classList.add("toaster-notification", "bg-blue-500");

        toasterBox.append(toastNotification);

        setTimeout(() => {
            toastNotification.classList.add("toast-fade");
            setTimeout(() => {
                toastNotification.remove();
            }, 300); // matches transition duration
        }, 2000);

    }
}

const addedToast = createToaster("add");
const deleteToast = createToaster("delete");
const editToast = createToaster("edit");

// Apply Debounce on Search results-->
const debounce = function(fnc, delay){ // fnc = searchFilter function
    
    let timer;
    return function(...args){
        clearTimeout(timer);
        timer = setTimeout(function(){
            fnc(...args);
        }, delay);
    }
}

const userManager = {
    editingUser : null,
    editCard : null,
    users : [],
    init : function(){
        this.renderStoredUsers();
        form.addEventListener("submit", this.formValidation.bind(this));
        searchInput.addEventListener("input", debounce(this.searchFilter.bind(this), 1000));
        cardGrid.addEventListener("click", this.checkButton.bind(this));
        cancelBtn.addEventListener("click", this.cancelEdit.bind(this));
    },

    cancelEdit : function(e){
        e.preventDefault();
        usernameInput.value = "";
        roleInput.value = "";
        photoLinkInput.value = "";
        bioInput.value = "";

        cancelBtn.classList.add("hidden");
        if(this.editCard){
            this.editCard.classList.remove("curr-editing-card");
        }
        this.editCard = null;
        this.editingUser = null;
        submitBtn.textContent = "Add User";
    },

    formValidation : function(e){
        e.preventDefault();
        let isValid = true;

        // Username
        let username = usernameInput.value.trim();
        if(username.length <= 2 || !(/^[A-Za-z ]+$/.test(username))){
            isValid = false;
            usernameError.classList.remove("hidden");
        }
        else usernameError.classList.add("hidden");

        // Role
        let role = roleInput.value.trim();
        if(role.length <= 2 || !(/^[A-Za-z ]+$/.test(role))){
            isValid = false;
            roleError.classList.remove("hidden");
        }
        else roleError.classList.add("hidden");
        
        // link
        let link = photoLinkInput.value.trim();
        if(!(/^(https?:\/\/)[^\s/$.?#].[^\s]*$/i.test(link))){
            isValid = false;
            linkError.classList.remove("hidden");
        }
        else linkError.classList.add("hidden");

        // Final Check
        if(isValid){
            this.submitForm();
        }
    },

    searchFilter : function (e){
        let input = searchInput.value.trim().toLowerCase();
        let filteredUsers = this.users.filter((user) => {
            return user.username.toLowerCase().includes(input);
        });
       
        this.renderUI(filteredUsers);
    },

    renderStoredUsers : function(){
        const storedUsers = JSON.parse(localStorage.getItem("users") || "[]");
        if(storedUsers.length > 0){
            this.users = storedUsers;
            this.renderUI();
        }
        else{
            console.log("Khali h.");
        }
    },

    submitForm : function(){ // Agr Valid nahi h to submitform mt chhlao
        if(this.editingUser){ // modify previous stored user
            this.editUserInfo();
            return;
        }   

        this.addUser();
        form.reset();
    },

    addUser : function(){
        this.users.push({
            id : Date.now(),
            username : usernameInput.value.trim(),
            role : roleInput.value.trim(),
            picLink : photoLinkInput.value.trim(),
            bio : bioInput.value.trim()
        });
        localStorage.setItem("users", JSON.stringify(this.users));
        this.renderUI();
        addedToast(`${usernameInput.value} is Added!`)
    },

    checkButton : function(e){
        if(e.target.classList.contains("delete-btn")){
            this.isDeleteBtn(e);
        }
        else if(e.target.classList.contains("btn")){
            this.isEditBtn(e);
        }
    },

    isEditBtn : function(e){
        const id = Number(e.target.dataset.id);
        this.editCard = e.target.parentElement;
        this.findEditUser(id);
    },

    findEditUser : function(id){
        const userToEdit = this.users.find((user) => {  // Found that user
            return user.id === id;
        });

        // Sending info of user to form for Editing-->
        usernameInput.value = userToEdit.username;
        roleInput.value = userToEdit.role;
        photoLinkInput.value = userToEdit.picLink;
        bioInput.value = userToEdit.bio;

        // Apply Shadow on current selected card for edit-->
        this.editCard.classList.add("curr-editing-card");
        console.log(this.editCard);

        // Change Button textContent to Update Changes!
        submitBtn.textContent = "Update Changes";
        cancelBtn.classList.remove("hidden");

        this.editingUser = userToEdit;
    },

    editUserInfo : function(){
        this.editingUser.username = usernameInput.value.trim();
        this.editingUser.role = roleInput.value.trim();
        this.editingUser.picLink = photoLinkInput.value.trim();
        this.editingUser.bio = bioInput.value.trim();

        // editing in localStorate-->
        localStorage.setItem("users", JSON.stringify(this.users));

        this.editCard?.classList.remove("curr-editing-card");
        this.editCard = null;
        this.editingUser = null;

        console.log("Edit Successfull");
        this.renderUI();
        editToast(`${usernameInput.value} info changed Succesfully!`)
        form.reset();
        submitBtn.textContent = "Add User";
        cancelBtn.classList.add("hidden");
    },

    isDeleteBtn : function(e){
        const id = Number(e.target.dataset.id);
        this.deleteUser(id);
    },

    deleteUser : function(id){
        const userToDelete = this.users.find(user => user.id === id);
        this.users = this.users.filter((user) => {
            return user.id !== id;
        });
        localStorage.setItem("users", JSON.stringify(this.users));
        this.renderUI();
        deleteToast(`${userToDelete.username} is Deleted!`)
    },

    renderUI : function(usersList = this.users){
        cardGrid.innerHTML = "";

        if(usersList.length === 0){ // if no Search Matched
            let msgContainer = document.createElement("div");
            msgContainer.classList.add("border-2", "p-4", "text-3xl");
            let msg = document.createElement("p");
            msg.textContent = "No results Found!";
            msgContainer.append(msg);
            cardGrid.innerHTML = ""; 
            cardGrid.append(msgContainer);
            return;
            
        }

        for(let user of usersList){

            // Add Cards -->
            let card = document.createElement("div");
            card.classList.add("card-style");

            let picWrapper = document.createElement("div");
            picWrapper.classList.add("pic-wrapper");
            let pic = document.createElement("img");
            pic.classList.add("pic-styles")
            pic.src = user.picLink || "../graphics/user.jpeg";
            // Image fallback
            pic.onerror = () => {
                pic.src = "../graphics/user.jpeg";
            };
            picWrapper.append(pic);
        
            let information = document.createElement("div");
            information.classList.add("info");
        
            let introduction = document.createElement("div");
            let usernameDom = document.createElement("h1");
            usernameDom.textContent = user.username;
            let roleDom = document.createElement("h1");
            roleDom.textContent = user.role;
            introduction.append(usernameDom, roleDom);

            let bioData = document.createElement("h2");
            bioData.classList.add("overflow-y-hidden", "h-15");
            bioData.textContent = user.bio;

            information.append(introduction, bioData);

            let editBtn = document.createElement("button");
            editBtn.dataset.id = user.id;
            editBtn.textContent = "Edit";
            editBtn.classList.add("btn");

            let deleteBtn = document.createElement("button");
            deleteBtn.dataset.id = user.id;
            deleteBtn.textContent = "Delete";
            deleteBtn.classList.add("delete-btn");
            card.append(picWrapper, information, editBtn, deleteBtn);
            cardGrid.append(card);
        }
    }
}

userManager.init();