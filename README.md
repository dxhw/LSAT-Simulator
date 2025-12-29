# LSAT Simulator

An LSAT Simulator Webapp written in React + TypeScript.

Data is taken from https://github.com/zhongwanjun/AR-LSAT

The simulator supports both light and dark mode based on your device settings.

The simulator also scales based on your zoom level and screen size. I recommend zooming out to see all answer choices.

## Important Note on RC
For readability in RC, the readings have been split into paragraphs using https://huggingface.co/sentence-transformers/all-MiniLM-L6-v2 to determine sentence similarity, and an arbitrary decision to split readings into 3-6 paragraphs. Some of these paragraph splits are odd, but hopefully preferable to a wall of text. Code for my splitting can be found here: https://colab.research.google.com/drive/1aVpm_OioFG7VPMmch3p4G25p0fJqGtE7?usp=sharing 

Please note that the paragraph breaks DO NOT match the original tests, so they cannot be used for questions asking about specific line numbers.

## How to install - Quick Instructions (Mac/Linux)
1. Open your Terminal application
2. Install npm (Node Package Manager) - If you already have npm, skip this step
    * Copy `curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh | bash` into your terminal and press enter
        * This installs nvm (Node Version Manager), which we will use to install npm. See https://docs.npmjs.com/downloading-and-installing-node-js-and-npm for other options.
    * Copy `source ~/.zshrc` into your terminal and press enter
        * This ensures that `nvm` will be a recognized command in your terminal
    * Copy `nvm install --lts` into your terminal and press enter
        * This installs npm
3. Download the simulator
    * Copy `git clone https://github.com/dxhw/LSAT-Simulator.git` into your terminal and press enter
        * This downloads the files from this repository into a folder called `LSAT-Simulator` on your computer
4. Download necessary packages (external software that the game depends on)
    * Copy `cd LSAT-Simulator/client` into your terminal and press enter
        * This moves you into the correct folder on your computer
    * Copy `npm install` into your terminal and press enter
        * This installs the dependencies
5. Make an alias to run the application (this step is not necessary but will make your life easier in the future to start up the game)
    * Copy `echo 'alias lsat-simulator="cd ~/LSAT-Simulator/client && npm start"' >> ~/.zshrc` into your terminal and press enter
        * This makes the alias
    * Copy `source ~/.zshrc`
        * This makes the alias accessible to your terminal
6. Run the application
    * Copy `lsat-simulator` into your terminal and press enter
7. Open the application on your web browser
    * In a web browser, go to http://localhost:8000/
        * You've navigated to the game now!

## How to run
From inside the `client` folder:

* `npm install`
* `npm run`
* Go to http://localhost:8000/

(I will write a script to do this more easily for the less technically adept later.)
