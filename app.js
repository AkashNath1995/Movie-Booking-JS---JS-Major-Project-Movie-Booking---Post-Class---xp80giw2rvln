import { fetchMovieList, fetchMovieAvailability } from './api.js';

// Select the elements we'll be working with
const nav = document.querySelector('nav');
const logo = document.querySelector('.logo');
const linksList = document.querySelector('.links-list');
const loader = document.querySelector('#loader');
const movieHolder = document.querySelector('.movie-holder');
const bookingForm = document.querySelector('#booking-form');
const emailInput = document.querySelector('#email');
const phoneInput = document.querySelector('#phone');
const submitButton = document.querySelector('#submit');

let selectedMovie = null;
let selectedSeats = [];

// Fetch the list of movies and create the movie posters
const createMoviePosters = async () => {
  // Show the loader while we're fetching data
  loader.style.display = 'block';

  // Fetch the movie list
  const movies = await fetchMovieList();

  // Create the movie posters and add them to the movie holder
  for (const movie of movies) {
    const poster = document.createElement('img');
    poster.src = movie.imgUrl;
    poster.alt = movie.name;
    poster.addEventListener('click', async () => {
      // Clear the seat grid and selected seats
      movieHolder.innerHTML = '';
      selectedSeats = [];

      // Set the selected movie
      selectedMovie = movie.name;

      // Fetch the movie availability
      const availability = await fetchMovieAvailability(selectedMovie);

      // Create the seat grid and add it to the movie holder
      const seatGrid = document.createElement('div');
      seatGrid.classList.add('seat-grid');
      for (let i = 1; i <= 24; i++) {
        const seatElement = document.createElement('div');
        seatElement.id = `seat-${i}`;
        seatElement.classList.add('seat');
        if (availability.includes(i)) {
          seatElement.classList.add('available');
          seatElement.addEventListener('click', () => {
            // Toggle the selected state of the clicked seat
            if (selectedSeats.includes(i)) {
              selectedSeats.splice(selectedSeats.indexOf(i), 1);
              seatElement.classList.remove('selected');
            } else {
              selectedSeats.push(i);
              seatElement.classList.add('selected');
            }
          });
        } else {
          seatElement.classList.add('unavailable');
        }
        seatGrid.appendChild(seatElement);
      }
      movieHolder.appendChild(poster);
      movieHolder.appendChild(seatGrid);
    });
    movieHolder.appendChild(poster);
  }

  // Hide the loader once we're done fetching data
  loader.remove();
};

// Initialize the website
createMoviePosters();

// Handle popup message close
const handlePopupClose = (popup) => {
  const closeButton = popup.querySelector('.close-button');
  closeButton.addEventListener('click', () => {
    popup.remove();
    location.reload();
  });
};

// Show the popup message
const showPopupMessage = (message) => {
  const popup = document.createElement('div');
  popup.classList.add('popup-message');
  popup.innerHTML = `
    <p>${message}</p>
    <button class="close-button">OK</button>
  `;
  document.body.appendChild(popup);
  handlePopupClose(popup);
};

// Handle form submission
submitButton.addEventListener('click', (event) => {
  event.preventDefault();
  const email = emailInput.value;
  const phone = phoneInput.value;
  if (email && phone && selectedMovie && selectedSeats.length > 0) {
    // Do something with the form data (e.g. send it to a server)
    const message = `Tickets booked for ${selectedMovie}, Seats ${selectedSeats.join(', ')}.`;
    showPopupMessage(message);

    bookingForm.reset();
    for (const seat of selectedSeats) {
      seat.classList.remove('available');
      seat.classList.add('booked');
    }
    selectedSeats = [];
    selectedMovie = null;
    movieHolder.innerHTML = '';
    createMoviePosters();
  } else {
    alert('Please fill out all the form fields and select at least one seat and a movie');
  }
});
