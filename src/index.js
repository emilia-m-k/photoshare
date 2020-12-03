// import "./styles.css";

const root = document.getElementById("root");
const navUsers = document.querySelector("#navUsers");
const navPhotos = document.querySelector("#navPhotos");

navUsers.addEventListener("click", () => {
  navigate("/");
  loadUsers();
});

navPhotos.addEventListener("click", () => {
  navigate("/photos");
  loadPhotos();
});

function init() {
  let pathName = window.location.pathname;
  pathName === "/photos" ? loadPhotos() : loadUsers();

  if (pathName !== "/" && pathName !== "/photos") navigate("/");
}

function navigate(pathName) {
  window.history.pushState({}, pathName, window.location.origin + pathName);
}

window.onpopstate = () => {
  init();
};

function createUserElement(user) {
  return `<div class="user" data-id="${user.id}">
  <img class="user__photo" src="../images/image${user.id}.jpg">
  <span class="user__name">${user.name}</span>
  <span class="user__email">${user.email}</span>
</div>`;
}

function createPhotoElement(photo) {
  return `<div class="photo">
  <img class="photo__img photo__img--small" src="${photo.thumbnailUrl}">
  <span class="photo__author" data-id="${photo.userId}">Photo by: <span class="photo__author__name">${photo.userName}</span></span>
  <span class="photo__info">${photo.title}</span>
  </div>`;
}

function createUserPhotoElement(photo) {
  return `<div class="photo">
  <img class="photo__img" src="${photo.url}">
  <span class="photo__info">${photo.title}</span>
  </div>`;
}

function setActive(navElem) {
  const active = "navbar__list__item navbar__list__item--active";
  const notActive = "navbar__list__item";
  navUsers.setAttribute("class", navElem === "navUsers" ? active : notActive);
  navPhotos.setAttribute("class", navElem === "navUsers" ? notActive : active);
}

function loadUsers() {
  showLoader();
  setActive("navUsers");

  fetch("https://jsonplaceholder.typicode.com/users")
    .then((response) => response.json())
    .then((data) => {
      let usersNames = {};
      let allUserElements = "";
      data.forEach((e) => {
        let userElement = createUserElement(e);
        allUserElements += userElement;
        usersNames[e.id] = e.name;
      });
      root.innerHTML = allUserElements;

      document.querySelectorAll(".user").forEach((item) => {
        item.addEventListener("click", (event) => {
          let userId = item.dataset.id;
          loadUserPhotos(userId, usersNames[userId]);
        });
      });
    })
    .catch(function () {
      showError();
    });
}

function loadUserPhotos(id, name) {
  navigate(`/photos/${id}`);
  showLoader();
  setActive("navPhotos");

  fetch(`https://jsonplaceholder.typicode.com/albums/${id}/photos`)
    .then((response) => response.json())
    .then((data) => {
      let userPhotosContent = `<div class="photos-title">Photos by user ${name}</div>`;
      data.forEach((e) => {
        let photoElement = createUserPhotoElement(e);
        userPhotosContent += photoElement;
      });

      root.innerHTML = userPhotosContent;
    })
    .catch(function () {
      showError();
    });
}

function loadPhotos() {
  showLoader();
  setActive("navPhotos");

  const usersFetch = fetch("https://jsonplaceholder.typicode.com/users");
  const albumsFetch = fetch("https://jsonplaceholder.typicode.com/albums");
  const photosFetch = fetch("https://jsonplaceholder.typicode.com/photos");

  Promise.all([usersFetch, albumsFetch, photosFetch])
    .then(function (responses) {
      return Promise.all(
        responses.map(function (response) {
          return response.json();
        })
      );
    })
    .then(function (data) {
      let users = data[0];
      let albums = data[1];
      let photos = data[2];

      let usersNames = {};
      users.forEach((e) => {
        usersNames[e.id] = e.name;
      });

      let albumsMap = {};
      albums.forEach((e) => {
        albumsMap[e.id] = {
          userId: e.userId,
          name: usersNames[e.userId]
        };
      });

      photos.map((e) => {
        e.userId = albumsMap[e.albumId].userId;
        e.userName = albumsMap[e.albumId].name;
        return e;
      });

      let allPhotoElements = "";
      photos.forEach((e) => {
        let photoElement = createPhotoElement(e);
        allPhotoElements += photoElement;
      });

      root.innerHTML = allPhotoElements;

      document.querySelectorAll(".photo__author").forEach((item) => {
        item.addEventListener("click", (event) => {
          let userId = item.dataset.id;
          loadUserPhotos(userId, usersNames[userId]);
        });
      });
    })
    .catch(function () {
      showError();
    });
}

function showLoader() {
  root.textContent = "";
  let loaderElement = document.createElement("div");
  loaderElement.setAttribute("class", "loader");
  root.appendChild(loaderElement);
}

function showError() {
  root.textContent = "";
  let errorElement = document.createElement("div");
  errorElement.setAttribute("class", "error");
  errorElement.textContent = "Error ocurred!";
  root.appendChild(errorElement);
}

init();
