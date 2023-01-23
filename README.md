# Python-to-HTML
Javascript parser that turns python text representation into HTML representation.
Works in real time. Color your code with color scheme of your choice.

## How to use
__Import__ js to your HTML
```
<head>
  <link rel="stylesheet" href="/static/editor.css" />
  <script src="/static/pythonParser.js"></script>
</head>
```

For __input__ I just read a textarea element.
```
let input = document.querySelector("div[id=codeinput] textarea").value
```

For __output__ I just write into an output element.
```
document.getElementById("codeoutput").innerHTML = pythonToHtml(input)
```

__Example__ file [here](https://github.com/EternalAzure/Python-to-HTML/blob/main/editorPage.html) with default python code, callback function.

## Limitations
This is not a python language server. This parser does not understand python. <br>
This is also not a syntaxt tree that understands rules of python. <br>
This is simple regex based light js script that colors simple and short python lines with color of your choice.
This does not handle multiline code.
This does not handle functions inside functions deeper than two.
This does not handle complex data structures.
