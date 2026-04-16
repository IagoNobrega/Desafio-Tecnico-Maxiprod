# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: app.spec.ts >> Fluxo de Pessoas >> deve excluir uma pessoa
- Location: src\tests\e2e\app.spec.ts:68:3

# Error details

```
Error: browserType.launch: Target page, context or browser has been closed
Browser logs:

<launching> C:\Users\iagon\AppData\Local\ms-playwright\webkit-2272\Playwright.exe --inspector-pipe --disable-accelerated-compositing --headless --no-startup-window
<launched> pid=23868
Call log:
  - <launching> C:\Users\iagon\AppData\Local\ms-playwright\webkit-2272\Playwright.exe --inspector-pipe --disable-accelerated-compositing --headless --no-startup-window
  - <launched> pid=23868
  - [pid=23868] <gracefully close start>
  - [pid=23868] <kill>
  - [pid=23868] <will force kill>
  - [pid=23868] taskkill stderr: ERRO: o processo "23868" n�o foi encontrado.
  - [pid=23868] <process did exit: exitCode=3236495362, signal=null>
  - [pid=23868] starting temporary directories cleanup
  - [pid=23868] finished temporary directories cleanup
  - [pid=23868] <gracefully close end>

```