const express = require("express");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");

const app = express();
app.use(express.json());

const dbPath = path.join(__dirname, "moviesData.db");

let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });

    app.listen(3000, () => {
      console.log("Server is Running at http://localhost:3000");
    });
  } catch (error) {
    console.log(`DB Error:${error.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();

const convertDbObjToResponseObj = (movieObj) => {
  return {
    movieId: movieObj.movie_id,
    directorId: movieObj.director_id,
    movieName: movieObj.movie_name,
    leadActor: movieObj.lead_actor,
  };
};

const convertDirectorObjToResponseObj = (directorObj) => {
  return {
    directorId: directorObj.director_id,
    directorName: directorObj.director_name,
  };
};

// Get movie list API

app.get("/movies/", async (request, response) => {
  const getMovieListQuery = `
        SELECT movie_name AS movieName
        FROM movie;
    `;
  const movieList = await db.all(getMovieListQuery);
  response.send(movieList);
});

//Add movie API

app.post("/movies/", async (request, response) => {
  const movieDetails = request.body;
  const { directorId, movieName, leadActor } = movieDetails;

  const addMovieQuery = `
        INSERT INTO movie
        (director_id,movie_name,lead_actor)
        VALUES
        (
            ${directorId},
            '${movieName}',
            '${leadActor}'
        );
    `;
  await db.run(addMovieQuery);
  response.send("Movie Successfully Added");
});

//Get movie API

app.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const getMovieQuery = `
        SELECT *
        FROM movie
        WHERE
        movie_id = ${movieId};
    `;
  const movie = await db.get(getMovieQuery);
  response.send(convertDbObjToResponseObj(movie));
});

//Update movie details API

app.put("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const movieDetails = request.body;
  const { directorId, movieName, leadActor } = movieDetails;

  const updateMovieQuery = `
        UPDATE movie
        SET 
        director_id = ${directorId},
        movie_name = '${movieName}',
        lead_actor = '${leadActor}'
        WHERE
        movie_id = ${movieId};
    `;
  await db.run(updateMovieQuery);
  response.send("Movie Details Updated");
});

//Delete movie API

app.delete("/movies/:movieId", async (request, response) => {
  const { movieId } = request.params;

  const deleteMovieQuery = `
        DELETE FROM movie
        WHERE
        movie_id = ${movieId};
    `;
  await db.run(deleteMovieQuery);
  response.send("Movie Removed");
});

//Get directors list API

app.get("/directors/", async (request, response) => {
  const getDirectorsListQuery = `
        SELECT *
        FROM director
    `;
  const directorsList = await db.all(getDirectorsListQuery);
  response.send(
    directorsList.map((eachObj) => convertDirectorObjToResponseObj(eachObj))
  );
});

//Get movie name by director id API

app.get("/directors/:directorId/movies/", async (request, response) => {
  const { directorId } = request.params;
  const getMovieNameQuery = `
        SELECT 
        movie_name AS movieName
        FROM movie
        WHERE
        director_id = ${directorId};
    `;
  const movieNameList = await db.all(getMovieNameQuery);
  response.send(movieNameList);
});

module.exports = app;
