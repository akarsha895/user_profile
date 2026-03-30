const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phoneRegex = /^[1-9][0-9]{9}$/;
const passwordRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*]).{8,}$/;

function validImage(file) {
  return file && ["image/jpeg", "image/png"].includes(file.type);
}

function getUsers() {
  return JSON.parse(localStorage.getItem("users")) || [];
}
function saveUsers(u) {
  localStorage.setItem("users", JSON.stringify(u));
}

function togglePass(id) {
  const el = document.getElementById(id);
  el.type = el.type === "password" ? "text" : "password";
}

// REGISTER
const registerForm = document.getElementById("registerForm");
if (registerForm) {
  registerForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const name = nameEl.value.trim();
    const email = emailEl.value.trim();
    const phone = phoneEl.value.trim();
    const password = passEl.value;
    const confirm = document.getElementById("confirmPassword").value;
    const photo = document.getElementById("photo").files[0];

    if (!name) {
      alert("Name cannot be empty or just spaces.");
      return;
    }

    if (!validImage(photo)) return alert("Only JPG/JPEG/PNG allowed");
    if (!emailRegex.test(email)) {
      alert("Please enter a valid email address (example: user@gmail.com)");
      return;
    }
    if (!phoneRegex.test(phone)) {
      alert("Phone number must contain exactly 10 digits (numbers only).");
      return;
    }
    if (!passwordRegex.test(password)) {
      alert(
        "Password must be at least 8 characters and include:\n- 1 uppercase letter\n- 1 lowercase letter\n- 1 number\n- 1 special character",
      );
      return;
    }
    if (password !== confirm) return alert("Passwords do not match");

    const users = getUsers();
    if (users.some((u) => u.email === email)) {
      alert("User already exists with this email. Please login instead.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      users.push({
        name,
        email,
        phone,
        password,
        photo: reader.result,
        todos: [],
      });
      saveUsers(users);

      alert("Registered successfully! Please login.");

      location.href = "login.html";
    };
    reader.readAsDataURL(photo);
  });

  const nameEl = document.getElementById("name");
  const emailEl = document.getElementById("email");
  const phoneEl = document.getElementById("phone");
  const passEl = document.getElementById("password");
}

// LOGIN
const loginForm = document.getElementById("loginForm");
if (loginForm) {
  loginForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const email = document.getElementById("loginEmail").value.trim();
    const password = document.getElementById("loginPassword").value;

    if (!email || !password) {
      alert("Please fill in all fields.");
      return;
    }

    if (!emailRegex.test(email)) {
      alert("Please enter a valid email address.");
      return;
    }

    const users = getUsers();

    const existingUser = users.find((u) => u.email === email);
    if (!existingUser) {
      alert("Incorrect Credentials. Please check again.");
      return;
    }

    if (existingUser.password !== password) {
      alert("Incorrect Credentials. Please check again.");
      return;
    }

    localStorage.setItem("loggedInUser", email);
    window.location.href = "profile.html";
  });
}

// PROFILE
if (location.pathname.includes("profile.html")) {
  const users = getUsers();
  const email = localStorage.getItem("loggedInUser");
  const index = users.findIndex((u) => u.email === email);

  const user = users[index];

  profileName.value = user.name;
  profileEmail.value = user.email;
  profilePhone.value = user.phone;
  profilePassword.value = user.password;
  profileImage.src = user.photo;

  let tempImage = null;

  editBtn.onclick = () => {
    profileName.disabled = false;
    profilePhone.disabled = false;
    profilePassword.disabled = false;
    imageSection.classList.remove("hidden");
    saveBtn.classList.remove("hidden");
    editBtn.classList.add("hidden");
  };

  editPhoto.onchange = (e) => {
    const file = e.target.files[0];
    if (file && validImage(file)) {
      const reader = new FileReader();
      reader.onload = () => {
        tempImage = reader.result;
        profileImage.src = reader.result; // preview
      };
      reader.readAsDataURL(file);
    } else if (file) {
      alert("Only JPG/JPEG/PNG allowed");
      editPhoto.value = "";
    }
  };

  removePhoto.onclick = () => {
    tempImage = null;
    editPhoto.value = "";
    profileImage.src = user.photo;
  };
  saveBtn.onclick = () => {
    const status = document.getElementById("statusMsg");
    let changed = false;

    const newName = profileName.value.trim();
    const newPhone = profilePhone.value.trim();
    const newPassword = profilePassword.value;
    if (!newName) {
      alert("Name cannot be empty or just spaces.");
      return;
    }
    if (newName !== user.name) {
      user.name = newName;
      changed = true;
    }

    if (newPhone !== user.phone) {
      if (!phoneRegex.test(newPhone)) {
        alert("Phone number must contain exactly 10 digits (numbers only).");
        return;
      }
      user.phone = newPhone;
      changed = true;
    }

    if (newPassword !== user.password) {
      if (!passwordRegex.test(newPassword)) {
        alert(
          "Password must be at least 8 characters with uppercase letter,lowercase letter, number and symbol.",
        );
        return;
      }
      user.password = newPassword;
      changed = true;
    }

    if (tempImage && tempImage !== user.photo) {
      user.photo = tempImage;
      changed = true;
    }

    if (changed) {
      users[index] = user;
      saveUsers(users);
      showStatus(status, "Profile updated");
    } else {
      showStatus(status, "No changes made");
    }
  };
}

