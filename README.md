# Assignment 2 - Agile Software Practice.

Name: Shijin Zhang

Links:
+ Coveralls: https://coveralls.io/gitlab/zhang-zihan/movies-api-cicd-lab
+ [![Coverage Status](https://coveralls.io/repos/github/Dovis01/Agile-Assignment2-Web-API/badge.svg?branch=main)](https://coveralls.io/github/Dovis01/Agile-Assignment2-Web-API?branch=main)

## API endpoints.

[List the Web API's endpoints and state the purpose of each one. Indicate those that require authentication.]
 
 e.g.

+ GET api/movies/:id - get the details of a specific movie.
+ POST api/movies/:id/reviews (Auth) - Add a review for a movie.
+ GET api/movies?page=n&limit=m - Get m list of movies from TMDB's Discover endpoint, starting at page n and limit the list size to m.  
+ POST api/:userName/favourites (Auth) - add a movie to the named user's favourites list.
+ POST /api/users?action=action - Register or authenticate a user - set action to register or login. 
+ etc
+ etc

## Automated Testing.

[In this section, include a listing of the response from running your tests locally (npm run test). Simply copy the output from your terminal and paste it into a fenced block (the triple tilda markup, i.e. ~~~ ), as shown below - do not use a screenshot.]

e.g. 
~~~
  Users endpoint
    GET /api/users 
      ✓ should return all the users and a status 200 (183ms)
    POST /api/users 
      For the register action
        when the payload is correct
          ✓ should return a 201 status and the confirmation message (368ms)
      For the authenticate action
        when the payload is correct
          ✓ should return a 200 status and a generated token (340ms)

  Movies endpoint
    GET /api/movies 
      ✓ should return 20 movies and a status 200 (113ms)
    GET /api/movies/:id
      when the id is valid
        ✓ should return the matching movie (53ms)
      when the id is invalid
        ✓ should return the NOT found message (55ms)


  6 passing (6s)
~~~

[ Markdown Tip: By wrapping the test results in fences (~~~), GitHub will display it in a 'box' and preserve any formatting.]

NOTE: Your test code should only contain the test cases you implemented. Your assignment submission  must remove the test cases (it blocks) developed in the labs.

## Deployments.

Specify the URLs of your deployments, both staging and production, e.g.

https://movies-api-staging-doc-9200283e0b04.herokuapp.com/api/movies

[ I do NOT need the URL of the app on your Heroku dashboard as this is private, e.g.

https://dashboard.heroku.com/apps/movies-api-staging-doc ]

## Independent Learning (if relevant)

Sspecify the URL of the Coveralls webpage that contains your tests' code coverage metrics.

State any other independent learning you achieved while completing this assignment.
