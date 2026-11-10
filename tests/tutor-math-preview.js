document.getElementById('sample').innerHTML=tutorFormattedText(String.raw`積分（Integration）是微分（Differentiation）的逆運算。

1. **基本公式**：$\int x^n\,dx=\frac{x^{n+1}}{n+1}+C$（$n\neq-1$）。
2. **變數代換法（Substitution Rule）**：$\int f(g(x))g'(x)\,dx=\int f(u)\,du$。
3. **分部積分法（Integration by Parts）**：$\int u\,dv=uv-\int v\,du$。

**計算範例**：求 $\int_0^1 x^2\,dx$。
\[\int_0^1 x^2\,dx=\left[\frac{x^3}{3}\right]_0^1=\frac{1^3}{3}-\frac{0^3}{3}=\frac13\]`);
document.getElementById('matrix').innerHTML=tutorFormattedText(String.raw`**Jacobian**：$f(x,y)=[x+y,xy]$。
\[J(x,y)=\begin{bmatrix}1&1\\y&x\end{bmatrix}\]
**梯度下降（Gradient Descent）**：$L(w)=(w-3)^2$，$w_0=0$，$\eta=0.1$。
\[g=2(w_0-3)=2(0-3)=-6\]
\[w_1=w_0-\eta g=0-0.1\times(-6)=0.6\]`);
tutorFitFormulas(document.querySelector('main'));