function showStatus(el, msg) {
  el.textContent = msg;
  setTimeout(() => (el.textContent = ""), 2000);
}

function logout() {
  localStorage.removeItem("loggedInUser");
  location.href = "login.html";
}

//to-do
if (location.pathname.includes("todo.html")) {
  const users = getUsers();
  const email = localStorage.getItem("loggedInUser");
  const index = users.findIndex((u) => u.email === email);
  const user = users[index];

  let filter = "all";

  window.addTask = function () {
    const input = document.getElementById("taskInput");
    const task = input.value.trim();

    if (!task) {
      alert("Task cannot be empty");
      return;
    }

    user.todos.push({ text: task, completed: false });
    saveUsers(users);

    input.value = "";
    renderTasks();
  };

  const searchInput = document.getElementById("searchInput");
  searchInput.addEventListener("input", renderTasks);

  window.setFilter = function (type) {
    filter = type;

    document
      .querySelectorAll(".filters button")
      .forEach((btn) => btn.classList.remove("active"));

    document.getElementById(`filter-${type}`).classList.add("active");

    renderTasks();
  };

  function renderTasks() {
    const list = document.getElementById("taskList");
    const search = searchInput.value.toLowerCase();

    list.innerHTML = "";

    user.todos.forEach((t, i) => {
      if (
        (filter === "completed" && !t.completed) ||
        (filter === "pending" && t.completed)
      )
        return;

      if (!t.text.toLowerCase().includes(search)) return;

      const li = document.createElement("li");
      li.className = "task-item";

      li.innerHTML = `
  <span class="${t.completed ? "completed" : ""}" id="task-text-${i}">
    ${t.text}
  </span>

  <input type="text" id="edit-input-${i}" class="edit-input hidden" value="${t.text}" />

  <div class="task-actions">
    
    <!-- COMPLETE -->
    <button onclick="toggleTask(${i})">
      <i class="fa-solid fa-check"></i>
    </button>

    <!-- EDIT -->
    <button onclick="startEdit(${i})" id="edit-btn-${i}">
      <i class="fa-solid fa-pen"></i>
    </button>

    <!-- SAVE -->
    <button onclick="saveEdit(${i})" class="hidden" id="save-btn-${i}">
      <i class="fa-solid fa-floppy-disk"></i>
    </button>

    <!-- DELETE -->
    <button onclick="deleteTask(${i})">
      <i class="fa-solid fa-trash"></i>
    </button>

  </div>
`;

      list.appendChild(li);
    });
  }

  window.toggleTask = function (i) {
    user.todos[i].completed = !user.todos[i].completed;
    saveUsers(users);
    renderTasks();
  };

  window.deleteTask = function (i) {
    user.todos.splice(i, 1);
    saveUsers(users);
    renderTasks();
  };

  renderTasks();

  window.startEdit = function (i) {
    document.getElementById(`task-text-${i}`).classList.add("hidden");

    const input = document.getElementById(`edit-input-${i}`);
    input.classList.remove("hidden");

    document.getElementById(`edit-btn-${i}`).classList.add("hidden");
    document.getElementById(`save-btn-${i}`).classList.remove("hidden");

    input.focus();
  };
  document.addEventListener("keydown", function (e) {
    if (e.key === "Enter" && e.target.classList.contains("edit-input")) {
      const id = e.target.id.split("-")[2];
      saveEdit(id);
    }
  });

  window.saveEdit = function (i) {
    const input = document.getElementById(`edit-input-${i}`);
    const newText = input.value.trim();

    if (!newText) {
      alert("Task cannot be empty");
      return;
    }

    user.todos[i].text = newText;

    saveUsers(users);

    renderTasks();
  };
}
