const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phoneRegex = /^[0-9]{10}$/;
const passwordRegex = /^(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*]).{8,}$/;

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

    const name = nameEl.value;
    const email = emailEl.value;
    const phone = phoneEl.value;
    const password = passEl.value;
    const confirm = document.getElementById("confirmPassword").value;
    const photo = document.getElementById("photo").files[0];

    if (!validImage(photo)) return alert("Only JPG/PNG allowed");
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
        "Password must be at least 8 characters and include:\n- 1 uppercase letter\n- 1 number\n- 1 special character",
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
      users.push({ name, email, phone, password, photo: reader.result });
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
      alert("Only JPG/PNG allowed");
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
          "Password must be at least 8 characters with uppercase, number and symbol.",
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
