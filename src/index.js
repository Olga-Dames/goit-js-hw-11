import Notiflix from 'notiflix';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import PicsApiService from './js/pixabay-service';

const refs = {
    form: document.querySelector('#search-form'),
    imgContainer: document.querySelector('.gallery'),
    loadMoreBtn: document.querySelector('.load-more'),
  }; 

const PicsApi = new PicsApiService();
let picture = null;
hideLoadBtn();
// let shownPics = null;

refs.form.addEventListener('submit', onSubmitSearch);
refs.loadMoreBtn.addEventListener('click', onLoadMore);

async function onSubmitSearch(e) {
  e.preventDefault();
  PicsApi.searchWord = e.target.elements.searchQuery.value.trim();
  

  try {
    const data = await PicsApi.fetchPhotos();
    showLoadBtn();
    PicsApi.resetPage();
    clearData();
    picture = data.hits;

    if (parseInt(data.totalHits) === 0) {
      onFetchFailure();
      hideLoadBtn();
      return;
    }
    if (parseInt(data.totalHits) < 40) {
      hideLoadBtn();
      createPicsList(picture);
      lightBox.refresh();
      onFetchSuccess(data.totalHits);
      return;
    }
    
    createPicsList(picture);
    lightBox.refresh();
    onFetchSuccess(data.totalHits);

  } catch (error) {
    console.log(error);
  }
}

async function onLoadMore(e) {
  try {
    PicsApi.page += 1;
    
    const data = await PicsApi.fetchPhotos();
    // shownPics += data.hits.length
    // console.log(shownPics);
    picture = data.hits;
    createPicsList(picture);
    lightBox.refresh();
    showLoadBtn();
    console.log();

    if (PicsApi.page > data.hits) {
      hideLoadBtn();
      onFetchInfo();
      return;
    }
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
});

function clearData() {
  refs.imgContainer.innerHTML = '';
}

function onFetchFailure() {
  Notiflix.Notify.failure(
    'Sorry, there are no images matching your search query. Please try again'
  );
}

function onFetchInfo() {
  Notiflix.Notify.info(
    'We are sorry, but you have reached the end of search results'
  );
}

function onFetchSuccess(totalHits) {
  Notiflix.Notify.success(`Hooray! We found ${totalHits} images.`);
}

function showLoadBtn() {
  refs.loadMoreBtn.classList.remove('is-hidden');
}

function hideLoadBtn() {
  refs.loadMoreBtn.classList.add('is-hidden');
}
