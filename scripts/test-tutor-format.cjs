const assert=require('node:assert/strict'),fs=require('node:fs');global.katex=require('../vendor/katex-0.16.25.min.js');const {tutorFormattedText:render}=require('../tutor-format.js');
const cases=[
 [String.raw`$\frac{TP+TN}{TP+TN+FP+FN}$`,'mfrac'],
 [String.raw`\(z=wx+b\)`,'<math'],
 [String.raw`\[\sigma(z)=\frac{1}{1+e^{-z}}\]`,'mfrac'],
 [String.raw`$$\int_0^1 x^2\,dx=\left[\frac{x^3}{3}\right]_0^1=\frac13$$`,'msubsup'],
 [String.raw`$\frac{\partial L}{\partial w}=2(w-3)$`,'mfrac'],
 [String.raw`$$\sum_{i=1}^{n}x_i^2$$`,'munderover'],
 [String.raw`\[J=\begin{bmatrix}1&1\\y&x\end{bmatrix}\]`,'mtable'],
 [String.raw`$$\begin{aligned}w_1&=w_0-\eta g\\&=0-0.1(-6)=0.6\end{aligned}$$`,'mtable'],
 [String.raw`$\sqrt{x^2+y^2}$`,'msqrt'],
 [String.raw`$\operatorname{ReLU}(z)=\max(0,z)$`,'<math']
];for(const [text,tag]of cases){const html=render(text);assert(html.includes(tag),text);assert(!html.includes('tutor-formula-fallback'),text)}
const screenshotCase=String.raw`1. **基本公式**：$\int x^n dx=\frac{x^{n+1}}{n+1}+C$（$n\neq-1$）。
2. **變數代換法**：$\int f(g(x))g'(x)dx=\int f(u)du$。
3. **分部積分法**：$\int u\,dv=uv-\int v\,du$。`;
assert.equal((render(screenshotCase).match(/<math /g)||[]).length,4);assert(render(screenshotCase).includes('<strong>基本公式</strong>'));assert(render(screenshotCase).includes('<ol'));
const xss=render(String.raw`<img src=x onerror=alert(1)> $\text{<script>alert(1)</script>}$`);assert(!/<img|<script/.test(xss));assert(xss.includes('&lt;img'));
const untrusted=render(String.raw`$\href{javascript:alert(1)}{click}$`);assert(!/href=|javascript:/.test(untrusted.replace(/<annotation[\s\S]*?<\/annotation>/g,'')));
assert(!render('`$x^2$`').includes('<math'));assert(!render('```latex\n$\\frac12$\n```').includes('<math'));assert(render('Price $5 and $10.').includes('Price $5 and $10.'));
assert(render(String.raw`$\frac{a}{$`).includes('tutor-formula-fallback'));assert(!render(String.raw`$\frac{a}{$`).includes('katex-error'));
const html=fs.readFileSync('index.html','utf8');assert(html.indexOf('vendor/katex-0.16.25.min.js')<html.indexOf('tutor-format.js'));assert(html.indexOf('tutor-format.js')<html.indexOf('src="tutor.js'));assert(fs.readFileSync('tutor.js','utf8').includes('tutorFormattedText(m.text)'));
console.log('PASS: integral screenshot, fractions, derivatives, exponents, matrices, aligned steps, 4 delimiters, Markdown, code/currency isolation, invalid-formula fallback and untrusted HTML/URL protection');
