import Notiflix from 'notiflix';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import PicsApiService from './js/pixabay-service';

  const refs = {
    form: document.querySelector('#search-form'),
    imgContainer: document.querySelector('.gallery'),
    endSearchMessage :document.querySelector('.end-search__info')
  }; 

const PicsApi = new PicsApiService();
let picture = null;
let shownPics = 0;

refs.form.addEventListener('submit', onSubmitSearch);

async function onSubmitSearch(e) {
  e.preventDefault();
  PicsApi.searchWord = e.target.elements.searchQuery.value.trim();

  try {
    const data = await PicsApi.fetchPhotos();
    hideEndMessage();
    PicsApi.resetPage();
    clearData();
    picture = data.hits;

    if(PicsApi.searchWord === '') {
      onEmptySearch()
      return
    }

    if (parseInt(data.totalHits) === 0) {
      onFetchFailure();
      return;
    }
    if (parseInt(data.totalHits) < 40) {
      createPicsList(picture);
      lightBox.refresh();
      showEndMessage()
      onFetchSuccess(data.totalHits);
      return;
    }
    shownPics = data.hits.length;
    createPicsList(picture);
    lightBox.refresh();
    addObserveOrshowEndMessage(data.totalHits);
    onFetchSuccess(data.totalHits);

  } catch (error) {
    console.log(error);
  }
}

async function loadMore() {
  try {
    PicsApi.page += 1;
    const data = await PicsApi.fetchPhotos();
    
    picture = data.hits;
    createPicsList(picture);
    lightBox.refresh();

    shownPics += data.hits.length;
    addObserveOrshowEndMessage(data.totalHits);

  } catch (error) {
    console.log(error);
  }
}

function createPicsList(picture) {
  const photoCard = picture
    .map(
      ({
        webformatURL,
        largeImageURL,
        tags,
        likes,
        views,
        comments,
        downloads,
      }) => {
        return `<div class="photo-card">
        <a href="${largeImageURL}" class="img-link"><img class="gallery-img" src="${webformatURL}" alt="${tags}" loading="lazy" />
        <div class="info">
          <p class="info-item">
            <b>Likes</b> ${likes}
          </p>
          <p class="info-item">
            <b>Views</b> ${views}
          </p>
          <p class="info-item">
            <b>Comments</b> ${comments}
          </p>
          <p class="info-item">
            <b>Downloads</b> ${downloads}
          </p>
        </div>
      </div></a>`;
      }
    )
    .join('');

  refs.imgContainer.insertAdjacentHTML('beforeend', photoCard);
}

const lightBox = new SimpleLightbox('.gallery a', {
  captionsData: 'alt',
  captionDelay: '250ms',
  overlay: true,
  showCounter: false,
});


function clearData() {
  refs.imgContainer.innerHTML = '';
}

function onFetchFailure() {
  Notiflix.Notify.failure(
    'Sorry, there are no images matching your search query. Please try again'
  );
}

function onFetchSuccess(totalHits) {
  Notiflix.Notify.success(`Hooray! We found ${totalHits} images.`);
}

function onEmptySearch() {
  Notiflix.Notify.info('Oops, it seems that you searched for nothing) ');
}

const infiniteObserver = new IntersectionObserver(
    ([entry], observer) => {
      if (entry.isIntersecting) {
        observer.unobserve(entry.target);
  
        loadMore();
      }
    },
    { root: null, rootMargin: '50px', threshold: 0.5 }
  );

  function addObserveOrshowEndMessage(totalHits) {
    if (shownPics < totalHits) {
      addObserve();
    } else {
      showEndMessage();
    }
  }

  function addObserve() {
    const lastCard = document.querySelector('.photo-card:last-child');
  
    if (lastCard) {
      infiniteObserver.observe(lastCard);
    }
  }
  
  function showEndMessage() {
    refs.endSearchMessage.classList.add('show');
  }
  
  function hideEndMessage() {
    refs.endSearchMessage.classList.remove('show');
  }