# Tech challenge

Welcome to Buoy's tech challenge!

This repository contains a partially implemented toy business analytics dashboard, designed as a work-in-progress prototype for a real-world application.

You must use the provided code sample and its dependencies to solve the problems explained below.

The solution must be a cloud git repository, hosted on any cloud git tool of your choice.

- Its first commit must:
  - Have the message "First commit"
  - Have the exact code sample as it was provided, no changes whatsoever
- From this point on, work on the problems exposed below as you like

NOTE: In case you want to create a private git repository, please grant the user matthew@buoydevelopment.com full access to the repo. If you do so, please make it clear once you reply with your answer.

---

# Problem #1

### Issue to solve

There's a full login process already implemented in the code sample, including the JWT refresh process.

However, **there's an issue for parallel requests when the JWT expires**:

- If several API calls are made in parallel, **all of them trigger the /refresh process**.

### Expected behaviour

- If several API calls are made in parallel, **only one /refresh process is triggered**.

### Context

Visiting any page in this project makes, at least, these two API:

- /brands -> Data for the Brand selector (left side of the Header bar)
- /users/me -> Data for the User section (right side of the Header bar)

First time calling these endpoints might take up to 45 seconds to reply, but then they'll respond in less than a second.

![See this image portraying how these two calls trigger TWO refresh calls](/images/problem_1_capture.png)

### Mock environment

A mock API has been built for the purpose of this challenge.

This mock API _exposes an altered JWT generation process_, with the purpose of making the Problem #1 scenario easy to reproduce.

To do so, it always returns an expired JWT token, making our frontend code sample to _always_ trigger the /refresh process.

It also accepts any credentials for the /login endpoint, making the login form a bit meaningless (fill it with anything).

### How to reproduce

If you start the project (see #Starting Steps below) and fill the login form (any credentials will work), you will end up in the dashboard page.

- Open the browser developer tools
- Refresh the page
- Check on the Network tab how TWO calls to /refresh have been made

### Acceptance criteria

- If you start the project (see #Starting Steps below) and fill the login form (any credentials will work), you will end up in the dashboard page.
- Open the browser developer tools
- Refresh the page
- Only ONE call to /refresh has been made

## Solution: Implement a Promise-based lock pattern that ensures only

The first caller triggers the refresh, while subsequent callers await the same Promise. This guarantees exactly one refresh per token expiration, regardless of how many concurrent requests need a valid token.

### Is this really an issue?

This is really a question for you, actually:

In a production environment, with a proper JWT generating API, and a proper JWT refresh process: **Why can the Problem #1 scenario be an issue?**

Provide an answer below:

> Duplicate refresh calls cause a critical issue: the first /refresh request invalidates the old refresh token and issues a new one, so the second parallel request uses an already-invalidated token and fails. This can result in authentication errors, inconsistent client state, or the user being unexpectedly logged out. Additionally, duplicate calls waste server resources and may trigger rate limiting or security alerts for suspicious activity.

---

# Problem #2

### Issue to solve

We need a new page holding information about all the users on our platform.

### Context

Using the different assets present in the code sample:

Create a whole new page, called Users

- It has to be visitable from the sidebar, with title Users
- It should be rendered under the /users path
- It should get the users info from https://dummyjson.com/users
- It should display an Ant Design table that:
  - Has the columns:
    - ID
    - First name
    - Last name
    - Name (full name in one column)
    - Email
    - Image (render decision lies on you, show the best option for images you can think of, and justify it in a comment in the code)
    - Client side pagination, 13 elements per page
  - Rows can be ordered by email
  - Rows can be filtered by First name, and Last name.
  - Loading behaviour while the data is being fetched

Reference:

- https://tanstack.com/query/v3/
- https://ant.design/components/overview/
- https://dummyjson.com

### Acceptance criteria

- If you start the project (see #Starting Steps below) and fill the login form (any credentials will work), you will end up in the dashboard page.
- There's a Users section in the Sidebar
- Visiting the Users sections loads a table with 13 elements, and several pages in the pagination section
- Changing to page 2 displays 13 different rows
- Clicking on the Email column changes the order of the rows, ordering ASC or DESC depending on the arrow displayed
- Writing "Miles" on the First name filter results in ONE row, with ID=4
- Deleting the text in the First name filter returns the table to its original state
- Writing "Cummerata" on the Last name filter results in ONE row, with ID=4
- Deleting the text in the Last name filter returns the table to its original state

---

> **Extra Notes**
>
> Change the build to use vite instead of create react app. App was taking ~16s to build, with vite we lowered it to ~5.9s.
>
> Added React Query persistent caching using localforage. Query results are now stored in IndexedDB, so returning users see cached data instantly while fresh data loads in the background. Makes the app feel snappier, especially on slower connections.
>
> Set up a proper testing environment with Vitest and React Testing Library. Wrote integration tests for both problems: 4 tests verify the duplicate refresh fix works correctly, and 8 tests cover all the Users page acceptance criteria (pagination, sorting, filtering).
>
> Cleaned up some runtime warnings along the way: fixed a deprecated Ant Design Timeline API, handled React Query's undefined data edge case, and added a proper route redirect for the root path.
>
> Refactored the useCRUDBuilder hook to use proper TypeScript generics instead of `any` types. The hook is now fully type-safe and supports typed query parameters for list operations.
> Build: Main chunk reduced from 606KB → 607KB
---

## TECH CONTEXT

# Starting Steps

- npm i
- create a .env with the following key-value pairs
  - VITE_API_URL=https://fake-api-owmo.onrender.com/dev
  - VITE_FAKE_API_MODE=false
- npm start

# Data Loading (FAKE API MODE)

VITE_FAKE_API_MODE ENV VAR switches whole application between FAKE and API modes

FAKE MODE

- FakeService class helps reproducing errors and long load times
- JSON Mocking (locally or any easy mocking service works)

API MODE

- ApiService class helps connecting to external APIs ('fetch' wrapper)

PROS of developing UIs this way

When a feature is requested, given that the tech team builds a JSON CONTRACT (accurate definition of how needed API endpoints will behave, both requests and responses)

- Backend and Frontend can start working on their implementations _in parallel_. No dependencies from the very beginning.
- Frontend can work on the [5 UI states](https://medium.com/@pakhimangal/ui-states-are-important-74c2715cef0b) thanks to our FakeService class. Actually, it may be even easier for some of the states (Loading, for instance, can be forced to be quite long)
- Whenever backend development is ready, the integration phase is just toggling a boolean! (if the JSON Contract was respected during the development, that is)
- EXTRA VALUE: FAKE mode can be used as a Demo/Playground environment out of the box!

# Core libraries

Typescript

React

Ant Design

- Ant Design dynamic theme builder: https://ant.design/theme-editor
- Export the result of the builder above, merge with current content of "antdTheme.json"

React Query

- https://tanstack.com/query/latest/docs/react/overview
- Brand depending hooks: useBrandIdSubscribedQuery
- Complete CRUD hooks builder: useCRUDBuilder

React Intl

- https://formatjs.io/docs/react-intl/

# Available Scripts

### `npm start`

Runs the app in development mode at [http://localhost:3000](http://localhost:3000).

### `npm test`

Runs the test suite with Vitest.

### `npm run build`

Builds the app for production to the `build` folder.

### `npm run typecheck`

Runs TypeScript type checking without emitting files.
