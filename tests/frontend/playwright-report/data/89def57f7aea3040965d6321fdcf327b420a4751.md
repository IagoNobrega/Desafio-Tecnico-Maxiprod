# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: app.spec.ts >> Fluxo de Pessoas >> deve navegar para página de pessoas
- Location: src\tests\e2e\app.spec.ts:14:3

# Error details

```
Error: browserType.launch: Target page, context or browser has been closed
Browser logs:

<launching> C:\Users\iagon\AppData\Local\ms-playwright\webkit-2272\Playwright.exe --inspector-pipe --disable-accelerated-compositing --headless --no-startup-window
<launched> pid=17176
Call log:
  - <launching> C:\Users\iagon\AppData\Local\ms-playwright\webkit-2272\Playwright.exe --inspector-pipe --disable-accelerated-compositing --headless --no-startup-window
  - <launched> pid=17176
  - [pid=17176] <gracefully close start>
  - [pid=17176] <kill>
  - [pid=17176] <will force kill>
  - [pid=17176] taskkill stderr: ERRO: o processo "17176" n�o foi encontrado.
  - [pid=17176] <process did exit: exitCode=3236495362, signal=null>
  - [pid=17176] starting temporary directories cleanup
  - [pid=17176] finished temporary directories cleanup
  - [pid=17176] <gracefully close end>

```