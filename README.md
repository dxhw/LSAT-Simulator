# LSAT Simulator

An LSAT Simulator Webapp written in React + TypeScript.

Data is taken from https://github.com/zhongwanjun/AR-LSAT

The simulator supports both light and dark mode based on your device settings.

The simulator also scales based on your zoom level and screen size. I recommend zooming out to see all answer choices.

## Important Note on RC
For readability in RC, the readings have been split into paragraphs using https://huggingface.co/sentence-transformers/all-MiniLM-L6-v2 to determine sentence similarity, and an arbitrary decision to split readings into 3-6 paragraphs. Some of these paragraph splits are odd, but hopefully preferable to a wall of text. Code for my splitting can be found here: https://colab.research.google.com/drive/1aVpm_OioFG7VPMmch3p4G25p0fJqGtE7?usp=sharing 

Please note that the paragraph breaks DO NOT match the original tests, so they cannot be used for questions asking about specific line numbers.

## How to run
From inside the `client` folder:

* `npm install`
* `npm run`
* Go to http://localhost:8000/

(I will write a script to do this more easily for the less technically adept later.)
