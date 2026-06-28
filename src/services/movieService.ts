import axios from "axios";
import type { Movie } from "../types/movie";

export interface TmdbResponse {
  page: number;
  results: Movie[];
  total_pages: number;
  total_results: number;
}

const BASE_URL = "https://api.themoviedb.org/3";
const TMDB_TOKEN = import.meta.env.VITE_TMDB_TOKEN;

export default async function fetchMovies(
  query: string,
  page: number,
): Promise<TmdbResponse> {
  const config = {
    params: {
      query,
      language: "uk-UA",
      page,
    },
    headers: {
      Authorization: `Bearer ${TMDB_TOKEN}`,
    },
  };

  const response = await axios.get<TmdbResponse>(
    `${BASE_URL}/search/movie`,
    config,
  );

  return response.data;
}
