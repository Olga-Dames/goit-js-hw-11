import axios from 'axios';


export default class PicsApiService {
  constructor() {
    (this.searchWord = ''), (this.page = 1), (this.per_page = 40);
  }

  fetchPhotos() {
    const BASE_URL = 'https://pixabay.com/api';
    const API_KEY = '33310644-33c3a55021d389068af948751';
    const params = new URLSearchParams({
      q: this.searchWord,
      image_type: 'photo',
      orientation: 'horizontal',
      safesearch: 'true',
      page: this.page,
      per_page: this.per_page,
    });

    const url = `${BASE_URL}/?key=${API_KEY}&${params}`;

    return axios
      .get(url)
      .then(response => response.data)
      .then(data => {
        // this.page += 1;
        return data;
      });
  }

  resetPage() {
    this.page = 1;
  }

  get query() {
    return this.searchWord;
  }

  set query(Newquery) {
    this.query = Newquery;
  }
}
