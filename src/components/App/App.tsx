import { useState, useEffect } from "react";
import type { ComponentType } from "react";
import { useQuery } from "@tanstack/react-query";
import { Toaster, toast } from "react-hot-toast";
import css from "./App.module.css";
import ReactPaginateModule from "react-paginate";
import type { ReactPaginateProps } from "react-paginate";

type ModuleWithDefault<T> = { default: T };
const ReactPaginate = (
  ReactPaginateModule as unknown as ModuleWithDefault<
    ComponentType<ReactPaginateProps>
  >
).default;

import SearchBar from "../SearchBar/SearchBar";
import MovieGrid from "../MovieGrid/MovieGrid";
import MovieModal from "../MovieModal/MovieModal";
import Loader from "../Loader/Loader";
import ErrorMessage from "../ErrorMessage/ErrorMessage";
import fetchMovies from "../../services/movieService";
import type { TmdbResponse } from "../../services/movieService";
import type { Movie } from "../../types/movie";

export default function App() {
  const [query, setQuery] = useState<string>("");
  const [page, setPage] = useState<number>(1);
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);

  const { data, isLoading, isError } = useQuery<TmdbResponse, Error>({
    queryKey: ["movies", query, page],
    queryFn: () => fetchMovies(query, page),
    enabled: Boolean(query),
    staleTime: 1000 * 60 * 5,
    placeholderData: (previousData) => previousData,
  });

  const movies = data?.results || [];
  const totalPages = data?.total_pages || 0;

  useEffect(() => {
    if (!query || isLoading) return;

    if (isError) {
      toast.error("Something went wrong. Please try again.");
    } else if (movies.length === 0) {
      toast.error("No movies found for your request.");
    }
  }, [isError, movies, query, isLoading]);

  const handleSearchSubmit = (newQuery: string) => {
    setQuery(newQuery);
    setPage(1);
  };

  const handleCloseModal = () => {
    setSelectedMovie(null);
  };

  if (query && !isLoading && !isError && movies.length === 0) {
    toast.error("No movies found for your request.", { id: "no-movies" });
  }

  if (isError) {
    toast.error("Something went wrong. Please try again.", { id: "error" });
  }

  return (
    <div>
      <SearchBar onSubmit={handleSearchSubmit} />

      {isError && <ErrorMessage />}

      {isLoading && <Loader />}

      {!isError && !isLoading && query && movies.length > 0 && (
        <>
          {totalPages > 1 && (
            <ReactPaginate
              pageCount={totalPages}
              pageRangeDisplayed={5}
              marginPagesDisplayed={1}
              onPageChange={({ selected }) => setPage(selected + 1)}
              forcePage={page - 1}
              containerClassName={css.pagination}
              activeClassName={css.active}
              nextLabel="→"
              previousLabel="←"
            />
          )}
          <MovieGrid movies={movies} onSelect={setSelectedMovie} />
        </>
      )}

      <MovieModal movie={selectedMovie} onClose={handleCloseModal} />

      <Toaster position="top-right" reverseOrder={false} />
    </div>
  );
}
