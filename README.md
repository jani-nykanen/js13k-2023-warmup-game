## A Totally Awesome js13k 2023 WarmUp game

[Click here to play!](https://jani-nykanen.github.io/js13k-2023-warmup-game/play)

-----------

### 1. Description

This project was created to prepare for this year's js13k, which starts in August 13th (or might be already over, depending on when you read this). The goal of this project was to see what parts of my old "engine" can be used, and which parts need some minor refactoring, and which parts require a complete rework. Note that this is **not** a template for my js13k game, just a starting point for the template, which I hopefully have time to write before the competition starts.

----------

### 2. Building

1. Install TypeScript
2. Download Closure compiler
3. Supposing that Closure is installed to `path-to-closure.jar`, type `CLOSURE_PATH=path-to-closure.jar make dist` to create a zip file called `dist.zip`, which contains the optimized code and all the required assets. At least on my computer the result is around 11.4kB.

If you just want to make edits and see what happens, run `tsc` or `tsc -w` to just compile the code. You can start a server by running `make server`, so you can go to `localhost:8000` to see the result.

----------

### 3. License

Do whatever you want. The code is horrible, so I don't recommend using it anywhere, but taking inspiration should not hurt too much...

-----------

(c) 2023 Jani Nykänen

