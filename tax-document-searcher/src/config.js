/*
  Edit this file to personalize the program.
  - Replace the photo paths with your real photo filenames.
  - Put your photos inside assets/photos/.
  - Keep paths relative to index.html, like "assets/photos/mom_young.jpg".
*/

window.MOTHERS_DAY_CONFIG = {
  title: "Happy Mother's Day",
  wordleAnswer: "HAPPY",

  photos: {
    intro: [
      { src: "assets/photos/intro_1.png", caption: "A few of our favorite memories" },
      { src: "assets/photos/intro_2.png", caption: "Happy Mother's Day" }
    ],
    sudoku: [
      { src: "assets/photos/mom_young.png", caption: "This must've been about 21 years ago..." }
    ],
    crossword: [],
    finale: [
      { src: "assets/photos/finale.png", caption: "I hope you like this little game I made especially for you." }
    ]
  },

  letters: {
    intro: {
      title: "Letter 1",
      body: [
        "Dear Mom,",
        "Happy Mother's Day! I can't even imagine having a better mom in my life. Thank you for making me who I am today. I owe everything to you (and dad and Rhea hehe).",
        ""
      ]
    },
    sudoku: {
      title: "Letter 2",
      body: [
        "Dear mom, thanks for giving me my love for games, all things fun and creative. You're the reason I can think outside the box and always look at the bright side.",
        "This is the year you became a mom!!!",
        ""
      ]
    },
    crossword: {
      title: "Letter 3",
      body: [
        "Dear mom, there are no words for me to say how grateful I am for you. I love you to the moon and back.",
        ""
      ]
    }
  },

  sudoku: {
    // 0 means empty cell.
    puzzle: [
      [5,3,0,0,7,0,0,0,0],
      [6,0,0,1,9,5,0,0,0],
      [0,9,8,0,0,0,0,6,0],
      [8,0,0,0,6,0,0,0,3],
      [4,0,0,8,0,3,0,0,1],
      [7,0,0,0,2,0,0,0,6],
      [0,6,0,0,0,0,2,8,0],
      [0,0,0,4,1,9,0,0,5],
      [0,0,0,0,8,0,0,7,9]
    ],
    solution: [
      [5,3,4,6,7,8,9,1,2],
      [6,7,2,1,9,5,3,4,8],
      [1,9,8,3,4,2,5,6,7],
      [8,5,9,7,6,1,4,2,3],
      [4,2,6,8,5,3,7,9,1],
      [7,1,3,9,2,4,8,5,6],
      [9,6,1,5,3,7,2,8,4],
      [2,8,7,4,1,9,6,3,5],
      [3,4,5,2,8,6,1,7,9]
    ],
    highlightRowAfterSolve: 0
  },

  crossword: {
    size: 8,
    words: [
      {
        number: 1,
        answer: "GREEN",
        row: 0,
        col: 2,
        direction: "down",
        clue: "Your favorite color."
      },
      {
        number: 2,
        answer: "MONICA",
        row: 0,
        col: 4,
        direction: "down",
        clue: "What character of friends everyone thinks you look like."
      },
      {
        number: 3,
        answer: "SUMMER",
        row: 1,
        col: 6,
        direction: "down",
        clue: "Your favorite season."
      },
      {
        number: 5,
        answer: "CLEAN",
        row: 2,
        col: 0,
        direction: "across",
        clue: "If you had to pick only one household chore which one would it be."
      },
      {
        number: 5,
        answer: "COOK",
        row: 2,
        col: 0,
        direction: "down",
        clue: "If you could have dad take over one household chore which one would it be."
      },
      {
        number: 6,
        answer: "PAPER",
        row: 5,
        col: 3,
        direction: "across",
        clue: "Your go-to karaoke song: _____ roses :)"
      }
    ]
  },

  finaleMessage: [
    "Since you did so well on all the puzzles, you earned your present that you already received!",
    "Happy Mother's Day, mom. I love you so much."
  ]
};
