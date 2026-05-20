# Fruits and Squares

A collection of randomly generated fruit puzzle games, available at [fruitsandsquares.com](https://fruitsandsquares.com/). Users can sign in via LinkedIn to compare scores on the top games or play endless games without an account.

[Mango](https://fruitsandsquares.com/mango/new) is a 6x6 grid filled with bananas and mangoes, following a similar ruleset to LinkedIn's [Tango](https://www.linkedin.com/showcase/tango-game/), except there may be more than one valid solution.

[Beans](https://fruitsandsquares.com/beans/new) is a 10x10 grid, divided in 10 areas, following a similar ruleset to LinkedIn's [Queens](https://www.linkedin.com/showcase/queens-game/), except there may be more than one valid solution.

## How do the games generate?

The logic to generate the games was put together in a short timeframe and has much potential for improvement. It is, however, sufficient to generate and infinite number of games, each with instant generation.

### Mango generation logic

First we consider only the constraints on fruits positioning to generate a valid arrangement: only 3 of each fruit per row and per column and no more than 2 consecutive fruits in any row or column

To fill the board, we repeatedly select a random square and check if adding either fruit would result in a valid board state. If only one fruit is valid, that fruit is added. If both are valid, the fruit that is on the board the least is added.

This method can result in states where neither fruit is valid. In this case, we reset the board and try again (up to 1,000 times).

Once we have a valid arrangement of fruits, we add the + and = signs in random places, ensuring these signs correspond to the existing arrangement.

Then we select 12 random cells that are not next to a + or = and set them to fixed. A maximum of two fixed cells per row or column is allowed.

Finally, the fruits in any cells that aren't fixed are removed and the game board is complete.

### Beans generation logic

First we consider only the constraints on bean positioning to generate a valid arrangement:
only one bean per row and column and no beans within the eight squares surrounding any other beans.

To fill the board, we iterate through each row, and randomly select a column to place the bean. If this column is not valid, we retry up to 10 times. If no valid column can be found, we retry board generation up to 1,000 times.

Now we have a valid arrangement of beans. For each bean, we pick a random adjacent square and set that to the same colour as the bean, ensuring at least two of each colour.

After this, we iterate through the cells of the board multiple times. Any time we find a square with colour, we set a random one of its neighbours to the same colour. This is done until the board is full.

Finally, the marked crosses are removed and the game board is complete.

## Setup information

The project is built in Vite using React and TypeScript. To run locally, clone the repository, open it, and run:

```
npm install
```

then

```
npm run dev
```

The application will run without environment variables configured. However, you will not be able to sign in, access the database or save game scores.

If you wish to make your own full version of this you will need to create a new Firebase project.

## LinkedIn authentication for Firebase

Users can sign in to their LinkedIn using OpenID Connect. Documentation for how this works is available [here](https://learn.microsoft.com/en-us/linkedin/consumer/integrations/self-serve/sign-in-with-linkedin-v2).

Once authenticated via LinkedIn, an account is created from the user's details and a custom token is returned to the client. Documentation [here](https://firebase.google.com/docs/auth/admin/create-custom-tokens).

## Disclaimer

Fruits & Squares is an independent product and is not affiliated with, nor has it been authorized, sponsored, or otherwise approved by LinkedIn Corporation. 

Users are encouraged to play the games these puzzles are inspired by, namely [Tango](https://www.linkedin.com/showcase/tango-game/) and [Queens](https://www.linkedin.com/showcase/queens-game/).
