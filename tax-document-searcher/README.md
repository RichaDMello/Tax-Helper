# Local Tax Document Helper

This is a small local browser tool for checking a few files and walking through the on-screen prompts. It runs only on your computer through a local web page.

## Requirements

You only need one of these:

- Python 3, recommended
- Python 2, if Python 3 is not available
- Or any basic local web server

No package installation is needed.

## How to run

Open Terminal or Command Prompt in this folder, then run:

```bash
bash run.sh
```

If that works, you should see a message like:

```text
Starting local document helper at http://localhost:8000
```

Then open this link in your browser:

```text
http://localhost:8000
```

## If port 8000 is already being used

Run it with another port number:

```bash
bash run.sh 8080
```

Then open:

```text
http://localhost:8080
```

## How to stop it

Go back to the Terminal or Command Prompt window and press:

```text
Ctrl + C
```

## Troubleshooting

If `bash run.sh` does not work, try opening `index.html` directly in a browser.

If the page looks old or starts in the wrong place, clear the browser storage for the site or click **Start over** inside the page.
