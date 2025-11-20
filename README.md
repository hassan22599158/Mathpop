# Arabic MathJax Test Page

This is a simple web page that demonstrates how to render mathematical equations in Arabic using [MathJax](https://www.mathjax.org/) and the [Arabic MathJax extension](https://github.com/Edraak/arabic-mathjax).

## How to use

1. Open `index.html` in your web browser.
2. You will see a list of example equations rendered in Arabic.
3. You can use the text area at the top to input your own LaTeX equations wrapped in `\alwaysar{...}` and click "عرض المعادلة" to see the result.

## Configuration

The page uses the following configuration for MathJax:

```javascript
MathJax.Ajax.config.path["arabic"] = "https://cdn.jsdelivr.net/gh/Edraak/arabic-mathjax@1.1/dist";
MathJax.Hub.Config({
    extensions: ["[arabic]/arabic.js"],
    tex2jax: {
        inlineMath: [["$", "$"], ["\\(", "\\)"]],
        displayMath: [["$$", "$$"], ["\\[", "\\]"]],
        processEscapes: true
    },
    "HTML-CSS": {
        undefinedFamily: "Amiri"
    }
});
```

And it loads the **Amiri** font for proper Arabic support.
