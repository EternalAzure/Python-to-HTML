/**
 * Returns python code presented as html with css classes for syntax highlight.
 * CSS classes: default, primitive, number, keyword, operator, function and string.
 * @param {str} text 
 * @returns {str}
 */
function pythonToHtml(text) {
    let pythonLines = textToLines(text) //List[str]
    let htmlLines = [] //List[str]
    pythonLines.forEach(line => {
        htmlLines.push(indent(line))
        let pythonParts = linesToParts(line) //List[str]
        pythonParts.forEach(part => {
            htmlLines.push(partsToTags(part))
        })
        htmlLines.push("<br>")
    });
    let htmlString = htmlLines.join("")
    return htmlString // str
}

/**
 * Returns a html span tag with whitespace characters 
 * equal to indentation of input string.
 * @param {str} text 
 * @returns {str} \<span class='python'> \</span>
 */
function indent(text) {
    let indent = ""
    text.split("").every(char => {
        if (char == " ") {
            indent += "&emsp;"
            return true
        }
        return false
    })
    return `<span class='python'>${indent}</span>`
}

/**
 * Returns list of textlines.
 * @param {str} text 
 * @returns {list}
 */
function textToLines(text) {
    // wrapped into function for clearer semantics.
    return text.split("\n")
}

/**
 * Returns input broken into parts.
 * @param {str} linetext 
 * @returns {list} eg. ['def', 'foo(self, text)', ':']
 */
function linesToParts(linetext) {
    // Recognize line type
    // NOTE to simplify regex
    linetext = linetext.trim()

    // Import line
    let importReg = /(import|from)/
    let regx = /(^import)(\s)(\w+)(\.)?(\w*)?|(from)(\s)(\w+)(\.\w+)?(\s)(import)(\s)(\w+)/g
    if (linetext.match(importReg)) {
        return toParts(linetext, regx)
    }

    // Defition line
    let defitionReg = /(def|class)/
    regx = /(def|class)(\s)(.*\(.*\))(\:)|(def|class)(\s)(.*\(.*\))(\s)(\-\>)(\s)(\w*)(\:)/g
    if (linetext.match(defitionReg)) {
        return toParts(linetext, regx)
    }

    // Assignment line
    let assignreg = /\w+\s=\s/
    regx = /^(\w+)(\.\w+)?(\s)(=)(\s)(.*$)/g
    if (linetext.match(assignreg)) {
        return toParts(linetext, regx)
    }

    // If-statement line
    let ifStatementReg = /if/
    regx = /(if)(\s)(.*)(\:$)/g
    if (linetext.match(ifStatementReg)) {
        return toParts(linetext, regx)
    }

    // Invoke line
    let invokeReg = /^\w+(\.\w+)*\(.*\)/
    regx = /^(\w+\(.*\))|^(\w+)(\.)((\w+)(\.))*?(\w+\(.*\))$/g
    if (linetext.match(invokeReg)) {
        return toParts(linetext, regx)
    }

    // Simple evaluation line
    let evalReg = /==/
    regx = /^(\!|\w+\(.*?\)|\w+|\".*?\")(\s|\w+)($|\=\=)(\s)?([^\s\:]*)?(\:$)?/g
    if (linetext.match(evalReg)) {
        return toParts(linetext, regx)
    }

    // List line
    let listReg = /[^\,]+,/
    regx = /(^\{|\[|\()(.*?)(\)|\]|\}$)|([^\,]*)(\,)?(\s)?/g
    if (linetext.match(listReg)) {
        return toParts(linetext, regx)
    }
    
    // Rest
    regx = /([^\s\:]+)(\s)?(\:)?|(:)/g
    return toParts(linetext, regx)
}

/**
 * Returns input broken into parts according to given regex.
 * @param {str} text 
 * @param {*} regx 
 * @returns {list}
 */
function toParts(text, regx) {
    let matches = text.matchAll(regx)
    let m = []
    for (const match of matches) {
        for (let i = 1; i < match.length; i++) {
            if (match[i]) {
                m.push(match[i])
            }
        }
    }
    return m
}

/**
 * Returns html tags. Handles lists inside list and 
 * functions in functions with calls to 
 * toParts(), linesToParts() and recursive calls.
 * @param {str} text 
 * @returns {str}
 */
function partsToTags(text) {
    if (!text) {
        return ""
    }

    if (text == " ") {
        return " "
    }

    let keywords = [
        "and", "or", "not", "is", "as", "assert", "break", "class",
        "continue", "def", "del", "elif", "else", "except", "finally",
        "for", "from", "global", "if", "import", "lambda", "pass",
        "raise", "return", "try", "while", "with", "yield", "in"
    ]
    if (keywords.includes(text)) {
        return `<span class='python keyword'>${text}</span>`
    }

    let operators = ["=", "==", "!=", "+", "-", "/", ",", ".", "[", "]", "{", "}", "(", ")", "!", ":", "->"]
    if (operators.includes(text)) {
        return `<span class='python operator'>${text}</span>`
    }

    let primitiveArgs = /^(str|int|float|bool)\((.*)\)/
    let matches = text.match(primitiveArgs)
    if (matches) {
        let parts = toParts(text, /\w+\((.*)\)/g)
        parts.forEach(part => {
            let span = partsToTags(part)
            text = text.replace(part, span)
        })
        return `<span class='python primitive'>${text}</span>`
    }

    let singleFuncWithArgs = /[a-z]*\((.*)\)/i
    matches = text.match(singleFuncWithArgs)
    if (matches) {
        let parts = toParts(
            matches[1],
            /(\".*\"|\w+\(.*?\)|[\[\(\{].*?[\}\)\]]|\w+|\d|\:|\+|\-|\/|\\|\=|\<|\>|\!)(\,)?(\s)?/g
        )
        parts.forEach(part => {
            let smallerParts = linesToParts(part)
            smallerParts.forEach(p => {
                let span = partsToTags(p)
                text = text.replace(p, span)
            })
        })
        return `<span class='python function'>${text}</span>`
    }

    let singleStringsReg = /^"(.*)"$/
    matches = text.match(singleStringsReg) // anything that starts and end with "
    if (matches) {
        return `<span class='python string'>${text}</span>`
    }

    let singleNumberReg = /^(\d+|\d+\.\d+|\-\d+|\-\d+\.\d+)$/ // '9' or '-10' or '-2.05' 
    matches = text.match(singleNumberReg)
    if (matches) {
        return `<span class='python number'>${text}</span>`
    }

    let singleSetReg = /[\[\(\{](:?.*)[\)\]\}]/ // '(1,2)' or '[]' or '{"miip"}'
    matches = text.match(singleSetReg)
    if (matches) {
        return `<span class='python default'>${text}</span>`
    }

    let variableReg = /^\w*\.?\w+$/ // 'foo' or 'self.foo'
    matches = text.match(variableReg)
    if (matches) {
        return `<span class='python default'>${text}</span>`
    }

    let separateListReg = /([^\s\:\,]+)(\,)?(\s)?(\:)?/g // 'self, text' or [1,2,3]
    matches = text.matchAll(separateListReg)
    if (matches) {
        for (const match of matches) {
            let word = match[1]
            let span = partsToTags(word)
            text = text.replace(word, span)
        }
        return `<span class='python default'>${text}</span>`
    }
    
    return `<span class='python default'>${text}</span>`
}


