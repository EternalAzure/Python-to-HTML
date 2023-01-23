# Python-to-HTML
Javascript parser that turns python text representation into HTML representation.

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
