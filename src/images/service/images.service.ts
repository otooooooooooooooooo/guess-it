import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { config } from '../../config/config';

@Injectable()
export class ImagesService {
  /**
   * @description get maximum of 5 image urls from search results of keyword
   * @param keyword
   * @private
   */
  getImageUrls(keyword): Promise<string[]> {
    //Documentation https://serpapi.com/images-results
    //random query to avoid caching idk why
    return axios
      .get(`https://serpapi.com/search?z=${Math.random()}`, {
        data: {
          q: keyword,
          tbm: 'isch', //to fetch images
          api_key: config.API_KEY,
          no_cache: true,
        },
      })
      .then((res) =>
        res.data['images_results']
          .slice(0, 5)
          .map((search) => search['thumbnail']),
      );
  }
}
