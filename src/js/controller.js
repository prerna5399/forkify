import * as model from './model.js';
import recipeView from './views/recipeView.js';
import searchView from './views/searchView.js';
import resultView from './views/resultView.js';
import bookmarkView from './views/bookmarkView.js';
import paginatitonView from './views/paginatitonView.js';
import addRecipeView from './views/addRecipeView.js';
import { MODAL_CLOSE_SEC } from './config.js';
// Polfill everythting else
import 'core-js/stable';
// Polyfilling aysnc/await
import 'regenerator-runtime/runtime';

// https://forkify-api.herokuapp.com/v2

///////////////////////////////////////

if (module.hot) {
  module.hot.accept();
}
const controlRecipe = async function () {
  try {
    const id = window.location.hash.slice(1);

    if (!id) return;
    recipeView.renderSpinner();

    // 0.) Update result view to mark selected search result
    resultView.update(model.getSearchResultsPage());

    // 1.) Updating bookmarks view
    bookmarkView.update(model.state.bookmarks);

    // 2.) Loading Recipe
    await model.loadRecipe(id);
    const { recipe } = model.state;

    // 3.) Rendering Recipe
    recipeView.render(model.state.recipe);
  } catch (err) {
    recipeView.renderError();
  }

  // controlServings();
};

const controlSearchResults = async function () {
  try {
    resultView.renderSpinner();

    // 1.) Get search query
    const query = searchView.getQuery();
    if (!query) return;

    // 2.) Load search result
    await model.loadSearchResults(query);

    // 3.) Render Results
    resultView.render(model.getSearchResultsPage());

    // 4.) Render initial pagination buttons
    paginatitonView.render(model.state.search);
  } catch (err) {
    recipeView.renderError();
  }
};

const controlPagination = function (goToPage) {
  // 1.) Render New Results
  resultView.render(model.getSearchResultsPage(goToPage));

  // 2.) Render NEW pagination buttons
  paginatitonView.render(model.state.search);
};

const controlServings = function (newServings) {
  // Update the Recipe Servings
  model.updateServings(newServings);

  // Update the Recipe View
  // recipeView.render(model.state.recipe);
  recipeView.update(model.state.recipe);
};

const controlAddBookmark = function () {
  // 1.) Add/Remove bookmark
  if (!model.state.recipe.bookmarked) model.addBookmark(model.state.recipe);
  else model.deleteBookmark(model.state.recipe.id);

  // Update Recipe View
  recipeView.update(model.state.recipe);

  // Render Bookmark
  bookmarkView.render(model.state.bookmarks);
};

const controlBookmarks = function () {
  bookmarkView.render(model.state.bookmarks);
};

const controlAddRecipe = async function (newRecipe) {
  // console.log(newRecipe);

  try {
    // Loading Spinner
    addRecipeView.renderSpinner();

    // Upload the new recipe data
    await model.uploadRecipe(newRecipe);

    // Render Recipe
    recipeView.render(model.state.recipe);

    // Add Success Method
    addRecipeView.renderMessage();

    // Render Bookmark View

    bookmarkView.render(model.state.bookmarks);

    // Change id in url

    window.history.pushState(null, '', `#${model.state.recipe.id}`);
    // window.history.back()

    // Close form window
    setTimeout(function () {
      addRecipeView.toggleWindow();
    }, MODAL_CLOSE_SEC * 1000);
  } catch (err) {
    // console.log(err);
    addRecipeView.renderError(err.message);
  }
};

const init = () => {
  bookmarkView.addHandlerRender(controlBookmarks);
  recipeView.addHandlerRender(controlRecipe);
  recipeView.addHandlerUpdateRecipe(controlServings);
  searchView.addHandlerSearch(controlSearchResults);
  paginatitonView.addHandlerClick(controlPagination);
  recipeView.addHandlerAddBookmark(controlAddBookmark);
  addRecipeView.addHandlerUpload(controlAddRecipe);
};

init();
