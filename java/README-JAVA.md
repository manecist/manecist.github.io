# Java mágico · Studios Conari

Dos pequeñas aplicaciones de escritorio hechas solo con Java estándar y Swing: una calculadora y una caja registradora rosa y blanca. Funcionan sin Internet y sin bibliotecas externas.

Este es un **nuevo recurso demostrativo** preparado para el portafolio de María Inés. No es una copia ni una reconstrucción del repositorio original M4. El código de ese proyecto debe consultarse por separado desde su enlace en el portafolio.

## Abrir

Necesitas un **JDK 11 o posterior** instalado, con `java` disponible en tu terminal.

- En Windows: abre `ejecutar-windows.bat`.
- En cualquier sistema: abre una terminal en esta carpeta y ejecuta `java ConariJava.java`.
- Si tu equipo usa otra codificación por defecto: `java -Dfile.encoding=UTF-8 ConariJava.java`.

La aplicación abre una ventana de escritorio. No se ejecuta dentro del navegador. El portafolio incluye una demostración web independiente y este código Java descargable.

## Calculadora

- Suma, resta, multiplicación, división, cambio de signo y logaritmos base 10 y natural.
- Operaciones encadenadas en el orden de entrada, como una calculadora básica (no aplica prioridad algebraica).
- El botón `%` convierte el número mostrado a su fracción: `25 % = 0,25`. Por ejemplo, para calcular el 20 % de 150, ingresa `150 × 20 % =`.
- Acepta punto o coma decimal. La pantalla utiliza coma.
- Valida la división por cero, el dominio de los logaritmos y resultados fuera de rango. Tras un error, ingresa un número nuevo o pulsa `C`.
- Teclado: números, `+`, `-`, `*`, `/`, `%`, `.` o `,`; `Enter` o `=` para calcular; `Esc` para limpiar; `Retroceso` para borrar un dígito. `F9` cambia el signo.
- Usa `Tab` para recorrer controles y espacio para activar el control seleccionado. Los controles tienen nombres accesibles.

## Caja de pequeñas maravillas

Catálogo ilustrativo en pesos chilenos (CLP), selección de producto y cantidad, carrito, eliminación de una línea, descuento de 0 a 100 %, total y recibo que puedes copiar. Las cantidades por producto se limitan a 99 unidades. El descuento se redondea al peso más cercano.

Los nombres y precios son ejemplos. **El recibo es una simulación sin validez tributaria. No procesa pagos, no registra ventas reales y no guarda información.** Vaciar el carrito también borra el recibo anterior y restablece el descuento. Cerrar la aplicación descarta todos los datos.

## Comprobar la lógica

Ejecuta `java ConariJava.java --test`. Las comprobaciones no abren ventanas y cubren las operaciones, los errores de entrada, el carrito, los límites, el descuento y el recibo.

Para compilar manualmente, si lo deseas:

```text
javac -encoding UTF-8 ConariJava.java
java ConariJava
```

No se incluye un archivo `.jar`: el entorno de preparación no tenía un JDK disponible. La fuente está diseñada para Java 11 o posterior; la ejecución y la apariencia de Swing deben comprobarse en un equipo con JDK antes de distribuir un binario.

## Archivos

- `ConariJava.java`: interfaz y lógica en un único archivo, con comprobaciones integradas.
- `ejecutar-windows.bat`: acceso de inicio para Windows; no instala nada.
- `README-JAVA.md`: instrucciones y alcance de la demostración.

Identidad visual: Studios Conari · «Donde nacen mundos y leyendas eternas».
